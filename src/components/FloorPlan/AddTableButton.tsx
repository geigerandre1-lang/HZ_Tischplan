import React, { useState } from 'react';
import { Table, TableSize } from '../../types';
import { useFloorPlan } from '../../context/FloorPlanContext';
import { ZoneId, Side, Position } from '../../types';

interface AddTableButtonProps {
  zone: ZoneId;
  side: Side;
  position: Position;
  x: number;
  y: number;
  width: number;
}

export function AddTableButton({ zone, side, position, x, y, width }: AddTableButtonProps) {
  const { dispatch, canAddTable, isEditMode } = useFloorPlan();
  const [showPicker, setShowPicker] = useState(false);

  if (!isEditMode) return null;
  if (!canAddTable(zone, side, position)) return null;

  const handleAdd = (size: TableSize) => {
    dispatch({ type: 'ADD_TABLE', payload: { zone, side, position, size } });
    setShowPicker(false);
  };

  const btnW = 90;
  const btnH = 28;
  const bx = x + (width - btnW) / 2;
  const by = y + 8;

  return (
    <g>
      {!showPicker ? (
        <g
          style={{ cursor: 'pointer' }}
          onClick={() => setShowPicker(true)}
        >
          <rect
            x={bx}
            y={by}
            width={btnW}
            height={btnH}
            rx={6}
            fill="rgba(201,168,76,0.18)"
            stroke="#c9a84c"
            strokeWidth={1.5}
            strokeDasharray="4 3"
          />
          <text
            x={bx + btnW / 2}
            y={by + btnH / 2 + 5}
            textAnchor="middle"
            fill="#c9a84c"
            fontSize={12}
            fontFamily="Playfair Display, serif"
          >
            + Tisch
          </text>
        </g>
      ) : (
        <g>
          <rect
            x={bx - 10}
            y={by - 8}
            width={btnW + 20}
            height={58}
            rx={8}
            fill="#1e2a45"
            stroke="#c9a84c"
            strokeWidth={1.5}
          />
          <text x={bx + btnW / 2} y={by + 8} textAnchor="middle" fill="#e8e8e8" fontSize={10} fontFamily="Playfair Display, serif">
            Tischgröße:
          </text>
          {([6, 8, 10] as TableSize[]).map((sz, i) => (
            <g key={sz} style={{ cursor: 'pointer' }} onClick={() => handleAdd(sz)}>
              <rect
                x={bx - 8 + i * 36}
                y={by + 16}
                width={32}
                height={22}
                rx={4}
                fill={sz === 8 ? '#c9a84c' : 'rgba(201,168,76,0.25)'}
                stroke="#c9a84c"
                strokeWidth={1}
              />
              <text
                x={bx - 8 + i * 36 + 16}
                y={by + 32}
                textAnchor="middle"
                fill={sz === 8 ? '#1e2a45' : '#c9a84c'}
                fontSize={11}
                fontFamily="Playfair Display, serif"
                fontWeight="600"
              >
                {sz}
              </text>
            </g>
          ))}
          <g style={{ cursor: 'pointer' }} onClick={() => setShowPicker(false)}>
            <text
              x={bx + btnW / 2}
              y={by + 54}
              textAnchor="middle"
              fill="#888"
              fontSize={9}
              fontFamily="Playfair Display, serif"
            >
              ✕ Abbrechen
            </text>
          </g>
        </g>
      )}
    </g>
  );
}
