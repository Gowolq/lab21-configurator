import { useState, useEffect } from "react";
import { AlertTriangle, Info, Copy, Trash2, ChevronDown } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { Checkbox } from "./ui/checkbox";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";
import { useTranslation } from "../utils/translations";
import { validateServiceArea } from "../utils/serviceValidation";
import { LegserviceArticle, getArticlesByProductCodes, legserviceArticles } from "../utils/legserviceArticles";
import { PlintProductSelection } from "./PlintProductSelection";
import { MatProductSelection } from "./MatProductSelection";
import { PlintProduct, extractServiceCode } from "../utils/plintProducts";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";

interface Room {
  id: number;
  level: string;
  roomName: string;
  surface: string;
  area: number;
  product?: string;
  selectedProduct?: {
    surface?: string;
    legmethode?: string;
    legpatroon?: string;
    typeVloerverwarming?: string;
    [key: string]: any;
  };
  collapsed?: boolean;
}

interface ServiceState {
  roomId: number;
  serviceType: string;
  serviceTitle: string;
  area: number;
  isActive: boolean;
  isMandatory: boolean;
  selectedFloors?: string[]; // For voorbereiden services - which floors are selected
  selectedPlintProduct?: PlintProduct; // For binnenhoekverstek service - selected plint product
  selectedOptionalMatProducts?: Array<{product: LegserviceArticle, quantity: number, length?: number, width?: number}>; // For mat services - selected optional mat products
  underfloorHeatingExecution?: string; // For voorbereiden services - underfloor heating execution option
  length?: number; // For L/B berekening articles - length in meters
  width?: number; // For L/B berekening articles - width in meters
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

interface ServiceSectionProps {
  title: string;
  surface?: string;
  area?: string;
  type?: string;
  roomId?: number;
  language?: string;
  serviceType?: string;
  isMandatory?: boolean;
  onDelete?: () => void;
  rooms?: Room[];
  services?: ServiceState[];
  onAreaChange?: (newArea: number) => void;
  onUpdateService?: (roomId: number, serviceType: string, serviceTitle: string, updates: any) => void;
  onOpenServiceArticleDetail?: (article: LegserviceArticle) => void;
  article?: LegserviceArticle;
  legserviceMeters?: number;
  onLegserviceMetersChange?: (meters: number) => void;
  isContainerService?: boolean;
  containerDescription?: string;
  tooltip?: string;
  currentRoom?: Room;
  disabled?: boolean;
  relationData?: RelationData;
  tabColor?: string; // Color of the section/tab
  isFollowupService?: boolean; // Indicates if this is a follow-up (vervolg) service
}

export function ServiceSection({ 
  title, 
  surface = "Zandcement", 
  area = "60", 
  type = "Verplicht",
  roomId,
  language = "nl",
  serviceType = "legservice",
  isMandatory = false,
  legserviceMeters = 0,
  onLegserviceMetersChange,
  onDelete,
  rooms = [],
  services = [],
  onAreaChange,
  onUpdateService,
  onOpenServiceArticleDetail,
  article,
  isContainerService = false,
  containerDescription,
  tooltip,
  currentRoom,
  disabled = false,
  relationData,
  tabColor = "#2d4724", // Default to main green color
  isFollowupService = false
}: ServiceSectionProps) {
  const t = useTranslation(language);
  
  // State for conversion popup warning
  const [showConversionWarning, setShowConversionWarning] = useState(false);
  const [conversionWarningData, setConversionWarningData] = useState<{
    productCode: string;
    enteredValue: number;
    calculatedValue: number;
    omrekenfactor: number;
  } | null>(null);
  
  // State to track user-entered values for conversion products
  const [userEnteredConversionValues, setUserEnteredConversionValues] = useState<Record<string, number>>({});
  
  // Helper function to translate product values
  const translateProductValue = (key: string, value: string): string => {
    if (language === 'nl') return value;
    
    // Check if value contains semicolons (multiple values)
    if (value.includes(';')) {
      const values = value.split(';').map(v => v.trim());
      const translatedValues = values.map(v => {
        if (t.productValues && t.productValues[key as keyof typeof t.productValues]) {
          const mapping = t.productValues[key as keyof typeof t.productValues] as Record<string, string>;
          return mapping[v] || v;
        }
        return v;
      });
      return translatedValues.join('; ');
    }
    
    // Check if translation exists in productValues
    if (t.productValues && t.productValues[key as keyof typeof t.productValues]) {
      const mapping = t.productValues[key as keyof typeof t.productValues] as Record<string, string>;
      return mapping[value] || value;
    }
    
    return value;
  };
  
  // Helper function to translate array values
  const translateArrayValues = (key: string, values: string[]): string[] => {
    if (language === 'nl') return values;
    
    return values.map(value => {
      if (t.productValues && t.productValues[key as keyof typeof t.productValues]) {
        const mapping = t.productValues[key as keyof typeof t.productValues] as Record<string, string>;
        return mapping[value] || value;
      }
      return value;
    });
  };
  
  // Get the minimum quantity from article (prefer aantalMinimum, fallback to van)
  const getMinimumQuantity = (): number => {
    if (article?.aantalMinimum !== undefined) {
      return article.aantalMinimum;
    }
    if (article?.van !== undefined) {
      return article.van;
    }
    return 0;
  };
  
  // Initialize area state based on service type
  // For mandatory services: use whichever is higher (room area or article minimum)
  // For optional services, check if service exists in services array, otherwise start with 0
  // For fixed calculation (Stuk): use aantalMinimum value
  const getInitialArea = () => {
    // Check if this is a fixed calculation service (Stuk)
    if (article?.berekening === 'Stuk' && article?.aantalMinimum !== undefined) {
      return article.aantalMinimum.toString();
    }
    
    // First check if this service already exists in the services array
    if (roomId !== undefined && services.length > 0) {
      const existingService = services.find(s => 
        s.roomId === roomId && 
        s.serviceType === serviceType && 
        s.serviceTitle === title
      );
      if (existingService && existingService.area > 0) {
        // Ensure existing service area is not below minimum
        const minimumQty = getMinimumQuantity();
        if (minimumQty > 0 && existingService.area < minimumQty) {
          return minimumQty.toString();
        }
        return existingService.area.toString();
      }
    }
    
    // If not found in services, use default logic
    if (isMandatory) {
      const roomArea = parseFloat(area) || 0;
      const minimumQty = getMinimumQuantity();
      
      // Use the higher of room area or minimum quantity
      if (minimumQty > 0 && roomArea < minimumQty) {
        return minimumQty.toString();
      }
      return area;
    }
    return "0";
  };
  const initialArea = getInitialArea();
  const [currentArea, setCurrentArea] = useState(initialArea);
  const [validationError, setValidationError] = useState<string>("");
  const [shouldHide, setShouldHide] = useState(false);
  const [infoExpanded, setInfoExpanded] = useState(false); // Collapsible info section - default closed
  
  // Initialize container quantity from services if it exists
  const getInitialContainerQuantity = () => {
    if (roomId !== undefined && services.length > 0) {
      const existingService = services.find(s => 
        s.roomId === roomId && 
        s.serviceType === serviceType && 
        s.serviceTitle === title
      );
      if (existingService && existingService.area > 0) {
        return existingService.area.toString();
      }
    }
    return "0";
  };
  const [containerQuantity, setContainerQuantity] = useState<string>(getInitialContainerQuantity());
  const [isChecked, setIsChecked] = useState(false); // For checkbox services
  
  // Initialize selected floors from services if it exists (for voorbereiden services)
  const getInitialSelectedFloors = () => {
    if (roomId !== undefined && services.length > 0 && serviceType === 'voorbereiden') {
      const existingService = services.find(s => 
        s.roomId === roomId && 
        s.serviceType === serviceType && 
        s.serviceTitle === title
      );
      if (existingService && existingService.selectedFloors) {
        return existingService.selectedFloors;
      }
    }
    return [];
  };
  const [selectedFloors, setSelectedFloors] = useState<string[]>(getInitialSelectedFloors());

  // Initialize underfloor heating execution from services if it exists (for voorbereiden services)
  const getInitialUnderfloorHeatingExecution = () => {
    if (roomId !== undefined && services.length > 0 && serviceType === 'voorbereiden') {
      const existingService = services.find(s => 
        s.roomId === roomId && 
        s.serviceType === serviceType && 
        s.serviceTitle === title
      );
      if (existingService && (existingService as any).underfloorHeatingExecution) {
        return (existingService as any).underfloorHeatingExecution;
      }
    }
    return 'NVT (bestaand)'; // Default value
  };
  const [underfloorHeatingExecution, setUnderfloorHeatingExecution] = useState<string>(getInitialUnderfloorHeatingExecution());

  // State for dependency popup
  const [showDependencyPopup, setShowDependencyPopup] = useState(false);
  const [dependencyArticles, setDependencyArticles] = useState<LegserviceArticle[]>([]);
  const [pendingQuantity, setPendingQuantity] = useState<number>(0);
  const [dependencyArticleQuantities, setDependencyArticleQuantities] = useState<Record<string, string>>({});
  const [dependencySearchQuery, setDependencySearchQuery] = useState<string>("");
  
  // State for optional choice dependency popup (keuzeServicesOptional)
  const [showOptionalChoicePopup, setShowOptionalChoicePopup] = useState(false);
  const [optionalChoiceArticles, setOptionalChoiceArticles] = useState<LegserviceArticle[]>([]);
  const [optionalChoiceSearchQuery, setOptionalChoiceSearchQuery] = useState<string>("");

  // State for plint product selector popup
  const [showPlintProductSelector, setShowPlintProductSelector] = useState(false);

  // State for L/B (Lengte/Breedte) popup
  const [showLBPopup, setShowLBPopup] = useState(false);
  
  // Initialize L/B values from existing service if available
  const getInitialLBLength = () => {
    if (roomId !== undefined && services.length > 0) {
      const existingService = services.find(s => 
        s.roomId === roomId && 
        s.serviceType === serviceType && 
        s.serviceTitle === title
      );
      if (existingService && existingService.length) {
        return existingService.length.toString();
      }
    }
    return '';
  };
  
  const getInitialLBWidth = () => {
    if (roomId !== undefined && services.length > 0) {
      const existingService = services.find(s => 
        s.roomId === roomId && 
        s.serviceType === serviceType && 
        s.serviceTitle === title
      );
      if (existingService && existingService.width) {
        return existingService.width.toString();
      }
    }
    return '';
  };
  
  const [lbLength, setLbLength] = useState<string>(getInitialLBLength());
  const [lbWidth, setLbWidth] = useState<string>(getInitialLBWidth());
  const [pendingLBArea, setPendingLBArea] = useState<string>('0');
  
  // Initialize selected plint product from services if it exists
  const getInitialPlintProduct = () => {
    if (roomId !== undefined && services.length > 0) {
      const existingService = services.find(s => 
        s.roomId === roomId && 
        s.serviceType === serviceType && 
        s.serviceTitle === title
      );
      if (existingService && (existingService as any).selectedPlintProduct) {
        return (existingService as any).selectedPlintProduct;
      }
    }
    return null;
  };
  const [selectedPlintProduct, setSelectedPlintProduct] = useState<PlintProduct | null>(getInitialPlintProduct());

  // Initialize selected optional mat products from services if they exist
  const getInitialOptionalMatProducts = () => {
    if (roomId !== undefined && services.length > 0) {
      const existingService = services.find(s => 
        s.roomId === roomId && 
        s.serviceType === serviceType && 
        s.serviceTitle === title
      );
      if (existingService && (existingService as any).selectedOptionalMatProducts) {
        return (existingService as any).selectedOptionalMatProducts;
      }
    }
    return [];
  };
  const [selectedOptionalMatProducts, setSelectedOptionalMatProducts] = useState<Array<{product: LegserviceArticle, quantity: number, length?: number, width?: number}>>(getInitialOptionalMatProducts());

  // Sync selectedOptionalMatProducts with services prop to prevent data loss
  useEffect(() => {
    if (roomId !== undefined && services.length > 0) {
      const existingService = services.find(s => 
        s.roomId === roomId && 
        s.serviceType === serviceType && 
        s.serviceTitle === title
      );
      if (existingService && (existingService as any).selectedOptionalMatProducts) {
        const existingMatProducts = (existingService as any).selectedOptionalMatProducts;
        // Only update if different from current state
        if (JSON.stringify(existingMatProducts) !== JSON.stringify(selectedOptionalMatProducts)) {
          setSelectedOptionalMatProducts(existingMatProducts);
        }
      }
    }
  }, [services, roomId, serviceType, title]);

  // DEBUG: Monitor showDependencyPopup state changes
  useEffect(() => {
    console.log('🔔 showDependencyPopup state changed to:', showDependencyPopup);
  }, [showDependencyPopup]);
  
  // Filter dependency articles based on search query
  const filteredDependencyArticles = dependencyArticles.filter(article => {
    if (!dependencySearchQuery.trim()) return true;
    
    const searchLower = dependencySearchQuery.toLowerCase();
    return (
      article.productCode.toLowerCase().includes(searchLower) ||
      article.description.toLowerCase().includes(searchLower)
    );
  });
  
  // Filter optional choice articles based on search query
  const filteredOptionalChoiceArticles = optionalChoiceArticles.filter(article => {
    if (!optionalChoiceSearchQuery.trim()) return true;
    
    const searchLower = optionalChoiceSearchQuery.toLowerCase();
    return (
      article.productCode.toLowerCase().includes(searchLower) ||
      article.description.toLowerCase().includes(searchLower)
    );
  });
  
  // TEMPORARILY DISABLED - Real-time meters filtering effect for legservice
  useEffect(() => {
    // Service filtering disabled - always show all services
    setShouldHide(false);
  }, [legserviceMeters, currentArea, article, serviceType, title, isMandatory]);
  
  // Surface state
  const getSurfaceKeyFromDisplayName = (displayName: string) => {
    const surfaceEntry = Object.entries(t.surfaces).find(([key, displayValue]) => 
      displayValue === displayName
    );
    return surfaceEntry ? surfaceEntry[0] : "beton";
  };
  
  const getExistingFloorKeyFromDisplayName = (displayName: string) => {
    const floorEntry = Object.entries(t.existingFloors).find(([key, displayValue]) => 
      displayValue === displayName
    );
    return floorEntry ? floorEntry[0] : "laminaat";
  };
  
  const [selectedSurface, setSelectedSurface] = useState<string>(() => {
    if (type === "Extra configurator") {
      return getExistingFloorKeyFromDisplayName(surface || "");
    }
    return getSurfaceKeyFromDisplayName(surface || "");
  });
  
  // Update area when room area changes for mandatory services only
  // Enforce article minimum quantity (from aantalMinimum or van)
  useEffect(() => {
    if (isMandatory) {
      const roomArea = parseFloat(area) || 0;
      const minimumQty = getMinimumQuantity();
      
      // Use the higher of room area or minimum quantity
      if (minimumQty > 0 && roomArea < minimumQty) {
        setCurrentArea(minimumQty.toString());
      } else {
        setCurrentArea(area);
      }
    }
  }, [area, isMandatory, article]);

  // Update local state from services when they change (e.g., when navigating back)
  useEffect(() => {
    if (roomId !== undefined && services.length > 0) {
      const existingService = services.find(s => 
        s.roomId === roomId && 
        s.serviceType === serviceType && 
        s.serviceTitle === title
      );
      if (existingService) {
        const serviceArea = existingService.area.toString();
        
        // Update area for standard services
        if (!isContainerService && serviceType !== 'vloerverwarming') {
          if (!isMandatory && serviceArea !== currentArea) {
            setCurrentArea(serviceArea);
          }
        }
        
        // Update container quantity for container services
        if (isContainerService || (serviceType === 'vloerverwarming' && !isMandatory)) {
          if (serviceArea !== containerQuantity) {
            setContainerQuantity(serviceArea);
          }
        }
        
        // Update selected floors for voorbereiden services
        if (serviceType === 'voorbereiden' && existingService.selectedFloors) {
          const floorsChanged = JSON.stringify(existingService.selectedFloors) !== JSON.stringify(selectedFloors);
          if (floorsChanged) {
            setSelectedFloors(existingService.selectedFloors);
          }
        }

        // Update underfloor heating execution for voorbereiden services
        if (serviceType === 'voorbereiden' && (existingService as any).underfloorHeatingExecution) {
          const existingExecution = (existingService as any).underfloorHeatingExecution;
          if (existingExecution !== underfloorHeatingExecution) {
            setUnderfloorHeatingExecution(existingExecution);
          }
        }

        // Update selected plint product for binnenhoekverstek service
        if ((existingService as any).selectedPlintProduct) {
          const existingProduct = (existingService as any).selectedPlintProduct;
          if (!selectedPlintProduct || selectedPlintProduct.productCode !== existingProduct.productCode) {
            setSelectedPlintProduct(existingProduct);
          }
        }

        // Update selected optional mat products
        if ((existingService as any).selectedOptionalMatProducts) {
          const existingProducts = (existingService as any).selectedOptionalMatProducts;
          console.log('🔥 SYNCING selectedOptionalMatProducts from global state:', {
            serviceTitle: title,
            existingProducts,
            currentLocal: selectedOptionalMatProducts
          });
          if (JSON.stringify(existingProducts) !== JSON.stringify(selectedOptionalMatProducts)) {
            setSelectedOptionalMatProducts(existingProducts);
          }
        } else {
          // If service exists but has NO selectedOptionalMatProducts, check if we should clear local state
          if (selectedOptionalMatProducts.length > 0) {
            console.log('⚠️ WARNING: Service exists in global state but has NO selectedOptionalMatProducts!', {
              serviceTitle: title,
              currentLocal: selectedOptionalMatProducts,
              globalService: existingService
            });
          }
        }
      }
    }
  }, [services, roomId, serviceType, title]);

  // Update service when selectedOptionalMatProducts changes
  useEffect(() => {
    if (onUpdateService && roomId !== undefined && parseFloat(containerQuantity) > 0) {
      // Only update if we have selected products
      if (selectedOptionalMatProducts.length > 0) {
        onUpdateService(roomId, serviceType, title, {
          area: parseFloat(containerQuantity) || 0,
          isActive: true,
          isMandatory: false,
          selectedPlintProduct: selectedPlintProduct, // Preserve plint products
          selectedOptionalMatProducts: selectedOptionalMatProducts
        });
      }
    }
  }, [selectedOptionalMatProducts]);

  // Sync containerQuantity with service area
  useEffect(() => {
    if (roomId !== undefined && services.length > 0) {
      const existingService = services.find(s => 
        s.roomId === roomId && 
        s.serviceType === serviceType && 
        s.serviceTitle === title
      );
      if (existingService && existingService.area > 0) {
        const areaStr = existingService.area.toString();
        if (containerQuantity !== areaStr) {
          setContainerQuantity(areaStr);
        }
      }
    }
  }, [services, roomId, serviceType, title]);

  // Handle container quantity change
  const handleContainerQuantityChange = (value: string) => {
    console.log('🚀 handleContainerQuantityChange CALLED with value:', value);
    
    // Remove leading zeros
    const cleanedValue = value.replace(/^0+(?=\\d)/, '');
    const numericValue = parseInt(cleanedValue) || 0;
    
    // Update the local state
    setContainerQuantity(cleanedValue);
    
    if (onUpdateService && roomId !== undefined) {
      onUpdateService(roomId, serviceType, title, { 
        area: numericValue,
        isActive: numericValue > 0,
        isMandatory: false,
        isSelected: numericValue > 0,
        isExtraConfiguratorService: type === "Extra configurator",
        selectedPlintProduct: selectedPlintProduct,
        selectedOptionalMatProducts: selectedOptionalMatProducts.length > 0 ? selectedOptionalMatProducts : undefined
      });
    }
  };

  // Handle plint product selection
  const handlePlintProductSelect = (product: PlintProduct, quantity: number) => {
    setSelectedPlintProduct(product);
    setShowPlintProductSelector(false);
    // DON'T set the binnenhoekverstek quantity - plint quantity is separate!
    // The binnenhoekverstek quantity stays independent
    if (onUpdateService && roomId !== undefined) {
      onUpdateService(roomId, serviceType, title, { 
        area: parseFloat(containerQuantity) || 0, // Keep current binnenhoekverstek quantity
        isActive: true,
        isMandatory: false,
        isSelected: true,
        isExtraConfiguratorService: type === "Extra configurator",
        selectedPlintProduct: product,
        selectedOptionalMatProducts: selectedOptionalMatProducts.length > 0 ? selectedOptionalMatProducts : undefined
      });
    }
  };

  // Handle plint product removal
  const handleRemovePlintProduct = () => {
    setSelectedPlintProduct(null);
    if (onUpdateService && roomId !== undefined) {
      onUpdateService(roomId, serviceType, title, { 
        area: parseFloat(containerQuantity) || 0, // Keep current binnenhoekverstek quantity
        isActive: parseFloat(containerQuantity) > 0,
        isMandatory: false,
        isSelected: parseFloat(containerQuantity) > 0,
        isExtraConfiguratorService: type === "Extra configurator",
        selectedPlintProduct: null,
        selectedOptionalMatProducts: selectedOptionalMatProducts.length > 0 ? selectedOptionalMatProducts : undefined
      });
    }
  };

  // Handle Enter key press for container services - check dependencies
  const handleContainerKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const numericValue = parseInt(containerQuantity) || 0;
      
      console.log('🔍 Enter pressed - Container quantity:', {
        title,
        numericValue,
        hasArticle: !!article,
        articleProductCode: article?.productCode,
        verplichtServices: article?.verplichtServices,
        currentServices: services.filter(s => s.roomId === roomId)
      });
      
      // Check if this article has dependencies (verplichtServices)
      if (article?.verplichtServices && article.verplichtServices.length > 0 && numericValue > 0) {
        console.log('✅ Article has dependencies, checking if dependency already exists...');
        
        // Get the required articles
        const requiredArticles = getArticlesByProductCodes(article.verplichtServices);
        console.log('📦 Required articles:', requiredArticles);
        
        if (requiredArticles.length > 0) {
          // Check if ALL dependency services already exist with the SAME quantity
          const allDependenciesExist = requiredArticles.every(depArticle => {
            const depServiceTitle = `${depArticle.productCode} - ${depArticle.description}`;
            const existingDep = services.find(s => 
              s.roomId === roomId && 
              s.serviceTitle === depServiceTitle &&
              s.area === numericValue
            );
            console.log(`Checking dependency ${depArticle.productCode}:`, existingDep ? 'EXISTS with same quantity' : 'MISSING or different quantity');
            return existingDep !== undefined;
          });
          
          if (!allDependenciesExist) {
            // Show popup - dependencies are missing or have different quantities
            console.log('🎉 Showing dependency popup - dependencies missing or quantity changed!');
            setDependencyArticles(requiredArticles);
            setPendingQuantity(numericValue);
            setShowDependencyPopup(true);
          } else {
            console.log('✅ All dependencies already exist with correct quantity, no popup needed');
          }
        }
      }
    }
  };

  // Handle Enter key press for area services - check dependencies
  const handleAreaKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent form submission or other default behaviors
      checkDependenciesForAreaService();
    }
  };

  // Handle blur event for area services - check dependencies when clicking outside
  const handleAreaBlur = () => {
    checkDependenciesForAreaService();
  };

  // Shared function to check dependencies for area services
  const checkDependenciesForAreaService = () => {
    const numericValue = parseFloat(currentArea) || 0;
    
    console.log('🔍 Checking dependencies - Area:', {
      title,
      numericValue,
      hasArticle: !!article,
      articleProductCode: article?.productCode,
      verplichtServices: article?.verplichtServices,
      keuzeServicesOptional: article?.keuzeServicesOptional,
      currentServices: services.filter(s => s.roomId === roomId)
    });
    
    // Check if this article has dependencies (verplichtServices)
    if (article?.verplichtServices && article.verplichtServices.length > 0 && numericValue > 0) {
      console.log('✅ Article has dependencies, checking if dependency already exists...');
      
      // Get the required articles
      const requiredArticles = getArticlesByProductCodes(article.verplichtServices);
      console.log('📦 Required articles:', requiredArticles);
      
      if (requiredArticles.length > 0) {
        // Check if ALL dependency services already exist with the SAME quantity
        const allDependenciesExist = requiredArticles.every(depArticle => {
          const depServiceTitle = `${depArticle.productCode} - ${depArticle.description}`;
          const existingDep = services.find(s => 
            s.roomId === roomId && 
            s.serviceTitle === depServiceTitle &&
            s.area === numericValue
          );
          console.log(`Checking dependency ${depArticle.productCode}:`, existingDep ? 'EXISTS with same quantity' : 'MISSING or different quantity');
          return existingDep !== undefined;
        });
        
        if (!allDependenciesExist) {
          // Show popup - dependencies are missing or have different quantities
          console.log('🎉 Showing dependency popup - dependencies missing or quantity changed!');
          setDependencyArticles(requiredArticles);
          setPendingQuantity(numericValue);
          setShowDependencyPopup(true);
          return; // Exit early - don't check optional choices yet
        } else {
          console.log('✅ All dependencies already exist with correct quantity, no popup needed');
        }
      }
    }
    
    // Check if this article has optional choice dependencies (keuzeServicesOptional)
    if (article?.keuzeServicesOptional && article.keuzeServicesOptional.length > 0 && numericValue > 0) {
      console.log('✅ Article has optional choice dependencies...');
      console.log('📋 Article details:', {
        productCode: article.productCode,
        configuratorName: article.configuratorName,
        category: article.category,
        subcategorie: article.subcategorie,
        isMandatory: article.isMandatory,
        keuzeServicesOptional: article.keuzeServicesOptional
      });
      
      // Get ALL articles with the same configuratorName and category (Accessoires)
      // This shows all available options instead of just the ones in keuzeServicesOptional
      // Filter by either Hulpmaterialen OR Accessoires subcategorie
      console.log('🔍 Filtering legserviceArticles. Total articles:', legserviceArticles.length);
      console.log('🔍 Looking for articles with:', {
        configuratorName: article.configuratorName,
        category: 'Accessoires',
        subcategorie: 'Hulpmaterialen OR Accessoires',
        isMandatory: false
      });
      
      // Log a few sample articles to see their structure
      console.log('📝 Sample legserviceArticles (first 5):', legserviceArticles.slice(0, 5).map(a => ({
        productCode: a.productCode,
        configuratorName: a.configuratorName,
        category: a.category,
        subcategorie: a.subcategorie,
        isMandatory: a.isMandatory
      })));
      
      const allAccessoryArticles = legserviceArticles.filter(a => {
        // Check if this article is in the keuzeServicesOptional list
        const isInOptionalList = article.keuzeServicesOptional?.includes(a.productCode);
        
        // For articles with specific keuzeServicesOptional list, only show those
        // Otherwise, filter by configuratorName and category
        const matches = isInOptionalList || (
          a.configuratorName === article.configuratorName &&
          a.category === 'Accessoires' &&
          (a.subcategorie === 'Hulpmaterialen' || a.subcategorie === 'Accessoires') &&
          a.isMandatory === false &&
          // Exclude follow-up articles (like 861202) from initial list
          a.productCode !== '861202'
        );
        
        if (a.productCode === '4944250419' || a.productCode === '4929130519' || a.productCode?.startsWith('XCX-')) {
          console.log('🧪 Testing article:', {
            productCode: a.productCode,
            isInOptionalList,
            configuratorName: a.configuratorName,
            matchesConfiguratorName: a.configuratorName === article.configuratorName,
            category: a.category,
            matchesCategory: a.category === 'Accessoires',
            subcategorie: a.subcategorie,
            matchesSubcategorie: a.subcategorie === 'Hulpmaterialen' || a.subcategorie === 'Accessoires',
            isMandatory: a.isMandatory,
            matchesIsMandatory: a.isMandatory === false,
            finalMatch: matches
          });
        }
        
        return matches;
      });
      
      console.log('📦 All available accessory articles for this configurator:', allAccessoryArticles);
      
      if (allAccessoryArticles.length > 0) {
        // Always show popup for accessory selection
        console.log('🎉 Showing popup with all available accessory articles!');
        setOptionalChoiceArticles(allAccessoryArticles);
        setShowOptionalChoicePopup(true);
      } else {
        console.log('⚠️ No accessory articles found!');
      }
    }
  };

  // Handle area change
  const handleAreaChange = (newAreaValue: string) => {
    // Remove leading zeros
    const cleanedValue = newAreaValue.replace(/^0+(?=\d)/, '');
    setCurrentArea(cleanedValue);
    let numericArea = parseFloat(cleanedValue) || 0;
    
    // Enforce minimum quantity from article (aantalMinimum or van)
    const minimumQty = getMinimumQuantity();
    if (minimumQty > 0 && numericArea > 0 && numericArea < minimumQty) {
      numericArea = minimumQty;
      setCurrentArea(minimumQty.toString());
    }
    
    // Check if article has Maat berekening and show popup
    if (article && article.berekening === "Maat" && numericArea > 0) {
      setPendingLBArea(cleanedValue);
      setShowLBPopup(true);
      return; // Don't update service yet, wait for Maat input
    }
    
    // Update legservice meters for filtering
    if (serviceType === 'legservice' && onLegserviceMetersChange) {
      onLegserviceMetersChange(numericArea);
    }
    
    // Validate area
    if (roomId && rooms.length > 0 && services.length > 0 && numericArea > 0) {
      const validation = validateServiceArea(
        roomId,
        serviceType,
        title,
        numericArea,
        rooms,
        services,
        language
      );
      
      if (!validation.isValid) {
        setValidationError(validation.message || "Area exceeds room capacity");
      } else {
        setValidationError("");
      }
    } else {
      setValidationError("");
    }
    
    // REMOVED: Dependency check - now only happens on Enter key press
    
    // Call callbacks
    if (onAreaChange) {
      onAreaChange(numericArea);
    }

    if (onUpdateService && roomId !== undefined) {
      onUpdateService(roomId, serviceType, title, { 
        area: numericArea,
        isActive: numericArea > 0,
        isMandatory: isMandatory, // Explicitly set isMandatory flag
        isSelected: !isMandatory && numericArea > 0, // Set isSelected for optional services
        isExtraConfiguratorService: type === "Extra configurator", // Track if this is from Extra Configurator section
        selectedPlintProduct: selectedPlintProduct, // Preserve plint products
        selectedOptionalMatProducts: selectedOptionalMatProducts.length > 0 ? selectedOptionalMatProducts : undefined // Preserve mat products
      });
    }
  };

  // Handle surface change
  const handleSurfaceChange = (value: string) => {
    setSelectedSurface(value);
    if (onUpdateService && roomId !== undefined) {
      onUpdateService(roomId, serviceType, title, {
        surface: value,
        isMandatory: isMandatory, // Preserve isMandatory flag
        isExtraConfiguratorService: type === "Extra configurator", // Track if this is from Extra Configurator section
        selectedPlintProduct: selectedPlintProduct, // Preserve plint products
        selectedOptionalMatProducts: selectedOptionalMatProducts.length > 0 ? selectedOptionalMatProducts : undefined // Preserve mat products
      });
    }
  };

  // Handle floor selection change (for voorbereiden services)
  const handleFloorToggle = (floor: string) => {
    const newSelectedFloors = selectedFloors.includes(floor)
      ? selectedFloors.filter(f => f !== floor)
      : [...selectedFloors, floor];
    
    setSelectedFloors(newSelectedFloors);
    
    if (onUpdateService && roomId !== undefined) {
      onUpdateService(roomId, serviceType, title, {
        selectedFloors: newSelectedFloors,
        isMandatory: isMandatory,
        isExtraConfiguratorService: type === "Extra configurator", // Track if this is from Extra Configurator section
        selectedPlintProduct: selectedPlintProduct, // Preserve plint products
        selectedOptionalMatProducts: selectedOptionalMatProducts.length > 0 ? selectedOptionalMatProducts : undefined // Preserve mat products
      });
    }
  };

  // Handle underfloor heating execution change (for voorbereiden services)
  const handleUnderfloorHeatingExecutionChange = (value: string) => {
    setUnderfloorHeatingExecution(value);
    
    if (onUpdateService && roomId !== undefined) {
      onUpdateService(roomId, serviceType, title, {
        underfloorHeatingExecution: value,
        isMandatory: isMandatory,
        isExtraConfiguratorService: type === "Extra configurator",
        selectedPlintProduct: selectedPlintProduct, // Preserve plint products
        selectedOptionalMatProducts: selectedOptionalMatProducts.length > 0 ? selectedOptionalMatProducts : undefined // Preserve mat products
      });
    }
  };

  // Handle copy room area to service area
  const handleCopyRoomArea = () => {
    console.log('Copy button clicked! Area prop:', area);
    const roomArea = parseFloat(area) || 0;
    console.log('Parsed room area:', roomArea);
    if (roomArea > 0) {
      // Respect minimum quantity
      const minimumQty = getMinimumQuantity();
      const areaToUse = (minimumQty > 0 && roomArea < minimumQty) ? minimumQty : roomArea;
      console.log('Calling handleAreaChange with:', areaToUse.toString());
      handleAreaChange(areaToUse.toString());
    } else {
      console.log('Room area is 0 or invalid, not copying');
    }
  };
  
  // Update surface when room surface changes
  useEffect(() => {
    if (type === "Extra configurator") {
      const newSurfaceKey = getExistingFloorKeyFromDisplayName(surface || "");
      setSelectedSurface(newSurfaceKey);
      // Also update service state when room surface changes
      if (onUpdateService && roomId !== undefined && newSurfaceKey) {
        onUpdateService(roomId, serviceType, title, {
          surface: newSurfaceKey,
          isMandatory: isMandatory,
          isExtraConfiguratorService: true,
          selectedPlintProduct: selectedPlintProduct, // Preserve plint products
          selectedOptionalMatProducts: selectedOptionalMatProducts.length > 0 ? selectedOptionalMatProducts : undefined // Preserve mat products
        });
      }
    } else {
      const newSurfaceKey = getSurfaceKeyFromDisplayName(surface || "");
      setSelectedSurface(newSurfaceKey);
      // Also update service state when room surface changes
      if (onUpdateService && roomId !== undefined && newSurfaceKey) {
        onUpdateService(roomId, serviceType, title, {
          surface: newSurfaceKey,
          isMandatory: isMandatory,
          isExtraConfiguratorService: type === "Extra configurator",
          selectedPlintProduct: selectedPlintProduct, // Preserve plint products
          selectedOptionalMatProducts: selectedOptionalMatProducts.length > 0 ? selectedOptionalMatProducts : undefined // Preserve mat products
        });
      }
    }
  }, [surface, t.surfaces, t.existingFloors, type]);

  // Handle checkbox change for vloerverwarming services
  const handleCheckboxChange = (checked: boolean) => {
    setIsChecked(checked);
    if (onUpdateService && roomId !== undefined) {
      onUpdateService(roomId, serviceType, title, {
        isActive: checked,
        isMandatory: isMandatory, // Preserve isMandatory flag
        isSelected: checked,
        isExtraConfiguratorService: type === "Extra configurator", // Track if this is from Extra Configurator section
        selectedPlintProduct: selectedPlintProduct, // Preserve plint products
        selectedOptionalMatProducts: selectedOptionalMatProducts.length > 0 ? selectedOptionalMatProducts : undefined // Preserve mat products
      });
    }
  };

  // Handle opening service article detail page
  const handleOpenArticleDetail = async () => {
    if (onOpenServiceArticleDetail) {
      if (article) {
        onOpenServiceArticleDetail(article);
        return;
      }
      
      // Create mock article for non-legservice items
      const [code, ...descParts] = title.split(' - ');
      const articleCode = code || title;
      const description = descParts.join(' - ');
      
      const articleData = {
        productCode: articleCode,
        description: description || title,
        serviceType: serviceType,
        isMandatory: type === t.serviceSection.mandatory,
        category: serviceType,
        hoofdcategorie: undefined,
        subcategorie: undefined,
        legmethode: undefined,
        legpatroon: undefined,
        typeVloerverwarming: undefined,
        geintegreerdeOndervloer: undefined,
        verdieping: undefined,
        ondergrond: undefined,
        van: undefined,
        tot: undefined
      };
      
      onOpenServiceArticleDetail(articleData);
    }
  };

  // Handle confirming dependency popup
  const handleConfirmDependencies = () => {
    // Add all required dependency services with their individual quantities
    dependencyArticles.forEach(depArticle => {
      if (onUpdateService && roomId !== undefined) {
        const articleKey = depArticle.productCode;
        const articleQuantity = parseInt(dependencyArticleQuantities[articleKey]) || 0;
        
        // Only add if quantity > 0
        if (articleQuantity > 0) {
          const serviceTitle = `${depArticle.productCode} - ${depArticle.description}`;
          onUpdateService(roomId, depArticle.serviceType, serviceTitle, { 
            area: articleQuantity, // Use individual article quantity
            isActive: true,
            isMandatory: false, // Choice services are not mandatory
            isSelected: true, // User selected this from the choice popup
            isExtraConfiguratorService: false
          });
        }
      }
    });

    // Close popup and reset state
    setShowDependencyPopup(false);
    setDependencyArticles([]);
    setPendingQuantity(0);
    setDependencyArticleQuantities({});
  };

  // Handle canceling dependency popup
  const handleCancelDependencies = () => {
    // Reset the input to previous value (0 or existing value)
    setCurrentArea(initialArea);
    setContainerQuantity(getInitialContainerQuantity());
    
    // Close popup and reset state
    setShowDependencyPopup(false);
    setDependencyArticles([]);
    setPendingQuantity(0);
    setDependencyArticleQuantities({});
  };

  // TEMPORARILY DISABLED - Hide component if meters filtering indicates it should not be shown
  // if (shouldHide) {
  //   return null;
  // }

  // DEBUG: Log component render info
  if (title.includes('AFWERKEN-10573')) {
    console.log('🎨 ServiceSection rendering AFWERKEN-10573:', {
      title,
      isContainerService,
      serviceType,
      isMandatory,
      article: article ? {
        productCode: article.productCode,
        verplichtServices: article.verplichtServices
      } : 'NO ARTICLE',
      willRenderAsContainer: isContainerService,
      willRenderAsStandardService: !isContainerService && serviceType !== "vloerverwarming"
    });
  }

  // Container service interface
  if (isContainerService) {
    // If plint product selector is active, show it inline
    if (showPlintProductSelector) {
      return (
        <div className="space-y-4">
          <PlintProductSelection
            serviceCode={extractServiceCode(title) || ""}
            onClose={() => {
              setShowPlintProductSelector(false);
              // Don't reset quantity - keep the user's input
            }}
            onSelect={handlePlintProductSelect}
            language={language}
            currentlySelected={selectedPlintProduct || undefined}
            parentServiceQuantity={parseFloat(containerQuantity) || 0}
          />
        </div>
      );
    }

    return (
      <>
        <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
          <div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleOpenArticleDetail}
                className="text-[#2d4724] hover:text-[#1f3319] underline text-sm text-left"
              >
                {title}
              </button>
              {article?.aanbevolen && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 whitespace-nowrap">
                  {language === 'nl' ? 'Aanbevolen' : 'Recommended'}
                </span>
              )}
            </div>
            {selectedPlintProduct && (
              <div className="text-xs text-green-700 font-medium mt-1">
                {language === 'nl' ? 'Geselecteerd product: ' : 'Selected product: '}
                {selectedPlintProduct.name} ({selectedPlintProduct.productCode})
              </div>
            )}
            {containerDescription && (
              <div className="text-xs text-gray-600 mt-1">
                {containerDescription}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="container-quantity" className="h-6 flex items-center">
                {t.serviceSection.piece}
              </Label>
              <Input 
                id="container-quantity" 
                type="number" 
                value={(() => {
                  // Check if we have a plint product with omrekenfactor
                  const omrekenfactor = selectedPlintProduct?.omrekenfactor || 1;
                  
                  if (omrekenfactor > 1 && containerQuantity && containerQuantity !== "0") {
                    // For conversion products, calculate and show converted value
                    const valueInOriginalUnit = parseFloat(containerQuantity);
                    const convertedValue = parseFloat((valueInOriginalUnit / omrekenfactor).toFixed(2));
                    
                    // Check if user has manually entered a different value
                    const userKey = `container_${serviceType}_${title}`;
                    const userEnteredValue = userEnteredConversionValues[userKey];
                    
                    // Show user-entered value if it exists, otherwise show calculated
                    return userEnteredValue !== undefined ? userEnteredValue : convertedValue;
                  }
                  
                  // For regular products, show normal value
                  return containerQuantity === "0" ? "" : containerQuantity;
                })()}
                onChange={(e) => {
                  const cleanedValue = e.target.value.replace(/^0+(?=\d)/, '');
                  const omrekenfactor = selectedPlintProduct?.omrekenfactor || 1;
                  
                  if (omrekenfactor > 1) {
                    // For conversion products
                    const inputValue = parseFloat(cleanedValue);
                    const userKey = `container_${serviceType}_${title}`;
                    
                    if (isNaN(inputValue) || cleanedValue === '') {
                      // Clear the user-entered value if input is cleared
                      setUserEnteredConversionValues(prev => {
                        const updated = {...prev};
                        delete updated[userKey];
                        return updated;
                      });
                      setContainerQuantity('0');
                      handleContainerQuantityChange('0');
                      return;
                    }
                    
                    // Store the user-entered value
                    setUserEnteredConversionValues(prev => ({
                      ...prev,
                      [userKey]: inputValue
                    }));
                    
                    // Calculate what the value should be based on conversion
                    const valueInOriginalUnit = inputValue * omrekenfactor;
                    const currentValueInOriginalUnit = parseFloat(containerQuantity) || 0;
                    const calculatedDisplayValue = parseFloat((currentValueInOriginalUnit / omrekenfactor).toFixed(2));
                    
                    // Check if entered value differs from the current calculated value
                    const tolerance = 0.01;
                    if (currentValueInOriginalUnit > 0 && Math.abs(inputValue - calculatedDisplayValue) > tolerance) {
                      // Show warning popup
                      setConversionWarningData({
                        productCode: selectedPlintProduct?.productCode || '',
                        enteredValue: inputValue,
                        calculatedValue: calculatedDisplayValue,
                        omrekenfactor: omrekenfactor
                      });
                      setShowConversionWarning(true);
                      // Store the new value immediately so popup can use it
                      setContainerQuantity(valueInOriginalUnit.toString());
                    } else {
                      // Value is being entered for first time or matches calculation
                      setContainerQuantity(valueInOriginalUnit.toString());
                      handleContainerQuantityChange(valueInOriginalUnit.toString());
                    }
                  } else {
                    // For regular products, handle normally
                    setContainerQuantity(cleanedValue);
                    handleContainerQuantityChange(cleanedValue);
                  }
                }}
                onKeyDown={handleContainerKeyDown}
                placeholder=""
                min="0"
                step={selectedPlintProduct?.omrekenfactor && selectedPlintProduct.omrekenfactor > 1 ? "0.01" : "1"}
                className="h-9"
                disabled={disabled}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="service-type" className="h-6 flex items-center">{t.serviceSection.type}</Label>
              <div className="h-9 flex items-center">
                <span className={`h-9 px-3 rounded text-sm flex items-center ${
                  (type === "Keuze" || type === "Choice") && parseInt(containerQuantity) > 0
                    ? 'bg-green-100 text-green-800'
                    : type === "Keuze" || type === "Choice"
                      ? 'bg-orange-100 text-orange-800'
                      : parseInt(containerQuantity) > 0 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                }`}>
                  {(type === "Keuze" || type === "Choice") && parseInt(containerQuantity) > 0
                    ? t.serviceSection.selected
                    : type === "Keuze" || type === "Choice"
                      ? t.serviceSection.choice
                      : parseInt(containerQuantity) > 0 
                        ? t.serviceSection.selected
                        : t.serviceSection.optional
                  }
                </span>
              </div>
            </div>
          </div>


        </div>

        {/* Dependency Popup - MOVED HERE for container services */}
        <AlertDialog open={showDependencyPopup} onOpenChange={(open) => {
          console.log('🔔 AlertDialog onOpenChange called with:', open);
          // Only allow closing via Cancel button, not by clicking outside or ESC
          if (!open) {
            console.log('⛔ Preventing auto-close - use Cancel button instead');
            return;
          }
          setShowDependencyPopup(open);
        }}>
          <AlertDialogContent className="bg-white w-[90vw] max-w-[1400px] border-none p-0">
            <AlertDialogHeader className="p-0 space-y-0">
              <AlertDialogTitle className="sr-only">
                {t.serviceSection?.choice || (language === 'en' ? 'Choice' : 'Keuze')}
              </AlertDialogTitle>
              <AlertDialogDescription className="sr-only">
                {language === 'en' 
                  ? 'Select quantities for required dependency articles' 
                  : 'Selecteer hoeveelheden voor verplichte afhankelijkheidsartikelen'}
              </AlertDialogDescription>
              
              {/* Green Header */}
              <div className="w-full px-4 py-2 flex items-center justify-between rounded-t-lg" style={{ backgroundColor: '#2d4724', color: 'white' }}>
                <h3 className="text-base font-medium">
                  {language === 'en' ? 'Extra products' : 'Extra producten'}
                </h3>
                <button className="text-white hover:text-gray-200">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 9l-7 7-7-7"/>
                  </svg>
                </button>
              </div>
            </AlertDialogHeader>
            
            <div className="p-4 space-y-6">
              {/* Article Title and Information */}
              <div className="pb-4 border-b border-gray-200">
                <h3 className="text-base font-medium text-gray-900 mb-3 underline">
                  {title}
                </h3>
                
                {/* Article Information Display - same as in standard configurator */}
                {article && (
                  <div className="text-xs text-gray-600 space-y-0.5">
                    {/* Line 1: Klant-/Ordergegevens */}
                    {(relationData && article?.vve !== undefined) && (
                      <div>
                        <span className="font-semibold">{language === 'nl' ? 'Klant-/Ordergegevens:' : 'Customer/Order Information:'}</span>
                        {` `}
                        <span>
                          {article.vve 
                            ? (language === 'nl' ? 'Appartement' : 'Apartment')
                            : (language === 'nl' ? 'Geen appartement' : 'No apartment')
                          }
                        </span>
                      </div>
                    )}
                    
                    {/* Line 2: Product */}
                    {article && (
                      <div>
                        <span className="font-semibold">{language === 'nl' ? 'Product:' : 'Product:'}</span>
                        {` `}
                        {article.legmethode && (
                          <span>{language === 'nl' ? 'Installatie:' : 'Installation:'} {translateProductValue('legmethode', article.legmethode)}</span>
                        )}
                        {article.legmethode && ' / '}
                        <span>
                          {language === 'nl' ? 'Legpatroon:' : 'Pattern:'} Rechte stroken; Tegel; Weense punt; Visgraat; Walvisgraat; Patroon; Hongaarse punt
                        </span>
                      </div>
                    )}
                    
                    {/* Line 3: Ruimte */}
                    {currentRoom && (currentRoom.surface || currentRoom.level) && (
                      <div>
                        <span className="font-semibold">{language === 'nl' ? 'Ruimte:' : 'Room:'}</span>
                        {` `}
                        {currentRoom.surface && (
                          <>
                            <span>{language === 'nl' ? 'Ondergrond:' : 'Subfloor:'} {currentRoom.surface}</span>
                            {currentRoom.level && ' / '}
                          </>
                        )}
                        {currentRoom.level && (
                          <span>{language === 'nl' ? 'Verdieping:' : 'Floor:'} {currentRoom.level}</span>
                        )}
                      </div>
                    )}
                    
                    {/* Line 4: Configurator */}
                    {article && (
                      <div>
                        <span className="font-semibold">{language === 'nl' ? 'Configurator:' : 'Configurator:'}</span>
                        {` `}
                        <span>
                          {language === 'nl' ? 'Naam:' : 'Name:'} {article.productCode}
                          {article.van !== undefined && article.tot !== undefined && (
                            <> / {language === 'nl' ? 'Van:' : 'From:'} {article.van} / {language === 'nl' ? 'Tot:' : 'To:'} {article.tot}</>
                          )}
                          {article.aantalMinimum !== undefined && (
                            <> / {language === 'nl' ? 'Aantal (minimum):' : 'Quantity (minimum):'} {article.aantalMinimum}</>
                          )}
                          {' / '}
                          <span>
                            {language === 'nl' ? 'Aanbevolen:' : 'Recommended:'} {article.aanbevolen ? (language === 'nl' ? 'Ja' : 'Yes') : (language === 'nl' ? 'Nee' : 'No')}
                          </span>
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Oppervlakte Display - Not editable */}
              <div className="space-y-2">
                <Label htmlFor="dependency-area">{language === 'nl' ? 'Oppervlakte' : 'Surface'}</Label>
                <div className="relative">
                  <Input 
                    id="dependency-area"
                    type="text"
                    value={pendingQuantity}
                    readOnly
                    disabled
                    className="h-8 pr-12 bg-gray-100 cursor-not-allowed"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none">
                    m²
                  </span>
                </div>
              </div>
              
              {/* Keuze Section Header with blue color */}
              <div className="w-full px-4 py-2 rounded-lg flex items-center justify-between" style={{ backgroundColor: '#3b82f610', color: '#3b82f6' }}>
                <h3 className="text-lg">
                  {t.serviceSection?.choice || (language === 'en' ? 'Choice' : 'Keuze')}
                </h3>
                <div className="flex items-center gap-2">
                  <span 
                    className="inline-flex items-center justify-center min-w-[1.5rem] h-[1.5rem] px-1.5 rounded-full text-xs font-semibold"
                    style={{ backgroundColor: '#3b82f6', color: 'white' }}
                  >
                    {filteredDependencyArticles.length}
                  </span>
                  <button 
                    onClick={handleCancelDependencies}
                    className="w-10 h-10 rounded-full flex items-center justify-center hover:opacity-80 transition-colors text-xl leading-none"
                    style={{ backgroundColor: '#3b82f6', color: 'white' }}
                    aria-label={language === 'en' ? 'Close' : 'Sluiten'}
                  >
                    ✕
                  </button>
                </div>
              </div>
              
              {/* Search bar */}
              <div className="relative">
                <Input
                  type="text"
                  placeholder={t.serviceSection?.searchPlaceholder || (language === 'en' ? 'Search...' : 'Zoeken...')}
                  className="pl-4 pr-14 py-3 w-full bg-gray-50 border-gray-200 rounded-md text-base"
                  value={dependencySearchQuery}
                  onChange={(e) => setDependencySearchQuery(e.target.value)}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#3b82f6] rounded-md p-2">
                  <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              
              {/* Articles List */}
              <div className="space-y-4">
              {/* Required Articles List - styled like ServiceSection */}
              {filteredDependencyArticles.map((depArticle, index) => {
                const articleKey = depArticle.productCode;
                const currentQuantity = dependencyArticleQuantities[articleKey] || "";
                
                return (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    {/* Article Header */}
                    <div className="flex items-start gap-2 mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              if (onOpenServiceArticleDetail) {
                                onOpenServiceArticleDetail(depArticle);
                              }
                            }}
                            className="text-[#2d4724] hover:text-[#1f3319] underline text-sm text-left font-medium"
                          >
                            {depArticle.productCode} - {depArticle.description}
                          </button>
                          {depArticle.aanbevolen && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 whitespace-nowrap">
                              {language === 'nl' ? 'Aanbevolen' : 'Recommended'}
                            </span>
                          )}
                        </div>
                        {depArticle.subcategorie && (
                          <div className="text-xs text-gray-500 mt-1">
                            {depArticle.subcategorie}
                          </div>
                        )}
                        {depArticle.conversie !== undefined && (
                          <div className="text-xs text-gray-500 mt-1">
                            <span className="font-semibold">{language === 'nl' ? 'Conversie:' : 'Conversion:'}</span> {depArticle.conversie}
                          </div>
                        )}
                      </div>
                      <button 
                        onClick={() => {
                          if (onOpenServiceArticleDetail) {
                            onOpenServiceArticleDetail(depArticle);
                          }
                        }}
                        className="w-8 h-8 rounded bg-[#2d4724] text-white flex items-center justify-center hover:bg-[#1f3319] transition-colors flex-shrink-0"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"/>
                          <path d="M16 12H8M12 8v8"/>
                        </svg>
                      </button>
                    </div>

                    {/* Input Fields Row */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">
                          {depArticle.eenheid || 'Stuk'}
                        </Label>
                        <Input 
                          type="number"
                          value={currentQuantity}
                          onChange={(e) => {
                            const cleanedValue = e.target.value.replace(/^0+(?=\d)/, '');
                            setDependencyArticleQuantities(prev => ({
                              ...prev,
                              [articleKey]: cleanedValue
                            }));
                          }}
                          min="0"
                          step="1"
                          className="h-9 bg-white"
                          placeholder=""
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium h-6 flex items-center">
                          {t.serviceSection?.type || (language === 'en' ? 'Type' : 'Type')}
                        </Label>
                        <div className="h-9 flex items-center">
                          <span className={`h-9 px-3 rounded text-sm flex items-center ${
                            parseInt(currentQuantity) > 0
                              ? 'bg-green-100 text-green-800'
                              : 'bg-blue-100 text-blue-600'
                          }`}>
                            {parseInt(currentQuantity) > 0
                              ? (t.serviceSection?.selected || (language === 'en' ? 'Selected' : 'Geselecteerd'))
                              : (t.serviceSection?.choice || (language === 'en' ? 'Choice' : 'Keuze'))
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              </div>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }

  // Vloerverwarming optional service interface - now with quantity input like containers
  if (serviceType === "vloerverwarming" && !isMandatory) {
    return (
      <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
        <div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleOpenArticleDetail}
              className="text-[#2d4724] hover:text-[#1f3319] underline text-sm text-left"
            >
              {title}
            </button>
            {tooltip && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-gray-500 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">{tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="vloerverwarming-quantity" className="h-6 flex items-center">
              {t.serviceSection.quantity}
            </Label>
            <Input 
              id="vloerverwarming-quantity" 
              type="number" 
              value={containerQuantity === "0" ? "" : containerQuantity}
              onChange={(e) => {
                const cleanedValue = e.target.value.replace(/^0+(?=\d)/, '');
                const previousQuantity = containerQuantity; // Bewaar oude waarde VOOR state update!
                setContainerQuantity(cleanedValue);
                handleContainerQuantityChange(cleanedValue);
              }}
              placeholder=""
              min="0"
              step="1"
              className="h-9"
              disabled={disabled}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="service-type" className="h-6 flex items-center">{t.serviceSection.type}</Label>
            <div className="h-9 flex items-center">
              <span className={`h-9 px-3 rounded text-sm flex items-center ${
                (type === "Keuze" || type === "Choice") && parseInt(containerQuantity) > 0
                  ? 'bg-green-100 text-green-800'
                  : type === "Keuze" || type === "Choice"
                    ? 'bg-orange-100 text-orange-800'
                    : parseInt(containerQuantity) > 0 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
              }`}>
                {(type === "Keuze" || type === "Choice") && parseInt(containerQuantity) > 0
                  ? t.serviceSection.selected
                  : type === "Keuze" || type === "Choice"
                    ? t.serviceSection.choice
                    : parseInt(containerQuantity) > 0 
                      ? t.serviceSection.selected
                      : t.serviceSection.optional
                }
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Handle L/B popup confirmation
  const handleLBConfirm = () => {
    const length = parseFloat(lbLength) || 0;
    const width = parseFloat(lbWidth) || 0;
    const numericArea = parseFloat(pendingLBArea) || 0;
    
    if (length > 0 && width > 0) {
      // Update legservice meters for filtering
      if (serviceType === 'legservice' && onLegserviceMetersChange) {
        onLegserviceMetersChange(numericArea);
      }
      
      // Call callbacks
      if (onAreaChange) {
        onAreaChange(numericArea);
      }

      if (onUpdateService && roomId !== undefined) {
        onUpdateService(roomId, serviceType, title, { 
          area: numericArea,
          length: length,
          width: width,
          isActive: numericArea > 0,
          isMandatory: isMandatory,
          isSelected: !isMandatory && numericArea > 0,
          isExtraConfiguratorService: type === "Extra configurator",
          selectedPlintProduct: selectedPlintProduct,
          selectedOptionalMatProducts: selectedOptionalMatProducts.length > 0 ? selectedOptionalMatProducts : undefined
        });
      }
      
      // Close popup and reset
      setShowLBPopup(false);
      setLbLength('');
      setLbWidth('');
    }
  };

  // Standard service interface (legservice and others)
  return (
    <>
      <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
        <div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenArticleDetail}
              className="text-[#2d4724] hover:text-[#1f3319] underline text-sm text-left"
            >
              {title}
            </button>
            {article?.aanbevolen && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 whitespace-nowrap">
                {language === 'nl' ? 'Aanbevolen' : 'Recommended'}
              </span>
            )}
          </div>

          {/* Article Information Display - 4 lines as shown in screenshot - COLLAPSIBLE */}
          {article && (
            <div className="mt-2 border border-gray-300 rounded-lg overflow-hidden">
              {/* Collapsible Header */}
              <button
                onClick={() => setInfoExpanded(!infoExpanded)}
                className="w-full bg-white px-3 py-2 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <span className="text-xs text-gray-600 font-medium">
                  {language === 'nl' ? 'Details' : 'Details'}
                </span>
                <ChevronDown
                  className={`h-4 w-4 text-gray-600 transition-transform duration-200 ${
                    infoExpanded ? 'rotate-180' : ''
                  }`}
                />
              </button>
              
              {/* Collapsible Content */}
              {infoExpanded && (
                <div className="text-xs text-gray-600 px-3 py-2 space-y-0.5 bg-white border-t border-gray-300">
                  {/* Line 1: Klant-/Ordergegevens - always show */}
                  <div>
                    <span className="font-semibold">{language === 'nl' ? 'Klant-/Ordergegevens:' : 'Customer/Order Information:'}</span>
                    {` `}
                    {relationData && article?.vve !== undefined ? (
                      <span>
                        {article.vve 
                          ? (language === 'nl' ? 'Appartement' : 'Apartment')
                          : (language === 'nl' ? 'Geen appartement' : 'No apartment')
                        }
                      </span>
                    ) : (
                      <span>{language === 'nl' ? 'Appartement:' : 'Apartment:'}</span>
                    )}
                  </div>
                  
                  {/* Line 2: Product */}
                  {article && (
                    <div>
                      <span className="font-semibold">{language === 'nl' ? 'Product:' : 'Product:'}</span>
                      {` `}
                      {article.legmethode && (
                        <span>{language === 'nl' ? 'Installatie:' : 'Installation:'} {translateProductValue('legmethode', article.legmethode)}</span>
                      )}
                      {article.legmethode && ' / '}
                      <span>
                        {language === 'nl' ? 'Legpatroon:' : 'Pattern:'} Rechte stroken; Tegel; Weense punt; Visgraat; Walvisgraat; Patroon; Hongaarse punt
                      </span>
                    </div>
                  )}
                  
                  {/* Line 3: Ruimte - always show */}
                  <div>
                    <span className="font-semibold">{language === 'nl' ? 'Ruimte:' : 'Room:'}</span>
                    {` `}
                    {currentRoom?.surface ? (
                      <>
                        <span>{language === 'nl' ? 'Ondergrond:' : 'Subfloor:'} {
                          (() => {
                            const surfaceKey = currentRoom.surface.toLowerCase().replace(/[^a-z0-9]/g, '');
                            const keyMap: Record<string, keyof typeof t.surfaces> = {
                              'airbase': 'airbase',
                              'anders': 'anders',
                              'anhydriet': 'anhydriet',
                              'beton': 'beton',
                              'betongefreesd': 'betonGevlinderd',
                              'eco2floor': 'eco2Floor',
                              'fermacell': 'fermacell',
                              'gietvloer': 'gietvloer',
                              'grindvloer': 'grindvloer',
                              'hout': 'hout',
                              'houtenplanken': 'houtenPlanken',
                              'houtenplaten': 'houtenPlaten',
                              'knaufbrio': 'knaufBrio',
                              'leisteen': 'leisteen',
                              'magnesiet': 'magnesiet',
                              'marmoleumlinoleum': 'marmoleumLinoleum',
                              'mortel': 'mortel',
                              'parketvloerverlijmd': 'parketvloerVerlijmd',
                              'parketvloerzwevend': 'parketvloerZwevend',
                              'pvc': 'pvc',
                              'tegels': 'tegels',
                              'travertin': 'travertin',
                              'troffelvloer': 'troffelvloer',
                              'variokomp': 'varioKomp',
                              'zandcement': 'zandcement',
                              'zandsteen': 'zandsteen'
                            };
                            const translationKey = keyMap[surfaceKey];
                            return translationKey ? t.surfaces[translationKey] : currentRoom.surface;
                          })()
                        }</span>
                      </>
                    ) : (
                      <span>{language === 'nl' ? 'Ondergrond:' : 'Subfloor:'}</span>
                    )}
                    {' / '}
                    {currentRoom?.level ? (
                      <span>{language === 'nl' ? 'Verdieping:' : 'Floor:'} {
                        (() => {
                          const levelKey = currentRoom.level.toLowerCase().replace(/[^a-z]/g, '');
                          const keyMap: Record<string, keyof typeof t.levels> = {
                            'groundfloor': 'groundFloor',
                            'beganegrond': 'groundFloor',
                            'firstfloor': 'firstFloor',
                            'eersteverdieping': 'firstFloor',
                            'secondfloor': 'secondFloor',
                            'tweedeverdieping': 'secondFloor',
                            'thirdfloor': 'thirdFloor',
                            'derdeverdieping': 'thirdFloor',
                            'fourthfloor': 'fourthFloor',
                            'vierdeverdieping': 'fourthFloor',
                            'higherfloor': 'higherFloor',
                            'hogereverdieping': 'higherFloor',
                            'basement': 'basement',
                            'kelder': 'basement',
                            'attic': 'attic',
                            'zolder': 'attic'
                          };
                          const translationKey = keyMap[levelKey];
                          return translationKey ? t.levels[translationKey] : currentRoom.level;
                        })()
                      }</span>
                    ) : (
                      <span>{language === 'nl' ? 'Verdieping:' : 'Floor:'}</span>
                    )}
                  </div>
                  
                  {/* Line 4: Configurator - always show */}
                  <div>
                    <span className="font-semibold">{language === 'nl' ? 'Configurator:' : 'Configurator:'}</span>
                    {` `}
                    <span>{language === 'nl' ? 'Naam:' : 'Name:'} {article?.configuratorName || ''}</span>
                    {' / '}
                    <span>{language === 'nl' ? 'Van:' : 'From:'} {article?.van ?? ''}</span>
                    {' / '}
                    <span>{language === 'nl' ? 'Tot:' : 'To:'} {article?.tot ?? ''}</span>
                    {' / '}
                    <span>{language === 'nl' ? 'Berekening:' : 'Calculation:'} {article?.berekening || ''}</span>
                    {' / '}
                    <span>{language === 'nl' ? 'Aantal (minimum):' : 'Quantity (minimum):'} {article?.aantalMinimum ?? article?.van ?? ''}</span>
                    {' / '}
                    <span>
                      {language === 'nl' ? 'Aanbevolen:' : 'Recommended:'} {article?.aanbevolen ? (language === 'nl' ? 'Ja' : 'Yes') : (language === 'nl' ? 'Nee' : 'No')}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Basisvloer, m2, Type fields */}
        {/* For Stuk articles with optional choices, show 2-column layout (Stuk, Type) */}
        {/* For regular articles, show 3-column layout (Basisvloer, m2, Type) */}
        {article?.berekening === "Stuk" && article?.keuzeServicesOptional && article.keuzeServicesOptional.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="h-6 flex items-center text-xs text-gray-600 gap-2">
                {t.serviceSection.piece}
                {article?.aantalMinimum && parseFloat(currentArea) === article.aantalMinimum && (
                  <span className="text-red-600 font-medium">
                    {t.serviceSection.adjustedDueToMinimum}
                  </span>
                )}
              </Label>
              <Input 
                type="number"
                value={currentArea || ''}
                onChange={(e) => handleAreaChange(e.target.value)}
                disabled={disabled}
                className="h-9 focus:ring-2 focus:ring-green-400 focus:border-green-400"
                placeholder=""
              />
            </div>
            <div className="space-y-2">
              <Label className="h-6 flex items-center text-xs text-gray-600">
                {language === 'nl' ? 'Type' : 'Type'}
              </Label>
              <div className="h-9 flex items-center">
                <span className={`h-9 px-3 rounded text-sm flex items-center ${
                  parseFloat(currentArea) > 0 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {parseFloat(currentArea) > 0 
                    ? t.serviceSection.selected
                    : t.serviceSection.optional
                  }
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="h-6 flex items-center text-xs text-gray-600">
                {language === 'nl' ? 'Basisvloer' : 'Base floor'}
              </Label>
              <Input 
                value={currentRoom?.surface || ''}
                readOnly
                disabled
                className="h-9"
              />
            </div>
            <div className="space-y-2">
              <Label className="h-6 flex items-center text-xs text-gray-600">
                m2
              </Label>
              {!isMandatory ? (
                <div className="flex gap-2">
                  <Input 
                    type="number"
                    value={currentArea || ''}
                    onChange={(e) => handleAreaChange(e.target.value)}
                    disabled={disabled}
                    className="h-9 focus:ring-2 focus:ring-green-400 focus:border-green-400"
                    placeholder=""
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 shrink-0"
                    onClick={() => {
                      if (area && onAreaChange) {
                        onAreaChange(parseFloat(area));
                      }
                    }}
                    disabled={disabled}
                    title={language === 'nl' ? 'Kopieer ruimte oppervlakte' : 'Copy room area'}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Input 
                  value={area || ''}
                  readOnly
                  disabled
                  className="h-9"
                />
              )}
            </div>
            <div className="space-y-2">
              <Label className="h-6 flex items-center text-xs text-gray-600">
                {language === 'nl' ? 'Type' : 'Type'}
              </Label>
              <Input 
                value={
                  (type === "Keuze" || type === "Choice") && parseFloat(currentArea) > 0
                    ? t.serviceSection.selected
                    : type === "Keuze" || type === "Choice"
                      ? t.serviceSection.choice
                      : (isMandatory || type === "Extra configurator")
                        ? t.serviceSection.mandatory 
                        : (parseFloat(currentArea) > 0 
                            ? t.serviceSection.selected 
                            : t.serviceSection.optional)
                }
                readOnly
                disabled
                className="h-9"
              />
            </div>
          </div>
        )}

        <div className="space-y-4">
          {/* Extra Configurator field - only show for voorbereiden articles that require extra configurators */}
          {(article?.extraConfigurator && serviceType === 'voorbereiden') && (
            <div className="space-y-2">
              <Label className="h-6 flex items-center">
                {language === 'en' ? 'Extra Configurator' : 'Extra configurator'}
              </Label>
              <Input 
                value={article?.extraConfigurator && t.configuratorNames[article.extraConfigurator as keyof typeof t.configuratorNames] || t.configuratorNames.Droogbouw}
                readOnly
                disabled={disabled}
                className="h-9 text-[#dc2626] font-medium"
              />
            </div>
          )}

          {/* Optional Choice Product Section (keuzeServicesOptional) */}
          {article?.keuzeServicesOptional && article.keuzeServicesOptional.length > 0 && (parseFloat(containerQuantity) > 0 || parseFloat(currentArea) > 0) && (() => {
            const optionalArticles = getArticlesByProductCodes(article.keuzeServicesOptional);
            const isSingleProduct = optionalArticles.length === 1;
            
            // For single product, find it in services
            const autoAddedService = isSingleProduct && roomId !== undefined && optionalArticles[0]
              ? services.find(s => s.roomId === roomId && s.productCode === optionalArticles[0].productCode)
              : null;
            
            return (
              <div className="space-y-2 pt-4">
                <div className="font-semibold text-sm">
                  {isSingleProduct 
                    ? (language === 'nl' ? 'Geselecteerde keuze product 1' : 'Selected choice product 1')
                    : (language === 'nl' ? 'Geselecteerde optionele producten' : 'Selected optional products')}
                </div>
                
                {/* If single product - show simple layout */}
                {isSingleProduct && optionalArticles[0] ? (() => {
                  const product = optionalArticles[0];
                  const omrekenfactor = product.omrekenfactor || 1;
                  
                  // Get the PARENT service area (the "Meter" or main service this depends on)
                  // ALWAYS use the current parent area for dynamic updates
                  const parentServiceArea = parseFloat(currentArea) || parseFloat(containerQuantity) || 0;
                  
                  // ALWAYS use parent area for calculation (dynamic recalculation)
                  const currentValueInMeters = parentServiceArea;
                  const calculatedValue = omrekenfactor > 1 
                    ? parseFloat((currentValueInMeters / omrekenfactor).toFixed(2))
                    : currentValueInMeters;
                  
                  // Use user-entered value if available, otherwise show empty
                  const displayValue = userEnteredConversionValues[product.productCode] ?? '';
                  
                  // Calculate minimum quantity
                  const minimumQuantity = 0;
                  
                  return (
                    <div>
                      {/* Labels boven de tabel */}
                      <div className="grid grid-cols-[1fr_200px] mb-2">
                        <div className="text-sm text-gray-900">
                          {language === 'nl' ? 'Product' : 'Product'}
                        </div>
                        <div className="text-sm text-gray-900">
                          {language === 'nl' ? 'Aantal' : 'Quantity'}
                        </div>
                      </div>
                      
                      {/* Tabel met één rij */}
                      <div className="border border-gray-300 bg-white">
                        <div className="grid grid-cols-[1fr_200px]">
                          <div className="px-3 py-3">
                            <a href="#" className="underline text-[#2d4724] hover:text-[#1f3319]">
                              {product.productCode} {product.description}
                            </a>
                          </div>
                          <div className="px-3 py-3 border-l border-gray-300">
                            <Input 
                              type="number"
                              step={omrekenfactor > 1 ? "0.01" : "1"}
                              min={minimumQuantity}
                              value={displayValue}
                              onChange={(e) => {
                                const inputValue = parseFloat(e.target.value);
                                if (isNaN(inputValue)) {
                                  // Clear the user-entered value if input is cleared
                                  setUserEnteredConversionValues(prev => {
                                    const updated = {...prev};
                                    delete updated[product.productCode];
                                    return updated;
                                  });
                                  return;
                                }
                                
                                if (inputValue < minimumQuantity) return;
                                
                                // Store the user-entered value
                                setUserEnteredConversionValues(prev => ({
                                  ...prev,
                                  [product.productCode]: inputValue
                                }));
                                
                                // Check if entered value differs from calculated value
                                const tolerance = 0.01; // Allow small rounding differences
                                if (Math.abs(inputValue - calculatedValue) > tolerance) {
                                  // Show warning popup
                                  setConversionWarningData({
                                    productCode: product.productCode,
                                    enteredValue: inputValue,
                                    calculatedValue: calculatedValue,
                                    omrekenfactor: omrekenfactor
                                  });
                                  setShowConversionWarning(true);
                                } else {
                                  // Value matches calculation, proceed normally
                                  const valueInMeters = inputValue * omrekenfactor;
                                  if (onUpdateService && roomId !== undefined) {
                                    onUpdateService(roomId, product.productCode, product.description, {
                                      area: valueInMeters,
                                      isActive: true,
                                      isMandatory: false
                                    });
                                  }
                                }
                              }}
                              onBlur={(e) => {
                                const inputValue = parseFloat(e.target.value);
                                if (!isNaN(inputValue) && inputValue < minimumQuantity && onUpdateService && roomId !== undefined) {
                                  // Convert back to meters for storage
                                  const valueInMeters = minimumQuantity * omrekenfactor;
                                  onUpdateService(roomId, product.productCode, product.description, {
                                    area: valueInMeters,
                                    isActive: true,
                                    isMandatory: false
                                  });
                                }
                              }}
                              className="h-9 w-full"
                              placeholder=""
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })() : null}
                
                {/* If multiple products - show selected or button */}
                {!isSingleProduct && (
                  selectedOptionalMatProducts.length > 0 ? (
                  <>
                    {selectedOptionalMatProducts.map((item, idx) => (
                      <div key={idx} className="space-y-3">
                        <div>
                          {/* Labels boven de tabel */}
                          <div className="grid grid-cols-[1fr_200px] mb-2">
                            <div className="text-sm text-gray-900">
                              {language === 'nl' ? 'Product' : 'Product'}
                            </div>
                            <div className="text-sm text-gray-900">
                              {language === 'nl' ? 'Aantal' : 'Quantity'}
                            </div>
                          </div>
                          
                          {/* Tabel met één rij */}
                          <div className="border border-gray-300 bg-white">
                            <div className="grid grid-cols-[1fr_200px]">
                              <div className="px-3 py-3">
                                <a href="#" className="underline text-[#2d4724] hover:text-[#1f3319]">
                                  {item.product.productCode} {item.product.description}
                                </a>
                              </div>
                              <div className="px-3 py-3 border-l border-gray-300">
                                <Input 
                                  type="number"
                                  step={item.product.omrekenfactor && item.product.omrekenfactor > 1 ? "0.01" : "1"}
                                  value={(() => {
                                    const omrekenfactor = item.product.omrekenfactor || 1;
                                    if (omrekenfactor > 1) {
                                      return parseFloat((item.quantity / omrekenfactor).toFixed(2));
                                    }
                                    return item.quantity;
                                  })()}
                                  onChange={(e) => {
                                    const inputValue = parseFloat(e.target.value) || 0;
                                    const omrekenfactor = item.product.omrekenfactor || 1;
                                    // Convert back to meters for storage
                                    const quantityInMeters = inputValue * omrekenfactor;
                                    
                                    const updatedProducts = [...selectedOptionalMatProducts];
                                    updatedProducts[idx] = { ...updatedProducts[idx], quantity: quantityInMeters };
                                    setSelectedOptionalMatProducts(updatedProducts);
                                    
                                    if (onUpdateService && roomId !== undefined) {
                                      onUpdateService(roomId, serviceType, title, {
                                        area: parseFloat(containerQuantity) || 0,
                                        isActive: true,
                                        isMandatory: false,
                                        selectedOptionalMatProducts: updatedProducts
                                      });
                                    }
                                  }}
                                  className="h-9 w-full"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Action buttons OUTSIDE table */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              // Get ALL accessory articles for this configurator
                              console.log('🟢 "Product wijzigen" button clicked! Article:', article);
                              if (article) {
                                const allAccessoryArticles = legserviceArticles.filter(a => {
                                  // Check if this article is in the keuzeServicesOptional list
                                  const isInOptionalList = article.keuzeServicesOptional?.includes(a.productCode);
                                  
                                  // For articles with specific keuzeServicesOptional list, only show those
                                  // Otherwise, filter by configuratorName and category
                                  return isInOptionalList || (
                                    a.configuratorName === article.configuratorName &&
                                    a.category === 'Accessoires' &&
                                    (a.subcategorie === 'Hulpmaterialen' || a.subcategorie === 'Accessoires') &&
                                    a.isMandatory === false &&
                                    // Exclude follow-up articles (like 861202) from initial list
                                    a.productCode !== '861202'
                                  );
                                });
                                console.log('🟢 Found accessory articles:', allAccessoryArticles);
                                setOptionalChoiceArticles(allAccessoryArticles);
                              }
                              setShowOptionalChoicePopup(true);
                            }}
                            className="h-9 px-3 rounded text-sm font-medium inline-flex items-center cursor-pointer border-0 outline-none text-white transition-colors whitespace-nowrap"
                            style={{ backgroundColor: tabColor }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.filter = 'brightness(0.8)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.filter = 'brightness(1)';
                            }}
                          >
                            {language === 'nl' ? 'Product wijzigen' : 'Change product'}
                          </button>
                          
                          {/* Delete button - removes this specific product */}
                          <button
                            onClick={() => {
                              // Remove THIS product from the array
                              const updatedProducts = selectedOptionalMatProducts.filter((_, i) => i !== idx);
                              setSelectedOptionalMatProducts(updatedProducts);
                              
                              // Update the service
                              if (onUpdateService && roomId !== undefined) {
                                onUpdateService(roomId, serviceType, title, {
                                  area: parseFloat(containerQuantity) || 0,
                                  isActive: true,
                                  isMandatory: false,
                                  selectedOptionalMatProducts: updatedProducts.length > 0 ? updatedProducts : undefined
                                });
                              }
                            }}
                            className="inline-flex items-center justify-center w-9 h-9 rounded bg-red-100 hover:bg-red-200 text-red-600 transition-colors cursor-pointer border-0 outline-none flex-shrink-0"
                            title={language === 'nl' ? 'Product verwijderen' : 'Remove product'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        // Get ALL accessory articles for this configurator
                        console.log('🟢 Button clicked! Article:', article);
                        if (article) {
                          const allAccessoryArticles = legserviceArticles.filter(a => {
                            // Check if this article is in the keuzeServicesOptional list
                            const isInOptionalList = article.keuzeServicesOptional?.includes(a.productCode);
                            
                            // For articles with specific keuzeServicesOptional list, only show those
                            // Otherwise, filter by configuratorName and category
                            return isInOptionalList || (
                              a.configuratorName === article.configuratorName &&
                              a.category === 'Accessoires' &&
                              (a.subcategorie === 'Hulpmaterialen' || a.subcategorie === 'Accessoires') &&
                              a.isMandatory === false &&
                              // Exclude follow-up articles (like 861202) from initial list
                              a.productCode !== '861202'
                            );
                          });
                          console.log('🟢 Found accessory articles:', allAccessoryArticles);
                          setOptionalChoiceArticles(allAccessoryArticles);
                        }
                        setShowOptionalChoicePopup(true);
                      }}
                      className={`h-9 px-3 rounded text-sm font-medium inline-flex items-center cursor-pointer border-0 outline-none text-white transition-colors whitespace-nowrap ${
                        isFollowupService 
                          ? 'bg-purple-600 hover:bg-purple-700' 
                          : 'bg-green-600 hover:bg-green-700'
                      }`}
                    >
                      {isFollowupService
                        ? (language === 'nl' ? 'Selecteer product (vervolg)' : 'Select product (follow-up)')
                        : (language === 'nl' ? 'Selecteer product (optioneel)' : 'Select product (optional)')
                      }
                    </button>
                  </div>
                )
              )}
              </div>
            );
          })()}

          {/* Selected Choice Product - show for Keuze/Choice container services OR for binnenhoekverstek with selected plint */}
          {(
            // For Keuze/Choice container services
            ((type === "Keuze" || type === "Choice") && parseFloat(currentArea) > 0 && isContainerService && containerDescription) ||
            // For binnenhoekverstek service with quantity > 0 (show even without selected product to show warning button)
            (extractServiceCode(title) === "Leg-binnenhoekverste" && parseFloat(containerQuantity) > 0)
          ) && (
            <div className="space-y-2 pt-4 border-t border-gray-200">
              <Label className="h-6 flex items-center">
                {language === 'nl' ? 'Geselecteerde keuze product' : 'Selected choice product'}
              </Label>
              
              {/* Show warning button for binnenhoekverstek when no product is selected */}
              {extractServiceCode(title) === "Leg-binnenhoekverste" && !selectedPlintProduct && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowPlintProductSelector(true)}
                    className="h-9 px-3 rounded text-sm font-medium inline-flex items-center cursor-pointer border-0 outline-none text-white transition-colors whitespace-nowrap bg-orange-600 hover:bg-orange-700 animate-pulse"
                  >
                    {language === 'nl' ? '⚠️ Selecteer product (verplicht)' : '⚠️ Select product (required)'}
                  </button>
                </div>
              )}
              
              {/* Only show article and quantity fields if a product is selected (for binnenhoekverstek) or if it's a regular container service */}
              {(
                (extractServiceCode(title) === "Leg-binnenhoekverste" && selectedPlintProduct) ||
                (extractServiceCode(title) !== "Leg-binnenhoekverste")
              ) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="h-6 flex items-center text-xs text-gray-600">
                      {language === 'nl' ? 'Product' : 'Product'}
                    </Label>
                    <Input 
                      value={
                        extractServiceCode(title) === "Leg-binnenhoekverste" && selectedPlintProduct
                          ? selectedPlintProduct.name
                          : containerDescription
                      }
                      readOnly
                      disabled
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="h-6 flex items-center text-xs text-gray-600">
                      {language === 'nl' ? 'Aantal' : 'Quantity'}
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input 
                        value={
                          extractServiceCode(title) === "Leg-binnenhoekverste"
                            ? containerQuantity
                            : currentArea
                        }
                        readOnly
                        disabled
                        className="h-9"
                      />
                      
                      {/* Button to change/select plint product for binnenhoekverstek service */}
                      {extractServiceCode(title) === "Leg-binnenhoekverste" && (
                        <>
                          <button
                            onClick={() => setShowPlintProductSelector(true)}
                            className={`h-9 px-3 rounded text-sm font-medium inline-flex items-center cursor-pointer border-0 outline-none text-white transition-colors whitespace-nowrap ${
                              selectedPlintProduct 
                                ? '' 
                                : 'bg-orange-600 hover:bg-orange-700 animate-pulse'
                            }`}
                            style={{ 
                              ...(selectedPlintProduct && {
                                backgroundColor: tabColor
                              })
                            }}
                            onMouseEnter={(e) => {
                              if (selectedPlintProduct) {
                                e.currentTarget.style.filter = 'brightness(0.8)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (selectedPlintProduct) {
                                e.currentTarget.style.filter = 'brightness(1)';
                              }
                            }}
                          >
                            {selectedPlintProduct 
                              ? (language === 'nl' ? 'Product wijzigen' : 'Change product')
                              : (language === 'nl' ? '⚠️ Selecteer product (verplicht)' : '⚠️ Select product (required)')
                            }
                          </button>
                          {selectedPlintProduct && (
                            <button
                              onClick={handleRemovePlintProduct}
                              className="inline-flex items-center justify-center w-9 h-9 rounded bg-red-100 hover:bg-red-200 text-red-600 transition-colors cursor-pointer border-0 outline-none flex-shrink-0"
                              title={language === 'nl' ? 'Product verwijderen' : 'Remove product'}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Dependency Popup */}
      <AlertDialog open={showDependencyPopup} onOpenChange={(open) => {
        console.log('🔔 AlertDialog onOpenChange called with:', open);
        // Only allow closing via Cancel button, not by clicking outside or ESC
        if (!open) {
          console.log('⛔ Preventing auto-close - use Cancel button instead');
          return;
        }
        setShowDependencyPopup(open);
      }}>
        <AlertDialogContent className="bg-white w-[90vw] h-[90vh] max-w-[1400px] border-none p-0 flex flex-col">
          <AlertDialogHeader className="p-0 space-y-0 flex-shrink-0">
            <AlertDialogTitle className="sr-only">
              {t.serviceSection?.choice || (language === 'en' ? 'Choice' : 'Keuze')}
            </AlertDialogTitle>
            <AlertDialogDescription className="sr-only">
              {language === 'en' 
                ? 'Select quantities for required dependency products' 
                : 'Selecteer hoeveelheden voor verplichte afhankelijkheidsproducten'}
            </AlertDialogDescription>
            
            {/* Green Header */}
            <div className="w-full px-4 py-2 flex items-center justify-between rounded-t-lg" style={{ backgroundColor: '#2d4724', color: 'white' }}>
              <h3 className="text-base font-medium">
                {language === 'en' ? 'Extra products' : 'Extra producten'}
              </h3>
            </div>
          </AlertDialogHeader>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Article Title and Information */}
            <div className="pb-4 border-b border-gray-200">
              <h3 className="text-base font-medium text-gray-900 mb-3 underline">
                {title}
              </h3>
              
              {/* Article Information Display - same as in standard configurator */}
              {article && (
                <div className="text-xs text-gray-600 space-y-0.5">
                  {/* Line 1: Klant-/Ordergegevens */}
                  {(relationData && article?.vve !== undefined) && (
                    <div>
                      <span className="font-semibold">{language === 'nl' ? 'Klant-/Ordergegevens:' : 'Customer/Order Information:'}</span>
                      {` `}
                      <span>
                        {article.vve 
                          ? (language === 'nl' ? 'Appartement' : 'Apartment')
                          : (language === 'nl' ? 'Geen appartement' : 'No apartment')
                        }
                      </span>
                    </div>
                  )}
                  
                  {/* Line 2: Product */}
                  {article && (
                    <div>
                      <span className="font-semibold">{language === 'nl' ? 'Product:' : 'Product:'}</span>
                      {` `}
                      {article.legmethode && (
                        <span>{language === 'nl' ? 'Installatie:' : 'Installation:'} {translateProductValue('legmethode', article.legmethode)}</span>
                      )}
                      {article.legmethode && ' / '}
                      <span>
                        {language === 'nl' ? 'Legpatroon:' : 'Pattern:'} Rechte stroken; Tegel; Weense punt; Visgraat; Walvisgraat; Patroon; Hongaarse punt
                      </span>
                    </div>
                  )}
                  
                  {/* Line 3: Ruimte */}
                  {currentRoom && (currentRoom.underfloorHeating || currentRoom.surface || currentRoom.level) && (
                    <div>
                      <span className="font-semibold">{language === 'nl' ? 'Ruimte:' : 'Room:'}</span>
                      {` `}
                      {currentRoom.underfloorHeating && (
                        <>
                          <span>{language === 'nl' ? 'Type vloerverwarming:' : 'Underfloor heating type:'} {currentRoom.underfloorHeating}</span>
                          {(currentRoom.surface || currentRoom.level) && ' / '}
                        </>
                      )}
                      {currentRoom.surface && (
                        <>
                          <span>{language === 'nl' ? 'Ondergrond:' : 'Subfloor:'} {currentRoom.surface}</span>
                          {currentRoom.level && ' / '}
                        </>
                      )}
                      {currentRoom.level && (
                        <span>{language === 'nl' ? 'Verdieping:' : 'Floor:'} {currentRoom.level}</span>
                      )}
                    </div>
                  )}
                  
                  {/* Line 4: Configurator */}
                  {article && (
                    <div>
                      <span className="font-semibold">{language === 'nl' ? 'Configurator:' : 'Configurator:'}</span>
                      {` `}
                      <span>
                        {language === 'nl' ? 'Naam:' : 'Name:'} {article.productCode}
                        {article.van !== undefined && article.tot !== undefined && (
                          <> / {language === 'nl' ? 'Van:' : 'From:'} {article.van} / {language === 'nl' ? 'Tot:' : 'To:'} {article.tot}</>
                        )}
                        {article.aantalMinimum !== undefined && (
                          <> / {language === 'nl' ? 'Aantal (minimum):' : 'Quantity (minimum):'} {article.aantalMinimum}</>
                        )}
                        {' / '}
                        <span className={article.aanbevolen ? 'text-green-700 font-semibold' : ''}>
                          {language === 'nl' ? 'Aanbevolen:' : 'Recommended:'} {article.aanbevolen ? (language === 'nl' ? 'Ja' : 'Yes') : (language === 'nl' ? 'Nee' : 'No')}
                        </span>
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Oppervlakte Display - Not editable */}
            <div className="space-y-2">
              <Label htmlFor="dependency-area-2">{language === 'nl' ? 'Oppervlakte' : 'Surface'}</Label>
              <div className="relative w-48">
                <Input 
                  id="dependency-area-2"
                  type="text"
                  value={pendingQuantity}
                  readOnly
                  disabled
                  className="h-8 pr-12 bg-gray-100 cursor-not-allowed"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none">
                  m²
                </span>
              </div>
            </div>
            
            {/* Container with green background for Keuze section, search and articles */}
            <div className="p-4 space-y-6 bg-[#2d472408] rounded-lg mt-2">
              {/* Keuze Section Header with blue color */}
              <div className="w-full px-4 py-2 rounded-lg flex items-center justify-between" style={{ backgroundColor: '#3b82f610', color: '#3b82f6' }}>
                <h3 className="text-lg">
                  {t.serviceSection?.choice || (language === 'en' ? 'Choice' : 'Keuze')}
                </h3>
                <div className="flex items-center gap-2">
                  <span 
                    className="inline-flex items-center justify-center min-w-[1.5rem] h-[1.5rem] px-1.5 rounded-full text-xs font-semibold"
                    style={{ backgroundColor: '#3b82f6', color: 'white' }}
                  >
                    {filteredDependencyArticles.length}
                  </span>
                  <button 
                    onClick={handleCancelDependencies}
                    className="p-1"
                    style={{ color: '#3b82f6' }}
                    aria-label={language === 'en' ? 'Close' : 'Sluiten'}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 9l-7 7-7-7"/>
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* Search bar */}
              <div className="relative">
                <Input
                  type="text"
                  placeholder={t.serviceSection?.searchPlaceholder || (language === 'en' ? 'Search...' : 'Zoeken...')}
                  className="pl-4 pr-14 py-3 w-full bg-gray-50 border-gray-200 rounded-md text-base"
                  value={dependencySearchQuery}
                  onChange={(e) => setDependencySearchQuery(e.target.value)}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#2d4724] rounded-md p-2">
                  <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              
              {/* Articles List */}
              <div className="space-y-4">
              {/* Required Articles List - styled like ServiceSection */}
              {filteredDependencyArticles.map((depArticle, index) => {
              const articleKey = depArticle.productCode;
              const currentQuantity = dependencyArticleQuantities[articleKey] || "";
              
              return (
                <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  {/* Article Header */}
                  <div className="flex items-start gap-2 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            if (onOpenServiceArticleDetail) {
                              onOpenServiceArticleDetail(depArticle);
                            }
                          }}
                          className="text-[#2d4724] hover:text-[#1f3319] underline text-sm text-left font-medium"
                        >
                          {depArticle.productCode} - {depArticle.description}
                        </button>
                        {depArticle.aanbevolen && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 whitespace-nowrap">
                            {language === 'nl' ? 'Aanbevolen' : 'Recommended'}
                          </span>
                        )}
                      </div>
                      {depArticle && (
                        <div className="text-xs text-gray-600 mt-1">
                          <span className="font-semibold">{language === 'nl' ? 'Product:' : 'Product:'}</span>
                          {` `}
                          {depArticle.conversie !== undefined ? (
                            <span>{language === 'nl' ? 'Conversie:' : 'Conversion:'} {depArticle.conversie}</span>
                          ) : (
                            <span>{language === 'nl' ? 'Conversie:' : 'Conversion:'}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Input Fields Row */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        {depArticle.eenheid || 'Stuk'}
                      </Label>
                      <Input 
                        type="number"
                        value={currentQuantity}
                        onChange={(e) => {
                          const cleanedValue = e.target.value.replace(/^0+(?=\d)/, '');
                          setDependencyArticleQuantities(prev => ({
                            ...prev,
                            [articleKey]: cleanedValue
                          }));
                        }}
                        min="0"
                        step="1"
                        className="h-9 bg-white"
                        placeholder=""
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium h-6 flex items-center">
                        {t.serviceSection?.type || (language === 'en' ? 'Type' : 'Type')}
                      </Label>
                      <div className="h-9 flex items-center">
                        <span className={`h-9 px-3 rounded text-sm flex items-center ${
                          parseInt(currentQuantity) > 0
                            ? 'bg-green-100 text-green-800'
                            : 'bg-blue-100 text-blue-600'
                        }`}>
                          {parseInt(currentQuantity) > 0
                            ? (t.serviceSection?.selected || (language === 'en' ? 'Selected' : 'Geselecteerd'))
                            : (t.serviceSection?.choice || (language === 'en' ? 'Choice' : 'Keuze'))
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
              </div>
            </div>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Plint Product Selection Popup */}
      <AlertDialog open={showPlintProductSelector} onOpenChange={setShowPlintProductSelector}>
        <AlertDialogContent className="bg-[#2d4724] w-[90vw] h-[90vh] max-w-[1400px] border-none p-0 flex flex-col overflow-hidden">
          <AlertDialogHeader className="p-0 space-y-0 flex-shrink-0">
            <AlertDialogTitle className="sr-only">
              {language === 'nl' ? 'Selecteer plint product' : 'Select plinth product'}
            </AlertDialogTitle>
            <AlertDialogDescription className="sr-only">
              {language === 'nl' 
                ? 'Kies een plint product voor deze service' 
                : 'Choose a plinth product for this service'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="flex-1 overflow-hidden">
            <PlintProductSelection
              onSelect={handlePlintProductSelect}
              serviceCode={extractServiceCode(title) || ""}
              onClose={() => {
                setShowPlintProductSelector(false);
                // Don't reset quantity - keep the user's input
              }}
              language={language}
              currentlySelected={selectedPlintProduct || undefined}
              parentServiceQuantity={parseFloat(containerQuantity) || 0}
            />
          </div>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Optional Choice Popup (keuzeServicesOptional) - Mat Product Selection */}
      <AlertDialog open={showOptionalChoicePopup} onOpenChange={setShowOptionalChoicePopup}>
        <AlertDialogContent className="bg-[#2d4724] w-[90vw] h-[90vh] max-w-[1400px] border-none p-0 flex flex-col overflow-hidden">
          <AlertDialogHeader className="p-0 space-y-0 flex-shrink-0">
            <AlertDialogTitle className="sr-only">
              {language === 'nl' ? 'Selecteer mat product' : 'Select mat product'}
            </AlertDialogTitle>
            <AlertDialogDescription className="sr-only">
              {language === 'nl' 
                ? 'Kies optioneel een mat product voor deze service' 
                : 'Optionally choose a mat product for this service'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="flex-1 overflow-hidden">
            <MatProductSelection
              matArticles={optionalChoiceArticles}
              onSelect={(article, quantity, length, width) => {
                // Add this mat product to the array of selected optional mat products
                console.log('🟢 Adding optional mat product:', { article, quantity, length, width });
                
                // Use functional state update to avoid closure issues when multiple products are added
                setSelectedOptionalMatProducts(prevProducts => {
                  // Check if this product is already in the array
                  const existingIndex = prevProducts.findIndex(
                    item => item.product.productCode === article.productCode
                  );
                  
                  let updatedProducts;
                  if (existingIndex >= 0) {
                    // Update existing product
                    updatedProducts = [...prevProducts];
                    updatedProducts[existingIndex] = { product: article, quantity, length, width };
                  } else {
                    // Add new product
                    updatedProducts = [...prevProducts, { product: article, quantity, length, width }];
                  }
                  
                  console.log('🟢 Updated optional mat products:', updatedProducts);
                  
                  return updatedProducts;
                });
              }}
              onClose={() => {
                setShowOptionalChoicePopup(false);
              }}
              language={language}
              currentlySelected={undefined}
              selectionMode={isFollowupService ? 'followup' : 'optional'}
              parentArticleCode={article?.productCode}
              parentArea={parseFloat(currentArea) || parseFloat(containerQuantity) || 0}
              onUpdateParentArea={(newArea) => {
                if (onUpdateService && roomId !== undefined && article) {
                  onUpdateService(roomId, serviceType, title, {
                    area: newArea,
                    isActive: true,
                    isMandatory: false,
                  });
                }
              }}
            />
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* L/B (Lengte/Breedte) Popup */}
      <Dialog open={showLBPopup} onOpenChange={setShowLBPopup}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {language === 'nl' ? 'Afmetingen opgeven' : 'Enter Dimensions'}
            </DialogTitle>
            <DialogDescription>
              {language === 'nl' 
                ? 'Voor dit maat artikel moet u de lengte en breedte opgeven.' 
                : 'For this custom size article, please enter the length and width.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="lb-length">
                {language === 'nl' ? 'Lengte (m)' : 'Length (m)'}
              </Label>
              <Input
                id="lb-length"
                type="number"
                step="0.01"
                min="0"
                value={lbLength}
                onChange={(e) => setLbLength(e.target.value)}
                placeholder={language === 'nl' ? 'Voer lengte in' : 'Enter length'}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="lb-width">
                {language === 'nl' ? 'Breedte (m)' : 'Width (m)'}
              </Label>
              <Input
                id="lb-width"
                type="number"
                step="0.01"
                min="0"
                value={lbWidth}
                onChange={(e) => setLbWidth(e.target.value)}
                placeholder={language === 'nl' ? 'Voer breedte in' : 'Enter width'}
              />
            </div>
            
            {lbLength && lbWidth && (
              <div className="text-sm text-gray-600">
                {language === 'nl' ? 'Oppervlakte' : 'Surface'}: {(parseFloat(lbLength) * parseFloat(lbWidth)).toFixed(2)} m²
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowLBPopup(false);
                setLbLength('');
                setLbWidth('');
                setCurrentArea('0');
              }}
            >
              {language === 'nl' ? 'Annuleren' : 'Cancel'}
            </Button>
            <Button
              onClick={handleLBConfirm}
              disabled={!lbLength || !lbWidth || parseFloat(lbLength) <= 0 || parseFloat(lbWidth) <= 0}
              className="bg-[#2d4724] hover:bg-[#1f3319]"
            >
              {language === 'nl' ? 'Bevestigen' : 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Conversion Warning Dialog */}
      <Dialog open={showConversionWarning} onOpenChange={setShowConversionWarning}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-[#2d4724]">
              {language === 'nl' ? 'Omrekenproduct!' : 'Conversion Product!'}
            </DialogTitle>
            <DialogDescription>
              {language === 'nl' 
                ? `Dit is een omrekenproduct! De berekende waarde is ${conversionWarningData?.calculatedValue || 0}`
                : `This is a conversion product! The calculated value is ${conversionWarningData?.calculatedValue || 0}`
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="text-sm text-gray-600">
              {language === 'nl' 
                ? `U heeft ${conversionWarningData?.enteredValue} ingevoerd, maar de berekende waarde op basis van het oppervlakte is ${conversionWarningData?.calculatedValue}.`
                : `You entered ${conversionWarningData?.enteredValue}, but the calculated value based on the surface area is ${conversionWarningData?.calculatedValue}.`
              }
            </div>
          </div>
          
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                // Use calculated value
                if (conversionWarningData) {
                  const valueInOriginalUnit = conversionWarningData.calculatedValue * conversionWarningData.omrekenfactor;
                  
                  // Check if this is a container service (plint product) or optional article
                  if (selectedPlintProduct && selectedPlintProduct.productCode === conversionWarningData.productCode) {
                    // For container service with plint product
                    const userKey = `container_${serviceType}_${title}`;
                    setUserEnteredConversionValues(prev => ({
                      ...prev,
                      [userKey]: conversionWarningData.calculatedValue
                    }));
                    setContainerQuantity(valueInOriginalUnit.toString());
                    handleContainerQuantityChange(valueInOriginalUnit.toString());
                  } else {
                    // For optional articles
                    setUserEnteredConversionValues(prev => ({
                      ...prev,
                      [conversionWarningData.productCode]: conversionWarningData.calculatedValue
                    }));
                    
                    if (onUpdateService && roomId !== undefined) {
                      onUpdateService(roomId, conversionWarningData.productCode, '', {
                        area: valueInOriginalUnit,
                        isActive: true,
                        isMandatory: false
                      });
                    }
                  }
                }
                setShowConversionWarning(false);
                setConversionWarningData(null);
              }}
            >
              {language === 'nl' ? 'Gebruik berekende waarde' : 'Use calculated value'}
            </Button>
            <Button
              className="bg-[#2d4724] hover:bg-[#1f3319]"
              onClick={() => {
                // Keep user-entered value
                if (conversionWarningData) {
                  const valueInOriginalUnit = conversionWarningData.enteredValue * conversionWarningData.omrekenfactor;
                  
                  // Check if this is a container service (plint product) or optional article
                  if (selectedPlintProduct && selectedPlintProduct.productCode === conversionWarningData.productCode) {
                    // For container service with plint product - value already stored, just close
                    setContainerQuantity(valueInOriginalUnit.toString());
                    handleContainerQuantityChange(valueInOriginalUnit.toString());
                  } else {
                    // For optional articles
                    if (onUpdateService && roomId !== undefined) {
                      onUpdateService(roomId, conversionWarningData.productCode, '', {
                        area: valueInOriginalUnit,
                        isActive: true,
                        isMandatory: false
                      });
                    }
                  }
                }
                setShowConversionWarning(false);
                setConversionWarningData(null);
              }}
            >
              {language === 'nl' ? 'Behoud mijn waarde' : 'Keep my value'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
