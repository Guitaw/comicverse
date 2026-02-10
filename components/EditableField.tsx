
import React, { useState, useRef, useEffect } from 'react';
import AutoResizeTextarea from './AutoResizeTextarea';

interface EditableFieldProps {
  value: string;
  onChange: (newValue: string) => void;
  type?: 'input' | 'textarea';
  label?: string;
  placeholder?: string;
  className?: string;
  labelClassName?: string;
  accentColor?: string;
  readOnly?: boolean;
}

const EditableField: React.FC<EditableFieldProps> = ({
  value,
  onChange,
  type = 'input',
  label,
  placeholder,
  className = '',
  labelClassName = '',
  accentColor = 'indigo',
  readOnly = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    setTempValue(value);
  }, [value]);

  const handleSave = () => {
    onChange(tempValue);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && type === 'input') {
      handleSave();
    }
    if (e.key === 'Escape') {
      setTempValue(value);
      setIsEditing(false);
    }
  };

  const toggleEdit = () => {
    if (!readOnly) setIsEditing(true);
  };

  const colorMap: Record<string, string> = {
    indigo: 'text-indigo-600',
    emerald: 'text-emerald-600',
    slate: 'text-slate-600',
    red: 'text-red-600'
  };

  const accentClass = colorMap[accentColor] || colorMap.indigo;

  return (
    <div className="group/field w-full space-y-1">
      {label && (
        <label className={`block text-[10px] font-black uppercase tracking-widest text-slate-400 ${labelClassName}`}>
          {label}
        </label>
      )}
      
      <div className={`relative flex items-center gap-2 rounded-xl transition-all ${isEditing ? 'bg-white shadow-sm ring-1 ring-slate-200 p-1' : 'hover:bg-slate-50/50 cursor-pointer'}`}>
        <div className="flex-1 min-w-0" onClick={!isEditing ? toggleEdit : undefined}>
          {isEditing ? (
            type === 'textarea' ? (
              <AutoResizeTextarea
                autoFocus
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                onBlur={handleSave}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className={`w-full bg-transparent outline-none p-2 ${className}`}
              />
            ) : (
              <input
                autoFocus
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                onBlur={handleSave}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className={`w-full bg-transparent outline-none p-2 ${className}`}
              />
            )
          ) : (
            <div className={`p-2 min-h-[1.5rem] break-words ${className} ${!value ? 'text-slate-300 italic' : ''}`}>
              {value || placeholder || 'Clique para editar...'}
            </div>
          )}
        </div>

        {!readOnly && (
          <button 
            onClick={isEditing ? handleSave : toggleEdit}
            className={`p-2 rounded-lg transition-all shrink-0 ${isEditing ? 'text-emerald-500 bg-emerald-50' : 'text-slate-300 group-hover/field:text-indigo-400 opacity-0 group-hover/field:opacity-100'}`}
          >
            {isEditing ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default EditableField;
