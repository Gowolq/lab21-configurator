// Deze file bevat alle legservice artikelen uit de aangeleverde spreadsheet
// Artikelen met "< 35" in de description zijn verwijderd

export interface LegserviceArticle {
  productCode: string;
  description: string;
  serviceType: string;
  isMandatory: boolean;
  category: string;
  eenheid?: string; // "M2" (vierkante meter), "M1" (strekkende meter), of "Stuk"
  configuratorName?: string; // Configurator naam zoals VOORBEREIDEN-10594
  extraConfigurator?: string; // Extra configurator zoals "Verwijderen"
  hoofdcategorie?: string;
  subcategorie?: string;
  legmethode?: string;
  legpatroon?: string;
  typeVloerverwarming?: string;
  geintegreerdeOndervloer?: string;
  verdieping?: string[];
  ondergrond?: string;
  van?: number;
  tot?: number;
  // vocht verwijderd
  droogbouw?: boolean;
  vve?: boolean;
  laminaat?: boolean;
  klikPvc?: boolean;
  merk?: string;
  berekening?: string; // "Vaste prijs", "Variabel", "Stuk", "Prijs/meter", "Omrekenen", of "Maat"
  aantalMinimum?: number;
  conversie?: number; // Conversie factor voor berekeningen
  omrekenfactor?: number; // Omrekenfactor voor berekeningen (standaard 1)
  // Nieuwe velden gebaseerd op screenshot
  installatie?: string; // "Zwevend", "Gelijmd", etc.
  basisvloer?: string; // "Alle", "Hout", "Beton", etc.
  uitvoeringLeggen?: string; // "Lab21", etc.
  vveMetOnderburen?: string; // "Alle", "Ja", "Nee"
  // Service dependency velden
  verplichtServices?: string[]; // Array van productCodes die verplicht zijn bij deze service
  keuzeServices?: string[]; // Array van productCodes waarvan minimaal 1 gekozen moet worden
  keuzeServicesOptional?: string[]; // Array van productCodes voor optionele keuze (popup, maar niet verplicht)
}

