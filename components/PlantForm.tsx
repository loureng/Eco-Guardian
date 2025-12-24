import { Edit2, Sprout, Layers, Wind, Loader2, Search, Camera, AlertCircle, X, Check } from 'lucide-react';

import React, { useState, useEffect } from 'react';
import { Plant, SunTolerance } from '../types';
import { Button } from './Button';
import { getPlantDetailsByName, identifyPlant } from '../services/geminiService';

interface Props {
  initialData: Partial<Plant>;
  imageUrl: string;
  onSave: (plant: Partial<Plant>) => void;
  onCancel: () => void;
  isManualEntry?: boolean;
}

const CATEGORIES = [
  "Suculenta", 
  "Cacto", 
  "Tropical", 
  "Samambaia", 
  "Erva", 
  "Folhagem", 
  "Flor", 
  "Árvore",
  "Trepadeira"
];

export const PlantForm: React.FC<Props> = ({ initialData, imageUrl, onSave, onCancel, isManualEntry = false }) => {
  const [formData, setFormData] = useState<Partial<Plant>>(initialData);
  const [localImage, setLocalImage] = useState<string>(imageUrl);
  const [isEditing, setIsEditing] = useState(isManualEntry);
  
  // Custom Category State
  const [isCustomCategory, setIsCustomCategory] = useState(false);

  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  useEffect(() => {
    setFormData(initialData);
    setLocalImage(imageUrl);
    setIsEditing(isManualEntry);

    // Check if category is custom (not in list and not empty/default)
    const cat = initialData.category;
    if (cat && !CATEGORIES.includes(cat) && cat !== "Geral") {
      setIsCustomCategory(true);
    } else {
      setIsCustomCategory(false);
    }
  }, [initialData, imageUrl, isManualEntry]);

  const handleChange = (field: keyof Plant, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setSearchError(null);
    
    try {
      const result = await getPlantDetailsByName(searchQuery);
      setFormData(prev => ({
        ...prev,
        ...result,
        commonName: result.commonName || searchQuery 
      }));
      
      // Update custom category state based on result
      if (result.category && !CATEGORIES.includes(result.category)) {
        setIsCustomCategory(true);
      } else {
        setIsCustomCategory(false);
      }

    } catch (error) {
      console.error(error);
      setSearchError("Não encontramos essa planta. Tente outro nome ou preencha manualmente.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleImageAutoFill = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzingImage(true);
    setSearchError(null);

    try {
      // Security & Performance: Resize and compress image
      // Prevents DoS (storage quota exceeded) and reduces payload size
      const { processImage } = await import('../services/imageService');
      const base64 = await processImage(file);

      setLocalImage(base64);

      // Chama Gemini Vision API
      const result = await identifyPlant(base64);
      setFormData(prev => ({
        ...prev,
        ...result
      }));

      // Update custom category state based on result
      if (result.category && !CATEGORIES.includes(result.category)) {
          setIsCustomCategory(true);
      } else {
          setIsCustomCategory(false);
      }
    } catch (error) {
      console.error("Erro ao processar imagem:", error);
      if (error instanceof Error) {
        setSearchError(error.message);
      } else {
        setSearchError("Não conseguimos processar essa imagem. Tente outra.");
      }
    } finally {
      setIsAnalyzingImage(false);
    }
  };

  const handleSave = () => {
    // Garante que a imagem local (possivelmente atualizada) seja enviada
    // E garante que campos extras da AI (descrição, origem, tips, fertilizer, soil, environment) sejam passados
    onSave({ ...formData, imageUrl: localImage });
  };

  if (!isEditing) {
    // Review Mode (Read-only)
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 space-y-4 animate-[fadeIn_0.3s_ease-out]">
        <h3 className="font-bold text-xl text-emerald-800 flex justify-between items-center">
          <span>Resultado da IA</span>
          <button onClick={() => setIsEditing(true)} className="text-sm text-emerald-600 font-medium flex items-center gap-1">
            <Edit2 size={14} /> Editar
          </button>
        </h3>
        
        <div className="space-y-3 text-slate-700">
           <div>
             <label className="text-xs font-bold uppercase text-slate-400">Nome Popular</label>
             <p className="font-medium text-lg">{formData.commonName}</p>
           </div>
           <div>
             <label className="text-xs font-bold uppercase text-slate-400">Nome Científico</label>
             <p className="italic">{formData.scientificName}</p>
           </div>
           
           {formData.description && (
             <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100">
               <label className="text-xs font-bold uppercase text-emerald-700">Sobre</label>
               <p className="text-sm italic text-emerald-900 mt-1">{formData.description}</p>
             </div>
           )}

           <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="text-xs font-bold uppercase text-slate-400">Categoria</label>
                <p className="text-sm">{formData.category || "Geral"}</p>
             </div>
             <div>
                <label className="text-xs font-bold uppercase text-slate-400">Regar a cada</label>
                <p className="text-sm">{formData.wateringFrequencyDays} dias</p>
             </div>
           </div>
           
           {/* New Fields Review */}
           {(formData.fertilizer || formData.soil || formData.environmentTips) && (
             <div className="grid grid-cols-1 gap-2 border-t border-slate-100 pt-3 mt-2">
                {formData.fertilizer && (
                  <div className="flex items-start gap-2 text-xs text-slate-600">
                    <Sprout size={14} className="mt-0.5 text-emerald-500 shrink-0"/>
                    <span><strong>Nutrição:</strong> {formData.fertilizer}</span>
                  </div>
                )}
                {formData.soil && (
                  <div className="flex items-start gap-2 text-xs text-slate-600">
                    <Layers size={14} className="mt-0.5 text-amber-600 shrink-0"/>
                    <span><strong>Solo:</strong> {formData.soil}</span>
                  </div>
                )}
                {formData.environmentTips && (
                  <div className="flex items-start gap-2 text-xs text-slate-600">
                    <Wind size={14} className="mt-0.5 text-blue-500 shrink-0"/>
                    <span><strong>Ambiente:</strong> {formData.environmentTips}</span>
                  </div>
                )}
             </div>
           )}

        </div>

        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={onCancel}>Tentar Novamente</Button>
          <Button onClick={handleSave}>Confirmar e Salvar</Button>
        </div>
      </div>
    );
  }

  // Edit Mode (Form) - Same as before
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-xl text-slate-800">
          {isManualEntry ? "Adicionar Detalhes" : "Editar Detalhes"}
        </h3>
        {/* Mini Preview da Imagem no Header do Form */}
        <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
           <img src={localImage} alt="Plant" className="w-full h-full object-cover" />
           {isAnalyzingImage && (
             <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
               <Loader2 className="text-white animate-spin w-5 h-5" />
             </div>
           )}
        </div>
      </div>

      {/* Internal Search & Photo Feature */}
      <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100 mb-4 transition-all space-y-3">
        
        {/* Opção 1: Texto */}
        <div>
          <label className="block text-xs font-bold uppercase text-emerald-700 mb-2">Preencher com IA (Texto)</label>
          <div className="flex gap-2">
            <input 
              className={`flex-1 p-2 border border-emerald-200 rounded-lg text-sm focus:outline-emerald-500 transition-colors ${isSearching ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-white'}`}
              placeholder="Digite o nome da planta..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !isSearching && handleSearch()}
              disabled={isSearching || isAnalyzingImage}
              maxLength={100}
            />
            <button 
              onClick={handleSearch}
              disabled={isSearching || isAnalyzingImage || !searchQuery.trim()}
              className="bg-emerald-600 text-white px-3 py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all min-w-[44px] flex items-center justify-center"
            >
              {isSearching ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
           <div className="h-px bg-emerald-200 flex-1"></div>
           <span className="text-[10px] text-emerald-600 font-bold">OU</span>
           <div className="h-px bg-emerald-200 flex-1"></div>
        </div>

        {/* Opção 2: Foto */}
        <div>
           <label className="block text-xs font-bold uppercase text-emerald-700 mb-2">Identificar por Foto</label>
           <div className="relative">
             <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageAutoFill}
                disabled={isSearching || isAnalyzingImage}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
             />
             <button className="w-full flex items-center justify-center gap-2 bg-white border border-emerald-200 text-emerald-700 py-2 rounded-lg hover:bg-emerald-100 transition-colors font-medium text-sm">
                {isAnalyzingImage ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
                {isAnalyzingImage ? "Analisando Imagem..." : "Tirar Foto / Galeria"}
             </button>
           </div>
        </div>
        
        {/* Error Feedback */}
        {searchError && (
          <div className="p-2 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2 animate-[fadeIn_0.2s_ease-out]">
            <AlertCircle size={14} className="text-red-500 shrink-0" />
            <p className="text-xs text-red-600 font-medium leading-tight">{searchError}</p>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Nome Popular</label>
          <input 
            className="w-full p-2 border border-slate-200 rounded-lg"
            value={formData.commonName || ''}
            onChange={e => handleChange('commonName', e.target.value)}
            placeholder="ex: Espada de São Jorge"
            maxLength={50}
          />
        </div>
        
        <div>
          <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Nome Científico</label>
          <input 
            className="w-full p-2 border border-slate-200 rounded-lg italic"
            value={formData.scientificName || ''}
            onChange={e => handleChange('scientificName', e.target.value)}
            placeholder="ex: Sansevieria trifasciata"
            maxLength={100}
          />
        </div>

        {/* Category Selection Field */}
        <div>
           <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Categoria</label>
           
           {!isCustomCategory ? (
             <select 
               className="w-full p-2 border border-slate-200 rounded-lg bg-white"
               value={CATEGORIES.includes(formData.category || "") ? formData.category : (formData.category ? "custom" : "")}
               onChange={(e) => {
                 const val = e.target.value;
                 if (val === 'custom') {
                   setIsCustomCategory(true);
                   handleChange('category', ''); // Clear to let user type
                 } else {
                   handleChange('category', val);
                 }
               }}
             >
               <option value="" disabled>Selecione uma categoria...</option>
               {CATEGORIES.map(cat => (
                 <option key={cat} value={cat}>{cat}</option>
               ))}
               <option value="custom">Outro (Personalizado)...</option>
             </select>
           ) : (
             <div className="flex gap-2 animate-[fadeIn_0.2s_ease-out]">
               <input 
                 className="flex-1 p-2 border border-slate-200 rounded-lg"
                 placeholder="Digite a categoria (ex: Orquídea)..."
                 value={formData.category || ''}
                 onChange={(e) => handleChange('category', e.target.value)}
                 autoFocus
               />
               <button 
                 onClick={() => {
                   setIsCustomCategory(false);
                   if (formData.category && CATEGORIES.includes(formData.category)) {
                      // Keep it
                   } else {
                      handleChange('category', CATEGORIES[0]);
                   }
                 }}
                 className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
                 title="Voltar para lista"
               >
                 <X size={20} />
               </button>
             </div>
           )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Frequência de Rega (Dias)</label>
            <input 
              type="number"
              min="1"
              placeholder="Ex: 7"
              className="w-full p-2 border border-slate-200 rounded-lg"
              value={formData.wateringFrequencyDays || ''}
              onChange={e => handleChange('wateringFrequencyDays', parseInt(e.target.value))}
            />
          </div>
          <div>
             <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Sol</label>
             <select 
               className="w-full p-2 border border-slate-200 rounded-lg bg-white"
               value={formData.sunTolerance || SunTolerance.PARTIAL}
               onChange={e => handleChange('sunTolerance', e.target.value)}
             >
               {Object.values(SunTolerance).map(t => (
                 <option key={t} value={t}>{t}</option>
               ))}
             </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
           <div>
             <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Min Temp (°C)</label>
             <input type="number" className="w-full p-2 border border-slate-200 rounded-lg" value={formData.minTemp || 0} onChange={e => handleChange('minTemp', parseInt(e.target.value))} />
           </div>
           <div>
             <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Máx Temp (°C)</label>
             <input type="number" className="w-full p-2 border border-slate-200 rounded-lg" value={formData.maxTemp || 35} onChange={e => handleChange('maxTemp', parseInt(e.target.value))} />
           </div>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button onClick={handleSave} disabled={isSearching || isAnalyzingImage}>
          <Check size={18} /> Salvar Planta
        </Button>
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};
