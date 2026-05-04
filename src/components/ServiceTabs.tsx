import { useState } from "react";
import { Check, Info, ChevronDown, ChevronUp, Plus, Search } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ServiceSection } from "./ServiceSection";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useTranslation, translations } from "../utils/translations";
import { 
  legserviceArticles, 
  getArticlesByCategory, 
  articleCategories, 
  getMandatoryArticlesByServiceType,
  getOptionalArticlesByServiceType,
  getConditionallyMandatoryArticles,
  type LegserviceArticle 
} from "../utils/legserviceArticles";
// Removed serviceCodeGenerator imports - only using real spreadsheet data now

interface Room {
  id: number;
  level: string;
  roomName: string;
  surface: string;
  area: number;
  product?: string;
  selectedProduct?: any;
  collapsed?: boolean;
}

interface ServiceTabsProps {
  rooms: Room[];
  currentRoomId?: number;
  language: string;
  services?: any[];
  onUpdateService?: (roomId: number, serviceType: string, serviceTitle: string, updates: any) => void;
  onOpenServiceArticleDetail?: (article: LegserviceArticle) => void;
  collapsedOptionalSections: Set<string>;
  onToggleOptionalServiceCollapse: (serviceType: string) => void;
  collapsedMandatorySections: Set<string>;
  onToggleMandatoryServiceCollapse: (serviceType: string) => void;
  currentConfigurator?: string; // Welke configurator is actief (Vloer, Droogbouw, etc.)
  serviceSearchTerm?: string; // Zoekterm voor services
}

