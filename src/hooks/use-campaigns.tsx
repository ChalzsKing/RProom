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