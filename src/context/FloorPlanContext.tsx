import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
} from 'react';
import { AppState, Action, Zone, ZoneId, Side, Position, TableSize, Table, TableNumber } from '../types';

// ─── Numbering logic ──────────────────────────────────────────────────────────
// Schema:
//  Zone 1 left  → BT (top, fixed), 1 (bottom)
//  Zone 1 right → top=11, bottom=12
//  Zone 2 left  → top=21, bottom=22
//  Zone 2 right → top=31, bottom=32
//  Zone 3 left  → top=41, bottom=42
//  Zone 3 right → top=51, bottom=52
//  Zone 4 left  → top=61, bottom=62
//  Zone 4 right → top=71, bottom=72

function tableNumber(zone: ZoneId, side: Side, position: Position): TableNumber {
  if (zone === 1 && side === 'left' && position === 'top') return 'BT';
  const base: Record<`${ZoneId}-${Side}`, number> = {
    '1-left': -1,  // non-BT slot: -1+2=1
    '1-right': 10, // 11, 12
    '2-left': 20,  // 21, 22
    '2-right': 30, // 31, 32
    '3-left': 40,  // 41, 42
    '3-right': 50, // 51, 52
    '4-left': 60,  // 61, 62
    '4-right': 70, // 71, 72
  };
  const b = base[`${zone}-${side}`];
  return b + (position === 'top' ? 1 : 2);
}

// ─── Initial state ────────────────────────────────────────────────────────────

function makeBT(): Table {
  return {
    id: 'bt',
    number: 'BT',
    name: 'Brauttisch',
    size: 6,
    zone: 1,
    side: 'left',
    position: 'top',
    guests: Array(6).fill(''),
  };
}

const INITIAL_STATE: AppState = {
  zones: [
    { id: 1, tables: [makeBT()] },
    { id: 2, tables: [] },
    { id: 3, tables: [] },
    { id: 4, tables: [] },
  ],
};

// ─── Reducer ─────────────────────────────────────────────────────────────────

function makeId(): string {
  return `t-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function maxTablesForSize(size: TableSize): number {
  return size === 10 ? 1 : 2;
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {

    case 'ADD_TABLE': {
      const { zone, side, position, size } = action.payload;
      return {
        ...state,
        zones: state.zones.map(z => {
          if (z.id !== zone) return z;
          const existing = z.tables.filter(t => t.side === side);
          // prevent exceeding max
          if (existing.length >= maxTablesForSize(size)) return z;
          const num = tableNumber(zone, side, position);
          const newTable: Table = {
            id: makeId(),
            number: num,
            name: '',
            size,
            zone,
            side,
            position,
            guests: Array(size).fill(''),
          };
          return { ...z, tables: [...z.tables, newTable] };
        }),
      };
    }

    case 'REMOVE_TABLE': {
      return {
        ...state,
        zones: state.zones.map(z => ({
          ...z,
          tables: z.tables.filter(t => t.id !== action.payload.id),
        })),
      };
    }

    case 'UPDATE_TABLE': {
      const { id, name, size, guests } = action.payload;
      return {
        ...state,
        zones: state.zones.map(z => ({
          ...z,
          tables: z.tables.map(t => {
            if (t.id !== id) return t;
            // resize guests array
            const newGuests = Array(size).fill('').map((_, i) => guests[i] ?? '');
            return { ...t, name, size, guests: newGuests };
          }),
        })),
      };
    }

    case 'LOAD_STATE':
      return action.payload;

    case 'RESET':
      return INITIAL_STATE;

    default:
      return state;
  }
}

// ─── Context ─────────────────────────────────────────────────────────────────

interface FloorPlanContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  allTables: Table[];
  getZone: (id: ZoneId) => Zone;
  getTablesBySide: (zone: ZoneId, side: Side) => Table[];
  canAddTable: (zone: ZoneId, side: Side, nextPosition: Position) => boolean;
  nextPosition: (zone: ZoneId, side: Side) => Position | null;
}

const FloorPlanContext = createContext<FloorPlanContextValue | null>(null);

const STORAGE_KEY = 'hochzeit-tischplan-v2';

export function FloorPlanProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE, (initial) => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return initial;
      const parsed = JSON.parse(raw) as AppState;
      // ensure BT always exists in zone 1
      const zone1 = parsed.zones.find(z => z.id === 1);
      if (zone1 && !zone1.tables.find(t => t.id === 'bt')) {
        zone1.tables = [makeBT(), ...zone1.tables];
      }
      // fix stale BT size/guests if migrated from older version
      const bt = zone1?.tables.find(t => t.id === 'bt');
      if (bt && bt.size !== 6) {
        bt.size = 6;
        bt.guests = Array(6).fill('').map((_, i) => bt.guests[i] ?? '');
      }
      return parsed;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const allTables = state.zones.flatMap(z => z.tables);

  const getZone = useCallback((id: ZoneId) => state.zones.find(z => z.id === id)!, [state]);

  const getTablesBySide = useCallback((zone: ZoneId, side: Side): Table[] => {
    const z = state.zones.find(z => z.id === zone);
    if (!z) return [];
    return z.tables.filter(t => t.side === side).sort((a, b) =>
      a.position === 'top' ? -1 : 1
    );
  }, [state]);

  const nextPosition = useCallback((zone: ZoneId, side: Side): Position | null => {
    const tables = getTablesBySide(zone, side);
    if (tables.length === 0) return 'top';
    if (tables.length === 1 && tables[0].position === 'top') return 'bottom';
    return null; // full
  }, [getTablesBySide]);

  const canAddTable = useCallback((zone: ZoneId, side: Side, pos: Position): boolean => {
    const tables = getTablesBySide(zone, side);
    if (tables.length >= 2) return false;
    if (pos === 'bottom' && !tables.find(t => t.position === 'top')) return false;
    // also check max by first existing table size
    if (tables.length === 1) {
      const existing = tables[0];
      if (maxTablesForSize(existing.size) < 2) return false;
    }
    return true;
  }, [getTablesBySide]);

  return (
    <FloorPlanContext.Provider value={{ state, dispatch, allTables, getZone, getTablesBySide, canAddTable, nextPosition }}>
      {children}
    </FloorPlanContext.Provider>
  );
}

export function useFloorPlan() {
  const ctx = useContext(FloorPlanContext);
  if (!ctx) throw new Error('useFloorPlan must be used inside FloorPlanProvider');
  return ctx;
}
