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
	require __DIR__ . '/vendor/autoload.php';
	Plugin::instance();
}
