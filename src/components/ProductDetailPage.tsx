import { useState } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ArrowLeft, Save, Edit, Copy, Printer, Settings, FileText, Image, Tag, Zap, Users, DollarSign, Truck, Shield, Clock, BarChart3, AlertCircle, CheckCircle, Info, Plus, Search, Home, Contact, Calendar, Phone, FileSignature, ShoppingCart, Receipt, Eye, MapPin, Timer, MessageSquare, HeadphonesIcon, Building, Monitor, ChevronDown, ChevronRight, Package, CreditCard, Puzzle, Grid3x3, Bell, HelpCircle, Menu, MoreHorizontal, ChevronLeft } from "lucide-react";
import exampleImage from 'figma:asset/b59491f33433355cf806a08bd1b4a17c94686b97.png';
import { useTranslation } from "../utils/translations";

interface Product {
  id: string;
  name: string;
  code: string;
  configuratorName?: string;
  image?: string;
  category?: string;
  brand?: string;
  collection?: string;
  size?: string;
  thickness?: string;
  surface?: string;
  color?: string;
  eenheid?: string; // "M2", "M1", of "Stuk"
}

interface ProductDetailPageProps {
  product: Product;
  onBack: () => void;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
  language: string;
}

export function ProductDetailPage({ 
  product, 
  onBack, 
  onClose, 
  onSelectProduct,
  language 
}: ProductDetailPageProps) {
  const t = useTranslation(language);
  const [isEditing, setIsEditing] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['relatiebeheer', 'activiteiten', 'verkoop', 'services', 'instellingen', 'logistiek']));

  // Icon-only sidebar items (leftmost sidebar)
  const iconSidebarItems = [
    { icon: Grid3x3, label: 'Dashboard', active: false },
    { icon: Users, label: 'CRM', active: true },
    { icon: ShoppingCart, label: 'Sales', active: false },
    { icon: Package, label: 'Inventory', active: false },
    { icon: BarChart3, label: 'Analytics', active: false },
    { icon: Settings, label: 'Settings', active: false },
    { icon: Bell, label: 'Notifications', active: false },
    { icon: HelpCircle, label: 'Help', active: false }
  ];

  // CRM sidebar navigation items
  const crmSidebarItems = [
    { 
      type: 'item' as const, 
      icon: Home, 
      label: 'Dashboard', 
      id: 'dashboard' 
    },
    {
      type: 'section' as const,
      icon: Users,
      label: 'Relatiebeheer',
      id: 'relatiebeheer',
      children: [
        { icon: Users, label: 'Relaties', id: 'relaties' },
        { icon: Contact, label: 'Personen', id: 'personen' },
        { icon: Building, label: 'Bedrijven', id: 'bedrijven' }
      ]
    },
    {
      type: 'section' as const,
      icon: Calendar,
      label: 'Activiteiten',
      id: 'activiteiten',
      children: [
        { icon: Calendar, label: 'Agenda', id: 'agenda' },
        { icon: Phone, label: 'Gesprekken', id: 'gesprekken' },
        { icon: MessageSquare, label: 'Berichten', id: 'berichten' }
      ]
    },
    {
      type: 'section' as const,
      icon: DollarSign,
      label: 'Verkoop',
      id: 'verkoop',
      children: [
        { icon: Receipt, label: 'Offertes', id: 'offertes' },
        { icon: ShoppingCart, label: 'Orders', id: 'orders' },
        { icon: DollarSign, label: 'Facturen', id: 'facturen' }
      ]
    },
    {
      type: 'section' as const,
      icon: HeadphonesIcon,
      label: 'Services',
      id: 'services',
      children: [
        { icon: HeadphonesIcon, label: 'Support', id: 'support' },
        { icon: FileSignature, label: 'Opdrachten', id: 'opdrachten' }
      ]
    },
    {
      type: 'section' as const,
      icon: Package,
      label: 'Logistiek',
      id: 'logistiek',
      children: [
        { icon: Package, label: 'Producten', id: 'producten', active: true },
        { icon: Settings, label: 'Configuratoren', id: 'configuratoren' }
      ]
    },
    {
      type: 'section' as const,
      icon: CreditCard,
      label: 'Financieel',
      id: 'financieel',
      children: [
        { icon: CreditCard, label: 'Betalingen', id: 'betalingen' }
      ]
    },
    {
      type: 'section' as const,
      icon: Puzzle,
      label: 'Integraties',
      id: 'integraties',
      children: [
        { icon: Tag, label: 'PXL', id: 'pxl' },
        { icon: Tag, label: 'PMC', id: 'pmc' }
      ]
    }
  ];

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const handleSelectProduct = () => {
    onSelectProduct(product);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Leftmost Icon Sidebar */}
      <div className="w-12 bg-[#0d3e1e] flex-shrink-0 flex flex-col">
        {/* Top Icon Items */}
        <div className="flex-1 py-4">
          <div className="space-y-2 px-2">
            {iconSidebarItems.map((item, index) => (
              <div
                key={index}
                className={`w-8 h-8 rounded flex items-center justify-center cursor-pointer transition-colors ${
                  item.active 
                    ? 'bg-[#2d4724] text-white' 
                    : 'text-white hover:bg-[#2d4724] hover:text-white'
                }`}
                title={item.label}
              >
                <item.icon className="h-4 w-4" />
              </div>
            ))}
          </div>
        </div>
        
        {/* Bottom User Avatar */}
        <div className="p-2">
          <div className="w-8 h-8 bg-[#2d4724] rounded flex items-center justify-center text-white text-xs font-medium">
            TC
          </div>
        </div>
      </div>

      {/* Main CRM Sidebar */}
      <div className="w-64 bg-[#2d4724] text-white flex-shrink-0 flex flex-col">
        {/* Sidebar Header */}
        <div className="p-3 border-b border-green-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-green-600 rounded flex items-center justify-center">
                <Menu className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium">CRM Modules</span>
            </div>

          </div>
        </div>

        {/* Sidebar Navigation */}
        <div className="flex-1 p-3 space-y-1 overflow-y-auto">
          <div className="space-y-1">
            {crmSidebarItems.map((item) => (
              <div key={item.id}>
                {item.type === 'item' ? (
                  <div className="flex items-center gap-2 px-3 py-2 text-sm text-white hover:bg-green-600 rounded cursor-pointer transition-colors">
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </div>
                ) : (
                  <div>
                    {/* Section Header */}
                    <div 
                      className="flex items-center gap-2 px-3 py-2 text-sm text-white hover:bg-green-600 rounded cursor-pointer transition-colors"
                      onClick={() => toggleSection(item.id)}
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </div>
                      {expandedSections.has(item.id) ? (
                        <ChevronDown className="h-3 w-3" />
                      ) : (
                        <ChevronRight className="h-3 w-3" />
                      )}
                    </div>
                    
                    {/* Section Children */}
                    {expandedSections.has(item.id) && item.children && (
                      <div className="ml-4 space-y-1">
                        {item.children.map((child) => (
                          <div 
                            key={child.id}
                            className={`flex items-center gap-2 px-3 py-1.5 text-sm cursor-pointer transition-colors rounded ${
                              child.active 
                                ? 'bg-[#0d3e1e] text-white font-medium' 
                                : 'text-white hover:bg-green-600 hover:text-white'
                            }`}
                          >
                            <child.icon className="h-3 w-3" />
                            <span>{child.label}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-green-600 p-3">
          <div className="flex items-center gap-2 text-xs text-white">
            <div className="w-6 h-6 bg-green-600 rounded flex items-center justify-center">
              <span className="text-white font-medium">TC</span>
            </div>
            <span>Teamruimte CRM</span>
          </div>
          
          <Separator className="my-3 bg-green-600" />
          
          {/* Back Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="w-full justify-start text-white hover:bg-green-600 text-xs"
          >
            <ArrowLeft className="h-3 w-3 mr-2" />
            Back to Configurator
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col bg-gray-100">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Product Image */}
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center overflow-hidden">
                  <img 
                    src={exampleImage} 
                    alt="Product"
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Product Info */}
                <div className="flex flex-col">
                  <h1 className="font-medium text-gray-900">
                    {product.code} - {product.name}
                  </h1>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-gray-600">{product.code}</span>
                    <Badge variant="secondary" className="text-xs">
                      Tags toevoegen
                    </Badge>
                  </div>
                </div>
              </div>
              
              {/* Header Actions */}
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  Bewerken
                </Button>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-6 py-6 flex-1">
          {/* Tabs */}
          <Tabs defaultValue="overview" className="w-full">
            <div className="flex items-center justify-between mb-6">
              <TabsList className="grid w-auto grid-cols-2">
                <TabsTrigger value="overview">Overzicht</TabsTrigger>
                <TabsTrigger value="timeline">Tijdslijn</TabsTrigger>
              </TabsList>
              
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="h-4 w-4" />
                <span>Laatste bijwerking • 16 dag/dagen geleden</span>
              </div>
            </div>
            
            <TabsContent value="overview" className="space-y-6">
              {/* Leveranciers Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Leveranciers</CardTitle>
                </CardHeader>
                <CardContent>
                  <span className="text-sm text-gray-600">Cotap B.V</span>
                </CardContent>
              </Card>

              {/* Verberg Details Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Verberg Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-8">
                  {/* Informatie Section */}
                  <div>
                    <h3 className="font-medium text-gray-900 mb-4">Informatie</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <span className="text-sm text-gray-500">Product Code</span>
                          <p className="text-sm text-gray-900">7-Xcx-Easy-Van04</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Productnaam</span>
                          <p className="text-sm text-gray-900">EasyFit Klik PVC Visgraat Vantaa Bruin 750x150x5mm 0.55</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <span className="text-sm text-gray-500">Omschrijving</span>
                          <p className="text-sm text-gray-900">EasyFit Klik PVC Visgraat Vantaa Bruin</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Omschrijving commercieel</span>
                          <p className="text-sm text-gray-900"><b>NIEUW!</b> PVC voor huishoudelijk gebruik - EasyFit Klik PVC met prachtige designs</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Extra informatie Section */}
                  <div>
                    <h3 className="font-medium text-gray-900 mb-4">Extra informatie</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">Voorraad product</span>
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Prijs per unit</span>
                          <p className="text-sm text-gray-900">€ 29,95</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <span className="text-sm text-gray-500">Merk</span>
                          <p className="text-sm text-gray-900">EasyFit</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">EAN-code</span>
                          <p className="text-sm text-gray-900">8717003452621</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">Product Actief</span>
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Categorieën Section */}
                  <div>
                    <h3 className="font-medium text-gray-900 mb-4">Categorieën</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <span className="text-sm text-gray-500">Hoofdcategorie</span>
                        <div className="mt-1">
                          <select className="w-full px-3 py-1 text-sm border border-gray-300 rounded bg-white" defaultValue="Vloeren">
                            <option value="">—</option>
                            <option value="Vloeren">Vloeren</option>
                            <option value="Traprenovatie">Traprenovatie</option>
                            <option value="Wandpanelen">Wandpanelen</option>
                            <option value="Accessoires">Accessoires</option>
                            <option value="Dienst">Dienst</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Subcategorie</span>
                        <div className="mt-1">
                          <select className="w-full px-3 py-1 text-sm border border-gray-300 rounded bg-white" defaultValue="PVC vloer">
                            <option value="">—</option>
                            <option value="PVC vloer">PVC vloer</option>
                            <option value="Laminaat">Laminaat</option>
                            <option value="Houten vloer">Houten vloer</option>
                            <option value="Reno trap">Reno trap</option>
                            <option value="Rolgordijnen">Rolgordijnen</option>
                            <option value="Dakraam rolgordijnen">Dakraam rolgordijnen</option>
                            <option value="Onderhoudsmiddelen">Onderhoudsmiddelen</option>
                            <option value="Montage gordijnen">Montage gordijnen</option>
                            <option value="Montage vloerverwarming">Montage vloerverwarming</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Afbeeldingen Section */}
                  <div>
                    <h3 className="font-medium text-gray-900 mb-4">Afbeeldingen</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <span className="text-sm text-gray-500">Product afbeelding 1</span>
                          <div className="mt-1">
                            <select className="w-full px-3 py-1 text-sm border border-gray-300 rounded bg-white">
                              <option>—</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Product afbeelding 2</span>
                          <div className="mt-1">
                            <select className="w-full px-3 py-1 text-sm border border-gray-300 rounded bg-white">
                              <option>—</option>
                            </select>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <span className="text-sm text-gray-500">Product afbeelding 1 URL</span>
                          <p className="text-xs text-gray-600 mt-1 break-all">
                            https://flxr-accl.zohorepublic.eu/public/workdrive/7ybhc/download/deoukx318b26c85246418af90906/%3A7a4b%252Cing%253A7bKx2-linkidx%252A3A%22506Vs1Wvx50-tvfQtHGI%252K2K%252Ex2gHfBrowser%252%23Alias%2CC%25%22xvGAIpWcyP%253%3ALater%257D
                          </p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Product afbeelding 2 URL</span>
                          <div className="mt-1">
                            <select className="w-full px-3 py-1 text-sm border border-gray-300 rounded bg-white">
                              <option>—</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <Button variant="outline" size="sm">
                        Bestanden
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  {/* Details Vloer Section */}
                  <div>
                    <h3 className="font-medium text-gray-900 mb-4">Details Vloer</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <span className="text-sm text-gray-500">Pakgrootte</span>
                          <p className="text-sm text-gray-900">1.58</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Stroken</span>
                          <p className="text-sm text-gray-900">14</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Legmethode</span>
                          <div className="mt-1">
                            <select className="w-full px-3 py-1 text-sm border border-gray-300 rounded bg-white">
                              <option value="">—</option>
                              <option value="klikverbinding">Klikverbinding</option>
                              <option value="gelijmd">Gelijmd</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Legpatroon</span>
                          <div className="mt-1">
                            <select className="w-full px-3 py-1 text-sm border border-gray-300 rounded bg-white">
                              <option value="">—</option>
                              <option value="brede-stroken">Brede stroken</option>
                              <option value="hongaarse-punt">Hongaarse punt</option>
                              <option value="patroon">Patroon</option>
                              <option value="rechte-stroken">Rechte stroken</option>
                              <option value="tegel">Tegel</option>
                              <option value="visgraat">Visgraat</option>
                              <option value="walvisgraat">Walvisgraat</option>
                              <option value="weense-punt">Weense punt</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Type verbinding</span>
                          <div className="mt-1">
                            <select className="w-full px-3 py-1 text-sm border border-gray-300 rounded bg-white">
                              <option>—</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">V-groeven</span>
                          <p className="text-sm text-gray-900">4V, V-groef rondom</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Soort plank</span>
                          <div className="mt-1">
                            <select className="w-full px-3 py-1 text-sm border border-gray-300 rounded bg-white">
                              <option>—</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Soort eiken</span>
                          <div className="mt-1">
                            <select className="w-full px-3 py-1 text-sm border border-gray-300 rounded bg-white">
                              <option>—</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Materiaal</span>
                          <div className="mt-1">
                            <select className="w-full px-3 py-1 text-sm border border-gray-300 rounded bg-white">
                              <option>—</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Materiaal (detail)</span>
                          <div className="mt-1">
                            <select className="w-full px-3 py-1 text-sm border border-gray-300 rounded bg-white">
                              <option>—</option>
                            </select>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <span className="text-sm text-gray-500">Toplaag in mm</span>
                          <p className="text-sm text-gray-900">0.55</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Geschikt voor vloerverwarming</span>
                          <div className="mt-1">
                            <select className="w-full px-3 py-1 text-sm border border-gray-300 rounded bg-white">
                              <option>—</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Type vloerverwarming</span>
                          <div className="mt-1">
                            <select className="w-full px-3 py-1 text-sm border border-gray-300 rounded bg-white">
                              <option value="">—</option>
                              <option value="none">Geen</option>
                              <option value="elektrisch">Elektrisch</option>
                              <option value="gebonden">Gebonden</option>
                              <option value="gefreesd">Gefreesd</option>
                              <option value="noppen-platen">Noppen platen</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Geschikt voor trap</span>
                          <div className="mt-1">
                            <select className="w-full px-3 py-1 text-sm border border-gray-300 rounded bg-white">
                              <option>—</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Behandeling</span>
                          <div className="mt-1">
                            <select className="w-full px-3 py-1 text-sm border border-gray-300 rounded bg-white">
                              <option>—</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Garantie-norm</span>
                          <div className="mt-1">
                            <select className="w-full px-3 py-1 text-sm border border-gray-300 rounded bg-white">
                              <option>—</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Garantie/jaar</span>
                          <div className="mt-1">
                            <select className="w-full px-3 py-1 text-sm border border-gray-300 rounded bg-white">
                              <option>—</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Breedte-norm</span>
                          <div className="mt-1">
                            <select className="w-full px-3 py-1 text-sm border border-gray-300 rounded bg-white">
                              <option>—</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Geïmpregneerde ondervoer</span>
                          <div className="mt-1">
                            <select className="w-full px-3 py-1 text-sm border border-gray-300 rounded bg-white">
                              <option value="">—</option>
                              <option value="ja">Ja</option>
                              <option value="nee">Nee</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Select Product Button */}
              <div className="flex justify-end">
                <Button
                  onClick={handleSelectProduct}
                  className="bg-[#2d4724] hover:bg-[#1f3319]"
                >
                  Product Selecteren
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="timeline">
              <Card>
                <CardContent className="p-6">
                  <p className="text-gray-500">Tijdslijn informatie wordt hier weergegeven...</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}