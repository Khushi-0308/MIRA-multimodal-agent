import React from 'react';
import { BoundingBox } from '../../types/multimodal';

interface BoundingBoxOverlayProps {
  boxes: BoundingBox[];
}

export const BoundingBoxOverlay: React.FC<BoundingBoxOverlayProps> = ({ boxes }) => {
  return (
    <>
      {boxes.map((b) => {
        const [ymin, xmin, ymax, xmax] = b.box;
        const top = `${ymin}%`;
        const left = `${xmin}%`;
        const width = `${xmax - xmin}%`;
        const height = `${ymax - ymin}%`;
        const borderColor = b.color || '#0284c7';

        return (
          <div
            key={b.id}
            className="vision-bbox"
            style={{
              top,
              left,
              width,
              height,
              borderColor,
            }}
          >
            <div
              className="vision-bbox-tag"
              style={{ backgroundColor: borderColor }}
            >
              <span>{b.label}</span>
              <span style={{ opacity: 0.85, marginLeft: 4 }}>
                {Math.round(b.confidence * 100)}%
              </span>
            </div>
          </div>
        );
      })}
    </>
  );
};