// Legservice artikelen zonder "< 35" prefix (35-9999 m²)
export const legserviceArticles: LegserviceArticle[] = [
  // LEG EGALISEREN - VOORBEREIDEN-10594 - Dummy artikel voor Voorbereiden tab (verplicht)
  // TIJDELIJK: ondergrond filter toegevoegd om "geen services" melding te testen
  {
    productCode: "LEG EGALISEREN",
    description: "Aanvullende kosten van egaliseren. De egaline volgt de dekvloer en zal niet waterpas worden.",
    serviceType: "voorbereiden",
    isMandatory: true,
    category: "Voorbereiden",
    eenheid: "M2",
    configuratorName: "VOORBEREIDEN-10594",
    ondergrond: "Zandcement;Anhydriet;Beton gevlinderd;Gietvloer", // NIET Houten planken - voor test
    van: 35,
    tot: 9999,
    berekening: "Variabel",
    omrekenfactor: 1
  },
  // LEG EGALISEREN - VOORBEREIDEN-10549 - Voor verschillende legpatronen met Gelijmd
  {
    productCode: "LEG EGALISEREN",
    description: "Aanvullende kosten van egaliseren. De egaline volgt de dekvloer en zal niet waterpas worden.",
    serviceType: "Legservice",
    isMandatory: true,
    category: "Montage vloeren",
    eenheid: "M2",
    configuratorName: "VOORBEREIDEN-10549",
    legmethode: "Gelijmd",
    legpatroon: "Rechte stroken",
    typeVloerverwarming: "Geen",
    ondergrond: "Zandcement",
    verdieping: ["Begane grond"],
    vve: true,
    aantalMinimum: 1,
    berekening: "Variabel"
  },
  {
    productCode: "LEG EGALISEREN",
    description: "Aanvullende kosten van egaliseren. De egaline volgt de dekvloer en zal niet waterpas worden.",
    serviceType: "Legservice",
    isMandatory: true,
    category: "Montage vloeren",
    eenheid: "M2",
    configuratorName: "VOORBEREIDEN-10549",
    legmethode: "Gelijmd",
    legpatroon: "Tegel",
    typeVloerverwarming: "Geen",
    ondergrond: "Zandcement",
    verdieping: ["Begane grond"],
    vve: true,
    aantalMinimum: 1,
    berekening: "Variabel"
  },
  {
    productCode: "LEG EGALISEREN",
    description: "Aanvullende kosten van egaliseren. De egaline volgt de dekvloer en zal niet waterpas worden.",
    serviceType: "Legservice",
    isMandatory: true,
    category: "Montage vloeren",
    eenheid: "M2",
    configuratorName: "VOORBEREIDEN-10549",
    legmethode: "Gelijmd",
    legpatroon: "Weense punt",
    typeVloerverwarming: "Geen",
    ondergrond: "Zandcement",
    verdieping: ["Begane grond"],
    vve: true,
    aantalMinimum: 1,
    berekening: "Variabel"
  },
  {
    productCode: "LEG EGALISEREN",
    description: "Aanvullende kosten van egaliseren. De egaline volgt de dekvloer en zal niet waterpas worden.",
    serviceType: "Legservice",
    isMandatory: true,
    category: "Montage vloeren",
    eenheid: "M2",
    configuratorName: "VOORBEREIDEN-10549",
    legmethode: "Gelijmd",
    legpatroon: "Visgraat",
    typeVloerverwarming: "Geen",
    ondergrond: "Zandcement",
    verdieping: ["Begane grond"],
    vve: true,
    aantalMinimum: 1,
    berekening: "Variabel"
  },
  {
    productCode: "LEG EGALISEREN",
    description: "Aanvullende kosten van egaliseren. De egaline volgt de dekvloer en zal niet waterpas worden.",
    serviceType: "Legservice",
    isMandatory: true,
    category: "Montage vloeren",
    eenheid: "M2",
    configuratorName: "VOORBEREIDEN-10549",
    legmethode: "Gelijmd",
    legpatroon: "Walvisgraat",
    typeVloerverwarming: "Geen",
    ondergrond: "Zandcement",
    verdieping: ["Begane grond"],
    vve: true,
    aantalMinimum: 1,
    berekening: "Variabel"
  },
  {
    productCode: "LEG EGALISEREN",
    description: "Aanvullende kosten van egaliseren. De egaline volgt de dekvloer en zal niet waterpas worden.",
    serviceType: "Legservice",
    isMandatory: true,
    category: "Montage vloeren",
    eenheid: "M2",
    configuratorName: "VOORBEREIDEN-10549",
    legmethode: "Gelijmd",
    legpatroon: "Patroon",
    typeVloerverwarming: "Geen",
    ondergrond: "Zandcement",
    verdieping: ["Begane grond"],
    vve: true,
    aantalMinimum: 1,
    berekening: "Variabel"
  },
  {
    productCode: "LEG EGALISEREN",
    description: "Aanvullende kosten van egaliseren. De egaline volgt de dekvloer en zal niet waterpas worden.",
    serviceType: "Legservice",
    isMandatory: true,
    category: "Montage vloeren",
    eenheid: "M2",
    configuratorName: "VOORBEREIDEN-10549",
    legmethode: "Gelijmd",
    legpatroon: "Hongaarse punt",
    typeVloerverwarming: "Geen",
    ondergrond: "Zandcement",
    verdieping: ["Begane grond"],
    vve: true,
    aantalMinimum: 1,
    berekening: "Variabel"
  },
  {
    productCode: "Leg-2de-egaliseer",
    description: "2e keer egaliseren (2 bewerkingen). De egaline volgt de dekvloer en zal niet waterpas worden.",
    serviceType: "Legservice",
    isMandatory: true,
    category: "Montage vloeren",
    eenheid: "M2",
    configuratorName: "VOORBEREIDEN-10617",
    hoofdcategorie: "PVC",
    subcategorie: "Montage vloeren",
    legmethode: "Klikverbinding",
    legpatroon: "Rechte stroken",
    typeVloerverwarming: "Gebonden",
    ondergrond: "Zandcement",
    van: 1,
    tot: 34
  },
  {
    productCode: "Leg-2de-egaliseer",
    description: "2e keer egaliseren (2 bewerkingen). De egaline volgt de dekvloer en zal niet waterpas worden.",
    serviceType: "Legservice",
    isMandatory: true,
    category: "Montage vloeren",
    eenheid: "M2",
    configuratorName: "VOORBEREIDEN-10618",
    hoofdcategorie: "PVC",
    subcategorie: "Montage vloeren",
    legmethode: "Gelijmd",
    legpatroon: "Visgraat",
    typeVloerverwarming: "Gefreesd",
    ondergrond: "Zandcement",
    van: 1,
    tot: 34
  },
  {
    productCode: "Leg-pvcklik-visg",
    description: "LEG PVC KLIK VISGRAAT Basis kosten voor het plaatsen van een pvc-klik visgraat vloer (evt. incl. plaatsen ondervloer op rol).",
    serviceType: "Legservice",
    isMandatory: true,
    category: "Montage vloeren",
    eenheid: "M2",
    configuratorName: "VOORBEREIDEN-10619",
    hoofdcategorie: "PVC",
    subcategorie: "Montage vloeren",
    legmethode: "Klikverbinding",
    legpatroon: "Visgraat",
    typeVloerverwarming: "Noppen platen",
    ondergrond: "Zandcement",
    van: 35,
    tot: 9999
  },
  {
    productCode: "leg-PVCklik",
    description: "LEG PVC KLIK Basis kosten voor het plaatsen van een pvc-klik vloer (evt. incl. plaatsen ondervloer op rol).",
    serviceType: "Legservice",
    isMandatory: true,
    category: "Montage vloeren",
    eenheid: "M2",
    configuratorName: "Vloeren",
    hoofdcategorie: "PVC",
    subcategorie: "PVC",
    legmethode: "Klikverbinding",
    installatie: "Zwevend",
    basisvloer: "Alle",
    uitvoeringLeggen: "Lab21",
    // Optionele keuze voor ondervloer artikelen
    keuzeServicesOptional: ["4944250419", "4929130519"]
    // Geen legpatroon, typeVloerverwarming, ondergrond, vveMetOnderburen, geintegreerdeOndervloer filters
    // Geen van/tot waarden - artikel is breed inzetbaar voor alle situaties
  },
  // Ondervloer artikelen voor leg-PVCklik (optionele keuze)
  {
    productCode: "4944250419",
    description: "LAB21 Trans Klik PVC ondervloer 7mm",
    serviceType: "Legservice",
    isMandatory: false,
    category: "Accessoires",
    eenheid: "M2",
    configuratorName: "Vloeren",
    hoofdcategorie: "Accessoires",
    subcategorie: "Hulpmaterialen",
    merk: "LAB21",
    berekening: "Variabel",
    van: 0,
    tot: 9999
  },
  {
    productCode: "4929130519",
    description: "LAB21 klik PVC ondervloer 10dB 1,5mm",
    serviceType: "Legservice",
    isMandatory: false,
    category: "Accessoires",
    eenheid: "M2",
    configuratorName: "Vloeren",
    hoofdcategorie: "Accessoires",
    subcategorie: "Hulpmaterialen",
    merk: "LAB21",
    berekening: "Variabel",
    van: 0,
    tot: 9999
  },
  {
    productCode: "861202",
    description: "LAB21 vochtwerende folie 1mm",
    serviceType: "Legservice",
    isMandatory: false,
    category: "Accessoires",
    eenheid: "M2",
    configuratorName: "Vloeren",
    hoofdcategorie: "Accessoires",
    subcategorie: "Hulpmaterialen",
    merk: "LAB21",
    berekening: "Variabel",
    van: 0,
    tot: 9999
  },
  {
    productCode: "Leg-6mmegaliseren",
    description: "LEG 6MM EGALISEREN Aanvullende kosten voor het egaliseren tot maximaal 6 mm. De egaline volgt de dekvloer en zal niet waterpas worden.",
    serviceType: "Legservice",
    isMandatory: false,
    category: "Montage vloeren",
    eenheid: "M2",
    configuratorName: "VOORBEREIDEN-10621",
    hoofdcategorie: "PVC",
    subcategorie: "Montage vloeren",
    legmethode: "Klikverbinding",
    legpatroon: "Rechte stroken",
    typeVloerverwarming: "Noppen platen",
    ondergrond: "Zandcement",
    van: 35,
    tot: 9999
  },

  // ========== DUMMY SERVICES VOOR DIVERSE CATEGORIEËN ==========

  // ALGEMENE LEGSERVICE - ALTIJD ZICHTBAAR (Mandatory)
  {
    productCode: "LS-INSTALL-001",
    description: "Voorbereiden Ondergrond - Basiswerkzaamheden voor het voorbereiden van de ondergrond voor leggen",
    serviceType: "Legservice",
    isMandatory: true,
    category: "Installatie",
    eenheid: "M2",
    configuratorName: "VOORBEREIDEN-10594",
    subcategorie: "Voorbereiding",
    laminaat: true,
    klikPvc: true,
    merk: "Lab21",
    geintegreerdeOndervloer: "Nee",
    vve: false,
    // GEEN filters - altijd zichtbaar!
    van: 35,
    tot: 9999
  },
  {
    productCode: "LS-INSTALL-002",
    description: "Leggen Vloer - Basiskosten voor het leggen van de vloer",
    serviceType: "Legservice",
    isMandatory: true,
    category: "Installatie",
    eenheid: "M2",
    configuratorName: "VOORBEREIDEN-10595",
    subcategorie: "Montage",
    laminaat: true,
    klikPvc: true,
    merk: "Quick-Step",
    geintegreerdeOndervloer: "Ja",
    vve: false,
    // GEEN filters - altijd zichtbaar!
    van: 35,
    tot: 9999
  },
  // VOORBEELD: Optionele service met dependencies
  {
    productCode: "LS-OPT-HEATING",
    description: "Vloerverwarming Installeren - Complete installatie van vloerverwarming systeem",
    serviceType: "Legservice",
    isMandatory: false,
    category: "Installatie",
    eenheid: "M2",
    configuratorName: "VOORBEREIDEN-10650",
    subcategorie: "Vloerverwarming",
    // Deze optionele service triggert verplichte en keuze sub-services
    verplichtServices: ["LS-HEAT-INSUL", "LS-HEAT-CHECK"], // Verplichte sub-services
    keuzeServices: ["LS-HEAT-CABLE-A", "LS-HEAT-CABLE-B", "LS-HEAT-CABLE-C"], // Keuze (minimaal 1)
    van: 35,
    tot: 9999
  },
  // Sub-services voor vloerverwarming (verplicht)
  {
    productCode: "LS-HEAT-INSUL",
    description: "Isolatie Aanbrengen - Verplichte isolatie voor vloerverwarming",
    serviceType: "Legservice",
    isMandatory: true,
    category: "Vloerverwarming Sub-services",
    eenheid: "M2",
    van: 35,
    tot: 9999
  },
  {
    productCode: "LS-HEAT-CHECK",
    description: "Installatie Controle - Verplichte controle van vloerverwarmingssysteem",
    serviceType: "Legservice",
    isMandatory: true,
    category: "Vloerverwarming Sub-services",
    eenheid: "Stuk",
    van: 35,
    tot: 9999
  },
  // Sub-services voor vloerverwarming (keuze - minimaal 1)
  {
    productCode: "LS-HEAT-CABLE-A",
    description: "Standaard Verwarmingskabel - Budget optie voor kleine ruimtes",
    serviceType: "Legservice",
    isMandatory: false,
    category: "Vloerverwarming Sub-services",
    eenheid: "M2",
    van: 35,
    tot: 9999
  },
  {
    productCode: "LS-HEAT-CABLE-B",
    description: "Premium Verwarmingskabel - Voor optimale warmteverdeling",
    serviceType: "Legservice",
    isMandatory: false,
    category: "Vloerverwarming Sub-services",
    eenheid: "M2",
    van: 35,
    tot: 9999
  },
  {
    productCode: "LS-HEAT-CABLE-C",
    description: "Smart Verwarmingskabel - Met app-besturing en temperatuursensoren",
    serviceType: "Legservice",
    isMandatory: false,
    category: "Vloerverwarming Sub-services",
    eenheid: "M2",
    van: 35,
    tot: 9999
  },
  {
    productCode: "LS-INSTALL-003",
    description: "Afwerken Vloer - Afrondende werkzaamheden na het leggen van de vloer",
    serviceType: "Legservice",
    isMandatory: true,
    category: "Installatie",
    eenheid: "M2",
    configuratorName: "VOORBEREIDEN-10596",
    subcategorie: "Afwerking",
    laminaat: false,
    klikPvc: false,
    merk: "Prestige",
    geintegreerdeOndervloer: "Nee",
    vve: true,
    // GEEN filters - altijd zichtbaar!
    van: 35,
    tot: 9999
  },

  // PVC GELIJMD - DIVERSE VARIANTEN
  {
    productCode: "Leg-pvclijm",
    description: "LEG PVC GELIJMD Basis kosten voor het plaatsen van een gelijmde pvc vloer.",
    serviceType: "Legservice",
    isMandatory: true,
    category: "Lijm PVC",
    eenheid: "M2",
    configuratorName: "VOORBEREIDEN-10597",
    hoofdcategorie: "PVC",
    subcategorie: "Lijm PVC",
    legmethode: "Gelijmd",
    legpatroon: "Rechte stroken",
    typeVloerverwarming: "Gebonden",
    geintegreerdeOndervloer: "Nee",
    merk: "Moduleo",
    van: 35,
    tot: 9999
  },
  {
    productCode: "Leg-pvclijm-visg",
    description: "LEG PVC GELIJMD VISGRAAT Basis kosten voor het plaatsen van een gelijmde pvc visgraat vloer.",
    serviceType: "Legservice",
    isMandatory: true,
    category: "Montage vloeren",
    eenheid: "M2",
    configuratorName: "VOORBEREIDEN-10598",
    hoofdcategorie: "PVC",
    subcategorie: "Montage vloeren",
    legmethode: "Gelijmd",
    legpatroon: "Visgraat",
    typeVloerverwarming: "Gefreesd",
    geintegreerdeOndervloer: "Nee",
    merk: "Prestige",
    ondergrond: "Zandcement",
    van: 35,
    tot: 9999
  },

  // LAMINAAT - DIVERSE VARIANTEN
  {
    productCode: "Leg-laminaat-klik",
    description: "LEG LAMINAAT KLIK Basis kosten voor het plaatsen van een laminaat klik vloer.",
    serviceType: "Legservice",
    isMandatory: true,
    category: "Montage vloeren",
    eenheid: "M2",
    configuratorName: "VOORBEREIDEN-10599",
    hoofdcategorie: "Laminaat",
    subcategorie: "Montage vloeren",
    legmethode: "Klikverbinding",
    legpatroon: "Rechte stroken",
    typeVloerverwarming: "Noppen platen",
    geintegreerdeOndervloer: "Ja",
    merk: "Quick-Step",
    ondergrond: "Zandcement",
    van: 35,
    tot: 9999
  },
  {
    productCode: "Leg-laminaat-visg",
    description: "LEG LAMINAAT VISGRAAT Basis kosten voor het plaatsen van een laminaat visgraat vloer.",
    serviceType: "Legservice",
    isMandatory: true,
    category: "Montage vloeren",
    eenheid: "M2",
    configuratorName: "VOORBEREIDEN-10600",
    hoofdcategorie: "Laminaat",
    subcategorie: "Montage vloeren",
    legmethode: "Klikverbinding",
    legpatroon: "Visgraat",
    typeVloerverwarming: "Gebonden",
    geintegreerdeOndervloer: "Nee",
    merk: "Pergo",
    ondergrond: "Zandcement",
    van: 35,
    tot: 9999
  },
  {
    productCode: "Leg-laminaat-ondervloer",
    description: "ONDERVLOER PLAATSEN Aanvullende kosten voor het plaatsen van ondervloer.",
    serviceType: "Legservice",
    isMandatory: false,
    category: "Montage vloeren",
    eenheid: "M2",
    configuratorName: "VOORBEREIDEN-10601",
    hoofdcategorie: "Laminaat",
    subcategorie: "Montage vloeren",
    legmethode: "Klikverbinding",
    geintegreerdeOndervloer: "Nee",
    merk: "Silent Premium",
    ondergrond: "Zandcement",
    van: 35,
    tot: 9999
  },

  // PARKET - DIVERSE VARIANTEN
  {
    productCode: "Leg-parket-klik",
    description: "LEG PARKET KLIK Basis kosten voor het plaatsen van een parket klik vloer.",
    serviceType: "Legservice",
    isMandatory: true,
    category: "Montage vloeren",
    eenheid: "M2",
    configuratorName: "VOORBEREIDEN-10602",
    hoofdcategorie: "Parket",
    subcategorie: "Massief parket",
    legmethode: "Klikverbinding",
    legpatroon: "Rechte stroken",
    typeVloerverwarming: "Noppen platen",
    geintegreerdeOndervloer: "Nee",
    merk: "Boen",
    ondergrond: "Zandcement",
    van: 35,
    tot: 9999
  },
  {
    productCode: "Leg-parket-visg",
    description: "LEG PARKET VISGRAAT Basis kosten voor het plaatsen van een parket visgraat vloer.",
    serviceType: "Legservice",
    isMandatory: true,
    category: "Montage vloeren",
    eenheid: "M2",
    configuratorName: "VOORBEREIDEN-10603",
    hoofdcategorie: "Parket",
    subcategorie: "Massief parket",
    legmethode: "Klikverbinding",
    legpatroon: "Visgraat",
    typeVloerverwarming: "Gebonden",
    geintegreerdeOndervloer: "Nee",
    merk: "Kährs",
    ondergrond: "Zandcement",
    van: 35,
    tot: 9999
  },
  {
    productCode: "Leg-parket-gelijmd",
    description: "LEG PARKET GELIJMD Basis kosten voor het plaatsen van een gelijmd parket vloer.",
    serviceType: "Legservice",
    isMandatory: true,
    category: "Montage vloeren",
    eenheid: "M2",
    configuratorName: "VOORBEREIDEN-10604",
    hoofdcategorie: "Parket",
    subcategorie: "Massief parket",
    legmethode: "Gelijmd",
    legpatroon: "Rechte stroken",
    typeVloerverwarming: "Gefreesd",
    geintegreerdeOndervloer: "Nee",
    merk: "Haro",
    ondergrond: "Zandcement",
    van: 35,
    tot: 9999
  },
  {
    productCode: "Leg-parket-genageld",
    description: "LEG PARKET GENAGELD Basis kosten voor het plaatsen van een genageld parket vloer.",
    serviceType: "Legservice",
    isMandatory: true,
    category: "Montage vloeren",
    eenheid: "M2",
    configuratorName: "VOORBEREIDEN-10605",
    hoofdcategorie: "Parket",
    subcategorie: "Massief parket",
    legmethode: "Genageld",
    legpatroon: "Rechte stroken",
    geintegreerdeOndervloer: "Nee",
    merk: "Bauwerk",
    ondergrond: "Houten planken",
    van: 35,
    tot: 9999
  },

  // VINYL / DESIGNVLOER
  {
    productCode: "Leg-vinyl-klik",
    description: "LEG VINYL KLIK Basis kosten voor het plaatsen van een vinyl klik vloer.",
    serviceType: "Legservice",
    isMandatory: true,
    category: "Montage vloeren",
    eenheid: "M2",
    configuratorName: "VOORBEREIDEN-10606",
    hoofdcategorie: "Vinyl",
    subcategorie: "Montage vloeren",
    legmethode: "Klikverbinding",
    legpatroon: "Rechte stroken",
    typeVloerverwarming: "Noppen platen",
    geintegreerdeOndervloer: "Ja",
    merk: "Moduleo",
    ondergrond: "Zandcement",
    van: 35,
    tot: 9999
  },
  {
    productCode: "Leg-vinyl-lijm",
    description: "LEG VINYL GELIJMD Basis kosten voor het plaatsen van een gelijmde vinyl vloer.",
    serviceType: "Legservice",
    isMandatory: true,
    category: "Montage vloeren",
    eenheid: "M2",
    configuratorName: "VOORBEREIDEN-10607",
    hoofdcategorie: "Vinyl",
    subcategorie: "Montage vloeren",
    legmethode: "Gelijmd",
    legpatroon: "Rechte stroken",
    typeVloerverwarming: "Gebonden",
    geintegreerdeOndervloer: "Nee",
    merk: "Forbo",
    ondergrond: "Zandcement",
    van: 35,
    tot: 9999
  },
  {
    productCode: "Leg-vinyl-losgelegd",
    description: "LEG VINYL LOSGELEGD Basis kosten voor het losleggen van een vinyl vloer.",
    serviceType: "Legservice",
    isMandatory: true,
    category: "Montage vloeren",
    eenheid: "M2",
    configuratorName: "VOORBEREIDEN-10608",
    hoofdcategorie: "Vinyl",
    subcategorie: "Montage vloeren",
    legmethode: "Losgelegd",
    legpatroon: "Rechte stroken",
    geintegreerdeOndervloer: "Nee",
    merk: "Tarkett",
    ondergrond: "Zandcement",
    van: 35,
    tot: 9999
  },

  // OPTIONELE SERVICES - INSTALLATIE (zonder specifieke product filters, dus altijd zichtbaar)
  {
    productCode: "LS-OPT-001",
    description: "Ondervloer Plaatsen - Plaatsen van ondervloer voor extra comfort en isolatie",
    serviceType: "Legservice",
    isMandatory: false,
    category: "Installatie",
    eenheid: "M2",
    configuratorName: "VOORBEREIDEN-10609",
    subcategorie: "Ondervloer",
    laminaat: true,
    klikPvc: false,
    geintegreerdeOndervloer: "Nee",
    merk: "Quick-Step",
    vve: false,
    // Geen hoofdcategorie, legmethode etc - dus altijd zichtbaar
    van: 35,
    tot: 9999
  },
  {
    productCode: "LS-OPT-002",
    description: "Vochtscherm Aanbrengen - Aanbrengen van vochtscherm/dampscherm ter bescherming",
    serviceType: "Legservice",
    isMandatory: false,
    category: "Installatie",
    eenheid: "M2",
    configuratorName: "VOORBEREIDEN-10610",
    subcategorie: "Vochtbescherming",
    laminaat: true,
    klikPvc: true,
    geintegreerdeOndervloer: "Nee",
    merk: "Lab21",
    vve: false,
    // Geen hoofdcategorie, legmethode etc - dus altijd zichtbaar
    van: 35,
    tot: 9999
  },
  {
    productCode: "LS-OPT-003",
    description: "Extra Isolatie - Extra isolatiewerkzaamheden voor betere prestaties",
    serviceType: "Legservice",
    isMandatory: false,
    category: "Installatie",
    eenheid: "M2",
    configuratorName: "VOORBEREIDEN-10611",
    subcategorie: "Isolatie",
    laminaat: false,
    klikPvc: false,
    geintegreerdeOndervloer: "Nee",
    merk: "Rockwool",
    vve: false,
    // Geen hoofdcategorie, legmethode etc - dus altijd zichtbaar
    van: 35,
    tot: 9999
  },

  // OPTIONELE SERVICES - ALGEMEEN (zonder specifieke product filters, dus altijd zichtbaar)
  {
    productCode: "Leg-primer",
    description: "PRIMER AANBRENGEN Aanvullende kosten voor het aanbrengen van primer op de ondergrond.",
    serviceType: "Legservice",
    isMandatory: false,
    category: "Afwerking",
    eenheid: "M2",
    configuratorName: "VOORBEREIDEN-10612",
    // Geen hoofdcategorie, legmethode etc - dus altijd zichtbaar
    van: 35,
    tot: 9999
  },
  {
    productCode: "Leg-plinten",
    description: "PLINTEN PLAATSEN Aanvullende kosten voor het plaatsen van plinten.",
    serviceType: "Legservice",
    isMandatory: false,
    category: "Afwerking",
    eenheid: "M1",
    configuratorName: "VOORBEREIDEN-10613",
    // Geen hoofdcategorie, legmethode etc - dus altijd zichtbaar
    van: 35,
    tot: 9999
  },
  {
    productCode: "Leg-dorpels",
    description: "DORPELS PLAATSEN Aanvullende kosten voor het plaatsen van dorpels/overgangen.",
    serviceType: "Legservice",
    isMandatory: false,
    category: "Afwerking",
    eenheid: "M1",
    configuratorName: "VOORBEREIDEN-10614",
    // Geen hoofdcategorie, legmethode etc - dus altijd zichtbaar
    van: 35,
    tot: 9999
  },
  {
    productCode: "Leg-beschermlaag",
    description: "BESCHERMLAAG AANBRENGEN Aanvullende kosten voor het aanbrengen van een beschermlaag.",
    serviceType: "Legservice",
    isMandatory: false,
    category: "Afwerking",
    eenheid: "M2",
    configuratorName: "VOORBEREIDEN-10615",
    // Geen hoofdcategorie, legmethode etc - dus altijd zichtbaar
    van: 35,
    tot: 9999
  },
  {
    productCode: "Leg-extra-egaliseren",
    description: "EXTRA EGALISEREN Aanvullende kosten voor extra egalisatie werkzaamheden.",
    serviceType: "Legservice",
    isMandatory: false,
    category: "Voorbereiding",
    eenheid: "M2",
    configuratorName: "VOORBEREIDEN-10616",
    // Geen hoofdcategorie, legmethode etc - dus altijd zichtbaar
    van: 35,
    tot: 9999
  },

  // VOORBEREIDEN SERVICES
  {
    productCode: "VB-INSTALL-001",
    description: "Voorbereiden Installatie",
    serviceType: "voorbereiden",
    isMandatory: true,
    category: "Voorbereiden",
    eenheid: "M2",
    configuratorName: "VOORBEREIDEN-10622",
    ondergrond: "Zandcement;Anhydriet;Beton gevlinderd;Gietvloer", // TIJDELIJK: NIET Houten planken - voor test
    verdieping: ["Begane grond", "1e verdieping"],
    vocht: true,
    droogbouw: false,
    vve: true,
    van: 1,
    tot: 50,
    berekening: "Prijs/meter"
  },
  {
    productCode: "VB-EGAL-001",
    description: "Egaliseren tot 3mm",
    serviceType: "voorbereiden",
    isMandatory: false,
    category: "Voorbereiden",
    eenheid: "M2",
    configuratorName: "VOORBEREIDEN-10623",
    verdieping: ["Begane grond"],
    vocht: false,
    droogbouw: false,
    vve: false,
    van: 0,
    tot: 3,
    berekening: "Prijs/meter"
  },
  {
    productCode: "VB-EGAL-002",
    description: "Egaliseren tot 6mm",
    serviceType: "voorbereiden",
    isMandatory: false,
    category: "Voorbereiden",
    eenheid: "M2",
    configuratorName: "VOORBEREIDEN-10624",
    verdieping: ["1e verdieping", "2e verdieping"],
    vocht: true,
    droogbouw: false,
    vve: true,
    van: 3,
    tot: 6,
    berekening: "Prijs/meter"
  },
  {
    productCode: "VB-EGAL-003",
    description: "Egaliseren tot 10mm",
    serviceType: "voorbereiden",
    isMandatory: false,
    category: "Voorbereiden",
    eenheid: "M2",
    configuratorName: "VOORBEREIDEN-10625",
    verdieping: ["Begane grond", "1e verdieping"],
    vocht: false,
    droogbouw: true,
    vve: false,
    van: 6,
    tot: 10,
    berekening: "Prijs/meter"
  },
  {
    productCode: "VB-EGAL-004",
    description: "Egaliseren Waterpas",
    serviceType: "voorbereiden",
    isMandatory: false,
    category: "Voorbereiden",
    eenheid: "M2",
    configuratorName: "VOORBEREIDEN-10626",
    verdieping: ["2e verdieping"],
    vocht: true,
    droogbouw: true,
    vve: true,
    van: 0,
    tot: 20,
    berekening: "Prijs/meter"
  },
  {
    productCode: "PREP-LAB21-10605",
    description: "Voorbereiden Karakteristieke Tegels LAB21",
    serviceType: "voorbereiden",
    isMandatory: false,
    category: "Voorbereiden",
    eenheid: "M2",
    extraConfigurator: "Droogbouw",
    ondergrond: "Houten planken;Houten platen",
    van: 0,
    tot: 9999,
    berekening: "Prijs/meter"
  },

  // ========== DROOGBOUW SERVICES ==========
  // DROOGBOUW-10006: Verplicht artikel voor 1e, 2e, 3e verdieping
  {
    productCode: "DROOGBOUW-10006",
    description: "DROOGBOUW ONDERVLOER/RENOVATIE - Verplicht artikel voor installatie op verdiepingen (1e, 2e, 3e verdieping).",
    serviceType: "droogbouw",
    isMandatory: false, // Conditioneel verplicht op basis van verdieping
    category: "Droogbouw",
    eenheid: "Stuk",
    extraConfigurator: "Droogbouw",
    subcategorie: "PVC;Laminaat;Hout",
    verdieping: ["first-floor", "second-floor", "third-floor"], // Verplicht voor deze verdiepingen
    ondergrond: "Airbase;Anders;Anhydriet;Anhydriet (zwevend);Beton gevlinderd;Eco2Floor;Fermacell;Gietvloer;Grindvloer;Houten planken;Houten platen;Knauf Brio;Magnesiet;Troffelvloer;Variokomp;Zandcement;Zandcement (zwevend)", // Specifieke basisvloeren
    berekening: "Stuk",
    aantalMinimum: 1,
    van: 0,
    tot: 9999
  },
  {
    productCode: "DROOGBOUW-10005",
    description: "DROOGBOUW - Oppervlakte range 49-99 m².",
    serviceType: "droogbouw",
    isMandatory: false,
    category: "Droogbouw",
    eenheid: "M2",
    extraConfigurator: "Droogbouw",
    subcategorie: "PVC;Laminaat;Hout",
    ondergrond: "Airbase;Anders;Anhydriet;Anhydriet (zwevend);Beton gevlinderd;Eco2Floor;Fermacell;Gietvloer;Grindvloer;Houten planken;Houten platen;Knauf Brio;Magnesiet;Troffelvloer;Variokomp;Zandcement;Zandcement (zwevend)",
    aantalMinimum: 1,
    berekening: "Prijs/meter",
    van: 49,
    tot: 99
  },
  {
    productCode: "DROOGBOUW-10004",
    description: "DROOGBOUW - Oppervlakte range 39-49 m².",
    serviceType: "droogbouw",
    isMandatory: false,
    category: "Droogbouw",
    eenheid: "M2",
    extraConfigurator: "Droogbouw",
    subcategorie: "PVC;Laminaat;Hout",
    ondergrond: "Airbase;Anders;Anhydriet;Anhydriet (zwevend);Beton gevlinderd;Eco2Floor;Fermacell;Gietvloer;Grindvloer;Houten planken;Houten platen;Knauf Brio;Magnesiet;Troffelvloer;Variokomp;Zandcement;Zandcement (zwevend)",
    aantalMinimum: 1,
    berekening: "Prijs/meter",
    van: 39,
    tot: 49
  },
  {
    productCode: "DROOGBOUW-10003",
    description: "DROOGBOUW - Oppervlakte range 29-39 m².",
    serviceType: "droogbouw",
    isMandatory: false,
    category: "Droogbouw",
    eenheid: "M2",
    extraConfigurator: "Droogbouw",
    subcategorie: "PVC;Laminaat;Hout",
    ondergrond: "Airbase;Anders;Anhydriet;Anhydriet (zwevend);Beton gevlinderd;Eco2Floor;Fermacell;Gietvloer;Grindvloer;Houten planken;Houten platen;Knauf Brio;Magnesiet;Troffelvloer;Variokomp;Zandcement;Zandcement (zwevend)",
    aantalMinimum: 1,
    berekening: "Prijs/meter",
    van: 29,
    tot: 39
  },
  {
    productCode: "DROOGBOUW-10002",
    description: "DROOGBOUW - Oppervlakte range 19-29 m².",
    serviceType: "droogbouw",
    isMandatory: false,
    category: "Droogbouw",
    eenheid: "M2",
    extraConfigurator: "Droogbouw",
    subcategorie: "PVC;Laminaat;Hout",
    ondergrond: "Airbase;Anders;Anhydriet;Anhydriet (zwevend);Beton gevlinderd;Eco2Floor;Fermacell;Gietvloer;Grindvloer;Houten planken;Houten platen;Knauf Brio;Magnesiet;Troffelvloer;Variokomp;Zandcement;Zandcement (zwevend)",
    aantalMinimum: 1,
    berekening: "Prijs/meter",
    van: 19,
    tot: 29
  },
  {
    productCode: "DROOGBOUW-10001",
    description: "DROOGBOUW - Oppervlakte range 10-19 m².",
    serviceType: "droogbouw",
    isMandatory: false,
    category: "Droogbouw",
    eenheid: "M2",
    extraConfigurator: "Droogbouw",
    subcategorie: "PVC;Laminaat;Hout",
    ondergrond: "Airbase;Anders;Anhydriet;Anhydriet (zwevend);Beton gevlinderd;Eco2Floor;Fermacell;Gietvloer;Grindvloer;Houten planken;Houten platen;Knauf Brio;Magnesiet;Troffelvloer;Variokomp;Zandcement;Zandcement (zwevend)",
    aantalMinimum: 1,
    berekening: "Prijs/meter",
    van: 10,
    tot: 19
  },
  
  // VOORBEREIDEN artikel met Extra Configurator: Verwijderen
  {
    productCode: "VOORBEREIDEN-10600",
    description: "VOORBEREIDEN - Ondergrond voorbereiden voor leggen op bestaande vloer die verwijderd moet worden",
    serviceType: "voorbereiden",
    isMandatory: true,
    category: "Voorbereiding",
    eenheid: "M2",
    configuratorName: "VOORBEREIDEN-10600",
    extraConfigurator: "Verwijderen",
    hoofdcategorie: "PVC; Laminaat-Hout",
    subcategorie: "PVC; Laminaat-Hout",
    legmethode: "Zweevend",
    typeVloerverwarming: "Geen-Bestaande vloer; Gebonden; Gefreesd; Noppen platen",
    ondergrond: "Laminaat; Marmoleum/Linoleum; Parketvloer (verlijmd); Parketvloer (zwevend); PVC klik; PVC lijm; Tapijt los; Tapijt met ondertapijt los op onder; Tapijt met ondertapijt verlijmd op; Tapijt verlijmd; Tapijtegel los; Tapijtegel verlijmd; Zeil/Vinyl/Novilon los; Zeil/Vinyl/Novilon verlijmd",
    van: 35,
    tot: 9999
  },

  // ========== PLINTEN KEUZE ARTIKELEN (CHOICE) ==========
  {
    productCode: "AFZS-390633",
    description: "Teac Accucraft Wi-Acti Coda WiFi 98mm",
    serviceType: "afwerken",
    isMandatory: false,
    category: "Afwerking",
    eenheid: "Stuk",
    configuratorName: "AFZS-390633",
    subcategorie: "WiFi Systemen",
    merk: "Teac",
    aantalMinimum: 1,
    berekening: "Stuk",
    conversie: 20,
    van: 0,
    tot: 9999
  },
  {
    productCode: "Leg-binnenhoekverste",
    description: "LEG BINNENHOEKVERSTEK Aanvullende kosten voor het binnenhoek verstek zagen (per hoek)",
    serviceType: "afwerken",
    isMandatory: false,
    category: "Afwerking",
    eenheid: "Stuk",
    configuratorName: "Leg-binnenhoekverste",
    subcategorie: "Montage",
    aantalMinimum: 1,
    berekening: "Stuk",
    van: 0,
    tot: 9999
  },
  {
    productCode: "AFWERKEN-10584",
    description: "LEG DEURMAT Aanvullende kosten voor het pasmaken en snijden van de te plaatsen mat",
    serviceType: "afwerken",
    isMandatory: false,
    category: "Afwerking",
    eenheid: "Stuk",
    configuratorName: "AFWERKEN-10584",
    subcategorie: "Montage",
    aantalMinimum: 10,
    berekening: "Stuk",
    keuzeServicesOptional: ["XCX-705-200", "XCX-705-135", "XCX-702-135", "XCX-702-200"], // Optionele mat keuze
    van: 0,
    tot: 9999
  },
  {
    productCode: "Leg-afkitvloer",
    description: "LEG AFKIT VLOER Basis kosten voor het afkitten van de rand van de gelegde lijm pvc vloer, of de kosten voor het afkitten van de onderkant van een hoge plint. (per m1, excl. kit, let op: niet bij zwevend gelegde vloeren)",
    serviceType: "afwerken",
    isMandatory: false,
    category: "Afwerking",
    eenheid: "M1",
    configuratorName: "Leg-afkitvloer",
    subcategorie: "Montage",
    aantalMinimum: 1,
    berekening: "Prijs/meter",
    keuzeServicesOptional: ["KC25 100325"], // Optionele kit keuze
    van: 0,
    tot: 9999
  },
  {
    productCode: "XCX-705-200",
    description: "Schoonloopmat Ventura 200 cm breed 705 ZWART per 10cm - Volante 705 graniet-200",
    serviceType: "afwerken",
    isMandatory: false,
    category: "Accessoires",
    eenheid: "Stuk",
    configuratorName: "XCX-705-200",
    subcategorie: "Accessoires",
    merk: "Rinos BV",
    aantalMinimum: 1,
    berekening: "Maat",
    van: 0,
    tot: 9999
  },
  {
    productCode: "XCX-705-135",
    description: "Schoonloopmat Ventura 135 cm breed 705 ZWART per 10cm - Volante 705 graniet-135",
    serviceType: "afwerken",
    isMandatory: false,
    category: "Accessoires",
    eenheid: "Stuk",
    configuratorName: "XCX-705-135",
    subcategorie: "Accessoires",
    merk: "Rinos BV",
    aantalMinimum: 1,
    berekening: "Maat",
    van: 0,
    tot: 9999
  },
  {
    productCode: "XCX-702-135",
    description: "Schoonloopmat Ventura 135 cm breed 702 BRUIN per 10cm - Volante 702 bruin-135",
    serviceType: "afwerken",
    isMandatory: false,
    category: "Accessoires",
    eenheid: "Stuk",
    configuratorName: "XCX-702-135",
    subcategorie: "Accessoires",
    merk: "Rinos BV",
    aantalMinimum: 1,
    berekening: "Maat",
    van: 0,
    tot: 9999
  },
  {
    productCode: "XCX-702-200",
    description: "Schoonloopmat Ventura 200 cm breed 702 BRUIN per 10cm - Volante 702 bruin-200",
    serviceType: "afwerken",
    isMandatory: false,
    category: "Accessoires",
    eenheid: "Stuk",
    configuratorName: "XCX-702-200",
    subcategorie: "Accessoires",
    merk: "Rinos BV",
    aantalMinimum: 1,
    berekening: "Maat",
    van: 0,
    tot: 9999
  },
  {
    productCode: "KC25 100325",
    description: "KC25 100325 Siliconenkit neutraal Trijs 310ml",
    serviceType: "afwerken",
    isMandatory: false,
    category: "Accessoires",
    eenheid: "Stuk",
    configuratorName: "KC25 100325",
    subcategorie: "Hulpmaterialen",
    merk: "Trijs",
    aantalMinimum: 1,
    berekening: "Omrekenen",
    omrekenfactor: 15,
    van: 0,
    tot: 9999
  }
];

