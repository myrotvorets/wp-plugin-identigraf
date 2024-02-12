<?php
/*
 * Plugin Name: IDentigraF
 * Plugin URI: https://neuro.identigraf.center/
 * Description: IDentigraF integration for WP
 * Version: 2.0.0
 * Author: Myrotvorets
 * Author URI: https://myrotvorets.center/
 * License: MIT
 * Domain Path: /lang
 */

use Myrotvorets\WordPress\Identigraf\Plugin;

if ( defined( 'ABSPATH' ) ) {
	if ( file_exists( __DIR__ . '/vendor/autoload.php' ) ) {
		require_once __DIR__ . '/vendor/autoload.php';
	} elseif ( file_exists( ABSPATH . 'vendor/autoload.php' ) ) {
		require_once ABSPATH . 'vendor/autoload.php';
	}

	Plugin::instance();
}
