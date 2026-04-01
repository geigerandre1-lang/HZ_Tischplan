// ─── Core Domain Types ────────────────────────────────────────────────────────

export type TableSize = 6 | 8 | 10;
export type TableNumber = number | 'BT';
export type ZoneId = 1 | 2 | 3 | 4;
export type Side = 'left' | 'right';
export type Position = 'top' | 'bottom';

export interface Table {
  id: string;
  number: TableNumber;
  name: string;
  size: TableSize;
  zone: ZoneId;
  side: Side;
  position: Position;
  guests: string[]; // length === size, empty string = empty seat
}

export interface Zone {
  id: ZoneId;
  tables: Table[];
}

// ─── State ────────────────────────────────────────────────────────────────────

export interface AppState {
  zones: Zone[];
}

// ─── Actions ─────────────────────────────────────────────────────────────────

export type Action =
  | { type: 'ADD_TABLE'; payload: { zone: ZoneId; side: Side; position: Position; size: TableSize } }
  | { type: 'REMOVE_TABLE'; payload: { id: string } }
  | { type: 'UPDATE_TABLE'; payload: { id: string; name: string; size: TableSize; guests: string[] } }
  | { type: 'LOAD_STATE'; payload: AppState }
  | { type: 'RESET' };
