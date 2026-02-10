
import React from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (templateName: string) => void;
}

const CategoryTemplateModal: React.FC<Props> = ({ isOpen, onClose, onSelect }) => {
  if (!isOpen) return null;

  const templates = [
    {
      id: 'objects',
      name: 'Objetos & Itens',
      description: 'Crie um catálogo de armas, artefatos mágicos ou itens importantes da trama.',
      icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
      color: 'bg-amber-50 text-amber-600 border-amber-100'
    },
    {
      id: 'groups',
      name: 'Grupos & Facções',
      description: 'Gerencie organizações, clãs, empresas ou grupos de heróis/vilões.',
      icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
      color: 'bg-indigo-50 text-indigo-600 border-indigo-100'
    },
    {
      id: 'lore',
      name: 'História & Lore',
      description: 'Documente fatos históricos, lendas do mundo, profecias ou cronologia.',
      icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
      color: 'bg-emerald-50 text-emerald-600 border-emerald-100'
    }
  ];

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] p-8 max-w-2xl w-full shadow-2xl space-y-8 animate-in zoom-in-95 duration-200">
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-black text-slate-800 uppercase">Nova Categoria</h3>
          <p className="text-slate-500 text-sm">Escolha um modelo base para começar. Você poderá renomear e personalizar tudo depois.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {templates.map((t) => (
            <button
              key={t.id}
              onClick={() => onSelect(t.name)}
              className="group flex flex-col items-center text-center p-6 rounded-3xl border-2 border-slate-50 hover:border-indigo-200 hover:bg-slate-50 transition-all space-y-4"
            >
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${t.color}`}>
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={t.icon} />
                </svg>
              </div>
              <div className="space-y-1">
                <h4 className="font-black text-xs uppercase text-slate-800">{t.name}</h4>
                <p className="text-[10px] text-slate-400 font-medium leading-relaxed">{t.description}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-center">
          <button
            onClick={onClose}
            className="text-[10px] font-black uppercase text-slate-400 hover:text-slate-600 tracking-widest transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryTemplateModal;
