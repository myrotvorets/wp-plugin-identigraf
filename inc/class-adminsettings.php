<?php

namespace Myrotvorets\WordPress\Identigraf;

use WildWolf\Utils\Singleton;

final class AdminSettings {
	use Singleton;

	const OPTION_GROUP = 'i8f_settings';

	/** @var InputFactory */
	private $input_factory;

	/**
	 * Constructed during `admin_init`
	 */
	private function __construct() {
		$this->register_settings();
	}

	public function register_settings(): void {
		$this->input_factory = new InputFactory( Settings::OPTION_KEY, Settings::instance() );

		register_setting(
			self::OPTION_GROUP,
			Settings::OPTION_KEY,
			[
				'default'           => [],
				'sanitize_callback' => [ SettingsValidator::class, 'sanitize' ],
			]
		);

		$section = 'general-settings';
		add_settings_section(
			$section,
			'',
			'__return_empty_string',
			Admin::OPTIONS_MENU_SLUG
		);

		add_settings_field(
			'endpoint',
			__( 'API Endpoint', 'i8fa' ),
			[ $this->input_factory, 'input' ],
			Admin::OPTIONS_MENU_SLUG,
			$section,
			[
				'label_for'    => 'endpoint',
				'type'         => 'url',
				'required'     => true,
				'autocomplete' => 'off',
				'class'        => 'regular-text',
			]
		);

		add_settings_field(
			'secret',
			__( 'JWT Secret', 'i8fa' ),
			[ $this->input_factory, 'input' ],
			Admin::OPTIONS_MENU_SLUG,
			$section,
			[
				'label_for'    => 'secret',
				'type'         => 'password',
				'autocomplete' => 'off',
				'required'     => true,
				'minlength'    => 64,
				'maxlength'    => 64,
				'spellcheck'   => false,
				'class'        => 'regular-text',
			]
		);
	}
}
