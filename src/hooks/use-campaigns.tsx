import { useCallback } from 'react';
import { toast } from 'sonner';
import { useLocalStorage } from './use-local-storage';
import { Campaign, Adventure, PlayerCharacter, NonPlayerCharacter, Location, Faction, GlossaryTerm, ImportantItem, HouseRule } from '@/context/chat-context';

const CAMPAIGNS_STORAGE_KEY = 'rp_campaigns';
const ACTIVE_CAMPAIGN_ID_KEY = 'rp_active_campaign_id';

// Helper to generate unique IDs
const generateUniqueId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export function useCampaigns() {
  const [campaigns, setCampaigns, isCampaignsLoaded] = useLocalStorage<Campaign[]>(
    CAMPAIGNS_STORAGE_KEY,
    []
  );

  // This is the part that was missing useCallback import
  const addCampaign = useCallback((campaignName: string) => {
    const newCampaign: Campaign = { 
      id: generateUniqueId('campaign'), 
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
    toast.success(`Campaña "${campaignData.name || 'desconocida'}" actualizada.`);
  }, [setCampaigns]);

  const deleteCampaign = useCallback((campaignId: string): string[] => {
    let deletedSessionIds: string[] = [];
    setCampaigns(prev => {
      const campaignToDelete = prev.find(c => c.id === campaignId);
      if (campaignToDelete) {
        deletedSessionIds = campaignToDelete.adventures.flatMap(a => a.sessions.map(s => s.id));
      }
      const newCampaigns = prev.filter(c => c.id !== campaignId);
      toast.info(`Campaña eliminada.`);
      return newCampaigns;
    });
    return deletedSessionIds;
  }, [setCampaigns]);

  const addAdventure = useCallback((campaignId: string, adventureData: { name: string; premise: string }) => {
    setCampaigns(prev =>
      prev.map(campaign => {
        if (campaign.id === campaignId) {
          const newAdventure: Adventure = {
            id: generateUniqueId('adventure'),
            name: adventureData.name,
            premise: adventureData.premise,
            sessions: [],
          };
          return { ...campaign, adventures: [...(campaign.adventures || []), newAdventure] };
        }
        return campaign;
      })
    );
    toast.success(`Aventura "${adventureData.name}" creada.`);
  }, [setCampaigns]);

  const updateAdventure = useCallback((adventureId: string, adventureData: Omit<Adventure, 'id' | 'sessions'>) => {
    setCampaigns(prev =>
      prev.map(campaign => ({
        ...campaign,
        adventures: (campaign.adventures || []).map(adventure =>
          adventure.id === adventureId ? { ...adventure, ...adventureData, id: adventure.id } : adventure
        ),
      }))
    );
    toast.success(`Aventura "${adventureData.name}" actualizada.`);
  }, [setCampaigns]);

  const addSession = useCallback((adventureId: string, sessionName: string): Adventure['sessions'][number] => {
    let newSession: Adventure['sessions'][number] | undefined;
    setCampaigns(prev =>
      prev.map(campaign => ({
        ...campaign,
        adventures: (campaign.adventures || []).map(adventure => {
          if (adventure.id === adventureId) {
            newSession = { id: generateUniqueId('session'), name: sessionName };
            return { ...adventure, sessions: [...(adventure.sessions || []), newSession] };
          }
          return adventure;
        }),
      }))
    );
    toast.success(`Sesión "${sessionName}" creada.`);
    return newSession!; // newSession will always be defined here
  }, [setCampaigns]);

  const addPlayerCharacter = useCallback((campaignId: string, pcData: Omit<PlayerCharacter, 'id'>) => {
    setCampaigns(prev =>
      prev.map(campaign => {
        if (campaign.id === campaignId) {
          const newPc: PlayerCharacter = { ...pcData, id: generateUniqueId('pc') };
          return { ...campaign, playerCharacters: [...(campaign.playerCharacters || []), newPc] };
        }
        return campaign;
      })
    );
    toast.success(`Personaje "${pcData.name}" añadido.`);
  }, [setCampaigns]);

  const updatePlayerCharacter = useCallback((campaignId: string, pcId: string, pcData: Omit<PlayerCharacter, 'id'>) => {
    setCampaigns(prev =>
      prev.map(campaign => {
        if (campaign.id === campaignId) {
          return {
            ...campaign,
            playerCharacters: (campaign.playerCharacters || []).map(pc =>
              pc.id === pcId ? { ...pc, ...pcData, id: pc.id } : pc
            ),
          };
        }
        return campaign;
      })
    );
    toast.success(`Personaje "${pcData.name}" actualizado.`);
  }, [setCampaigns]);

  const addNonPlayerCharacter = useCallback((campaignId: string, npcData: Omit<NonPlayerCharacter, 'id'>) => {
    setCampaigns(prev =>
      prev.map(campaign => {
        if (campaign.id === campaignId) {
          const newNpc: NonPlayerCharacter = { ...npcData, id: generateUniqueId('npc') };
          return { ...campaign, nonPlayerCharacters: [...(campaign.nonPlayerCharacters || []), newNpc] };
        }
        return campaign;
      })
    );
    toast.success(`PNJ "${npcData.name}" añadido a la aventura.`);
  }, [setCampaigns]);

  const updateNonPlayerCharacter = useCallback((campaignId: string, npcId: string, npcData: Omit<NonPlayerCharacter, 'id'>) => {
    setCampaigns(prev =>
      prev.map(campaign => {
        if (campaign.id === campaignId) {
          return {
            ...campaign,
            nonPlayerCharacters: (campaign.nonPlayerCharacters || []).map(npc =>
              npc.id === npcId ? { ...npc, ...npcData, id: npc.id } : npc
            ),
          };
        }
        return campaign;
      })
    );
    toast.success(`PNJ "${npcData.name}" actualizado.`);
  }, [setCampaigns]);

  const deleteNonPlayerCharacter = useCallback((campaignId: string, npcId: string) => {
    setCampaigns(prev =>
      prev.map(campaign => {
        if (campaign.id === campaignId) {
          return {
            ...campaign,
            nonPlayerCharacters: (campaign.nonPlayerCharacters || []).filter(npc => npc.id !== npcId),
          };
        }
        return campaign;
      })
    );
    toast.info(`PNJ eliminado de la aventura.`);
  }, [setCampaigns]);

  const addCampaignNpc = useCallback((campaignId: string, npcData: Omit<NonPlayerCharacter, 'id'>) => {
    setCampaigns(prev =>
      prev.map(campaign => {
        if (campaign.id === campaignId) {
          const newNpc: NonPlayerCharacter = { ...npcData, id: generateUniqueId('campaign-npc') };
          return { ...campaign, campaignNpcs: [...(campaign.campaignNpcs || []), newNpc] };
        }
        return campaign;
      })
    );
    toast.success(`PNJ de campaña "${npcData.name}" añadido.`);
  }, [setCampaigns]);

  const updateCampaignNpc = useCallback((campaignId: string, npcId: string, npcData: Omit<NonPlayerCharacter, 'id'>) => {
    setCampaigns(prev =>
      prev.map(campaign => {
        if (campaign.id === campaignId) {
          return {
            ...campaign,
            campaignNpcs: (campaign.campaignNpcs || []).map(npc =>
              npc.id === npcId ? { ...npc, ...npcData, id: npc.id } : npc
            ),
          };
        }
        return campaign;
      })
    );
    toast.success(`PNJ de campaña "${npcData.name}" actualizado.`);
  }, [setCampaigns]);

  const deleteCampaignNpc = useCallback((campaignId: string, npcId: string) => {
    setCampaigns(prev =>
      prev.map(campaign => {
        if (campaign.id === campaignId) {
          return {
            ...campaign,
            campaignNpcs: (campaign.campaignNpcs || []).filter(npc => npc.id !== npcId),
          };
        }
        return campaign;
      })
    );
    toast.info(`PNJ de campaña eliminado.`);
  }, [setCampaigns]);

  const addLocation = useCallback((campaignId: string, locationData: Omit<Location, 'id'>) => {
    setCampaigns(prev =>
      prev.map(campaign => {
        if (campaign.id === campaignId) {
          const newLocation: Location = { ...locationData, id: generateUniqueId('location') };
          return { ...campaign, locations: [...(campaign.locations || []), newLocation] };
        }
        return campaign;
      })
    );
    toast.success(`Localización "${locationData.name}" añadida.`);
  }, [setCampaigns]);

  const updateLocation = useCallback((campaignId: string, locationId: string, locationData: Omit<Location, 'id'>) => {
    setCampaigns(prev =>
      prev.map(campaign => {
        if (campaign.id === campaignId) {
          return {
            ...campaign,
            locations: (campaign.locations || []).map(loc =>
              loc.id === locationId ? { ...loc, ...locationData, id: loc.id } : loc
            ),
          };
        }
        return campaign;
      })
    );
    toast.success(`Localización "${locationData.name}" actualizada.`);
  }, [setCampaigns]);

  const deleteLocation = useCallback((campaignId: string, locationId: string) => {
    setCampaigns(prev =>
      prev.map(campaign => {
        if (campaign.id === campaignId) {
          return {
            ...campaign,
            locations: (campaign.locations || []).filter(loc => loc.id !== locationId),
          };
        }
        return campaign;
      })
    );
    toast.info(`Localización eliminada.`);
  }, [setCampaigns]);

  const addFaction = useCallback((campaignId: string, factionData: Omit<Faction, 'id'>) => {
    setCampaigns(prev =>
      prev.map(campaign => {
        if (campaign.id === campaignId) {
          const newFaction: Faction = { ...factionData, id: generateUniqueId('faction') };
          return { ...campaign, factions: [...(campaign.factions || []), newFaction] };
        }
        return campaign;
      })
    );
    toast.success(`Facción "${factionData.name}" añadida.`);
  }, [setCampaigns]);

  const updateFaction = useCallback((campaignId: string, factionId: string, factionData: Omit<Faction, 'id'>) => {
    setCampaigns(prev =>
      prev.map(campaign => {
        if (campaign.id === campaignId) {
          return {
            ...campaign,
            factions: (campaign.factions || []).map(fac =>
              fac.id === factionId ? { ...fac, ...factionData, id: fac.id } : fac
            ),
          };
        }
        return campaign;
      })
    );
    toast.success(`Facción "${factionData.name}" actualizada.`);
  }, [setCampaigns]);

  const deleteFaction = useCallback((campaignId: string, factionId: string) => {
    setCampaigns(prev =>
      prev.map(campaign => {
        if (campaign.id === campaignId) {
          return {
            ...campaign,
            factions: (campaign.factions || []).filter(fac => fac.id !== factionId),
          };
        }
        return campaign;
      })
    );
    toast.info(`Facción eliminada.`);
  }, [setCampaigns]);

  const addGlossaryTerm = useCallback((campaignId: string, termData: Omit<GlossaryTerm, 'id'>) => {
    setCampaigns(prev =>
      prev.map(campaign => {
        if (campaign.id === campaignId) {
          const newTerm: GlossaryTerm = { ...termData, id: generateUniqueId('glossary-term') };
          return { ...campaign, glossary: [...(campaign.glossary || []), newTerm] };
        }
        return campaign;
      })
    );
    toast.success(`Término "${termData.term}" añadido.`);
  }, [setCampaigns]);

  const updateGlossaryTerm = useCallback((campaignId: string, termId: string, termData: Omit<GlossaryTerm, 'id'>) => {
    setCampaigns(prev =>
      prev.map(campaign => {
        if (campaign.id === campaignId) {
          return {
            ...campaign,
            glossary: (campaign.glossary || []).map(term =>
              term.id === termId ? { ...term, ...termData, id: term.id } : term
            ),
          };
        }
        return campaign;
      })
    );
    toast.success(`Término "${termData.term}" actualizado.`);
  }, [setCampaigns]);

  const deleteGlossaryTerm = useCallback((campaignId: string, termId: string) => {
    setCampaigns(prev =>
      prev.map(campaign => {
        if (campaign.id === campaignId) {
          return {
            ...campaign,
            glossary: (campaign.glossary || []).filter(term => term.id !== termId),
          };
        }
        return campaign;
      })
    );
    toast.info(`Término eliminado.`);
  }, [setCampaigns]);

  const addImportantItem = useCallback((campaignId: string, itemData: Omit<ImportantItem, 'id'>) => {
    setCampaigns(prev =>
      prev.map(campaign => {
        if (campaign.id === campaignId) {
          const newItem: ImportantItem = { ...itemData, id: generateUniqueId('important-item') };
          return { ...campaign, importantItems: [...(campaign.importantItems || []), newItem] };
        }
        return campaign;
      })
    );
    toast.success(`Objeto "${itemData.name}" añadido.`);
  }, [setCampaigns]);

  const updateImportantItem = useCallback((campaignId: string, itemId: string, itemData: Omit<ImportantItem, 'id'>) => {
    setCampaigns(prev =>
      prev.map(campaign => {
        if (campaign.id === campaignId) {
          return {
            ...campaign,
            importantItems: (campaign.importantItems || []).map(item =>
              item.id === itemId ? { ...item, ...itemData, id: item.id } : item
            ),
          };
        }
        return campaign;
      })
    );
    toast.success(`Objeto "${itemData.name}" actualizado.`);
  }, [setCampaigns]);

  const deleteImportantItem = useCallback((campaignId: string, itemId: string) => {
    setCampaigns(prev =>
      prev.map(campaign => {
        if (campaign.id === campaignId) {
          return {
            ...campaign,
            importantItems: (campaign.importantItems || []).filter(item => item.id !== itemId),
          };
        }
        return campaign;
      })
    );
    toast.info(`Objeto eliminado.`);
  }, [setCampaigns]);

  const addHouseRule = useCallback((campaignId: string, ruleData: Omit<HouseRule, 'id'>) => {
    setCampaigns(prev =>
      prev.map(campaign => {
        if (campaign.id === campaignId) {
          const newRule: HouseRule = { ...ruleData, id: generateUniqueId('house-rule') };
          return { ...campaign, houseRules: [...(campaign.houseRules || []), newRule] };
        }
        return campaign;
      })
    );
    toast.success(`Regla "${ruleData.title}" añadida.`);
  }, [setCampaigns]);

  const updateHouseRule = useCallback((campaignId: string, ruleId: string, ruleData: Omit<HouseRule, 'id'>) => {
    setCampaigns(prev =>
      prev.map(campaign => {
        if (campaign.id === campaignId) {
          return {
            ...campaign,
            houseRules: (campaign.houseRules || []).map(rule =>
              rule.id === ruleId ? { ...rule, ...ruleData, id: rule.id } : rule
            ),
          };
        }
        return campaign;
      })
    );
    toast.success(`Regla "${ruleData.title}" actualizada.`);
  }, [setCampaigns]);

  const deleteHouseRule = useCallback((campaignId: string, ruleId: string) => {
    setCampaigns(prev =>
      prev.map(campaign => {
        if (campaign.id === campaignId) {
          return {
            ...campaign,
            houseRules: (campaign.houseRules || []).filter(rule => rule.id !== ruleId),
          };
        }
        return campaign;
      })
    );
    toast.info(`Regla eliminada.`);
  }, [setCampaigns]);

  const populateCampaignFromAI = useCallback((campaignId: string, worldData: any) => {
    setCampaigns(prev =>
      prev.map(campaign => {
        if (campaign.id === campaignId) {
          return {
            ...campaign,
            worldDescription: worldData.worldDescription || campaign.worldDescription,
            uniqueFeatures: worldData.uniqueFeatures || campaign.uniqueFeatures,
            campaignNpcs: worldData.campaignNpcs?.map((npc: any) => ({ ...npc, id: generateUniqueId('campaign-npc') })) || campaign.campaignNpcs,
            locations: worldData.locations?.map((loc: any) => ({ ...loc, id: generateUniqueId('location') })) || campaign.locations,
            factions: worldData.factions?.map((fac: any) => ({ ...fac, id: generateUniqueId('faction') })) || campaign.factions,
            glossary: worldData.glossary?.map((term: any) => ({ ...term, id: generateUniqueId('glossary-term') })) || campaign.glossary,
            importantItems: worldData.importantItems?.map((item: any) => ({ ...item, id: generateUniqueId('important-item') })) || campaign.importantItems,
            houseRules: worldData.houseRules?.map((rule: any) => ({ ...rule, id: generateUniqueId('house-rule') })) || campaign.houseRules,
            adventures: worldData.adventures?.map((adv: any) => ({ ...adv, id: generateUniqueId('adventure'), sessions: [] })) || campaign.adventures,
          };
        }
        return campaign;
      })
    );
    toast.success('Campaña poblada con datos de IA.');
  }, [setCampaigns]);

  return {
    campaigns,
    setCampaigns,
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
    populateCampaignFromAI,
  };
}