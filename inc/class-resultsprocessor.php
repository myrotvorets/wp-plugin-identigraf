<?php

// phpcs:disable WordPressVIPMinimum.Functions.RestrictedFunctions.file_ops_unlink
// phpcs:disable WordPressVIPMinimum.Functions.RestrictedFunctions.directory_mkdir
// phpcs:disable WordPressVIPMinimum.Functions.RestrictedFunctions.file_ops_file_put_contents

namespace Myrotvorets\WordPress\Identigraf;

use Exception;
use RecursiveDirectoryIterator;
use RecursiveIteratorIterator;
use Throwable;
use WP_Error;
use ZipArchive;

/**
 * @psalm-type Match = array{ link: string, name: string, similarity: int, m_photo: string, f_photo: string, oid: string }
 * @psalm-type Result = array<int, array<int, Match>>
 * @psalm-import-type DecodeResponseEntry from OIDDEcoder
 */
final class ResultsProcessor {
	private OIDDecoder $decoder;

	public function __construct( OIDDecoder $decoder ) {
		$this->decoder = $decoder;
	}

	/**
	 * @return WP_Error|true
	 */
	public function process( string $guid, string $detections, string $matches, string $dest, string $tmp_dir, int $threshold ) {
		try {
			$dir = "{$tmp_dir}/{$guid}/d";
			mkdir( $dir, 0755, true );
			/** @psalm-var Result */
			$result = $this->process_detections( $detections, $dir );
			unlink( $detections );

			$dir = "{$tmp_dir}/{$guid}/m";
			mkdir( $dir, 0755, true );
			$result = $this->process_matches( $result, $matches, $dir, $threshold );
			unlink( $matches );

			$result = $this->decode_oids( $result );

			uasort( $result, fn ( array $lhs, array $rhs ) => count( $lhs ) <=> count( $rhs ) );
			foreach ( $result as &$data ) {
				uasort(
					$data,
					/**
					 * @psalm-param Match $a
					 * @psalm-param Match $b
					 */
					fn ( array $a, array $b ) => $b['similarity'] <=> $a['similarity']
				);
			}

			unset( $data );

			$html = self::render_view( 'result', [ 'result' => $result ] );
			file_put_contents( "{$tmp_dir}/{$guid}/index.html", $html );

			$this->archive_results( "{$tmp_dir}/{$guid}", $dest );
		} catch ( \Throwable $e ) {
			return new WP_Error( 'processing_failed', $e->getMessage() );
		} finally {
			if ( file_exists( $detections ) ) {
				unlink( $detections );
			}

			if ( file_exists( $matches ) ) {
				unlink( $matches );
			}
		}

		return true;
	}

	/**
	 * @psalm-return array<int, array<never, never>>
	 */
	private function process_detections( string $detections, string $tmp_dir ): array {
		/** @psalm-var array<int, array<never, never>> */
		$result = [];

		$zip_d = new ZipArchive();
		$zip_d->open( $detections, ZipArchive::RDONLY );

		$m = [];
		// phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase
		for ( $i = 0; $i < $zip_d->numFiles; ++$i ) {
			$filename = $zip_d->getNameIndex( $i );
			// File name format:
			// <time>-<detection_id>--<face_width>.jpg
			// * <time>: number of seconds from the beginning of the stream
			// * <detection_id>: unique number of the captured face
			// * <face_width>: width of the captured face in pixels
			if ( basename( $filename ) === $filename && preg_match( '/^\\d+-(\\d++)/', $filename, $m ) ) {
				$fname  = "{$m[1]}.jpg";
				$target = "{$tmp_dir}/{$fname}";

				Utils::extract_file( $zip_d, $filename, $target );

				$result[ (int) $m[1] ] = [];
			}
		}

		$zip_d->close();
		return $result;
	}

