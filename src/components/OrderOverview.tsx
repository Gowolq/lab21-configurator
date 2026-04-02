import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { useTranslation } from "../utils/translations";
import React from "react";
import { getPlintProductByServiceCode, getPlintProductByProductCode, isPlintService, extractServiceCode } from "../utils/plintProducts";
import { legserviceArticles } from "../utils/legserviceArticles";
import { ConfigurationSummary } from "./ConfigurationSummary";

// Removed image imports - not needed for order overview functionality
// import sensationProductImage from "figma:asset/6b8dfcafc888a2431eeaac6e7998cc51d6d581d6.png";
// import lab21ProductImage from "figma:asset/e8b8410edc7922949e8b19027902a3bcc04a319a.png";
// import moduleoProductImage from "figma:asset/83e05501537a55865214cf331eaebf15605dce74.png";
// import cortinaProductImage from "figma:asset/94657cd42fa0f6002ea1a8392c2b048c9c20539d.png";
// import forboProductImage from "figma:asset/6616c34e1305311c31f662272b4937a8dc30250d.png";

const mockProducts: Product[] = [
  { id: "1", name: "Sensation PVC 1219,2x228,6x2mm 0,2 Eiken Geborsteld Lichtgrijs #", code: "1-Xx-TW6151-1" },
  { id: "2", name: "LAB21 Luxury Vinyl Plank Klik 1820x190x4mm 0.30", code: "LVP-001-NAT" },
  { id: "3", name: "Moduleo Transform Woods Baltimore Pine 24440", code: "MOD-24440" },
  { id: "4", name: "Cortina Prestige Tegel Klik 610x610x4.5mm 0.55", code: "COR-976312" },
  { id: "5", name: "Forbo Allura Flex Wood Lijm 1000x150x2.5mm", code: "FOR-55032" },
  { id: "6", name: "Quick-Step Impressive Ultra Patina Eik Grijs IMU1858", code: "QS-IMU1858" },
  { id: "7", name: "Kaindl Natural Touch Wide Plank Hemlock Ontario", code: "KAI-37267" },
  { id: "8", name: "Berry Alloc Original Gyant XL Natural 62001368", code: "BAL-62001368" },
  { id: "9", name: "Solidfloor Earth Collection Siberian Oak", code: "SOL-2006" },
  { id: "10", name: "Kahrs Artisan Eiken Concrete 151N9AEKF7KW190", code: "KAH-151N9AEK" },
  { id: "11", name: "Boen Chaletino Eiken Country White", code: "BOE-CHB84TFD" }
];

interface Product {
  id: string;
  name: string;
  code: string;
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
  eenheid?: string; // "M2", "M1", of "Stuk"
  snijverlies?: number; // Percentage of cutting waste
  pakgrootte?: number; // Package size in square meters
}

interface Room {
  id: number;
  level: string;
  roomName: string;
  surface: string;
  area: number;
  product?: string;
  selectedProduct?: Product;
  collapsed?: boolean;
  length?: number; // Lengte in meters (voor L/B berekening)
  width?: number; // Breedte in meters (voor L/B berekening)
}