// Helper function to get mandatory articles by service type with optional filtering
export function getMandatoryArticlesByServiceType(
  serviceType: string, 
  productFilter?: any, 
  surface?: string,
  oldSurface?: string
): LegserviceArticle[] {
  // Get all mandatory articles for this service type
  let filtered = legserviceArticles.filter(article => 
    article.serviceType === serviceType && 
    article.isMandatory === true
  );

  // If no product filter, return all mandatory articles (no filtering)
  if (!productFilter) {
    console.log(`✅ No product filter - returning all ${filtered.length} mandatory ${serviceType} articles`);
    return filtered;
  }

  // Apply lenient filtering based on product properties
  filtered = filtered.filter(article => {
    // ALWAYS include articles with no specific filters (general services)
    if (!article.hoofdcategorie && !article.legmethode && !article.legpatroon && !article.subcategorie) {
      return true;
    }

    // Match hoofdcategorie if both exist
    if (productFilter.hoofdcategorie && article.hoofdcategorie) {
      if (productFilter.hoofdcategorie !== article.hoofdcategorie) {
        return false;
      }
    }

    // Match legmethode if both exist
    if (productFilter.legmethode && article.legmethode) {
      if (productFilter.legmethode !== article.legmethode) {
        return false;
      }
    }

    // Match legpatroon if both exist
    if (productFilter.legpatroon && article.legpatroon) {
      if (productFilter.legpatroon !== article.legpatroon) {
        return false;
      }
    }

    return true;
  });

  // Filter by oldSurface (Bestaande vloer) FIRST, then by surface (Basisvloer) if oldSurface is not provided
  // oldSurface takes precedence over surface
  const filterSurface = oldSurface || surface;
  const filterLabel = oldSurface ? 'oldSurface (Bestaande vloer)' : 'surface (Basisvloer)';
  
  if (filterSurface) {
    console.log(`🔍 Filtering by ${filterLabel}: ${filterSurface}`);
    
    filtered = filtered.filter(article => {
      // If article has no ondergrond filter, include it
      if (!article.ondergrond) {
        console.log(`✅ Article ${article.productCode} has no ondergrond filter - including`);
        return true;
      }
      
      // Check if filterSurface matches any of the ondergrond values
      const articleSurfaces = article.ondergrond.split(';').map(s => s.trim());
      console.log(`🔍 Article ${article.productCode} ondergrond values:`, articleSurfaces);
      
      const matches = articleSurfaces.some(s => 
        s.toLowerCase() === filterSurface.toLowerCase()
      );
      
      if (matches) {
        console.log(`✅ Article ${article.productCode} matches ${filterLabel}: ${filterSurface}`);
      } else {
        console.log(`❌ Article ${article.productCode} does NOT match ${filterLabel}: ${filterSurface}`);
      }
      
      return matches;
    });
  }

  console.log(`✅ Returning ${filtered.length} mandatory ${serviceType} articles after filtering`);
  return filtered;
}

