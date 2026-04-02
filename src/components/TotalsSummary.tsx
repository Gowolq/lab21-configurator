interface Room {
  id: number;
  level: string;
  roomName: string;
  surface: string;
  area: number;
  product?: string;
  collapsed?: boolean;
  selectedProduct?: {
    id: string;
    name: string;
    snijverlies?: number;
    pakgrootte?: number;
    eenheid?: string; // "M2", "M1", of "Stuk"
    omrekenfactor?: number; // New field for omrekenfactor
  };
}

interface ServiceState {
  roomId: number;
  serviceType: string;
  serviceTitle: string;
  area: number;
  isActive: boolean;
  isMandatory: boolean;
  isSelected?: boolean; // For optional services
  selectedPlintProduct?: { // For binnenhoekverstek service - selected plint product
    serviceCode: string;
    productCode: string;
    name: string;
    eenheid: string;
    snijverlies: number;
    pakgrootte: number;
  };
  length?: number; // For L/B berekening articles - length in meters
  width?: number; // For L/B berekening articles - width in meters
}

interface TotalsSummaryProps {
  rooms: Room[];
  services: ServiceState[];
  language: string;
}

import { useTranslation } from "../utils/translations";
import { getPlintProductByServiceCode, isPlintService, extractServiceCode } from "../utils/plintProducts";
import { legserviceArticles } from "../utils/legserviceArticles";

