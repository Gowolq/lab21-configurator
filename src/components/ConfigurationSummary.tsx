import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useTranslation } from "../utils/translations";

interface Product {
  id: string;
  name: string;
  code: string;
  legpatroon?: string;
  [key: string]: any;
}

interface Room {
  id: number;
  level: string;
  roomName: string;
  surface: string;
  oldSurface: string;
  newSurface: string;
  area: number;
  product?: string;
  selectedProduct?: Product;
}

interface RelationData {
  customerName: string;
  execution: string;
  heatingPreference: string;
  floorRemovalBy: string;
  numberOfFloors: string;
  buildingType: string;
  apartmentWithVVE: string;
  heatingType: string; // Soort verwarming
  baseFloor: string[];
  moisture: string;
}

interface ConfigurationSummaryProps {
  rooms: Room[];
  relationData?: RelationData;
  currentConfigurator?: string;
  language: string;
}

export function ConfigurationSummary({
  rooms,
  relationData,
  currentConfigurator = "Vloer",
  language,
}: ConfigurationSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const t = useTranslation(language);

  // Get the first room with a product for display
  const firstRoomWithProduct = rooms.find(room => room.selectedProduct);

  // Format apartment type
  const formatBuildingType = (type: string) => {
    if (!type) return "-";
    if (type === "apartment") {
      return language === "nl" ? "Appartement" : "Apartment";
    }
    if (type === "house") {
      return language === "nl" ? "Huis" : "House";
    }
    return type;
  };

  // Format base floor
  const formatBaseFloor = (newSurface: string) => {
    if (!newSurface) return "-";
    // Get the translation from the surface key
    return t.surfaces[newSurface as keyof typeof t.surfaces] || newSurface;
  };

  // Format old floor (ondergrond)
  const formatOldFloor = (oldSurface: string) => {
    if (!oldSurface) return "-";
    return t.existingFloors[oldSurface as keyof typeof t.existingFloors] || oldSurface;
  };

  // Format floor level (verdieping)
  const formatFloorLevel = (level: string) => {
    if (!level) return "-";
    return t.levels[level as keyof typeof t.levels] || level;
  };

  return (
    <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
      {/* Header - Collapsible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full bg-[#2d4724] text-white px-4 py-3 flex items-center justify-between hover:bg-[#1f3319] transition-colors"
      >
        <h2 className="text-base font-medium">
          {language === "nl" ? "Configuratie Samenvatting" : "Configuration Summary"}
        </h2>
        <ChevronDown
          className={`h-5 w-5 transition-transform duration-200 ${
            isExpanded ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Content - Collapsible */}
      {isExpanded && (
        <div className="p-4 space-y-3 text-sm">
          {/* Klant-/Ordergegevens */}
          <div>
            <span className="font-semibold text-[#2d4724]">
              {language === "nl" ? "Klant-/Ordergegevens:" : "Customer/Order Details:"}
            </span>{" "}
            <span>
              {formatBuildingType(relationData?.buildingType || "")}
            </span>
          </div>

          {/* Product */}
          {firstRoomWithProduct?.selectedProduct && (
            <div>
              <span className="font-semibold text-[#2d4724]">
                {language === "nl" ? "Product:" : "Product:"}
              </span>{" "}
              <span>
                {firstRoomWithProduct.selectedProduct.legpatroon || "-"}
              </span>
            </div>
          )}

          {/* Ruimte */}
          {firstRoomWithProduct && (
            <div>
              <span className="font-semibold text-[#2d4724]">
                {language === "nl" ? "Ruimte:" : "Room:"}
              </span>{" "}
              <span>
                {language === "nl" ? "Ondergrond" : "Subfloor"}: {formatOldFloor(firstRoomWithProduct.oldSurface)} /{" "}
                {language === "nl" ? "Verdieping" : "Floor"}: {formatFloorLevel(firstRoomWithProduct.level)} /{" "}
                {language === "nl" ? "Begane grond" : "Ground floor"}
              </span>
            </div>
          )}

          {/* Configurator */}
          <div>
            <span className="font-semibold text-[#2d4724]">
              {language === "nl" ? "Configurator:" : "Configurator:"}
            </span>{" "}
            <span>
              {language === "nl" ? "Naam" : "Name"}: {currentConfigurator} /{" "}
              {language === "nl" ? "Van" : "From"}: 0 /{" "}
              {language === "nl" ? "Tot" : "To"}: {rooms.length} /{" "}
              {language === "nl" ? "Berekening" : "Calculation"}: {language === "nl" ? "Prijs/meter" : "Price/meter"} /{" "}
              {language === "nl" ? "Aantal (minimum)" : "Quantity (minimum)"}: 0
            </span>
          </div>
        </div>
      )}
    </div>
  );
}