// Helper function to get optional articles by service type with optional filtering
export function getOptionalArticlesByServiceType(
  serviceType: string,
  productFilter?: any,
  surface?: string
): LegserviceArticle[] {
  // Get all optional articles for this service type
  let filtered = legserviceArticles.filter(article => 
    article.serviceType === serviceType && 
    article.isMandatory === false
  );

  // If no product filter, return all optional articles (no filtering)
  if (!productFilter) {
    console.log(`✅ No product filter - returning all ${filtered.length} optional ${serviceType} articles`);
    return filtered;
  }

  // Apply lenient filtering based on product properties
  filtered = filtered.filter(article => {
    // ALWAYS include articles with no specific filters (general services)
    if (!article.hoofdcategorie && !article.legmethode) {
      return true;
    }

    // Match hoofdcategorie if both exist
    if (productFilter.hoofdcategorie && article.hoofdcategorie) {
      if (productFilter.hoofdcategorie !== article.hoofdcategorie) {
        return false;
      }
    }

    // Match legmethode if both exist  
    if (productFilter.legmethode && article.legmethode) {
      if (productFilter.legmethode !== article.legmethode) {
        return false;
      }
    }

    return true;
  });

  // NO surface filtering for now - too restrictive
  // We want to show all applicable services regardless of ondergrond

  console.log(`✅ Returning ${filtered.length} optional ${serviceType} articles after filtering`);
  return filtered;
}