export function TotalsSummary({ rooms, services, language }: TotalsSummaryProps) {
  const t = useTranslation(language);
  // Filter rooms with products
  const roomsWithProducts = rooms.filter(room => 
    room.product && 
    room.surface && 
    room.area > 0
  );

  // Surface totals (existing logic)
  const surfaceTotals = roomsWithProducts.reduce((acc, room) => {
    acc[room.surface] = (acc[room.surface] || 0) + room.area;
    return acc;
  }, {} as Record<string, number>);
  
  const totalAllSurfaces = roomsWithProducts.reduce((total, room) => total + room.area, 0);

  // Level totals (new)
  const levelTotals = roomsWithProducts.reduce((acc, room) => {
    const levelLabel = t.levels[room.level as keyof typeof t.levels] || room.level;
    acc[levelLabel] = (acc[levelLabel] || 0) + room.area;
    return acc;
  }, {} as Record<string, number>);

  // Product totals - group by product name with snijverlies, pakgrootte and eenheid
  const productDetails = roomsWithProducts.reduce((acc, room) => {
    const productName = room.product || 'Onbekend product';
    const snijverlies = room.selectedProduct?.snijverlies || 0;
    const pakgrootte = room.selectedProduct?.pakgrootte || 0;
    const eenheid = room.selectedProduct?.eenheid || 'M2';
    const omrekenfactor = (room.selectedProduct as any)?.omrekenfactor || 1; // Default to 1 if not set
    
    if (!acc[productName]) {
      acc[productName] = {
        ingevoerd: 0,
        snijverlies: snijverlies,
        pakgrootte: pakgrootte,
        eenheid: eenheid,
        omrekenfactor: omrekenfactor
      };
    }
    
    acc[productName].ingevoerd += room.area;
    return acc;
  }, {} as Record<string, { ingevoerd: number; snijverlies: number; pakgrootte: number; eenheid: string; omrekenfactor: number }>);

  // Add plint products from selected services
  const selectedServices = services.filter(service => service.isSelected || service.isMandatory);
  
  console.log('🔍 TotalsSummary - All services:', services);
  console.log('🔍 TotalsSummary - Selected services:', selectedServices);
  console.log('🔍 TotalsSummary - Plint services:', selectedServices.filter(s => isPlintService(s.serviceTitle)));
  
  selectedServices.forEach(service => {
    if (isPlintService(service.serviceTitle)) {
      const serviceCode = extractServiceCode(service.serviceTitle);
      console.log('🔍 TotalsSummary - Processing plint service:', service.serviceTitle, 'code:', serviceCode, 'area:', service.area);
      
      if (serviceCode && service.area > 0) {
        // 1. Add the SERVICE ARTICLE itself (e.g., "LEG BINNENHOEKVERSTEK")
        const serviceArticle = legserviceArticles.find(a => a.productCode === serviceCode || service.serviceTitle.includes(a.productCode));
        if (serviceArticle) {
          const serviceArticleName = `${serviceArticle.productCode} - ${serviceArticle.description}`;
          if (!productDetails[serviceArticleName]) {
            productDetails[serviceArticleName] = {
              ingevoerd: 0,
              snijverlies: 0, // No cutting waste for service articles
              pakgrootte: 0, // No package size for service articles
              eenheid: serviceArticle.eenheid || 'Stuk',
              omrekenfactor: serviceArticle.omrekenfactor || 1
            };
          }
          productDetails[serviceArticleName].ingevoerd += service.area;
          console.log('🔍 TotalsSummary - Added service article:', serviceArticleName, 'quantity:', service.area);
        }
        
        // 2. Add the SELECTED PLINT PRODUCT from the popup (if available)
        if (service.selectedPlintProduct) {
          const plintProduct = service.selectedPlintProduct;
          console.log('🔍 TotalsSummary - Selected plint product found:', plintProduct);
          if (!productDetails[plintProduct.name]) {
            productDetails[plintProduct.name] = {
              ingevoerd: 0,
              snijverlies: plintProduct.snijverlies,
              pakgrootte: plintProduct.pakgrootte,
              eenheid: plintProduct.eenheid,
              omrekenfactor: (plintProduct as any).omrekenfactor || 1
            };
          }
          productDetails[plintProduct.name].ingevoerd += service.area;
          console.log('🔍 TotalsSummary - Added plint product:', plintProduct.name, 'quantity:', service.area);
        }
      }
    }
  });

  // Add ALL service articles (including "Stuk" items like KC25 100325)
  selectedServices.forEach(service => {
    // Skip plint services (already processed above)
    if (isPlintService(service.serviceTitle)) {
      return;
    }

    // Extract productCode from service title (format: "PRODUCTCODE - Description")
    const productCodeMatch = service.serviceTitle.match(/^([A-Z0-9\s-]+?)(?:\s+-\s+|\s+$)/);
    if (!productCodeMatch) return;

    const productCode = productCodeMatch[1].trim();
    
    // Find the article in legserviceArticles
    const article = legserviceArticles.find(a => a.productCode === productCode);
    if (!article || service.area <= 0) return;

    console.log('🔍 TotalsSummary - Processing service article:', productCode, 'quantity:', service.area, 'unit:', article.eenheid);

    // Add to productDetails
    const productName = `${article.productCode} - ${article.description}`;
    if (!productDetails[productName]) {
      productDetails[productName] = {
        ingevoerd: 0,
        snijverlies: 0, // No cutting waste for service articles
        pakgrootte: 0, // No package size for service articles
        eenheid: article.eenheid || 'Stuk',
        omrekenfactor: article.omrekenfactor || 1
      };
    }
    productDetails[productName].ingevoerd += service.area;
    console.log('🔍 TotalsSummary - Added service article:', productName, 'total:', productDetails[productName].ingevoerd);
  });

  // Calculate totals including snijverlies
  let totalIngevoerd = 0;
  let totalInclSnijverlies = 0;
  let totalOmgerekend = 0; // New total for omgerekend
  let totalPakken = 0;
  let totalTeLeveren = 0;
  
  Object.values(productDetails).forEach(details => {
    totalIngevoerd += details.ingevoerd;
    const inclSnijverlies = details.ingevoerd * (1 + details.snijverlies / 100);
    totalInclSnijverlies += inclSnijverlies;
    // Add to omgerekend total
    const omgerekend = inclSnijverlies / (details.omrekenfactor || 1);
    totalOmgerekend += omgerekend;
    if (details.pakgrootte > 0) {
      const pakken = Math.ceil(inclSnijverlies / details.pakgrootte);
      totalPakken += pakken;
      totalTeLeveren += pakken * details.pakgrootte;
    }
  });

  // Calculate actual service totals from active services
  const activeServices = services.filter(service => service.isActive);

  // Verwijdering totals per level
  const verwijderingByLevel = roomsWithProducts.reduce((acc, room) => {
    const levelLabel = t.levels[room.level as keyof typeof t.levels] || room.level;
    
    // Sum all verwijdering services for this room
    const roomVerwijdering = activeServices
      .filter(s => s.serviceType === 'verwijdering' && s.roomId === room.id)
      .reduce((total, s) => total + s.area, 0);
    
    acc[levelLabel] = (acc[levelLabel] || 0) + roomVerwijdering;
    return acc;
  }, {} as Record<string, number>);

  // Voorbereiden totals per level
  const voorbereidenByLevel = roomsWithProducts.reduce((acc, room) => {
    const levelLabel = t.levels[room.level as keyof typeof t.levels] || room.level;
    
    // Sum all voorbereiden services for this room
    const roomVoorbereiden = activeServices
      .filter(s => s.serviceType === 'voorbereiden' && s.roomId === room.id)
      .reduce((total, s) => total + s.area, 0);
    
    acc[levelLabel] = (acc[levelLabel] || 0) + roomVoorbereiden;
    return acc;
  }, {} as Record<string, number>);

  const serviceTotals = {
    "verwijderservice": activeServices
      .filter(s => s.serviceType === 'verwijdering')
      .reduce((total, s) => total + s.area, 0),
    "voorbereiden": activeServices
      .filter(s => s.serviceType === 'voorbereiden')
      .reduce((total, s) => total + s.area, 0),
    "legservice": totalAllSurfaces, // All areas need to be laid
  };

  // Container services - count containers, not area
  const containerServices = activeServices.filter(s => s.serviceType.includes('container'));
  const totalContainers = containerServices.length > 0 ? containerServices.reduce((total, s) => total + s.area, 0) : 0;

  const totalServiceArea = serviceTotals.verwijderservice + serviceTotals.voorbereiden + serviceTotals.legservice;

  if (roomsWithProducts.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="text-center text-gray-500">
          {t.totalsSummary.totalsWillAppear}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">        
        {/* Area Totals */}
        <div className="rounded-lg p-4" style={{backgroundColor: 'rgba(16, 79, 37, 0.03)'}}>
          <h4 className="mb-3 text-[14px]">{t.totalsSummary.subfloor}</h4>
          <div className="text-xs text-gray-600 space-y-1">
            {Object.entries(surfaceTotals).map(([surface, total]) => (
              <div key={surface} className="flex justify-between">
                <span>{surface}:</span>
                <span>{total} m²</span>
              </div>
            ))}
            <div className="pt-1 border-t border-gray-300 flex justify-between">
              <span><strong>{t.totalsSummary.totalSubfloors}:</strong></span>
              <span><strong>{totalAllSurfaces} m²</strong></span>
            </div>
          </div>
        </div>

        {/* Level Totals */}
        <div className="rounded-lg p-4" style={{backgroundColor: 'rgba(16, 79, 37, 0.06)'}}>
          <h4 className="mb-3 text-[14px]">{t.totals.buildingLevel}</h4>
          
          {/* Header row */}
          <div className="grid grid-cols-5 gap-4 text-xs font-medium text-gray-700 pb-2 border-b border-gray-300 mb-2">
            <span>{t.totalsSummary.level}</span>
            <span className="text-right">{t.serviceTabs.verwijdering}</span>
            <span className="text-right">{t.serviceTabs.voorbereiden}</span>
            <span className="text-right">{t.totalsSummary.products}</span>
            <span className="text-right">{t.serviceTabs.legservice}</span>
          </div>
          
          {/* Data rows */}
          <div className="text-xs text-gray-600 space-y-1">
            {Object.entries(levelTotals).map(([level, total]) => {
              const verwijderingTotal = verwijderingByLevel[level] || 0;
              const voorbereidenTotal = voorbereidenByLevel[level] || 0;
              return (
                <div key={level} className="grid grid-cols-5 gap-4">
                  <span>{(() => {
                    const levelMapping: Record<string, keyof typeof t.levels> = {
                      'ground-floor': 'groundFloor',
                      'first-floor': 'firstFloor', 
                      'second-floor': 'secondFloor',
                      'third-floor': 'thirdFloor',
                      'fourth-floor': 'fourthFloor',
                      'basement': 'basement',
                      'attic': 'attic'
                    };
                    const mappedKey = levelMapping[level];
                    return mappedKey ? t.levels[mappedKey] : level;
                  })()}</span>
                  <span className={`text-right ${verwijderingTotal > 0 ? '' : 'text-gray-400'}`}>
                    {verwijderingTotal > 0 ? `${verwijderingTotal} m²` : '- m²'}
                  </span>
                  <span className={`text-right ${voorbereidenTotal > 0 ? '' : 'text-gray-400'}`}>
                    {voorbereidenTotal > 0 ? `${voorbereidenTotal} m²` : '- m²'}
                  </span>
                  <span className="text-right">{total} m²</span>
                  <span className="text-right">{total} m²</span>
                </div>
              );
            })}
            
            {/* Total row */}
            <div className="pt-2 border-t border-gray-300 grid grid-cols-5 gap-4 font-medium">
              <span><strong>{t.totalsSummary.totalLevels}:</strong></span>
              <span className={`text-right ${serviceTotals.verwijderservice > 0 ? '' : 'text-gray-400'}`}>
                <strong>{serviceTotals.verwijderservice > 0 ? `${serviceTotals.verwijderservice} m²` : '- m²'}</strong>
              </span>
              <span className={`text-right ${serviceTotals.voorbereiden > 0 ? '' : 'text-gray-400'}`}>
                <strong>{serviceTotals.voorbereiden > 0 ? `${serviceTotals.voorbereiden} m²` : '- m²'}</strong>
              </span>
              <span className="text-right"><strong>{totalAllSurfaces} m²</strong></span>
              <span className="text-right"><strong>{totalAllSurfaces} m²</strong></span>
            </div>
          </div>
        </div>

        {/* Products Section */}
        <div className="rounded-lg p-4" style={{backgroundColor: 'rgba(16, 79, 37, 0.075)'}}>
          <h4 className="mb-3 text-[14px]">{t.totalsSummary.products}</h4>
          
          {/* Header row - 7 columns with Eenheid between Ingevoerd and Snijafval */}
          <div className="grid grid-cols-8 gap-4 text-xs font-medium text-gray-700 pb-2 border-b border-gray-300 mb-2">
            <span>{t.totalsSummary.product}</span>
            <span className="text-right">{t.totalsSummary.entered}</span>
            <span className="text-right">{t.totalsSummary.unit}</span>
            <span className="text-right">{t.totalsSummary.cuttingWaste}</span>
            <span className="text-right">{t.totalsSummary.inclCuttingWaste}</span>
            <span className="text-right">Omgerekend</span>
            <span className="text-right">{t.totalsSummary.packagesRounded}</span>
            <span className="text-right">{t.totalsSummary.toDeliver}</span>
          </div>
          
          <div className="text-xs text-gray-600 space-y-1">
            {Object.entries(productDetails).map(([product, details]) => {
              const inclSnijverlies = details.ingevoerd * (1 + details.snijverlies / 100);
              // Apply omrekenfactor: divide inclSnijverlies by omrekenfactor
              const omgerekend = inclSnijverlies / (details.omrekenfactor || 1);
              const pakken = details.pakgrootte > 0 ? Math.ceil(inclSnijverlies / details.pakgrootte) : 0;
              const teLeveren = pakken * details.pakgrootte;
              
              return (
                <div key={product} className="grid grid-cols-8 gap-4">
                  <span>{product}</span>
                  <span className="text-right">{details.ingevoerd}</span>
                  <span className="text-right">{details.eenheid}</span>
                  <span className="text-right">{details.snijverlies}%</span>
                  <span className="text-right">{inclSnijverlies.toFixed(2)}</span>
                  <span className="text-right">{omgerekend.toFixed(2)}</span>
                  <span className="text-right">{pakken > 0 ? pakken : '-'}</span>
                  <span className="text-right">{teLeveren > 0 ? teLeveren.toFixed(2) : '-'}</span>
                </div>
              );
            })}
            <div className="pt-2 border-t border-gray-300 grid grid-cols-8 gap-4 font-medium">
              <span><strong>{t.totalsSummary.totalProducts}:</strong></span>
              <span className="text-right"><strong>{totalIngevoerd}</strong></span>
              <span className="text-right"><strong>-</strong></span>
              <span className="text-right"><strong>-</strong></span>
              <span className="text-right"><strong>{totalInclSnijverlies.toFixed(2)}</strong></span>
              <span className="text-right"><strong>{totalOmgerekend.toFixed(2)}</strong></span>
              <span className="text-right"><strong>{totalPakken}</strong></span>
              <span className="text-right"><strong>{totalTeLeveren.toFixed(2)}</strong></span>
            </div>
          </div>
        </div>

        {/* Service Area Totals */}
        <div className="rounded-lg p-4" style={{backgroundColor: 'rgba(16, 79, 37, 0.09)'}}>
          <h4 className="mb-3 text-[14px]">{t.totalsSummary.service}</h4>
          <div className="text-xs text-gray-600 space-y-1">
            <div className={`flex justify-between ${serviceTotals.verwijderservice > 0 ? '' : 'text-gray-400'}`}>
              <span>{t.serviceTabs.verwijdering}:</span>
              <span>{serviceTotals.verwijderservice > 0 ? `${serviceTotals.verwijderservice} m²` : '- m²'}</span>
            </div>
            <div className={`flex justify-between ${serviceTotals.voorbereiden > 0 ? '' : 'text-gray-400'}`}>
              <span>{t.serviceTabs.voorbereiden}:</span>
              <span>{serviceTotals.voorbereiden > 0 ? `${serviceTotals.voorbereiden} m²` : '- m²'}</span>
            </div>
            <div className="flex justify-between">
              <span>{t.serviceTabs.legservice}:</span>
              <span>{serviceTotals.legservice} m²</span>
            </div>
            <div className="pt-1 border-t border-gray-300 flex justify-between">
              <span><strong>{t.totalsSummary.totalServices}:</strong></span>
              <span><strong>{totalServiceArea} m2</strong></span>
            </div>
          </div>
        </div>

        {/* Final Summary */}
        <div className="rounded-lg p-4" style={{backgroundColor: 'rgba(16, 79, 37, 0.12)'}}>
          <h4 className="mb-3 text-[14px]">{t.totalsSummary.project}</h4>
          <div className="text-xs text-gray-700 space-y-1">
            <div className="flex justify-between">
              <span>{t.totalsSummary.totalRooms}:</span>
              <span>{roomsWithProducts.length}</span>
            </div>
            <div className="flex justify-between">
              <span>{t.totalsSummary.totalFloorArea}:</span>
              <span>{totalAllSurfaces} m2</span>
            </div>
            <div className={`flex justify-between ${totalContainers > 0 ? '' : 'text-gray-400'}`}>
              <span>{t.totalsSummary.containersNeeded}:</span>
              <span>{totalContainers > 0 ? totalContainers : '-'}</span>
            </div>
          </div>
        </div>
    </div>
  );
}