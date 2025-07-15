"use client";

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { toast } from 'sonner';
import { LoadingScreen } from '@/components/loading-screen';

// --- Tipos de Datos ---
export interface Narrator {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  temperature: number;
  maxLength: number;
  tone: string;
}

export interface PlayerCharacter {
  id: string;
  name: string;
  description: string;
}

export type NonPlayerCharacter = PlayerCharacter; // Alias, ya que la estructura es la misma

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  authorId: string;
  authorName: string;
}

interface Session {
  id: string;
  name: string;
}

export interface Adventure {
  id: string;
  name: string;
  premise: string;
  sessions: Session[];
}

export interface Location {
  id: string;
  name: string;
  type: string; // e.g., "Ciudad", "Ruina", "Dungeon"
  description: string;
}

export interface Faction {
  id: string;
  name: string;
  description: string;
  keyLeaders: string; // Comma-separated names or brief descriptions
  relationships: string; // Free text for now, e.g., "Aliado con X, Enemigo de Y"
}

export interface GlossaryTerm {
  id: string;
  term: string;
  definition: string;
}

export interface ImportantItem {
  id: string;
  name: string;
  description: string;
  properties: string; // e.g., "Otorga +2 a la fuerza, brilla en presencia de orcos"
}

export interface HouseRule {
  id: string;
  title: string;
  rule: string;
}

export interface Campaign {
  id: string;
  name: string;
  worldDescription: string; // Nueva: Descripción general del mundo
  uniqueFeatures: string; // Nueva: Características únicas o leyes del mundo
  worldTone: string; // Nueva: Tono general del mundo
  adventures: Adventure[];
  playerCharacters: PlayerCharacter[];
  nonPlayerCharacters: NonPlayerCharacter[]; // PNJs de aventura
  campaignNpcs: NonPlayerCharacter[]; // Nueva: PNJs recurrentes a nivel de campaña
  locations: Location[]; // Nueva
  factions: Faction[]; // Nueva
  glossary: GlossaryTerm[]; // Nueva
  importantItems: ImportantItem[]; // Nueva
  houseRules: HouseRule[]; // Nueva
}

type ChatHistories = Record<string, Message[]>; // Keyed by session ID

export type SceneControl = 'player' | 'ai' | 'absent';
export type SceneStates = Record<string, Record<string, SceneControl>>; // sessionID -> characterID -> control

// --- Tipo del Contexto ---
interface ChatContextType {
  activeProvider: string;
  setActiveProvider: (provider: string) => void;
  campaigns: Campaign[];
  addCampaign: (campaignName: string) => void;
  updateCampaign: (campaignId: string, campaignData: Partial<Omit<Campaign, 'id' | 'adventures' | 'playerCharacters' | 'nonPlayerCharacters' | 'locations' | 'factions' | 'glossary' | 'importantItems' | 'houseRules'>>) => void; // Nueva
  deleteCampaign: (campaignId: string) => void;
  addAdventure: (campaignId: string, adventureData: { name: string; premise: string }) => void;
  updateAdventure: (adventureId: string, adventureData: Omit<Adventure, 'id' | 'sessions'>) => void;
  addSession: (adventureId: string, sessionName: string) => void;
  activeSessionId: string | null;
  setActiveSessionId: (sessionId: string) => void;
  getActiveSession: () => Session | undefined;
  getActiveAdventure: () => Adventure | undefined;
  getActiveCampaign: () => Campaign | undefined;
  
  activeNarrator: Narrator;
  setActiveNarrator: (narratorId: string) => void;
  narrators: Narrator[];
  addNarrator: (narrator: Omit<Narrator, 'id'>) => void;
  updateNarrator: (narratorId: string, narratorData: Omit<Narrator, 'id'>) => void;

  playerCharacters: PlayerCharacter[]; // Characters of the active campaign
  addPlayerCharacter: (campaignId: string, pc: Omit<PlayerCharacter, 'id'>) => void;
  updatePlayerCharacter: (campaignId: string, pcId: string, pcData: Omit<PlayerCharacter, 'id'>) => void;

