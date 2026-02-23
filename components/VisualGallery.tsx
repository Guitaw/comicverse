
import React, { useRef, useState, useEffect } from 'react';
import { VisualReference } from '../types';
import AutoResizeTextarea from './AutoResizeTextarea';
import { compressImage } from '../src/utils/imageUtils';

interface Props {
  images: VisualReference[];
  onUpdate: (images: VisualReference[]) => void;
  accentColor?: string;
  titleLabel?: string;
}

const VisualGallery: React.FC<Props> = ({ images = [], onUpdate, accentColor = 'indigo', titleLabel = 'Galeria de Referências' }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const processFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    const filesArray = Array.from(files);
    const newImgs: VisualReference[] = [];

    try {
      for (const file of filesArray) {
        if (!file.type.startsWith('image/')) continue;

        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
        });
        
        reader.readAsDataURL(file);
        const base64 = await base64Promise;
        
        // Comprimir imagem antes de salvar
        const compressedBase64 = await compressImage(base64);

        newImgs.push({
          id: crypto.randomUUID(),
          url: compressedBase64,
          title: file.name.split('.')[0] || 'Sem título',
          description: ''
        });
      }

      if (newImgs.length > 0) {
        onUpdate([...images, ...newImgs]);
      }
    } catch (error) {
      console.error("Erro ao processar imagens:", error);
      alert("Ocorreu um erro ao processar uma ou mais imagens. Verifique se os arquivos são válidos.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
    if (e.target) e.target.value = '';
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  };

  const updateImage = (id: string, data: Partial<VisualReference>) => {
    onUpdate(images.map(img => img.id === id ? { ...img, ...data } : img));
  };

  const removeImage = (id: string) => {
    onUpdate(images.filter(img => img.id !== id));
  };

  const accentClasses = (function() {
    const config = {
      indigo: {
        button: 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border-indigo-200',
        drop: 'border-indigo-400 bg-indigo-50/50',
        empty: 'hover:border-indigo-300 hover:bg-indigo-50/30'
      },
      emerald: {
        button: 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border-emerald-200',
        drop: 'border-emerald-400 bg-emerald-50/50',
        empty: 'hover:border-emerald-300 hover:bg-emerald-50/30'
      },
      slate: {
        button: 'text-slate-600 bg-slate-50 hover:bg-slate-100 border-slate-200',
        drop: 'border-slate-400 bg-slate-50/50',
        empty: 'hover:border-slate-300 hover:bg-slate-50/30'
      },
    };
    return config[accentColor as keyof typeof config] || config.indigo;
  })();

  const nextImage = () => {
    if (selectedImageIndex === null) return;
    setSelectedImageIndex((selectedImageIndex + 1) % images.length);
  };

  const prevImage = () => {
    if (selectedImageIndex === null) return;
    setSelectedImageIndex((selectedImageIndex - 1 + images.length) % images.length);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedImageIndex === null) return;
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'Escape') setSelectedImageIndex(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImageIndex, images.length]);

  return (
    <div 
      className="space-y-6"
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <div className="flex items-center justify-between">
        <h4 className="font-black text-[10px] text-slate-400 uppercase tracking-widest">{titleLabel}</h4>
        <button 
          onClick={() => fileInputRef.current?.click()}
          disabled={isProcessing}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${accentClasses.button} border shadow-sm active:scale-95 ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isProcessing ? (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
          )}
          {isProcessing ? 'Processando...' : 'Adicionar Imagens'}
        </button>
        <input type="file" ref={fileInputRef} onChange={handleUpload} accept="image/*" multiple className="hidden" />
      </div>

      <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-[2.5rem] border-2 border-transparent transition-all ${isDragging ? accentClasses.drop : ''}`}>
        {isProcessing && images.length === 0 && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-400 animate-pulse">
            <svg className="w-12 h-12 mb-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            <p className="text-xs font-black uppercase tracking-widest">Otimizando imagens...</p>
          </div>
        )}
        {images.map((img, index) => (
          <div key={img.id} className="group bg-slate-50 rounded-3xl overflow-hidden border border-slate-100 hover:border-indigo-200 transition-all flex flex-col shadow-sm">
            <div className="relative aspect-video overflow-hidden bg-slate-200 cursor-zoom-in">
              <img 
                src={img.url} 
                alt={img.title} 
                onClick={() => setSelectedImageIndex(index)}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              />
              <button 
                onClick={(e) => { e.stopPropagation(); removeImage(img.id); }}
                className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-xl opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-4 space-y-2">
              <input 
                value={img.title} 
                onChange={(e) => updateImage(img.id, { title: e.target.value })}
                className="w-full bg-transparent font-black text-xs uppercase text-slate-800 outline-none placeholder-slate-300"
                placeholder="Título da imagem..."
              />
              <AutoResizeTextarea 
                value={img.description}
                onChange={(e) => updateImage(img.id, { description: e.target.value })}
                className="w-full bg-transparent text-[11px] text-slate-500 outline-none leading-relaxed min-h-[40px]"
                placeholder="Breve descrição ou contexto visual..."
              />
            </div>
          </div>
        ))}
        
        <div 
          onClick={() => fileInputRef.current?.click()}
          className={`col-span-full py-12 border-2 border-dashed border-slate-100 rounded-[2.5rem] flex flex-col items-center justify-center text-slate-300 gap-3 cursor-pointer transition-all ${accentClasses.empty} ${isDragging ? 'scale-105 border-solid' : ''}`}
        >
           <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-2 transition-colors ${isDragging ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-50 text-slate-300'}`}>
             <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
             </svg>
           </div>
           <p className="text-[10px] font-black uppercase tracking-widest text-center px-4">
             {isDragging ? 'Solte para enviar' : 'Clique aqui ou arraste imagens para adicionar'}
           </p>
        </div>
      </div>

      {/* Lightbox Modal - Glassmorphism & Elegant Typography */}
      {selectedImageIndex !== null && images[selectedImageIndex] && (
        <div 
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/60 backdrop-blur-2xl animate-in fade-in duration-700 cursor-zoom-out"
          onClick={() => setSelectedImageIndex(null)}
        >
          <button 
            onClick={(e) => { e.stopPropagation(); setSelectedImageIndex(null); }}
            className="absolute top-8 right-8 text-white/30 hover:text-white transition-all z-[1010] p-4 hover:bg-white/5 rounded-full"
            title="Fechar (Esc)"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          
          <div 
            className="relative w-full h-full flex items-center justify-center p-6 md:p-20 cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={(e) => { e.stopPropagation(); prevImage(); }}
              className="absolute left-4 md:left-12 p-6 text-white/10 hover:text-white transition-all z-[1010] hover:bg-white/5 rounded-3xl"
            >
              <svg className="w-8 h-8 md:w-10 md:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
            </button>

            <div className="max-w-6xl w-full h-full flex flex-col items-center justify-center gap-10 animate-in zoom-in-95 duration-700">
              <div className="relative group">
                <img 
                  src={images[selectedImageIndex].url} 
                  alt={images[selectedImageIndex].title} 
                  className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] border border-white/5"
                />
              </div>
              <div className="text-center space-y-4 max-w-2xl px-6">
                <h2 className="text-white font-black text-[10px] uppercase tracking-[0.4em] mb-2">{images[selectedImageIndex].title}</h2>
                <div className="h-[1px] w-8 bg-white/20 mx-auto"></div>
                <p className="text-white/40 text-[11px] font-medium tracking-wide leading-relaxed text-center italic">
                  {images[selectedImageIndex].description || "Sem descrição adicional registrada para este elemento visual."}
                </p>
              </div>
            </div>

            <button 
              onClick={(e) => { e.stopPropagation(); nextImage(); }}
              className="absolute right-4 md:right-12 p-6 text-white/10 hover:text-white transition-all z-[1010] hover:bg-white/5 rounded-3xl"
            >
              <svg className="w-8 h-8 md:w-10 md:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VisualGallery;
