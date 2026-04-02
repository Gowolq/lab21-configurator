import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Checkbox } from "./ui/checkbox";
import { X, Search, ChevronDown, ChevronUp, Info } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { useTranslation } from "../utils/translations";
import { PlintProduct, getAllPlintProductsByServiceCode } from "../utils/plintProducts";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./ui/hover-card";

// Dummy product images for plint products
const plintImages = [
  "https://images.unsplash.com/photo-1693592398532-cb18d3b01d07?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGl0ZSUyMG1kZiUyMGJhc2Vib2FyZCUyMG1vbGRpbmd8ZW58MXx8fHwxNzY5NDM4MjAwfDA&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1617262869353-3c653071818c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b29kZW4lMjBiYXNlYm9hcmQlMjB0cmltfGVufDF8fHx8MTc2OTQzODIwMHww&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1651997762458-de49e55e6589?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGl0ZSUyMHdhbGwlMjBtb2xkaW5nJTIwdHJpbXxlbnwxfHx8fDE3Njk0MzgyMDF8MA&ixlib=rb-4.1.0&q=80&w=1080"
];

interface PlintProductSelectionProps {
  serviceCode: string; // "Leg-binnenhoekverste", "AFWERKEN-10296", etc.
  onClose: () => void;
  onSelect: (product: PlintProduct, quantity: number) => void;
  language: string;
  currentlySelected?: PlintProduct; // The currently selected product (if any)
  parentServiceQuantity?: number; // The quantity from parent service (for conversion calculation)
}

