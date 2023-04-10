<?php

namespace Myrotvorets\WordPress\Identigraf;

/**
 * @psalm-import-type SettingsArray from Settings
 */
abstract class SettingsValidator {
	/**
	 * @psalm-param mixed[] $settings
	 * @psalm-return SettingsArray
	 */
	public static function ensure_data_shape( array $settings ): array {
		$defaults = Settings::defaults();
		$result   = $settings + $defaults;
		foreach ( $result as $key => $_value ) {
			if ( ! isset( $defaults[ $key ] ) ) {
				unset( $result[ $key ] );
			}
		}

		/** @var mixed $value */
		foreach ( $result as $key => $value ) {
			$my_type    = gettype( $value );
			$their_type = gettype( $defaults[ $key ] );
			if ( $my_type !== $their_type ) {
				settype( $result[ $key ], $their_type );
			}
		}

		/** @psalm-var SettingsArray */
		return $result;
	}

	/**
	 * @param mixed $settings
	 * @psalm-return SettingsArray $settings
	 */
	public static function sanitize( $settings ): array {
		if ( is_array( $settings ) ) {
			$settings = self::ensure_data_shape( $settings );

			$settings['server'] = filter_var( $settings['server'], FILTER_VALIDATE_URL, [
				'options' => [ 'default' => '' ],
			] );

			$settings['server'] = filter_var( $settings['server'], FILTER_VALIDATE_REGEXP, [
				'options' => [
					'default' => '',
					'regexp'  => '!^https://!i',
				],
			] );

			$settings['ssserver'] = filter_var( $settings['ssserver'], FILTER_VALIDATE_URL, [
				'options' => [ 'default' => '' ],
			] );

			$settings['ssserver'] = filter_var( $settings['ssserver'], FILTER_VALIDATE_REGEXP, [
				'options' => [
					'default' => '',
					'regexp'  => '!^https://!i',
				],
			] );

			$settings['secret'] = filter_var( $settings['secret'], FILTER_VALIDATE_REGEXP, [
				'options' => [
					'default' => '',
					'regexp'  => '!^.{64}$!',
				],
			] );

			return $settings;
		}

		return Settings::defaults();
	}
}
