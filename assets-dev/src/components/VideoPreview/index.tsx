import React, { type ReactElement } from 'react';

export interface VideoPreviewProps {
	video: string;
}

export default function VideoPreview( { video }: VideoPreviewProps ): ReactElement | null {
	return video.length > 0 ? <video src={ video } className="mb-3" controls /> : null;
}
