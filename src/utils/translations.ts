export interface Translations {
  // Language selector
  language: string;
  
  // Header
  close: string;
  back: string;
  
  // General buttons  
  submit: string;
  addRoom: string;
  delete: string;
  copy: string;
  select: string;
  yes: string;
  no: string;
  cancel?: string;
  confirm?: string;
  viewDetails?: string;
  
  // Service dependency modal
  configureServiceDependencies?: string;
  serviceRequiresAdditionalSelection?: string;
  mandatoryServices?: string;
  mandatory?: string;
  mandatoryChoiceServices?: string;
  chooseMinimum?: string;
  pleaseSelectAtLeastOneChoiceService?: string;
  
  // Extra configurator dialog
  extraConfiguratorDialog: {
    title: string;
    message: string;
    question: string;
    configuratorLabel: string;
    continueButton: string;
    addConfiguratorButton: string;
  };
  
  // Configurator names
  configuratorNames: {
    Droogbouw: string;
    Verwijderen: string;
    Vloerverwarming: string;
  };
  
  // Relation details
  relationDetails: {
    title: string;
    customerName: string;
    heatingPreference: string;
    floorRemovalBy: string;
    numberOfFloors: string;
    buildingType: string;
    apartmentWithVVE: string;
    heatingType: string;
    baseFloor: string;
    enterCustomerName: string;
    selectHeatingPreference: string;
    selectFloorRemovalBy: string;
    selectBuildingType: string;
    selectApartmentWithVVE: string;
    selectBaseFloor: string;
    heatingOptions: {
      existing: string;
      newByThirdParty: string;
      newByLab21: string;
      none: string;
    };
    removalByOptions: {
      lab21: string;
      customer: string;
      combi: string;
    };
    buildingTypeOptions: {
      twoUnderOneCap: "2-onder-1-kap-woning",
      apartment: "Appartement",
      bungalow: "Bungalow",
      cornerHouse: "Hoekwoning",
      loft: "Loft",
      parkingGarage: "Parkeergarage",
      porticoHouse: "Portiekwoning",
      recreationalHome: "Recreatiewoning",
      terracedHouse: "Rijtjeshuis",
      middleHouse: "Tussenwoning",
      detachedHouse: "Vrijstaande woning",
      farmHouse: "Woonboerderij",
      residence: "Woonhuis",
    };
    apartmentVVEOptions: {
      noApartment: "Nee",
      apartmentNoVVE: "Alle",
      apartmentWithVVE: "Ja",
    };
    heatingTypeOptions: {
      all: string;
      other: string;
      centralHeating: string;
      districtHeating: string;
      heatPump: string;
    };
    baseFloorOptions: {
      concrete: "Beton",
      wood: "Hout",
      tiles: "Tegels",
      other: "Anders",
    };
    moisture: string;
    selectMoisture: string;
    moistureOptions: {
      yes: string;
      no: string;
      unknown: string;
    };
  };

  // Room configurator
  room: string;
  roomNumber: string;
  level: string;
  roomName: string;
  oldSurface: string;
  newSurface: string;
  surface: string;
  existingFloor: string;
  area: string;
  product: string;
  selectLevel: string;
  selectSurface: string;
  selectProduct: string;
  selectUnderfloorHeating: string;
  enterRoomName: string;
  enterArea: string;
  collapsed: string;
  expanded: string;
  copyFromRoom: string;
  selectRoom: string;
  selectRoomType: string;
  
  // Building levels
  levels: {
    groundFloor: string;
    firstFloor: string;
    secondFloor: string;
    thirdFloor: string;
    fourthFloor: string;
    higherFloor: string;
    basement: string;
    attic: string;
  };
  
  // Room types
  roomTypes: {
    aanbouw: string;
    berging: string;
    bijkeuken: string;
    gang: string;
    hal: string;
    kelder: string;
    keuken: string;
    overloop: string;
    slaapkamer1: string;
    slaapkamer2: string;
    slaapkamer3: string;
    slaapkamer4: string;
    trap: string;
    trapkast: string;
    wc: string;
    woonkamer: string;
    zolder: string;
  };
  
  // Existing floor types (Bestaande vloer)
  existingFloors: {
    geen: "Geen",
    jumpax: "Jumpax",
    keramischeTegel: "Keramische Tegel",
    klikMarmoleum: "Klik Marmoleum",
    laminaat: "Laminaat",
    leisteen: "Leisteen",
    marmoleumLinoleum: "Marmoleum/Linoleum",
    marmoleumLinoleumOpJumpax: "Marmoleum/Linoleum op Jumpax",
    parketvloerVerlijmd: "Parketvloer (Verlijmd)",
    parketvloerZwevend: "Parketvloer (Zwevend)",
    pvcKlik: "PVC Klik",
    pvcLijm: "PVC Lijm",
    tapijtLos: "Tapijt Los",
    tapijtMetOndertapijtLosOpOnder: "Tapijt met Ondertapijt Los",
    tapijtMetOndertapijtVerlijmdOp: "Tapijt met Ondertapijt Verlijmd",
    tapijtVerlijmd: "Tapijt Verlijmd",
    tapijtegelLos: "Tapijttegel Los",
    tapijtegelVerlijmd: "Tapijttegel Verlijmd",
    travertin: "Travertin",
    zandsteen: "Zandsteen",
    zeilVinylNovilonLos: "Zeil/Vinyl/Novilon Los",
    zeilVinylNovilonVerlijmd: "Zeil/Vinyl/Novilon Verlijmd"
  };
  
  // Surface types  
  surfaces: {
    airbase: string;
    anders: string;
    anhydriet: string;
    beton: string;
    betonGevlinderd: string;
    eco2Floor: string;
    fermacell: string;
    gietvloer: string;
    grindvloer: string;
    hout: string;
    houtenPlanken: string;
    houtenPlaten: string;
    knaufBrio: string;
    leisteen: string;
    magnesiet: string;
    marmoleumLinoleum: string;
    mortel: string;
    parketvloerVerlijmd: string;
    parketvloerZwevend: string;
    pvc: string;
    tegels: string;
    travertin: string;
    troffelvloer: string;
    varioKomp: string;
    zandcement: string;
    zandsteen: string;
  };
  
  // Installation methods
  legmethode: string;
  legmethods: {
    zwevend: string;
    gelijmd: string;
    gespijkerd: string;
    geklikt: string;
    losgelegd: string;
  };
  
  // Service tabs (4 tabs: Removing, Preparing, Installation, Finishing)
  serviceTabs: {
    verwijdering: string;
    voorbereiden: string;
    legservice: string;
    afwerking: string;
    aanbrengen: string;
  };
  
  // Service sections
  mandatoryServices: string;
  mandatoryChoiceServices: string;
  followupServices: string;
  optionalServices: string;
  
  // Totals summary
  totals: {
    title: string;
    surfaceType: string;
    buildingLevel: string;
    serviceType: string;
    project: string;
    totalRooms: string;
    totalFloorArea: string;
    noRoomsWithProducts: string;
  };
  
  // Units
  units: {
    squareMeters: string;
  };
  
  // Additional keys
  totalAllSurfaces: string;
  totalAllLevels: string;
  totalServiceArea: string;
  containers: string;
  
  // Service messages
  mandatoryServicesMessage: string;
  optionalServicesMessage: string;
  subfloorServicesMessage: string;
  subfloor: string;
  
  // Product Selection
  productSelection: {
    execution: string;
    configurator: string;
    startButton: string;
    selectExecution: string;
    selectCategory: string;
  };
  
  // Product Article Selection
  productArticleSelection: {
    title: string;
    searchPlaceholder: string;
    back: string;
    proceed: string;
    productImage: string;
    productName: string;
    productCode: string;
    selectOneProduct: string;
  };

  // Service Section
  serviceSection: {
    quantity: string;
    type: string;
    mandatory: string;
    optional: string;
    selected: string;
    choice: string;
    installationMethod: string;
    pattern: string;
    heatingType: string;
    integratedUnderfloor: string;
    floor: string;
    subfloor: string;
    meters: string;
    piece: string;
    brand: string;
    vocht: string;
    droogbouw: string;
    vve: string;
    laminaat: string;
    klikPvc: string;
    merk: string;
    van: string;
    tot: string;
    berekening: string;
    aantalMinimum: string;
    relationOrderInfo: string;
    product: string;
    room: string;
    configurator: string;
    adjustedDueToMinimum: string;
  };

  // Room Configurator
  roomConfigurator: {
    change: string;
    noProduct: string;
    mainCategory: string;
    subCategory: string;
    size: string;
    thickness: string;
    color: string;
    standard: string;
    productDetailsWillShow: string;
    selectProductOrCopy: string;
    pleaseSelectProduct: string;
    underfloorHeating: string;
    underfloorHeatingType: string;
    fillRoomDataAndSearch: string;
  };
  
  underfloorHeatingTypes: {
    none: string;
    electric: string;
    bonded: string;
    milled: string;
    noppenPlates: string;
  };

  // Totals Summary
  totalsSummary: {
    subfloor: "Subfloor",
    totalSubfloors: "Total Subfloors",
    floor: "Floor (m²)",
    floorHeating: "Floor Heating (m²)",
    level: "Level",
    totalLevels: "Total Levels",
    service: "Service",
    totalServices: "Total Services",
    project: "Project",
    totalRooms: "Total Rooms",
    totalFloorArea: "Total Floor Area",
    availableForServices: "Available for Services",
    containersNeeded: "Containers Needed",
    readyForServiceConfiguration: "Ready for Service Configuration",
    totalsWillAppear: "Totals will appear here when rooms with products are configured",
    products: "Products",
    product: "Product",
    entered: "Entered",
    unit: "Unit",
    cuttingWaste: "Cutting Waste",
    inclCuttingWaste: "Incl. Cutting Waste",
    packagesRounded: "Rounded pkg/pcs",
    toDeliver: "To Deliver",
    totalProducts: "Total Products",
    cuttingWasteAndRounding: "Cutting Waste & Rounding"
  };

  // Configurator Header
  configuratorHeader: {
    configurator: string;
    floorConfigurator: string;
  };

  // Order Overview
  orderOverview: {
    title: string;
    noServicesSelected: string;
    orderLines: string;
    products: string;
    services: string;
    productsAndServices: string;
    mandatoryServices: string;
    optionalServices: string;
    quantity: string;
    unit: string;
    description: string;
    totalProducts: string;
    totalMandatoryServices: string;
    totalOptionalServices: string;
    grandTotal: string;
    back: string;
    submitOrder: string;
  };

  // Product properties values
  productValues: {
    legmethode: { [key: string]: string };
    legpatroon: { [key: string]: string };
    typeVloerverwarming: { [key: string]: string };
    geintegreerdeOndervloer: { [key: string]: string };
    subcategorie: { [key: string]: string };
  };
}

export const translations: Record<string, Translations> = {
  nl: {
    language: "Taal",
    
    close: "Sluiten",
    back: "Terug",
    
    submit: "OVERZICHT",
    addRoom: "+ VOEG RUIMTE TOE",
    delete: "Delete",
    copy: "Copy",
    select: "Selecteer",
    yes: "Ja",
    no: "Nee",
    cancel: "Annuleren",
    confirm: "Bevestigen",
    viewDetails: "Details bekijken",
    
    configureServiceDependencies: "Configureer Service Afhankelijkheden",
    serviceRequiresAdditionalSelection: "Deze service vereist aanvullende selecties.",
    mandatoryServices: "Verplichte Services",
    mandatory: "Verplicht",
    mandatoryChoiceServices: "Keuze Services",
    chooseMinimum: "Kies minimaal",
    pleaseSelectAtLeastOneChoiceService: "Selecteer ten minste één keuze service.",
    
    extraConfiguratorDialog: {
      title: "Extra Configurator Vereist",
      message: "De geselecteerde service(s) vereisen de volgende configurator(en):",
      question: "Deze configurator(en) worden automatisch toegevoegd aan de doorloop en moeten worden voltooid.",
      configuratorLabel: "Vereiste configurator(en)",
      continueButton: "VERDER ZONDER EXTRA CONFIGURATOR",
      addConfiguratorButton: "BEGREPEN"
    },
    
    configuratorNames: {
      Droogbouw: "Droogbouw",
      Verwijderen: "Verwijderen",
      Vloerverwarming: "Vloerverwarming"
    },
    
    relationDetails: {
      title: "Relatie-/Ordergegevens",
      customerName: "Naam klant",
      heatingPreference: "Vloerverwarming (wens)",
      floorRemovalBy: "Uitvoering verwijderen",
      numberOfFloors: "Aantal verdiepingen",
      buildingType: "Soort bebouwing",
      apartmentWithVVE: "VVE met onderburen",
      heatingType: "Soort verwarming",
      baseFloor: "Basisvloer",
      enterCustomerName: "Voer naam klant in",
      selectHeatingPreference: "Selecteer vloerverwarming optie",
      selectFloorRemovalBy: "Selecteer wie vloer verwijdert",
      selectBuildingType: "Selecteer soort bebouwing",
      selectApartmentWithVVE: "Selecteer VVE type",
      selectBaseFloor: "Selecteer basisvloer",
      heatingOptions: {
        existing: "Bestaande vloerverwarming",
        newByThirdParty: "Geen bestaande vloerverwarming, wel nieuwe door derde",
        newByLab21: "Geen bestaande vloerverwarming, wel nieuwe door Lab21",
        none: "Geen bestaande vloerverwarming, geen nieuwe",
      },
      removalByOptions: {
        lab21: "LAB21",
        customer: "Klant",
        combi: "Combi",
      },
      buildingTypeOptions: {
        twoUnderOneCap: "2-onder-1-kap-woning",
        apartment: "Appartement",
        bungalow: "Bungalow",
        cornerHouse: "Hoekwoning",
        loft: "Loft",
        parkingGarage: "Parkeergarage",
        porticoHouse: "Portiekwoning",
        recreationalHome: "Recreatiewoning",
        terracedHouse: "Rijtjeshuis",
        middleHouse: "Tussenwoning",
        detachedHouse: "Vrijstaande woning",
        farmHouse: "Woonboerderij",
        residence: "Woonhuis",
      },
      apartmentVVEOptions: {
        noApartment: "Nee",
        apartmentNoVVE: "Alle",
        apartmentWithVVE: "Ja",
      },
      heatingTypeOptions: {
        all: "Alle",
        other: "Anders",
        centralHeating: "Centrale verwarming",
        districtHeating: "Stadsverwarming",
        heatPump: "Warmtepomp",
      },
      baseFloorOptions: {
        concrete: "Beton",
        wood: "Hout",
        tiles: "Tegels",
        other: "Anders",
      },
      moisture: "Vocht",
      selectMoisture: "Selecteer vocht status",
      moistureOptions: {
        yes: "Ja",
        no: "Nee",
        unknown: "Onbekend",
      },
    },

    room: "Ruimte",
    roomNumber: "Ruimte",
    level: "Verdieping",
    roomName: "Ruimte",
    oldSurface: "Bestaande vloer",
    newSurface: "Basisvloer",
    surface: "Basisvloer",
    existingFloor: "Bestaande vloer",
    area: "Oppervlakte",
    product: "Product",
    selectLevel: "Selecteer verdieping",
    selectSurface: "Selecteer basisvloer",
    selectProduct: "Selecteer product",
    selectUnderfloorHeating: "Selecteer vloerverwarming",
    enterRoomName: "Voer ruimte naam in",
    enterArea: "m² invoeren",
    collapsed: "Ingeklapte weergave",
    expanded: "Uitgebreide weergave",
    copyFromRoom: "Kopieer van ruimte",
    selectRoom: "Selecteer ruimte",
    selectRoomType: "Selecteer ruimte type",
    
    levels: {
      groundFloor: "Begane grond",
      firstFloor: "1e verdieping", 
      secondFloor: "2e verdieping",
      thirdFloor: "3e verdieping",
      fourthFloor: "4e verdieping",
      higherFloor: "Hogere verdieping",
      basement: "Kelder",
      attic: "Zolder"
    },
    
    roomTypes: {
      aanbouw: "Aanbouw",
      berging: "Berging",
      bijkeuken: "Bijkeuken",
      gang: "Gang",
      hal: "Hal",
      kelder: "Kelder",
      keuken: "Keuken",
      overloop: "Overloop",
      slaapkamer1: "Slaapkamer I",
      slaapkamer2: "Slaapkamer II",
      slaapkamer3: "Slaapkamer III",
      slaapkamer4: "Slaapkamer IV",
      trap: "Trap",
      trapkast: "Trapkast",
      wc: "WC",
      woonkamer: "Woonkamer",
      zolder: "Zolder"
    },
    
    existingFloors: {
      geen: "Geen",
      jumpax: "Jumpax",
      keramischeTegel: "Keramische Tegel",
      klikMarmoleum: "Klik Marmoleum",
      laminaat: "Laminaat",
      leisteen: "Leisteen",
      marmoleumLinoleum: "Marmoleum/Linoleum",
      marmoleumLinoleumOpJumpax: "Marmoleum/Linoleum op Jumpax",
      parketvloerVerlijmd: "Parketvloer (Verlijmd)",
      parketvloerZwevend: "Parketvloer (Zwevend)",
      pvcKlik: "PVC Klik",
      pvcLijm: "PVC Lijm",
      tapijtLos: "Tapijt Los",
      tapijtMetOndertapijtLosOpOnder: "Tapijt met Ondertapijt Los",
      tapijtMetOndertapijtVerlijmdOp: "Tapijt met Ondertapijt Verlijmd",
      tapijtVerlijmd: "Tapijt Verlijmd",
      tapijtegelLos: "Tapijttegel Los",
      tapijtegelVerlijmd: "Tapijttegel Verlijmd",
      travertin: "Travertin",
      zandsteen: "Zandsteen",
      zeilVinylNovilonLos: "Zeil/Vinyl/Novilon Los",
      zeilVinylNovilonVerlijmd: "Zeil/Vinyl/Novilon Verlijmd"
    },
    
    surfaces: {
      airbase: "Airbase",
      anders: "Anders",
      anhydriet: "Anhydriet",
      beton: "Beton",
      betonGevlinderd: "Beton gevlinderd",
      eco2Floor: "Eco2Floor",
      fermacell: "Fermacell",
      gietvloer: "Gietvloer",
      grindvloer: "Grindvloer",
      hout: "Hout",
      houtenPlanken: "Houten planken",
      houtenPlaten: "Houten platen",
      knaufBrio: "Knauf Brio",
      leisteen: "Leisteen",
      magnesiet: "Magnesiet",
      marmoleumLinoleum: "Marmoleum/Linoleum",
      mortel: "Mortel",
      parketvloerVerlijmd: "Parketvloer (verlijmd)",
      parketvloerZwevend: "Parketvloer (zwevend)",
      pvc: "PVC",
      tegels: "Tegels",
      travertin: "Travertin",
      troffelvloer: "Troffelvloer",
      varioKomp: "VarioKomp",
      zandcement: "Zandcement",
      zandsteen: "Zandsteen"
    },
    
    legmethode: "Legmethode",
    legmethods: {
      zwevend: "Zwevend",
      gelijmd: "Gelijmd",
      gespijkerd: "Gespijkerd",
      geklikt: "Geklikt",
      losgelegd: "Losgelegd"
    },
    
    vloerverwarmingOptions: {
      stadsverwarming: "Stadsverwarming",
      thermostaat: "Thermostaat",
      composietVerdeler: "Composiet verdeler", 
      premiumBuis: "Premium buis"
    },
    
    serviceTabs: {
      verwijdering: "Verwijderen", 
      voorbereiden: "Voorbereiden",
      legservice: "Installeren",
      afwerking: "Afwerken",
      aanbrengen: "Aanbrengen"
    },
    
    followupServices: "Vervolg",
    optionalServices: "Optioneel",

    totals: {
      title: "Totalen",
      surfaceType: "Basisvloer Type",
      buildingLevel: "Verdieping",
      serviceType: "Service Type", 
      project: "Project",
      totalRooms: "Totaal Ruimtes:",
      totalFloorArea: "Totale Vloeroppervlakte:",
      noRoomsWithProducts: "Geen ruimtes met producten"
    },
    
    units: {
      squareMeters: "m2"
    },
    
    totalAllSurfaces: "Totaal Alle Oppervlaktes",
    totalAllLevels: "Totaal Alle Verdiepingen", 
    totalServiceArea: "Totaal Service Oppervlakte",
    containers: "containers",
    
    mandatoryServicesMessage: "Verplichte services verschijnen hier wanneer ruimtes met producten zijn geconfigureerd",
    optionalServicesMessage: "Optionele services verschijnen hier wanneer ruimtes met producten zijn geconfigureerd",
    subfloorServicesMessage: "Ondervloer services verschijnen hier wanneer ruimtes met producten zijn geconfigureerd",
    subfloor: "Ondervloer",
    
    productSelection: {
      execution: "Uitvoering leggen",
      configurator: "Configurator", 
      startButton: "STARTEN",
      selectExecution: "Selecteer uitvoering",
      selectCategory: "Selecteer categorie"
    },
    
    productArticleSelection: {
      title: "Selecteer Een Product",
      searchPlaceholder: "Zoeken",
      back: "TERUG",
      proceed: "VERDER",
      productImage: "Product Afbeelding",
      productName: "Product Naam",
      productCode: "Product Code",
      selectOneProduct: "Selecteer Een Product"
    },

    serviceSection: {
      quantity: "Aantal",
      type: "Type",
      mandatory: "Verplicht",
      optional: "Optioneel",
      selected: "Geselecteerd",
      choice: "Keuze",
      installationMethod: "Installatie",
      pattern: "Legpatroon",
      heatingType: "Type vloerverwarming",
      integratedUnderfloor: "Geïntegreerde ondervloer",
      floor: "Verdieping",
      subfloor: "Ondergrond",
      meters: "Meter",
      piece: "Stuk",
      brand: "Merk",
      vocht: "Vocht",
      droogbouw: "Droogbouw",
      vve: "Appartement",
      laminaat: "Laminaat",
      klikPvc: "Klik PVC",
      merk: "Merk",
      van: "Van",
      tot: "Tot",
      berekening: "Berekening",
      aantalMinimum: "Aantal (minimum)",
      relationOrderInfo: "Klant-/Ordergegevens:",
      product: "Product:",
      room: "Ruimte:",
      configurator: "Configurator:",
      adjustedDueToMinimum: "Aangepast vanwege minimum"
    },

    roomConfigurator: {
      change: "Wijzigen",
      noProduct: "Geen product geselecteerd",
      mainCategory: "Hoofdcategorie",
      subCategory: "Subcategorie",
      size: "Afmetingen",
      thickness: "Dikte",
      color: "Kleur",
      standard: "Standaard",
      productDetailsWillShow: "Productdetails worden getoond na selectie",
      selectProductOrCopy: "Selecteer een nieuw product of kopieer de configuratie van een bestaande ruimte",
      pleaseSelectProduct: "Selecteer een product om deze ruimte te configureren",
      underfloorHeating: "Vloerverwarming",
      underfloorHeatingType: "Type vloerverwarming",
      fillRoomDataAndSearch: "Services en producten zijn beschikbaar na het invullen van de ruimte configuratie"
    },
    
    underfloorHeatingTypes: {
      none: "Geen",
      electric: "Elektrisch",
      bonded: "Gebonden",
      milled: "Gefreesd",
      noppenPlates: "Noppen platen"
    },

    totalsSummary: {
      subfloor: "Subfloor",
      totalSubfloors: "Total Subfloors",
      floor: "Floor (m²)",
      floorHeating: "Floor Heating (m²)",
      level: "Level",
      totalLevels: "Total Levels",
      service: "Service",
      totalServices: "Total Services",
      project: "Project",
      totalRooms: "Total Rooms",
      totalFloorArea: "Total Floor Area",
      availableForServices: "Available for Services",
      containersNeeded: "Containers Needed",
      readyForServiceConfiguration: "Ready for Service Configuration",
      totalsWillAppear: "Totals will appear here when rooms with products are configured",
      products: "Products",
      product: "Product",
      entered: "Entered",
      unit: "Unit",
      cuttingWaste: "Cutting Waste",
      inclCuttingWaste: "Incl. Cutting Waste",
      packagesRounded: "Rounded pkg/pcs",
      toDeliver: "To Deliver",
      totalProducts: "Total Products",
      cuttingWasteAndRounding: "Cutting Waste & Rounding"
    },

    configuratorHeader: {
      configurator: "Configurator",
      floorConfigurator: "Configurator (Vloeren)"
    },

    orderOverview: {
      title: "Bestel Overzicht",
      noServicesSelected: "Geen services geselecteerd",
      orderLines: "Orderregels",
      products: "Producten",
      services: "Services",
      productsAndServices: "Producten en Services",
      mandatoryServices: "Verplichte Services",
      optionalServices: "Optionele Services",
      quantity: "Aantal",
      unit: "Eenheid",
      description: "Omschrijving",
      totalProducts: "Totaal Producten",
      totalMandatoryServices: "Totaal Verplichte Services",
      totalOptionalServices: "Totaal Optionele Services",
      grandTotal: "Eindtotaal",
      back: "TERUG",
      submitOrder: "INDIENEN"
    },

    productValues: {
      legmethode: {
        "Gelijmd": "Gelijmd",
        "Klikverbinding": "Klikverbinding",
        "Zwevend": "Zwevend",
        "Genageld": "Genageld",
        "Geschroefd": "Geschroefd",
        "Losgelegd": "Losgelegd"
      },
      legpatroon: {
        "Rechte stroken": "Rechte stroken",
        "Rechte verband": "Rechte verband",
        "Visgraat": "Visgraat",
        "Frans verband": "Frans verband",
        "Hongaarse punt": "Hongaarse punt",
        "Patroon": "Patroon",
        "Weense punt": "Weense punt"
      },
      typeVloerverwarming: {
        "Elektrisch": "Elektrisch",
        "Watervoerend": "Watervoerend",
        "Gebonden": "Gebonden"
      },
      geintegreerdeOndervloer: {
        "Ja": "Ja",
        "Nee": "Nee"
      },
      subcategorie: {
        "Lijm PVC": "Lijm PVC",
        "Klik PVC": "Klik PVC",
        "Rigid PVC": "Rigid PVC"
      }
    }
  },
  
  en: {
    language: "Language",
    
    close: "Close",
    back: "Back",
    
    submit: "OVERVIEW", 
    addRoom: "+ ADD ROOM",
    delete: "Delete",
    copy: "Copy",
    select: "Select",
    yes: "Yes",
    no: "No",
    cancel: "Cancel",
    confirm: "Confirm",
    viewDetails: "View Details",
    
    configureServiceDependencies: "Configure Service Dependencies",
    serviceRequiresAdditionalSelection: "This service requires additional selections.",
    mandatoryServices: "Mandatory Services",
    mandatory: "Mandatory",
    mandatoryChoiceServices: "Choice Services",
    chooseMinimum: "Choose Minimum",
    pleaseSelectAtLeastOneChoiceService: "Please select at least one choice service.",
    
    extraConfiguratorDialog: {
      title: "Extra Configurator Required",
      message: "The selected service(s) require the following configurator(s):",
      question: "This configurator(s) will be automatically added to the workflow and must be completed.",
      configuratorLabel: "Required configurator(s)",
      continueButton: "CONTINUE WITHOUT EXTRA CONFIGURATOR",
      addConfiguratorButton: "UNDERSTOOD"
    },
    
    configuratorNames: {
      Droogbouw: "Dry Build",
      Verwijderen: "Remove",
      Vloerverwarming: "Floor Heating"
    },
    
    relationDetails: {
      title: "Client/Order Details",
      customerName: "Customer Name",
      heatingPreference: "Floor Heating (preference)",
      floorRemovalBy: "Execution removal",
      numberOfFloors: "Number of floors",
      buildingType: "Building type",
      apartmentWithVVE: "HOA with downstairs neighbors",
      heatingType: "Type of heating",
      baseFloor: "Base floor",
      enterCustomerName: "Enter customer name",
      selectHeatingPreference: "Select floor heating option",
      selectFloorRemovalBy: "Select who removes floor",
      selectBuildingType: "Select building type",
      selectApartmentWithVVE: "Select HOA type",
      selectBaseFloor: "Select base floor",
      heatingOptions: {
        existing: "Existing floor heating",
        newByThirdParty: "No existing floor heating, new by third party",
        newByLab21: "No existing floor heating, new by Lab21",
        none: "No existing floor heating, no new",
      },
      removalByOptions: {
        lab21: "LAB21",
        customer: "Customer",
        combi: "Combination",
      },
      buildingTypeOptions: {
        twoUnderOneCap: "Semi-detached house",
        apartment: "Apartment",
        bungalow: "Bungalow",
        cornerHouse: "Corner house",
        loft: "Loft",
        parkingGarage: "Parking garage",
        porticoHouse: "Portico house",
        recreationalHome: "Recreational home",
        terracedHouse: "Terraced house",
        middleHouse: "Middle house",
        detachedHouse: "Detached house",
        farmHouse: "Farm house",
        residence: "Residence",
      },
      apartmentVVEOptions: {
        noApartment: "No",
        apartmentNoVVE: "All",
        apartmentWithVVE: "Yes",
      },
      heatingTypeOptions: {
        all: "All",
        other: "Other",
        centralHeating: "Central heating",
        districtHeating: "District heating",
        heatPump: "Heat pump",
      },
      baseFloorOptions: {
        concrete: "Concrete",
        wood: "Wood",
        tiles: "Tiles",
        other: "Other",
      },
      moisture: "Moisture",
      selectMoisture: "Select moisture status",
      moistureOptions: {
        yes: "Yes",
        no: "No",
        unknown: "Unknown",
      },
    },

    room: "Room",
    roomNumber: "Room",
    level: "Level",
    roomName: "Room Name", 
    oldSurface: "Existing Floor",
    newSurface: "Base Floor",
    surface: "Base Floor",
    existingFloor: "Existing Floor",
    area: "Area",
    product: "Product",
    selectLevel: "Select level",
    selectSurface: "Select base floor",
    selectProduct: "Select product",
    selectUnderfloorHeating: "Select underfloor heating",
    enterRoomName: "Enter room name",
    enterArea: "Enter m²",
    collapsed: "Collapsed view",
    expanded: "Expanded view", 
    copyFromRoom: "Copy from room",
    selectRoom: "Select room",
    selectRoomType: "Select room type",
    
    levels: {
      groundFloor: "Ground Floor",
      firstFloor: "1st Floor",
      secondFloor: "2nd Floor", 
      thirdFloor: "3rd Floor",
      fourthFloor: "4th Floor",
      higherFloor: "Higher Floor",
      basement: "Basement",
      attic: "Attic"
    },
    
    roomTypes: {
      aanbouw: "Extension",
      berging: "Storage Room",
      bijkeuken: "Utility Room",
      gang: "Hallway",
      hal: "Entrance Hall",
      kelder: "Basement Room",
      keuken: "Kitchen",
      overloop: "Landing",
      slaapkamer1: "Bedroom I",
      slaapkamer2: "Bedroom II",
      slaapkamer3: "Bedroom III",
      slaapkamer4: "Bedroom IV",
      trap: "Staircase",
      trapkast: "Under Stairs",
      wc: "Toilet",
      woonkamer: "Living Room",
      zolder: "Attic Room"
    },
    
    existingFloors: {
      geen: "None",
      jumpax: "Jumpax",
      keramischeTegel: "Ceramic Tile",
      klikMarmoleum: "Click Marmoleum",
      laminaat: "Laminate",
      leisteen: "Slate",
      marmoleumLinoleum: "Marmoleum/Linoleum",
      marmoleumLinoleumOpJumpax: "Marmoleum/Linoleum on Jumpax",
      parketvloerVerlijmd: "Parquet Floor (Glued)",
      parketvloerZwevend: "Parquet Floor (Floating)",
      pvcKlik: "PVC Click",
      pvcLijm: "PVC Adhesive",
      tapijtLos: "Loose Carpet",
      tapijtMetOndertapijtLosOpOnder: "Carpet with Undercarpet Loose",
      tapijtMetOndertapijtVerlijmdOp: "Carpet with Undercarpet Glued",
      tapijtVerlijmd: "Glued Carpet",
      tapijtegelLos: "Loose Carpet Tile",
      tapijtegelVerlijmd: "Glued Carpet Tile",
      travertin: "Travertine",
      zandsteen: "Sandstone",
      zeilVinylNovilonLos: "Loose Sheet Vinyl/Novilon",
      zeilVinylNovilonVerlijmd: "Glued Sheet Vinyl/Novilon"
    },
    
    surfaces: {
      airbase: "Airbase",
      anders: "Other",
      anhydriet: "Anhydrite",
      beton: "Concrete",
      betonGevlinderd: "Polished Concrete",
      eco2Floor: "Eco2Floor",
      fermacell: "Fermacell",
      gietvloer: "Poured Floor",
      grindvloer: "Grind Floor",
      hout: "Wood",
      houtenPlanken: "Wooden Planks",
      houtenPlaten: "Wooden Boards",
      knaufBrio: "Knauf Brio",
      leisteen: "Slate",
      magnesiet: "Magnesite",
      marmoleumLinoleum: "Marmoleum/Linoleum",
      mortel: "Mortar",
      parketvloerVerlijmd: "Parquet Floor (Glued)",
      parketvloerZwevend: "Parquet Floor (Floating)",
      pvc: "PVC",
      tegels: "Tiles",
      travertin: "Travertine",
      troffelvloer: "Trowel Floor",
      varioKomp: "VarioKomp",
      zandcement: "Sand Cement",
      zandsteen: "Sandstone"
    },
    
    legmethode: "Installation Method",
    legmethods: {
      zwevend: "Floating",
      gelijmd: "Glued",
      gespijkerd: "Nailed",
      geklikt: "Click",
      losgelegd: "Loose Lay"
    },
    
    vloerverwarmingOptions: {
      stadsverwarming: "District Heating",
      thermostaat: "Thermostat",
      composietVerdeler: "Composite Manifold",
      premiumBuis: "Premium Pipe" 
    },
    
    serviceTabs: {
      verwijdering: "Removing",
      voorbereiden: "Preparing",
      legservice: "Installation",
      afwerking: "Finishing", 
      aanbrengen: "Application"
    },
    
    followupServices: "Follow-up",
    optionalServices: "Optional",

    totals: {
      title: "Totals",
      surfaceType: "Base Floor Type",
      buildingLevel: "Building Level",
      serviceType: "Service Type",
      project: "Project", 
      totalRooms: "Total Rooms:",
      totalFloorArea: "Total Floor Area:",
      noRoomsWithProducts: "No rooms with products"
    },
    
    units: {
      squareMeters: "m2"
    },
    
    totalAllSurfaces: "Total All Surfaces",
    totalAllLevels: "Total All Levels",
    totalServiceArea: "Total Service Area", 
    containers: "containers",
    
    mandatoryServicesMessage: "Mandatory services will appear here when rooms with products are configured",
    optionalServicesMessage: "Optional services will appear here when rooms with products are configured",
    subfloorServicesMessage: "Subfloor services will appear here when rooms with products are configured",
    subfloor: "Subfloor",
    
    productSelection: {
      execution: "Execution laying",
      configurator: "Configurator",
      startButton: "START", 
      selectExecution: "Select execution",
      selectCategory: "Select category"
    },
    
    productArticleSelection: {
      title: "Select One Product",
      searchPlaceholder: "Search",
      back: "BACK",
      proceed: "PROCEED",
      productImage: "Product Image",
      productName: "Product Name", 
      productCode: "Product Code",
      selectOneProduct: "Select One Product"
    },

    serviceSection: {
      quantity: "Quantity",
      type: "Type",
      mandatory: "Mandatory",
      optional: "Optional",
      selected: "Selected",
      choice: "Choice",
      installationMethod: "Installation Method",
      pattern: "Pattern",
      heatingType: "Heating Type",
      integratedUnderfloor: "Integrated Underfloor",
      floor: "Floor",
      subfloor: "Subfloor",
      meters: "Meter",
      piece: "Piece",
      brand: "Brand",
      vocht: "Moisture",
      droogbouw: "Dry Build",
      vve: "Apartment",
      laminaat: "Laminate",
      klikPvc: "Click PVC",
      merk: "Brand",
      van: "From",
      tot: "To",
      berekening: "Calculation",
      aantalMinimum: "Quantity (minimum)",
      relationOrderInfo: "Client/Order Details:",
      product: "Product:",
      room: "Room:",
      configurator: "Configurator:",
      adjustedDueToMinimum: "Adjusted due to minimum"
    },

    roomConfigurator: {
      change: "Change",
      noProduct: "No product selected",
      mainCategory: "Main Category",
      subCategory: "Sub Category",
      size: "Size",
      thickness: "Thickness",
      color: "Color",
      standard: "Standard",
      productDetailsWillShow: "Product details will be shown after selection",
      selectProductOrCopy: "Select a new product or copy the configuration from an existing room",
      pleaseSelectProduct: "Please select a product to configure this room",
      underfloorHeating: "Underfloor Heating",
      underfloorHeatingType: "Underfloor Heating Type",
      fillRoomDataAndSearch: "Services and products are available after filling in the room configuration"
    },
    
    underfloorHeatingTypes: {
      none: "None",
      electric: "Electric",
      bonded: "Bonded",
      milled: "Milled",
      noppenPlates: "Noppen Plates"
    },

    totalsSummary: {
      subfloor: "Subfloor",
      totalSubfloors: "Total Subfloors",
      floor: "Floor (m²)",
      floorHeating: "Floor Heating (m²)",
      level: "Level",
      totalLevels: "Total Levels",
      service: "Service",
      totalServices: "Total Services",
      project: "Project",
      totalRooms: "Total Rooms",
      totalFloorArea: "Total Floor Area",
      availableForServices: "Available for Services",
      containersNeeded: "Containers Needed",
      readyForServiceConfiguration: "Ready for Service Configuration",
      totalsWillAppear: "Totals will appear here when rooms with products are configured",
      products: "Products",
      product: "Product",
      entered: "Entered",
      unit: "Unit",
      cuttingWaste: "Cutting Waste",
      inclCuttingWaste: "Incl. Cutting Waste",
      packagesRounded: "Rounded pkg/pcs",
      toDeliver: "To Deliver",
      totalProducts: "Total Products",
      cuttingWasteAndRounding: "Cutting Waste & Rounding"
    },

    configuratorHeader: {
      configurator: "Configurator",
      floorConfigurator: "Floor Configurator"
    },

    orderOverview: {
      title: "Order Overview",
      noServicesSelected: "No services selected",
      orderLines: "Order Lines",
      products: "Products",
      services: "Services",
      productsAndServices: "Products and Services",
      mandatoryServices: "Mandatory Services",
      optionalServices: "Optional Services",
      quantity: "Quantity",
      unit: "Unit",
      description: "Description",
      totalProducts: "Total Products",
      totalMandatoryServices: "Total Mandatory Services",
      totalOptionalServices: "Total Optional Services",
      grandTotal: "Grand Total",
      back: "BACK",
      submitOrder: "SUBMIT"
    },

    productValues: {
      legmethode: {
        "Gelijmd": "Glued",
        "Klikverbinding": "Click",
        "Zwevend": "Floating",
        "Genageld": "Nailed",
        "Geschroefd": "Screwed",
        "Losgelegd": "Loose Lay"
      },
      legpatroon: {
        "Rechte stroken": "Straight Planks",
        "Rechte verband": "Straight Bond",
        "Visgraat": "Herringbone",
        "Frans verband": "French Bond",
        "Hongaarse punt": "Hungarian Point",
        "Patroon": "Pattern",
        "Weense punt": "Viennese Point"
      },
      typeVloerverwarming: {
        "Elektrisch": "Electric",
        "Watervoerend": "Water-based",
        "Gebonden": "Bonded"
      },
      geintegreerdeOndervloer: {
        "Ja": "Yes",
        "Nee": "No"
      },
      subcategorie: {
        "Lijm PVC": "Glue PVC",
        "Klik PVC": "Click PVC",
        "Rigid PVC": "Rigid PVC"
      },
      berekening: {
        "Vaste prijs": "Fixed price",
        "Prijs/meter": "Price/meter"
      },
      verdieping: {
        "Begane grond": "Ground floor",
        "1e verdieping": "1st floor",
        "2e verdieping": "2nd floor",
        "3e verdieping": "3rd floor",
        "4e verdieping": "4th floor",
        "5e verdieping": "5th floor"
      }
    }
  }
};

export const useTranslation = (language: string) => {
  return translations[language] || translations.nl;
};