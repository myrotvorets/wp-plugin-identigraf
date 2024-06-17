import React, { type ReactNode } from 'react';

interface VideoPreviewProps {
	video: string;
}

export function VideoPreview( { video }: VideoPreviewProps ): ReactNode {
	// eslint-disable-next-line sonarjs/media-has-caption
	return video.length > 0 ? <video src={ video } className="mb-3" controls /> : null; // NOSONAR
}
