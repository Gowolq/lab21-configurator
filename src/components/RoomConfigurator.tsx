import { useState, Fragment } from "react";
import { ChevronDown, Search, Trash2, Plus } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";
import { useTranslation } from "../utils/translations";

interface Product {
  id: string;
  name: string;
  code: string;
  configuratorName?: string;
  image?: string;
  category?: string;
  brand?: string;
  collection?: string;
  size?: string;
  thickness?: string;
  surface?: string;
  color?: string;
  legmethode?: string;
  hoofdcategorie?: string;
  subcategorie?: string;
  legpatroon?: string;
  typeVloerverwarming?: string;
  geintegreerdeOndervloer?: string;
  verdieping?: string;
}

interface Curtain {
  id: number;
  width: number; // in cm
  height: number; // in cm
  operation?: string; // Links or Rechts
}

interface CurtainGroup {
  id: number;
  groupNumber: string; // 1-20
  curtains: Curtain[]; // Multiple curtains within a group
  description?: string; // Description of the group
}

interface WindowGroup {
  id: number;
  groupType: string; // groep1-6
  frameMaterial?: string; // Kunststof / Hout / Aluminium
  width: number;
  height: number;
  operation?: string; // Hand / Electrisch / Electrisch accu
}

interface Room {
  id: number;
  level: string;
  roomName: string;
  oldSurface: string; // Oude basisvloer
  newSurface: string; // Nieuwe basisvloer
  surface: string; // Backwards compatibility - will be removed later
  area: number;
  product?: string;
  selectedProduct?: Product;
  collapsed?: boolean;
  width?: number; // For non-curtain configurators
  height?: number; // For non-curtain configurators
  curtainGroups?: CurtainGroup[]; // For curtain configurator - multiple groups per room
  windowGroups?: WindowGroup[]; // For window decoration configurator - additional groups
  underfloorHeatingType?: string; // Type vloerverwarming
  underfloorHeatingInstallation?: string; // Aanleggen vloerverwarming
}

interface RoomConfiguratorProps {
  roomNumber: number;
  initialData?: Room;
  onDelete?: () => void;
  onUpdate?: (updates: Partial<Room>) => void;
  showDelete?: boolean;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  allRooms?: Room[]; // Voor het kopiëren van producten uit andere ruimtes
  language: string;
  onSelectProduct?: () => void;
  onOpenProductDetail?: () => void;
  currentConfigurator?: string; // Welke configurator is actief (Vloer, Droogbouw, etc.)
  serviceSearchTerm?: string; // Zoekterm voor services
  onServiceSearchTermChange?: (searchTerm: string) => void; // Handler voor zoekterm wijziging
  onSearchClicked?: () => void; // Handler voor wanneer de zoekknop wordt geklikt
}

