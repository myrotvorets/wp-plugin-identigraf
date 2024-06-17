<?php

namespace Myrotvorets\WordPress\Identigraf;

use ArrayAccess;
use LogicException;
use WildWolf\Utils\Singleton;

/**
 * @psalm-type SettingsArray = array{
 *  server: string,
 *  ssserver: string,
 *  secret: string
 * }
 *
 * @template-implements ArrayAccess<string, scalar>
 */
final class Settings implements ArrayAccess {
	use Singleton;

	/** @var string  */
	const OPTION_KEY = 'i8f';

	/**
	 * @psalm-readonly
	 * @psalm-var SettingsArray
	 */
	private static $defaults = [
		'server'   => '',
		'ssserver' => '',
		'secret'   => '',
	];

	/**
	 * @var array
	 * @psalm-var SettingsArray
	 */
	private $options;

	/**
	 * @codeCoverageIgnore
	 */
	private function __construct() {
		$this->refresh();
	}

	public function refresh(): void {
		/** @var mixed */
		$settings      = get_option( self::OPTION_KEY );
		$this->options = SettingsValidator::ensure_data_shape( is_array( $settings ) ? $settings : [] );
	}

	/**
	 * @psalm-return SettingsArray
	 */
	public static function defaults(): array {
		$defaults = self::$defaults;
		/** @psalm-suppress RiskyTruthyFalsyComparison */
		if ( ! empty( $_ENV['MYROTVORETS_API_SERVER'] ) ) {
			// phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
			$defaults['server'] = stripslashes( $_ENV['MYROTVORETS_API_SERVER'] );
		}

		/** @psalm-suppress RiskyTruthyFalsyComparison */
		if ( ! empty( $_ENV['MYROTVORETS_SS_API_SERVER'] ) ) {
			// phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
			$defaults['ssserver'] = stripslashes( $_ENV['MYROTVORETS_SS_API_SERVER'] );
		}

		/** @psalm-suppress RiskyTruthyFalsyComparison */
		if ( ! empty( $_ENV['WP_IDENTIGRAF_JWT_SECRET'] ) ) {
			// phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
			$defaults['secret'] = stripslashes( $_ENV['WP_IDENTIGRAF_JWT_SECRET'] );
		}

		return $defaults;
	}

	/**
	 * @param mixed $offset
	 */
	public function offsetExists( $offset ): bool {
		return isset( $this->options[ (string) $offset ] );
	}

	/**
	 * @param mixed $offset
	 * @return int|string|bool|null
	 */
	public function offsetGet( $offset ): mixed {
		return $this->options[ (string) $offset ] ?? null;
	}

	/**
	 * @param mixed $offset
	 * @param mixed $value
	 * @psalm-return never
	 * @throws LogicException
	 */
	public function offsetSet( $offset, $value ): void {
		throw new LogicException();
	}

	/**
	 * @param mixed $offset
	 * @psalm-return never
	 * @throws LogicException
	 */
	public function offsetUnset( $offset ): void {
		throw new LogicException();
	}

	public function valid_identigraf_settings(): bool {
		/** @psalm-suppress RiskyTruthyFalsyComparison */
		return ! empty( $this->options['secret'] ) && ! empty( $this->options['server'] );
	}

	public function valid_videntigraf_settings(): bool {
		/** @psalm-suppress RiskyTruthyFalsyComparison */
		return $this->valid_identigraf_settings() ||
			( ! empty( $this->options['secret'] ) && ! empty( $this->options['ssserver'] ) );
	}

	public function get_api_server(): string {
		return $this->options['server'];
	}

	public function get_ss_api_server(): string {
		return $this->options['ssserver'] ?: $this->get_api_server();
	}

	public function get_secret(): string {
		return $this->options['secret'];
	}
}
