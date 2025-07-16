// Inside the TabsContent sections, replace array checks with safe navigation:
{campaign.campaignNpcs?.length === 0 ? (
  <p className="text-muted-foreground text-center py-8">No hay PNJs recurrentes...</p>
) : (
  campaign.campaignNpcs?.map((npc) => (
    <div key={npc.id} className="flex items-center...">
      {/* NPC content */}
    </div>
  ))
)}

// Repeat this pattern for all array properties:
{campaign.locations?.length === 0 ? (...) : (...)}
{campaign.factions?.length === 0 ? (...) : (...)}
{campaign.glossary?.length === 0 ? (...) : (...)}
{campaign.importantItems?.length === 0 ? (...) : (...)}
{campaign.houseRules?.length === 0 ? (...) : (...)}
{campaign.adventures?.length === 0 ? (...) : (...)}