export function RoomConfigurator({ 
  roomNumber, 
  initialData,
  onDelete, 
  onUpdate,
  showDelete = true,
  collapsed = false,
  onToggleCollapse,
  allRooms = [],
  language,
  onSelectProduct,
  onOpenProductDetail,
  currentConfigurator = "Vloer",
  serviceSearchTerm = "",
  onServiceSearchTermChange,
  onSearchClicked
}: RoomConfiguratorProps) {
  const t = useTranslation(language);
  
  // Check if this configurator needs product selection
  const needsProductSelection = [
    "Vloer", 
    "Raamdecoratie"
  ].includes(currentConfigurator);
  
  // Local state for service search input
  const [serviceSearchInput, setServiceSearchInput] = useState(serviceSearchTerm);
  
  // State for configuration change alert
  const [showConfigChangeAlert, setShowConfigChangeAlert] = useState(false);
  
  // State for window groups (Raamdecoratie)
  const [windowGroups, setWindowGroups] = useState<WindowGroup[]>(initialData?.windowGroups || []);
  
  // Handlers for service search
  const handleServiceSearch = () => {
    onServiceSearchTermChange?.(serviceSearchInput);
    onSearchClicked?.(); // Trigger search clicked event
  };

  const handleServiceSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleServiceSearch();
    }
  };
  const handleLevelChange = (value: string) => {
    onUpdate?.({ level: value });
    // Only show alert for Gordijnen configurator if there was already a value (actual change)
    if (currentConfigurator === "Gordijnen") {
      if (initialData?.level) {
        setShowConfigChangeAlert(true);
      }
    } else {
      setShowConfigChangeAlert(true);
    }
  };

  const handleRoomNameChange = (value: string) => {
    onUpdate?.({ roomName: value });
    // Only show alert for Gordijnen configurator if there was already a value (actual change)
    if (currentConfigurator === "Gordijnen") {
      if (initialData?.roomName) {
        setShowConfigChangeAlert(true);
      }
    } else {
      setShowConfigChangeAlert(true);
    }
  };

  const handleSurfaceChange = (value: string) => {
    // Get the display name from translations
    const surfaceDisplayName = t.surfaces[value as keyof typeof t.surfaces] || value;
    onUpdate?.({ surface: surfaceDisplayName });
    // Only show alert for Gordijnen configurator if there was already a value (actual change)
    if (currentConfigurator === "Gordijnen") {
      if (initialData?.surface) {
        setShowConfigChangeAlert(true);
      }
    } else {
      setShowConfigChangeAlert(true);
    }
  };

  const handleOldSurfaceChange = (value: string) => {
    // Store the key, not the translated display name
    onUpdate?.({ oldSurface: value });
    setShowConfigChangeAlert(true);
  };

  const handleNewSurfaceChange = (value: string) => {
    // Store the key, not the translated display name
    // Update both newSurface AND surface for backwards compatibility
    onUpdate?.({ 
      newSurface: value,
      surface: value // Also update surface so ServiceSection can read it
    });
    setShowConfigChangeAlert(true);
  };

  const handleAreaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove leading zeros
    const cleanedValue = e.target.value.replace(/^0+(?=\d)/, '');
    const area = parseInt(cleanedValue) || 0;
    onUpdate?.({ area });
    // Only show alert for Gordijnen configurator if there was already a value (actual change)
    if (currentConfigurator === "Gordijnen") {
      if (initialData?.area) {
        setShowConfigChangeAlert(true);
      }
    } else {
      setShowConfigChangeAlert(true);
    }
  };

  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleanedValue = e.target.value.replace(/^0+(?=\d)/, '');
    const width = parseInt(cleanedValue) || 0;
    onUpdate?.({ width });
    setShowConfigChangeAlert(true);
  };

  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleanedValue = e.target.value.replace(/^0+(?=\d)/, '');
    const height = parseInt(cleanedValue) || 0;
    onUpdate?.({ height });
    setShowConfigChangeAlert(true);
  };

  // Add a new window group
  const handleAddWindowGroup = () => {
    const newGroup: WindowGroup = {
      id: Date.now(),
      groupType: 'groep1',
      width: 0,
      height: 0
    };
    const updatedGroups = [...windowGroups, newGroup];
    setWindowGroups(updatedGroups);
    onUpdate?.({ windowGroups: updatedGroups });
  };

  // Remove a window group
  const handleRemoveWindowGroup = (groupId: number) => {
    const updatedGroups = windowGroups.filter(g => g.id !== groupId);
    setWindowGroups(updatedGroups);
    onUpdate?.({ windowGroups: updatedGroups });
  };

  // Update a window group
  const handleUpdateWindowGroup = (groupId: number, updates: Partial<WindowGroup>) => {
    const updatedGroups = windowGroups.map(g => 
      g.id === groupId ? { ...g, ...updates } : g
    );
    setWindowGroups(updatedGroups);
    onUpdate?.({ windowGroups: updatedGroups });
  };

  const handleProductSelect = () => {
    onSelectProduct?.();
  };

  const handleCopyFromRoom = (sourceRoomId: string) => {
    if (!sourceRoomId) return;
    
    const sourceRoom = allRooms.find(room => room.id.toString() === sourceRoomId);
    if (sourceRoom && sourceRoom.product && sourceRoom.product.trim().length > 0) {
      onUpdate?.({ 
        product: sourceRoom.product,
        level: sourceRoom.level,
        roomName: sourceRoom.roomName, 
        surface: sourceRoom.surface,
        area: sourceRoom.area
      });
    }
  };

  // Krijg alle ruimtes met producten (behalve de huidige ruimte)
  const roomsWithProducts = allRooms.filter(room => 
    room.id !== roomNumber && 
    room.product && 
    typeof room.product === 'string' &&
    room.product.trim().length > 10
  );

  // Curtain group handlers
  const handleAddCurtainGroup = () => {
    const currentGroups = initialData?.curtainGroups || [];
    const newGroupId = currentGroups.length > 0 
      ? Math.max(...currentGroups.map(g => g.id)) + 1 
      : 1;
    
    const newGroup: CurtainGroup = {
      id: newGroupId,
      groupNumber: (currentGroups.length + 1).toString(),
      curtains: [{ id: 1, width: 0, height: 0 }],
      description: ''
    };
    
    onUpdate?.({ curtainGroups: [...currentGroups, newGroup] });
  };

  const handleRemoveCurtainGroup = (groupId: number) => {
    const updatedGroups = (initialData?.curtainGroups || []).filter(g => g.id !== groupId);
    // Renumber groups after deletion
    const renumberedGroups = updatedGroups.map((g, index) => ({
      ...g,
      groupNumber: (index + 1).toString()
    }));
    onUpdate?.({ curtainGroups: renumberedGroups });
  };

  const handleCurtainGroupChange = (groupId: number, field: string, value: string) => {
    const updatedGroups = (initialData?.curtainGroups || []).map(g => 
      g.id === groupId ? { ...g, [field]: value } : g
    );
    onUpdate?.({ curtainGroups: updatedGroups });
  };

  const handleAddCurtain = (groupId: number) => {
    const updatedGroups = (initialData?.curtainGroups || []).map(g => {
      if (g.id === groupId) {
        const newCurtainId = g.curtains && g.curtains.length > 0 
          ? Math.max(...g.curtains.map(c => c.id)) + 1 
          : 1;
        const newCurtain: Curtain = { id: newCurtainId, width: 0, height: 0 };
        return { ...g, curtains: [...(g.curtains || []), newCurtain] };
      }
      return g;
    });
    onUpdate?.({ curtainGroups: updatedGroups });
  };

  const handleRemoveCurtain = (groupId: number, curtainId: number) => {
    const updatedGroups = (initialData?.curtainGroups || []).map(g => {
      if (g.id === groupId) {
        return { ...g, curtains: g.curtains?.filter(c => c.id !== curtainId) || [] };
      }
      return g;
    });
    onUpdate?.({ curtainGroups: updatedGroups });
  };

  const handleCurtainChange = (groupId: number, curtainId: number, field: string, value: number | string) => {
    const updatedGroups = (initialData?.curtainGroups || []).map(g => {
      if (g.id === groupId) {
        return {
          ...g,
          curtains: g.curtains?.map(c => 
            c.id === curtainId ? { ...c, [field]: value } : c
          ) || []
        };
      }
      return g;
    });
    onUpdate?.({ curtainGroups: updatedGroups });
  };

  return (
    <div className="space-y-4">
      {/* Top row with product info and chevron - Only show for floor configurator */}
      {needsProductSelection && (
        <div className="flex items-start justify-between gap-4">
          {/* Product Selection/Display - Left side */}
          <div className="flex-1">
            {!initialData?.product ? (
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    className="bg-[#2d4724] hover:bg-[#1f3319]"
                    onClick={handleProductSelect}
                  >
                    {t.selectProduct.toUpperCase()}
                  </Button>
                  
                  {/* Copy from previous room dropdown */}
                  {roomsWithProducts.length > 0 && (
                    <Select onValueChange={handleCopyFromRoom}>
                      <SelectTrigger className="w-full sm:w-64">
                        <SelectValue placeholder={`${t.copyFromRoom}...`} />
                      </SelectTrigger>
                      <SelectContent>
                        {roomsWithProducts.map((room) => (
                          <SelectItem key={room.id} value={room.id.toString()}>
                            {t.roomNumber} #{room.id}: {room.roomName} ({t.levels[room.level as keyof typeof t.levels] || room.level})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  {roomsWithProducts.length > 0 
                    ? t.roomConfigurator.selectProductOrCopy
                    : t.roomConfigurator.pleaseSelectProduct
                  }
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <button 
                    onClick={onOpenProductDetail}
                    className="text-[#2d4724] hover:text-[#1f3319] underline text-lg text-left"
                  >
                    {initialData.selectedProduct ? `${initialData.selectedProduct.code} - ${initialData.selectedProduct.name}` : initialData.product}
                  </button>
                  <Button 
                    size="sm"
                    variant="outline"
                    className="text-sm px-3 py-1 h-8 border-[#2d4724] text-[#2d4724] hover:bg-[#2d4724] hover:text-white"
                    onClick={handleProductSelect}
                  >
                    {t.roomConfigurator.change}
                  </Button>
                </div>
                {/* Product details line */}
                <div className="text-xs text-gray-500">
                  {initialData.selectedProduct ? (
                    <>
                      {initialData.selectedProduct.hoofdcategorie && `${t.roomConfigurator.mainCategory}: ${initialData.selectedProduct.hoofdcategorie}`}
                      {initialData.selectedProduct.subcategorie && ` / ${t.roomConfigurator.subCategory}: ${initialData.selectedProduct.subcategorie}`}
                      {initialData.selectedProduct.legmethode && ` / ${t.serviceSection.installationMethod}: ${initialData.selectedProduct.legmethode}`}
                      {initialData.selectedProduct.legpatroon && ` / ${t.serviceSection.pattern}: ${initialData.selectedProduct.legpatroon}`}
                      {initialData.selectedProduct.typeVloerverwarming && ` / ${t.serviceSection.heatingType}: ${initialData.selectedProduct.typeVloerverwarming}`}
                      {initialData.selectedProduct.geintegreerdeOndervloer && ` / ${t.serviceSection.integratedUnderfloor}: ${initialData.selectedProduct.geintegreerdeOndervloer}`}
                      {initialData.selectedProduct.verdieping && ` / ${t.serviceSection.floor}: ${initialData.selectedProduct.verdieping}`}
                      {initialData.selectedProduct.brand && ` / ${t.serviceSection.brand}: ${initialData.selectedProduct.brand}`}
                    </>
                  ) : (
                    t.roomConfigurator.productDetailsWillShow
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      
      {/* Collapsed state summary */}
      {collapsed && (
        <div className="text-left">
          <span className="text-sm text-[#2d4724]">
            {needsProductSelection && initialData?.product && (
              <>{t.product}: {initialData.selectedProduct ? `${initialData.selectedProduct.code} - ${initialData.selectedProduct.name}` : initialData.product} - </>
            )}
            {currentConfigurator === "Gordijnen" ? (
              <>
                {t.roomName}: {initialData?.roomName || '-'} - {language === 'en' ? 'Groups' : 'Groepen'}: {initialData?.curtainGroups?.length || 0}
                {initialData?.curtainGroups && initialData.curtainGroups.length > 0 && (
                  <> ({initialData.curtainGroups.map(g => {
                    const curtainCount = g.curtains?.length || 0;
                    const totalCurtains = curtainCount > 0 ? ` - ${curtainCount} ${language === 'en' ? 'curtain(s)' : 'gordijn(en)'}` : '';
                    return `${language === 'en' ? 'Group' : 'Groep'} ${g.groupNumber}${totalCurtains}`;
                  }).join(', ')})</>
                )}
              </>
            ) : (
              <>
                {t.surface}: {initialData?.surface || '-'} - Meter: {initialData?.area || 0} - {t.roomName}: {initialData?.roomName || '-'}
              </>
            )}
          </span>
        </div>
      )}

      {/* Collapsible Content */}
      {!collapsed && (
        <div className="space-y-4">
          {/* Room Configuration Form - Show for all configurators when product is selected, or always for non-floor configurators */}
          {(!needsProductSelection || initialData?.product) ? (
            <div className="flex gap-4">
              {initialData?.underfloorHeatingType && initialData.underfloorHeatingType !== "none" ? (
                /* TWO ROW LAYOUT - When underfloor heating type is NOT "none" */
                <div className="space-y-4 flex-1">
                  {/* First Row: Verdieping, Ruimte, Type vloerverwarming, Uitvoering, Bestaande vloer, Basisvloer */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    {/* Verdieping - 1 column (2 columns for Zonwering binnen) */}
                    <div className={`space-y-2 ${currentConfigurator === "Raamdecoratie" ? "md:col-span-2" : "md:col-span-1"}`}>
                      <Label htmlFor="level">{t.level}</Label>
                      <Select 
                        value={initialData?.level || ""}
                        onValueChange={handleLevelChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t.select} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ground-floor">{t.levels.groundFloor}</SelectItem>
                          <SelectItem value="first-floor">{t.levels.firstFloor}</SelectItem>
                          <SelectItem value="second-floor">{t.levels.secondFloor}</SelectItem>
                          <SelectItem value="third-floor">{t.levels.thirdFloor}</SelectItem>
                          <SelectItem value="higher-floor">{t.levels.higherFloor}</SelectItem>
                          <SelectItem value="basement">{t.levels.basement}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Ruimte - 2 columns */}
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="room-name">{t.roomName}</Label>
                      <Select 
                        value={initialData?.roomName || ""}
                        onValueChange={handleRoomNameChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t.select} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="aanbouw">{t.roomTypes.aanbouw}</SelectItem>
                          <SelectItem value="berging">{t.roomTypes.berging}</SelectItem>
                          <SelectItem value="bijkeuken">{t.roomTypes.bijkeuken}</SelectItem>
                          <SelectItem value="gang">{t.roomTypes.gang}</SelectItem>
                          <SelectItem value="hal">{t.roomTypes.hal}</SelectItem>
                          <SelectItem value="kelder">{t.roomTypes.kelder}</SelectItem>
                          <SelectItem value="keuken">{t.roomTypes.keuken}</SelectItem>
                          <SelectItem value="overloop">{t.roomTypes.overloop}</SelectItem>
                          <SelectItem value="slaapkamer1">{t.roomTypes.slaapkamer1}</SelectItem>
                          <SelectItem value="slaapkamer2">{t.roomTypes.slaapkamer2}</SelectItem>
                          <SelectItem value="slaapkamer3">{t.roomTypes.slaapkamer3}</SelectItem>
                          <SelectItem value="slaapkamer4">{t.roomTypes.slaapkamer4}</SelectItem>
                          <SelectItem value="trap">{t.roomTypes.trap}</SelectItem>
                          <SelectItem value="trapkast">{t.roomTypes.trapkast}</SelectItem>
                          <SelectItem value="wc">{t.roomTypes.wc}</SelectItem>
                          <SelectItem value="woonkamer">{t.roomTypes.woonkamer}</SelectItem>
                          <SelectItem value="zolder">{t.roomTypes.zolder}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Type vloerverwarming / Groep - 3 columns (2 columns for Zonwering binnen) */}
                    <div className={`space-y-2 ${currentConfigurator === "Raamdecoratie" ? "md:col-span-2" : "md:col-span-3"}`}>
                      <Label htmlFor="underfloor-heating-type">
                        {currentConfigurator === "Raamdecoratie" ? (language === 'en' ? 'Group' : 'Groep') : t.roomConfigurator.underfloorHeatingType}
                      </Label>
                      <Select 
                        value={initialData?.underfloorHeatingType || "none"}
                        onValueChange={(value) => onUpdate?.({ underfloorHeatingType: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t.select} />
                        </SelectTrigger>
                        <SelectContent>
                          {currentConfigurator === "Raamdecoratie" ? (
                            <>
                              <SelectItem value="groep1">{language === 'en' ? 'Group 1' : 'Groep 1'}</SelectItem>
                              <SelectItem value="groep2">{language === 'en' ? 'Group 2' : 'Groep 2'}</SelectItem>
                              <SelectItem value="groep3">{language === 'en' ? 'Group 3' : 'Groep 3'}</SelectItem>
                              <SelectItem value="groep4">{language === 'en' ? 'Group 4' : 'Groep 4'}</SelectItem>
                              <SelectItem value="groep5">{language === 'en' ? 'Group 5' : 'Groep 5'}</SelectItem>
                              <SelectItem value="groep6">{language === 'en' ? 'Group 6' : 'Groep 6'}</SelectItem>
                            </>
                          ) : (
                            <>
                              <SelectItem value="none">{t.underfloorHeatingTypes.none}</SelectItem>
                              <SelectItem value="electric">{t.underfloorHeatingTypes.electric}</SelectItem>
                              <SelectItem value="bonded">{t.underfloorHeatingTypes.bonded}</SelectItem>
                              <SelectItem value="milled">{t.underfloorHeatingTypes.milled}</SelectItem>
                              <SelectItem value="noppenPlates">{t.underfloorHeatingTypes.noppenPlates}</SelectItem>
                            </>
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Uitvoering vloerverwarming - 2 columns */}
                    {currentConfigurator !== "Raamdecoratie" && (
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="underfloor-heating-installation">{language === 'nl' ? 'Uitvoering vloerverwarming' : 'Install underfloor heating'}</Label>
                        <Select 
                          value={initialData?.underfloorHeatingInstallation || ""}
                          onValueChange={(value) => onUpdate?.({ underfloorHeatingInstallation: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={t.select} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="nvt">{language === 'nl' ? 'NVT (bestaand)' : 'N/A (existing)'}</SelectItem>
                            <SelectItem value="klant">{language === 'nl' ? 'Klant' : 'Client'}</SelectItem>
                            <SelectItem value="lab21">LAB21</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* Bestaande vloer - 2 columns */}
                    {currentConfigurator !== "Raamdecoratie" && (
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="old-surface">{t.existingFloor}</Label>
                        <Select 
                          value={initialData?.oldSurface && initialData.oldSurface.trim() !== "" ? initialData.oldSurface : "geen"}
                          onValueChange={handleOldSurfaceChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={t.select} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="geen">{t.existingFloors.geen}</SelectItem>
                            <SelectItem value="jumpax">{t.existingFloors.jumpax}</SelectItem>
                            <SelectItem value="keramischeTegel">{t.existingFloors.keramischeTegel}</SelectItem>
                            <SelectItem value="klikMarmoleum">{t.existingFloors.klikMarmoleum}</SelectItem>
                            <SelectItem value="laminaat">{t.existingFloors.laminaat}</SelectItem>
                            <SelectItem value="leisteen">{t.existingFloors.leisteen}</SelectItem>
                            <SelectItem value="marmoleumLinoleum">{t.existingFloors.marmoleumLinoleum}</SelectItem>
                            <SelectItem value="marmoleumLinoleumOpJumpax">{t.existingFloors.marmoleumLinoleumOpJumpax}</SelectItem>
                            <SelectItem value="parketvloerVerlijmd">{t.existingFloors.parketvloerVerlijmd}</SelectItem>
                            <SelectItem value="parketvloerZwevend">{t.existingFloors.parketvloerZwevend}</SelectItem>
                            <SelectItem value="pvcKlik">{t.existingFloors.pvcKlik}</SelectItem>
                            <SelectItem value="pvcLijm">{t.existingFloors.pvcLijm}</SelectItem>
                            <SelectItem value="tapijtLos">{t.existingFloors.tapijtLos}</SelectItem>
                            <SelectItem value="tapijtMetOndertapijtLosOpOnder">{t.existingFloors.tapijtMetOndertapijtLosOpOnder}</SelectItem>
                            <SelectItem value="tapijtMetOndertapijtVerlijmdOp">{t.existingFloors.tapijtMetOndertapijtVerlijmdOp}</SelectItem>
                            <SelectItem value="tapijtVerlijmd">{t.existingFloors.tapijtVerlijmd}</SelectItem>
                            <SelectItem value="tapijtegelLos">{t.existingFloors.tapijtegelLos}</SelectItem>
                            <SelectItem value="tapijtegelVerlijmd">{t.existingFloors.tapijtegelVerlijmd}</SelectItem>
                            <SelectItem value="travertin">{t.existingFloors.travertin}</SelectItem>
                            <SelectItem value="zandsteen">{t.existingFloors.zandsteen}</SelectItem>
                            <SelectItem value="zeilVinylNovilonLos">{t.existingFloors.zeilVinylNovilonLos}</SelectItem>
                            <SelectItem value="zeilVinylNovilonVerlijmd">{t.existingFloors.zeilVinylNovilonVerlijmd}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* Basisvloer - 2 columns */}
                    {currentConfigurator !== "Raamdecoratie" && (
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="new-surface">{t.newSurface}</Label>
                        <Select 
                          value={initialData?.newSurface && initialData.newSurface.trim() !== "" ? initialData.newSurface : undefined}
                          onValueChange={handleNewSurfaceChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={t.select} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="airbase">{t.surfaces.airbase}</SelectItem>
                            <SelectItem value="anders">{t.surfaces.anders}</SelectItem>
                            <SelectItem value="anhydriet">{t.surfaces.anhydriet}</SelectItem>
                            <SelectItem value="beton">{t.surfaces.beton}</SelectItem>
                            <SelectItem value="betonGevlinderd">{t.surfaces.betonGevlinderd}</SelectItem>
                            <SelectItem value="eco2Floor">{t.surfaces.eco2Floor}</SelectItem>
                            <SelectItem value="fermacell">{t.surfaces.fermacell}</SelectItem>
                            <SelectItem value="gietvloer">{t.surfaces.gietvloer}</SelectItem>
                            <SelectItem value="grindvloer">{t.surfaces.grindvloer}</SelectItem>
                            <SelectItem value="hout">{t.surfaces.hout}</SelectItem>
                            <SelectItem value="houtenPlanken">{t.surfaces.houtenPlanken}</SelectItem>
                            <SelectItem value="houtenPlaten">{t.surfaces.houtenPlaten}</SelectItem>
                            <SelectItem value="knaufBrio">{t.surfaces.knaufBrio}</SelectItem>
                            <SelectItem value="leisteen">{t.surfaces.leisteen}</SelectItem>
                            <SelectItem value="magnesiet">{t.surfaces.magnesiet}</SelectItem>
                            <SelectItem value="marmoleumLinoleum">{t.surfaces.marmoleumLinoleum}</SelectItem>
                            <SelectItem value="mortel">{t.surfaces.mortel}</SelectItem>
                            <SelectItem value="parketvloerVerlijmd">{t.surfaces.parketvloerVerlijmd}</SelectItem>
                            <SelectItem value="parketvloerZwevend">{t.surfaces.parketvloerZwevend}</SelectItem>
                            <SelectItem value="pvc">{t.surfaces.pvc}</SelectItem>
                            <SelectItem value="tegels">{t.surfaces.tegels}</SelectItem>
                            <SelectItem value="travertin">{t.surfaces.travertin}</SelectItem>
                            <SelectItem value="troffelvloer">{t.surfaces.troffelvloer}</SelectItem>
                            <SelectItem value="varioKomp">{t.surfaces.varioKomp}</SelectItem>
                            <SelectItem value="zandcement">{t.surfaces.zandcement}</SelectItem>
                            <SelectItem value="zandsteen">{t.surfaces.zandsteen}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* Groups for Raamdecoratie - each group on its own row */}
                    {currentConfigurator === "Raamdecoratie" && (
                      <>
                        {/* End first row after Verdieping and Ruimte - fill remaining 8 columns to force new row */}
                        <div className="md:col-span-8"></div>
                        
                        {/* Groep - 1 column */}
                        <div className="space-y-2 md:col-span-1">
                          <Label htmlFor="group-type">{language === 'en' ? 'Group' : 'Groep'}</Label>
                          <Select 
                            value={initialData?.underfloorHeatingType || "groep1"}
                            onValueChange={(value) => onUpdate?.({ underfloorHeatingType: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={t.select} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="groep1">1</SelectItem>
                              <SelectItem value="groep2">2</SelectItem>
                              <SelectItem value="groep3">3</SelectItem>
                              <SelectItem value="groep4">4</SelectItem>
                              <SelectItem value="groep5">5</SelectItem>
                              <SelectItem value="groep6">6</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Breedte - 2 columns */}
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="width">Breedte raam</Label>
                          <Input 
                            id="width"
                            type="number"
                            min="0"
                            value={initialData?.width || ""}
                            onChange={handleWidthChange}
                            placeholder="mm"
                            className="focus:ring-2 focus:ring-green-400 focus:border-green-400"
                          />
                        </div>
                        
                        {/* Hoogte - 2 columns */}
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="height">Hoogte in mm</Label>
                          <Input 
                            id="height"
                            type="number"
                            min="0"
                            value={initialData?.height || ""}
                            onChange={handleHeightChange}
                            placeholder="mm"
                            className="focus:ring-2 focus:ring-green-400 focus:border-green-400"
                          />
                        </div>

                        {/* Bediening - 2 columns */}
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="operation">Bediening</Label>
                          <Select 
                            value={initialData?.underfloorHeatingInstallation || ""}
                            onValueChange={(value) => onUpdate?.({ underfloorHeatingInstallation: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={t.select} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="hand">Hand</SelectItem>
                              <SelectItem value="electrisch">Electrisch</SelectItem>
                              <SelectItem value="electrisch_accu">Electrisch accu</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Additional Window Groups - each on its own row */}
                        {windowGroups.map((group) => (
                          <Fragment key={group.id}>
                            {/* Full-width wrapper for this group */}
                            <div className="md:col-span-12 grid grid-cols-1 md:grid-cols-12 gap-4">
                              {/* Groep - 1 column */}
                              <div className="md:col-span-1">
                                <Select 
                                  value={group.groupType}
                                  onValueChange={(value) => handleUpdateWindowGroup(group.id, { groupType: value })}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder={t.select} />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="groep1">1</SelectItem>
                                    <SelectItem value="groep2">2</SelectItem>
                                    <SelectItem value="groep3">3</SelectItem>
                                    <SelectItem value="groep4">4</SelectItem>
                                    <SelectItem value="groep5">5</SelectItem>
                                    <SelectItem value="groep6">6</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              {/* Materiaal kozijn - 1 column */}
                              <div className="md:col-span-1">
                                <Select
                                  value={group.frameMaterial || ""}
                                  onValueChange={(value) => handleUpdateWindowGroup(group.id, { frameMaterial: value })}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder={t.select} />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="kunststof">Kunststof</SelectItem>
                                    <SelectItem value="hout">Hout</SelectItem>
                                    <SelectItem value="aluminium">Aluminium</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              {/* Breedte - 1 column */}
                              <div className="md:col-span-1">
                                <Input
                                  id={`group-width-${group.id}`}
                                  type="number"
                                  min="0"
                                  value={group.width || ""}
                                  onChange={(e) => {
                                    const cleanedValue = e.target.value.replace(/^0+(?=\d)/, '');
                                    const width = parseInt(cleanedValue) || 0;
                                    handleUpdateWindowGroup(group.id, { width });
                                  }}
                                  placeholder="mm"
                                  className="focus:ring-2 focus:ring-green-400 focus:border-green-400"
                                />
                              </div>

                              {/* Hoogte - 1 column */}
                              <div className="md:col-span-1">
                                <Input
                                  id={`group-height-${group.id}`}
                                  type="number"
                                  min="0"
                                  value={group.height || ""}
                                  onChange={(e) => {
                                    const cleanedValue = e.target.value.replace(/^0+(?=\d)/, '');
                                    const height = parseInt(cleanedValue) || 0;
                                    handleUpdateWindowGroup(group.id, { height });
                                  }}
                                  placeholder="mm"
                                  className="focus:ring-2 focus:ring-green-400 focus:border-green-400"
                                />
                              </div>

                              {/* Bediening - 1 column */}
                              <div className="md:col-span-1">
                                <Select
                                  value={group.operation || ""}
                                  onValueChange={(value) => handleUpdateWindowGroup(group.id, { operation: value })}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder={t.select} />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="hand">Hand</SelectItem>
                                    <SelectItem value="electrisch">Electrisch</SelectItem>
                                    <SelectItem value="electrisch_accu">Electrisch accu</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              {/* Delete button */}
                              <div className="md:col-span-1 flex items-end pb-1">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveWindowGroup(group.id)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </Fragment>
                        ))}

                        {/* Add Group Button - full width */}
                        <div className="md:col-span-12">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleAddWindowGroup}
                            className="w-auto text-xs px-3 py-1.5 h-auto border-[#2d4724] text-[#2d4724] hover:bg-[#2d4724]/5"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            VOEG GROEP TOE
                          </Button>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Second Row: Oppervlakte - only for non-Raamdecoratie */}
                  {currentConfigurator !== "Raamdecoratie" && (
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                      {/* Oppervlakte - 1 column */}
                      <div className="space-y-2 md:col-span-1">
                        <Label htmlFor="area">{t.area}</Label>
                        <Input 
                          id="area"
                          type="number"
                          min="0"
                          value={initialData?.area || ""}
                          onChange={handleAreaChange}
                          placeholder="m²"
                          className="focus:ring-2 focus:ring-green-400 focus:border-green-400"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* SINGLE ROW LAYOUT - When underfloor heating type is "none" */
                /* Verdieping, Ruimte, Type vloerverwarming, Bestaande vloer, Basisvloer, Oppervlakte */
                <div className="flex-1">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    {/* Verdieping - 1 column (2 columns for Zonwering binnen) */}
                    <div className={`space-y-2 ${currentConfigurator === "Raamdecoratie" ? "md:col-span-2" : "md:col-span-1"}`}>
                      <Label htmlFor="level">{t.level}</Label>
                      <Select 
                        value={initialData?.level || ""}
                        onValueChange={handleLevelChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t.select} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ground-floor">{t.levels.groundFloor}</SelectItem>
                          <SelectItem value="first-floor">{t.levels.firstFloor}</SelectItem>
                          <SelectItem value="second-floor">{t.levels.secondFloor}</SelectItem>
                          <SelectItem value="third-floor">{t.levels.thirdFloor}</SelectItem>
                          <SelectItem value="higher-floor">{t.levels.higherFloor}</SelectItem>
                          <SelectItem value="basement">{t.levels.basement}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Ruimte - 2 columns */}
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="room-name">{t.roomName}</Label>
                      <Select 
                        value={initialData?.roomName || ""}
                        onValueChange={handleRoomNameChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t.select} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="aanbouw">{t.roomTypes.aanbouw}</SelectItem>
                          <SelectItem value="berging">{t.roomTypes.berging}</SelectItem>
                          <SelectItem value="bijkeuken">{t.roomTypes.bijkeuken}</SelectItem>
                          <SelectItem value="gang">{t.roomTypes.gang}</SelectItem>
                          <SelectItem value="hal">{t.roomTypes.hal}</SelectItem>
                          <SelectItem value="kelder">{t.roomTypes.kelder}</SelectItem>
                          <SelectItem value="keuken">{t.roomTypes.keuken}</SelectItem>
                          <SelectItem value="overloop">{t.roomTypes.overloop}</SelectItem>
                          <SelectItem value="slaapkamer1">{t.roomTypes.slaapkamer1}</SelectItem>
                          <SelectItem value="slaapkamer2">{t.roomTypes.slaapkamer2}</SelectItem>
                          <SelectItem value="slaapkamer3">{t.roomTypes.slaapkamer3}</SelectItem>
                          <SelectItem value="slaapkamer4">{t.roomTypes.slaapkamer4}</SelectItem>
                          <SelectItem value="trap">{t.roomTypes.trap}</SelectItem>
                          <SelectItem value="trapkast">{t.roomTypes.trapkast}</SelectItem>
                          <SelectItem value="wc">{t.roomTypes.wc}</SelectItem>
                          <SelectItem value="woonkamer">{t.roomTypes.woonkamer}</SelectItem>
                          <SelectItem value="zolder">{t.roomTypes.zolder}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* For Raamdecoratie: End first row, start second row with groups */}
                    {currentConfigurator === "Raamdecoratie" ? (
                      <>
                        {/* Fill remaining 8 columns to end first row */}
                        <div className="md:col-span-8"></div>
                        
                        {/* Second row: First group starts at beginning of row */}
                        
                        {/* Groep - 1 column */}
                        <div className="space-y-2 md:col-span-1">
                          <Label htmlFor="group-type">{language === 'en' ? 'Group' : 'Groep'}</Label>
                          <Select 
                            value={initialData?.underfloorHeatingType || "groep1"}
                            onValueChange={(value) => onUpdate?.({ underfloorHeatingType: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={t.select} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="groep1">1</SelectItem>
                              <SelectItem value="groep2">2</SelectItem>
                              <SelectItem value="groep3">3</SelectItem>
                              <SelectItem value="groep4">4</SelectItem>
                              <SelectItem value="groep5">5</SelectItem>
                              <SelectItem value="groep6">6</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Materiaal kozijn - 1 column */}
                        <div className="space-y-2 md:col-span-1">
                          <Label htmlFor="frame-material">Materiaal kozijn</Label>
                          <Select
                            value={initialData?.underfloorHeatingInstallation || ""}
                            onValueChange={(value) => onUpdate?.({ underfloorHeatingInstallation: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={t.select} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="kunststof">Kunststof</SelectItem>
                              <SelectItem value="hout">Hout</SelectItem>
                              <SelectItem value="aluminium">Aluminium</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Breedte - 1 column */}
                        <div className="space-y-2 md:col-span-1">
                          <Label htmlFor="width">Breedte raam</Label>
                          <Input
                            id="width"
                            type="number"
                            min="0"
                            value={initialData?.width || ""}
                            onChange={handleWidthChange}
                            placeholder="mm"
                            className="focus:ring-2 focus:ring-green-400 focus:border-green-400"
                          />
                        </div>

                        {/* Hoogte - 1 column */}
                        <div className="space-y-2 md:col-span-1">
                          <Label htmlFor="height">Hoogte raam</Label>
                          <Input
                            id="height"
                            type="number"
                            min="0"
                            value={initialData?.height || ""}
                            onChange={handleHeightChange}
                            placeholder="mm"
                            className="focus:ring-2 focus:ring-green-400 focus:border-green-400"
                          />
                        </div>

                        {/* Bediening - 1 column */}
                        <div className="space-y-2 md:col-span-1">
                          <Label htmlFor="operation">Bediening</Label>
                          <Select 
                            value={initialData?.underfloorHeatingInstallation || ""}
                            onValueChange={(value) => onUpdate?.({ underfloorHeatingInstallation: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={t.select} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="hand">Hand</SelectItem>
                              <SelectItem value="electrisch">Electrisch</SelectItem>
                              <SelectItem value="electrisch_accu">Electrisch accu</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Additional Window Groups - each on its own row */}
                        {windowGroups.map((group) => (
                          <Fragment key={group.id}>
                            {/* Full-width wrapper for this group */}
                            <div className="md:col-span-12 grid grid-cols-1 md:grid-cols-12 gap-4">
                              {/* Groep - 1 column */}
                              <div className="md:col-span-1">
                                <Select 
                                  value={group.groupType}
                                  onValueChange={(value) => handleUpdateWindowGroup(group.id, { groupType: value })}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder={t.select} />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="groep1">1</SelectItem>
                                    <SelectItem value="groep2">2</SelectItem>
                                    <SelectItem value="groep3">3</SelectItem>
                                    <SelectItem value="groep4">4</SelectItem>
                                    <SelectItem value="groep5">5</SelectItem>
                                    <SelectItem value="groep6">6</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              {/* Materiaal kozijn - 1 column */}
                              <div className="md:col-span-1">
                                <Select
                                  value={group.frameMaterial || ""}
                                  onValueChange={(value) => handleUpdateWindowGroup(group.id, { frameMaterial: value })}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder={t.select} />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="kunststof">Kunststof</SelectItem>
                                    <SelectItem value="hout">Hout</SelectItem>
                                    <SelectItem value="aluminium">Aluminium</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              {/* Breedte - 1 column */}
                              <div className="md:col-span-1">
                                <Input
                                  id={`group-width-${group.id}`}
                                  type="number"
                                  min="0"
                                  value={group.width || ""}
                                  onChange={(e) => {
                                    const cleanedValue = e.target.value.replace(/^0+(?=\d)/, '');
                                    const width = parseInt(cleanedValue) || 0;
                                    handleUpdateWindowGroup(group.id, { width });
                                  }}
                                  placeholder="mm"
                                  className="focus:ring-2 focus:ring-green-400 focus:border-green-400"
                                />
                              </div>

                              {/* Hoogte - 1 column */}
                              <div className="md:col-span-1">
                                <Input
                                  id={`group-height-${group.id}`}
                                  type="number"
                                  min="0"
                                  value={group.height || ""}
                                  onChange={(e) => {
                                    const cleanedValue = e.target.value.replace(/^0+(?=\d)/, '');
                                    const height = parseInt(cleanedValue) || 0;
                                    handleUpdateWindowGroup(group.id, { height });
                                  }}
                                  placeholder="mm"
                                  className="focus:ring-2 focus:ring-green-400 focus:border-green-400"
                                />
                              </div>

                              {/* Bediening - 1 column */}
                              <div className="md:col-span-1">
                                <Select
                                  value={group.operation || ""}
                                  onValueChange={(value) => handleUpdateWindowGroup(group.id, { operation: value })}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder={t.select} />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="hand">Hand</SelectItem>
                                    <SelectItem value="electrisch">Electrisch</SelectItem>
                                    <SelectItem value="electrisch_accu">Electrisch accu</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              {/* Delete button */}
                              <div className="md:col-span-1 flex items-end pb-1">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveWindowGroup(group.id)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </Fragment>
                        ))}

                        {/* Add Group Button - full width */}
                        <div className="md:col-span-12">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleAddWindowGroup}
                            className="w-auto text-xs px-3 py-1.5 h-auto border-[#2d4724] text-[#2d4724] hover:bg-[#2d4724]/5"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            VOEG GROEP TOE
                          </Button>
                        </div>
                      </>
                    ) : (
                      /* Type vloerverwarming - only for non-Raamdecoratie */
                      <div className="space-y-2 md:col-span-3">
                        <Label htmlFor="underfloor-heating-type">{t.roomConfigurator.underfloorHeatingType}</Label>
                        <Select 
                          value={initialData?.underfloorHeatingType || "none"}
                          onValueChange={(value) => onUpdate?.({ underfloorHeatingType: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={t.select} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">{t.underfloorHeatingTypes.none}</SelectItem>
                            <SelectItem value="electric">{t.underfloorHeatingTypes.electric}</SelectItem>
                            <SelectItem value="bonded">{t.underfloorHeatingTypes.bonded}</SelectItem>
                            <SelectItem value="milled">{t.underfloorHeatingTypes.milled}</SelectItem>
                            <SelectItem value="noppenPlates">{t.underfloorHeatingTypes.noppenPlates}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* Bestaande vloer - 2 columns */}
                    {currentConfigurator !== "Raamdecoratie" && (
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="old-surface">{t.existingFloor}</Label>
                        <Select 
                          value={initialData?.oldSurface && initialData.oldSurface.trim() !== "" ? initialData.oldSurface : "geen"}
                          onValueChange={handleOldSurfaceChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={t.select} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="geen">{t.existingFloors.geen}</SelectItem>
                            <SelectItem value="jumpax">{t.existingFloors.jumpax}</SelectItem>
                            <SelectItem value="keramischeTegel">{t.existingFloors.keramischeTegel}</SelectItem>
                            <SelectItem value="klikMarmoleum">{t.existingFloors.klikMarmoleum}</SelectItem>
                            <SelectItem value="laminaat">{t.existingFloors.laminaat}</SelectItem>
                            <SelectItem value="leisteen">{t.existingFloors.leisteen}</SelectItem>
                            <SelectItem value="marmoleumLinoleum">{t.existingFloors.marmoleumLinoleum}</SelectItem>
                            <SelectItem value="marmoleumLinoleumOpJumpax">{t.existingFloors.marmoleumLinoleumOpJumpax}</SelectItem>
                            <SelectItem value="parketvloerVerlijmd">{t.existingFloors.parketvloerVerlijmd}</SelectItem>
                            <SelectItem value="parketvloerZwevend">{t.existingFloors.parketvloerZwevend}</SelectItem>
                            <SelectItem value="pvcKlik">{t.existingFloors.pvcKlik}</SelectItem>
                            <SelectItem value="pvcLijm">{t.existingFloors.pvcLijm}</SelectItem>
                            <SelectItem value="tapijtLos">{t.existingFloors.tapijtLos}</SelectItem>
                            <SelectItem value="tapijtMetOndertapijtLosOpOnder">{t.existingFloors.tapijtMetOndertapijtLosOpOnder}</SelectItem>
                            <SelectItem value="tapijtMetOndertapijtVerlijmdOp">{t.existingFloors.tapijtMetOndertapijtVerlijmdOp}</SelectItem>
                            <SelectItem value="tapijtVerlijmd">{t.existingFloors.tapijtVerlijmd}</SelectItem>
                            <SelectItem value="tapijtegelLos">{t.existingFloors.tapijtegelLos}</SelectItem>
                            <SelectItem value="tapijtegelVerlijmd">{t.existingFloors.tapijtegelVerlijmd}</SelectItem>
                            <SelectItem value="travertin">{t.existingFloors.travertin}</SelectItem>
                            <SelectItem value="zandsteen">{t.existingFloors.zandsteen}</SelectItem>
                            <SelectItem value="zeilVinylNovilonLos">{t.existingFloors.zeilVinylNovilonLos}</SelectItem>
                            <SelectItem value="zeilVinylNovilonVerlijmd">{t.existingFloors.zeilVinylNovilonVerlijmd}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* Basisvloer - 3 columns */}
                    {currentConfigurator !== "Raamdecoratie" && (
                      <div className="space-y-2 md:col-span-3">
                        <Label htmlFor="new-surface">Basisvloer/Jumpax</Label>
                        <Select 
                          value={initialData?.newSurface && initialData.newSurface.trim() !== "" ? initialData.newSurface : undefined}
                          onValueChange={handleNewSurfaceChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={t.select} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="airbase">{t.surfaces.airbase}</SelectItem>
                            <SelectItem value="anders">{t.surfaces.anders}</SelectItem>
                            <SelectItem value="anhydriet">{t.surfaces.anhydriet}</SelectItem>
                            <SelectItem value="beton">{t.surfaces.beton}</SelectItem>
                            <SelectItem value="betonGevlinderd">{t.surfaces.betonGevlinderd}</SelectItem>
                            <SelectItem value="eco2Floor">{t.surfaces.eco2Floor}</SelectItem>
                            <SelectItem value="fermacell">{t.surfaces.fermacell}</SelectItem>
                            <SelectItem value="gietvloer">{t.surfaces.gietvloer}</SelectItem>
                            <SelectItem value="grindvloer">{t.surfaces.grindvloer}</SelectItem>
                            <SelectItem value="hout">{t.surfaces.hout}</SelectItem>
                            <SelectItem value="houtenPlanken">{t.surfaces.houtenPlanken}</SelectItem>
                            <SelectItem value="houtenPlaten">{t.surfaces.houtenPlaten}</SelectItem>
                            <SelectItem value="knaufBrio">{t.surfaces.knaufBrio}</SelectItem>
                            <SelectItem value="leisteen">{t.surfaces.leisteen}</SelectItem>
                            <SelectItem value="magnesiet">{t.surfaces.magnesiet}</SelectItem>
                            <SelectItem value="marmoleumLinoleum">{t.surfaces.marmoleumLinoleum}</SelectItem>
                            <SelectItem value="mortel">{t.surfaces.mortel}</SelectItem>
                            <SelectItem value="parketvloerVerlijmd">{t.surfaces.parketvloerVerlijmd}</SelectItem>
                            <SelectItem value="parketvloerZwevend">{t.surfaces.parketvloerZwevend}</SelectItem>
                            <SelectItem value="pvc">{t.surfaces.pvc}</SelectItem>
                            <SelectItem value="tegels">{t.surfaces.tegels}</SelectItem>
                            <SelectItem value="travertin">{t.surfaces.travertin}</SelectItem>
                            <SelectItem value="troffelvloer">{t.surfaces.troffelvloer}</SelectItem>
                            <SelectItem value="varioKomp">{t.surfaces.varioKomp}</SelectItem>
                            <SelectItem value="zandcement">{t.surfaces.zandcement}</SelectItem>
                            <SelectItem value="zandsteen">{t.surfaces.zandsteen}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* Oppervlakte - 1 column (only for non-Raamdecoratie) */}
                    {currentConfigurator !== "Raamdecoratie" && (
                      <div className="space-y-2 md:col-span-1">
                        <Label htmlFor="area">{t.area}</Label>
                        <Input 
                          id="area"
                          type="number"
                          min="0"
                          value={initialData?.area || ""}
                          onChange={handleAreaChange}
                          placeholder="m²"
                          className="focus:ring-2 focus:ring-green-400 focus:border-green-400"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            
              {/* Search Button - Outside grid, aligned to the right */}
              {currentConfigurator !== "Gordijnen" && currentConfigurator !== "Raamdecoratie" && (
                <div className="flex items-end pb-1">
                  <Button
                    onClick={handleServiceSearch}
                    className="bg-[#2d4724] hover:bg-[#1f3319] text-white h-9 w-10 p-0"
                  >
                    <Search className="h-5 w-5" />
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <div className="text-gray-500">
                {language === 'en' ? 'Room configuration will be available after selecting a product' : 'Ruimte configuratie wordt beschikbaar na het selecteren van een product'}
              </div>
            </div>
          )}

          {/* Curtain Groups Section - Only for Gordijnen configurator */}
          {currentConfigurator === "Gordijnen" && (!needsProductSelection || initialData?.product) && !collapsed && (
            <div className="space-y-4 mt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-[#2d4724]">
                  {language === 'en' ? 'Groups' : 'Groepen'}
                </h3>
                <Button
                  onClick={handleAddCurtainGroup}
                  className="bg-[#2d4724] hover:bg-[#1f3319] text-white"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {language === 'en' ? 'Add Group' : 'Voeg groep toe'}
                </Button>
              </div>

              {/* Initialize with one group if none exist */}
              {(!initialData?.curtainGroups || initialData.curtainGroups.length === 0) && (
                <div className="text-sm text-gray-500 italic">
                  {language === 'en' ? 'Click "Add Group" to add your first curtain group' : 'Klik op "Voeg groep toe" om je eerste groep toe te voegen'}
                </div>
              )}

              {/* Display curtain groups */}
              {initialData?.curtainGroups && initialData.curtainGroups.length > 0 && (
                <div className="space-y-3">
                  {initialData.curtainGroups.map((group, index) => (
                    <div key={group.id} className="border border-gray-300 rounded-lg p-4 bg-white">
                      <div className="flex items-center justify-between mb-3 gap-3">
                        <div className="flex items-center gap-3 flex-1">
                          <span className="font-medium text-[#2d4724] whitespace-nowrap">
                            {language === 'en' ? 'Group' : 'Groep'} {index + 1}
                          </span>
                          <Input
                            type="text"
                            placeholder={language === 'en' ? 'Description (e.g. living room left)' : 'Beschrijving (bijv. woonkamer links)'}
                            value={group.description || ''}
                            onChange={(e) => handleCurtainGroupChange(group.id, 'description', e.target.value)}
                            className="h-8 flex-1"
                          />
                        </div>
                        {initialData.curtainGroups!.length > 1 && (
                          <Button
                            onClick={() => handleRemoveCurtainGroup(group.id)}
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      
                      {/* Curtains within this group */}
                      <div className="space-y-3 pl-4 border-l-2 border-[#2d4724]/30">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">
                            {language === 'en' ? 'Curtains' : 'Gordijnen'}
                          </span>
                          <Button
                            onClick={() => handleAddCurtain(group.id)}
                            variant="outline"
                            size="sm"
                            className="text-[#2d4724] border-[#2d4724] hover:bg-[#2d4724] hover:text-white"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            {language === 'en' ? 'Add Curtain' : 'Voeg gordijn toe'}
                          </Button>
                        </div>

                        {/* Show message if no curtains */}
                        {(!group.curtains || group.curtains.length === 0) && (
                          <div className="text-sm text-gray-500 italic py-2">
                            {language === 'en' ? 'Click "Add Curtain" to add a curtain to this group' : 'Klik op "Voeg gordijn toe" om een gordijn toe te voegen aan deze groep'}
                          </div>
                        )}

                        {/* Display curtains */}
                        {group.curtains && group.curtains.length > 0 && (
                          <div className="space-y-2">
                            {group.curtains.map((curtain, curtainIndex) => (
                              <div key={curtain.id} className="flex items-start gap-3 bg-gray-50 p-3 rounded">
                                <span className="text-sm font-medium text-gray-600 min-w-[80px] pt-6">
                                  {language === 'en' ? 'Curtain' : 'Gordijn'} {curtainIndex + 1}
                                </span>
                                <div className="flex-1 grid grid-cols-3 gap-3">
                                  <div className="space-y-1">
                                    <Label htmlFor={`curtain-${curtain.id}-width`} className="text-xs">
                                      {language === 'en' ? 'Width' : 'Breedte'} (cm)
                                    </Label>
                                    <Input
                                      id={`curtain-${curtain.id}-width`}
                                      type="number"
                                      placeholder="cm"
                                      value={curtain.width === 0 ? "" : curtain.width}
                                      onChange={(e) => {
                                        const value = parseInt(e.target.value.replace(/^0+(?=\d)/, '')) || 0;
                                        handleCurtainChange(group.id, curtain.id, 'width', value);
                                      }}
                                      className="h-8"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <Label htmlFor={`curtain-${curtain.id}-height`} className="text-xs">
                                      {language === 'en' ? 'Height' : 'Hoogte'} (cm)
                                    </Label>
                                    <Input
                                      id={`curtain-${curtain.id}-height`}
                                      type="number"
                                      placeholder="cm"
                                      value={curtain.height === 0 ? "" : curtain.height}
                                      onChange={(e) => {
                                        const value = parseInt(e.target.value.replace(/^0+(?=\d)/, '')) || 0;
                                        handleCurtainChange(group.id, curtain.id, 'height', value);
                                      }}
                                      className="h-8"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <Label htmlFor={`curtain-${curtain.id}-operation`} className="text-xs">
                                      {language === 'en' ? 'Operation' : 'Bediening'}
                                    </Label>
                                    <Select
                                      value={curtain.operation || ""}
                                      onValueChange={(value) => handleCurtainChange(group.id, curtain.id, 'operation', value)}
                                    >
                                      <SelectTrigger className="h-8" size="sm">
                                        <SelectValue placeholder={language === 'en' ? 'Select' : 'Selecteer'} />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="links">{language === 'en' ? 'Left' : 'Links'}</SelectItem>
                                        <SelectItem value="rechts">{language === 'en' ? 'Right' : 'Rechts'}</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                                {group.curtains!.length > 1 && (
                                  <Button
                                    onClick={() => handleRemoveCurtain(group.id, curtain.id)}
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0 mt-6"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Configuration Change Alert - TIJDELIJK UITGESCHAKELD */}
      <AlertDialog open={false} onOpenChange={setShowConfigChangeAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {language === 'en' ? 'Configuration Changed' : 'Configuratie Gewijzigd'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {language === 'en' 
                ? 'After changing the room configuration, please search again to update the available services.'
                : 'Na het wijzigen van de ruimte configuratie dient u opnieuw te zoeken om de beschikbare services bij te werken.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowConfigChangeAlert(false)}>
              {language === 'en' ? 'Understood' : 'Begrepen'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}