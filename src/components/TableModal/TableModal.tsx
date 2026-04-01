import React, { useState, useEffect } from 'react';
import { Table, TableSize } from '../../types';
import { useFloorPlan } from '../../context/FloorPlanContext';
import { X } from 'lucide-react';

interface TableModalProps {
  table: Table;
  onClose: () => void;
}

// ─── Mini SVG table preview ───────────────────────────────────────────────────
function TablePreview({ size, guests, isBT, onSeatClick }: {
  size: number;
  guests: string[];
  isBT: boolean;
  onSeatClick: (idx: number) => void;
}) {
  const half = size / 2;
  // BT is vertical tall, regular tables also shown vertically
  const TW = isBT ? 38 : 46;
  const TH = isBT ? 220 : (size === 6 ? 120 : size === 8 ? 145 : 170);
  const CHAIR_W = 28;
  const CHAIR_H = 14;
  const CHAIR_GAP = (TH - half * CHAIR_H) / (half + 1);
  const SVG_W = TW + (CHAIR_W + 8) * 2 + 60; // extra space for names
  const SVG_H = TH + 40;
  const tX = (SVG_W - TW) / 2;
  const tY = 20;
  const occupy = (i: number) => !!guests[i]?.trim();
  const trunc = (s: string) => s.length > 10 ? s.slice(0, 9) + '…' : s;

  return (
    <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} width={SVG_W} height={SVG_H} style={{ display: 'block', margin: '0 auto' }}>
      {/* Table body */}
      <rect
        x={tX} y={tY} width={TW} height={TH} rx={6}
        fill={isBT ? '#c9a84c' : '#d6d6d6'}
        stroke={isBT ? '#e8c97a' : '#a0a0a0'}
        strokeWidth={2}
      />
      <text x={tX + TW / 2} y={tY + 16} textAnchor="middle"
        fill={isBT ? '#1e2a45' : '#333'} fontSize={11} fontWeight="700"
        fontFamily='"Playfair Display", serif'
      >
        {isBT ? 'BT' : String(size) + 'P'}
      </text>

      {/* Left chairs (seats 1..half) */}
      {Array(half).fill(0).map((_, i) => {
        const cy = tY + CHAIR_GAP + i * (CHAIR_H + CHAIR_GAP);
        const idx = i;
        const occ = occupy(idx);
        return (
          <g key={`l${i}`} style={{ cursor: 'pointer' }} onClick={() => onSeatClick(idx)}>
            <rect
              x={tX - CHAIR_W - 6} y={cy} width={CHAIR_W} height={CHAIR_H} rx={CHAIR_H / 2}
              fill={occ ? '#c9a84c' : 'rgba(255,255,255,0.13)'}
              stroke={occ ? '#e8c97a' : 'rgba(255,255,255,0.28)'}
              strokeWidth={1.5}
            />
            <text
              x={tX - CHAIR_W - 6 + CHAIR_W / 2} y={cy + CHAIR_H / 2 + 3.5}
              textAnchor="middle" fontSize={7}
              fill={occ ? '#1e2a45' : 'rgba(255,255,255,0.4)'}
              fontFamily='"Cormorant Garamond", serif'
              style={{ pointerEvents: 'none' }}
            >
              {occ ? '' : idx + 1}
            </text>
            {/* Name label outside */}
            {occ && (
              <text
                x={tX - CHAIR_W - 10} y={cy + CHAIR_H / 2 + 3.5}
                textAnchor="end" fontSize={8} fill="#c9a84c"
                fontFamily='"Cormorant Garamond", serif'
                style={{ pointerEvents: 'none' }}
              >
                {idx + 1}. {trunc(guests[idx])}
              </text>
            )}
          </g>
        );
      })}

      {/* Right chairs (seats half+1..size) */}
      {Array(half).fill(0).map((_, i) => {
        const cy = tY + CHAIR_GAP + i * (CHAIR_H + CHAIR_GAP);
        const idx = half + i;
        const occ = occupy(idx);
        return (
          <g key={`r${i}`} style={{ cursor: 'pointer' }} onClick={() => onSeatClick(idx)}>
            <rect
              x={tX + TW + 6} y={cy} width={CHAIR_W} height={CHAIR_H} rx={CHAIR_H / 2}
              fill={occ ? '#c9a84c' : 'rgba(255,255,255,0.13)'}
              stroke={occ ? '#e8c97a' : 'rgba(255,255,255,0.28)'}
              strokeWidth={1.5}
            />
            <text
              x={tX + TW + 6 + CHAIR_W / 2} y={cy + CHAIR_H / 2 + 3.5}
              textAnchor="middle" fontSize={7}
              fill={occ ? '#1e2a45' : 'rgba(255,255,255,0.4)'}
              fontFamily='"Cormorant Garamond", serif'
              style={{ pointerEvents: 'none' }}
            >
              {occ ? '' : idx + 1}
            </text>
            {occ && (
              <text
                x={tX + TW + 6 + CHAIR_W + 4} y={cy + CHAIR_H / 2 + 3.5}
                textAnchor="start" fontSize={8} fill="#c9a84c"
                fontFamily='"Cormorant Garamond", serif'
                style={{ pointerEvents: 'none' }}
              >
                {idx + 1}. {trunc(guests[idx])}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────
export function TableModal({ table, onClose }: TableModalProps) {
  const { dispatch } = useFloorPlan();
  const [name, setName] = useState(table.name);
  const [size, setSize] = useState<TableSize>(table.size);
  const [guests, setGuests] = useState<string[]>([...table.guests]);
  const [focusedSeat, setFocusedSeat] = useState<number | null>(null);
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  // Sync guests array length when size changes
  useEffect(() => {
    setGuests(prev => Array(size).fill('').map((_, i) => prev[i] ?? ''));
  }, [size]);

  const handleSave = () => {
    dispatch({ type: 'UPDATE_TABLE', payload: { id: table.id, name, size, guests } });
    onClose();
  };

  const isBT = table.id === 'bt';

  const handleSeatClick = (idx: number) => {
    setFocusedSeat(idx);
    setTimeout(() => inputRefs.current[idx]?.focus(), 50);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-[#1e2a45] border border-white/20 rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
        style={{ fontFamily: '"Cormorant Garamond", serif' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <span
              className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-lg font-bold"
              style={{ background: isBT ? '#c9a84c' : '#d6d6d6', color: '#1e2a45', fontFamily: '"Playfair Display", serif' }}
            >
              {String(table.number)}
            </span>
            <h2 className="text-xl text-white font-semibold" style={{ fontFamily: '"Playfair Display", serif' }}>
              {isBT ? 'Brauttisch' : `Tisch ${table.number}`}
            </h2>
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body: two-column layout */}
        <div className="overflow-y-auto flex-1 px-6 py-4">
          <div className="flex flex-col md:flex-row gap-6">

            {/* Left column: visual preview */}
            <div className="flex-shrink-0 flex flex-col items-center">
              <p className="text-white/50 text-xs mb-3 text-center">Klicke auf einen Stuhl, um das Feld zu fokussieren</p>
              <div className="bg-[#162035] rounded-xl p-3 border border-white/10">
                <TablePreview
                  size={size}
                  guests={guests}
                  isBT={isBT}
                  onSeatClick={handleSeatClick}
                />
              </div>
            </div>

            {/* Right column: form */}
            <div className="flex-1 space-y-5">
              {/* Name */}
              <div>
                <label className="block text-white/70 text-sm mb-1">Tischname</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="z.B. Familie Muster"
                  maxLength={60}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder:text-white/30 focus:outline-none focus:border-gold text-base"
                  style={{ fontFamily: '"Cormorant Garamond", serif' }}
                />
              </div>

              {/* Size */}
              {!isBT && (
                <div>
                  <label className="block text-white/70 text-sm mb-2">Tischgröße</label>
                  <div className="flex gap-2">
                    {([6, 8, 10] as TableSize[]).map(s => (
                      <button
                        key={s}
                        onClick={() => setSize(s)}
                        className={`flex-1 py-2 rounded-lg border text-sm font-semibold transition-colors ${
                          size === s
                            ? 'bg-gold text-[#1e2a45] border-gold'
                            : 'bg-white/5 border-white/20 text-white/70 hover:bg-white/10'
                        }`}
                      >
                        {s} Personen
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Guest seats */}
              <div>
                <label className="block text-white/70 text-sm mb-2">Sitzplätze ({size})</label>
                <div className="grid grid-cols-1 gap-1.5">
                  {Array(size).fill(0).map((_, i) => (
                    <div key={i} className={`flex items-center gap-2 rounded-lg px-2 py-0.5 transition-colors ${
                      focusedSeat === i ? 'bg-gold/10 ring-1 ring-gold/40' : ''
                    }`}>
                      <span
                        className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold"
                        style={{
                          background: guests[i]?.trim() ? '#c9a84c' : 'rgba(255,255,255,0.1)',
                          color: guests[i]?.trim() ? '#1e2a45' : 'rgba(255,255,255,0.5)',
                        }}
                      >
                        {i + 1}
                      </span>
                      <input
                        ref={el => { inputRefs.current[i] = el; }}
                        type="text"
                        value={guests[i] ?? ''}
                        onChange={e => {
                          const g = [...guests];
                          g[i] = e.target.value;
                          setGuests(g);
                        }}
                        onFocus={() => setFocusedSeat(i)}
                        onBlur={() => setFocusedSeat(null)}
                        placeholder={`Platz ${i + 1}`}
                        maxLength={50}
                        className="flex-1 bg-white/5 border border-white/15 rounded-md px-2 py-1 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-gold"
                        style={{ fontFamily: '"Cormorant Garamond", serif' }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-white/10 flex justify-end gap-3">
          <button onClick={onClose} className="btn-ghost">Abbrechen</button>
          <button onClick={handleSave} className="btn-gold">Speichern</button>
        </div>
      </div>
    </div>
  );
}
