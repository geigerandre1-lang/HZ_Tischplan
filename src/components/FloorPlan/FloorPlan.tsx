import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Table } from '../../types';
import { ZoneSvg, ZONE_W, AISLE_W, ZONE_H } from './Zone';
import { ZoneId } from '../../types';

// Outer aisle between zones
const OUTER_AISLE_W = 36;
// SVG padding
const PAD_X = 60;
const PAD_Y = 40;

const ZONE_IDS: ZoneId[] = [1, 2, 3, 4];

// Compute x position of each zone's left edge
function zoneX(id: ZoneId): number {
  return PAD_X + (id - 1) * (ZONE_W + OUTER_AISLE_W);
}

const SVG_W = PAD_X * 2 + 4 * ZONE_W + 3 * OUTER_AISLE_W;
const SVG_H = PAD_Y * 2 + ZONE_H;

interface FloorPlanProps {
  onTableClick: (table: Table) => void;
  onTableRemove: (table: Table) => void;
}

export function FloorPlan({ onTableClick, onTableRemove }: FloorPlanProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  // Zoom/pan state
  const [transform, setTransform] = useState({ scale: 1, tx: 0, ty: 0 });
  const dragging = useRef(false);
  const lastPos  = useRef({ x: 0, y: 0 });
  const pinchDist = useRef<number | null>(null);

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    setTransform(prev => {
      const factor = e.deltaY < 0 ? 1.1 : 0.91;
      const newScale = Math.min(Math.max(prev.scale * factor, 0.3), 4);
      return { ...prev, scale: newScale };
    });
  }, []);

  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  const onMouseDown = (e: React.MouseEvent) => {
    dragging.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragging.current) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    lastPos.current = { x: e.clientX, y: e.clientY };
    setTransform(prev => ({ ...prev, tx: prev.tx + dx, ty: prev.ty + dy }));
  };
  const onMouseUp = () => { dragging.current = false; };

  // Touch pinch zoom
  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      pinchDist.current = Math.sqrt(dx * dx + dy * dy);
    } else if (e.touches.length === 1) {
      dragging.current = true;
      lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchDist.current !== null) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const newDist = Math.sqrt(dx * dx + dy * dy);
      const factor = newDist / pinchDist.current;
      pinchDist.current = newDist;
      setTransform(prev => ({
        ...prev,
        scale: Math.min(Math.max(prev.scale * factor, 0.3), 4),
      }));
    } else if (e.touches.length === 1 && dragging.current) {
      const dx = e.touches[0].clientX - lastPos.current.x;
      const dy = e.touches[0].clientY - lastPos.current.y;
      lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      setTransform(prev => ({ ...prev, tx: prev.tx + dx, ty: prev.ty + dy }));
    }
  };
  const onTouchEnd = () => { dragging.current = false; pinchDist.current = null; };

  const resetView = () => setTransform({ scale: 1, tx: 0, ty: 0 });

  return (
    <div className="relative w-full h-full overflow-hidden select-none">
      {/* Reset zoom button */}
      <button
        onClick={resetView}
        className="absolute top-3 right-3 z-10 btn-ghost text-xs px-2 py-1"
        title="Ansicht zurücksetzen"
      >
        ⟳ Zurücksetzen
      </button>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width="100%"
        height="100%"
        style={{
          cursor: dragging.current ? 'grabbing' : 'grab',
          touchAction: 'none',
          background: '#1e2a45',
        }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <g transform={`translate(${transform.tx}, ${transform.ty}) scale(${transform.scale})`}>
          {/* Hall background */}
          <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="#1e2a45" />

          {/* Floor area */}
          <rect
            x={PAD_X - 10}
            y={PAD_Y - 10}
            width={SVG_W - 2 * (PAD_X - 10)}
            height={ZONE_H + 20}
            rx={12}
            fill="#263554"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={1}
          />

          {/* Between-zone outer aisles */}
          {[1, 2, 3].map(i => (
            <rect
              key={i}
              x={PAD_X + i * ZONE_W + (i - 1) * OUTER_AISLE_W}
              y={PAD_Y - 10}
              width={OUTER_AISLE_W}
              height={ZONE_H + 20}
              fill="#1a2540"
              opacity={0.8}
            />
          ))}

          {/* Zone labels */}
          {ZONE_IDS.map(id => (
            <text
              key={id}
              x={zoneX(id) + ZONE_W / 2}
              y={PAD_Y - 16}
              textAnchor="middle"
              fill="rgba(255,255,255,0.3)"
              fontSize={11}
              fontFamily="Cormorant Garamond, serif"
              letterSpacing={2}
            >
              BEREICH {id}
            </text>
          ))}

          {/* Zones */}
          {ZONE_IDS.map(id => (
            <ZoneSvg
              key={id}
              zoneId={id}
              x={zoneX(id)}
              y={PAD_Y}
              onTableClick={onTableClick}
              onTableRemove={onTableRemove}
            />
          ))}
        </g>
      </svg>
    </div>
  );
}
