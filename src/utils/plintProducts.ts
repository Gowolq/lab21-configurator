// Plint products database
export interface PlintProduct {
  serviceCode: string; // The service article code (AFWERKEN-10296, AFWERKEN-10294, Leg-binnenhoekverste)
  productCode: string;
  name: string;
  eenheid: string; // "m1" for plinten (strekkende meter), "Stuk" for binnenhoekverstek
  snijverlies: number; // Percentage snijverlies (15% for plinten)
  pakgrootte: number; // Pakgrootte in meters (2.4 for plinten)
  omrekenfactor?: number; // Omrekenfactor for conversion products (optional)
}

export const plintProducts: PlintProduct[] = [
  {
    serviceCode: "AFWERKEN-10296",
    productCode: "PLI-MOD-90x12",
    name: "MDF Moderne plint wit 90x12mm watervast",
    eenheid: "m1",
    snijverlies: 15,
    pakgrootte: 2.4
  },
  {
    serviceCode: "AFWERKEN-10294",
    productCode: "PLI-REN-85x22",
    name: "MDF Renovatieplint klassiek 85x22 RAL 9010",
    eenheid: "m1",
    snijverlies: 15,
    pakgrootte: 2.4
  },
  // Binnenhoekverstek plint producten
  {
    serviceCode: "Leg-binnenhoekverste",
    productCode: "PLI-AFWERK-5x23-EIKEN",
    name: "Afwerklijst 5x23 eiken gelakt",
    eenheid: "Stuk",
    snijverlies: 0,
    pakgrootte: 1,
    omrekenfactor: 5
  },
  {
    serviceCode: "Leg-binnenhoekverste",
    productCode: "PLI-REN-130x15",
    name: "MDF Renaissance plint 130x15 wit voorgel. RAL 9010",
    eenheid: "Stuk",
    snijverlies: 0,
    pakgrootte: 1
  },
  {
    serviceCode: "Leg-binnenhoekverste",
    productCode: "PLI-REN-120x15",
    name: "MDF Renaissance plint 120x15 wit voorgel. RAL 9010",
    eenheid: "Stuk",
    snijverlies: 0,
    pakgrootte: 1
  },
  {
    serviceCode: "Leg-binnenhoekverste",
    productCode: "PLI-BAR-130x18",
    name: "MDF Barok plint 130x18 wit voorgelakt RAL 9010",
    eenheid: "Stuk",
    snijverlies: 0,
    pakgrootte: 1
  },
  {
    serviceCode: "Leg-binnenhoekverste",
    productCode: "PLI-BAR-120x15",
    name: "MDF Barok plint 120x15 wit voorgel. RAL 9010",
    eenheid: "Stuk",
    snijverlies: 0,
    pakgrootte: 1
  },
  {
    serviceCode: "Leg-binnenhoekverste",
    productCode: "PLI-ROM-130x18",
    name: "MDF Romantische plint 130x18 wit voorgel. RAL 9010",
    eenheid: "Stuk",
    snijverlies: 0,
    pakgrootte: 1
  },
  {
    serviceCode: "Leg-binnenhoekverste",
    productCode: "PLI-ROM-120x15",
    name: "MDF Romantische plint 120x15 wit voorgel. RAL 9010",
    eenheid: "Stuk",
    snijverlies: 0,
    pakgrootte: 1
  },
  {
    serviceCode: "Leg-binnenhoekverste",
    productCode: "PLI-RET-70x15",
    name: "MDF Retro plint 70x15 wit voorgelakt RAL 9010",
    eenheid: "Stuk",
    snijverlies: 0,
    pakgrootte: 1
  },
  {
    serviceCode: "Leg-binnenhoekverste",
    productCode: "PLI-KOL-120x15",
    name: "MDF Koloniale plint 120x15 wit voorgel. RAL 9010",
    eenheid: "Stuk",
    snijverlies: 0,
    pakgrootte: 1
  },
  {
    serviceCode: "Leg-binnenhoekverste",
    productCode: "PLI-MOD-90x12-VERSTEK",
    name: "MDF Moderne plint 90x12mm wit voorgelakt RAL 9010",
    eenheid: "Stuk",
    snijverlies: 0,
    pakgrootte: 1
  },
  {
    serviceCode: "Leg-binnenhoekverste",
    productCode: "PLI-MOD-70x15",
    name: "MDF Moderne plint 70x15 wit voorgelakt RAL 9010",
    eenheid: "Stuk",
    snijverlies: 0,
    pakgrootte: 1
  },
  {
    serviceCode: "Leg-binnenhoekverste",
    productCode: "PLI-MOD-70x12",
    name: "MDF Moderne plint 70x12 wit voorgelakt RAL 9010",
    eenheid: "Stuk",
    snijverlies: 0,
    pakgrootte: 1
  },
  {
    serviceCode: "Leg-binnenhoekverste",
    productCode: "PLI-MOD-60x12",
    name: "MDF Moderne plint 60x12 wit voorgelakt RAL 9010",
    eenheid: "Stuk",
    snijverlies: 0,
    pakgrootte: 1
  },
  {
    serviceCode: "Leg-binnenhoekverste",
    productCode: "PLI-KWARTROND-18x18",
    name: "MDF Kwartrond 18x18 wit voorgel. RAL 9010",
    eenheid: "Stuk",
    snijverlies: 0,
    pakgrootte: 1
  }
];

// Helper function to get plint product by service code
export function getPlintProductByServiceCode(serviceCode: string): PlintProduct | undefined {
  return plintProducts.find(p => p.serviceCode === serviceCode);
}

// Helper function to get all plint products by service code
export function getAllPlintProductsByServiceCode(serviceCode: string): PlintProduct[] {
  return plintProducts.filter(p => p.serviceCode === serviceCode);
}

// Helper function to get plint product by product code
export function getPlintProductByProductCode(productCode: string): PlintProduct | undefined {
  return plintProducts.find(p => p.productCode === productCode);
}

// Helper function to check if a service is a plint service
// NOTE: Leg-binnenhoekverste is a SERVICE, not a plint product, so it's excluded
export function isPlintService(serviceTitle: string): boolean {
  return serviceTitle.includes("AFWERKEN-10296") || 
         serviceTitle.includes("AFWERKEN-10294");
}

// Helper function to extract service code from service title
export function extractServiceCode(serviceTitle: string): string | null {
  // Check for Leg-binnenhoekverste format
  if (serviceTitle.includes("Leg-binnenhoekverste")) {
    return "Leg-binnenhoekverste";
  }
  // Check for AFWERKEN format
  const afwerkenMatch = serviceTitle.match(/^(AFWERKEN-\d+)/);
  return afwerkenMatch ? afwerkenMatch[1] : null;
}