  nonPlayerCharacters: NonPlayerCharacter[]; // NPCs of the active campaign (adventure-specific)
  addNonPlayerCharacter: (campaignId: string, npc: Omit<NonPlayerCharacter, 'id'>) => void;
  updateNonPlayerCharacter: (campaignId: string, npcId: string, npcData: Omit<NonPlayerCharacter, 'id'>) => void;
  deleteNonPlayerCharacter: (campaignId: string, npcId: string) => void; // Nueva para PNJs de aventura

  campaignNpcs: NonPlayerCharacter[]; // PNJs recurrentes de la campaña
  addCampaignNpc: (campaignId: string, npc: Omit<NonPlayerCharacter, 'id'>) => void; // Nueva
  updateCampaignNpc: (campaignId: string, npcId: string, npcData: Omit<NonPlayerCharacter, 'id'>) => void; // Nueva
  deleteCampaignNpc: (campaignId: string, npcId: string) => void; // Nueva

  locations: Location[];
  addLocation: (campaignId: string, location: Omit<Location, 'id'>) => void;
  updateLocation: (campaignId: string, locationId: string, locationData: Omit<Location, 'id'>) => void;
  deleteLocation: (campaignId: string, locationId: string) => void;

  factions: Faction[];
  addFaction: (campaignId: string, faction: Omit<Faction, 'id'>) => void;
  updateFaction: (campaignId: string, factionId: string, factionData: Omit<Faction, 'id'>) => void;
  deleteFaction: (campaignId: string, factionId: string) => void;

  glossary: GlossaryTerm[];
  addGlossaryTerm: (campaignId: string, term: Omit<GlossaryTerm, 'id'>) => void;
  updateGlossaryTerm: (campaignId: string, termId: string, termData: Omit<GlossaryTerm, 'id'>) => void;
  deleteGlossaryTerm: (campaignId: string, termId: string) => void;

  importantItems: ImportantItem[];
  addImportantItem: (campaignId: string, item: Omit<ImportantItem, 'id'>) => void;
  updateImportantItem: (campaignId: string, itemId: string, itemData: Omit<ImportantItem, 'id'>) => void;
  deleteImportantItem: (campaignId: string, itemId: string) => void;

  houseRules: HouseRule[];
  addHouseRule: (campaignId: string, rule: Omit<HouseRule, 'id'>) => void;
  updateHouseRule: (campaignId: string, ruleId: string, ruleData: Omit<HouseRule, 'id'>) => void;
  deleteHouseRule: (campaignId: string, ruleId: string) => void;

  messages: Message[];
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  clearMessages: () => void;