// Helper function to get articles by category
export function getArticlesByCategory(category: string): LegserviceArticle[] {
  return legserviceArticles.filter(article => article.category === category);
}

// Get all article categories
export const articleCategories = Array.from(
  new Set(legserviceArticles.map(article => article.category))
);

// Function to update an article (for the detail page)
export function updateLegserviceArticle(updatedArticle: LegserviceArticle): boolean {
  const index = legserviceArticles.findIndex(
    article => article.productCode === updatedArticle.productCode
  );
  
  if (index !== -1) {
    legserviceArticles[index] = updatedArticle;
    return true;
  }
  
  return false;
}

// Function to update all articles with moisture value based on relation details
export function updateAllArticlesMoisture(moisture: string): void {
  const moistureValue = moisture === 'yes';
  
  legserviceArticles.forEach(article => {
    if (article.vocht !== undefined) {
      article.vocht = moistureValue;
    }
  });
}

// Function to update all articles with VVE value based on relation details
export function updateAllArticlesVVE(apartmentWithVVE: string): void {
  const vveValue = apartmentWithVVE === 'apartmentWithVVE';
  
  legserviceArticles.forEach(article => {
    if (article.vve !== undefined) {
      article.vve = vveValue;
    }
  });
}

// Helper function to get conditionally mandatory articles based on room level
export function getConditionallyMandatoryArticles(
  serviceType: string,
  roomLevel: string
): LegserviceArticle[] {
  return legserviceArticles.filter(article => {
    // Check if article is for this service type
    if (article.serviceType !== serviceType) {
      return false;
    }
    
    // Check if article has verdieping constraint
    if (!article.verdieping || article.verdieping.length === 0) {
      return false;
    }
    
    // Check if room level matches any of the required levels
    return article.verdieping.includes(roomLevel);
  });
}

// Helper function to get articles by product codes (for dependencies)
export function getArticlesByProductCodes(productCodes: string[]): LegserviceArticle[] {
  return legserviceArticles.filter(article => 
    productCodes.includes(article.productCode)
  );
}