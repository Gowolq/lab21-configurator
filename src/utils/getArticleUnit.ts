// Hulpfunctie om de eenheid van een artikel te bepalen
// Gebaseerd op productCode en description

export function getArticleUnit(productCode: string, description?: string, berekening?: string): string {
  const code = productCode.toLowerCase();
  const desc = description?.toLowerCase() || '';
  
  // Stuk - voor specifieke artikelen met "Stuk" berekening of vaste artikelen
  if (berekening === 'Stuk') {
    return 'Stuk';
  }
  
  // Containers zijn altijd "Stuk"
  if (code.includes('con-') || code.includes('container')) {
    return 'Stuk';
  }
  
  // DROOGBOUW-10006 is specifiek "Stuk"
  if (code === 'droogbouw-10006') {
    return 'Stuk';
  }
  
  // M1 (strekkende meter) - voor lineaire producten
  if (code.includes('plinten') || desc.includes('plinten')) {
    return 'M1';
  }
  
  if (code.includes('dorpel') || desc.includes('dorpel')) {
    return 'M1';
  }
  
  if (code.includes('bies-') || desc.includes('bies')) {
    return 'M1';
  }
  
  // M2 (vierkante meter) - standaard voor alle overige vloerproducten
  return 'M2';
}
