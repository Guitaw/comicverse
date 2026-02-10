
import React, { useState, useRef, useEffect } from 'react';

interface LogoEditorProps {
  imageSrc: string;
  onSave: (croppedImage: string) => void;
  onCancel: () => void;
}

const LogoEditor: React.FC<LogoEditorProps> = ({ imageSrc, onSave, onCancel }) => {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleSave = () => {
    const canvas = document.createElement('canvas');
    const size = 400; // Resolução final do logo
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    if (ctx && imageRef.current && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const img = imageRef.current;
      
      // Limpar fundo
      ctx.clearRect(0, 0, size, size);
      
      // Calcular proporções e desenhar no canvas o que está visível no "viewfinder"
      const scale = (img.naturalWidth / img.clientWidth) / zoom;
      const sourceX = ( (rect.width / 2 - position.x) - (rect.width / 2) / zoom ) * (img.naturalWidth / img.clientWidth);
      const sourceY = ( (rect.height / 2 - position.y) - (rect.height / 2) / zoom ) * (img.naturalHeight / img.clientHeight);
      
      ctx.drawImage(
        img,
        -position.x * scale + (img.naturalWidth / 2) - (size * scale / 2),
        -position.y * scale + (img.naturalHeight / 2) - (size * scale / 2),
        img.naturalWidth / zoom,
        img.naturalHeight / zoom,
        0, 0, size, size
      );

      // No método simples de canvas para este caso, vamos usar uma abordagem de captura de viewport
      const drawCanvas = () => {
        const cropSize = rect.width;
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, size, size);
        
        const ratio = size / cropSize;
        ctx.save();
        ctx.translate(size / 2, size / 2);
        ctx.scale(zoom * ratio, zoom * ratio);
        ctx.translate(position.x, position.y);
        
        // Desenha a imagem centralizada
        const drawW = img.clientWidth;
        const drawH = img.clientHeight;
        ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
        ctx.restore();
        
        onSave(canvas.toDataURL('image/png'));
      };
      
      drawCanvas();
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-[2rem] p-8 max-w-lg w-full shadow-2xl space-y-8 animate-in zoom-in-95">
        <div className="text-center">
          <h3 className="text-2xl font-black text-slate-800">Ajustar Logo</h3>
          <p className="text-slate-500 text-sm">Arraste para posicionar e use o slider para o zoom</p>
        </div>

        <div 
          ref={containerRef}
          className="relative aspect-square w-full max-w-[300px] mx-auto overflow-hidden rounded-2xl bg-slate-100 border-4 border-white shadow-inner cursor-move touch-none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <img
            ref={imageRef}
            src={imageSrc}
            alt="Preview"
            draggable={false}
            className="absolute max-w-none transition-transform duration-75 select-none"
            style={{
              transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px)) scale(${zoom})`,
              left: '50%',
              top: '50%',
              width: '100%'
            }}
          />
          {/* Viewfinder overlay */}
          <div className="absolute inset-0 border-[20px] border-slate-900/20 pointer-events-none"></div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" /></svg>
            <input 
              type="range" 
              min="1" 
              max="4" 
              step="0.01" 
              value={zoom} 
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
          </div>
          
          <div className="flex gap-3 pt-4">
            <button 
              onClick={onCancel}
              className="flex-1 py-4 px-4 rounded-2xl font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Descartar
            </button>
            <button 
              onClick={handleSave}
              className="flex-1 py-4 px-4 rounded-2xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
            >
              Aplicar Logo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoEditor;
