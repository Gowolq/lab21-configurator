import { useState } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Checkbox } from "./ui/checkbox";
import { ArrowLeft, Settings, FileText, Tag, MapPin, Package, Info, CheckCircle, Database, Edit3, Save, X } from "lucide-react";
import { useTranslation } from "../utils/translations";
import { LegserviceArticle } from "../utils/legserviceArticles";

interface ServiceArticleDetailPageProps {
  article: LegserviceArticle;
  onBack: () => void;
  onClose: () => void;
  onSave?: (updatedArticle: LegserviceArticle) => void;
  language: string;
}

export function ServiceArticleDetailPage({ 
  article, 
  onBack, 
  onClose,
  onSave,
  language 
}: ServiceArticleDetailPageProps) {
  const t = useTranslation(language);
  const [isEditing, setIsEditing] = useState(false);
  const [editedArticle, setEditedArticle] = useState<LegserviceArticle>(article);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Service article detail page with real spreadsheet data
  
  // Use the edited article data when editing, otherwise original
  const displayArticle = isEditing ? editedArticle : article;

  // Helper functie om lege strings en undefined te behandelen
  const getFieldValue = (value: string | number | undefined, fallback: string = '-') => {
    if (value === undefined || value === null) return fallback;
    if (typeof value === 'string' && value.trim() === "") return fallback;
    if (typeof value === 'number') return value.toString();
    return value;
  };

  // Update function for edited article
  const updateEditedArticle = (field: keyof LegserviceArticle, value: any) => {
    setEditedArticle(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
  };

  // Save changes
  const handleSave = () => {
    if (onSave && hasChanges) {
      onSave(editedArticle);
      // Show success feedback
      console.log('Product succesvol opgeslagen:', editedArticle.productCode);
    }
    setIsEditing(false);
    setHasChanges(false);
  };

  // Cancel editing
  const handleCancel = () => {
    setEditedArticle(article);
    setIsEditing(false);
    setHasChanges(false);
  };

  // Start editing
  const handleEdit = () => {
    setIsEditing(true);
  };

  const getServiceTypeDisplay = (serviceType: string) => {
    const types: { [key: string]: string } = {
      'Legservice': language === 'en' ? 'Installation Service' : 'Legservice',
      'legservice': language === 'en' ? 'Installation Service' : 'Legservice',
      'installatie': language === 'en' ? 'Installation' : 'Installatie',
      'verwijdering': language === 'en' ? 'Removal' : 'Verwijdering',
      'container': language === 'en' ? 'Container' : 'Container',
      'vloerverwarming': language === 'en' ? 'Underfloor Heating' : 'Vloerverwarming'
    };
    return types[serviceType || ''] || getFieldValue(serviceType);
  };

  const getOndergrondDisplay = (ondergrond: string) => {
    const ondergronden: { [key: string]: string } = {
      'Zandcement': language === 'en' ? 'Sand cement' : 'Zandcement',
      'Airbase': language === 'en' ? 'Airbase' : 'Airbase',
      'Anhydriet': language === 'en' ? 'Anhydrite' : 'Anhydriet',
      'Fermacell': language === 'en' ? 'Fermacell' : 'Fermacell'
    };
    return ondergronden[ondergrond || ''] || getFieldValue(ondergrond);
  };

  const getLegmethodeDisplay = (legmethode: string) => {
    const methoden: { [key: string]: string } = {
      'Klikverbinding': language === 'en' ? 'Click connection' : 'Klikverbinding',
      'Gelijmd': language === 'en' ? 'Glued' : 'Gelijmd',
      'Zwevend': language === 'en' ? 'Floating' : 'Zwevend'
    };
    return methoden[legmethode || ''] || getFieldValue(legmethode);
  };

  const getLegpatroonDisplay = (legpatroon: string) => {
    const patronen: { [key: string]: string } = {
      'Visgraat': language === 'en' ? 'Herringbone' : 'Visgraat',
      'Tegel': language === 'en' ? 'Tile' : 'Tegel',
      'Rechte stroken': language === 'en' ? 'Straight strips' : 'Rechte stroken',
      'Brede stroken': language === 'en' ? 'Wide strips' : 'Brede stroken',
      'Weense punt': language === 'en' ? 'Vienna point' : 'Weense punt',
      'Walvisgraat': language === 'en' ? 'Chevron' : 'Walvisgraat',
      'Hongaarse punt': language === 'en' ? 'Hungarian point' : 'Hongaarse punt'
    };
    return patronen[legpatroon || ''] || getFieldValue(legpatroon);
  };

  const getTypeVloerverwarmingDisplay = (type: string) => {
    const types: { [key: string]: string } = {
      'Noppen platen': language === 'en' ? 'Dimple boards' : 'Noppen platen',
      'Gefreesd': language === 'en' ? 'Milled' : 'Gefreesd',
      'Gebonden': language === 'en' ? 'Bonded' : 'Gebonden'
    };
    return types[type || ''] || getFieldValue(type);
  };

  // Editable field component
  const EditableField = ({ row, article, onUpdate, language }: {
    row: any;
    article: LegserviceArticle;
    onUpdate: (field: keyof LegserviceArticle, value: any) => void;
    language: string;
  }) => {
    const fieldMap: { [key: string]: keyof LegserviceArticle } = {
      'A': 'ondergrond',
      'B': 'productCode',
      'C': 'description',
      'D': 'isMandatory',
      'E': 'hoofdcategorie',
      'F': 'van',
      'G': 'tot',
      'H': 'subcategorie',
      'I': 'legmethode',
      'J': 'typeVloerverwarming',
      'K': 'serviceType',
      'L': 'legpatroon',
      'M': 'vocht',
      'N': 'droogbouw',
      'O': 'vve'
    };

    const field = fieldMap[row.letter];
    const value = article[field];

    // Options for select fields
    const selectOptions: { [key: string]: { value: string; label: string }[] } = {
      ondergrond: [
        { value: 'Zandcement', label: language === 'en' ? 'Sand cement' : 'Zandcement' },
        { value: 'Airbase', label: 'Airbase' },
        { value: 'Anhydriet', label: language === 'en' ? 'Anhydrite' : 'Anhydriet' },
        { value: 'Fermacell', label: 'Fermacell' }
      ],
      legmethode: [
        { value: 'Klikverbinding', label: language === 'en' ? 'Click connection' : 'Klikverbinding' },
        { value: 'Gelijmd', label: language === 'en' ? 'Glued' : 'Gelijmd' },
        { value: 'Zwevend', label: language === 'en' ? 'Floating' : 'Zwevend' }
      ],
      legpatroon: [
        { value: 'Visgraat', label: language === 'en' ? 'Herringbone' : 'Visgraat' },
        { value: 'Tegel', label: language === 'en' ? 'Tile' : 'Tegel' },
        { value: 'Rechte stroken', label: language === 'en' ? 'Straight strips' : 'Rechte stroken' },
        { value: 'Brede stroken', label: language === 'en' ? 'Wide strips' : 'Brede stroken' },
        { value: 'Weense punt', label: language === 'en' ? 'Vienna point' : 'Weense punt' },
        { value: 'Walvisgraat', label: language === 'en' ? 'Chevron' : 'Walvisgraat' },
        { value: 'Hongaarse punt', label: language === 'en' ? 'Hungarian point' : 'Hongaarse punt' }
      ],
      typeVloerverwarming: [
        { value: 'Noppen platen', label: language === 'en' ? 'Dimple boards' : 'Noppen platen' },
        { value: 'Gefreesd', label: language === 'en' ? 'Milled' : 'Gefreesd' },
        { value: 'Gebonden', label: language === 'en' ? 'Bonded' : 'Gebonden' }
      ],
      serviceType: [
        { value: 'Legservice', label: language === 'en' ? 'Installation Service' : 'Legservice' },
        { value: 'Vloerverwarming', label: language === 'en' ? 'Underfloor Heating' : 'Vloerverwarming' },
        { value: 'Verwijdering', label: language === 'en' ? 'Removal' : 'Verwijdering' }
      ]
    };

    if (field === 'isMandatory' || field === 'vocht' || field === 'droogbouw' || field === 'vve') {
      return (
        <div className={`inline-flex items-center space-x-2 px-3 py-2 rounded-lg border ${row.color}`}>
          <Checkbox
            checked={Boolean(value)}
            onCheckedChange={(checked) => onUpdate(field, checked)}
          />
          <Label className="text-sm">
            {field === 'isMandatory' 
              ? (value ? (language === 'en' ? 'Mandatory' : 'Verplicht') : (language === 'en' ? 'Optional' : 'Optioneel'))
              : (value ? (language === 'en' ? 'Yes' : 'Ja') : (language === 'en' ? 'No' : 'Nee'))
            }
          </Label>
        </div>
      );
    }

    if (field === 'description') {
      return (
        <Textarea
          value={String(value || '')}
          onChange={(e) => onUpdate(field, e.target.value)}
          className={`min-h-[80px] ${row.color.replace('bg-', 'border-').replace('-50', '-200')}`}
          placeholder={language === 'en' ? 'Enter description...' : 'Voer beschrijving in...'}
        />
      );
    }

    if (selectOptions[field]) {
      return (
        <Select value={String(value || '')} onValueChange={(newValue) => onUpdate(field, newValue)}>
          <SelectTrigger className={`${row.color.replace('bg-', 'border-').replace('-50', '-200')}`}>
            <SelectValue placeholder={language === 'en' ? 'Select option...' : 'Selecteer optie...'} />
          </SelectTrigger>
          <SelectContent>
            {selectOptions[field].map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    // Default input for text/number fields
    return (
      <Input
        type={field === 'van' || field === 'tot' ? 'number' : 'text'}
        value={String(value || '')}
        onChange={(e) => onUpdate(field, field === 'van' || field === 'tot' ? Number(e.target.value) : e.target.value)}
        className={`${row.color.replace('bg-', 'border-').replace('-50', '-200')}`}
        placeholder={language === 'en' ? 'Enter value...' : 'Voer waarde in...'}
      />
    );
  };

  // ALLE 15 SPREADSHEET VELDEN VOOR TABEL (A-O)
  const spreadsheetData = [
    {
      letter: 'A',
      field: language === 'en' ? 'Subfloor' : 'Ondergrond',
      value: getOndergrondDisplay(displayArticle.ondergrond),
      color: 'bg-purple-50 text-purple-900 border-purple-200'
    },
    {
      letter: 'B', 
      field: language === 'en' ? 'Product Code' : 'Product Code',
      value: getFieldValue(displayArticle.productCode),
      color: 'bg-blue-50 text-blue-900 border-blue-200'
    },
    {
      letter: 'C',
      field: language === 'en' ? 'Product Name' : 'Product Naam',
      value: displayArticle.description,
      color: 'bg-green-50 text-green-900 border-green-200'
    },
    {
      letter: 'D',
      field: language === 'en' ? 'Mandatory' : 'Verplicht',
      value: displayArticle.isMandatory 
        ? (language === 'en' ? 'Mandatory' : 'Verplicht')
        : (language === 'en' ? 'Optional' : 'Optioneel'),
      color: displayArticle.isMandatory 
        ? 'bg-red-50 text-red-900 border-red-200'
        : 'bg-blue-50 text-blue-900 border-blue-200'
    },
    {
      letter: 'E',
      field: language === 'en' ? 'Main Category' : 'Hoofdcategorie',
      value: getFieldValue(displayArticle.hoofdcategorie),
      color: 'bg-yellow-50 text-yellow-900 border-yellow-200'
    },
    {
      letter: 'F',
      field: language === 'en' ? 'From (m²)' : 'Van (m²)',
      value: getFieldValue(displayArticle.van),
      color: 'bg-orange-50 text-orange-900 border-orange-200'
    },
    {
      letter: 'G',
      field: language === 'en' ? 'To (m²)' : 'Tot (m²)',
      value: getFieldValue(displayArticle.tot),
      color: 'bg-orange-50 text-orange-900 border-orange-200'
    },
    {
      letter: 'H',
      field: language === 'en' ? 'Subcategory' : 'Subcategorie',
      value: getFieldValue(displayArticle.subcategorie),
      color: 'bg-cyan-50 text-cyan-900 border-cyan-200'
    },
    {
      letter: 'I',
      field: language === 'en' ? 'Installation Method' : 'Legmethode',
      value: getLegmethodeDisplay(displayArticle.legmethode),
      color: 'bg-teal-50 text-teal-900 border-teal-200'
    },
    {
      letter: 'J',
      field: language === 'en' ? 'Heating Type' : 'Type Vloerverwarming',
      value: getTypeVloerverwarmingDisplay(displayArticle.typeVloerverwarming),
      color: 'bg-pink-50 text-pink-900 border-pink-200'
    },
    {
      letter: 'K',
      field: language === 'en' ? 'Service Type' : 'Type Service',
      value: getServiceTypeDisplay(displayArticle.serviceType),
      color: 'bg-indigo-50 text-indigo-900 border-indigo-200'
    },
    {
      letter: 'L',
      field: language === 'en' ? 'Installation Pattern' : 'Legpatroon',
      value: getLegpatroonDisplay(displayArticle.legpatroon),
      color: 'bg-emerald-50 text-emerald-900 border-emerald-200'
    },
    {
      letter: 'M',
      field: t.serviceSection.vocht,
      value: displayArticle.vocht 
        ? (language === 'en' ? 'Yes' : 'Ja')
        : (language === 'en' ? 'No' : 'Nee'),
      color: displayArticle.vocht 
        ? 'bg-sky-50 text-sky-900 border-sky-200'
        : 'bg-gray-50 text-gray-900 border-gray-200'
    },
    {
      letter: 'N',
      field: t.serviceSection.droogbouw,
      value: displayArticle.droogbouw 
        ? (language === 'en' ? 'Yes' : 'Ja')
        : (language === 'en' ? 'No' : 'Nee'),
      color: displayArticle.droogbouw 
        ? 'bg-violet-50 text-violet-900 border-violet-200'
        : 'bg-gray-50 text-gray-900 border-gray-200'
    },
    {
      letter: 'O',
      field: t.serviceSection.vve,
      value: displayArticle.vve 
        ? (language === 'en' ? 'Yes' : 'Ja')
        : (language === 'en' ? 'No' : 'Nee'),
      color: displayArticle.vve 
        ? 'bg-fuchsia-50 text-fuchsia-900 border-fuchsia-200'
        : 'bg-gray-50 text-gray-900 border-gray-200'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto bg-white">
        {/* Header */}
        <div className="bg-[#2d4724] text-white px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="text-white hover:bg-white/10 p-2"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-medium">{language === 'en' ? 'Service Product Details' : 'Service Product Details'}</h1>
                  {getFieldValue(article.productCode) !== '-' && (
                    <>
                      <span className="text-white/60">•</span>
                      <div className="bg-white/20 px-2 py-1 rounded text-sm font-mono">
                        {article.productCode}
                      </div>
                    </>
                  )}
                </div>
                <p className="text-white/80 text-sm">{language === 'en' ? 'Complete spreadsheet data (A-O)' : 'Complete spreadsheet data (A-O)'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={displayArticle.isMandatory ? "destructive" : "secondary"}>
                {displayArticle.isMandatory 
                  ? (language === 'en' ? 'Mandatory' : 'Verplicht')
                  : (language === 'en' ? 'Optional' : 'Optioneel')
                }
              </Badge>
              
              {/* Edit/Save/Cancel buttons */}
              {!isEditing ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleEdit}
                  className="text-white hover:bg-white/10"
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  {language === 'en' ? 'Edit' : 'Bewerken'}
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSave}
                    disabled={!hasChanges}
                    className="text-white hover:bg-white/10 disabled:opacity-50"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {language === 'en' ? 'Save' : 'Opslaan'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCancel}
                    className="text-white hover:bg-white/10"
                  >
                    <X className="h-4 w-4 mr-2" />
                    {language === 'en' ? 'Cancel' : 'Annuleren'}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <Tabs defaultValue="complete" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="complete">
                {language === 'en' ? 'Complete Data (A-L)' : 'Complete Data (A-L)'}
              </TabsTrigger>
              <TabsTrigger value="overview">
                {language === 'en' ? 'Overview' : 'Overzicht'}
              </TabsTrigger>
              <TabsTrigger value="technical">
                {language === 'en' ? 'Technical Details' : 'Technische Details'}
              </TabsTrigger>
            </TabsList>

            {/* COMPLETE SPREADSHEET DATA TAB */}
            <TabsContent value="complete" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    {language === 'en' ? 'Complete Spreadsheet Data (Columns A-L)' : 'Complete Spreadsheet Data (Kolommen A-L)'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-16 font-bold">
                            {language === 'en' ? 'Column' : 'Kolom'}
                          </TableHead>
                          <TableHead className="font-bold">
                            {language === 'en' ? 'Field Name' : 'Veld Naam'}
                          </TableHead>
                          <TableHead className="font-bold">
                            {language === 'en' ? 'Value' : 'Waarde'}
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {spreadsheetData.map((row, index) => (
                          <TableRow key={index} className="hover:bg-gray-50">
                            <TableCell className="font-mono font-bold text-lg">
                              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                {row.letter}
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">
                              {row.field}
                            </TableCell>
                            <TableCell>
                              {isEditing ? (
                                <EditableField
                                  row={row}
                                  article={editedArticle}
                                  onUpdate={updateEditedArticle}
                                  language={language}
                                />
                              ) : (
                                <div className={`inline-block px-3 py-2 rounded-lg border ${row.color} font-medium min-w-[100px]`}>
                                  {row.value}
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  
                  {/* Product Description Box */}
                  <div className="mt-8">
                    <h4 className="font-medium mb-3 text-gray-700">
                      {language === 'en' ? 'Full Service Description (Column C)' : 'Volledige Service Beschrijving (Kolom C)'}
                    </h4>
                    <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                      <p className="text-lg leading-relaxed text-green-900">
                        {article.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* OVERVIEW TAB */}
            <TabsContent value="overview" className="space-y-6">
              {/* Configurator Properties Card */}
              {article.configuratorName && (
                <Card className="border-[#2d4724] border-2">
                  <CardHeader className="bg-[#2d4724]/5">
                    <CardTitle className="flex items-center gap-2 text-[#2d4724]">
                      <Tag className="h-5 w-5" />
                      {language === 'en' ? 'Configurator Properties' : 'Configurator Eigenschappen'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-6">
                    <div className="grid grid-cols-1 gap-3">
                      {/* Configurator naam */}
                      <div className="flex items-start border-b pb-3">
                        <span className="text-sm font-medium text-gray-600 w-56">
                          {language === 'en' ? 'Configurator Name:' : 'Configurator naam:'}
                        </span>
                        <span className="text-sm font-bold text-[#2d4724] font-mono">
                          {article.configuratorName}
                        </span>
                      </div>
                      
                      {/* Extra configurator */}
                      {article.extraConfigurator && (
                        <div className="flex items-start border-b pb-3">
                          <span className="text-sm font-medium text-gray-600 w-56">
                            {language === 'en' ? 'Extra Configurator:' : 'Extra configurator:'}
                          </span>
                          <span className="text-sm font-semibold text-gray-900">
                            {article.extraConfigurator}
                          </span>
                        </div>
                      )}
                      
                      {/* Hoofdcategorie */}
                      {article.hoofdcategorie && (
                        <div className="flex items-start border-b pb-3">
                          <span className="text-sm font-medium text-gray-600 w-56">
                            {language === 'en' ? 'Main Category:' : 'Hoofdcategorie:'}
                          </span>
                          <span className="text-sm font-semibold text-gray-900">
                            {article.hoofdcategorie}
                          </span>
                        </div>
                      )}
                      
                      {/* Subcategorie */}
                      {article.subcategorie && (
                        <div className="flex items-start border-b pb-3">
                          <span className="text-sm font-medium text-gray-600 w-56">
                            {language === 'en' ? 'Subcategory:' : 'Subcategorie:'}
                          </span>
                          <span className="text-sm font-semibold text-gray-900">
                            {article.subcategorie}
                          </span>
                        </div>
                      )}
                      
                      {/* Installatie/Legmethode */}
                      {article.legmethode && (
                        <div className="flex items-start border-b pb-3">
                          <span className="text-sm font-medium text-gray-600 w-56">
                            {language === 'en' ? 'Installation:' : 'Installatie:'}
                          </span>
                          <span className="text-sm font-semibold text-gray-900">
                            {getLegmethodeDisplay(article.legmethode)}
                          </span>
                        </div>
                      )}
                      
                      {/* Legpatroon */}
                      {article.legpatroon && (
                        <div className="flex items-start border-b pb-3">
                          <span className="text-sm font-medium text-gray-600 w-56">
                            {language === 'en' ? 'Pattern:' : 'Legpatroon:'}
                          </span>
                          <span className="text-sm font-semibold text-gray-900">
                            {getLegpatroonDisplay(article.legpatroon)}
                          </span>
                        </div>
                      )}
                      
                      {/* Type vloerverwarming */}
                      {article.typeVloerverwarming && (
                        <div className="flex items-start border-b pb-3">
                          <span className="text-sm font-medium text-gray-600 w-56">
                            {language === 'en' ? 'Heating Type:' : 'Type vloerverwarming:'}
                          </span>
                          <span className="text-sm font-semibold text-gray-900">
                            {getTypeVloerverwarmingDisplay(article.typeVloerverwarming)}
                          </span>
                        </div>
                      )}
                      
                      {/* Geïntegreerde ondervloer */}
                      {article.geintegreerdeOndervloer && (
                        <div className="flex items-start border-b pb-3">
                          <span className="text-sm font-medium text-gray-600 w-56">
                            {language === 'en' ? 'Integrated Underfloor:' : 'Geïntegreerde ondervloer:'}
                          </span>
                          <span className="text-sm font-semibold text-gray-900">
                            {article.geintegreerdeOndervloer}
                          </span>
                        </div>
                      )}
                      
                      {/* Merk */}
                      {article.merk && (
                        <div className="flex items-start border-b pb-3">
                          <span className="text-sm font-medium text-gray-600 w-56">
                            {language === 'en' ? 'Brand:' : 'Merk:'}
                          </span>
                          <span className="text-sm font-semibold text-gray-900">
                            {article.merk}
                          </span>
                        </div>
                      )}
                      
                      {/* Extra configurator */}
                      {article.extraConfigurator && (
                        <div className="flex items-start">
                          <span className="text-sm font-medium text-gray-600 w-56">
                            {language === 'en' ? 'Extra Configurator:' : 'Extra configurator:'}
                          </span>
                          <span className="text-sm font-semibold text-gray-900">
                            {article.extraConfigurator}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {language === 'en' ? 'Service Information' : 'Service Informatie'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Service Description */}
                  <div>
                    <h4 className="font-medium mb-3 text-gray-700">
                      {language === 'en' ? 'Service Description' : 'Service Beschrijving'}
                    </h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-lg leading-relaxed">{article.description}</p>
                    </div>
                  </div>

                  {/* Basic Information Grid */}
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <label className="text-sm font-medium text-blue-700">
                        {language === 'en' ? 'Product Code' : 'Product Code'}
                      </label>
                      <p className="text-xl font-mono font-semibold text-blue-900">
                        {getFieldValue(article.productCode) !== '-' ? (
                          article.productCode
                        ) : (
                          <span className="text-gray-400 italic text-lg">
                            {language === 'en' ? 'Not assigned' : 'Niet toegewezen'}
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <label className="text-sm font-medium text-green-700">
                        {language === 'en' ? 'Service Status' : 'Service Status'}
                      </label>
                      <div className="flex items-center gap-2 mt-1">
                        {article.isMandatory ? (
                          <>
                            <CheckCircle className="h-5 w-5 text-red-500" />
                            <span className="text-xl font-semibold text-red-600">
                              {language === 'en' ? 'Mandatory' : 'Verplicht'}
                            </span>
                          </>
                        ) : (
                          <>
                            <Info className="h-5 w-5 text-blue-500" />
                            <span className="text-xl font-semibold text-blue-600">
                              {language === 'en' ? 'Optional' : 'Optioneel'}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TECHNICAL DETAILS TAB */}
            <TabsContent value="technical" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    {language === 'en' ? 'Technical Specifications' : 'Technische Specificaties'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-8">
                  {/* Installation Specifications */}
                  <div>
                    <h4 className="font-medium mb-4 text-gray-700 border-b pb-2">
                      {language === 'en' ? 'Installation Specifications' : 'Installatie Specificaties'}
                    </h4>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
                        <label className="text-sm font-medium text-teal-700">
                          {language === 'en' ? 'Installation Method' : 'Legmethode'}
                        </label>
                        <p className="text-xl font-semibold text-teal-900">
                          {getLegmethodeDisplay(article.legmethode)}
                        </p>
                      </div>
                      <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                        <label className="text-sm font-medium text-emerald-700">
                          {language === 'en' ? 'Installation Pattern' : 'Legpatroon'}
                        </label>
                        <p className="text-xl font-semibold text-emerald-900">
                          {getLegpatroonDisplay(article.legpatroon)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Surface and Heating */}
                  <div>
                    <h4 className="font-medium mb-4 text-gray-700 border-b pb-2">
                      {language === 'en' ? 'Base Floor & Heating' : 'Basisvloer & Verwarming'}
                    </h4>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                        <label className="text-sm font-medium text-purple-700">
                          {language === 'en' ? 'Base Floor Type' : 'Basisvloer Type'}
                        </label>
                        <p className="text-xl font-semibold text-purple-900">
                          {getOndergrondDisplay(article.ondergrond)}
                        </p>
                      </div>
                      <div className="bg-pink-50 p-4 rounded-lg border border-pink-200">
                        <label className="text-sm font-medium text-pink-700">
                          {language === 'en' ? 'Heating Type' : 'Type Vloerverwarming'}
                        </label>
                        <p className="text-xl font-semibold text-pink-900">
                          {getTypeVloerverwarmingDisplay(article.typeVloerverwarming)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Categories and Range */}
                  <div>
                    <h4 className="font-medium mb-4 text-gray-700 border-b pb-2">
                      {language === 'en' ? 'Categories & Range' : 'Categorieën & Bereik'}
                    </h4>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                        <label className="text-sm font-medium text-yellow-700">
                          {language === 'en' ? 'Main Category' : 'Hoofdcategorie'}
                        </label>
                        <p className="text-xl font-semibold text-yellow-900">
                          {getFieldValue(article.hoofdcategorie)}
                        </p>
                      </div>
                      <div className="bg-cyan-50 p-4 rounded-lg border border-cyan-200">
                        <label className="text-sm font-medium text-cyan-700">
                          {language === 'en' ? 'Subcategory' : 'Subcategorie'}
                        </label>
                        <p className="text-xl font-semibold text-cyan-900">
                          {getFieldValue(article.subcategorie)}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6 mt-4">
                      <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                        <label className="text-sm font-medium text-orange-700">
                          {language === 'en' ? 'Area Range' : 'Oppervlakte Bereik'}
                        </label>
                        <p className="text-xl font-semibold text-orange-900">
                          {article.van && article.tot 
                            ? `${article.van} - ${article.tot} m²`
                            : (language === 'en' ? 'No specific range' : 'Geen specifiek bereik')
                          }
                        </p>
                      </div>
                      <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                        <label className="text-sm font-medium text-indigo-700">
                          {language === 'en' ? 'Service Type' : 'Type Service'}
                        </label>
                        <p className="text-xl font-semibold text-indigo-900">
                          {getServiceTypeDisplay(article.serviceType)}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}