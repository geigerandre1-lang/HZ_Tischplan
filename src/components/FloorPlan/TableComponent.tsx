import React from 'react';
import { Table } from '../../types';

interface TableComponentProps {
  table: Table;
  x: number;
  y: number;
  tableW: number;
  tableH: number;
  isVertical?: boolean; // for BT
  onClick: (table: Table) => void;
  onRemove: (table: Table) => void;
}

const CHAIR_W = 22;
const CHAIR_H = 12;
const CHAIR_GAP = 5;
const OCCUPIED_COLOR = '#c9a84c';
const EMPTY_COLOR = 'rgba(255,255,255,0.13)';
const OCCUPIED_STROKE = '#e8c97a';
const EMPTY_STROKE = 'rgba(255,255,255,0.25)';

function Chairs({
  count,
  tableX,
  tableY,
  tableW,
  tableH,
  vertical,
  guests,
  seatOffset,
}: {
  count: number;
  tableX: number;
  tableY: number;
  tableW: number;
  tableH: number;
  vertical: boolean;
  guests: string[];
  seatOffset: number;
}) {
  const half = count / 2;
  const chairsTop: JSX.Element[] = [];
  const chairsBottom: JSX.Element[] = [];

  const trunc = (s: string) => s.length > 9 ? s.slice(0, 8) + '…' : s;

  if (!vertical) {
    // horizontal table: chairs on top and bottom
    const totalW = half * CHAIR_W + (half - 1) * CHAIR_GAP;
    const startX = tableX + (tableW - totalW) / 2;
    for (let i = 0; i < half; i++) {
      const cx = startX + i * (CHAIR_W + CHAIR_GAP);
      const guestIdx = seatOffset + i;
      const guestName = guests[guestIdx]?.trim() ?? '';
      const occupied = !!guestName;
      const chairY = tableY - CHAIR_H - 4;
      const seatNumTop = seatOffset + i + 1;
      // top chair
      chairsTop.push(
        <g key={`top-${i}`}>
          <rect
            x={cx}
            y={chairY}
            width={CHAIR_W}
            height={CHAIR_H}
            rx={CHAIR_H / 2}
            fill={occupied ? OCCUPIED_COLOR : EMPTY_COLOR}
            stroke={occupied ? OCCUPIED_STROKE : EMPTY_STROKE}
            strokeWidth={1}
          />
          {guestName ? (
            <text
              x={cx + CHAIR_W / 2}
              y={chairY - 2}
              textAnchor="middle"
              fill="#e8c97a"
              fontSize={6.5}
              fontFamily="Cormorant Garamond, serif"
              style={{ pointerEvents: 'none' }}
            >
              {trunc(guestName)}
            </text>
          ) : (
            <text
              x={cx + CHAIR_W / 2}
              y={chairY + CHAIR_H / 2 + 2.5}
              textAnchor="middle"
              fill="rgba(255,255,255,0.35)"
              fontSize={6}
              fontFamily="Cormorant Garamond, serif"
              style={{ pointerEvents: 'none' }}
            >
              {seatNumTop}
            </text>
          )}
        </g>
      );
      // bottom chair
      const guestIdxB = seatOffset + half + i;
      const guestNameB = guests[guestIdxB]?.trim() ?? '';
      const occupiedB = !!guestNameB;
      const chairYB = tableY + tableH + 4;
      const seatNumBot = seatOffset + half + i + 1;
      chairsBottom.push(
        <g key={`bot-${i}`}>
          <rect
            x={cx}
            y={chairYB}
            width={CHAIR_W}
            height={CHAIR_H}
            rx={CHAIR_H / 2}
            fill={occupiedB ? OCCUPIED_COLOR : EMPTY_COLOR}
            stroke={occupiedB ? OCCUPIED_STROKE : EMPTY_STROKE}
            strokeWidth={1}
          />
          {guestNameB ? (
            <text
              x={cx + CHAIR_W / 2}
              y={chairYB + CHAIR_H + 8}
              textAnchor="middle"
              fill="#e8c97a"
              fontSize={6.5}
              fontFamily="Cormorant Garamond, serif"
              style={{ pointerEvents: 'none' }}
            >
              {trunc(guestNameB)}
            </text>
          ) : (
            <text
              x={cx + CHAIR_W / 2}
              y={chairYB + CHAIR_H / 2 + 2.5}
              textAnchor="middle"
              fill="rgba(255,255,255,0.35)"
              fontSize={6}
              fontFamily="Cormorant Garamond, serif"
              style={{ pointerEvents: 'none' }}
            >
              {seatNumBot}
            </text>
          )}
        </g>
      );
    }
  } else {
    // vertical table (BT): chairs on left and right
    const totalH = half * CHAIR_W + (half - 1) * CHAIR_GAP;
    const startY = tableY + (tableH - totalH) / 2;
    for (let i = 0; i < half; i++) {
      const cy = startY + i * (CHAIR_W + CHAIR_GAP);
      const guestIdx = seatOffset + i;
      const guestName = guests[guestIdx]?.trim() ?? '';
      const occupied = !!guestName;
      const chairX = tableX - CHAIR_H - 4;
      const seatNumL = seatOffset + i + 1;
      // left chair
      chairsTop.push(
        <g key={`left-${i}`}>
          <rect
            x={chairX}
            y={cy}
            width={CHAIR_H}
            height={CHAIR_W}
            rx={CHAIR_H / 2}
            fill={occupied ? OCCUPIED_COLOR : EMPTY_COLOR}
            stroke={occupied ? OCCUPIED_STROKE : EMPTY_STROKE}
            strokeWidth={1}
          />
          {guestName ? (
            <text
              x={chairX - 3}
              y={cy + CHAIR_W / 2 + 2.5}
              textAnchor="end"
              fill="#e8c97a"
              fontSize={6.5}
              fontFamily="Cormorant Garamond, serif"
              style={{ pointerEvents: 'none' }}
            >
              {trunc(guestName)}
            </text>
          ) : (
            <text
              x={chairX + CHAIR_H / 2}
              y={cy + CHAIR_W / 2 + 2.5}
              textAnchor="middle"
              fill="rgba(255,255,255,0.35)"
              fontSize={6}
              fontFamily="Cormorant Garamond, serif"
              style={{ pointerEvents: 'none' }}
            >
              {seatNumL}
            </text>
          )}
        </g>
      );
      const guestIdxR = seatOffset + half + i;
      const guestNameR = guests[guestIdxR]?.trim() ?? '';
      const occupiedR = !!guestNameR;
      const chairXR = tableX + tableW + 4;
      const seatNumR = seatOffset + half + i + 1;
      // right chair
      chairsBottom.push(
        <g key={`right-${i}`}>
          <rect
            x={chairXR}
            y={cy}
            width={CHAIR_H}
            height={CHAIR_W}
            rx={CHAIR_H / 2}
            fill={occupiedR ? OCCUPIED_COLOR : EMPTY_COLOR}
            stroke={occupiedR ? OCCUPIED_STROKE : EMPTY_STROKE}
            strokeWidth={1}
          />
          {guestNameR ? (
            <text
              x={chairXR + CHAIR_H + 3}
              y={cy + CHAIR_W / 2 + 2.5}
              textAnchor="start"
              fill="#e8c97a"
              fontSize={6.5}
              fontFamily="Cormorant Garamond, serif"
              style={{ pointerEvents: 'none' }}
            >
              {trunc(guestNameR)}
            </text>
          ) : (
            <text
              x={chairXR + CHAIR_H / 2}
              y={cy + CHAIR_W / 2 + 2.5}
              textAnchor="middle"
              fill="rgba(255,255,255,0.35)"
              fontSize={6}
              fontFamily="Cormorant Garamond, serif"
              style={{ pointerEvents: 'none' }}
            >
              {seatNumR}
            </text>
          )}
        </g>
      );
    }
  }

  return (
    <>
      {chairsTop}
      {chairsBottom}
    </>
  );
}

