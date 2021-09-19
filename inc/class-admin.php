<?php

namespace Myrotvorets\WordPress\Identigraf;

use WildWolf\Utils\Singleton;

final class Admin {
	use Singleton;

	const OPTIONS_MENU_SLUG = 'i8f-settings';

	/** @var string|false|null */
	private $search_slug;

	private function __construct() {
		$this->init();
	}

	private function init(): void {
		load_plugin_textdomain( 'i8fa', false, plugin_basename( dirname( __DIR__ ) ) . '/lang/' );

		add_action( 'admin_init', [ $this, 'admin_init' ] );
		add_action( 'admin_init', [ AdminSettings::class, 'instance' ] );
		add_action( 'admin_menu', [ $this, 'admin_menu' ] );
	}

	public function admin_init(): void {
		$plugin = plugin_basename( dirname( __DIR__ ) . '/index.php' );
		add_filter( 'plugin_action_links_' . $plugin, [ $this, 'plugin_action_links' ] );
	}

	public function admin_menu(): void {
		add_options_page( __( 'IDentigraF Settings', 'i8fa' ), __( 'IDentigraF', 'i8fa' ), 'manage_options', self::OPTIONS_MENU_SLUG, [ __CLASS__, 'options_page' ] );
		add_menu_page( __( 'Search', 'i8fa' ), __( 'IDentigraF', 'i8fa' ), 'level_1', 'i8f' );

		$this->search_slug = add_submenu_page( 'i8f', __( 'Search', 'i8fa' ), __( 'Search', 'i8fa' ), 'level_1', 'i8f', [ $this, 'i8f_page' ] );

		if ( $this->search_slug ) {
			if ( Settings::instance()->valid() ) {
				add_action( 'admin_enqueue_scripts', [ $this, 'admin_enqueue_scripts' ] );
			} else {
				add_action( 'load-' . $this->search_slug, [ $this, 'redirect_to_settings' ] );
			}
		}
	}

	/**
	 * @param string $hook
	 */
	public function admin_enqueue_scripts( $hook ): void {
		if ( $hook === $this->search_slug ) {
			wp_enqueue_style( 'i8f-bootstrap', plugins_url( 'assets/bootstrap.min.css', __DIR__ ), [], '5.1.1' );
			wp_enqueue_style( 'i8f-lightbox', plugins_url( 'assets/lightbox.min.css', __DIR__ ), [], '5.1.4' );
			wp_enqueue_script( 'i8f', plugins_url( 'assets/search.min.js', __DIR__ ), [ 'react', 'react-dom', 'wp-api-fetch', 'wp-i18n' ], '1', true );
			wp_localize_script( 'i8f', 'i8f', [
				'endpoint' => Settings::instance()->get_endpoint(),
			] );
			wp_set_script_translations( 'i8f', 'i8fjs', plugin_dir_path( dirname( __DIR__ ) . '/index.php' ) . '/lang' );
		}
	}

	public static function options_page(): void {
		require __DIR__ . '/../views/options.php';
	}

	public function i8f_page(): void {
		echo '<div class="wrap"></div>';
	}

	public function redirect_to_settings(): void {
		wp_safe_redirect( admin_url( 'options-general.php?page=' . self::OPTIONS_MENU_SLUG ) );
		exit();
	}

	/**
	 * @param array<string,string> $links
	 * @return array<string,string>
	 */
	public function plugin_action_links( array $links ): array {
		$url               = esc_url( admin_url( 'options-general.php?page=' . self::OPTIONS_MENU_SLUG ) );
		$link              = '<a href="' . $url . '">' . __( 'Settings', 'i8fa' ) . '</a>';
		$links['settings'] = $link;
		return $links;
	}
}
