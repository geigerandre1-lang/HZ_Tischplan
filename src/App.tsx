import React, { useState, useRef } from 'react';
import { FloorPlanProvider, useFloorPlan } from './context/FloorPlanContext';
import { FloorPlan } from './components/FloorPlan/FloorPlan';
import { TableModal } from './components/TableModal/TableModal';
import { GuestList } from './components/GuestList/GuestList';
import { Table } from './types';

const EDIT_PASSWORD = 'Hochzeit2026';

type Tab = 'floorplan' | 'guestlist';

function PasswordModal({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) {
  const [pw, setPw] = useState('');
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pw === EDIT_PASSWORD) {
      onSuccess();
    } else {
      setError(true);
      setPw('');
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div
        className="bg-[#1e2a45] border border-white/20 rounded-xl shadow-2xl p-6 max-w-xs w-full mx-4"
        style={{ fontFamily: '"Cormorant Garamond", serif' }}
      >
        <h2 className="text-white text-xl font-semibold mb-1" style={{ fontFamily: '"Playfair Display", serif' }}>🔐 Bearbeiten</h2>
        <p className="text-white/50 text-sm mb-4">Passwort eingeben um den Bearbeitungsmodus zu aktivieren.</p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            ref={inputRef}
            autoFocus
            type="password"
            value={pw}
            onChange={e => { setPw(e.target.value); setError(false); }}
            placeholder="Passwort"
            className={`w-full bg-white/10 border rounded-lg px-3 py-2 text-white placeholder:text-white/30 focus:outline-none text-base ${
              error ? 'border-red-400 focus:border-red-400' : 'border-white/20 focus:border-gold'
            }`}
            style={{ fontFamily: '"Cormorant Garamond", serif' }}
          />
          {error && <p className="text-red-400 text-sm">Falsches Passwort</p>}
          <div className="flex justify-end gap-3 pt-1">
            <button type="button" onClick={onCancel} className="btn-ghost">Abbrechen</button>
            <button type="submit" className="btn-gold">Entsperren</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ConfirmDialog({ message, onConfirm, onCancel }: { message: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#1e2a45] border border-white/20 rounded-xl shadow-2xl p-6 max-w-sm mx-4">
        <p className="text-white mb-6" style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '1.1rem' }}>{message}</p>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="btn-ghost">Abbrechen</button>
          <button onClick={onConfirm} className="btn-danger">Ja, löschen</button>
        </div>
      </div>
    </div>
  );
}

function AppInner() {
  const [tab, setTab] = useState<Tab>('floorplan');
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [removeTarget, setRemoveTarget] = useState<Table | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const { dispatch, isEditMode, setEditMode } = useFloorPlan();

  const handleTableRemove = (table: Table) => {
    if (!isEditMode) return;
    const filledCount = table.guests.filter(g => g.firstName.trim()).length;
    if (filledCount > 0) {
      setRemoveTarget(table);
    } else {
      dispatch({ type: 'REMOVE_TABLE', payload: { id: table.id } });
    }
  };

  const confirmRemove = () => {
    if (removeTarget) {
      dispatch({ type: 'REMOVE_TABLE', payload: { id: removeTarget.id } });
      setRemoveTarget(null);
    }
  };

  const confirmReset = () => {
    dispatch({ type: 'RESET' });
    setShowResetConfirm(false);
  };

  const handleTableClick = (table: Table) => {
    if (!isEditMode) return;
    setSelectedTable(table);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#1e2a45' }}>
      {/* Header */}
      <header className="flex items-center justify-between px-4 md:px-8 py-4 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center gap-3">
          <span style={{ fontSize: '1.5rem' }}>💍</span>
          <h1 style={{ fontFamily: '"Playfair Display", serif', fontSize: '1.5rem', fontWeight: 700, color: '#c9a84c', letterSpacing: '0.03em' }}>
            Hochzeitstischplan
          </h1>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          {/* Edit mode toggle */}
          <button
            onClick={() => isEditMode ? setEditMode(false) : setShowPasswordModal(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-semibold transition-colors ${
              isEditMode
                ? 'bg-gold/20 border-gold text-gold hover:bg-gold/30'
                : 'bg-white/5 border-white/20 text-white/60 hover:bg-white/10 hover:text-white'
            }`}
            title={isEditMode ? 'Bearbeitungsmodus beenden' : 'Bearbeitungsmodus aktivieren'}
          >
            {isEditMode ? '🔓 Bearbeiten' : '🔒 Ansicht'}
          </button>

          {/* Tabs */}
          <div className="flex rounded-lg overflow-hidden border border-white/15">
            <button
              onClick={() => setTab('floorplan')}
              className={`px-3 py-1.5 text-sm transition-colors ${tab === 'floorplan' ? 'bg-gold text-[#1e2a45] font-semibold' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
            >
              Saalplan
            </button>
            <button
              onClick={() => setTab('guestlist')}
              className={`px-3 py-1.5 text-sm transition-colors ${tab === 'guestlist' ? 'bg-gold text-[#1e2a45] font-semibold' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
            >
              Gästeliste
            </button>
          </div>

          {isEditMode && (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="btn-danger hidden md:inline-flex items-center gap-1 text-xs"
            >
              ↺ Zurücksetzen
            </button>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-hidden">
        {tab === 'floorplan' ? (
          <div style={{ height: 'calc(100vh - 73px)' }}>
            <FloorPlan
              onTableClick={handleTableClick}
              onTableRemove={handleTableRemove}
            />
          </div>
        ) : (
          <div className="h-full overflow-y-auto">
            <GuestList onTableClick={(t) => { setSelectedTable(t); setTab('floorplan'); }} />
          </div>
        )}
      </main>

      {/* Modals */}
      {showPasswordModal && (
        <PasswordModal
          onSuccess={() => { setEditMode(true); setShowPasswordModal(false); }}
          onCancel={() => setShowPasswordModal(false)}
        />
      )}

      {selectedTable && (
        <TableModal
          table={selectedTable}
          onClose={() => setSelectedTable(null)}
        />
      )}

      {removeTarget && (
        <ConfirmDialog
          message={`Dieser Tisch enthält ${removeTarget.guests.filter(g => g.firstName.trim()).length} eingetragene Gäste — wirklich entfernen?`}
          onConfirm={confirmRemove}
          onCancel={() => setRemoveTarget(null)}
        />
      )}

      {showResetConfirm && (
        <ConfirmDialog
          message="Alle Daten zurücksetzen? Dies kann nicht rückgängig gemacht werden."
          onConfirm={confirmReset}
          onCancel={() => setShowResetConfirm(false)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <FloorPlanProvider>
      <AppInner />
    </FloorPlanProvider>
  );
}
