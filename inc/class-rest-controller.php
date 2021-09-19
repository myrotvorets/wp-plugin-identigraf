<?php

namespace Myrotvorets\WordPress\Identigraf;

use Firebase\JWT\JWT;
use WildWolf\Utils\Singleton;
use WP_Error;
use WP_REST_Response;
use WP_REST_Server;

final class REST_Controller {
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
		$user    = wp_get_current_user();
		$secret  = Settings::instance()->get_secret();
		$payload = [
			'sub' => $user->ID,
			'aud' => 'psbapi-identigraf',
			'iss' => 'https://jwt.myrotvorets.center/identigraf',
			'exp' => time() + 300,
		];

		$token = JWT::encode( $payload, $secret, 'HS512' );

		return new WP_REST_Response([
			'token' => $token,
		]);
	}
}
