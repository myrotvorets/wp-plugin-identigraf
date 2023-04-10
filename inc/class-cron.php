<?php

// phpcs:disable WordPressVIPMinimum.Functions.RestrictedFunctions.wp_remote_get_wp_remote_get

namespace Myrotvorets\WordPress\Identigraf;

use WildWolf\Utils\Singleton;
use WP_Error;
use WP_User;

final class Cron {
	use Singleton;

	private function __construct() {
		$this->init();
	}

	private function init(): void {
		add_action( 'identigraf_video_check', [ $this, 'identigraf_video_check' ], 10, 4 );
	}

	public function identigraf_video_check( string $guid, int $user_id, int $start_time, int $threshold ): void {
		$now = time();
		if ( $now - $start_time > DAY_IN_SECONDS ) {
			$this->send_email(
				$user_id,
				$guid,
				new WP_Error(
					'processing_failed',
					__( 'Unable to process the video. Unknown error.', 'i8f' ),
				)
			);
			return;
		}

		$videntigraf = new VIDentigraF( rtrim( Settings::instance()->get_ss_api_server(), '/' ), $user_id );
		$result      = $videntigraf->check_status( $guid );
		if ( false === $result || is_wp_error( $result ) ) {
			self::reschedule_video_check( $guid, $user_id, $start_time, $threshold );
			return;
		}

		$this->process_video_results( $guid, $user_id, $start_time, $result, $threshold );
	}

	private static function reschedule_video_check( string $guid, int $user_id, int $start_time, int $threshold ): void {
		wp_schedule_single_event( time() + 300, 'identigraf_video_check', [ $guid, $user_id, $start_time, $threshold ] );
	}

	private function process_video_results( string $guid, int $user_id, int $start_time, VideoProcessingStats $stats, int $threshold ): void {
		$dir    = Utils::temp_dir();
		$server = rtrim( Settings::instance()->get_ss_api_server(), '/' );

		$videntigraf = new VIDentigraF( $server, $user_id );

		for ( $i = 1; $i <= $stats->d_archives; ++$i ) {
			$body = $videntigraf->get_detections( $guid, $i );
			if ( is_wp_error( $body ) ) {
				self::reschedule_video_check( $guid, $user_id, $start_time, $threshold );
				return;
			}

			file_put_contents( "{$dir}/detections.zip", $body, FILE_APPEND ); // phpcs:ignore WordPressVIPMinimum.Functions.RestrictedFunctions.file_ops_file_put_contents
		}

		for ( $i = 1; $i <= $stats->m_archives; ++$i ) {
			$body = $videntigraf->get_matches( $guid, $i );
			if ( is_wp_error( $body ) ) {
				self::reschedule_video_check( $guid, $user_id, $start_time, $threshold );
				return;
			}

			file_put_contents( "{$dir}/matches.zip", $body, FILE_APPEND ); // phpcs:ignore WordPressVIPMinimum.Functions.RestrictedFunctions.file_ops_file_put_contents
		}

		$upload     = wp_upload_dir();
		$upload_dir = $upload['basedir'] ?: WP_CONTENT_DIR . '/uploads';
		$upload_url = $upload['baseurl'] ?: WP_CONTENT_URL . '/uploads';

		$result = $this->process_files(
			"{$dir}/detections.zip",
			"{$dir}/matches.zip",
			"{$upload_dir}/{$guid}.zip",
			$guid,
			$user_id,
			$threshold
		);

		if ( is_wp_error( $result ) ) {
			$this->send_email( $user_id, $guid, $result );
		} else {
			wp_schedule_single_event( time() + DAY_IN_SECONDS, 'psb_delete_file', [ "{$upload_dir}/{$guid}.zip" ] );
			$this->send_email( $user_id, $guid, "{$upload_url}/{$guid}.zip" );
		}
	}

	/**
	 * @return true|WP_Error
	 */
	private function process_files( string $detections, string $matches, string $dest, string $guid, int $user_id, int $threshold ) {
		$decoder = new OIDDecoder(
			rtrim( Settings::instance()->get_api_server(), '/' ),
			$user_id
		);

		$processor = new ResultsProcessor( $decoder );
		return $processor->process(
			$guid,
			$detections,
			$matches,
			$dest,
			dirname( $detections ),
			$threshold
		);
	}

	/**
	 * @param WP_Error|string $error_or_link
	 */
	private function send_email( int $user_id, string $guid, $error_or_link ): void {
		$user = new WP_User( $user_id );
		// translators: 1 - blog name
		$subject = sprintf( __( '[%1$s] VIDentigraF: Video Processing Results', 'i8f' ), get_bloginfo( 'name' ) );
		if ( is_wp_error( $error_or_link ) ) {
			// translators: 1 - video GUID, 2 - error message
			$message = sprintf( __( 'There was an error processing the video %1$s: %2$s', 'i8f' ), $guid, $error_or_link->get_error_message() );
		} else {
			// translators: 1 - video GUID, 2 - video link
			$message = sprintf( __( "Video %1\$s has been processed.\n\nLink: %2\$s\n\nThe link is valid for 24 hours.", 'i8f' ), $guid, $error_or_link );
		}

		// phpcs:ignore WordPressVIPMinimum.Functions.RestrictedFunctions.wp_mail_wp_mail
		wp_mail( $user->user_email, $subject, $message );
	}
}
