import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Search, Info, AlertTriangle } from "lucide-react";
import { useTranslation } from "../utils/translations";
import { LegserviceArticle, legserviceArticles } from "../utils/legserviceArticles";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Label } from "./ui/label";

interface MatProductSelectionProps {
  matArticles: LegserviceArticle[];
  onClose: () => void;
  onSelect: (article: LegserviceArticle, quantity: number, length?: number, width?: number) => void;
  onSelectMultiple?: (selections: Array<{ article: LegserviceArticle; quantity: number; length?: number; width?: number }>) => void;
  language: string;
  currentlySelected?: LegserviceArticle;
  selectionMode?: 'choice' | 'optional' | 'followup';
  // Parent service info (voor LEG PROFIEL discrepantie-check)
  parentArticleCode?: string;
  parentArea?: number;
  onUpdateParentArea?: (newArea: number) => void;
}

export function MatProductSelection({ matArticles, onClose, onSelect, onSelectMultiple, language, currentlySelected, selectionMode, parentArticleCode, parentArea, onUpdateParentArea }: MatProductSelectionProps) {
  const t = useTranslation(language);
  const [searchInput, setSearchInput] = useState("");
  const [quantities, setQuantities] = useState<Record<string, string>>({});
  const [selectedProduct, setSelectedProduct] = useState<LegserviceArticle | null>(currentlySelected || null);
  
  // L/B (Length/Width) popup state
  const [showLBPopup, setShowLBPopup] = useState(false);
  const [lbProductsPending, setLbProductsPending] = useState<LegserviceArticle[]>([]);
  const [lbData, setLbData] = useState<Record<string, { length: string; width: string }>>({});
  const [currentLBProductIndex, setCurrentLBProductIndex] = useState(0);
  
  // Info popup state
  const [showInfoPopup, setShowInfoPopup] = useState(false);
  const [infoProduct, setInfoProduct] = useState<LegserviceArticle | null>(null);

  // Follow-up product selection popup state
  const [showFollowUpPopup, setShowFollowUpPopup] = useState(false);
  const [followUpParentProduct, setFollowUpParentProduct] = useState<LegserviceArticle | null>(null);
  const [followUpQuantities, setFollowUpQuantities] = useState<Record<string, string>>({});

  // Discrepantie-popup voor LEG PROFIEL: aantal stuks profielen vs aantal service-stuks
  const [showDiscrepancyDialog, setShowDiscrepancyDialog] = useState(false);
  const [discrepancyTotal, setDiscrepancyTotal] = useState<number>(0);

  // Filter products based on search
  const filteredProducts = matArticles.filter(article => {
    if (searchInput.trim() === "") return true;
    
    const searchLower = searchInput.toLowerCase();
    return (
      article.description.toLowerCase().includes(searchLower) ||
      article.productCode.toLowerCase().includes(searchLower)
    );
  });

  const handleQuantityChange = (productCode: string, value: string) => {
    console.log('📝 Quantity changed for', productCode, 'to', value);
    
    // Find the article
    const article = matArticles.find(a => a.productCode === productCode);
    
    // Update quantity
    setQuantities(prev => ({
      ...prev,
      [productCode]: value
    }));
    
    // If this is a Maat article and a valid quantity was entered, show popup
    const numericValue = parseFloat(value || "0");
    if (article && article.berekening === "Maat" && numericValue > 0) {
      // Check if Maat data already exists for this product
      if (!lbData[productCode] || !lbData[productCode].length || !lbData[productCode].width) {
        console.log('📏 Maat article detected, showing popup for:', productCode);
        setLbProductsPending([article]);
        setCurrentLBProductIndex(0);
        setShowLBPopup(true);
      }
    }
  };

  // Bereken totaal van alle ingevulde quantities (alleen niet-Maat artikelen — die zijn relevant voor profielen)
  const calculateSelectionTotal = (): number => {
    return matArticles.reduce((sum, article) => {
      const qty = parseFloat(quantities[article.productCode] || "0");
      return sum + (isNaN(qty) ? 0 : qty);
    }, 0);
  };

  // De daadwerkelijke submit-actie (zonder discrepantie-check)
  const performSubmit = () => {
    console.log('🚀 performSubmit called, current quantities:', quantities);
    console.log('📏 Current L/B data:', lbData);

    const productsToAdd = matArticles.filter(article => {
      const quantity = parseFloat(quantities[article.productCode] || "0");
      const hasLB = lbData[article.productCode]?.length && lbData[article.productCode]?.width;
      return quantity > 0 || hasLB;
    });

    productsToAdd.forEach(article => {
      const isMaatArticle = article.berekening === "Maat";
      const lbInfo = lbData[article.productCode];

      if (isMaatArticle && lbInfo && lbInfo.length && lbInfo.width) {
        const length = parseFloat(lbInfo.length);
        const width = parseFloat(lbInfo.width);
        try { onSelect(article, 1, length, width); } catch (e) { console.error(e); }
      } else {
        const quantity = parseFloat(quantities[article.productCode]);
        try { onSelect(article, quantity); } catch (e) { console.error(e); }
      }
    });

    onClose();
  };

  const handleSubmitAll = () => {
    if (parentArticleCode === 'Leg-profiel' && parentArea !== undefined && parentArea > 0) {
      const total = calculateSelectionTotal();
      if (total > 0 && total !== parentArea) {
        setDiscrepancyTotal(total);
        setShowDiscrepancyDialog(true);
        return;
      }
    }
    performSubmit();
  };
  
  // Handle L/B popup confirmation for current product
  const handleLBConfirm = () => {
    const currentProduct = lbProductsPending[currentLBProductIndex];
    const lengthValue = lbData[currentProduct.productCode]?.length || '';
    const widthValue = lbData[currentProduct.productCode]?.width || '';
    
    const length = parseFloat(lengthValue);
    const width = parseFloat(widthValue);
    
    if (length > 0 && width > 0) {
      // Store the L/B data for this product
      setLbData(prev => ({
        ...prev,
        [currentProduct.productCode]: { length: lengthValue, width: widthValue }
      }));
      
      // Close the popup
      setShowLBPopup(false);
      setLbProductsPending([]);
      setCurrentLBProductIndex(0);
    }
  };

  const handleSearch = () => {
    // Search is now automatic via filteredProducts
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Check if any product has a quantity > 0 or L/B data
  const hasAnyQuantity = Object.values(quantities).some(qty => parseFloat(qty || "0") > 0);
  const hasAnyLBData = Object.values(lbData).some(data => data?.length && data?.width);
  const hasAnyData = hasAnyQuantity || hasAnyLBData;

  // For followup mode: check if ALL products have data (either quantity or L/B)
  const allProductsHaveQuantity = selectionMode === 'followup' 
    ? matArticles.every(article => {
        const isMaatArticle = article.berekening === "Maat";
        if (isMaatArticle) {
          // For Maat articles, check L/B data
          return lbData[article.productCode]?.length && lbData[article.productCode]?.width;
        } else {
          // For regular articles, check quantity
          return parseFloat(quantities[article.productCode] || "0") > 0;
        }
      })
    : false;

  // Determine if submit button should be enabled
  const canSubmit = selectionMode === 'followup' ? allProductsHaveQuantity : hasAnyData;

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header with back button, title, and search */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Back button */}
          <Button
            onClick={onClose}
            className="bg-[#2d4724] hover:bg-[#1f3319] text-white px-6 py-2 rounded uppercase text-sm font-medium"
          >
            {language === 'nl' ? 'Terug' : 'Back'}
          </Button>
          
          {/* Center: Title */}
          <h2 className="text-base font-normal flex-shrink-0">
            {language === 'nl' ? 'Selecteer één product' : 'Select one product'}
          </h2>
          
          {/* Right: Search */}
          <div className="flex items-center gap-2">
            <Input
              type="text"
              placeholder={language === 'en' ? 'Search Product' : 'Zoek Product'}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={handleSearchKeyPress}
              className="w-64 h-10"
            />
            <Button
              onClick={handleSearch}
              className="bg-[#2d4724] hover:bg-[#1f3319] text-white h-10 px-4"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Product Table */}
      <div className="flex-1 overflow-hidden px-6 pt-6">
        <ScrollArea className="h-full">
          <div className="border border-gray-300">
            <table className="w-full">
              <thead className="bg-white border-b border-gray-300">
                <tr>
                  <th className="p-3 text-left text-sm font-normal">
                    <div>{language === 'nl' ? 'Productnaam' : 'Product Name'} ({filteredProducts.length})</div>
                  </th>
                  <th className="w-48 p-3 text-left border-l border-gray-300 text-sm font-normal">
                    {language === 'nl' ? 'Aantal' : 'Quantity'}
                  </th>
                  <th className="w-20 p-3 text-left border-l border-gray-300 text-sm font-normal">
                    {language === 'nl' ? 'Info' : 'Info'}
                  </th>
                  <th className="w-44 p-3 text-left border-l border-gray-300 text-sm font-normal">
                    {language === 'nl' ? 'Gerelateerd' : 'Related'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((article) => {
                  const isMaatArticle = article.berekening === "Maat";
                  const hasQuantity = parseFloat(quantities[article.productCode] || "0") > 0;
                  const hasLBData = lbData[article.productCode]?.length && lbData[article.productCode]?.width;
                  
                  return (
                    <tr 
                      key={article.productCode}
                      className={`border-t border-gray-300 hover:bg-gray-50 ${
                        (hasQuantity || hasLBData) ? 'bg-[#2d4724]/5' : ''
                      }`}
                    >
                      {/* Product Name */}
                      <td className="p-3">
                        <a 
                          href="#" 
                          className="text-[#2d4724] underline hover:text-[#1f3319] text-sm"
                          onClick={(e) => {
                            e.preventDefault();
                            // Could open product details if needed
                          }}
                        >
                          {article.description}
                        </a>
                      </td>
                      
                      {/* Quantity */}
                      <td className="p-3 border-l border-gray-300">
                        {!isMaatArticle ? (
                          <Input
                            type="number"
                            placeholder=""
                            value={quantities[article.productCode] || ""}
                            onChange={(e) => {
                              handleQuantityChange(article.productCode, e.target.value);
                            }}
                            min={article.aantalMinimum || 1}
                            step="1"
                            className="w-full"
                          />
                        ) : hasLBData ? (
                          <div className="text-sm text-gray-700">
                            L: {lbData[article.productCode]?.length}m × B: {lbData[article.productCode]?.width}m
                          </div>
                        ) : (
                          <Button
                            onClick={() => {
                              setLbProductsPending([article]);
                              setCurrentLBProductIndex(0);
                              setShowLBPopup(true);
                            }}
                            variant="outline"
                            size="sm"
                            className="text-xs"
                          >
                            {language === 'nl' ? 'Afmetingen invoeren' : 'Enter dimensions'}
                          </Button>
                        )}
                      </td>
                      
                      {/* Info */}
                      <td className="p-3 border-l border-gray-300 text-center">
                        <button
                          onClick={() => {
                            setInfoProduct(article);
                            setShowInfoPopup(true);
                          }}
                          className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#2d4724] text-white hover:bg-[#1f3319] transition-colors"
                          title={language === 'nl' ? 'Product informatie' : 'Product information'}
                        >
                          <Info className="w-4 h-4" />
                        </button>
                      </td>
                      
                      {/* Keuze/Vervolg */}
                      <td className="p-3 border-l border-gray-300 text-center">
                        {(hasQuantity || hasLBData) && article.subcategorie !== 'Profielen' ? (
                          <Button
                            onClick={() => {
                              console.log('🔗 Selecteer vervolg product voor:', article.productCode);
                              
                              // Find the follow-up article (LAB21 vochtwerende folie 1mm)
                              const followUpArticle = legserviceArticles.find(a => a.productCode === '861202');
                              
                              if (followUpArticle) {
                                setFollowUpParentProduct(article);
                                setShowFollowUpPopup(true);
                              } else {
                                console.error('❌ Follow-up article 861202 not found!');
                              }
                            }}
                            className="bg-[#5b4ec4] hover:bg-[#4a3da3] text-white px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 mx-auto"
                          >
                            <AlertTriangle className="w-3.5 h-3.5" />
                            {language === 'nl' ? 'Selecteer product' : 'Select product'}
                          </Button>
                        ) : (
                          <div className="text-sm text-gray-400">-</div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </ScrollArea>
      </div>

      {/* Submit Button */}
      <div className="flex-shrink-0 px-6 py-4 flex justify-end border-t border-gray-200">
        <Button
          onClick={handleSubmitAll}
          disabled={!canSubmit}
          className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-8 py-2 rounded uppercase text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {language === 'nl' ? 'INDIENEN' : 'SUBMIT'}
        </Button>
      </div>
      
      {/* L/B (Length/Width) Dialog */}
      <Dialog open={showLBPopup} onOpenChange={setShowLBPopup}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {language === 'nl' ? 'Afmetingen opgeven' : 'Enter Dimensions'}
            </DialogTitle>
            <DialogDescription>
              {lbProductsPending.length > 0 && (
                <span>
                  {language === 'nl' ? 'Product' : 'Product'}: {lbProductsPending[currentLBProductIndex]?.productCode}
                </span>
              )}
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
                value={lbData[lbProductsPending[currentLBProductIndex]?.productCode]?.length || ''}
                onChange={(e) => {
                  const productCode = lbProductsPending[currentLBProductIndex]?.productCode;
                  if (productCode) {
                    setLbData(prev => ({
                      ...prev,
                      [productCode]: {
                        ...prev[productCode],
                        length: e.target.value
                      }
                    }));
                  }
                }}
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
                value={lbData[lbProductsPending[currentLBProductIndex]?.productCode]?.width || ''}
                onChange={(e) => {
                  const productCode = lbProductsPending[currentLBProductIndex]?.productCode;
                  if (productCode) {
                    setLbData(prev => ({
                      ...prev,
                      [productCode]: {
                        ...prev[productCode],
                        width: e.target.value
                      }
                    }));
                  }
                }}
                placeholder={language === 'nl' ? 'Voer breedte in' : 'Enter width'}
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowLBPopup(false);
                setLbProductsPending([]);
                setCurrentLBProductIndex(0);
              }}
            >
              {language === 'nl' ? 'Annuleren' : 'Cancel'}
            </Button>
            <Button
              onClick={handleLBConfirm}
              disabled={!lbData[lbProductsPending[currentLBProductIndex]?.productCode]?.length || 
                       !lbData[lbProductsPending[currentLBProductIndex]?.productCode]?.width}
              className="bg-[#2d4724] hover:bg-[#1f3319] text-white"
            >
              {language === 'nl' ? 'Bevestigen' : 'Confirm'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Info Dialog */}
      <Dialog open={showInfoPopup} onOpenChange={setShowInfoPopup}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {language === 'nl' ? 'Product informatie' : 'Product Information'}
            </DialogTitle>
          </DialogHeader>
          
          {infoProduct && (
            <div className="space-y-4 py-4">
              <div>
                <div className="text-sm font-medium text-gray-500">
                  {language === 'nl' ? 'Productcode' : 'Product Code'}
                </div>
                <div className="text-base">{infoProduct.productCode}</div>
              </div>
              
              <div>
                <div className="text-sm font-medium text-gray-500">
                  {language === 'nl' ? 'Beschrijving' : 'Description'}
                </div>
                <div className="text-base">{infoProduct.description}</div>
              </div>
              
              <div>
                <div className="text-sm font-medium text-gray-500">
                  {language === 'nl' ? 'Eenheid' : 'Unit'}
                </div>
                <div className="text-base">{infoProduct.eenheid}</div>
              </div>
              
              {infoProduct.aantalMinimum && (
                <div>
                  <div className="text-sm font-medium text-gray-500">
                    {language === 'nl' ? 'Minimum aantal' : 'Minimum Quantity'}
                  </div>
                  <div className="text-base">{infoProduct.aantalMinimum}</div>
                </div>
              )}
              
              {infoProduct.omrekenfactor && infoProduct.omrekenfactor !== 1 && (
                <div>
                  <div className="text-sm font-medium text-gray-500">
                    {language === 'nl' ? 'Omrekenfactor' : 'Conversion Factor'}
                  </div>
                  <div className="text-base">{infoProduct.omrekenfactor}</div>
                </div>
              )}
            </div>
          )}
          
          <div className="flex justify-end">
            <Button
              onClick={() => setShowInfoPopup(false)}
              className="bg-[#2d4724] hover:bg-[#1f3319] text-white"
            >
              {language === 'nl' ? 'Sluiten' : 'Close'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Discrepantie-popup voor LEG PROFIEL */}
      <Dialog open={showDiscrepancyDialog} onOpenChange={setShowDiscrepancyDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-[#2d4724]">
              {language === 'nl' ? 'Aantal komt niet overeen' : 'Quantity mismatch'}
            </DialogTitle>
            <DialogDescription>
              {language === 'nl'
                ? 'Het totaal aantal geselecteerde profielen wijkt af van het ingevulde aantal voor de LEG PROFIEL service.'
                : 'The total number of selected profiles differs from the quantity entered for the LEG PROFIEL service.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4 text-sm text-gray-700">
            <div className="flex justify-between border-b border-gray-200 pb-2">
              <span>{language === 'nl' ? 'LEG PROFIEL service:' : 'LEG PROFIEL service:'}</span>
              <span className="font-medium">{parentArea ?? 0} {language === 'nl' ? 'stuks' : 'pcs'}</span>
            </div>
            <div className="flex justify-between border-b border-gray-200 pb-2">
              <span>{language === 'nl' ? 'Geselecteerde profielen totaal:' : 'Selected profiles total:'}</span>
              <span className="font-medium">{discrepancyTotal} {language === 'nl' ? 'stuks' : 'pcs'}</span>
            </div>
            <div className="pt-2">
              {language === 'nl'
                ? `Wil je de LEG PROFIEL service automatisch aanpassen naar ${discrepancyTotal} stuks?`
                : `Do you want to automatically adjust the LEG PROFIEL service to ${discrepancyTotal} pieces?`}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowDiscrepancyDialog(false);
              }}
            >
              {language === 'nl' ? 'Annuleren' : 'Cancel'}
            </Button>
            <Button
              className="bg-[#2d4724] hover:bg-[#1f3319] text-white"
              onClick={() => {
                if (onUpdateParentArea) {
                  onUpdateParentArea(discrepancyTotal);
                }
                setShowDiscrepancyDialog(false);
                performSubmit();
              }}
            >
              {language === 'nl'
                ? `Aanpassen naar ${discrepancyTotal}`
                : `Adjust to ${discrepancyTotal}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Follow-up Product Selection Popup */}
      {showFollowUpPopup && (
        <MatProductSelection
          matArticles={[legserviceArticles.find(a => a.productCode === '861202')!].filter(Boolean)}
          onClose={() => {
            setShowFollowUpPopup(false);
            setFollowUpParentProduct(null);
            setFollowUpQuantities({});
          }}
          onSelect={(article, quantity, length, width) => {
            console.log('✅ Follow-up product selected:', { article, quantity, length, width });
            
            // Add the follow-up product to the parent's service
            onSelect(article, quantity, length, width);
            
            // Close the follow-up popup
            setShowFollowUpPopup(false);
            setFollowUpParentProduct(null);
            setFollowUpQuantities({});
          }}
          language={language}
          selectionMode="followup"
        />
      )}
    </div>
  );
}
