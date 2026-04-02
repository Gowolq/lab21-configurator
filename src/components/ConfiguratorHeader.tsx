import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useTranslation } from "../utils/translations";
import logo from "figma:asset/059d6ba5a868b6ed1c1a3de76ef18426a1718787.png";

interface ConfiguratorHeaderProps {
  onClose?: () => void;
  language: string;
  onLanguageChange?: (language: string) => void;
  currentConfigurator?: string;
  configuratorProgress?: string;
}

export function ConfiguratorHeader({ onClose, language, onLanguageChange, currentConfigurator, configuratorProgress }: ConfiguratorHeaderProps) {
  const t = useTranslation(language);
  
  // Translate configurator names
  const getConfiguratorName = (configurator: string | undefined): string => {
    if (!configurator) return '';
    
    const translations: { [key: string]: { nl: string; en: string } } = {
      'Vloer': { nl: 'Vloeren', en: 'Floors' },
      'Trap': { nl: 'Traprenovaties', en: 'Stair Renovations' },
      'Raamdecoratie': { nl: 'Zonwering (binnen)', en: 'Window Blinds (interior)' },
      'Gordijnen': { nl: 'Gordijnen', en: 'Curtains' },
      'Droogbouw': { nl: 'Droogbouw', en: 'Dry Build' },
      'Verwijderen': { nl: 'Verwijderen', en: 'Removal' },
      'Vloerverwarming': { nl: 'Vloerverwarming', en: 'Underfloor Heating' },
      'Blackouts': { nl: 'Blackouts', en: 'Blackouts' },
      'Dimouts': { nl: 'Dimouts', en: 'Dimouts' },
      'Inbetweens': { nl: 'Inbetweens', en: 'Inbetweens' },
      'Overgordijnen': { nl: 'Overgordijnen', en: 'Over Curtains' },
      'Duettes': { nl: 'Duettes', en: 'Duettes' },
      'Jaloezieën': { nl: 'Jaloezieën', en: 'Venetian Blinds' },
      'Plissés': { nl: 'Plissés', en: 'Pleated Blinds' },
      'Rolgordijnen': { nl: 'Rolgordijnen', en: 'Roller Blinds' },
      'Vouwgordijnen': { nl: 'Vouwgordijnen', en: 'Folding Curtains' }
    };
    
    const translation = translations[configurator];
    return translation ? translation[language as 'nl' | 'en'] : configurator;
  };
  
  return (
    <div className="flex items-center justify-between p-4 border-b bg-white">
      <div className="flex items-center gap-3">
        <img src={logo} alt="LAB21 Logo" className="h-8 w-8" />
        <div>
          <h1 className="text-lg">{t.configuratorHeader.configurator}</h1>
          <p className="text-sm text-gray-600">
            {currentConfigurator ? `${getConfiguratorName(currentConfigurator)} ${language === 'nl' ? 'Configurator' : 'Configurator'}` : t.configuratorHeader.floorConfigurator}
            {configuratorProgress && <span className="ml-2 text-[#2d4724]">({configuratorProgress})</span>}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Language Selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">{t.language}:</span>
          <Select value={language} onValueChange={onLanguageChange}>
            <SelectTrigger className="w-32 h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="nl">Nederland</SelectItem>
              <SelectItem value="en">English</SelectItem>
            </SelectContent>
          </Select>
        </div>
        

      </div>
    </div>
  );
}