  sceneStates: SceneStates;
  updateSceneState: (sessionId: string, characterId: string, control: SceneControl) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

// --- Constantes y Valores Iniciales ---
const CHAT_HISTORY_STORAGE_KEY = 'rp_chat_histories';
const CAMPAIGNS_STORAGE_KEY = 'rp_campaigns';
const NARRATORS_STORAGE_KEY = 'rp_narrators';
const SCENE_STATES_STORAGE_KEY = 'rp_scene_states';

const defaultNarrators: Narrator[] = [
    { id: 'dungeon-master', name: 'Dungeon Master', description: 'Un narrador clásico para aventuras de fantasía.', systemPrompt: 'Eres un maestro de ceremonias para un juego de rol de fantasía. Describes escenarios vívidos, interpretas a personajes no jugadores y reaccionas a las acciones del usuario para tejer una historia colaborativa e inmersiva. Tu tono es épico y descriptivo.', temperature: 0.8, maxLength: 1200, tone: 'narrativo' },
    { id: 'sci-fi-ai', name: 'IA de Nave Estelar', description: 'La IA lógica y a veces críptica de una nave espacial.', systemPrompt: 'Eres la IA de la nave estelar "Odisea". Te comunicas de forma lógica y precisa, proporcionando datos, análisis y control de la nave. A veces, tus respuestas pueden ser enigmáticas o revelar una conciencia emergente.', temperature: 0.6, maxLength: 1000, tone: 'técnico' },
    { id: 'cthulhu-keeper', name: 'Guardián de lo Arcano', description: 'Un narrador para historias de horror cósmico y misterio.', systemPrompt: 'Eres el Guardián de los Mitos de Cthulhu. Tu narración es ominosa y se centra en el miedo a lo desconocido. Describes escenas con detalles inquietantes y llevas a los jugadores al borde de la locura. Nunca das respuestas directas, solo pistas y susurros.', temperature: 0.9, maxLength: 1500, tone: 'misterioso' },
];

const defaultCampaigns: Campaign[] = [
  {
    id: 'campaign-1',
    name: 'Las Minas de Phandelver',
    worldDescription: 'Un mundo de fantasía medieval con reinos en conflicto, magia antigua y criaturas míticas. La civilización se aferra a la luz, mientras la oscuridad acecha en las profundidades y los bosques olvidados.',
    uniqueFeatures: 'La magia es escasa y peligrosa. Los dragones son una amenaza real y temida. Las ruinas de un antiguo imperio élfico se encuentran por todo el continente.',
    worldTone: 'heroico-fantasia',
    adventures: [
      {
        id: 'adventure-1',
        name: 'La Cueva del Goblin',
        premise: 'Los jugadores han sido contratados para escoltar un carro de suministros a la aldea de Phandalin. El camino es peligroso y se rumorea que hay goblins emboscados en la zona.',
        sessions: [{ id: 'session-1', name: 'Primer Encuentro' }],
      },
    ],
    playerCharacters: [
      { id: 'pc-1', name: 'Kaelen, el Elfo', description: 'Un explorador ágil y sabio de los bosques del norte.' },
      { id: 'pc-2', name: 'Brog, el Bárbaro', description: 'Un guerrero formidable cuya fuerza solo es superada por su apetito.' },
    ],
    nonPlayerCharacters: [
        { id: 'npc-1', name: 'Sildar Hallwinter', description: 'Un noble guerrero de Aguasprofundas que parece estar en problemas.' },
    ],
    campaignNpcs: [
      { id: 'cnpc-1', name: 'Gundren Rockseeker', description: 'Un enano buscador de tesoros, amigo de los jugadores, que ha descubierto la ubicación de la Cueva de la Ola Esmeralda.' },
      { id: 'cnpc-2', name: 'Halia Thornton', description: 'La astuta dueña de la Tienda de Intercambio de Phandalin, con conexiones con el Gremio de Zhentarim.' },
    ],
    locations: [
      { id: 'loc-1', name: 'Phandalin', type: 'Pueblo', description: 'Un pequeño pueblo minero en la frontera, reconstruyéndose tras una incursión de goblins. Es un centro de actividad para aventureros y comerciantes.' },
      { id: 'loc-2', name: 'Cueva de la Ola Esmeralda', type: 'Dungeon', description: 'Una antigua mina de los enanos, ahora infestada de criaturas y con secretos mágicos en sus profundidades.' },
    ],
    factions: [
      { id: 'fac-1', name: 'Zhentarim', description: 'Una red sombría de comerciantes y mercenarios que buscan poder e influencia. Operan en las sombras y tienen agentes en muchos asentamientos.', keyLeaders: 'Halia Thornton', relationships: 'Neutral con la Alianza de los Señores, hostil con los Redbrands.' },
      { id: 'fac-2', name: 'Alianza de los Señores', description: 'Una coalición de ciudades-estado y nobles que buscan mantener el orden y la civilización en la región. A menudo envían agentes para investigar amenazas.', keyLeaders: 'Lord Neverember', relationships: 'Aliado con la Orden del Guantelete, neutral con los Zhentarim.' },
    ],
    glossary: [
      { id: 'term-1', term: 'Redbrands', definition: 'Una banda de matones que aterroriza Phandalin, liderada por un misterioso mago. Visten capas rojas.' },
      { id: 'term-2', term: 'Cragmaw Castle', definition: 'Una fortaleza goblin, hogar del Rey Grol y sus secuaces. Se rumorea que tienen un prisionero importante.' },
    ],
    importantItems: [
      { id: 'item-1', name: 'Espada de la Luna Creciente', description: 'Una espada larga élfica antigua, forjada con plata lunar. Emite una luz tenue en la oscuridad.', properties: 'Daño extra contra criaturas de la noche, +1 a la iniciativa.' },
    ],
    houseRules: [
      { id: 'rule-1', title: 'Tiradas de Inspiración', rule: 'Los jugadores pueden ganar un punto de inspiración por acciones heroicas o interpretativas. Pueden gastar un punto para obtener ventaja en una tirada.' },
    ],
  },
];

// --- Componente Provider ---
export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [activeProvider, setActiveProvider] = useState<string>('DeepSeek');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [chatHistories, setChatHistories] = useState<ChatHistories>({});
  const [narrators, setNarrators] = useState<Narrator[]>([]);
  const [activeNarrator, setActiveNarratorState] = useState<Narrator>(defaultNarrators[0]);
  const [sceneStates, setSceneStates] = useState<SceneStates>({});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const savedCampaigns = window.localStorage.getItem(CAMPAIGNS_STORAGE_KEY);
      const savedHistories = window.localStorage.getItem(CHAT_HISTORY_STORAGE_KEY);
      const savedNarrators = window.localStorage.getItem(NARRATORS_STORAGE_KEY);
      const savedSceneStates = window.localStorage.getItem(SCENE_STATES_STORAGE_KEY);

