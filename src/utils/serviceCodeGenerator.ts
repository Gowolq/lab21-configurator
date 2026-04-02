/**
 * Service Code Generator
 * Generates user-friendly service codes based on product properties
 */

interface ProductProperties {
  hoofdcategorie?: string;
  subcategorie?: string;
  legmethode?: string;
  legpatroon?: string;
  typeVloerverwarming?: string;
  geintegreerdeOndervloer?: string;
}

/**
 * Maps product properties to short codes
 */
const propertyMappings = {
  // Hoofdcategorie mappings
  hoofdcategorie: {
    'PVC': 'pvc',
    'LVT': 'lvt', 
    'Laminaat': 'lam',
    'Parket': 'park',
    'Vinyl': 'vin',
    'Linoleum': 'lino',
    'Tapijt': 'tapijt',
    'Tegels': 'tegel',
    'Natuursteen': 'steen',
    'Hout': 'hout'
  },
  
  // Legmethode mappings
  legmethode: {
    'Klikverbinding': 'klik',
    'Gelijmd': 'lijm',
    'Zwevend': 'zwev',
    'Genageld': 'nagel',
    'Geschroefd': 'schroef',
    'Droogleggen': 'droog',
    'Volledig verlijmd': 'volllijm'
  },
  
  // Legpatroon mappings  
  legpatroon: {
    'Visgraat': 'visg',
    'Rechte stroken': 'recht',
    'Tegel': 'tegel',
    'Hongaarse punt': 'hong',
    'Diagonaal': 'diag',
    'Blokpatroon': 'blok',
    'Herringbone': 'herr',
    'Chevron': 'chev',
    'Baksteen': 'baks',
    'Willekeurig': 'wille'
  },
  
  // Type vloerverwarming mappings
  typeVloerverwarming: {
    'Geschikt': 'vwok',
    'Beperkt geschikt': 'vwbep', 
    'Niet geschikt': 'vwniet',
    'Aanbevolen': 'vwaan'
  },
  
  // Service type mappings
  serviceType: {
    'legservice': 'leg',
    'verwijdering': 'verw',
    'ondervloer': 'onder',
    'vloerverwarming': 'vw',
    'container': 'cont',
    'droogbouw': 'droog'
  },
  
  // Package type mappings
  packageType: {
    'mandatory': 'min',
    'optional': 'opt',
    'premium': 'prem',
    'basic': 'basis'
  }
};

/**
 * Converts a property value to its short code
 */
function getShortCode(category: keyof typeof propertyMappings, value: string): string {
  const mappings = propertyMappings[category];
  if (!mappings) return value.toLowerCase().slice(0, 4);
  
  // Try exact match first
  if (mappings[value as keyof typeof mappings]) {
    return mappings[value as keyof typeof mappings];
  }
  
  // Try partial match for variations
  const partialMatch = Object.keys(mappings).find(key => 
    key.toLowerCase().includes(value.toLowerCase()) || 
    value.toLowerCase().includes(key.toLowerCase())
  );
  
  if (partialMatch) {
    return mappings[partialMatch as keyof typeof mappings];
  }
  
  // Fallback to shortened version
  return value.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 4);
}

/**
 * Generates a service product code based on product properties
 */
export function generateServiceProductCode(
  serviceType: string,
  isMandatory: boolean,
  productProperties?: ProductProperties
): string {
  const parts: string[] = [];
  
  // 1. Service type
  parts.push(getShortCode('serviceType', serviceType));
  
  // 2. Package type (mandatory/optional)
  parts.push(getShortCode('packageType', isMandatory ? 'mandatory' : 'optional'));
  
  if (productProperties) {
    // 3. Main category
    if (productProperties.hoofdcategorie) {
      parts.push(getShortCode('hoofdcategorie', productProperties.hoofdcategorie));
    }
    
    // 4. Installation method
    if (productProperties.legmethode) {
      parts.push(getShortCode('legmethode', productProperties.legmethode));
    }
    
    // 5. Installation pattern
    if (productProperties.legpatroon) {
      parts.push(getShortCode('legpatroon', productProperties.legpatroon));
    }
    
    // 6. Heating compatibility (if relevant for the service)
    if (serviceType === 'vloerverwarming' && productProperties.typeVloerverwarming) {
      parts.push(getShortCode('typeVloerverwarming', productProperties.typeVloerverwarming));
    }
  }
  
  return parts.join('-');
}

/**
 * Generates a human-readable service description based on the product code
 */
export function generateServiceDescription(
  serviceType: string,
  isMandatory: boolean,
  productProperties?: ProductProperties,
  language: string = 'nl'
): string {
  const translations = {
    nl: {
      legservice: 'Legservice',
      verwijdering: 'Verwijdering', 
      ondervloer: 'Ondervloer',
      vloerverwarming: 'Vloerverwarming',
      container: 'Container',
      droogbouw: 'Droogbouw',
      mandatory: 'Minimum pakket',
      optional: 'Optioneel pakket',
      for: 'voor',
      with: 'met',
      pattern: 'patroon'
    },
    en: {
      legservice: 'Installation service',
      verwijdering: 'Removal',
      ondervloer: 'Underfloor',
      vloerverwarming: 'Floor heating',
      container: 'Container',
      droogbouw: 'Dry build',
      mandatory: 'Minimum package',
      optional: 'Optional package',
      for: 'for',
      with: 'with', 
      pattern: 'pattern'
    }
  };
  
  const t = translations[language as keyof typeof translations] || translations.nl;
  const parts: string[] = [];
  
  // Service type
  parts.push(t[serviceType as keyof typeof t] || serviceType);
  
  // Package type
  parts.push(t[isMandatory ? 'mandatory' : 'optional']);
  
  if (productProperties) {
    // Add product details
    const details: string[] = [];
    
    if (productProperties.hoofdcategorie) {
      details.push(productProperties.hoofdcategorie);
    }
    
    if (productProperties.legmethode) {
      details.push(`${t.with} ${productProperties.legmethode.toLowerCase()}`);
    }
    
    if (productProperties.legpatroon) {
      details.push(`${productProperties.legpatroon.toLowerCase()} ${t.pattern}`);
    }
    
    if (details.length > 0) {
      parts.push(`${t.for} ${details.join(', ')}`);
    }
  }
  
  return parts.join(' ');
}

/**
 * Generates a complete service title (code + description)
 */
export function generateServiceTitle(
  serviceType: string,
  isMandatory: boolean,
  productProperties?: ProductProperties,
  language: string = 'nl'
): string {
  const code = generateServiceProductCode(serviceType, isMandatory, productProperties);
  const description = generateServiceDescription(serviceType, isMandatory, productProperties, language);
  return `${code} - ${description}`;
}

/**
 * Example usage:
 * 
 * const productProps = {
 *   hoofdcategorie: 'PVC',
 *   legmethode: 'Klikverbinding', 
 *   legpatroon: 'Visgraat'
 * };
 * 
 * generateServiceProductCode('legservice', true, productProps)
 * // Returns: "leg-min-pvc-klik-visg"
 * 
 * generateServiceDescription('legservice', true, productProps, 'nl')
 * // Returns: "Legservice minimum pakket voor PVC met klikverbinding, visgraat patroon"
 * 
 * generateServiceTitle('legservice', true, productProps, 'nl')
 * // Returns: "leg-min-pvc-klik-visg - Legservice minimum pakket voor PVC met klikverbinding, visgraat patroon"
 */