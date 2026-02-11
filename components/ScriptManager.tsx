import React, { useState } from 'react';
import { Script, Scene, DialogueEntry, Universe, VisualReference } from '../types';
import ConfirmationModal from './ConfirmationModal';
import AutoResizeTextarea from './AutoResizeTextarea';
import VisualGallery from './VisualGallery';
import EditableField from './EditableField';

interface Props {
  universe: Universe;
  onUpdate: (updatedUniverse: Universe) => void;
}

const ScriptManager: React.FC<Props> = ({ universe, onUpdate }) => {
  const [activeScriptId, setActiveScriptId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'script' | 'scene' | 'dialogue', id: string, name?: string, parentId?: string, sceneId?: string } | null>(null);

  const addScript = () => {
    const newScript: Script = { id: crypto.randomUUID(), title: 'Novo Capítulo', summary: '', scenes: [], images: [] };
    onUpdate({ ...universe, scripts: [...universe.scripts, newScript] });
    setActiveScriptId(newScript.id);
  };

  const updateScript = (id: string, data: Partial<Script>) => {
    const updated = universe.scripts.map(s => s.id === id ? { ...s, ...data } : s);
    onUpdate({ ...universe, scripts: updated });
  };

  const executeDelete = () => {
    if (!deleteConfirm) return;
    if (deleteConfirm.type === 'script') {
      onUpdate({ ...universe, scripts: universe.scripts.filter(s => s.id !== deleteConfirm.id) });
      if (activeScriptId === deleteConfirm.id) setActiveScriptId(null);
    } else if (deleteConfirm.type === 'scene' && deleteConfirm.parentId) {
      const script = universe.scripts.find(s => s.id === deleteConfirm.parentId);
      if (script) {
        const updatedScenes = script.scenes.filter(sc => sc.id !== deleteConfirm.id);
        updateScript(script.id, { scenes: updatedScenes });
      }
    } else if (deleteConfirm.type === 'dialogue' && deleteConfirm.parentId && deleteConfirm.sceneId) {
      const script = universe.scripts.find(s => s.id === deleteConfirm.parentId);
      if (script) {
        const updatedScenes = script.scenes.map(sc => 
          sc.id === deleteConfirm.sceneId ? { 
            ...sc, 
            dialogues: sc.dialogues.filter(d => d.id !== deleteConfirm.id) 
          } : sc
        );
        updateScript(script.id, { scenes: updatedScenes });
      }
    }
    setDeleteConfirm(null);
  };

  const addScene = (scriptId: string) => {
    const script = universe.scripts.find(s => s.id === scriptId);
    if (!script) return;
    const newScene: Scene = { 
      id: crypto.randomUUID(), 
      title: 'COMPOSIÇÃO DO ROTEIRO',
      description: '', 
      dialogues: [{ id: crypto.randomUUID(), speaker: '', text: '' }] 
    };
    updateScript(scriptId, { scenes: [...script.scenes, newScene] });
  };

  const addDialogue = (scriptId: string, sceneId: string) => {
    const script = universe.scripts.find(s => s.id === scriptId);
    if (!script) return;
    const updatedScenes = script.scenes.map(sc => 
      sc.id === sceneId ? { 
        ...sc, 
        dialogues: [...sc.dialogues, { id: crypto.randomUUID(), speaker: '', text: '' }] 
      } : sc
    );
    updateScript(scriptId, { scenes: updatedScenes });
  };

  const activeScript = universe.scripts.find(s => s.id === activeScriptId);

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full min-h-0">
      <ConfirmationModal 
        isOpen={!!deleteConfirm}
        title={deleteConfirm?.type === 'script' ? "🗑️ EXCLUIR ROTEIRO?" : deleteConfirm?.type === 'scene' ? "REMOVER CENA?" : "REMOVER DIÁLOGO?"}
        message={`Deseja excluir permanentemente ${deleteConfirm?.type === 'script' ? `o roteiro "${deleteConfirm.name}"` : 'este item'}?`}
        onConfirm={executeDelete}
        onCancel={() => setDeleteConfirm(null)}
        confirmText="EXCLUIR"
        cancelText="CANCELAR"
      />

      <div className="w-full lg:w-72 flex flex-col gap-4 shrink-0">
        <button onClick={addScript} className="bg-indigo-600 text-white font-bold py-4 rounded-2xl uppercase text-xs active:scale-95 shadow-lg hover:bg-indigo-700 transition-all">
          Novo Roteiro
        </button>
        <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto no-scrollbar pb-4">
          {universe.scripts.map(s => (
            <div 
              key={s.id} 
              onClick={() => setActiveScriptId(s.id)} 
              className={`group/card p-4 rounded-xl border cursor-pointer transition-all relative shrink-0 w-48 lg:w-full ${activeScriptId === s.id ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'bg-white border-slate-200 hover:border-indigo-100'}`}
            >
              <div className="pr-6">
                <h3 className="font-bold text-slate-800 text-sm truncate">{s.title}</h3>
                <p className="text-[10px] text-slate-500 font-bold">{s.scenes.length} CENAS</p>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); setDeleteConfirm({ type: 'script', id: s.id, name: s.title }); }}
                className="absolute top-4 right-3 p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover/card:opacity-100 transition-all"
                title="Excluir Roteiro"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 space-y-6 min-w-0 overflow-y-auto no-scrollbar pb-10">
        {activeScript ? (
          <div className="flex flex-col gap-6">
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col overflow-hidden shrink-0">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <EditableField 
                  value={activeScript.title} 
                  onChange={(val) => updateScript(activeScript.id, { title: val })} 
                  className="text-xl font-black text-slate-800"
                  placeholder="Título do Capítulo..."
                />
                <button 
                  onClick={() => setDeleteConfirm({ type: 'script', id: activeScript.id, name: activeScript.title })} 
                  className="text-red-400 p-2 hover:bg-red-50 rounded-xl transition-colors shrink-0"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>

              <div className="p-4 md:p-8 space-y-12 bg-slate-50/50">
                {activeScript.scenes.map((scene, idx) => (
                  <div key={scene.id} className="relative bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 group animate-in slide-in-from-bottom-2">
                    <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-50">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="bg-indigo-600 text-white px-4 py-2 rounded-2xl text-[10px] font-black shadow-lg shadow-indigo-100 uppercase tracking-widest shrink-0">
                          QUADRO {idx + 1}
                        </div>
                        <div className="h-4 w-[1px] bg-slate-200 shrink-0"></div>
                        <div className="flex-1">
                          <EditableField 
                            value={scene.title || 'COMPOSIÇÃO DO ROTEIRO'} 
                            onChange={(val) => {
                              const updated = activeScript.scenes.map(sc => sc.id === scene.id ? { ...sc, title: val } : sc);
                              updateScript(activeScript.id, { scenes: updated });
                            }} 
                            className="text-[10px] font-bold text-slate-400 uppercase tracking-tight"
                            placeholder="Título do Quadro..."
                          />
                        </div>
                      </div>
                      <button 
                        onClick={() => setDeleteConfirm({ type: 'scene', id: scene.id, parentId: activeScript.id })} 
                        className="text-red-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-2 hover:bg-red-50 rounded-xl shrink-0"
                        title="Excluir Quadro"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                    
                    <div className="space-y-8">
                      <div className="space-y-1 border-b border-slate-50 pb-6">
                        <EditableField 
                          label="Ação / Descrição Visual"
                          type="textarea"
                          value={scene.description} 
                          onChange={(val) => {
                            const updated = activeScript.scenes.map(sc => sc.id === scene.id ? { ...sc, description: val } : sc);
                            updateScript(activeScript.id, { scenes: updated });
                          }} 
                          className="text-xs font-bold text-slate-600 leading-relaxed"
                          placeholder="Descreva o cenário e a ação principal deste quadro..."
                        />
                      </div>

                      <div className="space-y-6">
                        <div className="flex justify-between items-center px-2">
                           <h5 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Diálogos do Quadro</h5>
                        </div>
                        
                        <div className="space-y-4">
                          {(scene.dialogues || []).map((dialogue) => (
                            <div key={dialogue.id} className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 rounded-3xl bg-slate-50/50 border border-slate-100 relative group/dialogue transition-all hover:bg-slate-50">
                              <div className="space-y-1">
                                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Personagem</label>
                                <select 
                                  value={dialogue.speaker} 
                                  onChange={(e) => {
                                    const updated = activeScript.scenes.map(sc => 
                                      sc.id === scene.id ? { 
                                        ...sc, 
                                        dialogues: sc.dialogues.map(d => d.id === dialogue.id ? { ...d, speaker: e.target.value } : d) 
                                      } : sc
                                    );
                                    updateScript(activeScript.id, { scenes: updated });
                                  }} 
                                  className="w-full bg-white border border-slate-100 rounded-xl p-2.5 text-[10px] font-bold outline-none cursor-pointer hover:border-indigo-200 transition-colors"
                                >
                                  <option value="">Quem fala?</option>
                                  {universe.characters.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                  <option value="Narrador">Narrador</option>
                                </select>
                              </div>
                              
                              <div className="sm:col-span-3 space-y-1 pr-8">
                                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">FALA / DIÁLOGO</label>
                                <EditableField 
                                  type="textarea"
                                  value={dialogue.text} 
                                  onChange={(val) => {
                                    const updated = activeScript.scenes.map(sc => 
                                      sc.id === scene.id ? { 
                                        ...sc, 
                                        dialogues: sc.dialogues.map(d => d.id === dialogue.id ? { ...d, text: val } : d) 
                                      } : sc
                                    );
                                    updateScript(activeScript.id, { scenes: updated });
                                  }} 
                                  className="w-full text-[11px] min-h-[60px] leading-relaxed" 
                                  placeholder="Digite a fala do personagem..."
                                />
                              </div>

                              <button 
                                onClick={() => setDeleteConfirm({ type: 'dialogue', id: dialogue.id, parentId: activeScript.id, sceneId: scene.id })}
                                className="absolute top-2 right-2 p-1.5 text-slate-300 hover:text-red-500 opacity-0 group-dialogue/dialogue:opacity-100 transition-opacity"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                              </button>
                            </div>
                          ))}
                        </div>

                        <button 
                          onClick={() => addDialogue(activeScript.id, scene.id)}
                          className="w-full py-3 bg-white border border-dashed border-indigo-100 rounded-2xl text-[9px] font-black text-indigo-400 uppercase tracking-widest hover:bg-indigo-50/30 hover:border-indigo-300 transition-all flex items-center justify-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                          Adicionar Novo Diálogo neste Quadro
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                <button onClick={() => addScene(activeScript.id)} className="w-full py-6 bg-indigo-600 text-white rounded-[2rem] font-black text-xs uppercase shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:scale-[1.01] transition-all active:scale-100 flex items-center justify-center gap-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Adicionar Próximo Quadro (Cena)
                </button>
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-8">
              <VisualGallery 
                images={activeScript.images || []} 
                onUpdate={(imgs) => updateScript(activeScript.id, { images: imgs })}
                titleLabel="Referências e Storyboard do Capítulo"
              />
            </div>
          </div>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center text-slate-300 border-2 border-dashed border-slate-100 rounded-[2.5rem]">
            <svg className="w-12 h-12 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            <p className="text-xs font-bold uppercase tracking-widest">Selecione um roteiro para editar</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScriptManager;