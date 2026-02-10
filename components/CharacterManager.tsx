
import React, { useState } from 'react';
import { Character, CharacterTrait, CharacterSection, Universe, VisualReference } from '../types';
import { suggestCharacterTraits, generateCharacterBackstory } from '../geminiService';
import ConfirmationModal from './ConfirmationModal';
import AutoResizeTextarea from './AutoResizeTextarea';
import VisualGallery from './VisualGallery';
import EditableField from './EditableField';

interface Props {
  universe: Universe;
  onUpdate: (updatedUniverse: Universe) => void;
}

const CharacterManager: React.FC<Props> = ({ universe, onUpdate }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoadingBackstory, setIsLoadingBackstory] = useState(false);
  const [isLoadingTraits, setIsLoadingTraits] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'character' | 'trait' | 'section', id: string, name?: string, parentId?: string } | null>(null);

  const addCharacter = () => {
    const newChar: Character = {
      id: crypto.randomUUID(),
      name: 'Novo Personagem',
      role: 'Protagonista',
      backstory: '',
      traits: [],
      images: [],
      customSections: []
    };
    onUpdate({ ...universe, characters: [...universe.characters, newChar] });
    setEditingId(newChar.id);
  };

  const updateCharacter = (id: string, data: Partial<Character>) => {
    const updatedChars = universe.characters.map(c => c.id === id ? { ...c, ...data } : c);
    onUpdate({ ...universe, characters: updatedChars });
  };

  const addTrait = (charId: string) => {
    const char = universe.characters.find(c => c.id === charId);
    if (!char) return;
    const newTrait: CharacterTrait = {
      id: crypto.randomUUID(),
      category: 'CARACTERÍSTICA',
      description: ''
    };
    updateCharacter(charId, { traits: [...char.traits, newTrait] });
  };

  const addCustomSection = (charId: string) => {
    const char = universe.characters.find(c => c.id === charId);
    if (!char) return;
    const newSection: CharacterSection = {
      id: crypto.randomUUID(),
      title: 'Nova Categoria (ex: Equipamento)',
      content: '',
      images: []
    };
    updateCharacter(charId, { customSections: [...(char.customSections || []), newSection] });
  };

  const updateSection = (charId: string, sectionId: string, data: Partial<CharacterSection>) => {
    const char = universe.characters.find(c => c.id === charId);
    if (!char) return;
    const updatedSections = (char.customSections || []).map(s => s.id === sectionId ? { ...s, ...data } : s);
    updateCharacter(charId, { customSections: updatedSections });
  };

  const handleAISuggestBackstory = async (char: Character) => {
    if (!char.name || !char.role) return;
    setIsLoadingBackstory(true);
    try {
      const suggestion = await generateCharacterBackstory(char.name, char.role);
      if (suggestion) updateCharacter(char.id, { backstory: suggestion });
    } catch (e) { console.error(e); } finally { setIsLoadingBackstory(false); }
  };

  const handleAISuggestTraits = async (char: Character) => {
    if (!char.name || !char.role) return;
    setIsLoadingTraits(true);
    try {
      const traits = await suggestCharacterTraits(char.name, char.role);
      if (traits && Array.isArray(traits)) {
        const formattedTraits = traits.map((t: any) => ({ ...t, id: crypto.randomUUID() }));
        updateCharacter(char.id, { traits: [...char.traits, ...formattedTraits] });
      }
    } catch (e) { console.error(e); } finally { setIsLoadingTraits(false); }
  };

  const executeDelete = () => {
    if (!deleteConfirm) return;
    if (deleteConfirm.type === 'character') {
      onUpdate({ ...universe, characters: universe.characters.filter(c => c.id !== deleteConfirm.id) });
      if (editingId === deleteConfirm.id) setEditingId(null);
    } else if (deleteConfirm.type === 'trait' && deleteConfirm.parentId) {
      const char = universe.characters.find(c => c.id === deleteConfirm.parentId);
      if (char) {
        const updatedTraits = char.traits.filter(t => t.id !== deleteConfirm.id);
        updateCharacter(char.id, { traits: updatedTraits });
      }
    } else if (deleteConfirm.type === 'section' && deleteConfirm.parentId) {
      const char = universe.characters.find(c => c.id === deleteConfirm.parentId);
      if (char) {
        const updatedSections = (char.customSections || []).filter(s => s.id !== deleteConfirm.id);
        updateCharacter(char.id, { customSections: updatedSections });
      }
    }
    setDeleteConfirm(null);
  };

  const activeChar = universe.characters.find(c => c.id === editingId);

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full min-h-0">
      <ConfirmationModal 
        isOpen={!!deleteConfirm}
        title={deleteConfirm?.type === 'character' ? "🗑️ EXCLUIR PERSONAGEM?" : deleteConfirm?.type === 'trait' ? "REMOVER ATRIBUTO?" : "EXCLUIR CATEGORIA?"}
        message={`Deseja apagar permanentemente ${deleteConfirm?.type === 'character' ? `o personagem "${deleteConfirm.name}"` : deleteConfirm?.type === 'section' ? `a categoria "${deleteConfirm.name}"` : 'este item'}?`}
        onConfirm={executeDelete}
        onCancel={() => setDeleteConfirm(null)}
        confirmText="EXCLUIR"
        cancelText="CANCELAR"
      />

      <div className="w-full lg:w-72 flex flex-col gap-4 shrink-0">
        <button onClick={addCharacter} className="bg-indigo-600 text-white font-bold py-4 rounded-2xl uppercase text-xs shadow-lg active:scale-95 hover:bg-indigo-700 transition-all">
          Novo Personagem
        </button>
        <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto no-scrollbar pb-4">
          {universe.characters.map(char => (
            <div 
              key={char.id} 
              onClick={() => setEditingId(char.id)} 
              className={`group/card p-4 rounded-xl border cursor-pointer transition-all relative shrink-0 w-48 lg:w-full ${editingId === char.id ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'bg-white border-slate-200 hover:border-indigo-100'}`}
            >
              <div className="pr-6">
                <h3 className="font-bold text-slate-800 text-sm truncate">{char.name}</h3>
                <p className="text-[10px] text-slate-500 uppercase font-bold truncate">{char.role}</p>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); setDeleteConfirm({ type: 'character', id: char.id, name: char.name }); }}
                className="absolute top-4 right-3 p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover/card:opacity-100 transition-all"
                title="Excluir Personagem"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 bg-white rounded-[2rem] border border-slate-200 shadow-sm p-6 overflow-y-auto no-scrollbar space-y-12 pb-20">
        {activeChar ? (
          <>
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 space-y-2">
                  <EditableField 
                    value={activeChar.name} 
                    onChange={(val) => updateCharacter(activeChar.id, { name: val })} 
                    className="text-2xl font-black text-slate-800"
                    placeholder="Nome do Personagem..."
                  />
                  <EditableField 
                    value={activeChar.role} 
                    onChange={(val) => updateCharacter(activeChar.id, { role: val })} 
                    className="text-sm text-slate-500 font-bold uppercase tracking-widest"
                    placeholder="Papel (Protagonista, Vilão...)"
                  />
                </div>
                <button 
                  onClick={() => setDeleteConfirm({ type: 'character', id: activeChar.id, name: activeChar.name })} 
                  className="text-red-400 p-2 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
              {/* Rest of the component content remains the same... */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-black text-[10px] text-slate-400 uppercase tracking-widest">Biografia</h4>
                    <button 
                      onClick={() => handleAISuggestBackstory(activeChar)} 
                      disabled={isLoadingBackstory} 
                      className="flex items-center gap-1.5 text-[9px] font-black text-indigo-600 hover:underline disabled:opacity-50"
                    >
                      {isLoadingBackstory ? 'PENSANDO...' : 'IA SUGESTÃO'}
                    </button>
                  </div>
                  <EditableField 
                    type="textarea"
                    value={activeChar.backstory} 
                    onChange={(val) => updateCharacter(activeChar.id, { backstory: val })} 
                    className="w-full p-5 rounded-2xl bg-slate-50 text-sm min-h-[250px] leading-relaxed"
                    placeholder="Escreva a história deste personagem..."
                  />
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-black text-[10px] text-slate-400 uppercase tracking-widest">Características</h4>
                    <div className="flex items-center gap-4">
                      <button onClick={() => addTrait(activeChar.id)} className="text-[9px] font-black text-slate-400 hover:text-indigo-600 transition-colors uppercase">+ Adicionar</button>
                      <button onClick={() => handleAISuggestTraits(activeChar)} disabled={isLoadingTraits} className="flex items-center gap-1.5 text-[9px] font-black text-indigo-600 hover:underline disabled:opacity-50">
                        {isLoadingTraits ? 'GERANDO...' : 'GERAR COM IA'}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {activeChar.traits.length === 0 && (
                      <div className="py-10 border-2 border-dashed border-slate-50 rounded-2xl flex flex-col items-center justify-center text-slate-300">
                        <p className="text-[10px] font-black uppercase">Nenhuma característica</p>
                      </div>
                    )}
                    {activeChar.traits.map(trait => (
                      <div key={trait.id} className="p-4 bg-slate-50 rounded-2xl relative group border border-transparent hover:border-indigo-100 transition-all animate-in slide-in-from-right-2">
                        <div className="flex justify-between items-start mb-1">
                          <EditableField 
                            value={trait.category} 
                            onChange={(val) => {
                              const updated = activeChar.traits.map(t => t.id === trait.id ? { ...t, category: val } : t);
                              updateCharacter(activeChar.id, { traits: updated });
                            }} 
                            className="font-bold text-[10px] uppercase text-indigo-600"
                            placeholder="Tipo (Físico, Mental...)"
                          />
                          <button onClick={() => setDeleteConfirm({ type: 'trait', id: trait.id, parentId: activeChar.id })} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        </div>
                        <EditableField 
                          type="textarea"
                          value={trait.description} 
                          onChange={(val) => {
                            const updated = activeChar.traits.map(t => t.id === trait.id ? { ...t, description: val } : t);
                            updateCharacter(activeChar.id, { traits: updated });
                          }} 
                          className="text-sm text-slate-600 min-h-[40px]" 
                          placeholder="Descreva esta característica..." 
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-slate-100 space-y-8">
                <div className="flex items-center justify-between px-2">
                  <h4 className="font-black text-[10px] text-indigo-500 uppercase tracking-[0.2em]">Categorias Extras e Customizações</h4>
                  <button 
                    onClick={() => addCustomSection(activeChar.id)}
                    className="flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-100 transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                    Adicionar Nova Categoria
                  </button>
                </div>

                <div className="space-y-12">
                  {(activeChar.customSections || []).map((section) => (
                    <div key={section.id} className="bg-slate-50/50 p-6 md:p-8 rounded-[2.5rem] border border-slate-100 space-y-6 relative group/section animate-in fade-in slide-in-from-bottom-4">
                      <button 
                        onClick={() => setDeleteConfirm({ type: 'section', id: section.id, parentId: activeChar.id, name: section.title })}
                        className="absolute top-6 right-6 text-slate-400 hover:text-red-500 transition-all p-2 hover:bg-red-50 rounded-xl flex items-center gap-2 group/delbtn z-10"
                        title="Excluir Categoria"
                      >
                        <span className="text-[8px] font-black uppercase tracking-widest opacity-0 group-hover/delbtn:opacity-100 transition-opacity">Excluir Categoria</span>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>

                      <div className="space-y-4">
                        <div className="flex flex-col gap-2">
                          <EditableField 
                            value={section.title} 
                            onChange={(val) => updateSection(activeChar.id, section.id, { title: val })}
                            className="text-lg font-black text-slate-800 pr-32"
                            placeholder="Título da Categoria (ex: Trajes, Arsenal...)"
                          />
                          <EditableField 
                            type="textarea"
                            value={section.content} 
                            onChange={(val) => updateSection(activeChar.id, section.id, { content: val })}
                            className="text-xs text-slate-500 min-h-[60px]"
                            placeholder="Adicione descrições, observações ou notas de atualização..."
                          />
                        </div>

                        <VisualGallery 
                          images={section.images || []} 
                          onUpdate={(imgs) => updateSection(activeChar.id, section.id, { images: imgs })}
                          titleLabel={`Imagens de ${section.title}`}
                          accentColor="indigo"
                        />
                      </div>
                    </div>
                  ))}
                  {(!activeChar.customSections || activeChar.customSections.length === 0) && (
                    <div className="py-12 border-2 border-dashed border-slate-50 rounded-[2.5rem] flex flex-col items-center justify-center text-slate-300 space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-widest">Nenhuma categoria extra</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-12 border-t border-slate-100">
              <VisualGallery 
                images={activeChar.images || []} 
                onUpdate={(imgs) => updateCharacter(activeChar.id, { images: imgs })}
                titleLabel="Galeria Geral de Referências"
              />
            </div>
          </>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center text-slate-300">
            <svg className="w-12 h-12 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            <p className="text-sm font-bold uppercase tracking-widest">Selecione um personagem</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CharacterManager;