export function PlintProductSelection({ serviceCode, onClose, onSelect, language, currentlySelected, parentServiceQuantity }: PlintProductSelectionProps) {
  const t = useTranslation(language);
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [quantities, setQuantities] = useState<Record<string, string>>({});
  const [selectedProduct, setSelectedProduct] = useState<PlintProduct | null>(currentlySelected || null);
  
  // Conversion warning state
  const [showConversionWarning, setShowConversionWarning] = useState(false);
  const [conversionWarningData, setConversionWarningData] = useState<{
    product: PlintProduct;
    enteredValue: number;
    calculatedValue: number;
    omrekenfactor: number;
  } | null>(null);
  const [userEnteredValues, setUserEnteredValues] = useState<Record<string, number>>({});
  
  const availableProducts = getAllPlintProductsByServiceCode(serviceCode);
  
  // Filter states
  const [filters, setFilters] = useState({
    types: [] as string[], // Plint types: Moderne, Renaissance, Barok, etc.
    materials: [] as string[], // Material: MDF, Eiken, etc.
    colors: [] as string[], // Colors: Wit, RAL 9010, etc.
  });

  // Filter section collapsed states
  const [filterSections, setFilterSections] = useState({
    types: true,
    materials: false,
    colors: false
  });

  // Extract unique filter values
  const getPlintType = (name: string): string => {
    if (name.includes("Moderne")) return "Moderne";
    if (name.includes("Renaissance")) return "Renaissance";
    if (name.includes("Barok")) return "Barok";
    if (name.includes("Romantische")) return "Romantische";
    if (name.includes("Retro")) return "Retro";
    if (name.includes("Koloniale")) return "Koloniale";
    if (name.includes("Renovatie")) return "Renovatie";
    if (name.includes("Afwerklijst")) return "Afwerklijst";
    return "Overig";
  };

  const getMaterial = (name: string): string => {
    if (name.includes("MDF")) return "MDF";
    if (name.toLowerCase().includes("eiken")) return "Eiken";
    return "Overig";
  };

  const getColor = (name: string): string => {
    if (name.toLowerCase().includes("wit")) return "Wit";
    if (name.includes("RAL 9010")) return "RAL 9010";
    if (name.toLowerCase().includes("gelakt")) return "Gelakt";
    return "Overig";
  };

  const getUniqueTypes = () => {
    const types = availableProducts.map(p => getPlintType(p.name));
    return [...new Set(types)].filter(t => t !== "Overig").sort();
  };

  const getUniqueMaterials = () => {
    const materials = availableProducts.map(p => getMaterial(p.name));
    return [...new Set(materials)].filter(m => m !== "Overig").sort();
  };

  const getUniqueColors = () => {
    const colors = availableProducts.map(p => getColor(p.name));
    return [...new Set(colors)].filter(c => c !== "Overig").sort();
  };

  // Check if user has searched or filtered
  const hasFiltered = filters.types.length > 0 || filters.materials.length > 0 || filters.colors.length > 0;
  const hasSearchedOrFiltered = searchTerm.trim().length > 0 || hasFiltered;

  // Apply filters
  const filteredProducts = availableProducts.filter(product => {
    const matchesSearch = searchTerm.trim() === "" || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.productCode.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filters.types.length === 0 || filters.types.includes(getPlintType(product.name));
    const matchesMaterial = filters.materials.length === 0 || filters.materials.includes(getMaterial(product.name));
    const matchesColor = filters.colors.length === 0 || filters.colors.includes(getColor(product.name));

    return matchesSearch && matchesType && matchesMaterial && matchesColor;
  });

  const handleQuantityChange = (product: PlintProduct, value: string) => {
    const omrekenfactor = product.omrekenfactor || 1;
    
    // For products without omrekenfactor or without parent service quantity, just store the value
    if (!omrekenfactor || omrekenfactor === 1 || !parentServiceQuantity) {
      setQuantities(prev => ({
        ...prev,
        [product.productCode]: value
      }));
      return;
    }
    
    // For omrekenproducten with parent service quantity
    const inputValue = parseFloat(value);
    
    if (isNaN(inputValue) || value === '') {
      // Clear the value
      setQuantities(prev => ({
        ...prev,
        [product.productCode]: value
      }));
      setUserEnteredValues(prev => {
        const updated = {...prev};
        delete updated[product.productCode];
        return updated;
      });
      return;
    }
    
    // Calculate the expected value based on parentServiceQuantity / omrekenfactor
    const calculatedValue = parseFloat((parentServiceQuantity / omrekenfactor).toFixed(2));
    
    // Check if entered value differs from calculated value
    const tolerance = 0.01;
    if (Math.abs(inputValue - calculatedValue) > tolerance) {
      // Store the entered value and show warning popup
      setQuantities(prev => ({
        ...prev,
        [product.productCode]: value
      }));
      setUserEnteredValues(prev => ({
        ...prev,
        [product.productCode]: inputValue
      }));
      setConversionWarningData({
        product,
        enteredValue: inputValue,
        calculatedValue: calculatedValue,
        omrekenfactor: omrekenfactor
      });
      setShowConversionWarning(true);
    } else {
      // Value matches calculation, proceed normally
      setQuantities(prev => ({
        ...prev,
        [product.productCode]: value
      }));
      setUserEnteredValues(prev => ({
        ...prev,
        [product.productCode]: inputValue
      }));
    }
  };

  const handleSelect = (product: PlintProduct) => {
    const quantity = parseFloat(quantities[product.productCode] || "0");
    if (quantity > 0) {
      onSelect(product, quantity);
      onClose();
    }
  };

  const handleProductClick = (product: PlintProduct) => {
    setSelectedProduct(product);
  };

  const handleFilterChange = (filterType: keyof typeof filters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: prev[filterType].includes(value)
        ? prev[filterType].filter(item => item !== value)
        : [...prev[filterType], value]
    }));
  };

  const handleSearch = () => {
    setSearchTerm(searchInput);
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearFilters = () => {
    setFilters({
      types: [],
      materials: [],
      colors: []
    });
  };

  const clearSearch = () => {
    setSearchInput("");
    setSearchTerm("");
  };

  const clearAll = () => {
    clearFilters();
    clearSearch();
  };

  const toggleFilterSection = (section: keyof typeof filterSections) => {
    setFilterSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div className="h-full bg-[#2d4724] overflow-hidden">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="bg-[#2d4724] text-white p-4 flex justify-between items-center flex-shrink-0">
          <h1 className="text-xl">Configurator</h1>
        </div>

        {/* Content */}
        <div className="flex-1 flex bg-white" style={{height: 'calc(100% - 72px)'}}>
          {/* Filter Sidebar */}
          <div className="w-60 bg-gray-50 border-r border-gray-200 flex-shrink-0 flex flex-col">
            <div className="flex justify-between items-center p-3 pb-2">
              <h3 className="font-medium">
                {language === 'en' ? 'Filters' : 'Filters'}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-xs text-gray-600 hover:text-gray-800"
              >
                {language === 'en' ? 'Clear' : 'Wis'}
              </Button>
            </div>

            {/* Product Counter */}
            <div className="px-3 pb-2">
              <p className="text-xs text-gray-600">
                {language === 'en' ? 'Total records' : 'Totaal aantal records'}: {hasSearchedOrFiltered ? filteredProducts.length : availableProducts.length}
              </p>
            </div>

            <ScrollArea className="flex-1 px-3" style={{height: 'calc(100% - 60px)'}}>
              <div className="space-y-2">
                {/* Type Filter */}
                <Collapsible open={filterSections.types} onOpenChange={() => toggleFilterSection('types')}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-2 text-left hover:bg-gray-100 rounded text-sm">
                    <span>{language === 'en' ? 'Type' : 'Type'}</span>
                    {filterSections.types ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pl-4 space-y-1">
                    {getUniqueTypes().map(type => (
                      <label key={type} className="flex items-center space-x-2 text-sm cursor-pointer">
                        <Checkbox
                          checked={filters.types.includes(type)}
                          onCheckedChange={() => handleFilterChange('types', type)}
                        />
                        <span className={filters.types.includes(type) ? 'text-[#2d4724] font-medium' : ''}>{type}</span>
                      </label>
                    ))}
                  </CollapsibleContent>
                </Collapsible>

                {/* Material Filter */}
                <Collapsible open={filterSections.materials} onOpenChange={() => toggleFilterSection('materials')}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-2 text-left hover:bg-gray-100 rounded text-sm">
                    <span>{language === 'en' ? 'Material' : 'Materiaal'}</span>
                    {filterSections.materials ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pl-4 space-y-1">
                    {getUniqueMaterials().map(material => (
                      <label key={material} className="flex items-center space-x-2 text-sm cursor-pointer">
                        <Checkbox
                          checked={filters.materials.includes(material)}
                          onCheckedChange={() => handleFilterChange('materials', material)}
                        />
                        <span className={filters.materials.includes(material) ? 'text-[#2d4724] font-medium' : ''}>{material}</span>
                      </label>
                    ))}
                  </CollapsibleContent>
                </Collapsible>

                {/* Color Filter */}
                <Collapsible open={filterSections.colors} onOpenChange={() => toggleFilterSection('colors')}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-2 text-left hover:bg-gray-100 rounded text-sm">
                    <span>{language === 'en' ? 'Color' : 'Kleur'}</span>
                    {filterSections.colors ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pl-4 space-y-1">
                    {getUniqueColors().map(color => (
                      <label key={color} className="flex items-center space-x-2 text-sm cursor-pointer">
                        <Checkbox
                          checked={filters.colors.includes(color)}
                          onCheckedChange={() => handleFilterChange('colors', color)}
                        />
                        <span className={filters.colors.includes(color) ? 'text-[#2d4724] font-medium' : ''}>{color}</span>
                      </label>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              </div>
            </ScrollArea>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Top Section */}
            <div className="flex justify-between items-center p-6 pb-4 flex-shrink-0">
              <Button
                onClick={onClose}
                className="bg-[#2d4724] hover:bg-[#1f3319] text-white px-8 py-2"
              >
                {language === 'nl' ? 'Terug' : 'Back'}
              </Button>
              
              <h2 className="text-base font-normal">
                {language === 'nl' ? 'Selecteer één product' : 'Select one product'}
              </h2>
              
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  placeholder={hasFiltered 
                    ? (language === 'en' ? 'Search in results...' : 'Zoek in resultaten...')
                    : (language === 'en' ? 'Search products...' : 'Zoek producten...')
                  }
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyPress={handleSearchKeyPress}
                  className="w-48 h-9"
                />
                <Button
                  onClick={handleSearch}
                  className="bg-[#2d4724] hover:bg-[#1f3319] text-white h-9 px-4"
                >
                  <Search className="h-4 w-4" />
                </Button>
                {hasSearchedOrFiltered && (
                  <Button
                    onClick={clearAll}
                    variant="outline"
                    className="h-9 px-3 text-sm"
                  >
                    {language === 'en' ? 'Clear All' : 'Wis Alles'}
                  </Button>
                )}
              </div>
            </div>

            {/* Results count - only show when user has searched or filtered */}
            {hasSearchedOrFiltered && (
              <div className="px-6 pb-4 text-sm text-gray-600 flex-shrink-0">
                {language === 'en' 
                  ? `${filteredProducts.length} products found`
                  : `${filteredProducts.length} producten gevonden`
                }
              </div>
            )}

            {/* Scrollable Product Table or Initial Message */}
            <div className="flex-1 px-6 overflow-hidden">
              <ScrollArea className="h-full" style={{height: '100%'}}>
                  <div className="border border-gray-300">
                    <table className="w-full">
                      <thead className="bg-gray-100 sticky top-0">
                        <tr>
                          <th className="w-36 p-3 text-left border-r border-gray-300 text-sm font-normal">
                            {language === 'nl' ? 'Productcode' : 'Product Code'}
                          </th>
                          <th className="p-3 text-left border-r border-gray-300 text-sm font-normal">
                            {language === 'nl' ? 'Productnaam' : 'Product Name'}
                          </th>
                          <th className="w-32 p-3 text-left border-r border-gray-300 text-sm font-normal">
                            {language === 'nl' ? 'Aantal' : 'Quantity'}
                          </th>
                          <th className="w-16 p-3 text-center text-sm font-normal">
                            {language === 'nl' ? 'Info' : 'Info'}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProducts.map((product, index) => {
                          const isSelected = selectedProduct?.productCode === product.productCode;
                          return (
                            <tr 
                              key={product.productCode}
                              className={`border-t border-gray-300 hover:bg-gray-50 cursor-pointer ${
                                isSelected ? 'bg-[#2d4724]/5' : ''
                              }`}
                              onClick={() => handleProductClick(product)}
                            >
                              <td className="p-3 border-r border-gray-300 align-middle">
                                <div className="text-sm text-gray-700">{product.productCode}</div>
                              </td>
                              <td className="p-3 border-r border-gray-300 align-middle">
                                <div className="text-sm text-gray-900">{product.name}</div>
                              </td>
                              <td className="p-3 border-r border-gray-300 align-middle">
                                <div className="flex items-center gap-2">
                                  <Input
                                    type="number"
                                    placeholder="0"
                                    value={quantities[product.productCode] || ""}
                                    onChange={(e) => {
                                      e.stopPropagation();
                                      handleQuantityChange(product, e.target.value);
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleProductClick(product);
                                    }}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleSelect(product);
                                      }
                                    }}
                                    disabled={isSelected && selectedProduct?.productCode !== product.productCode}
                                    min="0"
                                    step="0.1"
                                    className="w-20 h-9 bg-gray-50 border-gray-200 rounded-md text-base"
                                  />
                                  <span className="text-sm text-gray-600">{product.eenheid}</span>
                                </div>
                              </td>
                              <td className="p-3 align-middle text-center">
                                <HoverCard openDelay={200}>
                                  <HoverCardTrigger asChild>
                                    <button
                                      onClick={(e) => e.stopPropagation()}
                                      className="inline-flex items-center justify-center text-[#2d4724] hover:text-[#1f3319] transition-colors"
                                    >
                                      <Info className="h-5 w-5" />
                                    </button>
                                  </HoverCardTrigger>
                                  <HoverCardContent 
                                    className="w-80 bg-white border border-gray-200 shadow-lg"
                                    side="left"
                                    align="center"
                                  >
                                    <div className="space-y-3">
                                      {/* Product Image */}
                                      <div className="w-full">
                                        <ImageWithFallback
                                          src={plintImages[index % plintImages.length]}
                                          alt={product.name}
                                          className="w-full h-40 object-cover rounded"
                                        />
                                      </div>
                                      
                                      {/* Product Details */}
                                      <div className="space-y-2">
                                        <div>
                                          <p className="text-xs text-gray-500 uppercase">{language === 'nl' ? 'Productnaam' : 'Product Name'}</p>
                                          <p className="text-sm font-medium text-gray-900">{product.name}</p>
                                        </div>
                                        
                                        <div className="flex gap-4">
                                          <div>
                                            <p className="text-xs text-gray-500 uppercase">{language === 'nl' ? 'Productcode' : 'Product Code'}</p>
                                            <p className="text-sm text-gray-900">{product.productCode}</p>
                                          </div>
                                          <div>
                                            <p className="text-xs text-gray-500 uppercase">{language === 'nl' ? 'Eenheid' : 'Unit'}</p>
                                            <p className="text-sm text-gray-900">{product.eenheid}</p>
                                          </div>
                                        </div>
                                        
                                        {product.omrekenfactor && product.omrekenfactor !== 1 && (
                                          <div>
                                            <p className="text-xs text-gray-500 uppercase">{language === 'nl' ? 'Omrekenfactor' : 'Conversion Factor'}</p>
                                            <p className="text-sm text-gray-900">{product.omrekenfactor}</p>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </HoverCardContent>
                                </HoverCard>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </ScrollArea>
            </div>

            {/* Submit Button - Fixed at bottom */}
            <div className="flex-shrink-0 px-6 py-4 border-t border-gray-200 flex justify-end">
              <Button 
                onClick={() => {
                  if (selectedProduct) {
                    const quantity = parseFloat(quantities[selectedProduct.productCode] || "0");
                    if (quantity > 0) {
                      onSelect(selectedProduct, quantity);
                      onClose();
                    }
                  }
                }}
                disabled={!selectedProduct || !quantities[selectedProduct.productCode] || parseFloat(quantities[selectedProduct.productCode]) <= 0}
                className="bg-[#2d4724] hover:bg-[#1f3319] text-white px-8 py-2 text-sm font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                type="button"
              >
                {language === 'nl' ? 'INDIENEN' : 'SUBMIT'}
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Conversion Warning Dialog */}
      <Dialog open={showConversionWarning} onOpenChange={setShowConversionWarning}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-[#2d4724]">
              {language === 'nl' ? 'Omrekenproduct!' : 'Conversion Product!'}
            </DialogTitle>
            <DialogDescription>
              {language === 'nl' 
                ? 'De ingevoerde waarde komt niet overeen met de berekende waarde!'
                : 'The entered value does not match the calculated value!'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="text-sm text-gray-600">
              {language === 'nl' 
                ? `De berekende waarde op basis van ${parentServiceQuantity} / ${conversionWarningData?.omrekenfactor} is ${conversionWarningData?.calculatedValue}. De waarde wordt aangepast naar de berekende waarde.`
                : `The calculated value based on ${parentServiceQuantity} / ${conversionWarningData?.omrekenfactor} is ${conversionWarningData?.calculatedValue}. The value will be adjusted to the calculated value.`
              }
            </div>
          </div>
          
          <DialogFooter className="gap-2">
            <Button
              className="bg-[#2d4724] hover:bg-[#1f3319]"
              onClick={() => {
                // Use calculated value
                if (conversionWarningData) {
                  setQuantities(prev => ({
                    ...prev,
                    [conversionWarningData.product.productCode]: conversionWarningData.calculatedValue.toString()
                  }));
                  setUserEnteredValues(prev => ({
                    ...prev,
                    [conversionWarningData.product.productCode]: conversionWarningData.calculatedValue
                  }));
                }
                setShowConversionWarning(false);
                setConversionWarningData(null);
              }}
            >
              {language === 'nl' ? 'OK' : 'OK'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}