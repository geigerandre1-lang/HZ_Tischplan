import React from 'react';
import { Table, GuestInfo, GUEST_TAGS, MENU_CHOICES, guestDisplayName } from '../../types';
import { useFloorPlan } from '../../context/FloorPlanContext';

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
const NA_FILL   = 'rgba(75,75,85,0.50)';
const NA_STROKE = 'rgba(120,120,130,0.55)';
const NE_STROKE = 'rgba(150,150,160,0.45)';
const NA_TEXT   = 'rgba(140,140,150,0.65)';
const NE_TEXT   = 'rgba(170,170,180,0.75)';

function Chairs({
  count,
  tableX,
  tableY,
  tableW,
  tableH,
  vertical,
  guests,
  seatOffset,
  showFullName,
}: {
  count: number;
  tableX: number;
  tableY: number;
  tableW: number;
  tableH: number;
  vertical: boolean;
  guests: GuestInfo[];
  seatOffset: number;
  showFullName: boolean;
}) {
  const half = count / 2;
  const chairsTop: JSX.Element[] = [];
  const chairsBottom: JSX.Element[] = [];

  const trunc = (s: string) => s.length > 10 ? s.slice(0, 9) + '\u2026' : s;
  const displayName = (g: GuestInfo | undefined) => g ? trunc(guestDisplayName(g, showFullName)) : '';
  // Split into two lines: firstName on top, lastName (only when showFullName) below
  const displayLines = (g: GuestInfo | undefined): [string, string] => {
    if (!g) return ['', ''];
    const first = trunc(g.firstName);
    const last  = showFullName ? trunc(g.lastName) : '';
    return [first, last];
  };
  const guestFill = (g: GuestInfo | undefined): string => {
    if (!g || !g.firstName.trim()) return EMPTY_COLOR;
    const st = g.rsvpStatus ?? 'no-entry';
    if (st === 'not-attending') return NA_FILL;
    if (st === 'no-entry') return 'url(#rsvpHatch)';
    if (g.tags.length > 0) return GUEST_TAGS.find(t => t.id === g.tags[0])?.color ?? OCCUPIED_COLOR;
    return OCCUPIED_COLOR;
  };
  const guestStroke = (g: GuestInfo | undefined): string => {
    if (!g || !g.firstName.trim()) return EMPTY_STROKE;
    const st = g.rsvpStatus ?? 'no-entry';
    if (st === 'not-attending') return NA_STROKE;
    if (st === 'no-entry') return NE_STROKE;
    if (g.tags.length > 0) return GUEST_TAGS.find(t => t.id === g.tags[0])?.color ?? OCCUPIED_STROKE;
    return OCCUPIED_STROKE;
  };
  const guestTextColor = (g: GuestInfo | undefined): string => {
    if (!g || !g.firstName.trim()) return '#e8c97a';
    const st = g.rsvpStatus ?? 'no-entry';
    if (st === 'not-attending') return NA_TEXT;
    if (st === 'no-entry') return NE_TEXT;
    return '#e8c97a';
  };
  const tagLabel = (g: GuestInfo | undefined): string => {
    if (!g || g.tags.length === 0) return '';
    return '(' + g.tags.map(id => GUEST_TAGS.find(t => t.id === id)?.short ?? id).join(',') + ')';
  };
  const menuColor = (g: GuestInfo | undefined): string | null => {
    if (!g?.menu) return null;
    return MENU_CHOICES.find(m => m.id === g.menu)?.color ?? null;
  };

  if (!vertical) {
    // horizontal table: chairs on top and bottom
    const totalW = half * CHAIR_W + (half - 1) * CHAIR_GAP;
    const startX = tableX + (tableW - totalW) / 2;
    for (let i = 0; i < half; i++) {
      const cx = startX + i * (CHAIR_W + CHAIR_GAP);
      const guestIdx = seatOffset + i;
      const guest = guests[guestIdx];
      const guestName = guest?.firstName.trim() ?? '';
      const chairY = tableY - CHAIR_H - 4;
      const seatNumTop = seatOffset + i + 1;
      const [line1, line2] = displayLines(guest);
      // top chair
      chairsTop.push(
        <g key={`top-${i}`}>
          <rect
            x={cx}
            y={chairY}
            width={CHAIR_W}
            height={CHAIR_H}
            rx={CHAIR_H / 2}
            fill={guestFill(guest)}
            stroke={guestStroke(guest)}
            strokeWidth={1}
          />
          {menuColor(guest) !== null && (
            <circle cx={cx + CHAIR_W - 3} cy={chairY + 3} r={2.5} fill={menuColor(guest)!} style={{ pointerEvents: 'none' }} />
          )}
          {guestName ? (
            <>
              <text
                x={cx + CHAIR_W / 2}
                y={chairY - (line2 ? 8 : 2)}
                textAnchor="middle"
                fill={guestTextColor(guest)}
                fontSize={6.5}
                fontFamily="Cormorant Garamond, serif"
                style={{ pointerEvents: 'none' }}
              >
                {line1}
              </text>
              {line2 && (
                <text
                  x={cx + CHAIR_W / 2}
                  y={chairY - 1}
                  textAnchor="middle"
                  fill={guestTextColor(guest)}
                  fontSize={6}
                  fontFamily="Cormorant Garamond, serif"
                  style={{ pointerEvents: 'none' }}
                >
                  {line2}
                </text>
              )}
              {tagLabel(guest) && (
                <text
                  x={cx + CHAIR_W / 2}
                  y={chairY - (line2 ? 16 : 9)}
                  textAnchor="middle"
                  fill={guestTextColor(guest)}
                  fontSize={5}
                  fontFamily="Cormorant Garamond, serif"
                  style={{ pointerEvents: 'none' }}
                >
                  {tagLabel(guest)}
                </text>
              )}
            </>
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
      const guestB = guests[guestIdxB];
      const guestNameB = guestB?.firstName.trim() ?? '';
      const chairYB = tableY + tableH + 4;
      const seatNumBot = seatOffset + half + i + 1;
      const [line1B, line2B] = displayLines(guestB);
      chairsBottom.push(
        <g key={`bot-${i}`}>
          <rect
            x={cx}
            y={chairYB}
            width={CHAIR_W}
            height={CHAIR_H}
            rx={CHAIR_H / 2}
            fill={guestFill(guestB)}
            stroke={guestStroke(guestB)}
            strokeWidth={1}
          />
          {menuColor(guestB) !== null && (
            <circle cx={cx + CHAIR_W - 3} cy={chairYB + 3} r={2.5} fill={menuColor(guestB)!} style={{ pointerEvents: 'none' }} />
          )}
          {guestNameB ? (
            <>
              <text
                x={cx + CHAIR_W / 2}
                y={chairYB + CHAIR_H + 8}
                textAnchor="middle"
                fill={guestTextColor(guestB)}
                fontSize={6.5}
                fontFamily="Cormorant Garamond, serif"
                style={{ pointerEvents: 'none' }}
              >
                {line1B}
              </text>
              {line2B && (
                <text
                  x={cx + CHAIR_W / 2}
                  y={chairYB + CHAIR_H + 15}
                  textAnchor="middle"
                  fill={guestTextColor(guestB)}
                  fontSize={6}
                  fontFamily="Cormorant Garamond, serif"
                  style={{ pointerEvents: 'none' }}
                >
                  {line2B}
                </text>
              )}
              {tagLabel(guestB) && (
                <text
                  x={cx + CHAIR_W / 2}
                  y={chairYB + CHAIR_H + (line2B ? 22 : 14)}
                  textAnchor="middle"
                  fill={guestTextColor(guestB)}
                  fontSize={5}
                  fontFamily="Cormorant Garamond, serif"
                  style={{ pointerEvents: 'none' }}
                >
                  {tagLabel(guestB)}
                </text>
              )}
            </>
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
      const guest = guests[guestIdx];
      const guestName = guest?.firstName.trim() ?? '';
      const chairX = tableX - CHAIR_H - 4;
      const seatNumL = seatOffset + i + 1;
      const [line1L, line2L] = displayLines(guest);
      // left chair
      chairsTop.push(
        <g key={`left-${i}`}>
          <rect
            x={chairX}
            y={cy}
            width={CHAIR_H}
            height={CHAIR_W}
            rx={CHAIR_H / 2}
            fill={guestFill(guest)}
            stroke={guestStroke(guest)}
            strokeWidth={1}
          />
          {menuColor(guest) !== null && (
            <circle cx={chairX + CHAIR_H - 3} cy={cy + 3} r={2.5} fill={menuColor(guest)!} style={{ pointerEvents: 'none' }} />
          )}
          {guestName ? (
            <>
              <text
                x={chairX - 3}
                y={cy + CHAIR_W / 2 + (line2L ? -1 : 2.5)}
                textAnchor="end"
                fill={guestTextColor(guest)}
                fontSize={6.5}
                fontFamily="Cormorant Garamond, serif"
                style={{ pointerEvents: 'none' }}
              >
                {line1L}
              </text>
              {line2L && (
                <text
                  x={chairX - 3}
                  y={cy + CHAIR_W / 2 + 6}
                  textAnchor="end"
                  fill={guestTextColor(guest)}
                  fontSize={6}
                  fontFamily="Cormorant Garamond, serif"
                  style={{ pointerEvents: 'none' }}
                >
                  {line2L}
                </text>
              )}
              {tagLabel(guest) && (
                <text
                  x={chairX - 3}
                  y={cy + CHAIR_W / 2 + (line2L ? 13 : 9)}
                  textAnchor="end"
                  fill={guestTextColor(guest)}
                  fontSize={5}
                  fontFamily="Cormorant Garamond, serif"
                  style={{ pointerEvents: 'none' }}
                >
                  {tagLabel(guest)}
                </text>
              )}
            </>
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
      const guestR = guests[guestIdxR];
      const guestNameR = guestR?.firstName.trim() ?? '';
      const chairXR = tableX + tableW + 4;
      const seatNumR = seatOffset + half + i + 1;
      const [line1R, line2R] = displayLines(guestR);
      // right chair
      chairsBottom.push(
        <g key={`right-${i}`}>
          <rect
            x={chairXR}
            y={cy}
            width={CHAIR_H}
            height={CHAIR_W}
            rx={CHAIR_H / 2}
            fill={guestFill(guestR)}
            stroke={guestStroke(guestR)}
            strokeWidth={1}
          />
          {menuColor(guestR) !== null && (
            <circle cx={chairXR + 3} cy={cy + 3} r={2.5} fill={menuColor(guestR)!} style={{ pointerEvents: 'none' }} />
          )}
          {guestNameR ? (
            <>
              <text
                x={chairXR + CHAIR_H + 3}
                y={cy + CHAIR_W / 2 + (line2R ? -1 : 2.5)}
                textAnchor="start"
                fill={guestTextColor(guestR)}
                fontSize={6.5}
                fontFamily="Cormorant Garamond, serif"
                style={{ pointerEvents: 'none' }}
              >
                {line1R}
              </text>
              {line2R && (
                <text
                  x={chairXR + CHAIR_H + 3}
                  y={cy + CHAIR_W / 2 + 6}
                  textAnchor="start"
                  fill={guestTextColor(guestR)}
                  fontSize={6}
                  fontFamily="Cormorant Garamond, serif"
                  style={{ pointerEvents: 'none' }}
                >
                  {line2R}
                </text>
              )}
              {tagLabel(guestR) && (
                <text
                  x={chairXR + CHAIR_H + 3}
                  y={cy + CHAIR_W / 2 + (line2R ? 13 : 9)}
                  textAnchor="start"
                  fill={guestTextColor(guestR)}
                  fontSize={5}
                  fontFamily="Cormorant Garamond, serif"
                  style={{ pointerEvents: 'none' }}
                >
                  {tagLabel(guestR)}
                </text>
              )}
            </>
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
  const { isEditMode, showFullName } = useFloorPlan();
  const occupiedCount = table.guests.filter(g => g.firstName.trim().length > 0).length;

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
        showFullName={showFullName}
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

      {/* Remove button (not for BT, only in edit mode) */}
      {!isBT && isEditMode && (
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
