
import React, { useState, useEffect, useRef } from 'react';
import { Universe, ViewType, Author, CustomCategory, Scene, DialogueEntry, CharacterSection } from './types';
import CharacterManager from './components/CharacterManager';
import ScriptManager from './components/ScriptManager';
import LocationManager from './components/LocationManager';
import CustomCategoryManager from './components/CustomCategoryManager';
import ConfirmationModal from './components/ConfirmationModal';
import CategoryTemplateModal from './components/CategoryTemplateModal';
import LogoEditor from './components/LogoEditor';
import AutoResizeTextarea from './components/AutoResizeTextarea';
import VisualGallery from './components/VisualGallery';
import EditableField from './components/EditableField';

const App: React.FC = () => {
  const [universes, setUniverses] = useState<Universe[]>([]);
  const [activeUniverseId, setActiveUniverseId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [universeToDelete, setUniverseToDelete] = useState<Universe | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<{id: string, name: string} | null>(null);
  const [sectionToDelete, setSectionToDelete] = useState<{id: string, name: string} | null>(null);
  const [pendingLogo, setPendingLogo] = useState<string | null>(null);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  
  const [author, setAuthor] = useState<Author>({
    name: 'Autor Criativo',
    role: 'Escritor & Roteirista',
    photo: undefined
  });
  const [isEditingAuthor, setIsEditingAuthor] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const authorPhotoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedData = localStorage.getItem('comic_studio_data');
    const savedAuthor = localStorage.getItem('comic_studio_author');
    
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        const migrated = parsed.map((u: any) => ({
          ...u,
          extraSections: u.extraSections || [],
          characters: (u.characters || []).map((char: any) => ({
            ...char,
            customSections: char.customSections || []
          })),
          scripts: (u.scripts || []).map((s: any) => ({
            ...s,
            scenes: (s.scenes || []).map((sc: any) => {
              if (!sc.dialogues) {
                return {
                  ...sc,
                  dialogues: sc.dialogue || sc.speaker ? [{
                    id: crypto.randomUUID(),
                    speaker: sc.speaker || '',
                    text: sc.dialogue || ''
                  }] : []
                };
              }
              return sc;
            })
          })),
          customCategories: (u.customCategories || []).map((c: any) => ({
            ...c,
            items: (c.items || []).map((i: any) => ({
              ...i,
              fields: i.fields || []
            }))
          }))
        }));
        setUniverses(migrated);
        if (migrated.length > 0) setActiveUniverseId(migrated[0].id);
      } catch (e) { console.error("Failed to load data", e); }
    }
    if (savedAuthor) {
      try { setAuthor(JSON.parse(savedAuthor)); } catch (e) { console.error("Failed to load author", e); }
    }
    if (window.innerWidth >= 1024) setIsSidebarOpen(true);
  }, []);

  useEffect(() => {
    localStorage.setItem('comic_studio_data', JSON.stringify(universes));
  }, [universes]);

  useEffect(() => {
    localStorage.setItem('comic_studio_author', JSON.stringify(author));
  }, [author]);

  const activeUniverse = universes.find(u => u.id === activeUniverseId);

  const createUniverse = () => {
    const newUni: Universe = {
      id: crypto.randomUUID(),
      name: 'Novo Universo',
      description: 'Descrição do seu novo mundo...',
      characters: [],
      locations: [],
      scripts: [],
      customCategories: [],
      worldNotes: [],
      images: [],
      extraSections: [],
      createdAt: Date.now()
    };
    setUniverses(prev => [...prev, newUni]);
    setActiveUniverseId(newUni.id);
    setActiveView('dashboard');
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
  };

  const addUniverseSection = () => {
    if (!activeUniverse) return;
    const newSection: CharacterSection = {
      id: crypto.randomUUID(),
      title: 'Nova Categoria de Informação',
      content: '',
      images: []
    };
    updateUniverse({ extraSections: [...(activeUniverse.extraSections || []), newSection] });
  };

  const updateUniverseSection = (sectionId: string, data: Partial<CharacterSection>) => {
    if (!activeUniverse) return;
    const updatedSections = (activeUniverse.extraSections || []).map(s => s.id === sectionId ? { ...s, ...data } : s);
    updateUniverse({ extraSections: updatedSections });
  };

  const confirmDeleteSection = () => {
    if (!sectionToDelete || !activeUniverse) return;
    updateUniverse({
      extraSections: activeUniverse.extraSections?.filter(s => s.id !== sectionToDelete.id)
    });
    setSectionToDelete(null);
  };

  const handleSelectTemplate = (templateName: string) => {
    if (!activeUniverseId) return;

    const newCatId = crypto.randomUUID();
    const newCat: CustomCategory = {
      id: newCatId,
      name: templateName,
      items: []
    };

    setUniverses(prev => prev.map(u => {
      if (u.id === activeUniverseId) {
        return {
          ...u,
          customCategories: [...(u.customCategories || []), newCat]
        };
      }
      return u;
    }));
    
    setActiveView(`custom_${newCatId}`);
    setIsTemplateModalOpen(false);
  };

  const updateUniverse = (updated: Partial<Universe>) => {
    if (!activeUniverseId) return;
    setUniverses(prev => prev.map(u => u.id === activeUniverseId ? { ...u, ...updated } : u));
  };

  const confirmDeleteUniverse = () => {
    if (!universeToDelete) return;
    setUniverses(prev => {
      const filtered = prev.filter(u => u.id !== universeToDelete.id);
      if (activeUniverseId === universeToDelete.id) {
        const nextUniverse = filtered.length > 0 ? filtered[0].id : null;
        setActiveUniverseId(nextUniverse);
        setActiveView('dashboard');
      }
      return filtered;
    });
    setUniverseToDelete(null);
  };

  const confirmDeleteCategory = () => {
    if (!categoryToDelete || !activeUniverse) return;
    updateUniverse({
      customCategories: activeUniverse.customCategories.filter(c => c.id !== categoryToDelete.id)
    });
    if (activeView === `custom_${categoryToDelete.id}`) {
      setActiveView('dashboard');
    }
    setCategoryToDelete(null);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeUniverse) {
      const reader = new FileReader();
      reader.onloadend = () => setPendingLogo(reader.result as string);
      reader.readAsDataURL(file);
    }
    if (e.target) e.target.value = '';
  };

  const handleAuthorPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setAuthor(prev => ({ ...prev, photo: reader.result as string }));
      reader.readAsDataURL(file);
    }
    if (e.target) e.target.value = '';
  };

  const saveEditedLogo = (croppedImage: string) => {
    if (activeUniverse) updateUniverse({ customLogo: croppedImage });
    setPendingLogo(null);
  };

  const renderActiveView = () => {
    if (!activeUniverse) return null;

    if (activeView === 'dashboard') return (
      <div className="space-y-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="col-span-1 lg:col-span-2 bg-white p-6 md:p-10 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
              <div className="flex-1 w-full">
                <EditableField 
                  label="Nome do Universo" 
                  value={activeUniverse.name} 
                  onChange={(val) => updateUniverse({ name: val })}
                  className="text-3xl font-black text-slate-800"
                  placeholder="Nome do Universo..."
                />
              </div>
              <div className="flex items-center gap-4">
                {activeUniverse.customLogo ? (
                  <div className="relative group w-20 h-20 bg-slate-50 rounded-2xl p-2 border border-slate-100 flex items-center justify-center">
                    <img src={activeUniverse.customLogo} className="max-w-full max-h-full object-contain rounded-lg" />
                    <button onClick={() => updateUniverse({ customLogo: undefined })} className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
                  </div>
                ) : (
                  <button onClick={() => fileInputRef.current?.click()} className="w-20 h-20 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-300 hover:border-indigo-300 transition-all">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                  </button>
                )}
                <input type="file" ref={fileInputRef} onChange={handleLogoUpload} accept="image/*" className="hidden" />
              </div>
            </div>
            
            <EditableField 
              label="Sinopse da História" 
              type="textarea"
              value={activeUniverse.description} 
              onChange={(val) => updateUniverse({ description: val })}
              className="w-full text-slate-600 bg-slate-50 p-4 rounded-[1.5rem] text-sm min-h-[150px]"
              placeholder="Descreva o enredo principal do seu universo..."
            />
          </div>
          <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white flex flex-col justify-between shadow-2xl shadow-indigo-100">
             <div className="flex justify-between items-start">
               <h3 className="font-black text-indigo-200 uppercase text-[10px] tracking-widest">Estatísticas</h3>
               <button 
                 onClick={() => setUniverseToDelete(activeUniverse)}
                 className="text-indigo-400 hover:text-white transition-colors"
               >
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
               </button>
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div><p className="text-4xl font-black">{activeUniverse.characters.length}</p><p className="text-indigo-200 text-[9px] font-black uppercase">Personagens</p></div>
                <div><p className="text-4xl font-black">{activeUniverse.locations.length}</p><p className="text-indigo-200 text-[9px] font-black uppercase">Lugares</p></div>
             </div>
          </div>
        </div>

        <div className="bg-white p-6 md:p-10 rounded-[2.5rem] border border-slate-200 shadow-sm">
          <VisualGallery 
            images={activeUniverse.images || []} 
            onUpdate={(imgs) => updateUniverse({ images: imgs })} 
            titleLabel="Galeria Visual do Universo"
          />
        </div>

        {/* Categorias Extras do Universo */}
        <div className="space-y-8 pt-8">
          <div className="flex items-center justify-between px-2">
            <h3 className="font-black text-[10px] text-slate-400 uppercase tracking-[0.3em]">Categorias Extras do Universo</h3>
            <button 
              onClick={addUniverseSection}
              className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
              Adicionar Nova Categoria
            </button>
          </div>

          <div className="grid grid-cols-1 gap-8">
            {(activeUniverse.extraSections || []).map((section) => (
              <div key={section.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6 relative group/section animate-in fade-in slide-in-from-bottom-4">
                <button 
                  onClick={() => setSectionToDelete({ id: section.id, name: section.title })}
                  className="absolute top-8 right-8 text-slate-300 hover:text-red-500 transition-all p-2 hover:bg-red-50 rounded-xl z-10"
                  title="Excluir Categoria"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>

                <div className="space-y-6">
                  <div className="max-w-3xl space-y-4">
                    <EditableField 
                      value={section.title} 
                      onChange={(val) => updateUniverseSection(section.id, { title: val })}
                      className="text-2xl font-black text-slate-800 pr-12"
                      placeholder="Título da Categoria..."
                    />
                    <EditableField 
                      type="textarea"
                      value={section.content} 
                      onChange={(val) => updateUniverseSection(section.id, { content: val })}
                      className="text-sm text-slate-600 leading-relaxed min-h-[100px]"
                      placeholder="Descreva as informações importantes desta categoria..."
                    />
                  </div>

                  <div className="pt-6 border-t border-slate-50">
                    <VisualGallery 
                      images={section.images || []} 
                      onUpdate={(imgs) => updateUniverseSection(section.id, { images: imgs })}
                      titleLabel={`Referências de ${section.title}`}
                    />
                  </div>
                </div>
              </div>
            ))}

            {(!activeUniverse.extraSections || activeUniverse.extraSections.length === 0) && (
              <div className="py-20 border-2 border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center text-slate-400 space-y-4">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                <div className="text-center">
                  <p className="text-sm font-black uppercase tracking-widest">Aprofunde seu Universo</p>
                  <p className="text-xs text-slate-400 mt-1">Crie categorias para Lore, Regras do Mundo, História ou qualquer dado vital.</p>
                </div>
                <button 
                  onClick={addUniverseSection}
                  className="mt-4 text-indigo-600 font-black text-[10px] uppercase tracking-widest hover:underline"
                >
                  + Criar primeira categoria
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );

    if (activeView === 'characters') return <CharacterManager universe={activeUniverse} onUpdate={(u) => setUniverses(prev => prev.map(old => old.id === u.id ? u : old))} />;
    if (activeView === 'locations') return <LocationManager universe={activeUniverse} onUpdate={(u) => setUniverses(prev => prev.map(old => old.id === u.id ? u : old))} />;
    if (activeView === 'scripts') return <ScriptManager universe={activeUniverse} onUpdate={(u) => setUniverses(prev => prev.map(old => old.id === u.id ? u : old))} />;

    if (activeView.startsWith('custom_')) {
      const catId = activeView.split('_')[1];
      const category = activeUniverse.customCategories.find(c => c.id === catId);
      if (category) {
        return (
          <CustomCategoryManager 
            category={category} 
            universe={activeUniverse}
            onUpdateUniverse={(updatedUni) => setUniverses(prev => prev.map(u => u.id === updatedUni.id ? updatedUni : u))}
          />
        );
      }
    }

    return null;
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 text-slate-800 overflow-hidden relative">
      <ConfirmationModal 
        isOpen={!!universeToDelete}
        title="⚠️ EXCLUIR UNIVERSO DEFINITIVAMENTE?"
        message={`Esta ação é TOTALMENTE IRREVERSÍVEL. Você perderá todos os dados de "${universeToDelete?.name}". Confirmar?`}
        onConfirm={confirmDeleteUniverse}
        onCancel={() => setUniverseToDelete(null)}
        confirmText="SIM, APAGAR TUDO"
        cancelText="MANTER MUNDO"
      />

      <ConfirmationModal 
        isOpen={!!categoryToDelete}
        title="🗑️ EXCLUIR CATEGORIA?"
        message={`Deseja remover a categoria "${categoryToDelete?.name}" e todos os seus itens?`}
        onConfirm={confirmDeleteCategory}
        onCancel={() => setCategoryToDelete(null)}
        confirmText="EXCLUIR"
        cancelText="CANCELAR"
      />

      <ConfirmationModal 
        isOpen={!!sectionToDelete}
        title="🗑️ EXCLUIR CATEGORIA DO UNIVERSO?"
        message={`Deseja remover a categoria "${sectionToDelete?.name}" e todas as suas informações?`}
        onConfirm={confirmDeleteSection}
        onCancel={() => setSectionToDelete(null)}
        confirmText="EXCLUIR"
        cancelText="CANCELAR"
      />

      <CategoryTemplateModal 
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onSelect={handleSelectTemplate}
      />

      {pendingLogo && (
        <LogoEditor 
          imageSrc={pendingLogo}
          onSave={saveEditedLogo}
          onCancel={() => setPendingLogo(null)}
        />
      )}

      <aside className={`fixed inset-y-0 left-0 lg:static z-40 bg-white border-r border-slate-200 flex flex-col transition-all duration-300 shadow-2xl lg:shadow-none overflow-hidden ${isSidebarOpen ? 'w-72 translate-x-0 opacity-100' : 'w-0 -translate-x-full opacity-0 lg:w-0'}`}>
        <div className="p-6 flex items-center justify-between min-h-[88px] border-b border-slate-50">
          <div className="flex items-center gap-2 overflow-hidden">
            {activeUniverse?.customLogo ? (
              <img src={activeUniverse.customLogo} alt="Logo" className="h-8 w-auto object-contain rounded" />
            ) : (
              <h1 className="comic-font text-xl text-indigo-600 tracking-wider">ComicVerse</h1>
            )}
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-8 no-scrollbar">
          <div className="space-y-3">
            <div className="flex items-center justify-between px-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Universos</span>
              <button onClick={createUniverse} className="text-indigo-600 p-1.5 hover:bg-indigo-50 rounded-lg transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
              </button>
            </div>
            <div className="space-y-1">
              {universes.map(uni => (
                <div 
                  key={uni.id} 
                  className={`group flex items-center p-3 rounded-xl cursor-pointer transition-all ${activeUniverseId === uni.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'hover:bg-indigo-50 text-slate-600'}`}
                >
                  <div 
                    onClick={() => { setActiveUniverseId(uni.id); setActiveView('dashboard'); }}
                    className="flex flex-1 items-center min-w-0"
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold mr-3 shrink-0 ${activeUniverseId === uni.id ? 'bg-indigo-500' : 'bg-indigo-100 text-indigo-600'}`}>
                      {uni.name[0].toUpperCase()}
                    </div>
                    <span className="flex-1 font-bold truncate text-xs uppercase">{uni.name}</span>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setUniverseToDelete(uni); }}
                    className={`p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all ${activeUniverseId === uni.id ? 'text-indigo-200 hover:text-white hover:bg-indigo-500' : 'text-slate-300 hover:text-red-500 hover:bg-red-50'}`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {activeUniverse && (
            <div className="space-y-6">
              <nav className="space-y-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 block mb-2">Painel de Controle</span>
                {[
                  { id: 'dashboard', label: 'Painel Geral', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
                  { id: 'characters', label: 'Personagens', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
                  { id: 'locations', label: 'Lugares', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z' },
                  { id: 'scripts', label: 'Roteiros', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' }
                ].map(item => (
                  <button key={item.id} onClick={() => setActiveView(item.id as ViewType)} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors ${activeView === item.id ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-100'}`}>
                    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} /></svg>
                    <span>{item.label}</span>
                  </button>
                ))}
              </nav>

              <nav className="space-y-1">
                <div className="flex items-center justify-between px-2 mb-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Extras</span>
                  <button onClick={() => setIsTemplateModalOpen(true)} className="text-indigo-600 p-1 hover:bg-indigo-50 rounded-lg transition-colors" title="Adicionar Categoria">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                  </button>
                </div>
                {activeUniverse.customCategories?.map(cat => (
                  <div key={cat.id} className="group relative">
                    <button 
                      onClick={() => setActiveView(`custom_${cat.id}`)} 
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors ${activeView === `custom_${cat.id}` ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-100'}`}
                    >
                      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1m-6 9h6m-3-3l3 3m0 0l-3 3" /></svg>
                      <span className="truncate pr-6">{cat.name}</span>
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setCategoryToDelete(cat); }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                ))}
                
                <button 
                  onClick={() => setIsTemplateModalOpen(true)}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-[10px] font-black text-slate-300 uppercase tracking-widest hover:text-indigo-500 hover:bg-slate-50 transition-all border border-dashed border-slate-100 mt-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                  <span>Nova Categoria</span>
                </button>
              </nav>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50/30">
          <div className={`bg-white rounded-2xl p-2 flex items-center gap-3 transition-all ${isEditingAuthor ? 'ring-2 ring-indigo-500 ring-offset-2 shadow-lg scale-[1.02]' : 'shadow-sm'}`}>
            <div onClick={() => authorPhotoInputRef.current?.click()} className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center overflow-hidden cursor-pointer border-2 border-white shadow-sm shrink-0">
              {author.photo ? <img src={author.photo} className="w-full h-full object-cover" /> : <span className="font-bold text-indigo-500 text-sm">{author.name[0]}</span>}
              <input type="file" ref={authorPhotoInputRef} onChange={handleAuthorPhotoUpload} accept="image/*" className="hidden" />
            </div>
            <div className="flex-1 min-w-0">
              {isEditingAuthor ? (
                <div className="flex flex-col gap-1">
                  <input 
                    autoFocus
                    value={author.name} 
                    onChange={(e) => setAuthor(prev => ({ ...prev, name: e.target.value }))}
                    className="text-[11px] font-black text-slate-800 uppercase tracking-tight bg-slate-50 border-none outline-none rounded px-1 w-full"
                    placeholder="Nome"
                  />
                  <input 
                    value={author.role} 
                    onChange={(e) => setAuthor(prev => ({ ...prev, role: e.target.value }))}
                    className="text-[9px] font-bold text-indigo-600 uppercase tracking-widest bg-slate-50 border-none outline-none rounded px-1 w-full"
                    placeholder="Cargo"
                  />
                </div>
              ) : (
                <>
                  <p className="text-[11px] font-black text-slate-800 uppercase tracking-tight truncate">{author.name}</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate">{author.role}</p>
                </>
              )}
            </div>
            <button 
              onClick={() => setIsEditingAuthor(!isEditingAuthor)} 
              className={`p-1.5 rounded-lg transition-colors ${isEditingAuthor ? 'text-emerald-500 hover:bg-emerald-50' : 'text-slate-300 hover:text-indigo-500 hover:bg-indigo-50'}`}
              title={isEditingAuthor ? "Salvar Alterações" : "Editar Perfil"}
            >
               {isEditingAuthor ? (
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
               ) : (
                 <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
               )}
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <header className="h-16 shrink-0 bg-white border-b border-slate-200 px-4 md:px-10 flex items-center justify-between z-20">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <h2 className="font-black text-slate-800 uppercase text-sm tracking-tight">{activeUniverse?.name || 'ComicVerse Studio'}</h2>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-10 no-scrollbar">
          {!activeUniverse ? (
            <div className="h-full flex flex-col items-center justify-center space-y-6">
              <div className="w-24 h-24 bg-indigo-50 rounded-[2rem] flex items-center justify-center text-indigo-600 mb-4">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
              </div>
              <h3 className="text-2xl font-black text-slate-800 uppercase">Seu Multiverso começa aqui</h3>
              <button onClick={createUniverse} className="bg-indigo-600 text-white px-10 py-5 rounded-2xl font-black uppercase text-xs shadow-xl hover:bg-indigo-700 transition-all active:scale-95">Criar Primeiro Universo</button>
            </div>
          ) : (
            <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-10">
              {renderActiveView()}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