export function TableComponent({
  table,
  x,
  y,
  tableW,
  tableH,
  isVertical = false,
  onClick,
  onRemove,
}: TableComponentProps) {
  const isBT = table.id === 'bt';
  const occupiedCount = table.guests.filter(g => g.trim().length > 0).length;

  // label chars for number display
  const numLabel = String(table.number);

  return (
    <g>
      <Chairs
        count={table.size}
        tableX={x}
        tableY={y}
        tableW={tableW}
        tableH={tableH}
        vertical={isVertical}
        guests={table.guests}
        seatOffset={0}
      />

      {/* Table rectangle */}
      <rect
        x={x}
        y={y}
        width={tableW}
        height={tableH}
        rx={isBT ? 6 : 8}
        fill={isBT ? '#c9a84c' : '#d6d6d6'}
        stroke={isBT ? '#e8c97a' : '#a0a0a0'}
        strokeWidth={2}
        style={{ cursor: 'pointer' }}
        onClick={() => onClick(table)}
      />

      {/* Table number */}
      <text
        x={x + tableW / 2}
        y={y + (isVertical ? tableH / 2 - 8 : tableH / 2 - 6)}
        textAnchor="middle"
        fill={isBT ? '#1e2a45' : '#2a2a2a'}
        fontSize={isVertical ? 14 : 13}
        fontWeight="700"
        fontFamily="Playfair Display, serif"
        style={{ cursor: 'pointer', pointerEvents: 'none' }}
      >
        {numLabel}
      </text>

      {/* Table name (truncated) */}
      {table.name && (
        <text
          x={x + tableW / 2}
          y={y + (isVertical ? tableH / 2 + 8 : tableH / 2 + 8)}
          textAnchor="middle"
          fill={isBT ? '#1e2a45' : '#444'}
          fontSize={9}
          fontFamily="Cormorant Garamond, serif"
          style={{ pointerEvents: 'none' }}
        >
          {table.name.length > 14 ? table.name.slice(0, 13) + '…' : table.name}
        </text>
      )}

      {/* Occupancy */}
      <text
        x={x + tableW / 2}
        y={y + tableH - 6}
        textAnchor="middle"
        fill={isBT ? '#1e2a45' : '#666'}
        fontSize={8}
        fontFamily="Cormorant Garamond, serif"
        style={{ pointerEvents: 'none' }}
      >
        {occupiedCount}/{table.size}
      </text>

      {/* Click overlay */}
      <rect
        x={x}
        y={y}
        width={tableW}
        height={tableH}
        fill="transparent"
        style={{ cursor: 'pointer' }}
        onClick={() => onClick(table)}
      />

      {/* Remove button (not for BT) */}
      {!isBT && (
        <g
          style={{ cursor: 'pointer' }}
          onClick={(e) => { e.stopPropagation(); onRemove(table); }}
        >
          <circle
            cx={x + tableW - 1}
            cy={y + 1}
            r={9}
            fill="#c0392b"
            stroke="#1e2a45"
            strokeWidth={1.5}
          />
          <text
            x={x + tableW - 1}
            y={y + 5}
            textAnchor="middle"
            fill="white"
            fontSize={11}
            fontWeight="700"
            fontFamily="Arial, sans-serif"
            style={{ pointerEvents: 'none' }}
          >
            −
          </text>
        </g>
      )}
    </g>
  );
}
