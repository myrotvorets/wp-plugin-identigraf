import React, { type ReactNode } from 'react';

interface VideoPreviewProps {
	video: string;
}

export function VideoPreview( { video }: VideoPreviewProps ): ReactNode {
	return video.length > 0 ? <video src={ video } className="mb-3" controls /> : null;
}
