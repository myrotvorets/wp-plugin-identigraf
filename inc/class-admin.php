<?php

namespace Myrotvorets\WordPress\Identigraf;

use WildWolf\Utils\Singleton;

final class Admin {
	use Singleton;

	const OPTIONS_MENU_SLUG = 'i8f-settings';

	/** @var string|false|null */
	private $search_slug;

	/** @var string|false|null */
	private $compare_slug;

	/** @var string|false|null */
	private $video_slug;

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
		add_menu_page( __( 'Search by Photo', 'i8fa' ), __( 'IDentigraF', 'i8fa' ), 'read', 'i8f' );

		$this->search_slug  = (string) add_submenu_page( 'i8f', __( 'Search by Photo', 'i8fa' ), __( 'Search', 'i8fa' ), 'read', 'i8f', [ $this, 'i8f_page' ] );
		$this->compare_slug = (string) add_submenu_page( 'i8f', __( 'Compare Faces', 'i8fa' ), __( 'Compare', 'i8fa' ), 'read', 'i8f-compare', [ $this, 'i8f_page' ] );
		$this->video_slug   = (string) add_submenu_page( 'i8f', __( 'Upload Video', 'i8fa' ), __( 'Video', 'i8fa' ), 'read', 'i8f-video', [ $this, 'i8f_page' ] );

		if ( $this->search_slug && $this->compare_slug && $this->video_slug ) {
			add_action( 'admin_enqueue_scripts', [ $this, 'admin_enqueue_scripts' ] );

			$settings = Settings::instance();
			if ( ! $settings->valid_identigraf_settings() ) {
				add_action( 'load-' . $this->search_slug, [ $this, 'redirect_to_settings' ] );
				add_action( 'load-' . $this->compare_slug, [ $this, 'redirect_to_settings' ] );
			}

			if ( ! $settings->valid_videntigraf_settings() ) {
				add_action( 'load-' . $this->video_slug, [ $this, 'redirect_to_settings' ] );
			}
		}
	}

	/**
	 * @param string $hook
	 */
	public function admin_enqueue_scripts( $hook ): void {
		if ( $hook === $this->search_slug || $hook === $this->compare_slug || $hook === $this->video_slug ) {
			add_filter( 'script_loader_tag', [ $this, 'script_loader_tag' ], 10, 2 );
			wp_enqueue_style( 'i8f-bootstrap', plugins_url( 'assets/bootstrap.min.css', __DIR__ ), [], '5.1.1-' . (string) filemtime( __DIR__ . '/../assets/bootstrap.min.css' ) );
			wp_enqueue_style( 'i8f-lightbox', plugins_url( 'assets/lightbox.min.css', __DIR__ ), [], '5.1.4' );

			wp_enqueue_script(
				'i8f-rtl',
				plugins_url( 'assets/rtl.min.js', __DIR__ ),
				[ 'react', 'react-dom', 'wp-api-fetch', 'wp-i18n' ],
				(string) filemtime( __DIR__ . '/../assets/rtl.min.js' ),
				true
			);

			switch ( $hook ) {
				default:
					$script = 'search';
					break;

				case $this->compare_slug:
					$script = 'compare';
					break;

				case $this->video_slug:
					$script = 'video';
					break;
			}

			wp_enqueue_script(
				'i8f',
				plugins_url( "assets/{$script}.min.js", __DIR__ ),
				[ 'i8f-rtl' ],
				(string) filemtime( __DIR__ . "/../assets/{$script}.min.js" ),
				true
			);

			$api_server    = Settings::instance()->get_api_server();
			$ss_api_server = Settings::instance()->get_ss_api_server();

			if ( defined( 'PSB_INTERNAL_DOMAIN' ) ) {
				$base_url = get_bloginfo( 'url' );
			} elseif ( defined( 'MYROTVORETS_PRIMARY_DOMAIN' ) ) {
				$base_url = 'https://' . (string) MYROTVORETS_PRIMARY_DOMAIN;
			} else {
				$base_url = 'https://myrotvorets.center';
			}

			wp_localize_script( 'i8f', 'i8f', [
				'aendpoint' => rtrim( $api_server, '/' ) . '/identigraf-auth/v2',
				'iendpoint' => rtrim( $api_server, '/' ) . '/identigraf/v2',
				'uendpoint' => rtrim( $api_server, '/' ) . '/identigraf-upload/v1',
				'vendpoint' => rtrim( $ss_api_server, '/' ) . '/videntigraf/v1',
				'title'     => get_admin_page_title(),
				'baseurl'   => $base_url,
			] );

			wp_set_script_translations( 'i8f', 'i8fjs', plugin_dir_path( dirname( __DIR__ ) . '/index.php' ) . '/lang' );
		}
	}

	/**
	 * @param string $tag
	 * @param string $handle
	 * @return string
	 */
	public function script_loader_tag( $tag, $handle ) {
		if ( 'i8f-rtl' === $handle || 'i8f' === $handle ) {
			$tag = preg_replace( '/(.*)(><\/script>)/', '$1 type="module"$2', $tag );
		}

		return (string) $tag;
	}

	public static function options_page(): void {
		require __DIR__ . '/../views/options.php'; // NOSONAR
	}

	public function i8f_page(): void {
		printf( '<div class="wrap"><h1>%s</h1><main id="app"></main></div>', esc_html( get_admin_page_title() ) );
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
