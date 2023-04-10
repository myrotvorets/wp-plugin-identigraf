<?php

namespace Myrotvorets\WordPress\Identigraf;

use WildWolf\Utils\Singleton;
use WP_Error;
use WP_REST_Request;
use WP_REST_Response;
use WP_REST_Server;

final class REST_Controller /* NOSONAR */ {
	use Singleton;

	const NAMESPACE = 'identigraf/v2';

	private function __construct() {
		$this->register_routes();
	}

	private function register_routes(): void {
		register_rest_route(
			self::NAMESPACE,
			'token',
			[
				'methods'             => WP_REST_Server::READABLE,
				'permission_callback' => [ $this, 'check_level_1' ],
				'callback'            => [ $this, 'get_token' ],
			]
		);

		register_rest_route(
			self::NAMESPACE,
			'video-check',
			[
				'methods'             => WP_REST_Server::CREATABLE,
				'permission_callback' => [ $this, 'check_level_1' ],
				'callback'            => [ $this, 'video_check' ],
			]
		);
	}

	/**
	 * @return bool|WP_Error
	 */
	public function check_level_1() {
		if ( ! current_user_can( 'level_1' ) ) {
			return new WP_Error(
				'rest_operation_not_allowed',
				__( 'Access denied.', 'i8f' ),
				[ 'status' => rest_authorization_required_code() ]
			);
		}

		return true;
	}

	public function get_token(): WP_REST_Response {
		$token = Utils::generate_token_for_user( get_current_user_id() );
		return new WP_REST_Response([
			'token' => $token,
		]);
	}

	/**
	 * @return WP_REST_Response|WP_Error
	 */
	public function video_check( WP_REST_Request $request ) {
		// Get GUID from JSON body payload
		$params = $request->get_json_params();
		/** @var mixed */
		$guid      = $params['guid'] ?? null;
		$threshold = intval( $params['minSimilarity'] ?? 0 );

		if ( $guid && is_string( $guid ) && 36 === strlen( $guid ) ) {
			wp_schedule_single_event( time() + 5, 'identigraf_video_check', [ $guid, get_current_user_id(), time(), $threshold ] );
			return new WP_REST_Response( [] );
		}

		return new WP_Error(
			'bad_request',
			__( 'Bad request.', 'i8f' ),
			[ 'status' => 400 ]
		);
	}
}
