<?php

namespace Myrotvorets\WordPress\Identigraf;

use WP_Error;

/**
 * @psalm-type DecodeResponseEntry = array{ name: string, link: string, matchedPhoto: string, primaryPhoto: string, country: string }
 * @psalm-type DecodeResponseBody = array<string, DecodeResponseEntry>
 */
final class OIDDecoder {
	private string $server;
	private int $user_id;

	public function __construct( string $server, int $user_id ) {
		$this->server  = $server;
		$this->user_id = $user_id;
	}

	/**
	 * @return array|WP_Error
	 * @psalm-return DecodeResponseBody|WP_Error
	 */
	public function decode( array $oids ) {
		$response = wp_remote_post(
			"{$this->server}/identigraf-decoder/v1/decode",
			[
				'headers' => [
					'Content-Type'  => 'application/json',
					'Authorization' => 'Bearer ' . Utils::generate_token_for_user( $this->user_id ),
				],
				'body'    => wp_json_encode( $oids ),
			]
		);

		if ( is_wp_error( $response ) ) {
			return $response;
		}

		$code = wp_remote_retrieve_response_code( $response );
		if ( 200 !== $code ) {
			// translators: 1 = error code
			return new WP_Error( 'api_error', sprintf( __( 'HTTP error %1$d calling Myrotvorets API.', 'i8f' ), $code ) );
		}

		/** @var mixed */
		$body = json_decode( wp_remote_retrieve_body( $response ), true );
		if ( is_array( $body ) && true === $body['success'] && isset( $body['items'] ) && is_array( $body['items'] ) ) {
			/** @var DecodeResponseBody */
			return $body['items'];
		}

		return new WP_Error( 'api_error', __( 'Bad response from Myrotvorets API.', 'i8f' ) );
	}
}