interface RelationData {
  customerName: string;
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

interface ServiceState {
  roomId: number;
  serviceType: string;
  serviceTitle: string;
  area: number;
  isActive: boolean;
  isMandatory: boolean;
  isSelected?: boolean;
  selectedFloors?: string[]; // For voorbereiden services - which floors are selected
  length?: number; // For L/B berekening articles - length in meters
  width?: number; // For L/B berekening articles - width in meters
}

interface OrderOverviewProps {
  rooms: Room[];
  services: ServiceState[];
  relationData?: RelationData;
  onBack: () => void;
  onClose: () => void;
  onSubmit?: () => void;
  language: string;
  isLastConfigurator?: boolean;
}

interface OrderLine {
  type: 'product' | 'service';
  roomId?: number;
  roomName?: string;
  description: string;
  quantity: number;
  unit: string;
  isMandatory?: boolean;
  productCode?: string;
  surface?: string;
}

export function OrderOverview({ rooms, services, relationData, onBack, onClose, onSubmit, language, isLastConfigurator = false }: OrderOverviewProps) {
  const t = useTranslation(language);

  console.log('🎯 OrderOverview RENDER - isLastConfigurator:', isLastConfigurator);
  console.log('🎯 Services passed to OrderOverview:', services.length);

  // Helper function to get product code from product name
  const getProductCode = (productName: string, selectedProduct?: Product): string => {
    // First try to get from selectedProduct
    if (selectedProduct?.code) {
      return selectedProduct.code;
    }
    
    // Otherwise lookup in mockProducts by name
    const foundProduct = mockProducts.find(p => p.name === productName);
    if (foundProduct?.code) {
      return foundProduct.code;
    }
    
    // If still not found, check if another room already has this product with a code
    // This ensures that the same product gets the same code across all rooms
    const existingRoom = rooms.find(r => 
      r.product === productName && 
      r.selectedProduct?.code
    );
    
    return existingRoom?.selectedProduct?.code || '-';
  };

  // Filter rooms with products
  const roomsWithProducts = rooms.filter(room => 
    room.product && 
    room.surface && 
    room.area > 0
  );

  // Get active services (mandatory + selected optional)
  const mandatoryServices = services.filter(service => service.isMandatory && service.isActive);
  const selectedOptionalServices = services.filter(service => 
    !service.isMandatory && (service.isSelected || service.area > 0)
  );
  const allSelectedServices = [...mandatoryServices, ...selectedOptionalServices];

  console.log('🔍 OrderOverview DEBUG:');
  console.log('  Total services:', services.length);
  console.log('  All services:', services);
  console.log('  Mandatory services (filtered):', mandatoryServices);
  console.log('  Selected optional services (filtered):', selectedOptionalServices);
  console.log('  Services with VB-INSTALL:', services.filter(s => s.serviceTitle?.includes('VB-INSTALL')));
  console.log('  Services voorbereiden type:', services.filter(s => s.serviceType === 'voorbereiden'));

  // Generate product order lines
  const productOrderLines: OrderLine[] = roomsWithProducts.map(room => {
    const levelText = t.levels[room.level as keyof typeof t.levels] || room.level;
    
    // Debug: log product information
    console.log('🔍 Room product info:', {
      roomId: room.id,
      product: room.product,
      selectedProduct: room.selectedProduct,
      selectedProductCode: room.selectedProduct?.code
    });
    
    return {
      type: 'product',
      roomId: room.id,
      roomName: room.roomName,
      description: room.product || '',
      quantity: room.area,
      unit: 'm2',
      productCode: getProductCode(room.product || '', room.selectedProduct),
      surface: room.surface
    };
  });

  // Calculate adjustment lines for cutting waste and rounding per product
  const productAdjustments: OrderLine[] = [];
  
  // Group rooms by product to calculate adjustments
  const productGroups = roomsWithProducts.reduce((acc, room) => {
    const productName = room.product || '';
    if (!acc[productName]) {
      acc[productName] = {
        rooms: [],
        totalIngevoerd: 0,
        snijverlies: room.selectedProduct?.snijverlies || 0,
        pakgrootte: room.selectedProduct?.pakgrootte || 0,
        productCode: getProductCode(productName, room.selectedProduct),
        firstRoom: room
      };
    }
    acc[productName].rooms.push(room);
    acc[productName].totalIngevoerd += room.area;
    return acc;
  }, {} as Record<string, { rooms: Room[]; totalIngevoerd: number; snijverlies: number; pakgrootte: number; productCode: string; firstRoom: Room }>);

  // Create adjustment lines for each product
  Object.entries(productGroups).forEach(([productName, group]) => {
    const inclSnijverlies = group.totalIngevoerd * (1 + group.snijverlies / 100);
    let teLeveren = inclSnijverlies;
    
    if (group.pakgrootte > 0) {
      const pakken = Math.ceil(inclSnijverlies / group.pakgrootte);
      teLeveren = pakken * group.pakgrootte;
    }
    
    const adjustment = teLeveren - group.totalIngevoerd;
    
    if (adjustment > 0) {
      // Get product code from the first room in this group
      const productCodeToUse = getProductCode(productName, group.firstRoom.selectedProduct);
      
      productAdjustments.push({
        type: 'product',
        description: `${productName} - ${t.totalsSummary.cuttingWasteAndRounding}`,
        quantity: parseFloat(adjustment.toFixed(2)),
        unit: 'm2',
        productCode: productCodeToUse,
        surface: ''
      });
    }
  });

  // Generate plint product lines from selected plint services
  const plintProductLines: OrderLine[] = [];
  allSelectedServices.forEach(service => {
    if (isPlintService(service.serviceTitle)) {
      const serviceCode = extractServiceCode(service.serviceTitle);
      if (serviceCode) {
        const plintProduct = getPlintProductByServiceCode(serviceCode);
        if (plintProduct && service.area > 0) {
          const room = rooms.find(r => r.id === service.roomId);
          plintProductLines.push({
            type: 'product',
            roomId: service.roomId,
            roomName: room?.roomName,
            description: plintProduct.name,
            quantity: service.area,
            unit: 'm1',
            productCode: plintProduct.productCode,
            surface: room?.surface || ''
          });
        }
      }
    }
  });

  // Calculate adjustment lines for plint products (snijverlies & afronding)
  const plintAdjustments: OrderLine[] = [];
  
  // Group plint products by product name to calculate adjustments
  const plintGroups = plintProductLines.reduce((acc, line) => {
    const productName = line.description;
    if (!acc[productName]) {
      acc[productName] = {
        lines: [],
        totalIngevoerd: 0,
        productCode: line.productCode || '',
        firstLine: line
      };
    }
    acc[productName].lines.push(line);
    acc[productName].totalIngevoerd += line.quantity;
    return acc;
  }, {} as Record<string, { lines: OrderLine[]; totalIngevoerd: number; productCode: string; firstLine: OrderLine }>);

  // Create adjustment lines for each plint product
  Object.entries(plintGroups).forEach(([productName, group]) => {
    // Get plint product info
    const firstLine = group.firstLine;
    const plintProduct = getPlintProductByProductCode(firstLine.productCode || '');
    
    if (plintProduct) {
      const snijverlies = plintProduct.snijverlies; // 15%
      const pakgrootte = plintProduct.pakgrootte; // 2.4 m1
      
      const inclSnijverlies = group.totalIngevoerd * (1 + snijverlies / 100);
      const pakken = Math.ceil(inclSnijverlies / pakgrootte);
      const teLeveren = pakken * pakgrootte;
      
      const adjustment = teLeveren - group.totalIngevoerd;
      
      if (adjustment > 0) {
        plintAdjustments.push({
          type: 'product',
          description: `${productName} - ${t.totalsSummary.cuttingWasteAndRounding}`,
          quantity: parseFloat(adjustment.toFixed(2)),
          unit: 'm1',
          productCode: group.productCode,
          surface: ''
        });
      }
    }
  });

  // Helper function to extract product code and description from service title
  const parseServiceTitle = (serviceTitle: string) => {
    // Match pattern like "VW-INSTALL-001 - Description" or "VW-REMOVE-001 - Description"
    const match = serviceTitle.match(/^([A-Z]+-[A-Z]+-\\d+)\\s*-\\s*(.+)$/);
    if (match) {
      return {
        productCode: match[1],
        description: match[2]
      };
    }
    // If no match, return empty code and full title as description
    return {
      productCode: '',
      description: serviceTitle
    };
  };

  // Helper function to calculate quantity based on article's berekening type
  const calculateQuantity = (productCode: string, serviceArea: number, service?: ServiceState): number => {
    // Find the article in legserviceArticles
    const article = legserviceArticles.find(a => a.productCode === productCode);
    
    if (!article) {
      return serviceArea; // Default to service area if article not found
    }
    
    // Check if berekening is "Omrekenen"
    if (article.berekening === "Omrekenen" && article.omrekenfactor) {
      // Divide by omrekenfactor and round up
      const calculatedQuantity = Math.ceil(serviceArea / article.omrekenfactor);
      console.log(`📊 Omrekenen berekening: ${serviceArea} / ${article.omrekenfactor} = ${serviceArea / article.omrekenfactor} → ${calculatedQuantity} (afgerond naar boven)`);
      return calculatedQuantity;
    }
    
    // Check if berekening is "Maat" (Lengte/Breedte)
    if (article.berekening === "Maat") {
      // Use length and width from service if available
      if (service?.length && service?.width) {
        const calculatedQuantity = service.length * service.width;
        console.log(`📊 Maat berekening: ${service.length} × ${service.width} = ${calculatedQuantity}`);
        return calculatedQuantity;
      }
      // If no length/width, return service area as fallback
      console.log(`📊 Maat berekening: geen lengte/breedte, using serviceArea ${serviceArea}`);
      return serviceArea;
    }
    
    // For all other berekening types, return the service area as-is
    return serviceArea;
  };

  // Helper function to get unit based on article's berekening type
  const getUnit = (productCode: string, defaultUnit: string): string => {
    // Find the article in legserviceArticles
    const article = legserviceArticles.find(a => a.productCode === productCode);
    
    if (!article) {
      return defaultUnit; // Default unit if article not found
    }
    
    // If berekening is "Omrekenen", use "Stuk" as unit
    if (article.berekening === "Omrekenen") {
      return "Stuk";
    }
    
    // For other berekening types, use article's eenheid or default
    return article.eenheid || defaultUnit;
  };

  // Generate service order lines - group by mandatory/optional
  const mandatoryServiceLines: OrderLine[] = mandatoryServices
    .filter(service => !isPlintService(service.serviceTitle)) // Exclude plint services (already added as products)
    .map(service => {
    const room = rooms.find(r => r.id === service.roomId);
    const { productCode, description } = parseServiceTitle(service.serviceTitle);
    
    // Add floor information if available (for voorbereiden services)
    let fullDescription = description;
    if (service.serviceType === 'voorbereiden' && service.selectedFloors && service.selectedFloors.length > 0) {
      fullDescription = `${description} / Verdieping: ${service.selectedFloors.join('; ')}`;
    }
    
    return {
      type: 'service',
      roomId: service.roomId,
      roomName: room?.roomName,
      description: fullDescription,
      quantity: calculateQuantity(productCode, service.area, service),
      unit: getUnit(productCode, service.serviceType.includes('container') ? 'stuks' : 'm2'),
      isMandatory: true,
      productCode: productCode,
      surface: room?.surface
    };
  });

  const optionalServiceLines: OrderLine[] = selectedOptionalServices
    .filter(service => !isPlintService(service.serviceTitle)) // Exclude plint services (already added as products)
    .map(service => {
    const room = rooms.find(r => r.id === service.roomId);
    const { productCode, description } = parseServiceTitle(service.serviceTitle);
    
    return {
      type: 'service',
      roomId: service.roomId,
      roomName: room?.roomName,
      description: description,
      quantity: calculateQuantity(productCode, service.area, service),
      unit: getUnit(productCode, service.serviceType.includes('container') ? 'stuks' : 'm2'),
      isMandatory: false,
      productCode: productCode,
      surface: room?.surface
    };
  });

  // Calculate totals
  const totalProductLines = productOrderLines.length + plintProductLines.length;
  const totalMandatoryServiceLines = mandatoryServiceLines.length;
  const totalOptionalServiceLines = optionalServiceLines.length;
  const grandTotalLines = totalProductLines + totalMandatoryServiceLines + totalOptionalServiceLines;

  // Calculate total price
  // Products: €30 per m2
  const productsTotalM2 = productOrderLines.reduce((sum, line) => sum + line.quantity, 0);
  const plintsTotalM1 = plintProductLines.reduce((sum, line) => sum + line.quantity, 0);
  const productsPrice = (productsTotalM2 * 30) + (plintsTotalM1 * 12); // €30/m2 for floors, €12/m1 for plints
  
  // Services: €15 per m2 for mandatory, €10 per m2 for optional
  const mandatoryServicesM2 = mandatoryServiceLines.reduce((sum, line) => {
    if (line.unit === 'm2') return sum + line.quantity;
    return sum;
  }, 0);
  const optionalServicesM2 = optionalServiceLines.reduce((sum, line) => {
    if (line.unit === 'm2') return sum + line.quantity;
    return sum;
  }, 0);
  const mandatoryServicesPrice = mandatoryServicesM2 * 15;
  const optionalServicesPrice = optionalServicesM2 * 10;
  
  const totalPrice = productsPrice + mandatoryServicesPrice + optionalServicesPrice;

  const handleSubmitToZoho = () => {
    console.log('🔵 🔵 🔵 INDIENEN BUTTON CLICKED - handleSubmitToZoho called 🔵 🔵 🔵');
    console.log('🔵 onSubmit prop exists:', !!onSubmit);
    console.log('🔵 onSubmit type:', typeof onSubmit);
    
    // This would send the order to Zoho CRM
    console.log('Submitting order to Zoho CRM:', {
      relationData,
      products: productOrderLines,
      mandatoryServices: mandatoryServiceLines,
      optionalServices: optionalServiceLines
    });
    
    // Call the parent's onSubmit handler if provided
    console.log('🔵 About to call onSubmit...');
    
    if (onSubmit) {
      console.log('🔵 Calling onSubmit NOW!');
      try {
        onSubmit();
        console.log('🔵 onSubmit completed successfully');
      } catch (error) {
        console.error('🔵 ERROR calling onSubmit:', error);
      }
    } else {
      console.log('🔵 No onSubmit handler provided, showing alert');
      alert(language === 'nl' 
        ? 'Order succesvol ingediend naar Zoho CRM!' 
        : 'Order successfully submitted to Zoho CRM!'
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-screen-2xl mx-auto bg-white">
        <div className="p-4 md:p-6 space-y-4">
          {/* Configuration Summary - Collapsible */}
          <ConfigurationSummary
            rooms={rooms}
            relationData={relationData}
            currentConfigurator="VOORBEREIDEN"
            language={language}
          />

          {/* Product Calculations Section */}
          {Object.keys(productGroups).length > 0 && (
            <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
              {/* Header - Dark green background */}
              <div className="bg-[#2d4724] text-white px-4 py-3">
                <h2 className="text-base font-medium">Product Berekeningen</h2>
              </div>
              
              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-[11px]">
                  <thead className="bg-white border-b border-gray-300">
                    <tr>
                      <th className="text-left py-2 px-3 font-normal">Product Code</th>
                      <th className="text-left py-2 px-3 font-normal">Omschrijving</th>
                      <th className="text-right py-2 px-3 font-normal">Ingevoerd</th>
                      <th className="text-right py-2 px-3 font-normal">Incl snijverlies</th>
                      <th className="text-right py-2 px-3 font-normal">Omgerekend</th>
                      <th className="text-right py-2 px-3 font-normal">Afgerond pak/stuk</th>
                      <th className="text-right py-2 px-3 font-normal">Te leveren</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {Object.entries(productGroups).map(([productName, group], index) => {
                      const inclSnijverlies = group.totalIngevoerd * (1 + group.snijverlies / 100);
                      let omgerekend = inclSnijverlies;
                      let teLeveren = inclSnijverlies;
                      
                      if (group.pakgrootte > 0) {
                        const pakken = Math.ceil(inclSnijverlies / group.pakgrootte);
                        teLeveren = pakken * group.pakgrootte;
                      }
                      
                      return (
                        <tr key={index} className={`border-b border-gray-200 ${index % 2 === 1 ? 'bg-gray-50' : 'bg-white'}`}>
                          <td className="py-2 px-3">{group.productCode}</td>
                          <td className="py-2 px-3">{productName}</td>
                          <td className="py-2 px-3 text-right">{group.totalIngevoerd.toFixed(2)} m2</td>
                          <td className="py-2 px-3 text-right">{inclSnijverlies.toFixed(2)} m2</td>
                          <td className="py-2 px-3 text-right">{omgerekend.toFixed(2)} m2</td>
                          <td className="py-2 px-3 text-right">{teLeveren.toFixed(2)} m2</td>
                          <td className="py-2 px-3 text-right">{teLeveren.toFixed(2)} m2</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Products and Services Section */}
          <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
            {/* Header - Dark green background */}
            <div className="bg-[#2d4724] text-white px-4 py-3">
              <h2 className="text-base font-medium">Producten en Services</h2>
            </div>
            
            {/* Table */}
            <div className="overflow-x-auto">
              {(productOrderLines.length === 0 && mandatoryServiceLines.length === 0 && optionalServiceLines.length === 0) ? (
                <div className="text-center text-gray-500 py-8">
                  {language === 'nl' ? 'Geen producten of services geselecteerd' : 'No products or services selected'}
                </div>
              ) : (
                <table className="w-full text-[11px]">
                  <thead className="bg-white border-b border-gray-300">
                    <tr>
                      <th className="text-left py-2 px-3 font-normal">#</th>
                      <th className="text-left py-2 px-3 font-normal">Product Code</th>
                      <th className="text-left py-2 px-3 font-normal">Omschrijving</th>
                      <th className="text-left py-2 px-3 font-normal">Ruimte</th>
                      <th className="text-left py-2 px-3 font-normal">Ruimte</th>
                      <th className="text-left py-2 px-3 font-normal">Ondergrond</th>
                      <th className="text-left py-2 px-3 font-normal">Type</th>
                      <th className="text-right py-2 px-3 font-normal">Aantal</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {(() => {
                      // Group all items by room, with adjustments at the end
                      const groupedLines: OrderLine[] = [];
                      
                      // Get all unique room IDs from products and services
                      const allRoomIds = new Set<number>();
                      productOrderLines.forEach(line => line.roomId && allRoomIds.add(line.roomId));
                      plintProductLines.forEach(line => line.roomId && allRoomIds.add(line.roomId));
                      mandatoryServiceLines.forEach(line => line.roomId && allRoomIds.add(line.roomId));
                      optionalServiceLines.forEach(line => line.roomId && allRoomIds.add(line.roomId));
                      
                      // Sort room IDs
                      const sortedRoomIds = Array.from(allRoomIds).sort((a, b) => a - b);
                      
                      // For each room, add all its products and services
                      sortedRoomIds.forEach(roomId => {
                        // Add products for this room
                        const roomProducts = productOrderLines.filter(line => line.roomId === roomId);
                        groupedLines.push(...roomProducts);
                        
                        // Add plint products for this room
                        const roomPlints = plintProductLines.filter(line => line.roomId === roomId);
                        groupedLines.push(...roomPlints);
                        
                        // Add mandatory services for this room
                        const roomMandatoryServices = mandatoryServiceLines.filter(line => line.roomId === roomId);
                        groupedLines.push(...roomMandatoryServices);
                        
                        // Add optional services for this room
                        const roomOptionalServices = optionalServiceLines.filter(line => line.roomId === roomId);
                        groupedLines.push(...roomOptionalServices);
                      });
                      
                      // Add all adjustments at the end (order-related, not room-related)
                      groupedLines.push(...productAdjustments);
                      groupedLines.push(...plintAdjustments);
                      
                      return groupedLines.map((line, index) => (
                        <tr key={index} className={`border-b border-gray-200 ${index % 2 === 1 ? 'bg-gray-50' : 'bg-white'}`}>
                          <td className="py-2 px-3">{index + 1}</td>
                          <td className="py-2 px-3">{line.productCode || '-'}</td>
                          <td className="py-2 px-3">{line.description}</td>
                          <td className="py-2 px-3">{line.roomId || ''}</td>
                          <td className="py-2 px-3">{line.roomName || ''}</td>
                          <td className="py-2 px-3">{line.surface || ''}</td>
                          <td className="py-2 px-3">
                            {line.type === 'service' ? (line.isMandatory ? 'Mandatory' : 'Optional') : ''}
                          </td>
                          <td className="py-2 px-3 text-right">
                            {line.quantity.toFixed(2)} {line.unit}
                          </td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Totals Section */}
          <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
            {/* Header - Dark green background */}
            <div className="bg-[#2d4724] text-white px-4 py-3">
              <h2 className="text-base font-medium">Totalen</h2>
            </div>
            
            {/* Totals Grid - 3 columns in one row with lines */}
            <div className="bg-white px-4 py-4">
              <div className="grid grid-cols-3 gap-4 text-center pb-4 border-b-2 border-gray-300">
                <div>
                  <div className="text-sm font-medium mb-1">Producten</div>
                  <div className="text-xl font-semibold">{totalProductLines}</div>
                </div>
                <div>
                  <div className="text-sm font-medium mb-1">Verplichte Services</div>
                  <div className="text-xl font-semibold">{totalMandatoryServiceLines}</div>
                </div>
                <div>
                  <div className="text-sm font-medium mb-1">Optionele Services</div>
                  <div className="text-xl font-semibold">{totalOptionalServiceLines}</div>
                </div>
              </div>
              
              {/* Total Price Section */}
              <div className="pt-4 flex justify-end items-center">
                <div className="text-right space-y-1">
                  <div className="text-2xl font-bold text-[#2d4724]">
                    Totaalprijs € {totalPrice.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="text-xs text-gray-500">
                    inclusief BTW
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Action Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <Button 
              variant="outline" 
              onClick={() => {
                console.log('=====================================');
                console.log('🔵 🔵 🔵 BACK BUTTON CLICKED 🔵 🔵 🔵');
                console.log('Text on button:', 'TERUG');
                console.log('Calling onBack function...');
                console.log('=====================================');
                onBack();
              }}
              className="border-[#2d4724] text-[#2d4724] hover:bg-[#2d4724] hover:text-white px-8 py-2 text-sm font-medium"
              data-testid="back-button"
            >
              TERUG
            </Button>
            <Button 
              onClick={() => {
                console.log('=====================================');
                console.log('🟢 🟢 🟢 SUBMIT BUTTON CLICKED 🟢 🟢 🟢');
                console.log('Text on button:', 'INDIENEN');
                console.log('Calling onSubmit function...');
                console.log('=====================================');
                if (onSubmit) {
                  onSubmit();
                } else {
                  console.warn('⚠️ onSubmit is undefined!');
                }
              }}
              className="bg-[#2d4724] hover:bg-[#1f3319] text-white px-8 py-2 text-sm font-medium"
              type="button"
              data-testid="submit-button"
            >
              INDIENEN
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}