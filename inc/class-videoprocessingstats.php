<?php

namespace Myrotvorets\WordPress\Identigraf;

/**
 * This class exists only to keep Psalm happy.
 *
 * @psalm-import-type VideoProcessingStatsObject from VIDentigraF
 * @psalm-suppress PossiblyUnusedProperty
 */
class VideoProcessingStats {
	/** @psalm-readonly */
	public int $detections;
	/** @psalm-readonly */
	public int $matches;
	/** @psalm-readonly */
	public int $d_archives;
	/** @psalm-readonly */
	public int $m_archives;

	/**
	 * @psalm-param VideoProcessingStatsObject $data
	 */
	public function __construct( $data ) {
		$this->detections = $data->detections;
		$this->matches    = $data->matches;
		$this->d_archives = $data->d_archives;
		$this->m_archives = $data->m_archives;
	}
}
