"use client";

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useLocalStorage } from './use-local-storage';
import { Campaign, Adventure, Session, PlayerCharacter, NonPlayerCharacter, Location, Faction, GlossaryTerm, ImportantItem, HouseRule } from '@/context/chat-context'; // Importar todos los tipos necesarios

const CAMPAIGNS_STORAGE_KEY = 'rp_campaigns';

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

export function useCampaigns() {
  const [campaigns, setCampaigns, isCampaignsLoaded] = useLocalStorage<Campaign[]>(CAMPAIGNS_STORAGE_KEY, defaultCampaigns);

  // Helper to find campaign by ID
  const findCampaign = useCallback((campaignId: string) => {
    return campaigns.find(c => c.id === campaignId);
  }, [campaigns]);

  // --- Campaign Management ---
  const addCampaign = useCallback((campaignName: string) => {
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
      locations: [],
      factions: [],
      glossary: [],
      importantItems: [],
      houseRules: [],
    };
    setCampaigns(prev => [...prev, newCampaign]);
    toast.success(`Campaña "${campaignName}" creada.`);
  }, [setCampaigns]);

  const updateCampaign = useCallback((campaignId: string, campaignData: Partial<Omit<Campaign, 'id' | 'adventures' | 'playerCharacters' | 'nonPlayerCharacters' | 'locations' | 'factions' | 'glossary' | 'importantItems' | 'houseRules'>>) => {
    setCampaigns(prev =>
      prev.map(c => (c.id === campaignId ? { ...c, ...campaignData } : c))
    );
    toast.success(`Campaña "${campaignData.name || 'actualizada'}" actualizada.`);
  }, [setCampaigns]);

  const deleteCampaign = useCallback((campaignId: string) => {
    const campaignToDelete = findCampaign(campaignId);
    if (!campaignToDelete) return;

    setCampaigns(prev => prev.filter(c => c.id !== campaignId));
    toast.success(`Campaña "${campaignToDelete.name}" eliminada.`);
    return campaignToDelete.adventures.flatMap(a => a.sessions.map(s => s.id)); // Return session IDs for chat history cleanup
  }, [setCampaigns, findCampaign]);

  // --- Adventure Management ---
  const addAdventure = useCallback((campaignId: string, adventureData: { name: string; premise: string }) => {
    const newAdventure: Adventure = { ...adventureData, id: `adventure-${Date.now()}`, sessions: [] };
    setCampaigns(prev =>
      prev.map(c => c.id === campaignId ? { ...c, adventures: [...c.adventures, newAdventure] } : c)
    );
    toast.success(`Aventura "${adventureData.name}" creada.`);
  }, [setCampaigns]);

  const updateAdventure = useCallback((adventureId: string, adventureData: Omit<Adventure, 'id' | 'sessions'>) => {
    setCampaigns(prev =>
      prev.map(c => ({
        ...c,
        adventures: c.adventures.map(a =>
          a.id === adventureId ? { ...a, ...adventureData } : a
        ),
      }))
    );
    toast.success(`Aventura "${adventureData.name}" actualizada.`);
  }, [setCampaigns]);

  // --- Session Management ---
  const addSession = useCallback((adventureId: string, sessionName: string) => {
    const newSession: Session = { id: `session-${Date.now()}`, name: sessionName };
    setCampaigns(prev =>
      prev.map(c => ({
        ...c,
        adventures: c.adventures.map(a =>
          a.id === adventureId ? { ...a, sessions: [...a.sessions, newSession] } : a
        ),
      }))
    );
    toast.success(`Sesión "${sessionName}" creada.`);
    return newSession; // Return new session for chat history initialization
  }, [setCampaigns]);

  // --- Player Character Management ---
  const addPlayerCharacter = useCallback((campaignId: string, pcData: Omit<PlayerCharacter, 'id'>) => {
    const newPc: PlayerCharacter = { ...pcData, id: `pc-${Date.now()}` };
    setCampaigns(prev => prev.map(c => 
      c.id === campaignId 
        ? { ...c, playerCharacters: [...c.playerCharacters, newPc] } 
        : c
    ));
    toast.success(`Personaje "${newPc.name}" creado en la campaña.`);
  }, [setCampaigns]);

  const updatePlayerCharacter = useCallback((campaignId: string, pcId: string, pcData: Omit<PlayerCharacter, 'id'>) => {
    setCampaigns(prev => prev.map(c => 
      c.id === campaignId
        ? { ...c, playerCharacters: c.playerCharacters.map(pc => pc.id === pcId ? { ...pc, ...pcData } : pc) }
        : c
    ));
    toast.success(`Personaje "${pcData.name}" actualizado.`);
  }, [setCampaigns]);

  // --- Non-Player Character (Adventure-specific) Management ---
  const addNonPlayerCharacter = useCallback((campaignId: string, npcData: Omit<NonPlayerCharacter, 'id'>) => {
    const newNpc: NonPlayerCharacter = { ...npcData, id: `npc-${Date.now()}` };
    setCampaigns(prev => prev.map(c => 
      c.id === campaignId 
        ? { ...c, nonPlayerCharacters: [...c.nonPlayerCharacters, newNpc] } 
        : c
    ));
    toast.success(`PNJ "${newNpc.name}" creado en la campaña.`);
  }, [setCampaigns]);

  const updateNonPlayerCharacter = useCallback((campaignId: string, npcId: string, npcData: Omit<NonPlayerCharacter, 'id'>) => {
    setCampaigns(prev => prev.map(c => 
      c.id === campaignId
        ? { ...c, nonPlayerCharacters: c.nonPlayerCharacters.map(npc => npc.id === npcId ? { ...npc, ...npcData } : npc) }
        : c
    ));
    toast.success(`PNJ "${npcData.name}" actualizado.`);
  }, [setCampaigns]);

  const deleteNonPlayerCharacter = useCallback((campaignId: string, npcId: string) => {
    setCampaigns(prev => prev.map(c => 
      c.id === campaignId
        ? { ...c, nonPlayerCharacters: c.nonPlayerCharacters.filter(npc => npc.id !== npcId) }
        : c
    ));
    toast.success('PNJ eliminado.');
  }, [setCampaigns]);

  // --- Campaign NPC (Recurrent) Management ---
  const addCampaignNpc = useCallback((campaignId: string, npcData: Omit<NonPlayerCharacter, 'id'>) => {
    const newNpc: NonPlayerCharacter = { ...npcData, id: `cnpc-${Date.now()}` };
    setCampaigns(prev => prev.map(c => 
      c.id === campaignId 
        ? { ...c, campaignNpcs: [...c.campaignNpcs, newNpc] } 
        : c
    ));
    toast.success(`PNJ de campaña "${newNpc.name}" creado.`);
  }, [setCampaigns]);

  const updateCampaignNpc = useCallback((campaignId: string, npcId: string, npcData: Omit<NonPlayerCharacter, 'id'>) => {
    setCampaigns(prev => prev.map(c => 
      c.id === campaignId
        ? { ...c, campaignNpcs: c.campaignNpcs.map(npc => npc.id === npcId ? { ...npc, ...npcData } : npc) }
        : c
    ));
    toast.success(`PNJ de campaña "${npcData.name}" actualizado.`);
  }, [setCampaigns]);

  const deleteCampaignNpc = useCallback((campaignId: string, npcId: string) => {
    setCampaigns(prev => prev.map(c => 
      c.id === campaignId
        ? { ...c, campaignNpcs: c.campaignNpcs.filter(npc => npc.id !== npcId) }
        : c
    ));
    toast.success('PNJ de campaña eliminado.');
  }, [setCampaigns]);

  // --- Location Management ---
  const addLocation = useCallback((campaignId: string, locationData: Omit<Location, 'id'>) => {
    const newLocation: Location = { ...locationData, id: `loc-${Date.now()}` };
    setCampaigns(prev => prev.map(c => 
      c.id === campaignId 
        ? { ...c, locations: [...c.locations, newLocation] } 
        : c
    ));
    toast.success(`Localización "${newLocation.name}" creada.`);
  }, [setCampaigns]);

  const updateLocation = useCallback((campaignId: string, locationId: string, locationData: Omit<Location, 'id'>) => {
    setCampaigns(prev => prev.map(c => 
      c.id === campaignId
        ? { ...c, locations: c.locations.map(loc => loc.id === locationId ? { ...loc, ...locationData } : loc) }
        : c
    ));
    toast.success(`Localización "${locationData.name}" actualizada.`);
  }, [setCampaigns]);

  const deleteLocation = useCallback((campaignId: string, locationId: string) => {
    setCampaigns(prev => prev.map(c => 
      c.id === campaignId
        ? { ...c, locations: c.locations.filter(loc => loc.id !== locationId) } 
        : c
    ));
    toast.success('Localización eliminada.');
  }, [setCampaigns]);

  // --- Faction Management ---
  const addFaction = useCallback((campaignId: string, factionData: Omit<Faction, 'id'>) => {
    const newFaction: Faction = { ...factionData, id: `fac-${Date.now()}` };
    setCampaigns(prev => prev.map(c => 
      c.id === campaignId 
        ? { ...c, factions: [...c.factions, newFaction] } 
        : c
    ));
    toast.success(`Facción "${newFaction.name}" creada.`);
  }, [setCampaigns]);

  const updateFaction = useCallback((campaignId: string, factionId: string, factionData: Omit<Faction, 'id'>) => {
    setCampaigns(prev => prev.map(c => 
      c.id === campaignId
        ? { ...c, factions: c.factions.map(fac => fac.id === factionId ? { ...fac, ...factionData } : fac) }
        : c
    ));
    toast.success(`Facción "${factionData.name}" actualizada.`);
  }, [setCampaigns]);

  const deleteFaction = useCallback((campaignId: string, factionId: string) => {
    setCampaigns(prev => prev.map(c => 
      c.id === campaignId
        ? { ...c, factions: c.factions.filter(fac => fac.id !== factionId) } 
        : c
    ));
    toast.success('Facción eliminada.');
  }, [setCampaigns]);

  // --- Glossary Term Management ---
  const addGlossaryTerm = useCallback((campaignId: string, termData: Omit<GlossaryTerm, 'id'>) => {
    const newTerm: GlossaryTerm = { ...termData, id: `term-${Date.now()}` };
    setCampaigns(prev => prev.map(c => 
      c.id === campaignId 
        ? { ...c, glossary: [...c.glossary, newTerm] } 
        : c
    ));
    toast.success(`Término "${newTerm.term}" añadido al glosario.`);
  }, [setCampaigns]);

  const updateGlossaryTerm = useCallback((campaignId: string, termId: string, termData: Omit<GlossaryTerm, 'id'>) => {
    setCampaigns(prev => prev.map(c => 
      c.id === campaignId
        ? { ...c, glossary: c.glossary.map(term => term.id === termId ? { ...term, ...termData } : term) }
        : c
    ));
    toast.success(`Término "${termData.term}" actualizado.`);
  }, [setCampaigns]);

  const deleteGlossaryTerm = useCallback((campaignId: string, termId: string) => {
    setCampaigns(prev => prev.map(c => 
      c.id === campaignId
        ? { ...c, glossary: c.glossary.filter(term => term.id !== termId) } 
        : c
    ));
    toast.success('Término del glosario eliminado.');
  }, [setCampaigns]);

  // --- Important Item Management ---
  const addImportantItem = useCallback((campaignId: string, itemData: Omit<ImportantItem, 'id'>) => {
    const newItem: ImportantItem = { ...itemData, id: `item-${Date.now()}` };
    setCampaigns(prev => prev.map(c => 
      c.id === campaignId 
        ? { ...c, importantItems: [...c.importantItems, newItem] } 
        : c
    ));
    toast.success(`Objeto "${newItem.name}" añadido.`);
  }, [setCampaigns]);

  const updateImportantItem = useCallback((campaignId: string, itemId: string, itemData: Omit<ImportantItem, 'id'>) => {
    setCampaigns(prev => prev.map(c => 
      c.id === campaignId
        ? { ...c, importantItems: c.importantItems.map(item => item.id === itemId ? { ...item, ...itemData } : item) }
        : c
    ));
    toast.success(`Objeto "${itemData.name}" actualizado.`);
  }, [setCampaigns]);

  const deleteImportantItem = useCallback((campaignId: string, itemId: string) => {
    setCampaigns(prev => prev.map(c => 
      c.id === campaignId
        ? { ...c, importantItems: c.importantItems.filter(item => item.id !== itemId) } 
        : c
    ));
    toast.success('Objeto eliminado.');
  }, [setCampaigns]);

  // --- House Rule Management ---
  const addHouseRule = useCallback((campaignId: string, ruleData: Omit<HouseRule, 'id'>) => {
    const newRule: HouseRule = { ...ruleData, id: `rule-${Date.now()}` };
    setCampaigns(prev => prev.map(c => 
      c.id === campaignId 
        ? { ...c, houseRules: [...c.houseRules, newRule] } 
        : c
    ));
    toast.success(`Regla "${newRule.title}" añadida.`);
  }, [setCampaigns]);

  const updateHouseRule = useCallback((campaignId: string, ruleId: string, ruleData: Omit<HouseRule, 'id'>) => {
    setCampaigns(prev => prev.map(c => 
      c.id === campaignId
        ? { ...c, houseRules: c.houseRules.map(rule => rule.id === ruleId ? { ...rule, ...ruleData } : rule) }
        : c
    ));
    toast.success(`Regla "${ruleData.title}" actualizada.`);
  }, [setCampaigns]);

  const deleteHouseRule = useCallback((campaignId: string, ruleId: string) => {
    setCampaigns(prev => prev.map(c => 
      c.id === campaignId
        ? { ...c, houseRules: c.houseRules.filter(rule => rule.id !== ruleId) } 
        : c
    ));
    toast.success('Regla eliminada.');
  }, [setCampaigns]);

  return {
    campaigns,
    setCampaigns, // Expose setCampaigns for initial load/reset logic in ChatProvider
    isCampaignsLoaded,
    addCampaign,
    updateCampaign,
    deleteCampaign,
    addAdventure,
    updateAdventure,
    addSession,
    addPlayerCharacter,
    updatePlayerCharacter,
    addNonPlayerCharacter,
    updateNonPlayerCharacter,
    deleteNonPlayerCharacter,
    addCampaignNpc,
    updateCampaignNpc,
    deleteCampaignNpc,
    addLocation,
    updateLocation,
    deleteLocation,
    addFaction,
    updateFaction,
    deleteFaction,
    addGlossaryTerm,
    updateGlossaryTerm,
    deleteGlossaryTerm,
    addImportantItem,
    updateImportantItem,
    deleteImportantItem,
    addHouseRule,
    updateHouseRule,
    deleteHouseRule,
  };
}