<?php

namespace Myrotvorets\WordPress\Identigraf;

use WildWolf\Utils\Singleton;

final class Plugin {
	use Singleton;

	private function __construct() {
		add_action( 'init', [ $this, 'init' ] );
		if ( is_admin() ) {
			add_action( 'init', [ Admin::class, 'instance' ] );
		}
	}

	public function init(): void {
		load_plugin_textdomain( 'i8f', false, plugin_basename( dirname( __DIR__ ) ) . '/lang/' );

		add_action( 'rest_api_init', [ REST_Controller::class, 'instance' ] );
	}
}