	/**
	 * @psalm-param Result $result
	 * @psalm-return Result
	 */
	private function process_matches( array $result, string $matches, string $tmp_dir, int $threshold ): array {
		$zip_m = new ZipArchive();
		$zip_m->open( $matches, ZipArchive::RDONLY );

		$m = [];
		// phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase
		for ( $i = 0; $i < $zip_m->numFiles; ++$i ) {
			// <detection-id>-<match-id>-<similarity_pct>_<firstname>_<sector>_<lastname>.jpg
			// <sector> := xx^yy^zz
			// <lastname> := !1-0-<criminal_id>-<attachment_id>
			$filename = $zip_m->getNameIndex( $i );
			if ( basename( $filename ) === $filename && preg_match( '/^(\\d++)-(\\d++)-(\\d++)_[^_]++_[^_]++_(!1-0-\\d+-\\d+)\./', $filename, $m ) && isset( $result[ (int) $m[1] ] ) ) {
				$similarity = (int) $m[3];
				if ( $similarity >= $threshold ) {
					$result[ (int) $m[1] ][ (int) $m[2] ] = [
						'similarity' => $similarity,
						'name'       => '',
						'link'       => '',
						'm_photo'    => '',
						'f_photo'    => '',
						'oid'        => $m[4],
					];

					$fname  = "{$m[2]}.jpg";
					$target = "{$tmp_dir}/{$fname}";

					Utils::extract_file( $zip_m, $filename, $target );
				}
			}
		}

		$zip_m->close();
		return $result;
	}

	/**
	 * @psalm-param Result $result
	 * @psalm-return Result
	 */
	private function decode_oids( array $result ): array {
		/** @psalm-var list<string> */
		$oids = [];
		/** @psalm-var array<string, DecodeResponseEntry> */
		$map = [];
		foreach ( $result as $data ) {
			foreach ( $data as $match ) {
				$oids[] = $match['oid'];
			}
		}

		$oids   = array_unique( $oids );
		$chunks = array_chunk( $oids, 100 );
		foreach ( $chunks as $chunk ) {
			$response = $this->decoder->decode( $chunk );
			if ( ! is_wp_error( $response ) ) {
				foreach ( $response as $oid => $data ) {
					$map[ $oid ] = $data;
				}
			}
		}

		foreach ( $result as &$data ) {
			foreach ( $data as &$match ) {
				if ( isset( $map[ $match['oid'] ] ) ) {
					$match['name']    = $map[ $match['oid'] ]['name'] ?? '???';
					$match['link']    = $map[ $match['oid'] ]['link'] ?? '#';
					$match['m_photo'] = $map[ $match['oid'] ]['matchedPhoto'] ?? '#';
					$match['f_photo'] = $map[ $match['oid'] ]['primaryPhoto'] ?? '#';
				} else {
					$m = [];
					if ( preg_match( '/^!1-0-(\\d+)-(\\d+)$/', $match['oid'], $m ) ) {
						$match['name']    = "#{$m[1]}";
						$match['link']    = "https://myrotvorets.center/?post_type=criminal&p={$m[1]}";
						$match['m_photo'] = "https://myrotvorets.center/?aid={$m[2]}";
						$match['f_photo'] = '#';
					} else {
						$match['name']    = '???';
						$match['link']    = '#';
						$match['m_photo'] = '#';
						$match['f_photo'] = '#';
					}
				}
			}

			unset( $match );
		}

		unset( $data );
		return $result;
	}

	/**
	 * @psalm-suppress UnresolvableInclude
	 */
	private static function render_view( string $view, array $params ): string {
		ob_start();
		extract( $params, EXTR_SKIP );
		require __DIR__ . "/../views/{$view}.php"; // NOSONAR
		return ob_get_clean();
	}

	private function archive_results( string $path, string $archive ): void {
		$zip = new ZipArchive();
		$res = $zip->open( $archive, ZipArchive::CREATE );
		if ( true !== $res ) {
			// translators: %s = file name
			throw new Exception( sprintf( __( 'Failed to create file "%s"', 'i8f' ), $archive ) );  // phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
		}

		try {
			$files = new RecursiveIteratorIterator(
				new RecursiveDirectoryIterator( $path ),
				RecursiveIteratorIterator::LEAVES_ONLY
			);

			$prefix = dirname( $path );

			/** @var RecursiveDirectoryIterator */
			foreach ( $files as $file ) {
				if ( ! $file->isDir() ) {
					$file_path     = $file->getRealPath();
					$relative_path = substr( $file_path, strlen( $prefix ) + 1 );
					if ( false === $zip->addFile( $file_path, $relative_path ) ) {
						throw new Exception( __( 'Failed to add a file to the archive.', 'i8f' ) );
					}
				}
			}

			if ( false === $zip->close() ) {
				throw new Exception( __( 'Failed to archive results.', 'i8f' ) );
			}
		} catch ( Throwable $e ) {
			unset( $zip );
			if ( file_exists( $archive ) ) {
				unlink( $archive );
			}

			throw $e;
		}
	}
}
