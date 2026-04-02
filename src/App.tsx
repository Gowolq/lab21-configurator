// Floor Configuration App - v15.2
import { useState, useEffect, useMemo } from "react";
import { ProductSelection } from "./components/ProductSelection";
import { ProductArticleSelection } from "./components/ProductArticleSelection";
import { ProductDetailPage } from "./components/ProductDetailPage";
import { ServiceArticleDetailPage } from "./components/ServiceArticleDetailPage";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "./components/ui/dialog";
import { ConfiguratorHeader } from "./components/ConfiguratorHeader";
import { RelationDetails } from "./components/RelationDetails";
import { RoomConfigurator } from "./components/RoomConfigurator";
import { ServiceTabs } from "./components/ServiceTabs";
import { TotalsSummary } from "./components/TotalsSummary";
import { OrderOverview } from "./components/OrderOverview";
import { Button } from "./components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./components/ui/alert-dialog";
import { ChevronDown } from "lucide-react";
import {
  useTranslation,
  translations,
} from "./utils/translations";
import {
  LegserviceArticle,
  updateLegserviceArticle,
  getMandatoryArticlesByServiceType,
  updateAllArticlesMoisture,
  updateAllArticlesVVE,
  legserviceArticles,
} from "./utils/legserviceArticles";

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
  pakgrootte?: number;
  snijverlies?: number;
  eenheid?: string; // "M2", "M1", of "Stuk"
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
  collapsed?: boolean;
}

interface Curtain {
  id: number;
  width: number; // in cm
  height: number; // in cm
}

interface CurtainGroup {
  id: number;
  groupNumber: string; // 1-20
  curtains: Curtain[]; // Multiple curtains within a group
}

interface Room {
  id: number;
  level: string;
  roomName: string;
  surface: string;
  oldSurface?: string; // Bestaande vloer
  newSurface?: string; // Basisvloer
  area: number;
  product?: string;
  selectedProduct?: Product;
  collapsed?: boolean;
  width?: number; // For non-curtain configurators
  height?: number; // For non-curtain configurators
  curtainGroups?: CurtainGroup[]; // For curtain configurator - multiple groups per room
}

interface ServiceState {
  roomId: number;
  serviceType: string;
  serviceTitle: string;
  area: number;
  isActive: boolean;
  isMandatory: boolean;
  isSelected?: boolean; // For optional services - whether they are selected/checked
  selectedFloors?: string[]; // For voorbereiden services - which floors are selected
  isExtraConfiguratorService?: boolean; // Track if this service is from the Extra Configurator section
  length?: number; // For L/B berekening articles - length in meters
  width?: number; // For L/B berekening articles - width in meters
}

