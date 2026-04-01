import React, { useState } from 'react';
import { FloorPlanProvider, useFloorPlan } from './context/FloorPlanContext';
import { FloorPlan } from './components/FloorPlan/FloorPlan';
import { TableModal } from './components/TableModal/TableModal';
import { GuestList } from './components/GuestList/GuestList';
import { Table } from './types';

type Tab = 'floorplan' | 'guestlist';

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
  const { dispatch } = useFloorPlan();

  const handleTableRemove = (table: Table) => {
    const filledCount = table.guests.filter(g => g.trim()).length;
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

          <button
            onClick={() => setShowResetConfirm(true)}
            className="btn-danger hidden md:inline-flex items-center gap-1 text-xs"
          >
            ↺ Zurücksetzen
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-hidden">
        {tab === 'floorplan' ? (
          <div style={{ height: 'calc(100vh - 73px)' }}>
            <FloorPlan
              onTableClick={setSelectedTable}
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
      {selectedTable && (
        <TableModal
          table={selectedTable}
          onClose={() => setSelectedTable(null)}
        />
      )}

      {removeTarget && (
        <ConfirmDialog
          message={`Dieser Tisch enthält ${removeTarget.guests.filter(g => g.trim()).length} eingetragene Gäste — wirklich entfernen?`}
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
