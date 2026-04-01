import React from 'react';
import { ZoneId, Side, Table, TableSize } from '../../types';
import { useFloorPlan } from '../../context/FloorPlanContext';
import { TableComponent } from './TableComponent';
import { AddTableButton } from './AddTableButton';

// ─── Layout constants ────────────────────────────────────────────────────────
//
// Zone widths:
//   Zone 1:  2 columns  (BT-col + 1 regular col)  → narrower
//   Zone 2:  2 columns  (left + right)
//   Zone 3:  2 columns  (left + right)
//   Zone 4:  2 columns  (left + right)
//
// A "column" is COL_W wide.  Zones are separated by OUTER_AISLE_W (in FloorPlan.tsx).
// Within a zone an inner aisle (INNER_AISLE_W) separates the two columns.

const COL_W        = 110;  // width of one table column
const INNER_AISLE_W = 28;  // aisle between the two columns inside a zone
const ZONE_W       = COL_W * 2 + INNER_AISLE_W;  // = 248
const ZONE_H       = 500;
const AISLE_W      = INNER_AISLE_W; // exported alias used by FloorPlan.tsx

// BT column in Zone 1
const BT_W = 38;
const BT_H = 220;
const BT_COL_W = COL_W;  // BT column has same width as a regular column

const CHAIR_OUTER = 20; // vertical clearance for chair overhang top/bottom

// All regular tables are VERTICAL (narrow × tall), chairs left & right
function tableDims(size: TableSize): { w: number; h: number } {
  const map: Record<TableSize, { w: number; h: number }> = {
    6:  { w: 44, h: 120 },
    8:  { w: 50, h: 145 },
    10: { w: 56, h: 170 },
  };
  return map[size];
}

// ─── Unused interface removed ─────────────────────────────────────────────────

// ─── Single column of 0/1/2 tables ───────────────────────────────────────────
// colX / colY are top-left of the column area (already includes padding).
// The column is COL_W wide and ZONE_H tall.
// "top" slot = upper half, "bottom" slot = lower half.

function ColContent({
  zoneId,
  side,
  colX,
  colW,
  zoneY,
  zoneH,
  onTableClick,
  onTableRemove,
}: {
  zoneId: ZoneId;
  side: Side;
  colX: number;
  colW: number;
  zoneY: number;
  zoneH: number;
  onTableClick: (t: Table) => void;
  onTableRemove: (t: Table) => void;
}) {
  const { getTablesBySide, nextPosition } = useFloorPlan();
  const tables   = getTablesBySide(zoneId, side);
  const topTable = tables.find(t => t.position === 'top');
  const botTable = tables.find(t => t.position === 'bottom');
  const halfH    = zoneH / 2;
  const nextPos  = nextPosition(zoneId, side);

  function renderTable(table: Table, slotY: number, slotH: number) {
    const { w: tW, h: tH } = tableDims(table.size);
    const tx = colX + (colW - tW) / 2;
    const ty = slotY + (slotH - tH) / 2;
    return (
      <TableComponent
        key={table.id}
        table={table}
        x={tx}
        y={ty}
        tableW={tW}
        tableH={tH}
        isVertical
        onClick={onTableClick}
        onRemove={onTableRemove}
      />
    );
  }

  return (
    <>
      {/* Top slot */}
      {topTable
        ? renderTable(topTable, zoneY + CHAIR_OUTER, halfH - CHAIR_OUTER * 2)
        : nextPos === 'top' && (
            <AddTableButton
              zone={zoneId} side={side} position="top"
              x={colX} y={zoneY + halfH / 2 - 20} width={colW}
            />
          )
      }
      {/* Bottom slot (only shown when top is filled or explicitly position=bottom) */}
      {botTable
        ? renderTable(botTable, zoneY + halfH + CHAIR_OUTER, halfH - CHAIR_OUTER * 2)
        : topTable && nextPos === 'bottom' && (
            <AddTableButton
              zone={zoneId} side={side} position="bottom"
              x={colX} y={zoneY + halfH + halfH / 2 - 20} width={colW}
            />
          )
      }
    </>
  );
}