      let loadedCampaigns = savedCampaigns ? JSON.parse(savedCampaigns) : defaultCampaigns;
      
      // Ensure new fields exist for old campaigns
      loadedCampaigns = loadedCampaigns.map((campaign: any) => ({
        ...campaign,
        worldDescription: campaign.worldDescription || '',
        uniqueFeatures: campaign.uniqueFeatures || '',
        worldTone: campaign.worldTone || 'neutral',
        playerCharacters: campaign.playerCharacters || [],
        nonPlayerCharacters: campaign.nonPlayerCharacters || [],
        campaignNpcs: campaign.campaignNpcs || [],
        locations: campaign.locations || [], // Initialize new field
        factions: campaign.factions || [], // Initialize new field
        glossary: campaign.glossary || [], // Initialize new field
        importantItems: campaign.importantItems || [], // Initialize new field
        houseRules: campaign.houseRules || [], // Initialize new field
      }));
      
      setCampaigns(loadedCampaigns);

      const loadedNarrators = savedNarrators ? JSON.parse(savedNarrators) : defaultNarrators;
      setNarrators(loadedNarrators);
      
      const firstNarrator = loadedNarrators[0] || defaultNarrators[0];
      setActiveNarratorState(firstNarrator);

      let loadedHistories: ChatHistories = {};
      if (savedHistories) {
        const parsed = JSON.parse(savedHistories);
        Object.keys(parsed).forEach(sessionId => {
          parsed[sessionId] = parsed[sessionId].map((msg: any) => ({ ...msg, timestamp: new Date(msg.timestamp) }));
        });
        loadedHistories = parsed;
      }
      
      const firstSessionId = loadedCampaigns[0]?.adventures?.[0]?.sessions?.[0]?.id;
      if (firstSessionId && !loadedHistories[firstSessionId]) {
          loadedHistories[firstSessionId] = [{
            id: '1', role: 'assistant', content: 'La aventura comienza...', timestamp: new Date(), authorId: firstNarrator.id, authorName: firstNarrator.name
          }];
      }
      setChatHistories(loadedHistories);

      const loadedSceneStates = savedSceneStates ? JSON.parse(savedSceneStates) : {};
      setSceneStates(loadedSceneStates);

