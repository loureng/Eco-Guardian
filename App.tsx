
import React, { useState, useEffect, useCallback } from 'react';
import { UserProfile, Plant, UserLocation, WeatherData, SunTolerance, Achievement, DwellingType } from './types';
import { loadUser, saveUser } from './services/storageService';
import { identifyPlant, getPlantDetailsByName, generatePlantImage } from './services/geminiService';
import { fetchLocalWeather } from './services/weatherService';
import { getAggregateAlerts } from './services/plantLogic';
import { requestNotificationPermission, processAlertsForNotifications } from './services/notificationService';
import { checkNewAchievements, ACHIEVEMENTS } from './services/gamificationService';
import { DEFAULT_PLANT_IMAGE } from './constants';

import { Button } from './components/Button';
import { PlantCard } from './components/PlantCard';
import { WeatherWidget } from './components/WeatherWidget';
import { DashboardSummary } from './components/DashboardSummary';
import { AgendaView } from './components/AgendaView';
import { PlantForm } from './components/PlantForm';
import { ErrorNotification } from './components/ErrorNotification';
import { ConfirmationModal } from './components/ConfirmationModal';
import { AchievementPopup } from './components/AchievementPopup';
import { StatisticsSection } from './components/StatisticsSection';
import { CalendarModal } from './components/CalendarModal';
import { Chatbot } from './components/Chatbot';
import { 
  Plus, Leaf, Camera, RefreshCw, Search, Sprout, Trees, Flower2, Droplets, Trophy, Lock, 
  Menu, X, LogOut, ChevronRight, CalendarDays, Home, Building
} from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [view, setView] = useState<'welcome' | 'dashboard' | 'agenda' | 'add-plant' | 'profile'>('welcome');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  
  // Menu State
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Error State
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Achievement State
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);
  
  // Delete State
  const [plantToDelete, setPlantToDelete] = useState<string | null>(null);

  // Calendar State
  const [calendarModalOpen, setCalendarModalOpen] = useState(false);
  const [plantToSchedule, setPlantToSchedule] = useState<{plant: Plant, date: Date} | null>(null);
  
  // Add Plant State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [plantFormData, setPlantFormData] = useState<Partial<Plant> | null>(null);
  const [isManualEntry, setIsManualEntry] = useState(false);
  const [searchName, setSearchName] = useState("");

  // Welcome Screen State
  const [selectedDwelling, setSelectedDwelling] = useState<DwellingType>('Apartamento');

  // Helper to trigger errors
  const triggerError = (msg: string) => {
    setErrorMessage(msg);
  };

  // Helper for icons mapping in profile
  const getBadgeIcon = (name: string, size: number = 20) => {
    switch (name) {
      case 'Sprout': return <Sprout size={size} />;
      case 'Trees': return <Trees size={size} />;
      case 'Flower2': return <Flower2 size={size} />;
      case 'Droplets': return <Droplets size={size} />;
      default: return <Trophy size={size} />;
    }
  };

  // Initialize App
  useEffect(() => {
    const storedUser = loadUser();
    if (storedUser) {
      if (!storedUser.unlockedAchievements) {
        storedUser.unlockedAchievements = [];
      }
      storedUser.plants = storedUser.plants.map(p => ({
        ...p,
        wateringHistory: p.wateringHistory || (p.lastWatered ? [p.lastWatered] : [])
      }));

      setUser(storedUser);
      setView('dashboard');
      refreshWeather(storedUser.location, storedUser.plants);
      requestNotificationPermission(); 
    }
  }, []);

  // Save user changes
  useEffect(() => {
    if (user) saveUser(user);
  }, [user]);

  const refreshWeather = async (loc: UserLocation | null, plants?: Plant[]) => {
    if (!loc) return;
    setWeatherLoading(true);
    try {
      const data = await fetchLocalWeather(loc);
      setWeather(data);
      if (plants && plants.length > 0) {
        const alerts = getAggregateAlerts(plants, data);
        if (alerts.length > 0) processAlertsForNotifications(alerts);
      }
    } catch (e) {
      console.error(e);
      triggerError("Não foi possível atualizar o clima. Verifique sua conexão.");
    } finally {
      setWeatherLoading(false);
    }
  };

  // Navigation Helper
  const navigateTo = (target: 'welcome' | 'dashboard' | 'agenda' | 'add-plant' | 'profile') => {
    setView(target);
    setIsMenuOpen(false);
    if (target === 'add-plant') resetAddPlant();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- Logic Functions (Login, Image, etc) ---
  
  const handleLogin = () => {
    if (!navigator.geolocation) {
      triggerError("Seu navegador não suporta ou bloqueou a geolocalização.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newUser: UserProfile = {
          id: Date.now().toString(),
          name: "Jardineiro",
          dwellingType: selectedDwelling,
          location: { latitude: position.coords.latitude, longitude: position.coords.longitude, city: "Meu Jardim" },
          plants: [],
          unlockedAchievements: []
        };
        setUser(newUser);
        setView('dashboard');
        refreshWeather(newUser.location, []);
        requestNotificationPermission();
      },
      (error) => { console.error(error); triggerError("Erro ao obter localização. Habilite o GPS."); },
      { timeout: 10000 }
    );
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { triggerError("Imagem muito grande."); return; }
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      setCapturedImage(base64);
      setIsAnalyzing(true);
      setIsManualEntry(false);
      try {
        const result = await identifyPlant(base64);
        setPlantFormData(result);
      } catch (err) {
        console.error(err);
        triggerError("Erro na identificação. Tente manual.");
        handleManualFallback();
      } finally { setIsAnalyzing(false); }
    };
    reader.readAsDataURL(file);
  };

  const handleNameSearch = async () => {
    if (!searchName.trim()) return;
    setIsAnalyzing(true);
    setCapturedImage(null);
    setIsManualEntry(false);
    try {
      const [details, generatedImage] = await Promise.all([
        getPlantDetailsByName(searchName),
        generatePlantImage(searchName)
      ]);
      setPlantFormData(details);
      setCapturedImage(generatedImage || DEFAULT_PLANT_IMAGE);
    } catch (err) {
      console.error(err);
      triggerError("IA indisponível. Preencha manual.");
      handleManualFallback();
    } finally { setIsAnalyzing(false); }
  };

  const handleManualFallback = () => {
    setPlantFormData({ commonName: "", scientificName: "", wateringFrequencyDays: 7, sunTolerance: SunTolerance.PARTIAL, minTemp: 10, maxTemp: 30 });
    if (!capturedImage) setCapturedImage(DEFAULT_PLANT_IMAGE);
    setIsManualEntry(true);
  };

  const handleManualEntryStart = () => {
    setCapturedImage(DEFAULT_PLANT_IMAGE);
    handleManualFallback();
  };

  const handleSavePlant = (data: Partial<Plant>) => {
    if (!user) return;
    if (!data.commonName || data.commonName.trim() === "") { triggerError("Nome obrigatório."); return; }
    
    // Check if the form returned a specific image (e.g., user re-took photo in form),
    // otherwise fallback to the initial captured image, then default.
    const finalImageUrl = data.imageUrl || capturedImage || DEFAULT_PLANT_IMAGE;

    const finalPlant: Plant = {
      id: Date.now().toString(),
      imageUrl: finalImageUrl,
      lastWatered: Date.now(),
      wateringHistory: [Date.now()],
      scientificName: data.scientificName || "Desconhecido",
      commonName: data.commonName,
      wateringFrequencyDays: data.wateringFrequencyDays || 7,
      sunTolerance: data.sunTolerance || SunTolerance.PARTIAL,
      minTemp: data.minTemp || 10,
      maxTemp: data.maxTemp || 35,
      category: data.category || "Geral",
      // New fields safety check
      description: data.description,
      origin: data.origin,
      careTips: data.careTips,
      fertilizer: data.fertilizer,
      soil: data.soil,
      environmentTips: data.environmentTips
    };
    
    const updatedPlants = [finalPlant, ...user.plants];
    const updatedUser = { ...user, plants: updatedPlants };
    
    const unlocked = checkNewAchievements(updatedUser, 'PLANT_ADDED');
    if (unlocked.length > 0) {
      updatedUser.unlockedAchievements = [...(updatedUser.unlockedAchievements || []), ...unlocked.map(a => a.id)];
      setNewAchievement(unlocked[0]);
    }

    setUser(updatedUser);
    setCapturedImage(null);
    setPlantFormData(null);
    setIsManualEntry(false);
    setSearchName("");
    setView('dashboard');
    refreshWeather(user.location, updatedPlants);
  };

  const handleWater = useCallback((id: string) => {
    if(!user) return;
    const now = Date.now();
    const updatedPlants = user.plants.map(p => p.id === id ? { ...p, lastWatered: now, wateringHistory: [...(p.wateringHistory || []), now] } : p);
    const updatedUser = { ...user, plants: updatedPlants };
    const unlocked = checkNewAchievements(updatedUser, 'WATERED');
    if (unlocked.length > 0) {
      updatedUser.unlockedAchievements = [...(updatedUser.unlockedAchievements || []), ...unlocked.map(a => a.id)];
      setNewAchievement(unlocked[0]);
    }
    setUser(updatedUser);
  }, [user]);

  const handleDeleteRequest = useCallback((id: string) => setPlantToDelete(id), []);
  
  const confirmDelete = () => {
    if (!user || !plantToDelete) return;
    const updatedPlants = user.plants.filter(p => p.id !== plantToDelete);
    setUser({ ...user, plants: updatedPlants });
    setPlantToDelete(null);
  };

  const handleScheduleRequest = useCallback((plant: Plant, date: Date) => {
    setPlantToSchedule({ plant, date });
    setCalendarModalOpen(true);
  }, []);

  const resetAddPlant = () => {
    setCapturedImage(null);
    setPlantFormData(null);
    setIsManualEntry(false);
    setSearchName("");
  };

  // --- Render ---

  if (view === 'welcome') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-emerald-50 text-center relative">
        <ErrorNotification message={errorMessage} onClose={() => setErrorMessage(null)} />
        <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-6 shadow-sm">
          <Leaf className="w-12 h-12 text-emerald-600" />
        </div>
        <h1 className="text-3xl font-bold text-emerald-900 mb-2">EcoGuardian</h1>
        <p className="text-slate-600 mb-8 max-w-xs mx-auto leading-relaxed">
          Site inteligente de cuidado de plantas com IA Gemini.
        </p>

        <div className="w-full max-w-xs mx-auto bg-white p-4 rounded-xl shadow-sm border border-emerald-100 mb-6">
           <label className="block text-xs font-bold uppercase text-slate-400 mb-3 text-left">Onde é o seu jardim?</label>
           <div className="flex gap-2">
             <button 
               onClick={() => setSelectedDwelling('Casa')}
               className={`flex-1 flex flex-col items-center p-3 rounded-lg border-2 transition-all ${selectedDwelling === 'Casa' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-100 text-slate-400 hover:border-emerald-200'}`}
             >
                <Home size={24} className="mb-1" />
                <span className="text-sm font-bold">Casa</span>
             </button>
             <button 
               onClick={() => setSelectedDwelling('Apartamento')}
               className={`flex-1 flex flex-col items-center p-3 rounded-lg border-2 transition-all ${selectedDwelling === 'Apartamento' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-100 text-slate-400 hover:border-emerald-200'}`}
             >
                <Building size={24} className="mb-1" />
                <span className="text-sm font-bold">Apto</span>
             </button>
           </div>
        </div>

        <div className="w-full max-w-xs mx-auto">
          <Button onClick={handleLogin}>
            Entrar com Google e Localização
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative">
      <ErrorNotification message={errorMessage} onClose={() => setErrorMessage(null)} />
      <AchievementPopup achievement={newAchievement} onClose={() => setNewAchievement(null)} />
      <ConfirmationModal 
        isOpen={!!plantToDelete} title="Excluir Planta" message="Tem certeza? Ação irreversível."
        onConfirm={confirmDelete} onCancel={() => setPlantToDelete(null)}
      />
      <CalendarModal 
        isOpen={calendarModalOpen} plant={plantToSchedule?.plant || null} nextDate={plantToSchedule?.date || null}
        onClose={() => setCalendarModalOpen(false)}
      />

      {/* Global Chatbot */}
      {user && <Chatbot user={user} />}

      {/* WEB HEADER (Site Navigation) */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 h-16 flex justify-between items-center">
          
          {/* Logo Area */}
          <div 
            onClick={() => navigateTo('dashboard')} 
            className="flex items-center gap-2 cursor-pointer select-none group"
          >
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Leaf size={18} fill="currentColor" />
            </div>
            <span className="font-bold text-lg text-slate-800 tracking-tight">EcoGuardian</span>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {view === 'dashboard' && (
              <button 
                onClick={() => refreshWeather(user?.location || null, user?.plants)} 
                className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-slate-50 rounded-full transition-all"
                title="Atualizar Clima"
              >
                <RefreshCw size={20} className={weatherLoading ? "animate-spin text-emerald-600" : ""} />
              </button>
            )}
            
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`p-2 rounded-lg transition-colors ${isMenuOpen ? 'bg-slate-100 text-slate-800' : 'text-slate-600 hover:bg-slate-50'}`}
              aria-label="Menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMenuOpen && (
          <div className="absolute top-16 left-0 w-full bg-white border-b border-slate-100 shadow-xl animate-[slideDown_0.2s_ease-out]">
            <nav className="max-w-3xl mx-auto p-2 flex flex-col gap-1">
              <button 
                onClick={() => navigateTo('dashboard')}
                className={`flex items-center justify-between p-4 rounded-xl text-left ${view === 'dashboard' ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <div className="flex items-center gap-3">
                   <div className="bg-white/50 p-1.5 rounded-md"><Trees size={18} /></div>
                   Meu Jardim
                </div>
                {view === 'dashboard' && <div className="w-2 h-2 bg-emerald-500 rounded-full" />}
              </button>

              <button 
                onClick={() => navigateTo('agenda')}
                className={`flex items-center justify-between p-4 rounded-xl text-left ${view === 'agenda' ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <div className="flex items-center gap-3">
                   <div className="bg-white/50 p-1.5 rounded-md"><CalendarDays size={18} /></div>
                   Agenda & Calendário
                </div>
                {view === 'agenda' && <div className="w-2 h-2 bg-emerald-500 rounded-full" />}
              </button>

              <button 
                onClick={() => navigateTo('add-plant')}
                className={`flex items-center justify-between p-4 rounded-xl text-left ${view === 'add-plant' ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <div className="flex items-center gap-3">
                   <div className="bg-white/50 p-1.5 rounded-md"><Plus size={18} /></div>
                   Adicionar Planta
                </div>
                {view === 'add-plant' && <div className="w-2 h-2 bg-emerald-500 rounded-full" />}
              </button>

              <button 
                onClick={() => navigateTo('profile')}
                className={`flex items-center justify-between p-4 rounded-xl text-left ${view === 'profile' ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <div className="flex items-center gap-3">
                   <div className="bg-white/50 p-1.5 rounded-md"><Trophy size={18} /></div>
                   Perfil & Conquistas
                </div>
                {view === 'profile' && <div className="w-2 h-2 bg-emerald-500 rounded-full" />}
              </button>
              
              <div className="h-px bg-slate-100 my-1 mx-4"></div>

              <button 
                onClick={() => {
                   localStorage.clear();
                   window.location.reload();
                }}
                className="flex items-center gap-3 p-4 rounded-xl text-left text-red-600 hover:bg-red-50"
              >
                 <LogOut size={18} />
                 Sair
              </button>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content - Auto Height */}
      <main className="flex-1 w-full max-w-3xl mx-auto p-4 sm:p-6 pb-20">
        
        {view === 'dashboard' && (
          <div className="space-y-8 animate-[fadeIn_0.3s_ease-out]">
            <WeatherWidget weather={weather} isLoading={weatherLoading} />
            
            {user && (
              <DashboardSummary plants={user.plants} weather={weather} />
            )}

            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-800">Minhas Plantas</h2>
                <button 
                  onClick={() => navigateTo('add-plant')}
                  className="text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-full hover:bg-emerald-100 transition-colors"
                >
                  <Plus size={16} /> Nova
                </button>
              </div>
              
              {user?.plants.length === 0 ? (
                 <div className="text-center py-16 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                   <Sprout className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                   <h3 className="text-lg font-bold text-slate-700 mb-2">Jardim vazio</h3>
                   <p className="text-slate-500 mb-6">Comece sua jornada verde agora.</p>
                   <Button variant="primary" onClick={() => navigateTo('add-plant')} className="w-auto mx-auto px-8">
                     Adicionar Primeira Planta
                   </Button>
                 </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {user?.plants.map(plant => (
                    <PlantCard 
                      key={plant.id} 
                      plant={plant} 
                      weather={weather} 
                      onWater={handleWater} 
                      onDelete={handleDeleteRequest}
                      onSchedule={handleScheduleRequest}
                    />
                  ))}
                  
                  {/* Card to add new plant inline */}
                  <button 
                    onClick={() => navigateTo('add-plant')}
                    className="min-h-[300px] rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-3 text-slate-400 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50/50 transition-all group"
                  >
                    <div className="w-12 h-12 rounded-full bg-slate-100 group-hover:bg-emerald-100 flex items-center justify-center transition-colors">
                       <Plus size={24} />
                    </div>
                    <span className="font-medium">Adicionar Outra</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Nova View: Agenda */}
        {view === 'agenda' && (
           <AgendaView 
             plants={user?.plants || []} 
             weather={weather}
             onWater={handleWater}
             onSchedule={handleScheduleRequest}
           />
        )}

        {view === 'add-plant' && (
          <div className="animate-[fadeIn_0.3s_ease-out]">
            <div className="mb-6 flex items-center gap-2 text-sm text-slate-500">
               <span onClick={() => navigateTo('dashboard')} className="cursor-pointer hover:text-emerald-600">Home</span>
               <ChevronRight size={14} />
               <span className="font-bold text-slate-800">Nova Planta</span>
            </div>

            <h1 className="text-2xl font-bold text-slate-800 mb-6">Cadastrar Planta</h1>

            {!capturedImage ? (
              <div className="space-y-6">
                {/* Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Option 1: Camera */}
                  <div className="relative overflow-hidden group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all cursor-pointer">
                    <input 
                      type="file" 
                      accept="image/*" 
                      capture="environment"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      onChange={handleImageUpload}
                    />
                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-4 group-hover:scale-110 transition-transform">
                      <Camera size={24} />
                    </div>
                    <h3 className="font-bold text-lg text-slate-800 mb-1">Tirar Foto</h3>
                    <p className="text-sm text-slate-500">Use a câmera ou galeria para identificar automaticamente.</p>
                  </div>

                  {/* Option 2: Search by Name */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                     <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-4">
                        <Search size={24} />
                     </div>
                     <h3 className="font-bold text-lg text-slate-800 mb-3">Buscar por Nome</h3>
                     <div className="flex gap-2">
                       <input 
                         type="text" 
                         value={searchName}
                         onChange={(e) => setSearchName(e.target.value)}
                         placeholder="Ex: Jiboia"
                         className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-emerald-500"
                       />
                       <Button 
                         onClick={handleNameSearch} 
                         disabled={!searchName.trim() || isAnalyzing}
                         className="w-auto px-4 py-2"
                       >
                          <Search size={18} />
                       </Button>
                     </div>
                     <p className="text-xs text-slate-400 mt-2">Gera imagem IA e ficha técnica.</p>
                  </div>
                </div>

                <div className="text-center">
                   <button onClick={handleManualEntryStart} className="text-sm text-slate-500 hover:text-emerald-600 font-medium underline underline-offset-4">
                      Prefiro preencher tudo manualmente
                   </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <div className="relative rounded-xl overflow-hidden shadow-inner h-64 bg-slate-50 mb-6">
                   <img src={capturedImage} alt="Preview" className="w-full h-full object-contain" />
                </div>
                
                {isAnalyzing ? (
                   <div className="text-center py-8">
                     <RefreshCw className="w-10 h-10 text-emerald-500 animate-spin mx-auto mb-4" />
                     <h3 className="font-bold text-lg text-slate-800">Consultando Gemini IA...</h3>
                     <p className="text-slate-500">
                       {searchName ? "Gerando imagem fotorrealista e buscando dados..." : "Analisando espécie e cuidados..."}
                     </p>
                   </div>
                ) : plantFormData ? (
                   <PlantForm 
                     initialData={plantFormData}
                     imageUrl={capturedImage}
                     onSave={handleSavePlant}
                     onCancel={resetAddPlant}
                     isManualEntry={isManualEntry}
                   />
                ) : null}
              </div>
            )}
          </div>
        )}

        {view === 'profile' && (
          <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
            <div className="mb-4 flex items-center gap-2 text-sm text-slate-500">
               <span onClick={() => navigateTo('dashboard')} className="cursor-pointer hover:text-emerald-600">Home</span>
               <ChevronRight size={14} />
               <span className="font-bold text-slate-800">Perfil</span>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-emerald-50 to-white z-0"></div>
              <div className="relative z-10">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-emerald-600 font-bold text-3xl mx-auto shadow-md mb-4 border-4 border-emerald-50">
                  {user?.name.charAt(0)}
                </div>
                <h2 className="font-bold text-2xl text-slate-900">{user?.name}</h2>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <div className="inline-flex items-center gap-1 bg-slate-100 px-3 py-1 rounded-full">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">Jardineiro Ativo</p>
                  </div>
                  {user?.dwellingType && (
                     <div className="inline-flex items-center gap-1 bg-indigo-50 px-3 py-1 rounded-full text-indigo-700">
                        {user.dwellingType === 'Casa' ? <Home size={12}/> : <Building size={12}/>}
                        <p className="text-xs font-bold uppercase tracking-wide">{user.dwellingType}</p>
                     </div>
                  )}
                </div>
              </div>
            </div>

            {/* Statistics */}
            {user && (
              <div>
                <h3 className="font-bold text-lg text-slate-800 mb-4 px-1">Estatísticas</h3>
                <StatisticsSection plants={user.plants} weather={weather} />
              </div>
            )}

            {/* Achievements */}
            <div>
              <h3 className="font-bold text-lg text-slate-800 mb-4 px-1 flex items-center gap-2">
                <Trophy size={20} className="text-yellow-500" /> 
                Galeria de Conquistas
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                {ACHIEVEMENTS.map(ach => {
                  const isUnlocked = user?.unlockedAchievements?.includes(ach.id);
                  return (
                    <div 
                      key={ach.id}
                      className={`p-4 rounded-2xl border transition-all ${isUnlocked ? 'bg-white border-emerald-100 shadow-sm' : 'bg-slate-50 border-slate-100 opacity-60 grayscale'}`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white shadow-sm ${isUnlocked ? ach.color : 'bg-slate-300'}`}>
                          {isUnlocked ? getBadgeIcon(ach.icon) : <Lock size={16} />}
                        </div>
                        {isUnlocked && <div className="text-[10px] font-bold bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">OK</div>}
                      </div>
                      <h4 className="font-bold text-sm text-slate-800 mb-1">{ach.title}</h4>
                      <p className="text-xs text-slate-500 leading-snug">{ach.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Styles for Menu Animation */}
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default App;
