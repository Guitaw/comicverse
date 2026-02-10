
import React, { useState } from 'react';
import { CustomCategory, CustomItem, CustomField, Universe } from '../types';
import ConfirmationModal from './ConfirmationModal';
import AutoResizeTextarea from './AutoResizeTextarea';
import VisualGallery from './VisualGallery';
import EditableField from './EditableField';

interface Props {
  category: CustomCategory;
  universe: Universe;
  onUpdateUniverse: (updatedUniverse: Universe) => void;
}

const CustomCategoryManager: React.FC<Props> = ({ category, universe, onUpdateUniverse }) => {
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{type: 'item' | 'field', data: any} | null>(null);

  const addItem = () => {
    const newItem: CustomItem = {
      id: crypto.randomUUID(),
      name: `Novo Item de ${category.name}`,
      description: '',
      fields: [],
      images: []
    };
    
    const updatedCategories = universe.customCategories.map(c => 
      c.id === category.id ? { ...c, items: [...(c.items || []), newItem] } : c
    );
    
    onUpdateUniverse({ ...universe, customCategories: updatedCategories });
    setEditingItemId(newItem.id);
  };

  const updateCategoryName = (newName: string) => {
    const updatedCategories = universe.customCategories.map(c => 
      c.id === category.id ? { ...c, name: newName } : c
    );
    onUpdateUniverse({ ...universe, customCategories: updatedCategories });
  };

  const updateItem = (id: string, data: Partial<CustomItem>) => {
    const updatedCategories = universe.customCategories.map(c => 
      c.id === category.id ? {
        ...c,
        items: (c.items || []).map(item => item.id === id ? { ...item, ...data } : item)
      } : c
    );
    onUpdateUniverse({ ...universe, customCategories: updatedCategories });
  };

  const addField = (itemId: string) => {
    const item = category.items.find(i => i.id === itemId);
    if (!item) return;

    const newField: CustomField = {
      id: crypto.randomUUID(),
      label: 'Novo Campo',
      value: ''
    };

    updateItem(itemId, {
      fields: [...(item.fields || []), newField]
    });
  };

  const updateField = (itemId: string, fieldId: string, data: Partial<CustomField>) => {
    const item = category.items.find(i => i.id === itemId);
    if (!item) return;

    updateItem(itemId, {
      fields: item.fields.map(f => f.id === fieldId ? { ...f, ...data } : f)
    });
  };

  const executeDelete = () => {
    if (!deleteConfirm) return;

    if (deleteConfirm.type === 'item') {
      const updatedCategories = universe.customCategories.map(c => 
        c.id === category.id ? {
          ...c,
          items: c.items.filter(item => item.id !== deleteConfirm.data.id)
        } : c
      );
      onUpdateUniverse({ ...universe, customCategories: updatedCategories });
      if (editingItemId === deleteConfirm.data.id) setEditingItemId(null);
    } else if (deleteConfirm.type === 'field') {
      const item = category.items.find(i => i.id === editingItemId);
      if (item) {
        updateItem(item.id, {
          fields: item.fields.filter(f => f.id !== deleteConfirm.data.id)
        });
      }
    }
    
    setDeleteConfirm(null);
  };

  const activeItem = (category.items || []).find(i => i.id === editingItemId);

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full min-h-0">
      <ConfirmationModal 
        isOpen={!!deleteConfirm}
        title={deleteConfirm?.type === 'item' ? '🗑️ EXCLUIR ITEM?' : '🗑️ REMOVER CAMPO?'}
        message={deleteConfirm?.type === 'item' ? `Deseja remover "${deleteConfirm.data?.name}" desta categoria?` : `Deseja remover este campo do item?`}
        onConfirm={executeDelete}
        onCancel={() => setDeleteConfirm(null)}
        confirmText="EXCLUIR"
        cancelText="CANCELAR"
      />

      <div className="w-full lg:w-72 flex flex-col gap-4 shrink-0">
        <button 
          onClick={addItem} 
          className="bg-slate-800 text-white font-bold py-4 rounded-2xl uppercase text-xs active:scale-95 shadow-lg hover:bg-slate-900 transition-all flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
          Novo Item
        </button>
        <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto no-scrollbar pb-2">
          {(!category.items || category.items.length === 0) && (
            <p className="text-[10px] text-slate-400 font-bold uppercase text-center py-8 border border-dashed border-slate-100 rounded-xl">Nenhum item</p>
          )}
          {category.items?.map(item => (
            <div 
              key={item.id} 
              onClick={() => setEditingItemId(item.id)} 
              className={`p-4 rounded-xl border cursor-pointer transition-all shrink-0 w-48 lg:w-full ${editingItemId === item.id ? 'bg-slate-100 border-slate-300 shadow-sm' : 'bg-white border-slate-200 hover:border-slate-300'}`}
            >
              <h3 className="font-bold text-slate-800 text-sm truncate">{item.name || 'Sem nome'}</h3>
              <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest mt-1">{(item.fields?.length || 0)} CAMPOS</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 bg-white rounded-[2rem] border border-slate-200 shadow-sm p-6 md:p-10 overflow-y-auto no-scrollbar space-y-12">
        {activeItem ? (
          <>
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 space-y-2">
                  <EditableField 
                    value={category.name} 
                    onChange={updateCategoryName} 
                    className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em]"
                    placeholder="Nome da Categoria..."
                  />
                  <EditableField 
                    value={activeItem.name} 
                    onChange={(val) => updateItem(activeItem.id, { name: val })} 
                    className="text-3xl font-black text-slate-800"
                    placeholder="Nome do Item..."
                  />
                </div>
                <button 
                  onClick={() => setDeleteConfirm({type: 'item', data: activeItem})} 
                  className="text-red-400 p-2 hover:bg-red-50 rounded-xl transition-colors shrink-0"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-black text-[10px] text-slate-400 uppercase tracking-widest">Informações e Dados</h4>
                  <button 
                    onClick={() => addField(activeItem.id)}
                    className="text-[9px] font-black text-indigo-600 hover:underline uppercase tracking-widest"
                  >
                    + Adicionar Campo
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeItem.fields?.map(field => (
                    <div key={field.id} className="p-4 bg-slate-50 rounded-2xl group relative border border-transparent hover:border-slate-200 transition-all">
                      <div className="flex justify-between items-center mb-1">
                        <EditableField 
                          value={field.label}
                          onChange={(val) => updateField(activeItem.id, field.id, { label: val })}
                          className="text-[9px] font-black uppercase text-indigo-600"
                          placeholder="Título do Campo"
                        />
                        <button 
                          onClick={() => setDeleteConfirm({type: 'field', data: field})}
                          className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                      <EditableField 
                        value={field.value}
                        onChange={(val) => updateField(activeItem.id, field.id, { value: val })}
                        className="text-xs font-bold text-slate-700"
                        placeholder="Valor ou descrição curta..."
                        accentColor="slate"
                      />
                    </div>
                  ))}
                  {(!activeItem.fields || activeItem.fields.length === 0) && (
                    <div className="col-span-full py-6 border-2 border-dashed border-slate-50 rounded-2xl text-center">
                       <p className="text-[9px] text-slate-300 font-black uppercase">Nenhum campo personalizado adicionado</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-black text-[10px] text-slate-400 uppercase tracking-widest">Descrição Completa</h4>
                <EditableField 
                  type="textarea"
                  value={activeItem.description} 
                  onChange={(val) => updateItem(activeItem.id, { description: val })} 
                  className="w-full p-8 rounded-[2rem] bg-slate-50 text-sm min-h-[150px] leading-relaxed" 
                  placeholder={`Descreva este elemento em detalhes...`}
                  accentColor="slate"
                />
              </div>
            </div>

            <div className="pt-8 border-t border-slate-100">
              <VisualGallery 
                images={activeItem.images || []} 
                onUpdate={(imgs) => updateItem(activeItem.id, { images: imgs })}
                accentColor="slate"
                titleLabel={`Galeria de ${activeItem.name}`}
              />
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-300">
            <svg className="w-12 h-12 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
            <p className="text-sm font-black uppercase tracking-widest">{category.name}</p>
            <p className="text-[10px] mt-2 font-bold text-slate-400">Selecione ou adicione um item para gerenciar</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomCategoryManager;
