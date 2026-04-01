import React, { useState, useMemo, useRef } from 'react';
import { useFloorPlan } from '../../context/FloorPlanContext';
import { AppState, Table, TableSize, ZoneId, Side, Position } from '../../types';
import { ChevronDown, ChevronRight, Download, Search, Upload } from 'lucide-react';

type SortKey = 'number' | 'name';
type SortDir = 'asc' | 'desc';

export function GuestList({ onTableClick }: { onTableClick: (t: Table) => void }) {
  const { allTables, dispatch, isEditMode } = useFloorPlan();
  const [sortKey, setSortKey] = useState<SortKey>('number');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sorted = useMemo(() => {
    return [...allTables].sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'number') {
        const an = a.number === 'BT' ? -1 : (a.number as number);
        const bn = b.number === 'BT' ? -1 : (b.number as number);
        cmp = an - bn;
      } else {
        cmp = (a.name || '').localeCompare(b.name || '', 'de');
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [allTables, sortKey, sortDir]);

  const searchResult = useMemo(() => {
    if (!search.trim()) return null;
    const q = search.trim().toLowerCase();
    const results: { table: Table; seatIndex: number; guestName: string }[] = [];
    allTables.forEach(t => {
      t.guests.forEach((g, i) => {
        if (g.trim().toLowerCase().includes(q)) {
          results.push({ table: t, seatIndex: i + 1, guestName: g });
        }
      });
    });
    return results;
  }, [search, allTables]);

  const toggleExpand = (id: string) => {
    setExpanded(prev => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  // ── CSV Export ────────────────────────────────────────────────────────────
  const exportCSV = () => {
    const rows = [['Tischnummer', 'Tischname', 'Tischgroesse', 'Zone', 'Seite', 'Position', 'Sitzplatz', 'Gast']];
    sorted.forEach(t => {
      t.guests.forEach((g, i) => {
        rows.push([
          String(t.number),
          t.name,
          String(t.size),
          String(t.zone),
          t.side,
          t.position,
          String(i + 1),
          g,
        ]);
      });
    });
    const csv = rows.map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Hochzeitstischplan.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── CSV Import ────────────────────────────────────────────────────────────
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    setImportSuccess(null);
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = (ev.target?.result as string).replace(/^\uFEFF/, '');
        const lines = text.split(/\r?\n/).filter(l => l.trim());
        if (lines.length < 2) throw new Error('Leere oder ungültige CSV-Datei.');

        // Parse header
        const header = parseCSVLine(lines[0]).map(h => h.trim().toLowerCase());
        const col = (name: string) => header.indexOf(name);
        const iNum  = col('tischnummer');
        const iName = col('tischname');
        const iSize = col('tischgroesse');
        const iZone = col('zone');
        const iSide = col('seite');
        const iPos  = col('position');
        const iSeat = col('sitzplatz');
        const iGuest = col('gast');
        if ([iNum, iName, iSize, iZone, iSide, iPos, iSeat, iGuest].some(x => x === -1)) {
          throw new Error('CSV-Format ungültig. Benötigte Spalten: Tischnummer, Tischname, Tischgroesse, Zone, Seite, Position, Sitzplatz, Gast.');
        }

        // Group rows by Tischnummer
        const tableMap = new Map<string, { num: string; name: string; size: number; zone: number; side: string; pos: string; guests: Map<number, string> }>();
        for (let i = 1; i < lines.length; i++) {
          const cols = parseCSVLine(lines[i]);
          if (cols.length < 8) continue;
          const num   = cols[iNum].trim();
          const name  = cols[iName].trim();
          const size  = parseInt(cols[iSize].trim(), 10);
          const zone  = parseInt(cols[iZone].trim(), 10);
          const side  = cols[iSide].trim();
          const pos   = cols[iPos].trim();
          const seat  = parseInt(cols[iSeat].trim(), 10);
          const guest = cols[iGuest].trim();
          if (!tableMap.has(num)) {
            tableMap.set(num, { num, name, size, zone, side, pos, guests: new Map() });
          }
          tableMap.get(num)!.guests.set(seat, guest);
        }

        // Build new AppState
        const VALID_SIZES: TableSize[] = [6, 8, 10];
        const newZones: AppState['zones'] = [1, 2, 3, 4].map(id => ({ id: id as ZoneId, tables: [] }));

        let makeId = () => `t-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

        tableMap.forEach(({ num, name, size, zone, side, pos, guests }) => {
          const tableSize: TableSize = VALID_SIZES.includes(size as TableSize) ? (size as TableSize) : 8;
          const zoneId = ([1, 2, 3, 4].includes(zone) ? zone : 1) as ZoneId;
          const tableSide: Side = side === 'right' ? 'right' : 'left';
          const tablePos: Position = pos === 'bottom' ? 'bottom' : 'top';
          const isBT = num === 'BT';
          const guestsArr: string[] = Array(tableSize).fill('');
          guests.forEach((g, seat) => {
            if (seat >= 1 && seat <= tableSize) guestsArr[seat - 1] = g;
          });

          const tableObj: Table = {
            id: isBT ? 'bt' : makeId(),
            number: isBT ? 'BT' : (parseInt(num, 10) || 0),
            name,
            size: isBT ? (VALID_SIZES.includes(tableSize) ? tableSize : 6) : tableSize,
            zone: zoneId,
            side: tableSide,
            position: tablePos,
            guests: guestsArr,
          };

          const zoneEntry = newZones.find(z => z.id === zoneId);
          if (zoneEntry) zoneEntry.tables.push(tableObj);
        });

        // Ensure BT exists in zone 1
        const zone1 = newZones.find(z => z.id === 1)!;
        if (!zone1.tables.find(t => t.id === 'bt')) {
          zone1.tables.unshift({ id: 'bt', number: 'BT', name: 'Brauttisch', size: 6, zone: 1, side: 'left', position: 'top', guests: Array(6).fill('') });
        }

        dispatch({ type: 'LOAD_STATE', payload: { zones: newZones } });
        setImportSuccess(`Import erfolgreich: ${tableMap.size} Tische geladen.`);
      } catch (err) {
        setImportError(err instanceof Error ? err.message : 'Unbekannter Fehler.');
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file, 'utf-8');
  };

  function parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') { cur += '"'; i++; }
        else inQuotes = !inQuotes;
      } else if (ch === ',' && !inQuotes) {
        result.push(cur); cur = '';
      } else {
        cur += ch;
      }
    }
    result.push(cur);
    return result;
  }

  const SortArrow = ({ col }: { col: SortKey }) =>
    sortKey === col ? (
      <span className="ml-1 text-gold">{sortDir === 'asc' ? '↑' : '↓'}</span>
    ) : (
      <span className="ml-1 text-white/20">↕</span>
    );

  const totalGuests = allTables.reduce((s, t) => s + t.guests.filter(g => g.trim()).length, 0);

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto" style={{ fontFamily: '"Cormorant Garamond", serif' }}>
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Gast suchen…"
            className="w-full bg-white/8 border border-white/15 rounded-lg pl-9 pr-3 py-2 text-white placeholder:text-white/30 focus:outline-none focus:border-gold text-base"
            style={{ background: 'rgba(255,255,255,0.06)' }}
          />
        </div>
        <button onClick={exportCSV} className="btn-gold flex items-center gap-2">
          <Download size={14} /> CSV Export
        </button>
        {isEditMode && (
          <>
            <button onClick={() => fileInputRef.current?.click()} className="btn-ghost flex items-center gap-2">
              <Upload size={14} /> CSV Import
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={handleImport}
            />
          </>
        )}
      </div>
      {importError && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-900/40 border border-red-500/40 text-red-300 text-sm">
          ⚠ {importError}
        </div>
      )}
      {importSuccess && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-green-900/40 border border-green-500/40 text-green-300 text-sm">
          ✓ {importSuccess}
        </div>
      )}

      {/* Search results */}
      {search.trim() && searchResult && (
        <div className="mb-5">
          {searchResult.length === 0 ? (
            <p className="text-white/50 italic text-sm">Kein Gast gefunden.</p>
          ) : (
            <div className="bg-white/5 rounded-xl border border-white/10 p-4 space-y-2">
              <p className="text-white/70 text-sm mb-3">{searchResult.length} Treffer:</p>
              {searchResult.map((r, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between hover:bg-white/5 rounded px-2 py-1 cursor-pointer"
                  onClick={() => isEditMode && onTableClick(r.table)}
                >
                  <span className="text-white font-medium">{r.guestName}</span>
                  <span className="text-white/50 text-sm">
                    Tisch {r.table.number} {r.table.name ? `(${r.table.name})` : ''} · Platz {r.seatIndex}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="flex gap-4 mb-4 text-sm text-white/50">
        <span>{sorted.length} Tische</span>
        <span>·</span>
        <span>{totalGuests} Gäste eingetragen</span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-white/5 border-b border-white/10">
              <th
                className="px-4 py-3 text-white/60 font-semibold text-sm cursor-pointer hover:text-gold transition-colors select-none"
                onClick={() => toggleSort('number')}
                style={{ fontFamily: '"Playfair Display", serif' }}
              >
                Nr. <SortArrow col="number" />
              </th>
              <th
                className="px-4 py-3 text-white/60 font-semibold text-sm cursor-pointer hover:text-gold transition-colors select-none"
                onClick={() => toggleSort('name')}
                style={{ fontFamily: '"Playfair Display", serif' }}
              >
                Tischname <SortArrow col="name" />
              </th>
              <th className="px-4 py-3 text-white/60 font-semibold text-sm" style={{ fontFamily: '"Playfair Display", serif' }}>
                Gäste
              </th>
              <th className="px-4 py-3 text-white/60 font-semibold text-sm" style={{ fontFamily: '"Playfair Display", serif' }}>
                Gästeliste
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((table, idx) => {
              const isOpen = expanded.has(table.id);
              const occupied = table.guests.filter(g => g.trim()).length;
              const isBT = table.id === 'bt';

              return (
                <React.Fragment key={table.id}>
                  <tr
                    className={`border-b border-white/5 hover:bg-white/4 transition-colors ${idx % 2 === 0 ? 'bg-white/2' : ''}`}
                    style={{ background: idx % 2 === 0 ? 'rgba(255,255,255,0.02)' : undefined }}
                  >
                    {/* Number */}
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex items-center justify-center w-9 h-9 rounded-lg font-bold text-sm"
                        style={{
                          background: isBT ? '#c9a84c' : '#d6d6d6',
                          color: '#1e2a45',
                          fontFamily: '"Playfair Display", serif',
                        }}
                      >
                        {String(table.number)}
                      </span>
                    </td>
                    {/* Name */}
                    <td className="px-4 py-3">
                      <button
                        className={`text-white text-left transition-colors ${isEditMode ? 'hover:text-gold cursor-pointer' : 'cursor-default'}`}
                        onClick={() => isEditMode && onTableClick(table)}
                        disabled={!isEditMode}
                      >
                        {table.name || <span className="text-white/30 italic">Kein Name</span>}
                      </button>
                    </td>
                    {/* Count */}
                    <td className="px-4 py-3">
                      <span style={{ color: occupied === table.size ? '#c9a84c' : 'rgba(255,255,255,0.7)' }}>
                        {occupied}/{table.size}
                      </span>
                    </td>
                    {/* Expand toggle */}
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleExpand(table.id)}
                        className="flex items-center gap-1 text-white/50 hover:text-white transition-colors text-sm"
                      >
                        {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        {isOpen ? 'Einklappen' : 'Liste'}
                      </button>
                    </td>
                  </tr>
                  {isOpen && (
                    <tr>
                      <td colSpan={4} className="px-4 py-2 bg-white/3" style={{ background: 'rgba(255,255,255,0.03)' }}>
                        <ul className="grid grid-cols-2 md:grid-cols-3 gap-1 py-2">
                          {table.guests.map((g, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm">
                              <span
                                className="w-5 h-5 flex-shrink-0 flex items-center justify-center rounded-full text-xs font-bold"
                                style={{
                                  background: g.trim() ? '#c9a84c' : 'rgba(255,255,255,0.1)',
                                  color: g.trim() ? '#1e2a45' : 'rgba(255,255,255,0.3)',
                                }}
                              >
                                {i + 1}
                              </span>
                              <span className={g.trim() ? 'text-white' : 'text-white/25 italic'}>
                                {g.trim() || 'Frei'}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
