<?php

namespace Myrotvorets\WordPress\Identigraf;

use Exception;
use Firebase\JWT\JWT;
use ZipArchive;

abstract class Utils {
	public static function generate_token_for_user( int $user_id ): string {
		$secret  = Settings::instance()->get_secret();
		$payload = [
			'sub' => $user_id,
			'aud' => 'psbapi-identigraf',
			'iss' => 'https://jwt.myrotvorets.center/identigraf',
			'exp' => time() + 300,
		];

		return JWT::encode( $payload, $secret, 'HS512' );
	}

	public static function extract_file( ZipArchive $zip, string $filename, string $target ): void {
		$stream = false;
		$f      = false;

		try {
			$stream = $zip->getStream( $filename );
			if ( false === $stream ) {
				// translators: 1 - file name
				throw new Exception( sprintf( __( 'Unable to extract file "%1$s".', 'i8f' ), $filename ) );
			}

			// phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_fopen
			$f = fopen( $target, 'wb' );
			if ( false === $f ) {
				throw new Exception( __( 'Unable to create temporary file.', 'i8f' ) );
			}

			$res = stream_copy_to_stream( $stream, $f );
			if ( false === $res ) {
				// translators: 1 - file name
				throw new Exception( sprintf( __( 'Unable to extract file "%1$s".', 'i8f' ), $filename ) );
			}
		} finally {
			if ( false !== $stream ) {
				fclose( $stream );
			}

			if ( false !== $f ) {
				fclose( $f );
			}
		}
	}

	public static function temp_dir(): string {
		do {
			// phpcs:ignore WordPressVIPMinimum.Functions.RestrictedFunctions.file_ops_tempnam
			$tmp = tempnam( get_temp_dir(), '' );
			if ( false === $tmp ) {
				// phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
				throw new Exception( __( 'Failed to create temporary directory.', 'i8f' ) );
			}
			// phpcs:ignore WordPressVIPMinimum.Functions.RestrictedFunctions.file_ops_unlink
			unlink( $tmp );
		} while ( ! @mkdir( $tmp, 0700 ) ); // phpcs:ignore WordPressVIPMinimum.Functions.RestrictedFunctions.directory_mkdir, WordPress.PHP.NoSilencedErrors.Discouraged

		register_shutdown_function( fn() => static::destroy_dir( $tmp ) );
		return $tmp;
	}

	public static function destroy_dir( string $dir ): void {
		if ( ! is_dir( $dir ) ) {
			return;
		}

		/** @var string[] $files */
		$files = array_diff( (array) scandir( $dir ), [ '.', '..' ] );
		foreach ( $files as $file ) {
			$path = $dir . DIRECTORY_SEPARATOR . $file;
			if ( is_dir( $path ) ) {
				static::destroy_dir( $path );
			} else {
				// phpcs:ignore WordPressVIPMinimum.Functions.RestrictedFunctions.file_ops_unlink -- this happens in a temporary directory
				unlink( $path );
			}
		}

		// phpcs:ignore WordPressVIPMinimum.Functions.RestrictedFunctions.directory_rmdir -- this happens in a temporary directory
		rmdir( $dir );
	}
}
