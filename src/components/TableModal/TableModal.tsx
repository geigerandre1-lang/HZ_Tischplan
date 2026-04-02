import React, { useState, useEffect } from 'react';
import { Table, TableSize, GuestInfo, GuestTag, GUEST_TAGS, MenuChoice, MENU_CHOICES, RsvpStatus, RSVP_STATUSES } from '../../types';
import { useFloorPlan } from '../../context/FloorPlanContext';
import { X } from 'lucide-react';

interface TableModalProps {
  table: Table;
  onClose: () => void;
}

// --- Mini SVG table preview -------------------------------------------------
function TablePreview({ size, guests, isBT, onSeatClick }: {
  size: number;
  guests: GuestInfo[];
  isBT: boolean;
  onSeatClick: (idx: number) => void;
}) {
  const half = size / 2;
  const TW = isBT ? 38 : 46;
  const TH = isBT ? 220 : (size === 6 ? 120 : size === 8 ? 145 : 170);
  const CHAIR_W = 28;
  const CHAIR_H = 14;
  const CHAIR_GAP = (TH - half * CHAIR_H) / (half + 1);
  const SVG_W = TW + (CHAIR_W + 8) * 2 + 60;
  const SVG_H = TH + 40;
  const tX = (SVG_W - TW) / 2;
  const tY = 20;

  const occupy = (i: number) => !!guests[i]?.firstName.trim();
  const trunc = (s: string) => s.length > 10 ? s.slice(0, 9) + '\u2026' : s;
  const chairFill = (i: number) => {
    const g = guests[i];
    if (!g || !g.firstName.trim()) return 'rgba(255,255,255,0.13)';
    if ((g.rsvpStatus ?? 'no-entry') === 'not-attending') return 'rgba(75,75,85,0.50)';
    if ((g.rsvpStatus ?? 'no-entry') === 'no-entry') return 'url(#rsvpHatchPreview)';
    if (g.menu) return MENU_CHOICES.find(m => m.id === g.menu)?.color ?? '#c9a84c';
    if (g.tags.length > 0) return GUEST_TAGS.find(t => t.id === g.tags[0])?.color ?? '#c9a84c';
    return '#c9a84c';
  };
  const chairStroke = (i: number) => {
    const g = guests[i];
    if (!g || !g.firstName.trim()) return 'rgba(255,255,255,0.28)';
    if ((g.rsvpStatus ?? 'no-entry') === 'not-attending') return 'rgba(120,120,130,0.55)';
    if ((g.rsvpStatus ?? 'no-entry') === 'no-entry') return 'rgba(150,150,160,0.45)';
    return '#e8c97a';
  };

  return (
    <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} width={SVG_W} height={SVG_H} style={{ display: 'block', margin: '0 auto' }}>
      <defs>
        <pattern id="rsvpHatchPreview" patternUnits="userSpaceOnUse" width="5" height="5" patternTransform="rotate(45 0 0)">
          <rect width="5" height="5" fill="rgba(90,90,105,0.35)"/>
          <line x1="0" y1="0" x2="0" y2="5" stroke="rgba(180,180,180,0.55)" strokeWidth="1.5"/>
        </pattern>
      </defs>
      <rect x={tX} y={tY} width={TW} height={TH} rx={6}
        fill={isBT ? '#c9a84c' : '#d6d6d6'} stroke={isBT ? '#e8c97a' : '#a0a0a0'} strokeWidth={2} />
      <text x={tX + TW / 2} y={tY + 16} textAnchor="middle"
        fill={isBT ? '#1e2a45' : '#333'} fontSize={11} fontWeight="700"
        fontFamily='"Playfair Display", serif'>
        {isBT ? 'BT' : String(size) + 'P'}
      </text>
      {Array(half).fill(0).map((_, i) => {
        const cy = tY + CHAIR_GAP + i * (CHAIR_H + CHAIR_GAP);
        const idx = i;
        const occ = occupy(idx);
        return (
          <g key={`l${i}`} style={{ cursor: 'pointer' }} onClick={() => onSeatClick(idx)}>
            <rect x={tX - CHAIR_W - 6} y={cy} width={CHAIR_W} height={CHAIR_H} rx={CHAIR_H / 2}
              fill={chairFill(idx)} stroke={chairStroke(idx)} strokeWidth={1.5} />
            <text x={tX - CHAIR_W - 6 + CHAIR_W / 2} y={cy + CHAIR_H / 2 + 3.5}
              textAnchor="middle" fontSize={7} fill={occ ? '#1e2a45' : 'rgba(255,255,255,0.4)'}
              fontFamily='"Cormorant Garamond", serif' style={{ pointerEvents: 'none' }}>
              {occ ? '' : idx + 1}
            </text>
            {occ && (
              <text x={tX - CHAIR_W - 10} y={cy + CHAIR_H / 2 + 3.5}
                textAnchor="end" fontSize={8} fill="#c9a84c"
                fontFamily='"Cormorant Garamond", serif' style={{ pointerEvents: 'none' }}>
                {idx + 1}. {trunc(guests[idx].firstName)}
              </text>
            )}
          </g>
        );
      })}
      {Array(half).fill(0).map((_, i) => {
        const cy = tY + CHAIR_GAP + i * (CHAIR_H + CHAIR_GAP);
        const idx = half + i;
        const occ = occupy(idx);
        return (
          <g key={`r${i}`} style={{ cursor: 'pointer' }} onClick={() => onSeatClick(idx)}>
            <rect x={tX + TW + 6} y={cy} width={CHAIR_W} height={CHAIR_H} rx={CHAIR_H / 2}
              fill={chairFill(idx)} stroke={chairStroke(idx)} strokeWidth={1.5} />
            <text x={tX + TW + 6 + CHAIR_W / 2} y={cy + CHAIR_H / 2 + 3.5}
              textAnchor="middle" fontSize={7} fill={occ ? '#1e2a45' : 'rgba(255,255,255,0.4)'}
              fontFamily='"Cormorant Garamond", serif' style={{ pointerEvents: 'none' }}>
              {occ ? '' : idx + 1}
            </text>
            {occ && (
              <text x={tX + TW + 6 + CHAIR_W + 4} y={cy + CHAIR_H / 2 + 3.5}
                textAnchor="start" fontSize={8} fill="#c9a84c"
                fontFamily='"Cormorant Garamond", serif' style={{ pointerEvents: 'none' }}>
                {idx + 1}. {trunc(guests[idx].firstName)}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// --- Modal ------------------------------------------------------------------
export function TableModal({ table, onClose }: TableModalProps) {
  const { dispatch } = useFloorPlan();
  const [name, setName] = useState(table.name);
  const [number, setNumber] = useState(table.number === 'BT' ? '' : String(table.number));
  const [size, setSize] = useState<TableSize>(table.size);
  const [guests, setGuests] = useState<GuestInfo[]>([...table.guests]);
  const [focusedSeat, setFocusedSeat] = useState<number | null>(null);
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    setGuests(prev => Array(size).fill(null).map((_, i): GuestInfo =>
      prev[i] ?? { firstName: '', lastName: '', tags: [], rsvpStatus: 'no-entry' }
    ));
  }, [size]);

  const handleSave = () => {
    const numVal = table.id === 'bt' ? 'BT' : (parseInt(number, 10) || (table.number as number));
    dispatch({ type: 'UPDATE_TABLE', payload: { id: table.id, number: numVal, name, size, guests } });
    onClose();
  };

  const isBT = table.id === 'bt';
  const handleSeatClick = (idx: number) => {
    setFocusedSeat(idx);
    setTimeout(() => inputRefs.current[idx]?.focus(), 50);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-[#1e2a45] border border-white/20 rounded-xl shadow-2xl w-full max-w-3xl mx-4 max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
        style={{ fontFamily: '"Cormorant Garamond", serif' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-lg font-bold"
              style={{ background: isBT ? '#c9a84c' : '#d6d6d6', color: '#1e2a45', fontFamily: '"Playfair Display", serif' }}>
              {String(table.number)}
            </span>
            <h2 className="text-xl text-white font-semibold" style={{ fontFamily: '"Playfair Display", serif' }}>
              {isBT ? 'Brauttisch' : `Tisch ${table.number}`}
            </h2>
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-white transition-colors"><X size={20} /></button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-4">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Left: SVG preview */}
            <div className="flex-shrink-0 flex flex-col items-center">
              <p className="text-white/50 text-xs mb-3 text-center">Klicke auf einen Stuhl zum Fokussieren</p>
              <div className="bg-[#162035] rounded-xl p-3 border border-white/10">
                <TablePreview size={size} guests={guests} isBT={isBT} onSeatClick={handleSeatClick} />
              </div>
            </div>

            {/* Right: form */}
            <div className="flex-1 space-y-4">
              {/* Table number + name */}
              <div className="flex gap-2">
                {!isBT && (
                  <div className="w-20">
                    <label className="block text-white/70 text-sm mb-1">Tisch-Nr.</label>
                    <input type="number" value={number} onChange={e => setNumber(e.target.value)}
                      min={1} max={99}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder:text-white/30 focus:outline-none focus:border-gold text-base text-center"
                      style={{ fontFamily: '"Playfair Display", serif' }} />
                  </div>
                )}
                <div className="flex-1">
                  <label className="block text-white/70 text-sm mb-1">Tischname</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)}
                    placeholder="z.B. Familie Muster" maxLength={60}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder:text-white/30 focus:outline-none focus:border-gold text-base"
                    style={{ fontFamily: '"Cormorant Garamond", serif' }} />
                </div>
              </div>

              {/* Size */}
              {!isBT && (
                <div>
                  <label className="block text-white/70 text-sm mb-2">Tischgröße</label>
                  <div className="flex gap-2">
                    {([6, 8, 10] as TableSize[]).map(s => (
                      <button key={s} onClick={() => setSize(s)}
                        className={`flex-1 py-2 rounded-lg border text-sm font-semibold transition-colors ${
                          size === s ? 'bg-gold text-[#1e2a45] border-gold' : 'bg-white/5 border-white/20 text-white/70 hover:bg-white/10'
                        }`}>
                        {s} Personen
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Legend */}
              <div className="flex gap-3 flex-wrap">
                {MENU_CHOICES.map(m => (
                  <span key={m.id} className="flex items-center gap-1 text-xs text-white/40">
                    <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: m.color }} />{m.label}
                  </span>
                ))}
                {GUEST_TAGS.map(t => (
                  <span key={t.id} className="flex items-center gap-1 text-xs text-white/40">
                    <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: t.color }} />{t.label}
                  </span>
                ))}
              </div>

              {/* Seats */}
              <div>
                <label className="block text-white/70 text-sm mb-2">Sitzplätze ({size})</label>
                <div className="grid grid-cols-1 gap-1.5">
                  {Array(size).fill(0).map((_, i) => (
                    <div key={i} className={`flex items-center gap-1.5 rounded-lg px-2 py-0.5 transition-colors ${
                      focusedSeat === i ? 'bg-gold/10 ring-1 ring-gold/40' : ''
                    }`}>
                      <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold"
                        style={{
                          background: guests[i]?.firstName.trim() ? '#c9a84c' : 'rgba(255,255,255,0.1)',
                          color: guests[i]?.firstName.trim() ? '#1e2a45' : 'rgba(255,255,255,0.5)',
                        }}>
                        {i + 1}
                      </span>
                      <input ref={el => { inputRefs.current[i] = el; }} type="text"
                        value={guests[i]?.firstName ?? ''}
                        onChange={e => setGuests(prev => prev.map((gi, idx) => idx === i ? { ...gi, firstName: e.target.value, rsvpStatus: gi.rsvpStatus ?? 'no-entry' } : gi))}
                        onFocus={() => setFocusedSeat(i)} onBlur={() => setFocusedSeat(null)}
                        placeholder="Vorname" maxLength={50}
                        className="w-20 bg-white/5 border border-white/15 rounded-md px-2 py-1 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-gold"
                        style={{ fontFamily: '"Cormorant Garamond", serif' }} />
                      <input type="text"
                        value={guests[i]?.lastName ?? ''}
                        onChange={e => setGuests(prev => prev.map((gi, idx) => idx === i ? { ...gi, lastName: e.target.value, rsvpStatus: gi.rsvpStatus ?? 'no-entry' } : gi))}
                        onFocus={() => setFocusedSeat(i)} onBlur={() => setFocusedSeat(null)}
                        placeholder="Nachname" maxLength={50}
                        className="w-24 bg-white/5 border border-white/15 rounded-md px-2 py-1 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-gold"
                        style={{ fontFamily: '"Cormorant Garamond", serif' }} />
                      <div className="flex gap-1">
                        {MENU_CHOICES.map(m => {
                          const active = guests[i]?.menu === m.id;
                          return (
                            <button key={m.id} title={m.label}
                              onClick={() => setGuests(prev => prev.map((gi, idx) =>
                                idx === i ? { ...gi, menu: active ? undefined : m.id as MenuChoice } : gi
                              ))}
                              className="text-[10px] font-bold px-1 rounded"
                              style={{ background: m.color, color: m.textColor, opacity: active ? 1 : 0.28, minWidth: '20px' }}>
                              {m.short}
                            </button>
                          );
                        })}
                      </div>
                      <div className="flex gap-1">
                        {GUEST_TAGS.map(tag => {
                          const active = guests[i]?.tags.includes(tag.id as GuestTag);
                          return (
                            <button key={tag.id} title={tag.label}
                              onClick={() => setGuests(prev => prev.map((gi, idx) => {
                                if (idx !== i) return gi;
                                const has = gi.tags.includes(tag.id as GuestTag);
                                return { ...gi, tags: has ? gi.tags.filter(t => t !== tag.id) : [...gi.tags, tag.id as GuestTag] };
                              }))}
                              className="text-[10px] font-bold px-1 rounded"
                              style={{ background: tag.color, color: tag.textColor, opacity: active ? 1 : 0.28, minWidth: '20px' }}>
                              {tag.short}
                            </button>
                          );
                        })}
                      </div>
                      <div className="flex gap-1">
                        {RSVP_STATUSES.map(rs => {
                          const active = (guests[i]?.rsvpStatus ?? 'no-entry') === rs.id;
                          return (
                            <button key={rs.id} title={rs.label}
                              onClick={() => setGuests(prev => prev.map((gi, idx) =>
                                idx === i ? { ...gi, rsvpStatus: rs.id as RsvpStatus } : gi
                              ))}
                              className="text-[10px] font-bold px-1 rounded"
                              style={{ background: rs.color, color: rs.textColor, opacity: active ? 1 : 0.28, minWidth: '20px' }}>
                              {rs.short}
                            </button>
                          );
                        })}
                      </div>
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