export function ServiceTabs({ rooms, currentRoomId, language, services = [], onUpdateService, onOpenServiceArticleDetail, collapsedOptionalSections, onToggleOptionalServiceCollapse, collapsedMandatorySections, onToggleMandatoryServiceCollapse, currentConfigurator = "Vloer", serviceSearchTerm = "" }: ServiceTabsProps) {
  const t = useTranslation(language);
  const [deactivatedTabs, setDeactivatedTabs] = useState<Set<string>>(new Set());
  // Shared state for legservice meters per room - enables filtering across all legservices in a room
  const [legserviceMeters, setLegserviceMeters] = useState<{[roomId: number]: number}>({});
  // Search terms per service section (e.g., "legservice-mandatory", "legservice-optional", etc.)
  const [sectionSearchTerms, setSectionSearchTerms] = useState<Record<string, string>>({});
  
  // Helper function to check which choice article (bies) is selected for the current room
  const getSelectedChoiceArticle = (roomId: number): string | null => {
    if (!services || !roomId) return null;
    
    const biesArticles = ['BIES-SMAL', 'BIES-STD', 'BIES-DIK'];
    for (const articleCode of biesArticles) {
      const service = services.find(s => 
        s.roomId === roomId && 
        s.serviceTitle?.includes(articleCode)
      );
      
      // Check if this service has a quantity > 0 (for container services, we check area property)
      if (service && service.area && service.area > 0) {
        return articleCode;
      }
    }
    
    return null;
  };

  // Helper function to check which plint choice article is selected for the current room
  const getSelectedPlintArticle = (roomId: number): string | null => {
    if (!services || !roomId) return null;
    
    const plintArticles = ['AFWERKEN-10296', 'AFWERKEN-10294'];
    for (const articleCode of plintArticles) {
      const service = services.find(s => 
        s.roomId === roomId && 
        s.serviceTitle?.includes(articleCode)
      );
      
      // Check if this service has a quantity > 0
      if (service && service.area && service.area > 0) {
        return articleCode;
      }
    }
    
    return null;
  };

  // Removed getServiceArticleCode - not needed anymore

  const roomsWithProducts = rooms.filter(room => room.product && room.surface && room.area > 0);
  const currentRoom = currentRoomId ? rooms.find(room => room.id === currentRoomId) : null;

  // Helper function to filter services based on section search term
  const matchesSectionSearchTerm = (article: LegserviceArticle | undefined, sectionKey: string): boolean => {
    const searchTerm = sectionSearchTerms[sectionKey] || '';
    if (!searchTerm || searchTerm.trim() === '') return true;
    if (!article) return false;
    
    const searchLower = searchTerm.toLowerCase();
    const productCode = article.productCode?.toLowerCase() || '';
    const description = article.description?.toLowerCase() || '';
    
    return productCode.includes(searchLower) || description.includes(searchLower);
  };

  // Helper function to filter services based on search term
  const matchesSearchTerm = (article: LegserviceArticle | undefined): boolean => {
    if (!serviceSearchTerm || serviceSearchTerm.trim() === '') return true;
    if (!article) return false;
    
    const searchLower = serviceSearchTerm.toLowerCase();
    const productCode = article.productCode?.toLowerCase() || '';
    const description = article.description?.toLowerCase() || '';
    
    return productCode.includes(searchLower) || description.includes(searchLower);
  };

  // Function to determine which service types can have mandatory services (basic check)
  const serviceTypeCanHaveMandatoryServices = (serviceType: string): boolean => {
    switch (serviceType) {
      case "legservice":
      case "voorbereiden":
        return true;
      default:
        return false;
    }
  };
  // Voor legservices: toon services als er een surface en area is, ook zonder specifiek product
  const currentRoomWithProducts = currentRoom && currentRoom.surface && currentRoom.area > 0 ? [currentRoom] : [];
  
  // Helper functie om product filter te maken uit ruimte eigenschappen
  const getProductFilterFromRoom = (room: any) => {
    if (!room.selectedProduct) {
      return undefined;
    }
    
    const filter = {
      hoofdcategorie: room.selectedProduct.hoofdcategorie,
      subcategorie: room.selectedProduct.subcategorie,
      legmethode: room.selectedProduct.legmethode,
      legpatroon: room.selectedProduct.legpatroon,
      typeVloerverwarming: room.selectedProduct.typeVloerverwarming,
      geintegreerdeOndervloer: room.selectedProduct.geintegreerdeOndervloer,
      verdieping: room.selectedProduct.verdieping
    };
    
    return filter;
  };

  // Removed getServiceTitle - only using real spreadsheet data now

  // Helper function to display article title using only real spreadsheet data
  const getArticleTitle = (article: any): string => {
    if (article.productCode && article.description) {
      // Use the real spreadsheet data: productCode - description
      return `${article.productCode} - ${article.description}`;
    }
    // Fallback for any missing data (should not normally happen with real spreadsheet data)
    return article.description || article.productCode || 'Unknown Article';
  };

  // Note: Filtering is now handled directly in ServiceSection component through conditional rendering

  // Define all available service tabs based on current configurator
  const allTabsConfig = {
    "Vloer": [
      { id: "voorbereiden", label: t.serviceTabs.voorbereiden, removable: true, color: "#ea580c" },
      { id: "legservice", label: t.serviceTabs.legservice, removable: false, color: "#2d4724" },
      { id: "container", label: t.serviceTabs.afwerking, removable: true, color: "#2563eb" }
    ],
    "Droogbouw": [
      // For Droogbouw: only show legservice tab, hide Verwijderen and Voorbereiden
      { id: "legservice", label: t.serviceTabs.legservice, removable: false, color: "#2d4724" }
    ],
    "Vloerverwarming": [
      { id: "voorbereiden", label: t.serviceTabs.voorbereiden, removable: true, color: "#ea580c" },
      { id: "legservice", label: t.serviceTabs.legservice, removable: true, color: "#2d4724" }
    ],
    "Verwijderen": [
      { id: "verwijdering", label: t.serviceTabs.verwijdering, removable: true, color: "#e11d48" }
    ],
    // Default for other configurators
    "default": [
      { id: "verwijdering", label: t.serviceTabs.verwijdering, removable: true, color: "#e11d48" },
      { id: "voorbereiden", label: t.serviceTabs.voorbereiden, removable: true, color: "#ea580c" }
    ]
  };
  
  const allTabs = allTabsConfig[currentConfigurator as keyof typeof allTabsConfig] || allTabsConfig.default;

  // Type labels for services
  const TYPE_MANDATORY = t.serviceSection.mandatory;
  const TYPE_OPTIONAL = t.serviceSection.optional;
  const TYPE_CHOICE = t.serviceSection.choice;

  // Create surface mappings to handle both Dutch and English names
  const surfaceMapping = {
    // Surfaces that allow removal/container services
    removalAllowed: [
      ['pvc'], ['vinyl'], ['linoleum'], ['tapijt', 'carpet'], ['laminaat', 'laminate'], 
      ['parket', 'parquet'], ['hout', 'wood'], ['tegels', 'tiles'], ['natuursteen', 'natural stone']
    ],
    // Surfaces that allow underfloor heating
    heatingAllowed: [
      ['zandcement', 'sand cement'],
      ['fermacell'],
      ['knauf brio', 'knaufbrio'],
      ['anhydriet', 'anhydrite']
    ],
    // Surfaces that require mandatory removal when combined with "Gelijmd" legmethode
    mandatoryRemoval: [
      ['leisteen', 'slate'],
      ['marmoleum', 'linoleum', 'marmoleum/linoleum'],
      ['parketvloer (verlijmd)', 'parquet floor (glued)'],
      ['parketvloer (zwevend)', 'parquet floor (floating)'],
      ['travertin', 'travertine'],
      ['zandsteen', 'sandstone']
    ]
  };

  // Helper function to check if a surface matches any of the allowed names
  const surfaceMatches = (surfaceValue: string, allowedGroups: string[][]): boolean => {
    const lowerSurface = surfaceValue.toLowerCase();
    return allowedGroups.some(group => 
      group.some(name => lowerSurface.includes(name.toLowerCase()))
    );
  };

  const hasRoomsWithRemovalAllowedSurfaces = roomsWithProducts.some(room => {
    return surfaceMatches(room.surface, surfaceMapping.removalAllowed);
  });

  const hasRoomsWithHeatingAllowedSurfaces = roomsWithProducts.some(room => {
    return surfaceMatches(room.surface, surfaceMapping.heatingAllowed);
  });

  const hasRoomsWithMandatoryRemovalSurfaces = roomsWithProducts.some(room => {
    const hasRequiredSurface = surfaceMatches(room.surface, surfaceMapping.mandatoryRemoval);
    
    // Check if the selected product has "Gelijmd" legmethode (both Dutch and English)
    const hasGelijmdeLegmethode = room.selectedProduct && 
      (room.selectedProduct.legmethode === 'Gelijmd' || room.selectedProduct.legmethode === 'Glued');
    
    return hasRequiredSurface && hasGelijmdeLegmethode;
  });

  // Show all tabs, both active and deactivated (except for surface filtering)
  const visibleTabs = allTabs;

  const toggleTabActivation = (tabId: string) => {
    // Check if this tab can be deactivated
    if (!canTabBeDeactivated(tabId)) {
      return; // Don't allow deactivation
    }

    setDeactivatedTabs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(tabId)) {
        newSet.delete(tabId);
      } else {
        newSet.add(tabId);
      }
      return newSet;
    });
  };

  const canTabBeDeactivated = (tabId: string) => {
    // Verwijdering tab cannot be deactivated if any room has mandatory removal surfaces + gelijmd legmethode
    if (tabId === 'verwijdering' && hasRoomsWithMandatoryRemovalSurfaces) {
      return false;
    }
    
    return true;
  };

  // Helper function to check if a tab has optional services defined
  const hasOptionalServices = (tabId: string) => {
    // All tabs except legservice have optional services
    // Vloerverwarming has special checkbox-style optional services
    return tabId !== "legservice";
  };

  // Handler for legservice meters input - updates shared state for room-wide filtering
  const handleLegserviceMetersChange = (roomId: number, meters: number) => {
    setLegserviceMeters(prev => ({
      ...prev,
      [roomId]: meters
    }));
  };



  const hasRoomsWithProducts = currentRoomWithProducts.length > 0;

  // Helper function to determine the actual serviceType based on configurator and tab
  const getActualServiceType = (tabId: string): string => {
    // For Droogbouw configurator, the "legservice" tab should use "droogbouw" serviceType
    if (currentConfigurator === 'Droogbouw' && tabId === 'legservice') {
      return 'droogbouw';
    }
    // Default: use the tab id as serviceType
    return tabId;
  };

  // Helper function to check if a service tab has mandatory services
  const hasMandatoryServices = (tabId: string) => {
    if (tabId === 'legservice') {
      return hasRoomsWithProducts; // Legservice has mandatory services if there are rooms with products
    }
    if (tabId === 'verwijdering') {
      return hasRoomsWithMandatoryRemovalSurfaces; // Only has mandatory if surfaces require it
    }
    return false; // container, voorbereiden never have mandatory services
  };

  // Note: Collapsed state is now managed in App.tsx - all optional sections start collapsed by default

  // If no products selected, show empty state
  if (!hasRoomsWithProducts) {
    return (
      <div className="p-8 text-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <h3 className="text-lg mb-2">
          {language === 'en' ? 'Service Configuration' : 'Service Configuratie'}
        </h3>
        <div className="text-gray-500">
          {language === 'en' 
            ? 'Services will be available after entering room details (surface and area)'
            : 'Services worden beschikbaar na het invoeren van bovenstaande informatie.'
          }
        </div>
      </div>
    );
  }

  // Get first active tab for default value
  const activeTabs = visibleTabs.filter(tab => !deactivatedTabs.has(tab.id));
  
  // If no tabs are active, show message
  if (activeTabs.length === 0) {
    return (
      <div className="p-8 text-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <h3 className="text-lg mb-2">
          {language === 'en' ? 'All Services Deactivated' : 'Alle Services Gedeactiveerd'}
        </h3>
        <div className="text-gray-500">
          {language === 'en' 
            ? 'Click the checkmarks to reactivate services'
            : 'Klik op de vinkjes om services te heractiveren'
          }
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Tabs defaultValue={activeTabs[0]?.id} className="w-full">
        <TabsList className={`grid w-full ${allTabs.length === 1 ? 'grid-cols-1' : allTabs.length === 2 ? 'grid-cols-2' : allTabs.length === 3 ? 'grid-cols-3' : 'grid-cols-4'} gap-1 h-auto p-1 bg-gray-100 rounded-lg`}>
          {visibleTabs.map((tab) => {
            const isDeactivated = deactivatedTabs.has(tab.id);
            return (
              <div key={tab.id} className="relative">
                <TabsTrigger
                  value={tab.id}
                  disabled={isDeactivated}
                  className={`w-full px-2 py-2 text-sm text-center whitespace-nowrap overflow-hidden text-ellipsis flex items-center justify-center gap-1 rounded-lg`}
                  style={{
                    backgroundColor: isDeactivated ? '#d1d5db' : 'transparent',
                    color: isDeactivated ? '#6b7280' : '#374151'
                  }}
                  data-color={tab.color}
                  title={tab.label}
                >
                  <span className="truncate">{tab.label}</span>
                </TabsTrigger>
              </div>
            );
          })}
        </TabsList>

        {activeTabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="mt-6">
            {tab.id === "legservice" ? (
              currentConfigurator === 'Droogbouw' ? (
                // DROOGBOUW: Show conditionally mandatory + optional services
                <div className="space-y-6">
                  {/* Conditionally Mandatory Droogbouw Services Section (based on level) */}
                  {(() => {
                    const conditionallyMandatory = currentRoom ? 
                      getConditionallyMandatoryArticles('droogbouw', currentRoom.level) : [];
                    
                    return conditionallyMandatory.length > 0 ? (
                      <div>
                        <button
                          onClick={() => onToggleMandatoryServiceCollapse("droogbouw")}
                          className="w-full px-4 py-2 rounded-lg flex items-center justify-between transition-colors"
                          style={{
                            backgroundColor: `${tab.color}10`,
                            color: tab.color,
                          }}
                        >
                          <h3 className="text-lg flex items-center gap-2">
                            {t.mandatoryServices}
                            <span 
                              className="inline-flex items-center justify-center min-w-[1.125rem] h-[1.125rem] px-1 rounded-full border-2 text-xs font-semibold"
                              style={{ borderColor: tab.color, color: tab.color }}
                            >
                              {conditionallyMandatory.length}
                            </span>
                          </h3>
                          {collapsedMandatorySections.has("droogbouw") ? (
                            <ChevronDown className="h-5 w-5" />
                          ) : (
                            <ChevronUp className="h-5 w-5" />
                          )}
                        </button>
                        
                        {!collapsedMandatorySections.has("droogbouw") && (
                        <div className="p-4 space-y-6 bg-[#2d472408] rounded-lg mt-2">
                          <div className="space-y-4">
                            {conditionallyMandatory.map((article) => (
                              <ServiceSection
                                key={article.productCode}
                                title={`${article.productCode} - ${article.description}`}
                                surface={currentRoom?.surface || ""}
                                area={currentRoom?.area.toString() || "0"}
                                type={TYPE_MANDATORY}
                                roomId={currentRoomId || 0}
                                language={language}
                                serviceType="droogbouw"
                                isMandatory={true}
                                rooms={rooms}
                                services={services}
                                onUpdateService={onUpdateService}
                                currentRoom={currentRoom || undefined}
                                article={article}
                              />
                            ))}
                          </div>
                        </div>
                        )}
                      </div>
                    ) : null;
                  })()}
                  
                  {/* Optional Droogbouw Services Section */}
                  <div>
                    <button
                      onClick={() => onToggleOptionalServiceCollapse("droogbouw")}
                      className="w-full px-4 py-2 rounded-lg flex items-center justify-between transition-colors"
                      style={{
                        backgroundColor: `${tab.color}10`,
                        color: tab.color,
                      }}
                    >
                      <h3 className="text-lg">
                        {t.optionalServices}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span 
                          className="inline-flex items-center justify-center min-w-[1.5rem] h-[1.5rem] px-1.5 rounded-full text-xs font-semibold"
                          style={{ backgroundColor: tab.color, color: 'white' }}
                        >
                          {legserviceArticles.filter(article => {
                            if (article.serviceType !== 'droogbouw' || article.isMandatory) {
                              return false;
                            }
                            if (article.verdieping && article.verdieping.length > 0) {
                              return false;
                            }
                            const roomArea = currentRoom?.area || 0;
                            const articleFrom = article.van ?? 0;
                            const articleTo = article.tot ?? 9999;
                            return roomArea >= articleFrom && roomArea < articleTo;
                          }).length}
                        </span>
                        {collapsedOptionalSections.has("droogbouw") ? (
                          <ChevronDown className="h-5 w-5" />
                        ) : (
                          <ChevronUp className="h-5 w-5" />
                        )}
                      </div>
                    </button>
                    
                    {!collapsedOptionalSections.has("droogbouw") && (
                      <div className="p-4 space-y-6 bg-[#2d472408] rounded-lg mt-2">
                        <div className="space-y-4">
                          {/* Show droogbouw optional services filtered by room area (van/tot range) */}
                          {legserviceArticles
                            .filter(article => {
                              // Must be droogbouw and optional
                              if (article.serviceType !== 'droogbouw' || article.isMandatory) {
                                return false;
                              }
                              
                              // Exclude conditionally mandatory articles (those with verdieping filter)
                              // These are shown in the Mandatory section based on room level
                              if (article.verdieping && article.verdieping.length > 0) {
                                return false;
                              }
                              
                              // Filter by room area (van/tot range)
                              const roomArea = currentRoom?.area || 0;
                              const articleFrom = article.van ?? 0;
                              const articleTo = article.tot ?? 9999;
                              
                              // Check if room area falls within article range
                              const inRange = roomArea >= articleFrom && roomArea < articleTo;
                              
                              console.log(`🔍 Droogbouw filter: ${article.productCode} (${articleFrom}-${articleTo}m²) vs Room ${roomArea}m² = ${inRange ? 'MATCH' : 'NO MATCH'}`);
                              
                              return inRange;
                            })
                            .map((article) => (
                              <ServiceSection
                                key={article.productCode}
                                title={`${article.productCode} - ${article.description}`}
                                surface={currentRoom?.surface || ""}
                                area={currentRoom?.area.toString() || "0"}
                                type={TYPE_OPTIONAL}
                                roomId={currentRoomId || 0}
                                language={language}
                                serviceType="droogbouw"
                                isMandatory={false}
                                rooms={rooms}
                                services={services}
                                onUpdateService={onUpdateService}
                                currentRoom={currentRoom || undefined}
                                article={article}
                              />
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                // VLOER: Default legservice with mandatory + choice + optional
                <div className="space-y-6">
                  {/* Mandatory Services Section */}
                  <div>
                    <button
                      onClick={() => onToggleMandatoryServiceCollapse("legservice")}
                      className="w-full px-4 py-2 rounded-lg flex items-center justify-between transition-colors"
                      style={{
                        backgroundColor: `${tab.color}10`,
                        color: tab.color,
                      }}
                    >
                      <h3 className="text-lg">
                        {t.mandatoryServices}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span 
                          className="inline-flex items-center justify-center min-w-[1.5rem] h-[1.5rem] px-1.5 rounded-full text-xs font-semibold"
                          style={{ backgroundColor: tab.color, color: 'white' }}
                        >
                          {(() => {
                            const articles = [
                              legserviceArticles.find(a => a.productCode === "LS-INSTALL-001"),
                              legserviceArticles.find(a => a.productCode === "LS-INSTALL-002"),
                              legserviceArticles.find(a => a.productCode === "leg-PVCklik"),
                              legserviceArticles.find(a => a.productCode === "LS-INSTALL-003")
                            ];
                            console.log('🔍 Mandatory articles found:', articles.map(a => a ? a.productCode : 'NOT FOUND'));
                            console.log('🔍 Total legserviceArticles:', legserviceArticles.length);
                            const count = articles.filter(article => matchesSectionSearchTerm(article, 'legservice-mandatory')).length;
                            console.log('🔍 Matched count:', count);
                            return count;
                          })()}
                        </span>
                        {collapsedMandatorySections.has("legservice") ? (
                          <ChevronDown className="h-5 w-5" />
                        ) : (
                          <ChevronUp className="h-5 w-5" />
                        )}
                      </div>
                    </button>
                    
                    {!collapsedMandatorySections.has("legservice") && (
                    <div className="p-4 space-y-6 bg-[#2d472408] rounded-lg mt-2">
                      {/* Search bar */}
                      <div className="relative">
                        <Input
                          type="text"
                          placeholder={t.serviceSection.searchPlaceholder}
                          value={sectionSearchTerms['legservice-mandatory'] || ''}
                          onChange={(e) => setSectionSearchTerms(prev => ({ ...prev, 'legservice-mandatory': e.target.value }))}
                          className="pl-4 pr-14 py-3 w-full bg-gray-50 border-gray-200 rounded-md text-base"
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#2d4724] rounded-md p-2">
                          <Search className="h-5 w-5 text-white" />
                        </div>
                      </div>

                      <div className="space-y-4">
                        {/* Verplichte Installatie Service 1 */}
                        {matchesSectionSearchTerm(legserviceArticles.find(a => a.productCode === "LS-INSTALL-001"), 'legservice-mandatory') && (
                        <ServiceSection
                          title="LS-INSTALL-001 - Voorbereiden Ondergrond"
                          surface={currentRoom?.surface || ""}
                          area={currentRoom?.area.toString() || "0"}
                          type={TYPE_MANDATORY}
                          roomId={currentRoomId || 0}
                          language={language}
                          serviceType="legservice"
                          isMandatory={true}
                          rooms={rooms}
                          services={services}
                          onUpdateService={onUpdateService}
                          currentRoom={currentRoom || undefined}
                          article={legserviceArticles.find(a => a.productCode === "LS-INSTALL-001")}
                        />
                        )}

                      {/* Verplichte Installatie Service 2 */}
                      {matchesSectionSearchTerm(legserviceArticles.find(a => a.productCode === "LS-INSTALL-002"), 'legservice-mandatory') && (
                      <ServiceSection
                        title="LS-INSTALL-002 - Leggen Vloer"
                        surface={currentRoom?.surface || ""}
                        area={currentRoom?.area.toString() || "0"}
                        type={TYPE_MANDATORY}
                        roomId={currentRoomId || 0}
                        language={language}
                        serviceType="legservice"
                        isMandatory={true}
                        rooms={rooms}
                        services={services}
                        onUpdateService={onUpdateService}
                        currentRoom={currentRoom || undefined}
                        article={legserviceArticles.find(a => a.productCode === "LS-INSTALL-002")}
                      />
                      )}

                      {/* leg-PVCklik - LEG PVC KLIK */}
                      {matchesSectionSearchTerm(legserviceArticles.find(a => a.productCode === "leg-PVCklik"), 'legservice-mandatory') && (
                      <ServiceSection
                        title="leg-PVCklik - LEG PVC KLIK"
                        surface={currentRoom?.surface || ""}
                        area={currentRoom?.area.toString() || "0"}
                        type={TYPE_MANDATORY}
                        roomId={currentRoomId || 0}
                        language={language}
                        serviceType="legservice"
                        isMandatory={true}
                        rooms={rooms}
                        services={services}
                        onUpdateService={onUpdateService}
                        currentRoom={currentRoom || undefined}
                        article={legserviceArticles.find(a => a.productCode === "leg-PVCklik")}
                      />
                      )}

                      {/* Verplichte Installatie Service 3 */}
                      {matchesSectionSearchTerm(legserviceArticles.find(a => a.productCode === "LS-INSTALL-003"), 'legservice-mandatory') && (
                      <ServiceSection
                        title="LS-INSTALL-003 - Afwerken Vloer"
                        surface={currentRoom?.surface || ""}
                        area={currentRoom?.area.toString() || "0"}
                        type={TYPE_MANDATORY}
                        roomId={currentRoomId || 0}
                        language={language}
                        serviceType="legservice"
                        isMandatory={true}
                        rooms={rooms}
                        services={services}
                        onUpdateService={onUpdateService}
                        currentRoom={currentRoom || undefined}
                        article={legserviceArticles.find(a => a.productCode === "LS-INSTALL-003")}
                      />
                      )}
                    </div>
                    </div>
                  )}
                  </div>

                {/* Optional Services Section */}
                <div>
                  <button
                    onClick={() => onToggleOptionalServiceCollapse("legservice")}
                    className="w-full px-4 py-2 rounded-lg flex items-center justify-between transition-colors"
                    style={{
                      backgroundColor: `${tab.color}10`,
                      color: tab.color,
                    }}
                  >
                    <h3 className="text-lg">
                      {t.optionalServices}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span 
                        className="inline-flex items-center justify-center min-w-[1.5rem] h-[1.5rem] px-1.5 rounded-full text-xs font-semibold"
                        style={{ backgroundColor: tab.color, color: 'white' }}
                      >
                        {[
                          legserviceArticles.find(a => a.productCode === "LS-OPT-001"),
                          legserviceArticles.find(a => a.productCode === "LS-OPT-002"),
                          legserviceArticles.find(a => a.productCode === "LS-OPT-003"),
                          legserviceArticles.find(a => a.productCode === "Leg-plinten"),
                          legserviceArticles.find(a => a.productCode === "Leg-dorpels")
                        ].filter(article => matchesSectionSearchTerm(article, 'legservice-optional')).length}
                      </span>
                      {collapsedOptionalSections.has("legservice") ? (
                        <ChevronDown className="h-5 w-5" />
                      ) : (
                        <ChevronUp className="h-5 w-5" />
                      )}
                    </div>
                  </button>
                  
                  {!collapsedOptionalSections.has("legservice") && (
                    <div className="p-4 space-y-6 bg-[#2d472408] rounded-lg mt-2">
                      {/* Search bar */}
                      <div className="relative">
                        <Input
                          type="text"
                          placeholder={t.serviceSection.searchPlaceholder}
                          value={sectionSearchTerms['legservice-optional'] || ''}
                          onChange={(e) => setSectionSearchTerms(prev => ({ ...prev, 'legservice-optional': e.target.value }))}
                          className="pl-4 pr-14 py-3 w-full bg-gray-50 border-gray-200 rounded-md text-base"
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#2d4724] rounded-md p-2">
                          <Search className="h-5 w-5 text-white" />
                        </div>
                      </div>

                      <div className="space-y-4">
                        {/* Optionele Installatie Service 1 */}
                        {matchesSectionSearchTerm(legserviceArticles.find(a => a.productCode === "LS-OPT-001"), 'legservice-optional') && (
                        <ServiceSection
                          title="LS-OPT-001 - Ondervloer Plaatsen"
                          surface={currentRoom?.surface || ""}
                          area={currentRoom?.area.toString() || "0"}
                          type={TYPE_OPTIONAL}
                          roomId={currentRoomId || 0}
                          language={language}
                          serviceType="legservice"
                          isMandatory={false}
                          rooms={rooms}
                          services={services}
                          onUpdateService={onUpdateService}
                          currentRoom={currentRoom || undefined}
                          article={legserviceArticles.find(a => a.productCode === "LS-OPT-001")}
                        />
                        )}

                        {/* Optionele Installatie Service 2 */}
                        {matchesSectionSearchTerm(legserviceArticles.find(a => a.productCode === "LS-OPT-002"), 'legservice-optional') && (
                        <ServiceSection
                          title="LS-OPT-002 - Vochtscherm Aanbrengen"
                          surface={currentRoom?.surface || ""}
                          area={currentRoom?.area.toString() || "0"}
                          type={TYPE_OPTIONAL}
                          roomId={currentRoomId || 0}
                          language={language}
                          serviceType="legservice"
                          isMandatory={false}
                          rooms={rooms}
                          services={services}
                          onUpdateService={onUpdateService}
                          currentRoom={currentRoom || undefined}
                          article={legserviceArticles.find(a => a.productCode === "LS-OPT-002")}
                        />
                        )}

                        {/* Optionele Installatie Service 3 */}
                        {matchesSectionSearchTerm(legserviceArticles.find(a => a.productCode === "LS-OPT-003"), 'legservice-optional') && (
                        <ServiceSection
                          title="LS-OPT-003 - Extra Isolatie"
                          surface={currentRoom?.surface || ""}
                          area={currentRoom?.area.toString() || "0"}
                          type={TYPE_OPTIONAL}
                          roomId={currentRoomId || 0}
                          language={language}
                          serviceType="legservice"
                          isMandatory={false}
                          rooms={rooms}
                          services={services}
                          onUpdateService={onUpdateService}
                          currentRoom={currentRoom || undefined}
                          article={legserviceArticles.find(a => a.productCode === "LS-OPT-003")}
                        />
                        )}

                        {/* Optionele Afwerking Service 1 */}
                        {matchesSectionSearchTerm(legserviceArticles.find(a => a.productCode === "Leg-plinten"), 'legservice-optional') && (
                        <ServiceSection
                          title="Leg-plinten - Plinten Plaatsen"
                          surface={currentRoom?.surface || ""}
                          area={currentRoom?.area.toString() || "0"}
                          type={TYPE_OPTIONAL}
                          roomId={currentRoomId || 0}
                          language={language}
                          serviceType="legservice"
                          isMandatory={false}
                          rooms={rooms}
                          services={services}
                          onUpdateService={onUpdateService}
                          currentRoom={currentRoom || undefined}
                          article={legserviceArticles.find(a => a.productCode === "Leg-plinten")}
                        />
                        )}

                        {/* Optionele Afwerking Service 2 */}
                        {matchesSectionSearchTerm(legserviceArticles.find(a => a.productCode === "Leg-dorpels"), 'legservice-optional') && (
                        <ServiceSection
                          title="Leg-dorpels - Dorpels Plaatsen"
                          surface={currentRoom?.surface || ""}
                          area={currentRoom?.area.toString() || "0"}
                          type={TYPE_OPTIONAL}
                          roomId={currentRoomId || 0}
                          language={language}
                          serviceType="legservice"
                          isMandatory={false}
                          rooms={rooms}
                          services={services}
                          onUpdateService={onUpdateService}
                          currentRoom={currentRoom || undefined}
                          article={legserviceArticles.find(a => a.productCode === "Leg-dorpels")}
                        />
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              )
            ) : tab.id === "container" ? (
              <div className="space-y-6">
                {/* Container Services - Optional Services */}
                <div>
                  <button
                    onClick={() => onToggleOptionalServiceCollapse("container")}
                    className="w-full px-4 py-2 rounded-lg flex items-center justify-between transition-colors"
                    style={{
                      backgroundColor: `${tab.color}10`,
                      color: tab.color,
                    }}
                  >
                    <h3 className="text-lg flex items-center gap-2">
                      {t.optionalServices}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span 
                        className="inline-flex items-center justify-center min-w-[1.5rem] h-[1.5rem] px-1.5 rounded-full text-xs font-semibold"
                        style={{ backgroundColor: tab.color, color: 'white' }}
                      >
                        7
                      </span>
                      {collapsedOptionalSections.has("container") ? (
                        <ChevronDown className="h-5 w-5" />
                      ) : (
                        <ChevronUp className="h-5 w-5" />
                      )}
                    </div>
                  </button>
                  
                  {!collapsedOptionalSections.has("container") && (
                    <div className="p-4 space-y-6 rounded-lg mt-2" style={{ backgroundColor: `${tab.color}08` }}>
                      {/* Container services have a special interface with 3 separate article lines */}
                      <div className="space-y-4">
                        {/* Kleine Container */}
                        <ServiceSection
                          title="CON-KLEIN-001 - Kleine Container (2-4 m³)"
                          surface=""
                          area=""
                          type={TYPE_OPTIONAL}
                          roomId={0} // Container services are not room-specific
                          language={language}
                          serviceType="container"
                          isMandatory={false}
                          rooms={rooms}
                          services={services}
                          onUpdateService={onUpdateService}
                          isContainerService={true}
                          containerDescription={t.serviceSection.containerSmallDescription}
                        />
                        
                        {/* Middelgrote Container */}
                        <ServiceSection
                          title="CON-MIDDEL-001 - Middelgrote Container (4-8 m³)"
                          surface=""
                          area=""
                          type={TYPE_OPTIONAL}
                          roomId={0} // Container services are not room-specific
                          language={language}
                          serviceType="container"
                          isMandatory={false}
                          rooms={rooms}
                          services={services}
                          onUpdateService={onUpdateService}
                          isContainerService={true}
                          containerDescription={t.serviceSection.containerMediumDescription}
                        />
                        
                        {/* Grote Container */}
                        <ServiceSection
                          title="CON-GROOT-001 - Grote Container (8-12 m³)"
                          surface=""
                          area=""
                          type={TYPE_OPTIONAL}
                          roomId={0} // Container services are not room-specific
                          language={language}
                          serviceType="container"
                          isMandatory={false}
                          rooms={rooms}
                          services={services}
                          onUpdateService={onUpdateService}
                          isContainerService={true}
                          containerDescription={t.serviceSection.containerLargeDescription}
                        />
                        
                        {/* LEG AFRIT HOGE PLINT */}
                        <ServiceSection
                          title={language === 'nl' ? 'AFWERKEN-10573 - LEG AFRIT HOGE PLINT per m1' : 'AFWERKEN-10573 - INSTALL HIGH PLINTH TRANSITION per m1'}
                          surface={currentRoom?.surface || "Beton"}
                          area={currentRoom?.area.toString() || "0"}
                          type={TYPE_OPTIONAL}
                          roomId={currentRoom?.id || 0}
                          language={language}
                          serviceType="afwerken"
                          isMandatory={false}
                          rooms={rooms}
                          services={services}
                          onUpdateService={onUpdateService}
                          isContainerService={false}
                          article={legserviceArticles.find(a => a.productCode === "AFWERKEN-10573")}
                          onOpenServiceArticleDetail={onOpenServiceArticleDetail}
                          currentRoom={currentRoom}
                        />
                        
                        {/* LEG DEURMAT */}
                        <ServiceSection
                          title={language === 'nl' ? 'AFWERKEN-10584 - LEG DEURMAT Aanvullende kosten voor het pasmaken en snijden van de te plaatsen mat' : 'AFWERKEN-10584 - INSTALL DOORMAT Additional costs for fitting and cutting the mat to be installed'}
                          surface={currentRoom?.surface || "Zandcement"}
                          area={currentRoom?.area.toString() || "0"}
                          type={TYPE_OPTIONAL}
                          roomId={currentRoom?.id || 0}
                          language={language}
                          serviceType="afwerken"
                          isMandatory={false}
                          rooms={rooms}
                          services={services}
                          onUpdateService={onUpdateService}
                          isContainerService={false}
                          article={legserviceArticles.find(a => a.productCode === "AFWERKEN-10584")}
                          onOpenServiceArticleDetail={onOpenServiceArticleDetail}
                          currentRoom={currentRoom}
                        />
                        
                        {/* LEG AFKIT VLOER */}
                        <ServiceSection
                          title={language === 'nl' ? 'Leg-afkitvloer - LEG AFKIT VLOER Basis kosten voor het afkitten van de rand van de gelegde lijm pvc vloer, of de kosten voor het afkitten van de onderkant van een hoge plint. (per m1, excl. kit, let op: niet bij zwevend gelegde vloeren)' : 'Leg-afkitvloer - SEAL FLOOR Additional costs for sealing the edge of the glued PVC floor, or the costs for sealing the bottom of a high baseboard. (per m1, excl. sealant, note: not for floating floors)'}
                          surface={currentRoom?.surface || "Zandcement"}
                          area={currentRoom?.area.toString() || "0"}
                          type={TYPE_OPTIONAL}
                          roomId={currentRoom?.id || 0}
                          language={language}
                          serviceType="afwerken"
                          isMandatory={false}
                          rooms={rooms}
                          services={services}
                          onUpdateService={onUpdateService}
                          isContainerService={false}
                          article={legserviceArticles.find(a => a.productCode === "Leg-afkitvloer")}
                          onOpenServiceArticleDetail={onOpenServiceArticleDetail}
                          currentRoom={currentRoom}
                        />

                        {/* LEG PROFIEL */}
                        <ServiceSection
                          title={language === 'nl' ? 'Leg-profiel - LEG PROFIEL Basis kosten voor het pas maken en plaatsen van 1 stuk profiel. (niet voor traptreden)' : 'Leg-profiel - INSTALL PROFILE Basic costs for cutting and installing 1 piece of profile. (not for stair treads)'}
                          surface={currentRoom?.surface || "Zandcement"}
                          area={currentRoom?.area.toString() || "0"}
                          type={TYPE_OPTIONAL}
                          roomId={currentRoom?.id || 0}
                          language={language}
                          serviceType="afwerken"
                          isMandatory={false}
                          rooms={rooms}
                          services={services}
                          onUpdateService={onUpdateService}
                          isContainerService={false}
                          article={legserviceArticles.find(a => a.productCode === "Leg-profiel")}
                          onOpenServiceArticleDetail={onOpenServiceArticleDetail}
                          currentRoom={currentRoom}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Check if voorbereiden services should be hidden (Gelijmd + Elektrisch combination) */}
                {(() => {
                  const hasGelijmdLegmethode = currentRoom?.selectedProduct?.legmethode === 'Gelijmd' || 
                                               currentRoom?.selectedProduct?.legmethode === 'Glued';
                  const shouldHideVoorbereidenServices = false; // Voorbereiden services are always shown now
                  
                  if (shouldHideVoorbereidenServices) {
                    return (
                      <div className="p-8 text-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                        <div className="text-gray-500">
                          {language === 'en' 
                            ? 'No services/products of this type are available for the selected options!'
                            : 'Voor de geselecteerde opties zijn geen diensten/producten van dit type beschikbaar!'
                          }
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}
                
                {/* Mandatory Services Section */}
                {(tab.id === "voorbereiden" || tab.id === "verwijdering") && (() => {
                   // Calculate count for the header
                   let servicesCount = 0;
                   
                   if (tab.id === "voorbereiden") {
                     const productFilter = currentRoom?.selectedProduct ? {
                       hoofdcategorie: currentRoom.selectedProduct.hoofdcategorie,
                       subcategorie: currentRoom.selectedProduct.subcategorie,
                       legmethode: currentRoom.selectedProduct.legmethode,
                       legpatroon: currentRoom.selectedProduct.legpatroon,
                       typeVloerverwarming: currentRoom.selectedProduct.typeVloerverwarming,
                       geintegreerdeOndervloer: currentRoom.selectedProduct.geintegreerdeOndervloer,
                       verdieping: currentRoom.selectedProduct.verdieping
                     } : undefined;
                     
                     const oldSurfaceDutch = currentRoom?.oldSurface 
                       ? translations.nl.existingFloors[currentRoom.oldSurface as keyof typeof translations.nl.existingFloors] || currentRoom.oldSurface
                       : undefined;
                     
                     const mandatoryArticles = getMandatoryArticlesByServiceType(
                       'voorbereiden', 
                       productFilter, 
                       currentRoom?.surface,
                       oldSurfaceDutch
                     );
                     
                     servicesCount = mandatoryArticles.filter(article => 
                       matchesSectionSearchTerm(article, `${tab.id}-mandatory`)
                     ).length;
                   } else if (tab.id === "verwijdering") {
                     servicesCount = matchesSectionSearchTerm({ 
                       productCode: 'VW-REMOVE-001', 
                       description: 'Verwijdering Bestaande Ondergrond' 
                     } as LegserviceArticle, `${tab.id}-mandatory`) ? 1 : 0;
                   }
                   
                   return (
                  <div>
                    <button
                      onClick={() => onToggleMandatoryServiceCollapse(tab.id)}
                      className="w-full px-4 py-2 rounded-lg flex items-center justify-between transition-colors"
                      style={{
                        backgroundColor: `${tab.color}10`,
                        color: tab.color,
                      }}
                    >
                      <h3 className="text-lg flex items-center gap-2">
                        {t.mandatoryServices}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span 
                          className="inline-flex items-center justify-center min-w-[1.5rem] h-[1.5rem] px-1.5 rounded-full text-xs font-semibold"
                          style={{ backgroundColor: tab.color, color: 'white' }}
                        >
                          {servicesCount}
                        </span>
                        {collapsedMandatorySections.has(tab.id) ? (
                          <ChevronDown className="h-5 w-5" />
                        ) : (
                          <ChevronUp className="h-5 w-5" />
                        )}
                      </div>
                    </button>
                    
                    {!collapsedMandatorySections.has(tab.id) && (
                    <div className="p-4 space-y-6 rounded-lg mt-2" style={{ backgroundColor: `${tab.color}08` }}>
                      {/* Search bar for mandatory services */}
                      {(tab.id === "voorbereiden" || tab.id === "verwijdering") && (
                        <div className="relative">
                          <Input
                            type="text"
                            placeholder={t.serviceSection.searchPlaceholder}
                            value={sectionSearchTerms[`${tab.id}-mandatory`] || ''}
                            onChange={(e) => setSectionSearchTerms(prev => ({ ...prev, [`${tab.id}-mandatory`]: e.target.value }))}
                            className="pl-4 pr-14 py-3 w-full bg-gray-50 border-gray-200 rounded-md text-base"
                          />
                          <div className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#2d4724] rounded-md p-2">
                            <Search className="h-5 w-5 text-white" />
                          </div>
                        </div>
                      )}

                      {tab.id === "voorbereiden" && (() => {
                        // Get product filter from currentRoom
                        const productFilter = currentRoom?.selectedProduct ? {
                          hoofdcategorie: currentRoom.selectedProduct.hoofdcategorie,
                          subcategorie: currentRoom.selectedProduct.subcategorie,
                          legmethode: currentRoom.selectedProduct.legmethode,
                          legpatroon: currentRoom.selectedProduct.legpatroon,
                          typeVloerverwarming: currentRoom.selectedProduct.typeVloerverwarming,
                          geintegreerdeOndervloer: currentRoom.selectedProduct.geintegreerdeOndervloer,
                          verdieping: currentRoom.selectedProduct.verdieping
                        } : undefined;
                        
                        // Get oldSurface from translations (convert key to Dutch display name)
                        const oldSurfaceDutch = currentRoom?.oldSurface 
                          ? translations.nl.existingFloors[currentRoom.oldSurface as keyof typeof translations.nl.existingFloors] || currentRoom.oldSurface
                          : undefined;
                        
                        console.log('🔍 Voorbereiden tab - currentRoom.surface:', currentRoom?.surface);
                        console.log('🔍 Voorbereiden tab - currentRoom.oldSurface:', currentRoom?.oldSurface);
                        console.log('🔍 Voorbereiden tab - oldSurfaceDutch:', oldSurfaceDutch);
                        console.log('🔍 Voorbereiden tab - productFilter:', productFilter);
                        
                        // Get mandatory voorbereiden articles filtered by oldSurface
                        const mandatoryArticles = getMandatoryArticlesByServiceType(
                          'voorbereiden', 
                          productFilter, 
                          currentRoom?.surface,
                          oldSurfaceDutch
                        );
                        
                        console.log('🔍 Voorbereiden tab - mandatoryArticles:', mandatoryArticles);
                        
                        // Filter by search term
                        const filteredMandatoryArticles = mandatoryArticles.filter(article => 
                          matchesSectionSearchTerm(article, `${tab.id}-mandatory`)
                        );
                        
                        // Show "no services" message if no articles found
                        if (filteredMandatoryArticles.length === 0) {
                          return (
                            <div className="space-y-4">
                              <div className="p-8 text-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                                <div className="text-gray-500">
                                  {language === 'en' 
                                    ? 'No services/products of this type are available for the selected options!'
                                    : 'Voor de geselecteerde opties zijn geen diensten/producten van dit type beschikbaar!'
                                  }
                                </div>
                              </div>
                            </div>
                          );
                        }
                        
                        return (
                          <div className="space-y-4">
                            {filteredMandatoryArticles.map((article, index) => (
                              <ServiceSection
                                key={`voorbereiden-mandatory-${index}`}
                                title={`${article.productCode} - ${article.description}`}
                                surface={currentRoom?.surface || ""}
                                area={currentRoom?.area.toString() || "0"}
                                type={TYPE_MANDATORY}
                                roomId={currentRoomId || 0}
                                language={language}
                                serviceType="voorbereiden"
                                isMandatory={true}
                                rooms={rooms}
                                services={services}
                                onUpdateService={onUpdateService}
                                currentRoom={currentRoom || undefined}
                                article={article}
                              />
                            ))}
                          </div>
                        );
                      })()}
                      
                      {tab.id === "verwijdering" && (
                        <div className="space-y-4">
                          {matchesSectionSearchTerm({ productCode: 'VW-REMOVE-001', description: 'Verwijdering Bestaande Ondergrond' } as LegserviceArticle, `${tab.id}-mandatory`) && (
                          <ServiceSection
                            title="VW-REMOVE-001 - Verwijdering Bestaande Ondergrond"
                            surface={currentRoom?.surface || ""}
                            area={currentRoom?.area.toString() || "0"}
                            type={TYPE_MANDATORY}
                            roomId={currentRoomId || 0}
                            language={language}
                            serviceType="verwijdering"
                            isMandatory={true}
                            rooms={rooms}
                            services={services}
                            onUpdateService={onUpdateService}
                            currentRoom={currentRoom || undefined}
                          />
                          )}
                        </div>
                      )}
                    </div>
                    )}
                  </div>
                   );
                 })()}

                {/* Optional Services Section */}
                {hasOptionalServices(tab.id) && (() => {
                   // Calculate count for optional services
                   let servicesCount = 0;
                   
                   if (tab.id === "verwijdering") {
                     servicesCount = [
                       { productCode: 'VW-REMOVE-002', description: 'Verwijderen Plinten' },
                       { productCode: 'VW-REMOVE-003', description: 'Verwijderen Bestaande PVC Vloer' },
                       { productCode: 'VW-REMOVE-004', description: 'Verwijderen Bestaande Tegelvloer' },
                       { productCode: 'VW-REMOVE-005', description: 'Verwijderen Bestaande Parketvloer' }
                     ].filter(article => matchesSectionSearchTerm(article as LegserviceArticle, `${tab.id}-optional`)).length;
                   } else if (tab.id === "voorbereiden") {
                     servicesCount = [
                       legserviceArticles.find(a => a.productCode === "VB-EGAL-001"),
                       legserviceArticles.find(a => a.productCode === "VB-EGAL-002"),
                       legserviceArticles.find(a => a.productCode === "VB-EGAL-003")
                     ].filter(article => matchesSectionSearchTerm(article, `${tab.id}-optional`)).length;
                   } else if (tab.id === "vloerverwarming") {
                     servicesCount = [
                       { productCode: 'VW-SERVICE-001', description: 'Vloerverwarming Service' },
                       { productCode: 'VW-SERVICE-002', description: 'Extra Sensor' }
                     ].filter(article => matchesSectionSearchTerm(article as LegserviceArticle, `${tab.id}-optional`)).length;
                   }
                   
                   return (
                  <div>
                    <button
                      onClick={() => onToggleOptionalServiceCollapse(tab.id)}
                      className="w-full px-4 py-2 rounded-lg flex items-center justify-between transition-colors"
                      style={{
                        backgroundColor: `${tab.color}10`,
                        color: tab.color,
                      }}
                    >
                      <h3 className="text-lg flex items-center gap-2">
                        {t.optionalServices}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span 
                          className="inline-flex items-center justify-center min-w-[1.5rem] h-[1.5rem] px-1.5 rounded-full text-xs font-semibold"
                          style={{ backgroundColor: tab.color, color: 'white' }}
                        >
                          {servicesCount}
                        </span>
                        {collapsedOptionalSections.has(tab.id) ? (
                          <ChevronDown className="h-5 w-5" />
                        ) : (
                          <ChevronUp className="h-5 w-5" />
                        )}
                      </div>
                    </button>
                    
                    {!collapsedOptionalSections.has(tab.id) && (
                      <div className="p-4 space-y-6 rounded-lg mt-2" style={{ backgroundColor: `${tab.color}08` }}>
                        {tab.id === "verwijdering" ? (
                          <div className="space-y-4">
                            {/* Optional removal services */}
                            {matchesSectionSearchTerm({ productCode: 'VW-REMOVE-002', description: 'Verwijderen Plinten' } as LegserviceArticle, `${tab.id}-optional`) && (
                            <ServiceSection
                              title="VW-REMOVE-002 - Verwijderen Plinten"
                              surface={currentRoom?.surface || ""}
                              area={currentRoom?.area.toString() || "0"}
                              type={TYPE_OPTIONAL}
                              roomId={currentRoomId || 0}
                              language={language}
                              serviceType="verwijdering"
                              isMandatory={false}
                              rooms={rooms}
                              services={services}
                              onUpdateService={onUpdateService}
                              currentRoom={currentRoom || undefined}
                            />
                            )}
                            {matchesSectionSearchTerm({ productCode: 'VW-REMOVE-003', description: 'Verwijderen Bestaande PVC Vloer' } as LegserviceArticle, `${tab.id}-optional`) && (
                            <ServiceSection
                              title="VW-REMOVE-003 - Verwijderen Bestaande PVC Vloer"
                              surface={currentRoom?.surface || ""}
                              area={currentRoom?.area.toString() || "0"}
                              type={TYPE_OPTIONAL}
                              roomId={currentRoomId || 0}
                              language={language}
                              serviceType="verwijdering"
                              isMandatory={false}
                              rooms={rooms}
                              services={services}
                              onUpdateService={onUpdateService}
                              currentRoom={currentRoom || undefined}
                            />
                            )}
                            {matchesSectionSearchTerm({ productCode: 'VW-REMOVE-004', description: 'Verwijderen Bestaande Tegelvloer' } as LegserviceArticle, `${tab.id}-optional`) && (
                            <ServiceSection
                              title="VW-REMOVE-004 - Verwijderen Bestaande Tegelvloer"
                              surface={currentRoom?.surface || ""}
                              area={currentRoom?.area.toString() || "0"}
                              type={TYPE_OPTIONAL}
                              roomId={currentRoomId || 0}
                              language={language}
                              serviceType="verwijdering"
                              isMandatory={false}
                              rooms={rooms}
                              services={services}
                              onUpdateService={onUpdateService}
                              currentRoom={currentRoom || undefined}
                            />
                            )}
                            {matchesSectionSearchTerm({ productCode: 'VW-REMOVE-005', description: 'Verwijderen Bestaande Parketvloer' } as LegserviceArticle, `${tab.id}-optional`) && (
                            <ServiceSection
                              title="VW-REMOVE-005 - Verwijderen Bestaande Parketvloer"
                              surface={currentRoom?.surface || ""}
                              area={currentRoom?.area.toString() || "0"}
                              type={TYPE_OPTIONAL}
                              roomId={currentRoomId || 0}
                              language={language}
                              serviceType="verwijdering"
                              isMandatory={false}
                              rooms={rooms}
                              services={services}
                              onUpdateService={onUpdateService}
                              currentRoom={currentRoom || undefined}
                            />
                            )}
                          </div>
                        ) : tab.id === "voorbereiden" ? (
                          <div className="space-y-4">
                            {/* Optional voorbereiden services - egaliseren opties */}
                            {matchesSectionSearchTerm(legserviceArticles.find(a => a.productCode === "VB-EGAL-001"), `${tab.id}-optional`) && (
                            <ServiceSection
                              title="VB-EGAL-001 - Egaliseren tot 3mm"
                              surface={currentRoom?.surface || ""}
                              area={currentRoom?.area.toString() || "0"}
                              type={TYPE_OPTIONAL}
                              roomId={currentRoomId || 0}
                              language={language}
                              serviceType="voorbereiden"
                              isMandatory={false}
                              rooms={rooms}
                              services={services}
                              onUpdateService={onUpdateService}
                              currentRoom={currentRoom || undefined}
                              article={legserviceArticles.find(a => a.productCode === "VB-EGAL-001")}
                            />
                            )}
                            {matchesSectionSearchTerm(legserviceArticles.find(a => a.productCode === "VB-EGAL-002"), `${tab.id}-optional`) && (
                            <ServiceSection
                              title="VB-EGAL-002 - Egaliseren tot 6mm"
                              surface={currentRoom?.surface || ""}
                              area={currentRoom?.area.toString() || "0"}
                              type={TYPE_OPTIONAL}
                              roomId={currentRoomId || 0}
                              language={language}
                              serviceType="voorbereiden"
                              isMandatory={false}
                              rooms={rooms}
                              services={services}
                              onUpdateService={onUpdateService}
                              currentRoom={currentRoom || undefined}
                              article={legserviceArticles.find(a => a.productCode === "VB-EGAL-002")}
                            />
                            )}
                            {matchesSectionSearchTerm(legserviceArticles.find(a => a.productCode === "VB-EGAL-003"), `${tab.id}-optional`) && (
                            <ServiceSection
                              title="VB-EGAL-003 - Egaliseren tot 10mm"
                              surface={currentRoom?.surface || ""}
                              area={currentRoom?.area.toString() || "0"}
                              type={TYPE_OPTIONAL}
                              roomId={currentRoomId || 0}
                              language={language}
                              serviceType="voorbereiden"
                              isMandatory={false}
                              rooms={rooms}
                              services={services}
                              onUpdateService={onUpdateService}
                              currentRoom={currentRoom || undefined}
                              article={legserviceArticles.find(a => a.productCode === "VB-EGAL-003")}
                            />
                            )}
                            {matchesSectionSearchTerm(legserviceArticles.find(a => a.productCode === "VB-EGAL-004"), `${tab.id}-optional`) && (
                            <ServiceSection
                              title="VB-EGAL-004 - Egaliseren Waterpas"
                              surface={currentRoom?.surface || ""}
                              area={currentRoom?.area.toString() || "0"}
                              type={TYPE_OPTIONAL}
                              roomId={currentRoomId || 0}
                              language={language}
                              serviceType="voorbereiden"
                              isMandatory={false}
                              rooms={rooms}
                              services={services}
                              onUpdateService={onUpdateService}
                              currentRoom={currentRoom || undefined}
                              article={legserviceArticles.find(a => a.productCode === "VB-EGAL-004")}
                            />
                            )}
                          </div>
                        ) : (
                          <div className="py-4 text-center text-gray-500">
                            {language === 'en' 
                              ? 'Optional services for this category will be available soon'
                              : 'Optionele services voor deze categorie komen binnenkort beschikbaar'
                            }
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                   );
                 })()}

                {/* Extra Configurator Section - Only for voorbereiden tab */}
                {tab.id === "voorbereiden" && (() => {
                  // Check for VOORBEREIDEN-10600 (based on oldSurface only)
                  const oldSurfaceDutch = currentRoom?.oldSurface 
                    ? translations.nl.existingFloors[currentRoom.oldSurface as keyof typeof translations.nl.existingFloors] || currentRoom.oldSurface
                    : undefined;
                  const voorbereidenArticle = legserviceArticles.find(a => a.productCode === "VOORBEREIDEN-10600");
                  
                  // Check if oldSurface matches any in voorbereidenArticle's ondergrond
                  const oldSurfaceMatch = oldSurfaceDutch && voorbereidenArticle?.ondergrond?.split(';').map(s => s.trim()).some(s => 
                    s.toLowerCase() === oldSurfaceDutch.toLowerCase()
                  );
                  
                  console.log("🔍 Extra Configurator Section Debug:");
                  console.log("   Old surface:", currentRoom?.oldSurface);
                  console.log("   Old surface Dutch:", oldSurfaceDutch);
                  console.log("   Old surface matches:", oldSurfaceMatch);
                  console.log("   VOORBEREIDEN article found:", !!voorbereidenArticle);
                  console.log("   Section collapsed:", collapsedOptionalSections.has("voorbereiden-extra"));
                  
                  return (
                    <div>
                      <button
                        onClick={() => onToggleOptionalServiceCollapse("voorbereiden-extra")}
                        className="w-full px-4 py-2 rounded-lg flex items-center justify-between transition-colors"
                        style={{
                          backgroundColor: `${tab.color}10`,
                          color: tab.color,
                        }}
                      >
                        <h3 className="text-lg">Extra configurator</h3>
                        {collapsedOptionalSections.has("voorbereiden-extra") ? (
                          <ChevronDown className="h-5 w-5" />
                        ) : (
                          <ChevronUp className="h-5 w-5" />
                        )}
                      </button>
                      
                      {!collapsedOptionalSections.has("voorbereiden-extra") && (
                        <div className="p-4 space-y-6 rounded-lg mt-2" style={{ backgroundColor: `${tab.color}08` }}>
                          {/* Show VOORBEREIDEN-10600 if oldSurface matches */}
                          {oldSurfaceMatch && voorbereidenArticle ? (
                            <div className="space-y-4">
                              <ServiceSection
                                title={`${voorbereidenArticle.productCode} - ${voorbereidenArticle.description}`}
                                surface={currentRoom?.oldSurface || ""}
                                area={currentRoom?.area.toString() || "0"}
                                type="Extra configurator"
                                roomId={currentRoomId || 0}
                                language={language}
                                serviceType="voorbereiden"
                                isMandatory={false}
                                rooms={rooms}
                                services={services}
                                onUpdateService={onUpdateService}
                                currentRoom={currentRoom || undefined}
                                article={voorbereidenArticle}
                              />
                            </div>
                          ) : (
                            <div className="py-4 text-center text-gray-500">
                              {language === 'en' 
                                ? 'No extra configurator services available for this subfloor type'
                                : 'Geen extra configurator services beschikbaar voor dit type ondergrond'
                              }
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Container Section - Only for verwijdering tab */}
                {tab.id === "verwijdering" && (
                  <div>
                    <button
                      onClick={() => onToggleOptionalServiceCollapse("verwijdering-container")}
                      className="w-full px-4 py-2 rounded-lg flex items-center justify-between transition-colors"
                      style={{
                        backgroundColor: `${tab.color}10`,
                        color: tab.color,
                      }}
                    >
                      <h3 className="text-lg">Container</h3>
                      {collapsedOptionalSections.has("verwijdering-container") ? (
                        <ChevronDown className="h-5 w-5" />
                      ) : (
                        <ChevronUp className="h-5 w-5" />
                      )}
                    </button>
                    
                    {!collapsedOptionalSections.has("verwijdering-container") && (
                      <div className="p-4 space-y-6 rounded-lg mt-2" style={{ backgroundColor: `${tab.color}08` }}>
                        {/* Container services with 3 separate article lines */}
                        <div className="space-y-4">
                          {/* Kleine Container */}
                          <ServiceSection
                            title="CON-KLEIN-001 - Kleine Container (2-4 m³)"
                            surface=""
                            area=""
                            type={TYPE_OPTIONAL}
                            roomId={currentRoomId || 0}
                            language={language}
                            serviceType="container"
                            isMandatory={false}
                            rooms={rooms}
                            services={services}
                            onUpdateService={onUpdateService}
                            isContainerService={true}
                            containerDescription={t.serviceSection.containerSmallDescription}
                          />
                          
                          {/* Middelgrote Container */}
                          <ServiceSection
                            title="CON-MIDDEL-001 - Middelgrote Container (4-8 m³)"
                            surface=""
                            area=""
                            type={TYPE_OPTIONAL}
                            roomId={currentRoomId || 0}
                            language={language}
                            serviceType="container"
                            isMandatory={false}
                            rooms={rooms}
                            services={services}
                            onUpdateService={onUpdateService}
                            isContainerService={true}
                            containerDescription={t.serviceSection.containerMediumDescription}
                          />
                          
                          {/* Grote Container */}
                          <ServiceSection
                            title="CON-GROOT-001 - Grote Container (8-12 m³)"
                            surface=""
                            area=""
                            type={TYPE_OPTIONAL}
                            roomId={currentRoomId || 0}
                            language={language}
                            serviceType="container"
                            isMandatory={false}
                            rooms={rooms}
                            services={services}
                            onUpdateService={onUpdateService}
                            isContainerService={true}
                            containerDescription={t.serviceSection.containerLargeDescription}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
