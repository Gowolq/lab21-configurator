import { useState } from "react";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Card } from "./ui/card";
import { Check, Layers, Trash2, Grid3x3, Thermometer, Waves, Blinds, Menu, Minimize2, Columns3, Moon, CloudSun, Square, Sparkles } from "lucide-react";
import { CurtainIcon } from "./icons/CurtainIcon";
import { StairsIcon } from "./icons/StairsIcon";

import { useTranslation } from "../utils/translations";
import logo from "figma:asset/059d6ba5a868b6ed1c1a3de76ef18426a1718787.png";


interface ProductSelectionProps {
  onProceed: (selectedConfigurators: string[]) => void;
  onClose: () => void;
  language: string;
  onLanguageChange?: (language: string) => void;
}

interface ConfiguratorOption {
  id: string;
  name: { nl: string; en: string };
  icon: React.ComponentType<{ className?: string }>;
  description: { nl: string; en: string };
  color: string;
  category: 'main' | 'sub';
  dependsOn?: string[];
}

export function ProductSelection({ onProceed, onClose, language, onLanguageChange }: ProductSelectionProps) {
  const t = useTranslation(language);
  const [selectedConfigurators, setSelectedConfigurators] = useState<string[]>([]);

  const handleProceed = () => {
    // Stuur alle geselecteerde configuratoren door
    onProceed(selectedConfigurators);
  };

  const configuratorOptions: ConfiguratorOption[] = [
    {
      id: "Vloer",
      name: { nl: "Vloeren", en: "Floors" },
      icon: Grid3x3,
      description: { 
        nl: "PVC, laminaat en houten vloeren", 
        en: "PVC, laminate and wooden floors" 
      },
      color: "#f0fdf4", // Zeer lichte groen
      category: 'main'
    },
    {
      id: "Trap",
      name: { nl: "Traprenovaties", en: "Stair Renovations" },
      icon: StairsIcon,
      description: { 
        nl: "Trap renovatie en bekleding", 
        en: "Stair renovation and covering" 
      },
      color: "#faf5ff", // Zeer lichte paars/lavender
      category: 'main'
    },
    {
      id: "Raamdecoratie",
      name: { nl: "Zonwering (binnen)", en: "Window Blinds (interior)" },
      icon: CurtainIcon,
      description: { 
        nl: "Duettes, jaloezieën, plissés, rolgordijnen en vouwgordijnen", 
        en: "Duettes, venetian blinds, pleated blinds, roller blinds and folding curtains" 
      },
      color: "#eff6ff", // Zeer lichte blauw
      category: 'main'
    },
    {
      id: "Gordijnen",
      name: { nl: "Gordijnen", en: "Curtains" },
      icon: Waves,
      description: { 
        nl: "Blackouts, dimouts, inbetweens en overgordijnen", 
        en: "Blackouts, dimouts, inbetweens and curtains" 
      },
      color: "#fdf2f8", // Zeer lichte roze/pink
      category: 'main'
    },
    {
      id: "Droogbouw",
      name: { nl: "Droogbouw", en: "Dry Build" },
      icon: Layers,
      description: { 
        nl: "Ondervloer voorbereiding en egalisatie", 
        en: "Subfloor preparation and leveling" 
      },
      color: "#fff7ed", // Zeer lichte oranje
      category: 'sub',
      dependsOn: ['Vloer']
    },
    // Removed subconfiguradores for Raamdecoratie (Duettes, Jaloezieën, Plissés, Rolgordijnen, Vouwgordijnen)
    // Removed subconfiguradores for Gordijnen (Blackouts, Dimouts, Inbetweens, Overgordijnen)
    {
      id: "Verwijderen",
      name: { nl: "Verwijderen", en: "Removal" },
      icon: Trash2,
      description: { 
        nl: "Verwijdering bestaande materialen", 
        en: "Removal of existing materials" 
      },
      color: "#fff1f2", // Zeer lichte rood/rose
      category: 'sub',
      dependsOn: ['Vloer', 'Trap']
    },
    {
      id: "Vloerverwarming",
      name: { nl: "Vloerverwarming", en: "Underfloor Heating" },
      icon: Thermometer,
      description: { 
        nl: "Vloerverwarmingssystemen", 
        en: "Underfloor heating systems" 
      },
      color: "#fffbeb", // Zeer lichte amber/geel
      category: 'sub',
      dependsOn: ['Vloer']
    }
  ];

  const mainConfigurators = configuratorOptions.filter(c => c.category === 'main');
  const subConfigurators = configuratorOptions.filter(c => c.category === 'sub');
  
  // Filter subconfigurators based on selected main configurators
  const availableSubConfigurators = subConfigurators.filter(sub => {
    if (!sub.dependsOn) return true;
    return sub.dependsOn.some(dep => selectedConfigurators.includes(dep));
  });

  const handleConfiguratorToggle = (configuratorId: string) => {
    setSelectedConfigurators(prev => {
      const option = configuratorOptions.find(c => c.id === configuratorId);
      
      if (option?.category === 'main') {
        // For main configurators: only one can be selected at a time
        if (prev.includes(configuratorId)) {
          // Deselecting the main configurator
          // Also deselect all sub configurators
          return [];
        } else {
          // Selecting a new main configurator
          // Replace the current main with the new one, and clear all subs
          return [configuratorId];
        }
      } else {
        // For sub configurators: toggle normally
        if (prev.includes(configuratorId)) {
          return prev.filter(c => c !== configuratorId);
        } else {
          return [...prev, configuratorId];
        }
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full mx-auto min-h-screen">
        {/* Header */}
        <div className="bg-white border-b shadow-sm sticky top-0 z-10">
          <div className="flex items-center justify-between p-4 md:p-6">
            <div className="flex items-center gap-3">
              <img src={logo} alt="LAB21 Logo" className="h-10 w-10 md:h-12 md:w-12" />
              <div>
                <h1 className="text-xl md:text-2xl text-[#2d4724]">LAB21 Configurator</h1>
                <p className="text-sm text-gray-500 hidden md:block">
                  {language === 'nl' ? 'Professionele vloer- en renovatie oplossingen' : 'Professional flooring and renovation solutions'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Language Selector */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 hidden sm:inline">{t.language}:</span>
                <Select value={language} onValueChange={onLanguageChange}>
                  <SelectTrigger className="w-24 h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nl">NL</SelectItem>
                    <SelectItem value="en">EN</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-4 md:p-8">
          {/* Title Section */}
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl mb-2 text-gray-900">
              {language === 'nl' ? 'Selecteer configuratoren' : 'Select configurators'}
            </h2>
            <p className="text-gray-600">
              {language === 'nl' 
                ? 'Kies een of meerdere configuratoren om uw project op te starten' 
                : 'Choose one or more configurators to start your project'}
            </p>
          </div>

          {/* Main Configurators Section */}
          <div className="mb-12">
            <h3 className="text-lg mb-4 text-gray-700 px-2">
              {language === 'nl' ? 'Hoofdconfiguratoren' : 'Main Configurators'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {mainConfigurators.map((option) => {
                const isSelected = selectedConfigurators.includes(option.id);
                const Icon = option.icon;
                
                const getDarkColor = (id: string) => {
                  switch(id) {
                    case "Droogbouw":
                      return "#ea580c"; // Oranje
                    case "Raamdecoratie":
                      return "#2563eb"; // Blauw
                    case "Trap":
                      return "#9333ea"; // Paars
                    case "Verwijderen":
                      return "#e11d48"; // Rood
                    case "Vloer":
                      return "#2d4724"; // Groen
                    case "Vloerverwarming":
                      return "#f59e0b"; // Amber/Geel
                    default:
                      return "#64748b"; // Grijs
                  }
                };
                
                const darkColor = getDarkColor(option.id);
                
                return (
                  <Card
                    key={option.id}
                    onClick={() => handleConfiguratorToggle(option.id)}
                    className={`
                      relative cursor-pointer transition-all duration-200 overflow-hidden
                      ${isSelected 
                        ? 'shadow-lg scale-[1.02] border-2 border-gray-300' 
                        : 'hover:shadow-md hover:scale-[1.01] border-2 border-gray-200'
                      }
                    `}
                    style={{ backgroundColor: isSelected ? option.color : 'white' }}
                  >
                    <div className="p-6">
                      <div className="flex items-start mb-3">
                        <div>
                          <h3 className="text-lg text-gray-900">
                            {option.name[language as keyof typeof option.name]}
                          </h3>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600">
                        {option.description[language as keyof typeof option.description]}
                      </p>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Sub Configurators Section */}
          <div className="mb-12">
            <h3 className="text-lg mb-4 text-gray-700 px-2">
              {language === 'nl' ? 'Subconfiguratoren' : 'Sub Configurators'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {availableSubConfigurators.map((option) => {
                const isSelected = selectedConfigurators.includes(option.id);
                const Icon = option.icon;
                
                const getDarkColor = (id: string) => {
                  switch(id) {
                    case "Droogbouw":
                      return "#ea580c"; // Oranje
                    case "Raamdecoratie":
                      return "#2563eb"; // Blauw
                    case "Trap":
                      return "#9333ea"; // Paars
                    case "Verwijderen":
                      return "#e11d48"; // Rood
                    case "Vloer":
                      return "#2d4724"; // Groen
                    case "Vloerverwarming":
                      return "#f59e0b"; // Amber/Geel
                    default:
                      return "#64748b"; // Grijs
                  }
                };
                
                const darkColor = getDarkColor(option.id);
                
                return (
                  <Card
                    key={option.id}
                    onClick={() => handleConfiguratorToggle(option.id)}
                    className={`
                      relative cursor-pointer transition-all duration-200 overflow-hidden
                      ${isSelected 
                        ? 'shadow-lg scale-[1.02] border-2 border-gray-300' 
                        : 'hover:shadow-md hover:scale-[1.01] border-2 border-gray-200'
                      }
                    `}
                    style={{ backgroundColor: isSelected ? option.color : 'white' }}
                  >
                    <div className="p-6">
                      <div className="flex items-start mb-3">
                        <div>
                          <h3 className="text-lg text-gray-900">
                            {option.name[language as keyof typeof option.name]}
                          </h3>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600">
                        {option.description[language as keyof typeof option.description]}
                      </p>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="max-w-md mx-auto space-y-3">
            <Button 
              onClick={handleProceed}
              disabled={selectedConfigurators.length === 0}
              className="w-full bg-[#2d4724] hover:bg-[#1f3319] text-white h-12 text-lg"
            >
              {language === 'nl' ? 'Start configuratie' : 'Start configuration'}
              {selectedConfigurators.length > 0 && ` (${selectedConfigurators.length})`}
            </Button>
            
            {selectedConfigurators.length > 0 && (
              <button
                onClick={() => setSelectedConfigurators([])}
                className="w-full text-sm text-gray-600 hover:text-gray-900 py-2 transition-colors"
              >
                {language === 'nl' ? 'Selectie wissen' : 'Clear selection'}
              </button>
            )}
          </div>

          {/* Info Footer */}
          <div className="mt-12 text-center text-sm text-gray-500">
            <p>
              {language === 'nl' 
                ? 'Tip: U kunt één hoofdconfigurator en meerdere subconfiguratoren selecteren. Na afronding kunt u extra configuratoren toevoegen aan de opdracht.' 
                : 'Tip: You can select one main configurator and multiple sub-configurators. After completion, you can add additional configurators to the order.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}