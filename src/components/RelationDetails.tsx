import { ChevronDown, X } from "lucide-react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { useTranslation } from "../utils/translations";
import { useState } from "react";

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
  collapsed?: boolean;
}

interface RelationDetailsProps {
  initialData?: RelationData;
  onUpdate?: (updates: Partial<RelationData>) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  language: string;
  configuratorType?: string;
}

export function RelationDetails({
  initialData,
  onUpdate,
  collapsed = false,
  onToggleCollapse,
  language,
  configuratorType
}: RelationDetailsProps) {
  const t = useTranslation(language);
  const [baseFloorOpen, setBaseFloorOpen] = useState(false);

  const handleInputChange = (field: keyof RelationData, value: string) => {
    onUpdate?.({ [field]: value });
  };

  const baseFloorOptions = [
    { value: "anhydriet", label: "Anhydriet" },
    { value: "beton-gevlinderd", label: "Beton (Gevlinderd)" },
    { value: "fermacell", label: "Fermacell" },
    { value: "geen", label: "Geen" },
    { value: "gietvloer", label: "Gietvloer" },
    { value: "grindvloer", label: "Grindvloer" },
    { value: "houten-planken", label: "Houten planken" },
    { value: "houten-platen", label: "Houten platen" },
    { value: "knauf-brio", label: "Knauf Brio" },
    { value: "laminaat", label: "Laminaat" },
    { value: "leisteen", label: "Leisteen" },
    { value: "magnesiet", label: "Magnesiet" },
    { value: "marmoleum-linoleum", label: "Marmoleum/Linoleum" },
    { value: "onbekend", label: "Onbekend" },
    { value: "parket", label: "Parket" },
    { value: "pvc-klik", label: "PVC (Klik)" },
    { value: "pvc-lijm", label: "PVC (Lijm)" },
    { value: "tapiit", label: "Tapiit" },
    { value: "tegel", label: "Tegel" },
    { value: "travertin", label: "Travertin" },
    { value: "troffelvloer", label: "Troffelvloer" },
    { value: "vloerkleed", label: "Vloerkleed" },
    { value: "zandcement", label: "Zandcement" },
    { value: "zandsteen", label: "Zandsteen" },
    { value: "zeil", label: "Zeil" }
  ];

  const handleBaseFloorToggle = (value: string) => {
    const currentValues = initialData?.baseFloor || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    onUpdate?.({ baseFloor: newValues });
  };

  const handleRemoveBaseFloor = (value: string) => {
    const currentValues = initialData?.baseFloor || [];
    const newValues = currentValues.filter(v => v !== value);
    onUpdate?.({ baseFloor: newValues });
  };

  const getSelectedBaseFloorLabels = () => {
    const selected = initialData?.baseFloor || [];
    return selected.map(value => {
      const option = baseFloorOptions.find(o => o.value === value);
      return { value, label: option?.label || value };
    });
  };

  return (
    <div className="space-y-4">
      {/* Top row with customer name / summary */}
      <div className="flex items-center gap-4">
        {/* Customer name field when expanded, summary when collapsed */}
        <div className="flex-1">
          {collapsed ? (
            <div className="text-sm text-[#2d4724]">
              {initialData?.customerName && `${t.relationDetails.customerName}: ${initialData.customerName}`}
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="customer-name">{t.relationDetails.customerName}</Label>
              <Input 
                id="customer-name" 
                type="text" 
                value={initialData?.customerName || ""}
                onChange={(e) => handleInputChange('customerName', e.target.value)}
                placeholder={t.relationDetails.enterCustomerName}
              />
            </div>
          )}
        </div>
      </div>

      {/* Additional fields - Only show when expanded */}
      {!collapsed && (
        <div className="space-y-4">
          {/* Row 2: Uitvoering | Wie gaat vloer verwijderen? */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Uitvoering */}
            <div className="space-y-2">
              <Label htmlFor="execution">{t.productSelection.execution}</Label>
              <Select 
                value={initialData?.execution || ""}
                onValueChange={(value) => handleInputChange('execution', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t.select} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LAB21">{t.relationDetails.removalByOptions.lab21}</SelectItem>
                  <SelectItem value="Klant">{t.relationDetails.removalByOptions.customer}</SelectItem>
                  <SelectItem value="Combi">{t.relationDetails.removalByOptions.combi}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Wie gaat vloer verwijderen? */}
            <div className="space-y-2">
              <Label htmlFor="floor-removal-by">{t.relationDetails.floorRemovalBy}</Label>
              <Select 
                value={initialData?.floorRemovalBy || ""}
                onValueChange={(value) => handleInputChange('floorRemovalBy', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t.select} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lab21">{t.relationDetails.removalByOptions.lab21}</SelectItem>
                  <SelectItem value="customer">{t.relationDetails.removalByOptions.customer}</SelectItem>
                  <SelectItem value="combi">{t.relationDetails.removalByOptions.combi}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 3: Aantal verdiepingen | Soort bebouwing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Aantal verdiepingen */}
            <div className="space-y-2">
              <Label htmlFor="number-of-floors">{t.relationDetails.numberOfFloors}</Label>
              <Input 
                id="number-of-floors" 
                type="number" 
                min="0"
                value={initialData?.numberOfFloors || ""}
                onChange={(e) => handleInputChange('numberOfFloors', e.target.value)}
                placeholder="0"
              />
            </div>

            {/* Soort bebouwing */}
            <div className="space-y-2">
              <Label htmlFor="building-type">{t.relationDetails.buildingType}</Label>
              <Select 
                value={initialData?.buildingType || ""}
                onValueChange={(value) => handleInputChange('buildingType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t.select} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="twoUnderOneCap">{t.relationDetails.buildingTypeOptions.twoUnderOneCap}</SelectItem>
                  <SelectItem value="apartment">{t.relationDetails.buildingTypeOptions.apartment}</SelectItem>
                  <SelectItem value="bungalow">{t.relationDetails.buildingTypeOptions.bungalow}</SelectItem>
                  <SelectItem value="cornerHouse">{t.relationDetails.buildingTypeOptions.cornerHouse}</SelectItem>
                  <SelectItem value="loft">{t.relationDetails.buildingTypeOptions.loft}</SelectItem>
                  <SelectItem value="parkingGarage">{t.relationDetails.buildingTypeOptions.parkingGarage}</SelectItem>
                  <SelectItem value="porticoHouse">{t.relationDetails.buildingTypeOptions.porticoHouse}</SelectItem>
                  <SelectItem value="recreationalHome">{t.relationDetails.buildingTypeOptions.recreationalHome}</SelectItem>
                  <SelectItem value="terracedHouse">{t.relationDetails.buildingTypeOptions.terracedHouse}</SelectItem>
                  <SelectItem value="middleHouse">{t.relationDetails.buildingTypeOptions.middleHouse}</SelectItem>
                  <SelectItem value="detachedHouse">{t.relationDetails.buildingTypeOptions.detachedHouse}</SelectItem>
                  <SelectItem value="farmHouse">{t.relationDetails.buildingTypeOptions.farmHouse}</SelectItem>
                  <SelectItem value="residence">{t.relationDetails.buildingTypeOptions.residence}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 4: Appartement met VVE | Soort verwarming */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Appartement met VVE - verborgen bij Zonwering binnen */}
            {configuratorType !== "Raamdecoratie" && (
            <div className="space-y-2">
              <Label htmlFor="apartment-with-vve">{t.relationDetails.apartmentWithVVE}</Label>
              <Select
                value={initialData?.apartmentWithVVE || ""}
                onValueChange={(value) => handleInputChange('apartmentWithVVE', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t.select} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="noApartment">{t.relationDetails.apartmentVVEOptions.noApartment}</SelectItem>
                  <SelectItem value="apartmentNoVVE">{t.relationDetails.apartmentVVEOptions.apartmentNoVVE}</SelectItem>
                  <SelectItem value="apartmentWithVVE">{t.relationDetails.apartmentVVEOptions.apartmentWithVVE}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            )}

            {/* Soort verwarming - verborgen bij Zonwering binnen */}
            {configuratorType !== "Raamdecoratie" && (
            <div className="space-y-2">
              <Label htmlFor="heating-type">{t.relationDetails.heatingType}</Label>
              <Select
                value={initialData?.heatingType || ""}
                onValueChange={(value) => handleInputChange('heatingType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t.select} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="other">{t.relationDetails.heatingTypeOptions.other}</SelectItem>
                  <SelectItem value="centralHeating">{t.relationDetails.heatingTypeOptions.centralHeating}</SelectItem>
                  <SelectItem value="districtHeating">{t.relationDetails.heatingTypeOptions.districtHeating}</SelectItem>
                  <SelectItem value="heatPump">{t.relationDetails.heatingTypeOptions.heatPump}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}