<?php
/*
 * Plugin Name: IDentigraF
 * Description: IDentigraF integration for WP
 * Version: 2.0.0
 * Author: Myrotvorets
 * Author URI: https://myrotvorets.center/
 * License: MIT
 * Domain Path: /lang
 */

use Myrotvorets\WordPress\Identigraf\Plugin;

if ( defined( 'ABSPATH' ) ) {
	if ( defined( 'VENDOR_PATH' ) ) {
		/** @psalm-suppress UnresolvableInclude, MixedOperand */
		require constant( 'VENDOR_PATH' ) . '/vendor/autoload.php'; // NOSONAR
	} elseif ( file_exists( __DIR__ . '/vendor/autoload.php' ) ) {
		require __DIR__ . '/vendor/autoload.php';
	} elseif ( file_exists( ABSPATH . 'vendor/autoload.php' ) ) {
		/** @psalm-suppress UnresolvableInclude */
		require ABSPATH . 'vendor/autoload.php';
	}

	Plugin::instance();
}
