import React, { useState } from 'react';
import { Location, Universe, VisualReference } from '../types';
import ConfirmationModal from './ConfirmationModal';
import AutoResizeTextarea from './AutoResizeTextarea';
import VisualGallery from './VisualGallery';
import EditableField from './EditableField';

interface Props {
  universe: Universe;
  onUpdate: (updatedUniverse: Universe) => void;
}

const LocationManager: React.FC<Props> = ({ universe, onUpdate }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Location | null>(null);

  const addLocation = () => {
    const newLoc: Location = {
      id: crypto.randomUUID(),
      name: 'Novo Ambiente',
      type: 'Cidade / Base / Planeta',
      description: '',
      images: []
    };
    onUpdate({ ...universe, locations: [...(universe.locations || []), newLoc] });
    setEditingId(newLoc.id);
  };

  const updateLocation = (id: string, data: Partial<Location>) => {
    const updatedLocs = (universe.locations || []).map(l => l.id === id ? { ...l, ...data } : l);
    onUpdate({ ...universe, locations: updatedLocs });
  };

  const executeDelete = () => {
    if (!deleteConfirm) return;
    onUpdate({ ...universe, locations: universe.locations.filter(l => l.id !== deleteConfirm.id) });
    if (editingId === deleteConfirm.id) setEditingId(null);
    setDeleteConfirm(null);
  };

  const activeLoc = (universe.locations || []).find(l => l.id === editingId);

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full min-h-0">
      <ConfirmationModal 
        isOpen={!!deleteConfirm}
        title="🗑️ APAGAR AMBIENTE?"
        message={`Deseja excluir permanentemente o local "${deleteConfirm?.name}"?`}
        onConfirm={executeDelete}
        onCancel={() => setDeleteConfirm(null)}
        confirmText="EXCLUIR"
        cancelText="MANTER"
      />

      <div className="w-full lg:w-72 flex flex-col gap-4 shrink-0">
        <button onClick={addLocation} className="bg-emerald-600 text-white font-bold py-4 rounded-2xl uppercase text-xs active:scale-95 shadow-lg hover:bg-emerald-700 transition-all">
          Novo Lugar
        </button>
        <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto no-scrollbar pb-4">
          {(universe.locations || []).map(loc => (
            <div 
              key={loc.id} 
              onClick={() => setEditingId(loc.id)} 
              className={`group/card p-4 rounded-xl border cursor-pointer transition-all relative shrink-0 w-48 lg:w-full ${editingId === loc.id ? 'bg-emerald-50 border-emerald-200 shadow-sm' : 'bg-white border-slate-200 hover:border-emerald-100'}`}
            >
              <div className="pr-6">
                <h3 className="font-bold text-slate-800 text-sm truncate">{loc.name}</h3>
                <p className="text-[10px] text-emerald-600 uppercase font-bold truncate">{loc.type}</p>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); setDeleteConfirm(loc); }}
                className="absolute top-4 right-3 p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover/card:opacity-100 transition-all"
                title="Excluir Ambiente"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 bg-white rounded-[2rem] border border-slate-200 shadow-sm p-6 md:p-10 overflow-y-auto no-scrollbar space-y-12 pb-10">
        {activeLoc ? (
          <>
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 space-y-2">
                  <EditableField 
                    value={activeLoc.name} 
                    onChange={(val) => updateLocation(activeLoc.id, { name: val })} 
                    className="text-3xl font-black text-slate-800"
                    placeholder="Nome do Ambiente..."
                  />
                  <EditableField 
                    value={activeLoc.type} 
                    onChange={(val) => updateLocation(activeLoc.id, { type: val })} 
                    className="text-sm font-bold text-slate-400 uppercase tracking-widest"
                    placeholder="Tipo (Cidade, Base, Floresta...)"
                    accentColor="emerald"
                  />
                </div>
                <button 
                  onClick={() => setDeleteConfirm(activeLoc)} 
                  className="text-red-400 p-2 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>

              <div className="space-y-4">
                <h4 className="font-black text-[10px] text-slate-400 uppercase tracking-widest">Atmosfera do Lugar</h4>
                <EditableField 
                  type="textarea"
                  value={activeLoc.description} 
                  onChange={(val) => updateLocation(activeLoc.id, { description: val })} 
                  className="w-full p-8 rounded-[2rem] bg-slate-50 text-sm min-h-[300px] leading-relaxed"
                  placeholder="Descreva a atmosfera, clima e segredos deste ambiente..."
                  accentColor="emerald"
                />
              </div>
            </div>

            <div className="pt-8 border-t border-slate-100">
              <VisualGallery 
                images={activeLoc.images || []} 
                onUpdate={(imgs) => updateLocation(activeLoc.id, { images: imgs })}
                accentColor="emerald"
                titleLabel="Referências Visuais do Ambiente"
              />
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-300">
            <svg className="w-12 h-12 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            <p className="text-sm font-black uppercase tracking-widest">Atlas do Universo</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationManager;