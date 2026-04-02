// ─── Core Domain Types ────────────────────────────────────────────────────────

export type TableSize = 6 | 8 | 10;
export type TableNumber = number | 'BT';
export type ZoneId = 1 | 2 | 3 | 4;
export type Side = 'left' | 'right';
export type Position = 'top' | 'bottom';

// Guest tags – each seat can have zero or more
export type GuestTag = 'veggie' | 'gluten' | 'milch' | 'kind' | 'rollstuhl';

export const GUEST_TAGS: { id: GuestTag; label: string; short: string; color: string; textColor: string }[] = [
  { id: 'veggie',    label: 'Veggie',    short: 'V',   color: '#4caf50', textColor: '#fff' },
  { id: 'gluten',    label: 'Gluten',    short: 'GL',  color: '#ff9800', textColor: '#fff' },
  { id: 'milch',     label: 'Milch',     short: 'ML',  color: '#90caf9', textColor: '#1e2a45' },
  { id: 'kind',      label: 'Kind',      short: 'K',   color: '#f48fb1', textColor: '#1e2a45' },
  { id: 'rollstuhl', label: 'Rollstuhl', short: 'RS',  color: '#b39ddb', textColor: '#fff' },
];

// Menu choice (from RSVP)
export type MenuChoice = 'fleisch' | 'fisch' | 'vegetarisch';
export type RsvpStatus = 'attending' | 'not-attending' | 'no-entry';

export const MENU_CHOICES: { id: MenuChoice; label: string; short: string; color: string; textColor: string }[] = [
  { id: 'fleisch',     label: 'Fleisch',     short: 'M',  color: '#c0392b', textColor: '#fff' },
  { id: 'fisch',       label: 'Fisch',       short: 'Fi', color: '#2980b9', textColor: '#fff' },
  { id: 'vegetarisch', label: 'Vegetarisch', short: 'Vg', color: '#27ae60', textColor: '#fff' },
];

export const RSVP_STATUSES: { id: RsvpStatus; label: string; short: string; color: string; textColor: string }[] = [
  { id: 'attending',     label: 'Zugesagt',          short: 'Z', color: '#2d6e3e', textColor: '#fff' },
  { id: 'not-attending', label: 'Abgesagt',           short: 'A', color: '#7a2525', textColor: '#fff' },
  { id: 'no-entry',      label: 'Keine Rückmeldung', short: '?', color: '#3a3a5a', textColor: '#aaa' },
];

export interface GuestInfo {
  firstName: string;
  lastName: string;
  tags: GuestTag[];
  menu?: MenuChoice;
  rsvpStatus?: RsvpStatus;
}

/** Returns the display name based on showFullName flag */
export function guestDisplayName(g: GuestInfo, full: boolean): string {
  if (full) return `${g.firstName} ${g.lastName}`.trim();
  return g.firstName;
}

export interface Table {
  id: string;
  number: TableNumber;
  name: string;
  size: TableSize;
  zone: ZoneId;
  side: Side;
  position: Position;
  guests: GuestInfo[]; // length === size
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
  | { type: 'UPDATE_TABLE'; payload: { id: string; number?: TableNumber; name: string; size: TableSize; guests: GuestInfo[] } }
  | { type: 'LOAD_STATE'; payload: AppState }
  | { type: 'RESET' };