// ServiceArticle interface is nu vervangen door LegserviceArticle import

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<
    | "product-selection"
    | "configurator"
    | "product-detail"
    | "service-detail"
    | "order-overview"
  >("product-selection");
  const [selectedExecution, setSelectedExecution] =
    useState<string>("");
  const [selectedConfigurators, setSelectedConfigurators] =
    useState<string[]>([]);
  const [completedConfigurators, setCompletedConfigurators] =
    useState<string[]>([]);
  const [
    currentConfiguratorIndex,
    setCurrentConfiguratorIndex,
  ] = useState<number>(0);
  const [selectedProductCategory, setSelectedProductCategory] =
    useState<string>("");
  const [selectedProduct, setSelectedProduct] =
    useState<string>("");
  const [showProductModal, setShowProductModal] =
    useState(false);
  const [
    selectedProductForDetail,
    setSelectedProductForDetail,
  ] = useState<Product | null>(null);
  const [
    selectedServiceArticleForDetail,
    setSelectedServiceArticleForDetail,
  ] = useState<LegserviceArticle | null>(null);
  const [currentRoomForProduct, setCurrentRoomForProduct] =
    useState<number | null>(null);
  const [language, setLanguage] = useState<string>("nl");
  const t = useTranslation(language);

  // Function to translate configurator names
  const translateConfiguratorName = (
    configurator: string,
    lang: string,
  ): string => {
    const translations: {
      [key: string]: { nl: string; en: string };
    } = {
      Vloer: { nl: "Vloeren", en: "Floors" },
      Trap: { nl: "Traprenovaties", en: "Stair Renovations" },
      Raamdecoratie: { nl: "Zonwering (binnen)", en: "Window Blinds (interior)" },
      Gordijnen: { nl: "Gordijnen", en: "Curtains" },
      Droogbouw: { nl: "Droogbouw", en: "Dry Build" },
      Verwijderen: { nl: "Verwijderen", en: "Removal" },
      Vloerverwarming: {
        nl: "Vloerverwarming",
        en: "Underfloor Heating",
      },
      Blackouts: { nl: "Blackouts", en: "Blackouts" },
      Dimouts: { nl: "Dimouts", en: "Dimouts" },
      Inbetweens: { nl: "Inbetweens", en: "Inbetweens" },
      Overgordijnen: { nl: "Overgordijnen", en: "Over Curtains" },
      Duettes: { nl: "Duettes", en: "Duettes" },
      "Jaloezieën": { nl: "Jaloezieën", en: "Venetian Blinds" },
      "Plissés": { nl: "Plissés", en: "Pleated Blinds" },
      Rolgordijnen: { nl: "Rolgordijnen", en: "Roller Blinds" },
      Vouwgordijnen: { nl: "Vouwgordijnen", en: "Folding Curtains" },
    };

    const translation = translations[configurator];
    return translation
      ? translation[lang as "nl" | "en"]
      : configurator;
  };
  const [
    showVloerverwarmingAlert,
    setShowVloerverwarmingAlert,
  ] = useState(false);
  const [showAreaExceededAlert, setShowAreaExceededAlert] =
    useState(false);
  const [
    showMandatoryRemovalAlert,
    setShowMandatoryRemovalAlert,
  ] = useState(false);
  const [
    mandatoryRemovalAcknowledged,
    setMandatoryRemovalAcknowledged,
  ] = useState(false);
  const [
    showExtraConfiguratorDialog,
    setShowExtraConfiguratorDialog,
  ] = useState(false);
  const [
    showRequiredConfiguratorAlert,
    setShowRequiredConfiguratorAlert,
  ] = useState(false);
  const [requiredConfigurators, setRequiredConfigurators] =
    useState<string[]>([]);
  const [
    showDroogbouwLevelWarning,
    setShowDroogbouwLevelWarning,
  ] = useState(false);
  const [droogbouwWarningRoomIds, setDroogbouwWarningRoomIds] =
    useState<number[]>([]);
  const [
    tempAdditionalConfigurators,
    setTempAdditionalConfigurators,
  ] = useState<string[]>([]);
  const [alertMessage, setAlertMessage] = useState("");
  const [
    showNextConfiguratorDialog,
    setShowNextConfiguratorDialog,
  ] = useState(false);
  const [nextConfiguratorMessage, setNextConfiguratorMessage] =
    useState({ current: "", next: "" });
  const [showCompletionDialog, setShowCompletionDialog] =
    useState(false);
  const [services, setServices] = useState<ServiceState[]>([]);
  // Service search state per room
  const [serviceSearchTerms, setServiceSearchTerms] = useState<{
    [roomId: number]: string;
  }>({});
  // Track if search button has been clicked per room
  const [roomSearchClicked, setRoomSearchClicked] = useState<{
    [roomId: number]: boolean;
  }>({});
  // Collapsed state for optional service sections - initialize all as collapsed
  const [
    collapsedOptionalSections,
    setCollapsedOptionalSections,
  ] = useState<Set<string>>(() => {
    console.log(
      "Initializing collapsed sections in App.tsx - all should be closed by default",
    );
    return new Set([
      "legservice",
      "legservice-followup",
      "verwijdering",
      "verwijdering-container",
      "container",
      "container-followup",
      "container-plinten",
      "voorbereiden",
      "voorbereiden-extra",
      "droogbouw",
    ]);
  });
  // Collapsed state for mandatory service sections - initialize all as collapsed
  const [
    collapsedMandatorySections,
    setCollapsedMandatorySections,
  ] = useState<Set<string>>(() => {
    console.log(
      "Initializing collapsed mandatory sections in App.tsx - all should be closed by default",
    );
    return new Set([
      "legservice",
      "legservice-choice",
      "verwijdering",
      "container",
      "voorbereiden",
      "droogbouw",
    ]);
  });
  const [relationData, setRelationData] =
    useState<RelationData>({
      customerName: "De heer van Dijk",
      execution: "LAB21",
      heatingPreference: "newByLab21",
      floorRemovalBy: "lab21",
      numberOfFloors: "3",
      buildingType: "apartment",
      apartmentWithVVE: "apartmentWithVVE",
      heatingType: "",
      baseFloor: ["zandcement", "tegel"],
      moisture: "unknown",
      collapsed: false,
    });
  const [rooms, setRooms] = useState<Room[]>([
    {
      id: 1,
      level: "",
      roomName: "",
      surface: "Zandcement",
      oldSurface: "",
      newSurface: "",
      area: 0,
      product: undefined, // Geen product geselecteerd bij start
      collapsed: false,
    },
  ]);

  const addRoom = () => {
    let newRoomId: number;

    setRooms((prev) => {
      // Collapse all existing rooms when adding a new one
      const collapsedRooms = prev.map((room) => ({
        ...room,
        collapsed: true,
      }));

      newRoomId = Math.max(...prev.map((r) => r.id)) + 1;

      // Get base floor from relationData (use first selected option if multiple)
      const getBaseFloorForSurface = (
        baseFloors: string[],
      ): string => {
        if (baseFloors.length === 0) return "";

        const baseFloorMapping: { [key: string]: string } = {
          zandcement: "Zandcement",
          anhydriet: "Anhydriet",
          fermacell: "Fermacell",
          "knauf-brio": "Knauf Brio",
          "beton-gevlinderd": "Beton (Gevlinderd)",
          gietvloer: "Gietvloer",
          "houten-planken": "Houten planken",
          "houten-platen": "Houten platen",
          concrete: "Beton",
          wood: "Hout",
          tiles: "Tegels",
          other: "",
        };
        // Use the first selected base floor
        return baseFloorMapping[baseFloors[0]] || "";
      };

      const newRoom: Room = {
        id: newRoomId,
        level: "",
        roomName: "",
        surface: getBaseFloorForSurface(relationData.baseFloor),
        oldSurface: "",
        newSurface: "",
        area: 0,
        product: undefined,
        collapsed: false, // New room starts expanded
      };

      return [...collapsedRooms, newRoom];
    });

    // Scroll to the new room's select product button after DOM update
    setTimeout(() => {
      try {
        const newRoomElement = document.getElementById(
          `room-${newRoomId}`,
        );
        if (newRoomElement) {
          newRoomElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      } catch (error) {
        console.warn("Could not scroll to new room:", error);
      }
    }, 100);
  };

  const deleteRoom = (roomId: number) => {
    if (rooms.length > 1) {
      setRooms((prev) =>
        prev.filter((room) => room.id !== roomId),
      );
      // Also remove all services for this room
      setServices((prev) =>
        prev.filter((service) => service.roomId !== roomId),
      );
      // Remove search state for this room
      setRoomSearchClicked((prev) => {
        const newState = { ...prev };
        delete newState[roomId];
        return newState;
      });
      setServiceSearchTerms((prev) => {
        const newState = { ...prev };
        delete newState[roomId];
        return newState;
      });
    }
  };

  const updateRelationData = (
    updates: Partial<RelationData>,
  ) => {
    setRelationData((prev) => {
      const newData = { ...prev, ...updates };

      // Update all service articles when moisture changes
      if (
        updates.moisture !== undefined &&
        updates.moisture !== prev.moisture
      ) {
        updateAllArticlesMoisture(updates.moisture);
      }

      // Update all service articles when apartmentWithVVE changes
      if (
        updates.apartmentWithVVE !== undefined &&
        updates.apartmentWithVVE !== prev.apartmentWithVVE
      ) {
        updateAllArticlesVVE(updates.apartmentWithVVE);
      }

      return newData;
    });
  };

  const updateRoom = (
    roomId: number,
    updates: Partial<Room>,
  ) => {
    setRooms((prev) =>
      prev.map((room) =>
        room.id === roomId ? { ...room, ...updates } : room,
      ),
    );
  };

  const handleRoomSearchClicked = (roomId: number) => {
    setRoomSearchClicked((prev) => ({
      ...prev,
      [roomId]: true,
    }));
  };

  const updateService = (
    roomId: number,
    serviceType: string,
    serviceTitle: string,
    updates: Partial<ServiceState>,
  ) => {
    console.log("🟡 updateService called:", {
      roomId,
      serviceType,
      serviceTitle,
      updates,
      isExtraConfiguratorService:
        updates.isExtraConfiguratorService,
      hasSelectedOptionalMatProducts: !!(updates as any)
        .selectedOptionalMatProducts,
      selectedOptionalMatProductsCount: (
        (updates as any).selectedOptionalMatProducts || []
      ).length,
    });

    setServices((prev) => {
      const existingServiceIndex = prev.findIndex(
        (service) =>
          service.roomId === roomId &&
          service.serviceType === serviceType &&
          service.serviceTitle === serviceTitle,
      );

      if (existingServiceIndex >= 0) {
        // Update existing service
        const existingService = prev[existingServiceIndex];

        // Preserve mat products when updating a service
        const preservedMatProducts = (existingService as any)
          .selectedOptionalMatProducts;

        // Merge updates with preserved mat products
        const updatesWithMatProducts =
          preservedMatProducts &&
          !(updates as any).selectedOptionalMatProducts
            ? {
                ...updates,
                selectedOptionalMatProducts:
                  preservedMatProducts,
              }
            : updates;

        const updated = prev.map((service, index) =>
          index === existingServiceIndex
            ? { ...service, ...updatesWithMatProducts }
            : service,
        );
        console.log(
          "🟡 Updated existing service. New services count:",
          updated.length,
        );
        return updated;
      } else {
        // Create new service if it doesn't exist
        const newService: ServiceState = {
          roomId,
          serviceType,
          serviceTitle,
          area: 0,
          isActive: false,
          isMandatory: false,
          ...updates,
        };
        const updated = [...prev, newService];
        console.log(
          "🟡 Created new service. New services count:",
          updated.length,
        );
        return updated;
      }
    });
  };

  const updateServiceSearchTerm = (
    roomId: number,
    searchTerm: string,
  ) => {
    setServiceSearchTerms((prev) => ({
      ...prev,
      [roomId]: searchTerm,
    }));
  };

  const toggleOptionalServiceCollapse = (
    serviceType: string,
  ) => {
    setCollapsedOptionalSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(serviceType)) {
        newSet.delete(serviceType);
      } else {
        newSet.add(serviceType);
      }
      console.log(
        `Toggled ${serviceType} collapse. New state:`,
        !newSet.has(serviceType) ? "OPEN" : "CLOSED",
      );
      return newSet;
    });
  };

  const toggleMandatoryServiceCollapse = (
    serviceType: string,
  ) => {
    setCollapsedMandatorySections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(serviceType)) {
        newSet.delete(serviceType);
      } else {
        newSet.add(serviceType);
      }
      console.log(
        `Toggled ${serviceType} mandatory collapse. New state:`,
        !newSet.has(serviceType) ? "OPEN" : "CLOSED",
      );
      return newSet;
    });
  };

  // Initialize article properties based on initial relation data
  useEffect(() => {
    // Set initial moisture values for all articles
    updateAllArticlesMoisture(relationData.moisture);
    // Set initial VVE values for all articles
    updateAllArticlesVVE(relationData.apartmentWithVVE);
  }, []); // Run only once on mount

  // Helper function to check if level is valid for droogbouw
  const isValidDroogbouwLevel = (level: string): boolean => {
    const validLevels = [
      "ground-floor",
      "first-floor",
      "second-floor",
      "third-floor",
    ];
    return validLevels.includes(level);
  };

  // Check droogbouw level validity when switching to droogbouw configurator or when room levels change
  useEffect(() => {
    if (
      selectedConfigurators[currentConfiguratorIndex] ===
      "Droogbouw"
    ) {
      // Check if any room has an invalid level
      const invalidRooms = rooms.filter(
        (room) =>
          room.level &&
          room.level.trim() !== "" &&
          !room.collapsed &&
          !isValidDroogbouwLevel(room.level),
      );

      if (invalidRooms.length > 0) {
        // Show warning with all invalid room IDs
        setDroogbouwWarningRoomIds(
          invalidRooms.map((r) => r.id),
        );
        setShowDroogbouwLevelWarning(true);
      }
    }
  }, [selectedConfigurators, currentConfiguratorIndex, rooms]);

  // Translate service titles when language changes
  useEffect(() => {
    setServices((prev) =>
      prev.map((service) => {
        let translatedTitle = service.serviceTitle;

        // Translate mandatory service titles
        if (service.isMandatory) {
          if (service.serviceType === "verwijdering") {
            translatedTitle =
              language === "en"
                ? "VW-REMOVE-001 - Removal of Existing Subfloor"
                : "VW-REMOVE-001 - Verwijdering Bestaande Ondergrond";
          }
        }

        return {
          ...service,
          serviceTitle: translatedTitle,
        };
      }),
    );
  }, [language]);

  // Translate surfaces when language changes
  useEffect(() => {
    // Optimized surface mapping - create once
    const surfaceMapping: {
      [key: string]: { nl: string; en: string };
    } = {
      zandcement: { nl: "Zandcement", en: "Sand Cement" },
      "sand cement": { nl: "Zandcement", en: "Sand Cement" },
      fermacell: { nl: "Fermacell", en: "Fermacell" },
      "knauf brio": { nl: "Knauf Brio", en: "Knauf Brio" },
      knaufbrio: { nl: "Knauf Brio", en: "Knauf Brio" },
      anhydriet: { nl: "Anhydriet", en: "Anhydrite" },
      anhydrite: { nl: "Anhydriet", en: "Anhydrite" },
      leisteen: { nl: "Leisteen", en: "Slate" },
      slate: { nl: "Leisteen", en: "Slate" },
      travertin: { nl: "Travertin", en: "Travertine" },
      travertine: { nl: "Travertin", en: "Travertine" },
      zandsteen: { nl: "Zandsteen", en: "Sandstone" },
      sandstone: { nl: "Zandsteen", en: "Sandstone" },
      "marmoleum/linoleum": {
        nl: "Marmoleum/Linoleum",
        en: "Marmoleum/Linoleum",
      },
      "parketvloer (verlijmd)": {
        nl: "Parketvloer (verlijmd)",
        en: "Parquet Floor (Glued)",
      },
      "parquet floor (glued)": {
        nl: "Parketvloer (verlijmd)",
        en: "Parquet Floor (Glued)",
      },
      "parketvloer (zwevend)": {
        nl: "Parketvloer (zwevend)",
        en: "Parquet Floor (Floating)",
      },
      "parquet floor (floating)": {
        nl: "Parketvloer (zwevend)",
        en: "Parquet Floor (Floating)",
      },
      pvc: { nl: "PVC", en: "PVC" },
      tegels: { nl: "Tegels", en: "Tiles" },
      tiles: { nl: "Tegels", en: "Tiles" },
      beton: { nl: "Beton", en: "Concrete" },
      concrete: { nl: "Beton", en: "Concrete" },
    };

    // Function to translate surface to target language
    const translateSurface = (
      surface: string,
      targetLanguage: string,
    ): string => {
      const lowerSurface = surface.toLowerCase();
      const mapping = surfaceMapping[lowerSurface];
      return mapping
        ? mapping[targetLanguage as keyof typeof mapping] ||
            surface
        : surface;
    };

    // Update all rooms with translated surfaces when language changes
    setRooms((prev) => {
      const updatedRooms = prev.map((room) => {
        if (room.surface && room.surface.trim() !== "") {
          const translatedSurface = translateSurface(
            room.surface,
            language,
          );
          if (translatedSurface !== room.surface) {
            return { ...room, surface: translatedSurface };
          }
        }
        return room;
      });

      // Only update if something actually changed
      return updatedRooms.some(
        (room, index) => room.surface !== prev[index].surface,
      )
        ? updatedRooms
        : prev;
    });
  }, [language]);

  // Auto-generate mandatory services for eligible rooms (only verwijdering - vloerverwarming removed)
  useEffect(() => {
    const roomsWithProducts = rooms.filter(
      (room) => room.product && room.surface && room.area > 0,
    );

    if (roomsWithProducts.length === 0) {
      // Only keep non-mandatory services if no rooms with products
      setServices((prev) => prev.filter((s) => !s.isMandatory));
      return;
    }

    // Create a mapping for mandatory removal surfaces
    const mandatoryRemovalSurfaces = [
      ["leisteen", "slate"],
      ["marmoleum", "linoleum", "marmoleum/linoleum"],
      ["parketvloer (verlijmd)", "parquet floor (glued)"],
      ["parketvloer (zwevend)", "parquet floor (floating)"],
      ["travertin", "travertine"],
      ["zandsteen", "sandstone"],
    ];

    // Helper function to check if a surface matches any of the allowed names
    const surfaceMatches = (
      surfaceValue: string,
      allowedNameGroups: string[][],
    ): boolean => {
      const lowerSurface = surfaceValue.toLowerCase();
      return allowedNameGroups.some((group) =>
        group.some((name) =>
          lowerSurface.includes(name.toLowerCase()),
        ),
      );
    };

    // Create the new mandatory services (only removal)
    const newMandatoryServices: ServiceState[] = [];

    roomsWithProducts.forEach((room) => {
      const surfaceValue = room.surface;

      // Check for mandatory removal
      const hasGelijmdeLegmethode =
        room.selectedProduct &&
        (room.selectedProduct.legmethode === "Gelijmd" ||
          room.selectedProduct.legmethode === "Glued");

      if (
        surfaceMatches(
          surfaceValue,
          mandatoryRemovalSurfaces,
        ) &&
        hasGelijmdeLegmethode
      ) {
        newMandatoryServices.push({
          roomId: room.id,
          serviceType: "verwijdering",
          serviceTitle:
            language === "en"
              ? "VW-REMOVE-001 - Removal of Existing Subfloor"
              : "VW-REMOVE-001 - Verwijdering Bestaande Ondergrond",
          area: room.area,
          isActive: true,
          isMandatory: true,
        });
      }
    });

    // Update services by keeping non-mandatory and adding new mandatory
    setServices((prev) => {
      const nonMandatory = prev.filter((s) => !s.isMandatory);

      // Merge new mandatory services with existing, preserving existing mandatory services that should remain
      const existingMandatoryToKeep = prev.filter(
        (s) =>
          s.isMandatory &&
          !newMandatoryServices.some(
            (newS) =>
              newS.roomId === s.roomId &&
              newS.serviceType === s.serviceType &&
              newS.serviceTitle === s.serviceTitle,
          ),
      );

      const combined = [
        ...nonMandatory,
        ...existingMandatoryToKeep,
        ...newMandatoryServices,
      ];

      // Only update if different - but compare more carefully to avoid unnecessary updates
      const prevMandatory = prev.filter((s) => s.isMandatory);
      const newMandatory = [
        ...existingMandatoryToKeep,
        ...newMandatoryServices,
      ];

      const mandatoryChanged =
        JSON.stringify(prevMandatory) !==
        JSON.stringify(newMandatory);

      if (mandatoryChanged) {
        return combined;
      }
      return prev;
    });
  }, [rooms, language]);

  // Auto-generate mandatory LEGSERVICES for rooms with products
  useEffect(() => {
    const roomsWithProducts = rooms.filter(
      (room) =>
        room.product &&
        room.surface &&
        room.area > 0 &&
        room.selectedProduct, // Must have selectedProduct for filtering
    );

    if (roomsWithProducts.length === 0) {
      // Remove all mandatory legservices if no rooms with products
      setServices((prev) =>
        prev.filter(
          (s) =>
            !(s.isMandatory && s.serviceType === "legservice"),
        ),
      );
      return;
    }

    // Helper function to get product filter from room
    const getProductFilterFromRoom = (room: Room) => {
      if (!room.selectedProduct) {
        return undefined;
      }

      return {
        hoofdcategorie: room.selectedProduct.hoofdcategorie,
        subcategorie: room.selectedProduct.subcategorie,
        legmethode: room.selectedProduct.legmethode,
        legpatroon: room.selectedProduct.legpatroon,
        typeVloerverwarming:
          room.selectedProduct.typeVloerverwarming,
        geintegreerdeOndervloer:
          room.selectedProduct.geintegreerdeOndervloer,
        verdieping: room.selectedProduct.verdieping,
      };
    };

    // Create new mandatory legservices
    const newMandatoryLegservices: ServiceState[] = [];

    roomsWithProducts.forEach((room) => {
      const productFilter = getProductFilterFromRoom(room);
      const mandatoryArticles =
        getMandatoryArticlesByServiceType(
          "legservice",
          productFilter,
          room.surface,
        );

      mandatoryArticles.forEach((article) => {
        const serviceTitle = `${article.productCode} - ${article.description}`;
        // For legservice: use minimum of 35m² or room area, whichever is higher
        const serviceArea = Math.max(35, room.area);

        newMandatoryLegservices.push({
          roomId: room.id,
          serviceType: "legservice",
          serviceTitle: serviceTitle,
          area: serviceArea,
          isActive: true,
          isMandatory: true,
        });
      });
    });

    // Update services by merging with existing
    setServices((prev) => {
      // Keep all non-legservice mandatory services and all optional services
      const nonLegserviceMandatory = prev.filter(
        (s) =>
          !(s.isMandatory && s.serviceType === "legservice"),
      );

      // Merge with new mandatory legservices
      const combined = [
        ...nonLegserviceMandatory,
        ...newMandatoryLegservices,
      ];

      // Only update if changed
      const prevLegserviceMandatory = prev.filter(
        (s) => s.isMandatory && s.serviceType === "legservice",
      );
      const legserviceMandatoryChanged =
        JSON.stringify(prevLegserviceMandatory.sort()) !==
        JSON.stringify(newMandatoryLegservices.sort());

      if (legserviceMandatoryChanged) {
        return combined;
      }
      return prev;
    });
  }, [rooms, language]);

  // Vloerverwarming limiet check verwijderd - geen maximum meer

  // Check if any room exceeds its area capacity
  useEffect(() => {
    // TEMPORARILY DISABLED - Area capacity validation
    return;

    if (
      rooms.length === 0 ||
      services.length === 0 ||
      showAreaExceededAlert
    )
      return;

    const roomAreaExceeded = rooms.find((room) => {
      if (room.area <= 0) return false;
      const totalServiceArea = services
        .filter((s) => s.roomId === room.id && s.isActive)
        .reduce((total, service) => total + service.area, 0);
      return totalServiceArea > room.area;
    });

    if (roomAreaExceeded) {
      const totalServiceArea = services
        .filter(
          (s) => s.roomId === roomAreaExceeded.id && s.isActive,
        )
        .reduce((total, service) => total + service.area, 0);

      setAlertMessage(
        language === "en"
          ? `Room "${roomAreaExceeded.roomName || "Room " + roomAreaExceeded.id}" exceeds its capacity. Total services: ${totalServiceArea}m², Room area: ${roomAreaExceeded.area}m².`
          : `Ruimte "${roomAreaExceeded.roomName || "Ruimte " + roomAreaExceeded.id}" overschrijdt de capaciteit. Totaal services: ${totalServiceArea}m², Ruimte oppervlakte: ${roomAreaExceeded.area}m².`,
      );
      setShowAreaExceededAlert(true);
    }
  }, [services, rooms, language, showAreaExceededAlert]);

  // Reset acknowledged state when relevant room properties change
  useEffect(() => {
    const currentRoomStates = rooms.map((room) => ({
      id: room.id,
      surface: room.surface,
      legmethode: room.selectedProduct?.legmethode,
    }));

    const stateKey = JSON.stringify(currentRoomStates);
    const prevStateKey =
      sessionStorage.getItem("mandatoryRemovalStateKey") || "";

    if (stateKey !== prevStateKey && prevStateKey !== "") {
      setMandatoryRemovalAcknowledged(false);
    }

    try {
      sessionStorage.setItem(
        "mandatoryRemovalStateKey",
        stateKey,
      );
    } catch (e) {
      // Ignore sessionStorage errors
    }
  }, [rooms]);

  // Check for mandatory removal requirement based on surface + gelijmd legmethode
  useEffect(() => {
    if (
      rooms.length === 0 ||
      showMandatoryRemovalAlert ||
      mandatoryRemovalAcknowledged
    )
      return;

    // Use the same surface mapping as in the service generation
    const mandatoryRemovalSurfaces = [
      ["leisteen", "slate"],
      ["marmoleum", "linoleum", "marmoleum/linoleum"],
      ["parketvloer (verlijmd)", "parquet floor (glued)"],
      ["parketvloer (zwevend)", "parquet floor (floating)"],
      ["travertin", "travertine"],
      ["zandsteen", "sandstone"],
    ];

    const roomsRequiringMandatoryRemoval = rooms.filter(
      (room) => {
        if (!room.product || !room.surface) return false;

        const surfaceValue = room.surface;
        const hasRequiredSurface =
          mandatoryRemovalSurfaces.some((surfaceGroup) =>
            surfaceGroup.some((surface) =>
              surfaceValue
                .toLowerCase()
                .includes(surface.toLowerCase()),
            ),
          );

        // Check if the selected product has "Gelijmd" legmethode (both Dutch and English)
        const hasGelijmdeLegmethode =
          room.selectedProduct &&
          (room.selectedProduct.legmethode === "Gelijmd" ||
            room.selectedProduct.legmethode === "Glued");

        return hasRequiredSurface && hasGelijmdeLegmethode;
      },
    );

    if (roomsRequiringMandatoryRemoval.length > 0) {
      setShowMandatoryRemovalAlert(true);
    }
  }, [
    rooms,
    showMandatoryRemovalAlert,
    mandatoryRemovalAcknowledged,
  ]);

  const handleProductSelection = (configurators: string[]) => {
    setSelectedExecution(relationData.execution);
    setSelectedConfigurators(configurators);
    setCompletedConfigurators([]);
    setCurrentConfiguratorIndex(0);
    // Gebruik de eerste configurator als product category
    setSelectedProductCategory(configurators[0] || "");
    setCurrentScreen("configurator");
  };

  const handleOpenProductModal = (roomId: number) => {
    setCurrentRoomForProduct(roomId);
    setShowProductModal(true);
  };

  const handleArticleSelection = (product: Product) => {
    if (currentRoomForProduct) {
      // Translate legmethode to current language
      const translateLegmethode = (
        legmethode: string,
        targetLanguage: string,
      ): string => {
        const legmethodeMapping: {
          [key: string]: { nl: string; en: string };
        } = {
          Klikverbinding: { nl: "Klikverbinding", en: "Click" },
          Gelijmd: { nl: "Gelijmd", en: "Glued" },
          Zwevend: { nl: "Zwevend", en: "Floating" },
          Genageld: { nl: "Genageld", en: "Nailed" },
          Geschroefd: { nl: "Geschroefd", en: "Screwed" },
          Losgelegd: { nl: "Losgelegd", en: "Loose Lay" },
          Keuze: { nl: "Keuze", en: "Choice" },
        };

        // Find the mapping for this legmethode
        const mapping = legmethodeMapping[legmethode];
        if (mapping) {
          return (
            mapping[targetLanguage as keyof typeof mapping] ||
            legmethode
          );
        }

        return legmethode; // Return original if no mapping found
      };

      // Create translated product copy
      const translatedProduct = {
        ...product,
        legmethode: product.legmethode
          ? translateLegmethode(product.legmethode, language)
          : product.legmethode,
      };

      // Get current room data BEFORE making updates
      const currentRoom = rooms.find(
        (r) => r.id === currentRoomForProduct,
      );

      console.log(
        "Auto-fill debug - Current room before updates:",
        currentRoom,
      );

      // Auto-fill with default values if fields are empty
      const updates: any = {
        product: product.name,
        selectedProduct: translatedProduct,
      };

      // Set default values only if not already filled
      if (!currentRoom?.level || currentRoom.level === "") {
        console.log("Setting default level");
        updates.level = "ground-floor"; // Use the value from SelectItem, not the display text
      }
      if (
        !currentRoom?.roomName ||
        currentRoom.roomName === ""
      ) {
        console.log("Setting default roomName");
        updates.roomName = "woonkamer"; // Use the value from SelectItem, not the display text
      }
      if (!currentRoom?.surface || currentRoom.surface === "") {
        console.log("Setting default surface");
        updates.surface =
          language === "en" ? "Sand Cement" : "Zandcement";
      }
      if (!currentRoom?.area || currentRoom.area === 0) {
        console.log("Setting default area");
        updates.area = 40;
      }

      console.log(
        "Auto-fill debug - Updates to apply:",
        updates,
      );
      updateRoom(currentRoomForProduct, updates);
    }
    setShowProductModal(false);
    setCurrentRoomForProduct(null);
  };

  const handleOpenProductDetail = (product: Product) => {
    setSelectedProductForDetail(product);
    setCurrentScreen("product-detail");
  };

  const handleOpenProductDetailFromRoom = (roomId: number) => {
    const room = rooms.find((r) => r.id === roomId);
    if (room && room.product) {
      // Create a mock product object from the room's product name
      // In a real app, you'd fetch the full product details from a database
      const mockProduct: Product = {
        id: `room-${roomId}-product`,
        name: room.product,
        code: "MOCK-CODE-123",
        category: "PVC",
        brand: "Mock Brand",
        collection: "Mock Collection",
        size: "610x122mm",
        thickness: "2.5mm",
        surface: room.surface,
        color: "Standaard",
      };

      setSelectedProductForDetail(mockProduct);
      setCurrentScreen("product-detail");
    }
  };

  const handleProductDetailBack = () => {
    setCurrentScreen("configurator");
    setSelectedProductForDetail(null);
  };

  const handleSelectProductFromDetail = (product: Product) => {
    if (currentRoomForProduct) {
      // Translate legmethode based on current language
      const translateLegmethode = (
        legmethode: string,
        lang: string,
      ): string => {
        const mapping: Record<
          string,
          { nl: string; en: string }
        > = {
          Klik: { nl: "Klik", en: "Click" },
          Click: { nl: "Klik", en: "Click" },
          Gelijmd: { nl: "Gelijmd", en: "Glued" },
          Glued: { nl: "Gelijmd", en: "Glued" },
          Losliggend: { nl: "Losliggend", en: "Loose Lay" },
          "Loose Lay": { nl: "Losliggend", en: "Loose Lay" },
        };

        const entry = mapping[legmethode];
        if (entry) {
          return lang === "nl" ? entry.nl : entry.en;
        }

        return legmethode; // Return original if no mapping found
      };

      // Create translated product copy
      const translatedProduct = {
        ...product,
        legmethode: product.legmethode
          ? translateLegmethode(product.legmethode, language)
          : product.legmethode,
      };

      updateRoom(currentRoomForProduct, {
        product: product.name,
        selectedProduct: translatedProduct,
      });
    }
    setCurrentScreen("configurator");
    setSelectedProductForDetail(null);
    setShowProductModal(false);
    setCurrentRoomForProduct(null);
  };

  const handleOpenServiceArticleDetail = (
    article: LegserviceArticle,
  ) => {
    setSelectedServiceArticleForDetail(article);
    setCurrentScreen("service-detail");
  };

  const handleServiceArticleDetailBack = () => {
    setCurrentScreen("configurator");
    setSelectedServiceArticleForDetail(null);
  };

  const handleSaveServiceArticle = (
    updatedArticle: LegserviceArticle,
  ) => {
    // Update the article in the legserviceArticles array
    const updateSuccess =
      updateLegserviceArticle(updatedArticle);

    if (updateSuccess) {
      // Update the selected article for immediate display
      setSelectedServiceArticleForDetail(updatedArticle);

      console.log(
        "Service article updated successfully:",
        updatedArticle,
      );

      // Optional: Show success message to user
      // You could add a toast notification here
    } else {
      console.error("Failed to update service article");
      // Optional: Show error message to user
    }
  };

  const handleSubmitOrder = () => {
    console.log("🔵 🔵 🔵 handleSubmitOrder CALLED 🔵 🔵 🔵");
    console.log("Services state:", services);
    console.log("Services count:", services.length);
    console.log(
      "Services detail:",
      services.map((s) => ({
        name: s.name,
        area: s.area,
        isActive: s.isActive,
        isMandatory: s.isMandatory,
        isSelected: s.isSelected,
        isExtraConfiguratorService:
          s.isExtraConfiguratorService,
      })),
    );

    // Collect all mandatory and selected services
    const mandatoryServices = services.filter(
      (service) => service.isMandatory && service.isActive,
    );
    const selectedOptionalServices = services.filter(
      (service) => !service.isMandatory && service.isSelected,
    );
    const allSelectedServices = [
      ...mandatoryServices,
      ...selectedOptionalServices,
    ];

    console.log("Mandatory services:", mandatoryServices);
    console.log(
      "Selected optional services:",
      selectedOptionalServices,
    );
    console.log(
      "Submitting order with services:",
      allSelectedServices,
    );
    console.log("Rooms:", rooms);

    // Navigate to order overview
    setCurrentScreen("order-overview");
  };

  // Helper function to check if there are extra configurators needed
  // This checks VISIBLE articles based on room conditions (same logic as handleSubmitFromOrderOverview)
  const hasExtraConfiguratorsNeeded = () => {
    console.log(
      "🔍 hasExtraConfiguratorsNeeded() - CHECKING VISIBLE ARTICLES...",
    );
    console.log("   Total rooms:", rooms.length);

    const requiredExtraConfigurators = new Set<string>();

    // Check each room with a product (same logic as handleSubmitFromOrderOverview)
    rooms.forEach((room) => {
      if (room.selectedProduct && room.oldSurface) {
        // Check all legservice articles for this room's conditions
        legserviceArticles.forEach((article) => {
          // Check if article has extraConfigurator field
          if (article.extraConfigurator) {
            // Check if article's ondergrond matches room's OLD surface (bestaande vloer)
            // IMPORTANT: article.ondergrond is always in Dutch (from legserviceArticles.ts)
            // Convert room.oldSurface to Dutch display name using translations.nl.existingFloors
            const roomOldSurfaceDutch =
              translations.nl.existingFloors[
                room.oldSurface as keyof typeof translations.nl.existingFloors
              ] || room.oldSurface;
            const articleSurfaces =
              article.ondergrond
                ?.split(";")
                .map((s) => s.trim()) || [];
            const surfaceMatches = articleSurfaces.some(
              (s) =>
                s.toLowerCase() ===
                roomOldSurfaceDutch.toLowerCase(),
            );

            // Check if article's verdieping matches room's level (if specified)
            let levelMatches = true; // Default to true if no verdieping restriction
            if (
              article.verdieping &&
              typeof article.verdieping === "string"
            ) {
              const articleLevels = article.verdieping
                .split(";")
                .map((l) => l.trim());
              // IMPORTANT: article.verdieping is always in Dutch, so convert room.level to Dutch too
              const roomLevelDutch =
                translations.nl.levels[
                  room.level as keyof typeof translations.nl.levels
                ];
              levelMatches = articleLevels.some(
                (l) =>
                  l.toLowerCase() ===
                  roomLevelDutch?.toLowerCase(),
              );
            }

            if (surfaceMatches && levelMatches) {
              console.log(
                `   ✅ VISIBLE article: ${article.productCode} requires ${article.extraConfigurator}`,
              );
              requiredExtraConfigurators.add(
                article.extraConfigurator,
              );
            }
          }
        });
      }
    });

    console.log(
      "   Required extra configurators:",
      Array.from(requiredExtraConfigurators),
    );
    console.log(
      "   Completed configurators:",
      completedConfigurators,
    );

    // Check if any required configurator is NOT YET COMPLETED
    for (const configurator of requiredExtraConfigurators) {
      const alreadyCompleted =
        completedConfigurators.includes(configurator);
      console.log(
        `   Checking "${configurator}": alreadyCompleted=${alreadyCompleted}`,
      );
      if (!alreadyCompleted) {
        console.log(
          "   🚨 EXTRA CONFIGURATOR NOT YET COMPLETED! Returning TRUE",
        );
        return true;
      }
    }

    console.log(
      "   ✅ No extra configurators needed or all completed. Returning FALSE",
    );
    return false;
  };

  // Memoize isLastConfigurator to ensure it updates when rooms or configurators change
  const isLastConfigurator = useMemo(() => {
    const result =
      currentConfiguratorIndex >=
        selectedConfigurators.length - 1 &&
      !hasExtraConfiguratorsNeeded();
    console.log(
      "🎯 useMemo: isLastConfigurator calculated:",
      result,
      {
        currentConfiguratorIndex,
        selectedConfiguratorsLength:
          selectedConfigurators.length,
        hasExtraNeeded: hasExtraConfiguratorsNeeded(),
      },
    );
    return result;
  }, [
    currentConfiguratorIndex,
    selectedConfigurators,
    rooms,
    completedConfigurators,
    services,
    language,
  ]);

  const handleSubmitFromOrderOverview = () => {
    console.log(
      "🟢 🟢 🟢 handleSubmitFromOrderOverview CALLED - VERSION 3.0 🟢 🟢 🟢",
    );
    console.log("Current state:", {
      selectedConfigurators,
      currentConfiguratorIndex,
      completedConfigurators,
      servicesCount: services.length,
    });

    try {
      // 1. Mark current configurator as completed
      const currentConfigurator =
        selectedConfigurators[currentConfiguratorIndex];
      console.log(
        `✅ Completing configurator: ${currentConfigurator}`,
      );

      // Add to completed list
      setCompletedConfigurators((prev) => [
        ...prev,
        currentConfigurator,
      ]);

      // 2. Check VISIBLE extra configurator articles based on room conditions
      console.log(
        "🔍 Checking VISIBLE articles for extra configurator requirements...",
      );
      console.log("📋 Total rooms:", rooms.length);

      const requiredExtraConfigurators = new Set<string>();
      const roomsPerConfigurator = new Map<
        string,
        Set<number>
      >(); // configurator -> Set of room IDs

      // Droogbouw required base floors (basisvloer)
      const droogbouwRequiredSurfaces = [
        "airbase",
        "anders",
        "anhydriet",
        "anhydriet-zwevend",
        "beton-gevlinderd",
        "eco2floor",
        "fermacell",
        "gietvloer",
        "grindvloer",
        "houten-planken",
        "houten-platen",
        "knauf-brio",
        "magnesiet",
        "troffelvloer",
        "variokomp",
        "zandcement",
        "zandcement-zwevend",
      ];

      // Check each room with a product
      rooms.forEach((room) => {
        if (room.selectedProduct) {
          console.log(
            `\n📍 Checking room ${room.id} (${room.roomName}):`,
          );
          console.log(
            `   - Surface (Basisvloer): ${room.surface}`,
          );
          console.log(
            `   - Old Surface (Bestaande vloer): ${room.oldSurface}`,
          );
          console.log(`   - Level: ${room.level}`);

          // Check if room's basisvloer requires Droogbouw
          if (
            room.surface &&
            droogbouwRequiredSurfaces.includes(
              room.surface.toLowerCase(),
            )
          ) {
            console.log(
              `   ✅ Room requires Droogbouw due to basisvloer: ${room.surface}`,
            );
            requiredExtraConfigurators.add("Droogbouw");

            // Track which rooms need Droogbouw
            if (!roomsPerConfigurator.has("Droogbouw")) {
              roomsPerConfigurator.set("Droogbouw", new Set());
            }
            roomsPerConfigurator.get("Droogbouw")?.add(room.id);
          }

          // Check all legservice articles for other extra configurators (requires oldSurface)
          if (room.oldSurface) {
            legserviceArticles.forEach((article) => {
              // Check if article has extraConfigurator field
              if (article.extraConfigurator) {
                // Check if article's ondergrond matches room's OLD surface (bestaande vloer)
                // Convert room.oldSurface to Dutch display name using translations.nl.existingFloors
                const roomOldSurfaceDutch =
                  translations.nl.existingFloors[
                    room.oldSurface as keyof typeof translations.nl.existingFloors
                  ] || room.oldSurface;
                const articleSurfaces =
                  article.ondergrond
                    ?.split(";")
                    .map((s) => s.trim()) || [];
                const surfaceMatches = articleSurfaces.some(
                  (s) =>
                    s.toLowerCase() ===
                    roomOldSurfaceDutch.toLowerCase(),
                );

                // Check if article's verdieping matches room's level (if specified)
                let levelMatches = true; // Default to true if no verdieping restriction
                if (
                  article.verdieping &&
                  typeof article.verdieping === "string"
                ) {
                  const articleLevels = article.verdieping
                    .split(";")
                    .map((l) => l.trim());
                  // IMPORTANT: article.verdieping is always in Dutch, so convert room.level to Dutch too
                  const roomLevelDutch =
                    translations.nl.levels[
                      room.level as keyof typeof translations.nl.levels
                    ];
                  levelMatches = articleLevels.some(
                    (l) =>
                      l.toLowerCase() ===
                      roomLevelDutch?.toLowerCase(),
                  );
                }

                if (surfaceMatches && levelMatches) {
                  console.log(
                    `   ✅ VISIBLE article with extraConfigurator: ${article.productCode}`,
                  );
                  console.log(
                    `      - Extra configurator: ${article.extraConfigurator}`,
                  );
                  requiredExtraConfigurators.add(
                    article.extraConfigurator,
                  );

                  // Track which rooms need this configurator
                  if (
                    !roomsPerConfigurator.has(
                      article.extraConfigurator,
                    )
                  ) {
                    roomsPerConfigurator.set(
                      article.extraConfigurator,
                      new Set(),
                    );
                  }
                  roomsPerConfigurator
                    .get(article.extraConfigurator)
                    ?.add(room.id);
                }
              }
            });
          }
        }
      });

      console.log(
        "✅ Required extra configurators:",
        Array.from(requiredExtraConfigurators),
      );
      console.log(
        "📍 Rooms per configurator:",
        Array.from(roomsPerConfigurator.entries()).map(
          ([conf, rooms]) =>
            `${conf}: ${Array.from(rooms).join(", ")}`,
        ),
      );
      const extraConfigsList = Array.from(
        requiredExtraConfigurators,
      );
      if (extraConfigsList.length > 0) {
        console.log(
          "✅ Extra configuratoren gevonden:",
          extraConfigsList.join(", "),
        );
      } else {
        console.log("❌ GEEN extra configuratoren gevonden!");
      }

      // 3. Voor elke vereiste extra configurator: check of deze al in de lijst staat
      const configuratorsToAdd: string[] = [];

      requiredExtraConfigurators.forEach((configurator) => {
        const alreadyInList =
          selectedConfigurators.includes(configurator);
        const alreadyCompleted =
          completedConfigurators.includes(configurator);

        if (!alreadyInList && !alreadyCompleted) {
          console.log(
            `   ➕ "${configurator}" is NIET in de lijst - moet worden toegevoegd!`,
          );
          configuratorsToAdd.push(configurator);
        } else {
          console.log(
            `   ✔️ "${configurator}" is al in de lijst of al afgerond - niets te doen`,
          );
        }
      });

      // 4. Als er configuratoren moeten worden toegevoegd: voeg toe en toon verplichte popup
      if (configuratorsToAdd.length > 0) {
        console.log(
          `🚨 Voeg ${configuratorsToAdd.length} verplichte configurator(en) toe:`,
          configuratorsToAdd,
        );

        // Update de lijst van geselecteerde configuratoren
        const updatedSelectedConfigurators = [
          ...selectedConfigurators,
          ...configuratorsToAdd,
        ];
        setSelectedConfigurators(updatedSelectedConfigurators);

        // Store filtered room IDs for each configurator (for filtering later)
        configuratorsToAdd.forEach((configurator) => {
          const roomIds =
            roomsPerConfigurator.get(configurator);
          if (roomIds) {
            const roomIdsArray = Array.from(roomIds);
            sessionStorage.setItem(
              `${configurator.toLowerCase()}FilteredRooms`,
              JSON.stringify(roomIdsArray),
            );
            console.log(
              `   💾 Stored filtered rooms for ${configurator}:`,
              roomIdsArray,
            );
          }
        });

        // Set required configurators and show dialog
        setRequiredConfigurators(configuratorsToAdd);
        setShowExtraConfiguratorDialog(true);

        return; // Exit early - wacht tot gebruiker de popup bevestigt
      }

      // 5. Check of dit de laatste configurator is
      const isLastConfigurator =
        currentConfiguratorIndex >=
        selectedConfigurators.length - 1;

      console.log(
        "📊 Checking if this is the last configurator:",
      );
      console.log(
        "   currentConfiguratorIndex:",
        currentConfiguratorIndex,
      );
      console.log(
        "   selectedConfigurators.length:",
        selectedConfigurators.length,
      );
      console.log("   isLastConfigurator:", isLastConfigurator);

      if (isLastConfigurator) {
        // Dit is de laatste configurator - toon completion dialog!
        console.log("");
        console.log(
          "===============================================================================",
        );
        console.log(
          "🎉 🎉 🎉 LAATSTE CONFIGURATOR! COMPLETION DIALOG TONEN! 🎉 🎉 🎉",
        );
        console.log(
          '⚠️⚠️⚠️ DE KNOP ZEGT "INDIENEN" - GEEN CHECKS MEER NODIG! ⚠️⚠️⚠️',
        );
        console.log(
          "===============================================================================",
        );
        console.log(
          "Final selectedConfigurators:",
          selectedConfigurators,
        );
        console.log(
          "Final completedConfigurators:",
          completedConfigurators,
        );

        // Toon de completion dialog direct!
        console.log(
          "✅✅✅ SETTING showCompletionDialog = TRUE ✅✅✅",
        );
        setShowCompletionDialog(true);
      } else {
        // Er is nog een volgende configurator
        const nextIndex = currentConfiguratorIndex + 1;
        const nextConfigurator =
          selectedConfigurators[nextIndex];
        console.log(
          `➡️ Start volgende configurator: ${nextConfigurator} (${nextIndex + 1}/${selectedConfigurators.length})`,
        );

        // Reset state voor de volgende configurator
        setCurrentConfiguratorIndex(nextIndex);
        setSelectedProductCategory(nextConfigurator);

        // Keep room data but remove product selections for new configurator
        setRooms((prev) =>
          prev.map((room) => ({
            ...room,
            product: undefined,
            selectedProduct: undefined,
            collapsed: false, // Open all rooms for new configurator
          })),
        );
        setServices([]);

        // Go back to configurator screen
        setCurrentScreen("configurator");

        // Show notification dialog
        setNextConfiguratorMessage({
          current: translateConfiguratorName(
            currentConfigurator,
            language,
          ),
          next: translateConfiguratorName(
            nextConfigurator,
            language,
          ),
        });
        setShowNextConfiguratorDialog(true);
      }
    } catch (error) {
      console.error(
        "❌ ERROR in handleSubmitFromOrderOverview:",
        error,
      );
    }
  };

  const handleBackToConfigurator = () => {
    console.log("");
    console.log(
      "===============================================================================",
    );
    console.log(
      "🔙 🔙 🔙 TERUG BUTTON - handleBackToConfigurator AANGEROEPEN 🔙 🔙 🔙",
    );
    console.log("DIT MAG GEEN COMPLETION DIALOG TONEN!!!");
    console.log(
      "⚠️⚠️⚠️ TERUG KNOP GEKLIKT - ALLEEN TERUG NAAR CONFIGURATOR! ⚠️⚠️⚠️",
    );
    console.log(
      "===============================================================================",
    );
    console.log("");
    // GEEN setShowCompletionDialog(true) hier!
    setCurrentScreen("configurator");
  };

  const handleContinueWithoutExtraConfigurators = () => {
    setShowExtraConfiguratorDialog(false);

    // Complete the order - all done
    console.log("All configurators completed!");

    // Reset to start and return to product selection screen
    setCurrentScreen("product-selection");
    setSelectedConfigurators([]);
    setCompletedConfigurators([]);
    setCurrentConfiguratorIndex(0);
    setTempAdditionalConfigurators([]);
  };

  const handleAddExtraConfigurators = () => {
    console.log(
      "🔔 User acknowledged required extra configurators",
    );
    console.log(
      "   Required configurators:",
      requiredConfigurators,
    );
    console.log(
      "   Current selectedConfigurators:",
      selectedConfigurators,
    );

    // Close the dialog
    setShowExtraConfiguratorDialog(false);

    // The configurators have already been added to selectedConfigurators in handleSubmitFromOrderOverview
    // Now check if we're at the last configurator
    const isLastConfigurator =
      currentConfiguratorIndex >=
      selectedConfigurators.length - 1;

    console.log("📊 After acknowledging extra configurators:");
    console.log(
      "   currentConfiguratorIndex:",
      currentConfiguratorIndex,
    );
    console.log(
      "   selectedConfigurators.length:",
      selectedConfigurators.length,
    );
    console.log("   isLastConfigurator:", isLastConfigurator);

    if (isLastConfigurator) {
      // Move to the first newly added configurator
      const nextIndex = currentConfiguratorIndex + 1;
      console.log(
        `   ➡️ Moving to next configurator at index ${nextIndex}`,
      );
      setCurrentConfiguratorIndex(nextIndex);
      setCurrentScreen("configurator");
    } else {
      // Move to next configurator
      const nextIndex = currentConfiguratorIndex + 1;
      console.log(
        `   ➡️ Moving to next configurator at index ${nextIndex}`,
      );
      setCurrentConfiguratorIndex(nextIndex);
      setCurrentScreen("configurator");
    }
  };

  const handleToggleAdditionalConfigurator = (
    configurator: string,
  ) => {
    setTempAdditionalConfigurators((prev) => {
      if (prev.includes(configurator)) {
        return prev.filter((c) => c !== configurator);
      } else {
        return [...prev, configurator];
      }
    });
  };

  const handleStopAfterCompletion = () => {
    console.log("Gebruiker heeft gekozen om te stoppen");
    setShowCompletionDialog(false);

    // Reset naar het begin (terug naar product selection)
    setCurrentScreen("product-selection");
    setSelectedConfigurators([]);
    setCompletedConfigurators([]);
    setCurrentConfiguratorIndex(0);
    setTempAdditionalConfigurators([]);

    // Reset rooms en services
    setRooms([
      {
        id: 1,
        level: "",
        roomName: "",
        surface: "",
        area: 0,
        product: undefined,
        collapsed: false,
      },
    ]);
    setServices([]);
  };

  const handleStartNewConfiguratorAfterCompletion = () => {
    console.log(
      "Gebruiker heeft gekozen om een nieuwe configurator te starten",
    );
    setShowCompletionDialog(false);

    // Reset naar product selection zodat gebruiker nieuwe configuratoren kan kiezen
    setCurrentScreen("product-selection");
    setSelectedConfigurators([]);
    setCompletedConfigurators([]);
    setCurrentConfiguratorIndex(0);
    setTempAdditionalConfigurators([]);

    // BELANGRIJK: Behoud de bestaande rooms en hun data
    // Alleen product selecties worden gereset
    setRooms((prev) =>
      prev.map((room) => ({
        ...room,
        product: undefined,
        selectedProduct: undefined,
        collapsed: false,
      })),
    );
    setServices([]);
  };

  const handleCloseProductModal = () => {
    setShowProductModal(false);
    setCurrentRoomForProduct(null);
  };

  const handleClose = () => {
    console.log("Close clicked");
  };

  if (currentScreen === "product-selection") {
    return (
      <>
        {/* Language Selector */}

        <ProductSelection
          onProceed={handleProductSelection}
          onClose={handleClose}
          language={language}
          onLanguageChange={setLanguage}
        />
      </>
    );
  }

  if (
    currentScreen === "product-detail" &&
    selectedProductForDetail
  ) {
    return (
      <ProductDetailPage
        product={selectedProductForDetail}
        onBack={handleProductDetailBack}
        onClose={handleProductDetailBack}
        onSelectProduct={handleSelectProductFromDetail}
        language={language}
      />
    );
  }

  if (
    currentScreen === "service-detail" &&
    selectedServiceArticleForDetail
  ) {
    return (
      <ServiceArticleDetailPage
        article={selectedServiceArticleForDetail}
        onBack={handleServiceArticleDetailBack}
        onClose={handleServiceArticleDetailBack}
        onSave={handleSaveServiceArticle}
        language={language}
      />
    );
  }

  if (currentScreen === "order-overview") {
    return (
      <>
        <OrderOverview
          rooms={rooms}
          services={services}
          relationData={relationData}
          onBack={handleBackToConfigurator}
          onClose={handleClose}
          onSubmit={handleSubmitFromOrderOverview}
          language={language}
          isLastConfigurator={isLastConfigurator}
        />

        {/* Extra Configurator Dialog */}
        <Dialog
          open={showExtraConfiguratorDialog}
          onOpenChange={setShowExtraConfiguratorDialog}
        >
          <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden">
            <div className="bg-[#2d4724] text-white px-6 py-4 text-center">
              <DialogTitle className="text-white m-0">
                {t.extraConfiguratorDialog.title}
              </DialogTitle>
            </div>
            <DialogDescription asChild>
              <div className="px-6 py-6 space-y-6">
                <div className="text-gray-900 text-base">
                  {t.extraConfiguratorDialog.message}
                </div>

                {/* List of required configurators */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <ul className="list-disc list-inside space-y-2">
                    {requiredConfigurators.map(
                      (configurator, index) => (
                        <li
                          key={index}
                          className="text-gray-900 font-medium"
                        >
                          {configurator}
                        </li>
                      ),
                    )}
                  </ul>
                </div>

                <div className="text-gray-700 text-sm text-center">
                  {t.extraConfiguratorDialog.question}
                </div>

                <div className="flex justify-center pt-4">
                  <Button
                    onClick={handleAddExtraConfigurators}
                    className="bg-[#2d4724] text-white hover:bg-[#3d5734] px-8 py-3"
                  >
                    {
                      t.extraConfiguratorDialog
                        .addConfiguratorButton
                    }
                  </Button>
                </div>
              </div>
            </DialogDescription>
          </DialogContent>
        </Dialog>

        {/* Completion Dialog - Nieuwe configurator of stoppen? */}
        <Dialog
          open={showCompletionDialog}
          onOpenChange={setShowCompletionDialog}
        >
          <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden">
            <div className="bg-[#2d4724] text-white px-6 py-4 text-center">
              <DialogTitle className="text-white m-0">
                {language === "nl"
                  ? "Configuratie voltooid!"
                  : "Configuration completed!"}
              </DialogTitle>
            </div>
            <DialogDescription asChild>
              <div className="px-6 py-6 space-y-6">
                <div className="text-gray-900 text-lg text-center">
                  {language === "nl"
                    ? "U heeft alle geselecteerde configuratoren voltooid. Wilt u een nieuwe configurator opstarten of wilt u stoppen?"
                    : "You have completed all selected configurators. Would you like to start a new configurator or stop?"}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button
                    onClick={handleStopAfterCompletion}
                    variant="outline"
                    className="flex-1 border-[#2d4724] text-[#2d4724] hover:bg-[#2d4724] hover:text-white whitespace-normal h-auto py-3 px-4"
                  >
                    {language === "nl" ? "Stoppen" : "Stop"}
                  </Button>
                  <Button
                    onClick={
                      handleStartNewConfiguratorAfterCompletion
                    }
                    className="flex-1 bg-[#2d4724] hover:bg-[#1f3319] text-white whitespace-normal h-auto py-3 px-4"
                  >
                    {language === "nl"
                      ? "Nieuwe configurator opstarten"
                      : "Start new configurator"}
                  </Button>
                </div>
              </div>
            </DialogDescription>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="w-full mx-auto bg-white">
        <ConfiguratorHeader
          onClose={handleClose}
          language={language}
          onLanguageChange={setLanguage}
          currentConfigurator={
            selectedConfigurators[currentConfiguratorIndex]
          }
          configuratorProgress={
            selectedConfigurators.length > 1
              ? `${currentConfiguratorIndex + 1}/${selectedConfigurators.length}`
              : undefined
          }
        />

        <div className="p-4 md:p-6 space-y-8">
          {/* Relation Details Section */}
          <div className="border rounded-lg bg-white">
            {/* Relation Header */}
            <div
              className="bg-[#2d4724] text-white px-4 py-2 rounded-t-lg flex items-center justify-between cursor-pointer"
              onClick={() =>
                updateRelationData({
                  collapsed: !relationData.collapsed,
                })
              }
            >
              <h2 className="text-lg">
                {t.relationDetails.title}
              </h2>
              <ChevronDown
                className={`h-5 w-5 transition-transform ${relationData.collapsed ? "rotate-180" : ""}`}
              />
            </div>

            {/* Relation Content */}
            <div className="p-4 md:p-6 bg-[#2d472402]">
              <RelationDetails
                initialData={relationData}
                onUpdate={updateRelationData}
                configuratorType={selectedConfigurators[currentConfiguratorIndex]}
                collapsed={relationData.collapsed}
                onToggleCollapse={() =>
                  updateRelationData({
                    collapsed: !relationData.collapsed,
                  })
                }
                language={language}
              />
            </div>
          </div>

          {/* Room Sections */}
          {rooms.map((room) => (
            <div key={room.id} id={`room-${room.id}`}>
              {/* Complete Room Container */}
              <div className="border rounded-lg bg-white">
                {/* Room Header */}
                <div
                  className="bg-[#2d4724] text-white px-4 py-2 rounded-t-lg flex items-center justify-between cursor-pointer"
                  onClick={() =>
                    updateRoom(room.id, {
                      collapsed: !room.collapsed,
                    })
                  }
                >
                  <h2 className="text-lg">
                    {t.roomNumber} {room.id}
                    {room.roomName &&
                      room.roomName.trim() !== "" &&
                      `: ${room.roomName.charAt(0).toUpperCase() + room.roomName.slice(1)}`}
                    {room.level &&
                      room.level.trim() !== "" &&
                      ` (${(() => {
                        // Map kebab-case to camelCase for level translation keys
                        const levelKeyMap: {
                          [key: string]: keyof typeof t.levels;
                        } = {
                          "ground-floor": "groundFloor",
                          "first-floor": "firstFloor",
                          "second-floor": "secondFloor",
                          "third-floor": "thirdFloor",
                          "higher-floor": "higherFloor",
                          basement: "basement",
                        };
                        const mappedKey =
                          levelKeyMap[room.level] ||
                          (room.level as keyof typeof t.levels);
                        const levelText =
                          t.levels[mappedKey] ||
                          t.levels.groundFloor;
                        // Capitalize first letter to match selection format
                        return (
                          levelText.charAt(0).toUpperCase() +
                          levelText.slice(1)
                        );
                      })()})`}
                  </h2>
                  <ChevronDown
                    className={`h-5 w-5 transition-transform ${room.collapsed ? "rotate-180" : ""}`}
                  />
                </div>

                {/* Room Content Container */}
                <div>
                  {/* Room Configurator */}
                  <div className="p-4 md:p-6 bg-[#2d472402]">
                    <RoomConfigurator
                      roomNumber={room.id}
                      initialData={room}
                      onDelete={() => deleteRoom(room.id)}
                      onUpdate={(updates) =>
                        updateRoom(room.id, updates)
                      }
                      showDelete={rooms.length > 1}
                      collapsed={room.collapsed}
                      onToggleCollapse={() =>
                        updateRoom(room.id, {
                          collapsed: !room.collapsed,
                        })
                      }
                      allRooms={rooms}
                      language={language}
                      onSelectProduct={() =>
                        handleOpenProductModal(room.id)
                      }
                      onOpenProductDetail={() =>
                        handleOpenProductDetailFromRoom(room.id)
                      }
                      currentConfigurator={
                        selectedConfigurators[
                          currentConfiguratorIndex
                        ]
                      }
                      serviceSearchTerm={
                        serviceSearchTerms[room.id] || ""
                      }
                      onServiceSearchTermChange={(searchTerm) =>
                        updateServiceSearchTerm(
                          room.id,
                          searchTerm,
                        )
                      }
                      onSearchClicked={() =>
                        handleRoomSearchClicked(room.id)
                      }
                    />
                  </div>

                  {/* Room Services - show for Vloer, Droogbouw, Verwijderen and Vloerverwarming configurators if room has surface, area and is not collapsed */}
                  {(selectedConfigurators[
                    currentConfiguratorIndex
                  ] === "Vloer" ||
                    selectedConfigurators[
                      currentConfiguratorIndex
                    ] === "Droogbouw" ||
                    selectedConfigurators[
                      currentConfiguratorIndex
                    ] === "Verwijderen" ||
                    selectedConfigurators[
                      currentConfiguratorIndex
                    ] === "Vloerverwarming") &&
                    room.surface &&
                    room.area > 0 &&
                    !room.collapsed && (
                      <div className="p-4 md:p-6 bg-[#2d472402]">
                        {/* Show message if search button hasn't been clicked yet */}
                        {!roomSearchClicked[room.id] ? (
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                            <p className="text-gray-500">
                              {
                                t.roomConfigurator
                                  .fillRoomDataAndSearch
                              }
                            </p>
                          </div>
                        ) : (
                          <ServiceTabs
                            rooms={rooms} // Pass all rooms for surface validation
                            currentRoomId={room.id} // Add current room ID to focus on this room
                            language={language}
                            services={services} // Pass all services for validation
                            onUpdateService={updateService}
                            onOpenServiceArticleDetail={
                              handleOpenServiceArticleDetail
                            }
                            collapsedOptionalSections={
                              collapsedOptionalSections
                            }
                            onToggleOptionalServiceCollapse={
                              toggleOptionalServiceCollapse
                            }
                            collapsedMandatorySections={
                              collapsedMandatorySections
                            }
                            onToggleMandatoryServiceCollapse={
                              toggleMandatoryServiceCollapse
                            }
                            currentConfigurator={
                              selectedConfigurators[
                                currentConfiguratorIndex
                              ]
                            }
                            serviceSearchTerm={
                              serviceSearchTerms[room.id] || ""
                            }
                          />
                        )}
                      </div>
                    )}
                </div>
              </div>
            </div>
          ))}

          {/* Bottom Add Room Button */}
          <div className="flex justify-start">
            <Button
              className="bg-[#2d4724] hover:bg-[#1f3319]"
              onClick={addRoom}
            >
              {t.addRoom}
            </Button>
          </div>

          {/* Totals Summary - Only for Vloer configurator */}
          {selectedConfigurators[currentConfiguratorIndex] ===
            "Vloer" && (
            <div className="border rounded-lg bg-white">
              {/* Totals Header */}
              <div className="bg-[#2d4724] text-white px-4 py-2 rounded-t-lg">
                <h2 className="text-lg">{t.totals.title}</h2>
              </div>

              {/* Totals Content */}
              <div className="p-4 md:p-6 bg-[#2d472402]">
                <TotalsSummary
                  rooms={rooms}
                  services={services}
                  language={language}
                />
              </div>
            </div>
          )}

          {/* Submit Button - Bottom Right - Always show for all configurators */}
          <div className="flex justify-end">
            <Button
              className="bg-[#2d4724] hover:bg-[#1f3319] px-8 py-2"
              onClick={handleSubmitOrder}
            >
              {t.submit}
            </Button>
          </div>
        </div>
      </div>

      {/* Product Selection Modal */}
      <Dialog
        open={showProductModal}
        onOpenChange={handleCloseProductModal}
      >
        <DialogContent className="!max-w-[85vw] !w-[85vw] !h-[85vh] p-0 rounded-xl shadow-2xl border-0">
          <DialogTitle className="sr-only">
            {t.productArticleSelection.title}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {t.productArticleSelection.selectOneProduct}
          </DialogDescription>
          <ProductArticleSelection
            onBack={handleCloseProductModal}
            onProceed={handleArticleSelection}
            onClose={handleCloseProductModal}
            language={language}
            isModal={true}
            currentConfigurator={selectedConfigurators[currentConfiguratorIndex]}
          />
        </DialogContent>
      </Dialog>

      {/* Area Exceeded Alert Dialog */}
      <AlertDialog
        open={showAreaExceededAlert}
        onOpenChange={setShowAreaExceededAlert}
      >
        <AlertDialogContent>
          <AlertDialogHeader className="text-center">
            <AlertDialogTitle>
              {language === "en"
                ? "Room Area Capacity Exceeded"
                : "Ruimte Oppervlakte Capaciteit Overschreden"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {alertMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => setShowAreaExceededAlert(false)}
            >
              {language === "en" ? "Understood" : "Begrepen"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Mandatory Removal Alert Dialog */}
      <AlertDialog
        open={showMandatoryRemovalAlert}
        onOpenChange={setShowMandatoryRemovalAlert}
      >
        <AlertDialogContent>
          <AlertDialogHeader className="text-center">
            <AlertDialogTitle>
              {language === "en"
                ? "Removal of existing floor required"
                : "Verwijderen van bestaande ondergrond verplicht"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {language === "en"
                ? "Removal of the existing subfloor is mandatory in combination with the selected product and installation method."
                : "Verwijderen van de bestaande ondergrond is verplicht in combinatie met het geselecteerde product en installatie."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => {
                setShowMandatoryRemovalAlert(false);
                setMandatoryRemovalAcknowledged(true);
              }}
            >
              {language === "en" ? "Understood" : "Begrepen"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Droogbouw Level Warning Alert Dialog */}
      <AlertDialog
        open={showDroogbouwLevelWarning}
        onOpenChange={setShowDroogbouwLevelWarning}
      >
        <AlertDialogContent>
          <AlertDialogHeader className="text-center">
            <AlertDialogTitle>
              {language === "en"
                ? "Dry build not possible on this floor"
                : "Droogbouw niet mogelijk op deze verdieping"}
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                {language === "en"
                  ? "Dry build installation is only possible on the ground floor, 1st floor, 2nd floor, or 3rd floor."
                  : "Droogbouw is alleen mogelijk op de begane grond, 1e verdieping, 2e verdieping of 3e verdieping."}
              </p>
              <p>
                {language === "en"
                  ? "For dry build installation, except on the ground floor, a crane is always required. A crane cannot reach the basement or higher than the 3rd floor."
                  : "Voor droogbouw is, anders dan op de begane grond, altijd een kraan nodig. Een kraan kan niet de kelder bereiken of hoger dan de 3e verdieping."}
              </p>
              {droogbouwWarningRoomIds.length > 0 && (
                <p className="font-semibold">
                  {language === "en"
                    ? `Please adjust the floor level for Room${droogbouwWarningRoomIds.length > 1 ? "s" : ""} ${droogbouwWarningRoomIds.join(", ")}.`
                    : `Pas de verdieping aan voor Ruimte${droogbouwWarningRoomIds.length > 1 ? "s" : ""} ${droogbouwWarningRoomIds.join(", ")}.`}
                </p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => {
                setShowDroogbouwLevelWarning(false);
                setDroogbouwWarningRoomIds([]);
              }}
            >
              {language === "en" ? "Understood" : "Begrepen"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Required Configurator Alert Dialog */}
      <AlertDialog
        open={showRequiredConfiguratorAlert}
        onOpenChange={setShowRequiredConfiguratorAlert}
      >
        <AlertDialogContent>
          <AlertDialogHeader className="text-center">
            <AlertDialogTitle>
              {language === "en"
                ? "Additional Configurator Required"
                : "Extra Configurator Verplicht"}
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                {language === "en"
                  ? "One or more selected services require an additional configurator to be opened."
                  : "Een of meerdere geselecteerde services vereisen dat een extra configurator wordt geopend."}
              </p>
              <div>
                <p className="font-semibold mb-2">
                  {language === "en"
                    ? "Required configurator(s):"
                    : "Verplichte configurator(en):"}
                </p>
                <ul className="list-disc list-inside pl-2">
                  {requiredConfigurators.map((configurator) => (
                    <li
                      key={configurator}
                      className="text-[#2d4724]"
                    >
                      {translateConfiguratorName(
                        configurator,
                        language,
                      )}
                    </li>
                  ))}
                </ul>
              </div>
              <p className="text-sm text-gray-600">
                {language === "en"
                  ? "These configurators will be started automatically after clicking OK."
                  : "Deze configuratoren worden automatisch gestart na het klikken op OK."}
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => {
                setShowRequiredConfiguratorAlert(false);

                // Check if we need to start the next configurator
                const nextIndex = currentConfiguratorIndex + 1;
                if (nextIndex < selectedConfigurators.length) {
                  const nextConfigurator =
                    selectedConfigurators[nextIndex];
                  console.log(
                    `🚀 Starting required configurator: ${nextConfigurator}`,
                  );

                  // Reset state for next configurator
                  setCurrentConfiguratorIndex(nextIndex);
                  setSelectedProductCategory(nextConfigurator);

                  // Check if we have filtered rooms for this configurator
                  const configuratorKey =
                    nextConfigurator.toLowerCase();
                  const filteredRoomsData =
                    sessionStorage.getItem(
                      `${configuratorKey}FilteredRooms`,
                    );

                  if (filteredRoomsData) {
                    const filteredRoomIds = JSON.parse(
                      filteredRoomsData,
                    );
                    console.log(
                      `📍 Applying room filter for ${nextConfigurator}:`,
                      filteredRoomIds,
                    );

                    // Filter rooms: only show rooms that need this configurator
                    setRooms((prev) =>
                      prev.map((room) => {
                        if (filteredRoomIds.includes(room.id)) {
                          // Keep this room visible and reset product selection
                          return {
                            ...room,
                            product: undefined,
                            selectedProduct: undefined,
                            collapsed: false,
                          };
                        } else {
                          // Mark room as collapsed (hidden) for this configurator
                          return {
                            ...room,
                            product: undefined,
                            selectedProduct: undefined,
                            collapsed: true,
                          };
                        }
                      }),
                    );

                    // Clear the session storage
                    sessionStorage.removeItem(
                      `${configuratorKey}FilteredRooms`,
                    );
                  } else {
                    // No filter: show all rooms and reset product selections
                    setRooms((prev) =>
                      prev.map((room) => ({
                        ...room,
                        product: undefined,
                        selectedProduct: undefined,
                        collapsed: false,
                      })),
                    );
                  }

                  setServices([]);

                  // Go back to configurator screen
                  setCurrentScreen("configurator");

                  // Show notification with dialog
                  const currentConfigurator =
                    selectedConfigurators[
                      currentConfiguratorIndex
                    ];
                  setNextConfiguratorMessage({
                    current: translateConfiguratorName(
                      currentConfigurator,
                      language,
                    ),
                    next: translateConfiguratorName(
                      nextConfigurator,
                      language,
                    ),
                  });
                  setShowNextConfiguratorDialog(true);
                }
              }}
            >
              {language === "en"
                ? "OK, Start Configurator"
                : "OK, Start Configurator"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Extra Configurator Dialog */}
      <Dialog
        open={showExtraConfiguratorDialog}
        onOpenChange={setShowExtraConfiguratorDialog}
      >
        <DialogContent className="max-w-2xl">
          <DialogTitle className="text-center">
            {language === "nl"
              ? "Nog een configurator toevoegen?"
              : "Add another configurator?"}
          </DialogTitle>
          <DialogDescription>
            <div className="space-y-4">
              <p className="text-center">
                {language === "nl"
                  ? "U heeft de configuratie voltooid."
                  : "You have completed the configuration."}
              </p>
              <p className="font-semibold text-center">
                {language === "nl"
                  ? "Wilt u nog een configurator starten voor dezelfde order?"
                  : "Would you like to start another configurator for the same order?"}
              </p>

              <div className="mt-4">
                <p className="mb-2">
                  {language === "nl"
                    ? "Selecteer extra configuratoren:"
                    : "Select additional configurators:"}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    "Droogbouw",
                    "Raamdecoratie",
                    "Trap",
                    "Verwijderen",
                    "Vloer",
                    "Vloerverwarming",
                  ]
                    .filter(
                      (c) => !selectedConfigurators.includes(c),
                    )
                    .map((configurator) => (
                      <label
                        key={configurator}
                        className="flex items-center space-x-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={tempAdditionalConfigurators.includes(
                            configurator,
                          )}
                          onChange={() =>
                            handleToggleAdditionalConfigurator(
                              configurator,
                            )
                          }
                          className="w-4 h-4"
                        />
                        <span>{configurator}</span>
                      </label>
                    ))}
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  onClick={
                    handleContinueWithoutExtraConfigurators
                  }
                  variant="outline"
                  className="flex-1"
                >
                  {language === "nl"
                    ? "Nee, order voltooien"
                    : "No, complete order"}
                </Button>
                <Button
                  onClick={handleAddExtraConfigurators}
                  variant="outline"
                  className="flex-1 border-[#2d4724] text-[#2d4724] hover:bg-[#2d4724] hover:text-white whitespace-normal h-auto py-3 px-4"
                >
                  {language === "nl"
                    ? "Ja, configuratoren toevoegen"
                    : "Yes, add configurators"}
                </Button>
              </div>
            </div>
          </DialogDescription>
        </DialogContent>
      </Dialog>

      {/* Next Configurator Dialog */}
      <Dialog
        open={showNextConfiguratorDialog}
        onOpenChange={setShowNextConfiguratorDialog}
      >
        <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden">
          <div className="bg-[#2d4724] text-white px-6 py-4 text-center">
            <DialogTitle className="text-white m-0">
              {language === "nl"
                ? `${nextConfiguratorMessage.current} configurator voltooid! Nu starten met ${nextConfiguratorMessage.next} configurator.`
                : `${nextConfiguratorMessage.current} configurator completed! Now starting ${nextConfiguratorMessage.next} configurator.`}
            </DialogTitle>
          </div>
          <DialogDescription asChild>
            <div className="px-6 py-6">
              <div className="flex justify-center">
                <Button
                  onClick={() =>
                    setShowNextConfiguratorDialog(false)
                  }
                  variant="outline"
                  className="border-[#2d4724] text-[#2d4724] hover:bg-[#2d4724] hover:text-white px-12 py-3"
                >
                  OK
                </Button>
              </div>
            </div>
          </DialogDescription>
        </DialogContent>
      </Dialog>

      {/* Completion Dialog - Nieuwe configurator of stoppen? */}
      <Dialog
        open={showCompletionDialog}
        onOpenChange={setShowCompletionDialog}
      >
        <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden">
          <div className="bg-[#2d4724] text-white px-6 py-4 text-center">
            <DialogTitle className="text-white m-0">
              {language === "nl"
                ? "Configuratie voltooid!"
                : "Configuration completed!"}
            </DialogTitle>
          </div>
          <DialogDescription asChild>
            <div className="px-6 py-6 space-y-6">
              <div className="text-gray-900 text-lg text-center">
                {language === "nl"
                  ? "U heeft alle geselecteerde configuratoren voltooid. Wilt u een nieuwe configurator opstarten of wilt u stoppen?"
                  : "You have completed all selected configurators. Would you like to start a new configurator or stop?"}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  onClick={handleStopAfterCompletion}
                  variant="outline"
                  className="flex-1 border-[#2d4724] text-[#2d4724] hover:bg-[#2d4724] hover:text-white whitespace-normal h-auto py-3 px-4"
                >
                  {language === "nl" ? "Stoppen" : "Stop"}
                </Button>
                <Button
                  onClick={
                    handleStartNewConfiguratorAfterCompletion
                  }
                  className="flex-1 bg-[#2d4724] hover:bg-[#1f3319] text-white whitespace-normal h-auto py-3 px-4"
                >
                  {language === "nl"
                    ? "Nieuwe configurator opstarten"
                    : "Start new configurator"}
                </Button>
              </div>
            </div>
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </div>
  );
}