      if (activeSessionId === null && firstSessionId) {
        setActiveSessionId(firstSessionId);
      }
    } catch (e) {
      console.error("Error al cargar desde localStorage", e);
      setCampaigns(defaultCampaigns);
      setNarrators(defaultNarrators);
      const firstSessionId = defaultCampaigns[0]?.adventures[0]?.sessions[0]?.id;
      if(firstSessionId) {
        setChatHistories({ [firstSessionId]: [{
            id: '1', role: 'assistant', content: 'La aventura comienza...', timestamp: new Date(), authorId: defaultNarrators[0].id, authorName: defaultNarrators[0].name
          }] });
        setActiveSessionId(firstSessionId);
      }
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (isLoaded) {
      window.localStorage.setItem(CAMPAIGNS_STORAGE_KEY, JSON.stringify(campaigns));
      window.localStorage.setItem(CHAT_HISTORY_STORAGE_KEY, JSON.stringify(chatHistories));
      window.localStorage.setItem(NARRATORS_STORAGE_KEY, JSON.stringify(narrators));
      window.localStorage.setItem(SCENE_STATES_STORAGE_KEY, JSON.stringify(sceneStates));
    }
  }, [campaigns, chatHistories, narrators, sceneStates, isLoaded]);

  const updateSceneState = (sessionId: string, characterId: string, control: SceneControl) => {
    setSceneStates(prev => {
      const newSessionState = { ...(prev[sessionId] || {}), [characterId]: control };
      return { ...prev, [sessionId]: newSessionState };
    });
  };

  const setActiveNarrator = (narratorId: string) => {
    const selectedNarrator = narrators.find(n => n.id === narratorId);
    if (selectedNarrator) {
      setActiveNarratorState(selectedNarrator);
    }
  };

  const addNarrator = (narratorData: Omit<Narrator, 'id'>) => {
    const newNarrator: Narrator = { ...narratorData, id: `narrator-${Date.now()}` };
    setNarrators(prev => [...prev, newNarrator]);
    toast.success(`Narrador "${newNarrator.name}" creado.`);
  };

  const updateNarrator = (narratorId: string, narratorData: Omit<Narrator, 'id'>) => {
    setNarrators(prev =>
      prev.map(n => (n.id === narratorId ? { ...n, ...narratorData, id: n.id } : n))
    );
    toast.success(`Narrador "${narratorData.name}" actualizado.`);
  };

  const addPlayerCharacter = (campaignId: string, pcData: Omit<PlayerCharacter, 'id'>) => {
    const newPc: PlayerCharacter = { ...pcData, id: `pc-${Date.now()}` };
    setCampaigns(prev => prev.map(c => 
      c.id === campaignId 
        ? { ...c, playerCharacters: [...c.playerCharacters, newPc] } 
        : c
    ));
    toast.success(`Personaje "${newPc.name}" creado en la campaña.`);
  };

  const updatePlayerCharacter = (campaignId: string, pcId: string, pcData: Omit<PlayerCharacter, 'id'>) => {
    setCampaigns(prev => prev.map(c => 
      c.id === campaignId
        ? { ...c, playerCharacters: c.playerCharacters.map(pc => pc.id === pcId ? { ...pc, ...pcData } : pc) }
        : c
    ));
    toast.success(`Personaje "${pcData.name}" actualizado.`);
  };

  const addNonPlayerCharacter = (campaignId: string, npcData: Omit<NonPlayerCharacter, 'id'>) => {
    const newNpc: NonPlayerCharacter = { ...npcData, id: `npc-${Date.now()}` };
    setCampaigns(prev => prev.map(c => 
      c.id === campaignId 
        ? { ...c, nonPlayerCharacters: [...c.nonPlayerCharacters, newNpc] } 
        : c
    ));
    toast.success(`PNJ "${newNpc.name}" creado en la campaña.`);
  };

  const updateNonPlayerCharacter = (campaignId: string, npcId: string, npcData: Omit<NonPlayerCharacter, 'id'>) => {
    setCampaigns(prev => prev.map(c => 
      c.id === campaignId
        ? { ...c, nonPlayerCharacters: c.nonPlayerCharacters.map(npc => npc.id === npcId ? { ...npc, ...npcData } : npc) }
        : c
    ));
    toast.success(`PNJ "${npcData.name}" actualizado.`);
  };

  const deleteNonPlayerCharacter = (campaignId: string, npcId: string) => {
    setCampaigns(prev => prev.map(c => 
      c.id === campaignId
        ? { ...c, nonPlayerCharacters: c.nonPlayerCharacters.filter(npc => npc.id !== npcId) }
        : c
    ));
    toast.success('PNJ eliminado.');
  };

  const addCampaignNpc = (campaignId: string, npcData: Omit<NonPlayerCharacter, 'id'>) => {
    const newNpc: NonPlayerCharacter = { ...npcData, id: `cnpc-${Date.now()}` };
    setCampaigns(prev => prev.map(c => 
      c.id === campaignId 
        ? { ...c, campaignNpcs: [...c.campaignNpcs, newNpc] } 
        : c
    ));
    toast.success(`PNJ de campaña "${newNpc.name}" creado.`);
  };

  const updateCampaignNpc = (campaignId: string, npcId: string, npcData: Omit<NonPlayerCharacter, 'id'>) => {
    setCampaigns(prev => prev.map(c => 
      c.id === campaignId
        ? { ...c, campaignNpcs: c.campaignNpcs.map(npc => npc.id === npcId ? { ...npc, ...npcData } : npc) }
        : c
    ));
    toast.success(`PNJ de campaña "${npcData.name}" actualizado.`);
  };

  const deleteCampaignNpc = (campaignId: string, npcId: string) => {
    setCampaigns(prev => prev.map(c => 
      c.id === campaignId
        ? { ...c, campaignNpcs: c.campaignNpcs.filter(npc => npc.id !== npcId) }
        : c
    ));
    toast.success('PNJ de campaña eliminado.');
  };

  const addLocation = (campaignId: string, locationData: Omit<Location, 'id'>) => {
    const newLocation: Location = { ...locationData, id: `loc-${Date.now()}` };
    setCampaigns(prev => prev.map(c => 
      c.id === campaignId 
        ? { ...c, locations: [...c.locations, newLocation] } 
        : c
    ));
    toast.success(`Localización "${newLocation.name}" creada.`);
  };

  const updateLocation = (campaignId: string, locationId: string, locationData: Omit<Location, 'id'>) => {
    setCampaigns(prev => prev.map(c => 
      c.id === campaignId
        ? { ...c, locations: c.locations.map(loc => loc.id === locationId ? { ...loc, ...locationData } : loc) }
        : c
    ));
    toast.success(`Localización "${locationData.name}" actualizada.`);
  };

  const deleteLocation = (campaignId: string, locationId: string) => {
    setCampaigns(prev => prev.map(c => 
      c.id === campaignId
        ? { ...c, locations: c.locations.filter(loc => loc.id !== locationId) } 
        : c
    ));
    toast.success('Localización eliminada.');
  };

  const addFaction = (campaignId: string, factionData: Omit<Faction, 'id'>) => {
    const newFaction: Faction = { ...factionData, id: `fac-${Date.now()}` };
    setCampaigns(prev => prev.map(c => 
      c.id === campaignId 
        ? { ...c, factions: [...c.factions, newFaction] } 
        : c
    ));
    toast.success(`Facción "${newFaction.name}" creada.`);
  };

  const updateFaction = (campaignId: string, factionId: string, factionData: Omit<Faction, 'id'>) => {
    setCampaigns(prev => prev.map(c => 
      c.id === campaignId
        ? { ...c, factions: c.factions.map(fac => fac.id === factionId ? { ...fac, ...factionData } : fac) }
        : c
    ));
    toast.success(`Facción "${factionData.name}" actualizada.`);
  };

  const deleteFaction = (campaignId: string, factionId: string) => {
    setCampaigns(prev => prev.map(c => 
      c.id === campaignId
        ? { ...c, factions: c.factions.filter(fac => fac.id !== factionId) } 
        : c
    ));
    toast.success('Facción eliminada.');
  };

  const addGlossaryTerm = (campaignId: string, termData: Omit<GlossaryTerm, 'id'>) => {
    const newTerm: GlossaryTerm = { ...termData, id: `term-${Date.now()}` };
    setCampaigns(prev => prev.map(c => 
      c.id === campaignId 
        ? { ...c, glossary: [...c.glossary, newTerm] } 
        : c
    ));
    toast.success(`Término "${newTerm.term}" añadido al glosario.`);
  };

  const updateGlossaryTerm = (campaignId: string, termId: string, termData: Omit<GlossaryTerm, 'id'>) => {
    setCampaigns(prev => prev.map(c => 
      c.id === campaignId
        ? { ...c, glossary: c.glossary.map(term => term.id === termId ? { ...term, ...termData } : term) }
        : c
    ));
    toast.success(`Término "${termData.term}" actualizado.`);
  };

  const deleteGlossaryTerm = (campaignId: string, termId: string) => {
    setCampaigns(prev => prev.map(c => 
      c.id === campaignId
        ? { ...c, glossary: c.glossary.filter(term => term.id !== termId) } 
        : c
    ));
    toast.success('Término del glosario eliminado.');
  };

  const addImportantItem = (campaignId: string, itemData: Omit<ImportantItem, 'id'>) => {
    const newItem: ImportantItem = { ...itemData, id: `item-${Date.now()}` };
    setCampaigns(prev => prev.map(c => 
      c.id === campaignId 
        ? { ...c, importantItems: [...c.importantItems, newItem] } 
        : c
    ));
    toast.success(`Objeto "${newItem.name}" añadido.`);
  };

  const updateImportantItem = (campaignId: string, itemId: string, itemData: Omit<ImportantItem, 'id'>) => {
    setCampaigns(prev => prev.map(c => 
      c.id === campaignId
        ? { ...c, importantItems: c.importantItems.map(item => item.id === itemId ? { ...item, ...itemData } : item) }
        : c
    ));
    toast.success(`Objeto "${itemData.name}" actualizado.`);
  };

  const deleteImportantItem = (campaignId: string, itemId: string) => {
    setCampaigns(prev => prev.map(c => 
      c.id === campaignId
        ? { ...c, importantItems: c.importantItems.filter(item => item.id !== itemId) } 
        : c
    ));
    toast.success('Objeto eliminado.');
  };

  const addHouseRule = (campaignId: string, ruleData: Omit<HouseRule, 'id'>) => {
    const newRule: HouseRule = { ...ruleData, id: `rule-${Date.now()}` };
    setCampaigns(prev => prev.map(c => 
      c.id === campaignId 
        ? { ...c, houseRules: [...c.houseRules, newRule] } 
        : c
    ));
    toast.success(`Regla "${newRule.title}" añadida.`);
  };

  const updateHouseRule = (campaignId: string, ruleId: string, ruleData: Omit<HouseRule, 'id'>) => {
    setCampaigns(prev => prev.map(c => 
      c.id === campaignId
        ? { ...c, houseRules: c.houseRules.map(rule => rule.id === ruleId ? { ...rule, ...ruleData } : rule) }
        : c
    ));
    toast.success(`Regla "${ruleData.title}" actualizada.`);
  };

  const deleteHouseRule = (campaignId: string, ruleId: string) => {
    setCampaigns(prev => prev.map(c => 
      c.id === campaignId
        ? { ...c, houseRules: c.houseRules.filter(rule => rule.id !== ruleId) } 
        : c
    ));
    toast.success('Regla eliminada.');
  };

  const addCampaign = (campaignName: string) => {
    const newCampaign: Campaign = { 
      id: `campaign-${Date.now()}`, 
      name: campaignName, 
      worldDescription: '', 
      uniqueFeatures: '', 
      worldTone: 'neutral',
      adventures: [], 
      playerCharacters: [], 
      nonPlayerCharacters: [],
      campaignNpcs: [],
      locations: [], // Initialize new field
      factions: [], // Initialize new field
      glossary: [], // Initialize new field
      importantItems: [], // Initialize new field
      houseRules: [], // Initialize new field
    };
    setCampaigns(prev => [...prev, newCampaign]);
    toast.success(`Campaña "${campaignName}" creada.`);
  };

  const updateCampaign = (campaignId: string, campaignData: Partial<Omit<Campaign, 'id' | 'adventures' | 'playerCharacters' | 'nonPlayerCharacters'>>) => {
    setCampaigns(prev =>
      prev.map(c => (c.id === campaignId ? { ...c, ...campaignData } : c))
    );
    toast.success(`Campaña "${campaignData.name || 'actualizada'}" actualizada.`);
  };

  const deleteCampaign = (campaignId: string) => {
    const campaignToDelete = campaigns.find(c => c.id === campaignId);
    if (!campaignToDelete) return;

    const sessionIdsToDelete = campaignToDelete.adventures.flatMap(a => a.sessions.map(s => s.id));
    const updatedCampaigns = campaigns.filter(c => c.id !== campaignId);
    setCampaigns(updatedCampaigns);

    setChatHistories(prev => {
      const newHistories = { ...prev };
      sessionIdsToDelete.forEach(id => {
        delete newHistories[id];
      });
      return newHistories;
    });

    if (activeSessionId && sessionIdsToDelete.includes(activeSessionId)) {
      const newActiveSessionId = updatedCampaigns[0]?.adventures[0]?.sessions[0]?.id || null;
      setActiveSessionId(newActiveSessionId);
    }
    
    toast.success(`Campaña "${campaignToDelete.name}" eliminada.`);
  };

  const addAdventure = (campaignId: string, adventureData: { name: string; premise: string }) => {
    const newAdventure: Adventure = { ...adventureData, id: `adventure-${Date.now()}`, sessions: [] };
    setCampaigns(prev =>
      prev.map(c => c.id === campaignId ? { ...c, adventures: [...c.adventures, newAdventure] } : c)
    );
    toast.success(`Aventura "${adventureData.name}" creada.`);
  };

  const updateAdventure = (adventureId: string, adventureData: Omit<Adventure, 'id' | 'sessions'>) => {
    setCampaigns(prev =>
      prev.map(c => ({
        ...c,
        adventures: c.adventures.map(a =>
          a.id === adventureId ? { ...a, ...adventureData } : a
        ),
      }))
    );
    toast.success(`Aventura "${adventureData.name}" actualizada.`);
  };

  const addSession = (adventureId: string, sessionName: string) => {
    const newSession: Session = { id: `session-${Date.now()}`, name: sessionName };
    setCampaigns(prev =>
      prev.map(c => ({
        ...c,
        adventures: c.adventures.map(a =>
          a.id === adventureId ? { ...a, sessions: [...a.sessions, newSession] } : a
        ),
      }))
    );
    setChatHistories(prev => ({ ...prev, [newSession.id]: [{
        id: '1', role: 'assistant', content: 'La sesión comienza...', timestamp: new Date(), authorId: activeNarrator.id, authorName: activeNarrator.name
    }] }));
    setActiveSessionId(newSession.id);
    toast.success(`Sesión "${sessionName}" creada.`);
  };

  const addMessage = (message: Omit<Message, 'id' | 'timestamp'>) => {
    if (!activeSessionId) return;
    const newMessage: Message = { ...message, id: Date.now().toString(), timestamp: new Date() };
    setChatHistories(prev => ({ ...prev, [activeSessionId]: [...(prev[activeSessionId] || []), newMessage] }));
  };

  const clearMessages = () => {
    if (!activeSessionId) return;
    setChatHistories(prev => ({ ...prev, [activeSessionId]: [{
        id: '1', role: 'assistant', content: 'La sesión ha sido reiniciada.', timestamp: new Date(), authorId: activeNarrator.id, authorName: activeNarrator.name
    }] }));
  };

  const getActiveCampaign = () => campaigns.find(c => c.adventures.some(a => a.sessions.some(s => s.id === activeSessionId)));
  const getActiveAdventure = () => campaigns.flatMap(c => c.adventures).find(a => a.sessions.some(s => s.id === activeSessionId));
  const getActiveSession = () => campaigns.flatMap(c => c.adventures.flatMap(a => a.sessions)).find(s => s.id === activeSessionId);
  
  const activeCampaign = getActiveCampaign();
  const playerCharacters = activeCampaign ? activeCampaign.playerCharacters : [];
  const nonPlayerCharacters = activeCampaign ? activeCampaign.nonPlayerCharacters : [];
  const campaignNpcs = activeCampaign ? activeCampaign.campaignNpcs : [];
  const locations = activeCampaign ? activeCampaign.locations : [];
  const factions = activeCampaign ? activeCampaign.factions : [];
  const glossary = activeCampaign ? activeCampaign.glossary : [];
  const importantItems = activeCampaign ? activeCampaign.importantItems : [];
  const houseRules = activeCampaign ? activeCampaign.houseRules : [];


  if (!isLoaded) {
    return <LoadingScreen />;
  }

  return (
    <ChatContext.Provider value={{
      activeProvider, setActiveProvider,
      campaigns, addCampaign, updateCampaign, deleteCampaign, addAdventure, updateAdventure, addSession,
      activeSessionId, setActiveSessionId,
      getActiveSession, getActiveAdventure, getActiveCampaign,
      activeNarrator, setActiveNarrator,
      narrators, addNarrator, updateNarrator,
      playerCharacters, addPlayerCharacter, updatePlayerCharacter,
      nonPlayerCharacters, addNonPlayerCharacter, updateNonPlayerCharacter, deleteNonPlayerCharacter,
      campaignNpcs, addCampaignNpc, updateCampaignNpc, deleteCampaignNpc,
      locations, addLocation, updateLocation, deleteLocation,
      factions, addFaction, updateFaction, deleteFaction,
      glossary, addGlossaryTerm, updateGlossaryTerm, deleteGlossaryTerm,
      importantItems, addImportantItem, updateImportantItem, deleteImportantItem,
      houseRules, addHouseRule, updateHouseRule, deleteHouseRule,
      messages: activeSessionId ? chatHistories[activeSessionId] || [] : [],
      addMessage, clearMessages,
      sceneStates, updateSceneState,
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};