// ─── BT column (Zone 1 left) ──────────────────────────────────────────────────
// Shows BT at top (vertically centred in upper half) and allows one extra
// configurable table in the lower half — but uses side='left' position='bottom'
// in the context so numbering is preserved.

function BtColumn({
  colX,
  colW,
  zoneY,
  zoneH,
  onTableClick,
  onTableRemove,
}: {
  colX: number;
  colW: number;
  zoneY: number;
  zoneH: number;
  onTableClick: (t: Table) => void;
  onTableRemove: (t: Table) => void;
}) {
  const { getTablesBySide, dispatch } = useFloorPlan();
  const leftTables = getTablesBySide(1, 'left');
  const btTable    = leftTables.find(t => t.id === 'bt');
  const extraTable = leftTables.find(t => t.id !== 'bt');
  const halfH = zoneH / 2;

  // BT occupies upper half
  const btX = colX + (colW - BT_W) / 2;
  const btY = zoneY + (halfH - BT_H) / 2;

  // Extra table in lower half
  const renderExtra = () => {
    if (extraTable) {
      const { w: tW, h: tH } = tableDims(extraTable.size);
      const tx = colX + (colW - tW) / 2;
      const ty = zoneY + halfH + ((halfH - tH) / 2);
      return (
        <TableComponent
          table={extraTable}
          x={tx} y={ty}
          tableW={tW} tableH={tH}
          isVertical
          onClick={onTableClick}
          onRemove={onTableRemove}
        />
      );
    }
    // Show "+ Tisch" button in lower half
    return (
      <AddTableButton
        zone={1} side="left" position="bottom"
        x={colX} y={zoneY + halfH + halfH / 2 - 20} width={colW}
      />
    );
  };

  return (
    <>
      {btTable && (
        <TableComponent
          table={btTable}
          x={btX} y={btY}
          tableW={BT_W} tableH={BT_H}
          isVertical
          onClick={onTableClick}
          onRemove={onTableRemove}
        />
      )}
      {renderExtra()}
    </>
  );
}

// ─── Zone SVG ─────────────────────────────────────────────────────────────────

// ─── Zone SVG ─────────────────────────────────────────────────────────────────

interface ZoneSvgProps {
  zoneId: ZoneId;
  x: number;
  y: number;
  onTableClick: (table: Table) => void;
  onTableRemove: (table: Table) => void;
}

export function ZoneSvg({ zoneId, x, y, onTableClick, onTableRemove }: ZoneSvgProps) {
  // Left column starts at x, right column starts at x + COL_W + INNER_AISLE_W
  const col1X = x;
  const col2X = x + COL_W + INNER_AISLE_W;
  const aisleX = x + COL_W;

  if (zoneId === 1) {
    // Left column: BT (top half) + optional extra table (bottom half)
    // Right column: one configurable column (side='right')
    return (
      <>
        <BtColumn
          colX={col1X} colW={COL_W}
          zoneY={y} zoneH={ZONE_H}
          onTableClick={onTableClick} onTableRemove={onTableRemove}
        />
        <ColContent
          zoneId={1} side="right"
          colX={col2X} colW={COL_W}
          zoneY={y} zoneH={ZONE_H}
          onTableClick={onTableClick} onTableRemove={onTableRemove}
        />
      </>
    );
  }

  // Zones 2, 3, 4: two configurable columns
  return (
    <>
      <ColContent
        zoneId={zoneId} side="left"
        colX={col1X} colW={COL_W}
        zoneY={y} zoneH={ZONE_H}
        onTableClick={onTableClick} onTableRemove={onTableRemove}
      />
      <ColContent
        zoneId={zoneId} side="right"
        colX={col2X} colW={COL_W}
        zoneY={y} zoneH={ZONE_H}
        onTableClick={onTableClick} onTableRemove={onTableRemove}
      />
    </>
  );
}

export { ZONE_W, AISLE_W, ZONE_H };

