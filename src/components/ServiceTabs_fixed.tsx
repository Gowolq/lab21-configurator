import { useState, useEffect } from "react";
import { Check, Info, ChevronDown, ChevronUp, Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ServiceSection } from "./ServiceSection";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useTranslation } from "../utils/translations";
import { 
  legserviceArticles, 
  getArticlesByCategory, 
  articleCategories, 
  getMandatoryArticlesByServiceType,
  getOptionalArticlesByServiceType,
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
}

export function ServiceTabs({ rooms, currentRoomId, language, services = [], onUpdateService, onOpenServiceArticleDetail }: ServiceTabsProps) {
  const t = useTranslation(language);
  const [deactivatedTabs, setDeactivatedTabs] = useState<Set<string>>(new Set());
  const [collapsedOptionalSections, setCollapsedOptionalSections] = useState<Set<string>>(new Set());
  // Shared state for legservice meters per room - enables filtering across all legservices in a room
  const [legserviceMeters, setLegserviceMeters] = useState<{[roomId: number]: number}>({});

  // Removed getServiceArticleCode - not needed anymore

  const roomsWithProducts = rooms.filter(room => room.product && room.surface && room.area > 0);
  const currentRoom = currentRoomId ? rooms.find(room => room.id === currentRoomId) : null;
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
      geintegreerdeOndervloer: room.selectedProduct.geintegreerdeOndervloer
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

  // Define all available service tabs
  const allTabs = [
    { id: "legservice", label: t.serviceTabs.legservice, removable: false },
    { id: "verwijdering", label: t.serviceTabs.verwijdering, removable: true },
    { id: "container", label: t.serviceTabs.container, removable: true },
    { id: "droogbouw", label: t.serviceTabs.droogbouw, removable: true },
    { id: "vloerverwarming", label: t.serviceTabs.vloerverwarming, removable: true },
    { id: "ondervloer", label: t.serviceTabs.ondervloer, removable: true }
  ];

  // Check which surfaces allow removal/container services
  const allowedSurfacesForRemoval = [
    'pvc', 'vinyl', 'linoleum', 'tapijt', 'laminaat', 
    'parket', 'hout', 'tegels', 'natuursteen'
  ];

  const hasRoomsWithRemovalAllowedSurfaces = roomsWithProducts.some(room => {
    const surfaceValue = room.surface.toLowerCase();
    return allowedSurfacesForRemoval.some(allowedSurface => 
      surfaceValue.includes(allowedSurface.toLowerCase())
    );
  });

  // Check which surfaces allow underfloor heating services
  const allowedSurfacesForHeating = [
    'zandcement', 'fermacell', 'knaufBrio', 'anhydriet'
  ];

  const hasRoomsWithHeatingAllowedSurfaces = roomsWithProducts.some(room => {
    const surfaceValue = room.surface.toLowerCase();
    return allowedSurfacesForHeating.some(allowedSurface => {
      const surfaceNameToKey: { [key: string]: string } = {
        'zandcement': 'zandcement',
        'sand cement': 'zandcement',
        'fermacell': 'fermacell',
        'knauf brio': 'knaufBrio',
        'knaufbrio': 'knaufBrio',
        'anhydriet': 'anhydriet',
        'anhydrite': 'anhydriet'
      };
      
      return Object.keys(surfaceNameToKey).some(surfaceName => {
        const allowedKey = surfaceNameToKey[surfaceName];
        return surfaceValue.includes(surfaceName) && allowedKey === allowedSurface;
      });
    });
  });

  // Check which surfaces require mandatory removal services (cannot be deactivated)
  // These surfaces from the image require mandatory removal when combined with "Gelijmd" legmethode
  const mandatoryRemovalSurfaces = [
    // Dutch names
    'leisteen', 'marmoleum', 'linoleum', 'parketvloer (verlijmd)', 
    'parketvloer (zwevend)', 'travertin', 'zandsteen',
    // English names  
    'slate', 'marmoleum/linoleum', 'parquet floor (glued)', 
    'parquet floor (floating)', 'travertine', 'sandstone'
  ];

  const hasRoomsWithMandatoryRemovalSurfaces = roomsWithProducts.some(room => {
    const surfaceValue = room.surface.toLowerCase();
    const hasRequiredSurface = mandatoryRemovalSurfaces.some(mandatorySurface => {
      return surfaceValue.includes(mandatorySurface.toLowerCase());
    });
    
    // Check if the selected product has "Gelijmd" legmethode
    const hasGelijmdeLegmethode = room.selectedProduct && room.selectedProduct.legmethode === 'Gelijmd';
    
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

  // Handler for legservice meters input - updates shared state for room-wide filtering
  const handleLegserviceMetersChange = (roomId: number, meters: number) => {
    setLegserviceMeters(prev => ({
      ...prev,
      [roomId]: meters
    }));
  };

  const toggleOptionalServiceCollapse = (serviceType: string) => {
    setCollapsedOptionalSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(serviceType)) {
        newSet.delete(serviceType);
      } else {
        newSet.add(serviceType);
      }
      return newSet;
    });
  };

  const hasRoomsWithProducts = currentRoomWithProducts.length > 0;

  // Helper function to check if a service tab has mandatory services
  const hasMandatoryServices = (tabId: string) => {
    if (tabId === 'legservice') {
      return hasRoomsWithProducts; // Legservice has mandatory services if there are rooms with products
    }
    if (tabId === 'vloerverwarming') {
      return hasRoomsWithHeatingAllowedSurfaces; // Vloerverwarming has mandatory services if heating surfaces exist
    }
    if (tabId === 'verwijdering') {
      return hasRoomsWithMandatoryRemovalSurfaces; // Only has mandatory if surfaces require it
    }
    return false; // container, ondervloer never have mandatory services
  };

  // Update collapsed state based on whether tabs have mandatory services
  useEffect(() => {
    const newCollapsedSections = new Set<string>();
    
    // Determine which tabs should have collapsed optional sections
    if (hasRoomsWithProducts) {
      newCollapsedSections.add('legservice');
    }
    if (hasRoomsWithHeatingAllowedSurfaces) {
      newCollapsedSections.add('vloerverwarming');
    }
    if (hasRoomsWithMandatoryRemovalSurfaces) {
      newCollapsedSections.add('verwijdering');
    }
    // container and ondervloer never get added (they stay open)
    
    setCollapsedOptionalSections(newCollapsedSections);
  }, [hasRoomsWithProducts, hasRoomsWithMandatoryRemovalSurfaces, hasRoomsWithHeatingAllowedSurfaces]);

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
        <TabsList className="grid w-full grid-cols-6 gap-1 h-auto p-1 bg-gray-100 rounded-lg">
          {visibleTabs.map((tab) => {
            const isDeactivated = deactivatedTabs.has(tab.id);
            return (
              <div key={tab.id} className="relative">
                <TabsTrigger
                  value={tab.id}
                  disabled={isDeactivated}
                  className={`w-full px-2 py-2 text-sm text-center whitespace-nowrap overflow-hidden text-ellipsis flex items-center justify-center gap-1 rounded-lg ${
                    isDeactivated 
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed data-[state=active]:bg-gray-300 data-[state=active]:text-gray-500' 
                      : 'data-[state=active]:bg-[#104f25] data-[state=active]:text-white'
                  }`}
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
            {tab.id === "vloerverwarming" ? (
              <div className="space-y-6">
                {/* Special checkboxes for vloerverwarming */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-3">
                    {language === 'en' ? 'Additional Heating Options' : 'Aanvullende Verwarmingsopties'}
                  </h4>
                  
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="druktest-systeem" />
                      <Label htmlFor="druktest-systeem" className="text-sm">
                        {language === 'en' ? 'Pressure test' : 'Druktest'}
                      </Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-gray-400 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">
                              {language === 'en' 
                                ? 'Comprehensive pressure testing to ensure system integrity'
                                : 'Uitgebreide druktest om de systeemintegriteit te waarborgen'
                              }
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox id="opstart-service" />
                      <Label htmlFor="opstart-service" className="text-sm">
                        {language === 'en' ? 'Startup service' : 'Opstart service'}
                      </Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-gray-400 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">
                              {language === 'en' 
                                ? 'Professional startup and commissioning of the heating system'
                                : 'Professionele opstart en inbedrijfstelling van het verwarmingssysteem'
                              }
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox id="verdeler-aansluiten" />
                      <Label htmlFor="verdeler-aansluiten" className="text-sm">
                        {language === 'en' ? 'Connect distributor' : 'Verdeler aansluiten'}
                      </Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-gray-400 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">
                              {language === 'en' 
                                ? 'Professional connection of the heating system distributor'
                                : 'Professionele aansluiting van de verwarmingssysteem verdeler'
                              }
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox id="thermostaat-plaatsen" />
                      <Label htmlFor="thermostaat-plaatsen" className="text-sm">
                        {language === 'en' ? 'Install thermostat' : 'Thermostaat plaatsen'}
                      </Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-gray-400 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">
                              {language === 'en' 
                                ? 'Professional installation and setup of the room thermostat'
                                : 'Professionele installatie en instelling van de kamerthermostaat'
                              }
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                </div>

                {/* Mandatory Services Section */}
                <div>
                  <div className="bg-[#104f25]/10 text-[#104f25] px-4 py-2 rounded-lg">
                    <h3 className="text-lg">{t.mandatoryServices}</h3>
                  </div>
                  <div className="p-4 space-y-6 bg-[#104f2508] rounded-lg mt-2">
                    {currentRoomWithProducts.length > 0 ? currentRoomWithProducts.map((room) => (
                      <div key={`${room.id}-mandatory`} className="space-y-4">
                        {getMandatoryArticlesByServiceType("vloerverwarming", getProductFilterFromRoom(room), room.surface).map((article, index) => (
                          <ServiceSection
                            key={`${room.id}-${article.productCode}-mandatory-${index}`}
                            title={getArticleTitle(article)}
                            surface={room.surface}
                            area={room.area.toString()}
                            type="Verplicht"
                            roomId={room.id}
                            language={language}
                            serviceType="vloerverwarming"
                            isMandatory={true}
                            rooms={rooms}
                            services={services}
                            onUpdateService={onUpdateService}
                            onOpenServiceArticleDetail={() => onOpenServiceArticleDetail && onOpenServiceArticleDetail(article)}
                            article={article}
                          />
                        ))}
                      </div>
                    )) : (
                      <div className="py-4 text-center text-gray-500">
                        {t.mandatoryServicesMessage}
                      </div>
                    )}
                  </div>
                </div>

                {/* Optional Services Section */}
                <div>
                  <button
                    onClick={() => toggleOptionalServiceCollapse("vloerverwarming")}
                    className="w-full bg-[#104f25]/10 text-[#104f25] px-4 py-2 rounded-lg flex items-center justify-between hover:bg-[#104f25]/15 transition-colors"
                  >
                    <h3 className="text-lg">{t.optionalServices}</h3>
                    {collapsedOptionalSections.has("vloerverwarming") ? (
                      <ChevronDown className="h-5 w-5" />
                    ) : (
                      <ChevronUp className="h-5 w-5" />
                    )}
                  </button>
                  
                  {!collapsedOptionalSections.has("vloerverwarming") && (
                    <div className="p-4 space-y-6 bg-[#104f2508] rounded-lg mt-2">
                      {currentRoomWithProducts.length > 0 ? currentRoomWithProducts.map((room) => (
                        <div key={`${room.id}-optional`} className="space-y-4">
                          {getOptionalArticlesByServiceType("vloerverwarming", getProductFilterFromRoom(room), room.surface).map((article, index) => (
                            <ServiceSection
                              key={`${room.id}-${article.productCode}-optional-${index}`}
                              title={getArticleTitle(article)}
                              surface={room.surface}
                              area={room.area.toString()}
                              type="Optioneel"
                              roomId={room.id}
                              language={language}
                              serviceType="vloerverwarming"
                              isMandatory={false}
                              rooms={rooms}
                              services={services}
                              onUpdateService={onUpdateService}
                              onOpenServiceArticleDetail={() => onOpenServiceArticleDetail && onOpenServiceArticleDetail(article)}
                              article={article}
                            />
                          ))}
                        </div>
                      )) : (
                        <div className="py-4 text-center text-gray-500">
                          {t.optionalServicesMessage}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : tab.id === "legservice" ? (
              <div className="space-y-6">
                {/* Mandatory Services Section */}
                <div>
                  <div className="bg-[#104f25]/10 text-[#104f25] px-4 py-2 rounded-lg">
                    <h3 className="text-lg">{t.mandatoryServices}</h3>
                  </div>
                  <div className="p-4 space-y-6 bg-[#104f2508] rounded-lg mt-2">
                    {currentRoomWithProducts.length > 0 ? currentRoomWithProducts.map((room) => (
                      <div key={`${room.id}-mandatory`} className="space-y-4">
                        {getMandatoryArticlesByServiceType("legservice", getProductFilterFromRoom(room), room.surface).map((article, index) => (
                          <ServiceSection
                            key={`${room.id}-${article.productCode}-mandatory-${index}`}
                            title={getArticleTitle(article)}
                            surface={room.surface}
                            area={room.area.toString()}
                            type="Verplicht"
                            roomId={room.id}
                            language={language}
                            serviceType="legservice"
                            isMandatory={true}
                            rooms={rooms}
                            services={services}
                            onUpdateService={onUpdateService}
                            onOpenServiceArticleDetail={() => onOpenServiceArticleDetail && onOpenServiceArticleDetail(article)}
                            article={article}
                            legserviceMeters={legserviceMeters[room.id] || 0}
                            onLegserviceMetersChange={(meters) => handleLegserviceMetersChange(room.id, meters)}
                          />
                        ))}
                      </div>
                    )) : (
                      <div className="py-4 text-center text-gray-500">
                        {t.mandatoryServicesMessage}
                      </div>
                    )}
                  </div>
                </div>

                {/* Optional Services Section */}
                <div>
                  <button
                    onClick={() => toggleOptionalServiceCollapse("legservice")}
                    className="w-full bg-[#104f25]/10 text-[#104f25] px-4 py-2 rounded-lg flex items-center justify-between hover:bg-[#104f25]/15 transition-colors"
                  >
                    <h3 className="text-lg">{t.optionalServices}</h3>
                    {collapsedOptionalSections.has("legservice") ? (
                      <ChevronDown className="h-5 w-5" />
                    ) : (
                      <ChevronUp className="h-5 w-5" />
                    )}
                  </button>
                  
                  {!collapsedOptionalSections.has("legservice") && (
                    <div className="p-4 space-y-6 bg-[#104f2508] rounded-lg mt-2">
                      {currentRoomWithProducts.length > 0 ? currentRoomWithProducts.map((room) => (
                        <div key={`${room.id}-optional`} className="space-y-4">
                          {getOptionalArticlesByServiceType("legservice", getProductFilterFromRoom(room), room.surface).map((article, index) => (
                            <ServiceSection
                              key={`${room.id}-${article.productCode}-optional-${index}`}
                              title={getArticleTitle(article)}
                              surface={room.surface}
                              area={room.area.toString()}
                              type="Optioneel"
                              roomId={room.id}
                              language={language}
                              serviceType="legservice"
                              isMandatory={false}
                              rooms={rooms}
                              services={services}
                              onUpdateService={onUpdateService}
                              onOpenServiceArticleDetail={() => onOpenServiceArticleDetail && onOpenServiceArticleDetail(article)}
                              article={article}
                              legserviceMeters={legserviceMeters[room.id] || 0}
                              onLegserviceMetersChange={(meters) => handleLegserviceMetersChange(room.id, meters)}
                            />
                          ))}
                        </div>
                      )) : (
                        <div className="py-4 text-center text-gray-500">
                          {t.optionalServicesMessage}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Mandatory Services Section - only show for verwijdering if mandatory removal is required, never show for container */}
                {(tab.id !== 'verwijdering' || hasRoomsWithMandatoryRemovalSurfaces) && tab.id !== 'container' && (
                  <div>
                    <div className="bg-[#104f25]/10 text-[#104f25] px-4 py-2 rounded-lg">
                      <h3 className="text-lg">{t.mandatoryServices}</h3>
                    </div>
                    <div className="p-4 space-y-6 bg-[#104f2508] rounded-lg mt-2">
                      {currentRoomWithProducts.length > 0 ? currentRoomWithProducts.map((room) => (
                        <div key={`${room.id}-mandatory`} className="space-y-4">
                          {getMandatoryArticlesByServiceType(tab.id, getProductFilterFromRoom(room), room.surface).map((article, index) => (
                            <ServiceSection
                              key={`${room.id}-${article.productCode}-mandatory-${index}`}
                              title={getArticleTitle(article)}
                              surface={room.surface}
                              area={room.area.toString()}
                              type="Verplicht"
                              roomId={room.id}
                              language={language}
                              serviceType={tab.id}
                              isMandatory={true}
                              rooms={rooms}
                              services={services}
                              onUpdateService={onUpdateService}
                              onOpenServiceArticleDetail={() => onOpenServiceArticleDetail && onOpenServiceArticleDetail(article)}
                              article={article}
                            />
                          ))}
                        </div>
                      )) : (
                        <div className="py-4 text-center text-gray-500">
                          {t.mandatoryServicesMessage}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Optional Services Section */}
                <div>
                  <button
                    onClick={() => toggleOptionalServiceCollapse(tab.id)}
                    className="w-full bg-[#104f25]/10 text-[#104f25] px-4 py-2 rounded-lg flex items-center justify-between hover:bg-[#104f25]/15 transition-colors"
                  >
                    <h3 className="text-lg">{t.optionalServices}</h3>
                    {collapsedOptionalSections.has(tab.id) ? (
                      <ChevronDown className="h-5 w-5" />
                    ) : (
                      <ChevronUp className="h-5 w-5" />
                    )}
                  </button>
                  
                  {!collapsedOptionalSections.has(tab.id) && (
                    <div className="p-4 space-y-6 bg-[#104f2508] rounded-lg mt-2">
                      {tab.id === 'container' ? (
                        // Special container interface
                        <div className="space-y-4">
                          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <h4 className="font-medium text-blue-800 mb-3">
                              {language === 'en' ? 'Container Services' : 'Container Services'}
                            </h4>
                            
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="border border-gray-200 rounded-lg p-3">
                                  <h5 className="font-medium mb-2">
                                    {language === 'en' ? 'Small Container' : 'Kleine Container'}
                                  </h5>
                                  <p className="text-sm text-gray-600 mb-3">
                                    {language === 'en' 
                                      ? '3m³ - Suitable for small rooms'
                                      : '3m³ - Geschikt voor kleine ruimtes'
                                    }
                                  </p>
                                  <div className="flex items-center space-x-2">
                                    <Label htmlFor="small-container" className="text-sm">
                                      {language === 'en' ? 'Quantity:' : 'Aantal:'}
                                    </Label>
                                    <input 
                                      id="small-container"
                                      type="number" 
                                      min="0" 
                                      defaultValue="0"
                                      className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                                    />
                                  </div>
                                </div>

                                <div className="border border-gray-200 rounded-lg p-3">
                                  <h5 className="font-medium mb-2">
                                    {language === 'en' ? 'Medium Container' : 'Middelgrote Container'}
                                  </h5>
                                  <p className="text-sm text-gray-600 mb-3">
                                    {language === 'en' 
                                      ? '6m³ - Suitable for medium rooms'
                                      : '6m³ - Geschikt voor middelgrote ruimtes'
                                    }
                                  </p>
                                  <div className="flex items-center space-x-2">
                                    <Label htmlFor="medium-container" className="text-sm">
                                      {language === 'en' ? 'Quantity:' : 'Aantal:'}
                                    </Label>
                                    <input 
                                      id="medium-container"
                                      type="number" 
                                      min="0" 
                                      defaultValue="0"
                                      className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                                    />
                                  </div>
                                </div>

                                <div className="border border-gray-200 rounded-lg p-3">
                                  <h5 className="font-medium mb-2">
                                    {language === 'en' ? 'Large Container' : 'Grote Container'}
                                  </h5>
                                  <p className="text-sm text-gray-600 mb-3">
                                    {language === 'en' 
                                      ? '10m³ - Suitable for large rooms'
                                      : '10m³ - Geschikt voor grote ruimtes'
                                    }
                                  </p>
                                  <div className="flex items-center space-x-2">
                                    <Label htmlFor="large-container" className="text-sm">
                                      {language === 'en' ? 'Quantity:' : 'Aantal:'}
                                    </Label>
                                    <input 
                                      id="large-container"
                                      type="number" 
                                      min="0" 
                                      defaultValue="0"
                                      className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        // Regular service sections for all other tabs
                        currentRoomWithProducts.length > 0 ? currentRoomWithProducts.map((room) => (
                          <div key={`${room.id}-optional`} className="space-y-4">
                            {getOptionalArticlesByServiceType(tab.id, getProductFilterFromRoom(room), room.surface).map((article, index) => (
                              <ServiceSection
                                key={`${room.id}-${article.productCode}-optional-${index}`}
                                title={getArticleTitle(article)}
                                surface={room.surface}
                                area={room.area.toString()}
                                type="Optioneel"
                                roomId={room.id}
                                language={language}
                                serviceType={tab.id}
                                isMandatory={false}
                                rooms={rooms}
                                services={services}
                                onUpdateService={onUpdateService}
                                onOpenServiceArticleDetail={() => onOpenServiceArticleDetail && onOpenServiceArticleDetail(article)}
                                article={article}
                              />
                            ))}
                          </div>
                        )) : (
                          <div className="py-4 text-center text-gray-500">
                            {t.optionalServicesMessage}
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}