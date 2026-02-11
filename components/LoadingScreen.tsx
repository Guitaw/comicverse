
import React, { useState, useEffect } from 'react';

interface Props {
  onFinished: () => void;
}

const LoadingScreen: React.FC<Props> = ({ onFinished }) => {
  const [text, setText] = useState('');
  const [isFadingOut, setIsFadingOut] = useState(false);
  const fullText = "GERANDO MULTIVERSO...";

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setText(fullText.slice(0, i));
      i++;
      if (i > fullText.length) {
        clearInterval(interval);
        setTimeout(() => {
          setIsFadingOut(true);
          // Tempo para a animação de fade-out do Tailwind completar
          setTimeout(onFinished, 800);
        }, 1200);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [onFinished]);

  return (
    <div className={`fixed inset-0 z-[1000] bg-white flex flex-col items-center justify-center transition-opacity duration-700 ${isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
      <div className="relative mb-8">
        {/* Ícone de Globo Animado */}
        <div className="w-24 h-24 text-indigo-600 animate-[spin_4s_linear_infinite]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
        </div>
        {/* Efeito de Brilho Pulsante */}
        <div className="absolute inset-0 bg-indigo-400 blur-3xl opacity-20 animate-pulse rounded-full"></div>
      </div>
      
      <div className="flex flex-col items-center gap-4">
        <h2 className="comic-font text-2xl text-slate-800 tracking-widest h-8">
          {text}
        </h2>
        <div className="w-48 h-1 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-indigo-600 animate-[loading-bar_2s_ease-in-out_infinite]"></div>
        </div>
      </div>

      <style>{`
        @keyframes loading-bar {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;
