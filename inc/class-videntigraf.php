<?php

// phpcs:disable WordPressVIPMinimum.Functions.RestrictedFunctions.wp_remote_get_wp_remote_get

namespace Myrotvorets\WordPress\Identigraf;

use WP_Error;

/**
 * @psalm-type VideoProcessingStatsObject = object{ detections: int, matches: int, d_archives: int, m_archives: int }
 * @psalm-type APIErrorResponse = object{ success: false }
 * @psalm-type CheckInProgress = object{ success: true, status: 'inprogress' }
 * @psalm-type ProcessingCompleted = object{ success: true, status: 'complete', stats: VideoProcessingStatsObject }
 */
final class VIDentigraF {
	private string $server;
	private int $user_id;

	public function __construct( string $server, int $user_id ) {
		$this->server  = $server;
		$this->user_id = $user_id;
	}

	/**
	 * @psalm-return WP_Error|false|VideoProcessingStats
	 */
	public function check_status( string $guid ) {
		$token    = Utils::generate_token_for_user( $this->user_id );
		$response = wp_remote_get( "{$this->server}/videntigraf/v1/process/{$guid}", [
			'headers' => [
				'Authorization' => 'Bearer ' . $token,
			],
		] );

		if ( is_wp_error( $response ) ) {
			return $response;
		}

		$status = wp_remote_retrieve_response_code( $response );
		if ( $status > 200 ) {
			// translators: 1 = HTTP error code
			return new WP_Error( 'api_error', sprintf( __( 'HTTP error %1$d calling Myrotvorets API.', 'i8f' ), $status ) );
		}

		$body = wp_remote_retrieve_body( $response );
		/** @var mixed */
		$json = json_decode( $body );
		if ( is_object( $json ) && isset( $json->success ) ) {
			/** @psalm-var APIErrorResponse|CheckInProgress|ProcessingCompleted $json */
			if ( true === $json->success ) { // NOSONAR
				/** @psalm-suppress RedundantConditionGivenDocblockType -- this looks like a bug in Psalm */
				if ( 'complete' === $json->status ) {
					return new VideoProcessingStats( $json->stats );
				}

				return false;
			}
		}

		return new WP_Error( 'api_error', __( 'Bad response from Myrotvorets API.', 'i8f' ) );
	}

	/**
	 * @psalm-return WP_Error|string
	 */
	public function get_detections( string $guid, int $archive_no ) {
		return $this->get_archive( $guid, 'detections', $archive_no );
	}

	/**
	 * @psalm-return WP_Error|string
	 */
	public function get_matches( string $guid, int $archive_no ) {
		return $this->get_archive( $guid, 'matches', $archive_no );
	}

	/**
	 * @psalm-param 'detections'|'matches' $what
	 * @psalm-return WP_Error|string
	 */
	private function get_archive( string $guid, string $what, int $archive_no ) {
		$token    = Utils::generate_token_for_user( $this->user_id );
		$response = wp_remote_get( "{$this->server}/videntigraf/v1/process/{$guid}/{$what}/{$archive_no}", [
			'timeout' => 120,    // phpcs:ignore WordPressVIPMinimum.Performance.RemoteRequestTimeout.timeout_timeout
			'headers' => [
				'Authorization' => 'Bearer ' . $token,
			],
		] );

		if ( is_wp_error( $response ) ) {
			return $response;
		}

		$status = wp_remote_retrieve_response_code( $response );
		if ( 200 !== $status ) {
			// translators: 1 = HTTP error code
			return new WP_Error( 'api_error', sprintf( __( 'HTTP error %1$d calling Myrotvorets API.', 'i8f' ), $status ) );
		}

		return wp_remote_retrieve_body( $response );
	}
}
