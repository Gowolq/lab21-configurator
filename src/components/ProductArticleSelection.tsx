import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Checkbox } from "./ui/checkbox";
import { ScrollArea } from "./ui/scroll-area";
import { ChevronDown, ChevronUp, Search } from "lucide-react";
import { useTranslation } from "../utils/translations";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";

interface Product {
  id: string;
  name: string;
  code: string;
  configuratorName?: string;
  extraConfigurator?: string;
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
  pakgrootte?: number; // in m²
  snijverlies?: number; // percentage (bijv. 10 voor 10%)
  eenheid?: string; // "M2", "M1", of "Stuk"
  doelKlant?: string[]; // Voor zonwering: Sfeer, Privacy, etc.
  eigenschappen?: string[]; // Voor zonwering: Brandvertragend, Isolerend, Patroon, Uni
  aanbevolen?: boolean; // Aanbevolen artikel: ja/nee
}

interface ProductArticleSelectionProps {
  onBack: () => void;
  onProceed: (selectedProduct: Product) => void;
  onClose: () => void;
  onOpenProductDetail?: (product: Product) => void;
  language: string;
  isModal?: boolean;
  currentConfigurator?: string; // The active configurator to filter products
}

const mockProducts: Product[] = [
  // EasyFit PVC Producten
  {
    id: "1",
    name: "EasyFit Klik PVC Espoo Naturel 1220x228x5mm 0,55",
    code: "6-Xcx-Easy-Esp05",
    configuratorName: "VOORBEREIDEN-10594",
    image: "https://images.unsplash.com/photo-1611759754996-939736cccdd4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjB2aW55bCUyMGZsb29yaW5nfGVufDF8fHx8MTc2MTU3NTY0MHww&ixlib=rb-4.1.0&q=80&w=1080",
    category: "PVC",
    brand: "EasyFit",
    legmethode: "Zwevend",
    hoofdcategorie: "Vloeren",
    subcategorie: "PVC",
    legpatroon: "Rechte stroken",
    typeVloerverwarming: "Gebonden; Gefreesd; Noppen platen",
    geintegreerdeOndervloer: "Nee",
    pakgrootte: 2.18,
    snijverlies: 10,
    eenheid: "M2",
    aanbevolen: true
  },
  {
    id: "2",
    name: "EasyFit Klik PVC Vantaa Gerookt 1220x228x5mm 0,55",
    code: "6-Xcx-Easy-Van06",
    configuratorName: "VOORBEREIDEN-10595",
    image: "https://images.unsplash.com/photo-1611759754996-939736cccdd4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjB2aW55bCUyMGZsb29yaW5nfGVufDF8fHx8MTc2MTU3NTY0MHww&ixlib=rb-4.1.0&q=80&w=1080",
    category: "PVC",
    brand: "EasyFit",
    legmethode: "Zwevend",
    hoofdcategorie: "Vloeren",
    subcategorie: "PVC",
    legpatroon: "Rechte stroken",
    typeVloerverwarming: "Gebonden; Gefreesd; Noppen platen",
    geintegreerdeOndervloer: "Nee",
    pakgrootte: 2.18,
    snijverlies: 10
  },

  // Stech PVC Producten
  {
    id: "3",
    name: "Stech Radiance XL Plank Klik PVC 1532x232x8mm 0,55 (met geïntegreerde ondervloer, wel 10DB) 100",
    code: "4-Xcx-rad-100",
    configuratorName: "VOORBEREIDEN-10596",
    image: "https://images.unsplash.com/photo-1611759754996-939736cccdd4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjB2aW55bCUyMGZsb29yaW5nfGVufDF8fHx8MTc2MTU3NTY0MHww&ixlib=rb-4.1.0&q=80&w=1080",
    category: "PVC",
    brand: "Stech",
    legmethode: "Zwevend",
    hoofdcategorie: "Vloeren",
    subcategorie: "PVC",
    legpatroon: "Rechte stroken",
    typeVloerverwarming: "Gebonden; Gefreesd; Noppen platen",
    geintegreerdeOndervloer: "Ja",
    pakgrootte: 2.18,
    snijverlies: 10,
    aanbevolen: true
  },
  {
    id: "4",
    name: "Stech Radiance XL Plank Klik PVC 1532x232x8mm 0,55 (met geïntegreerde ondervloer, wel 10DB) 105",
    code: "4-Xcx-rad-105",
    configuratorName: "VOORBEREIDEN-10597",
    image: "https://images.unsplash.com/photo-1611759754996-939736cccdd4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjB2aW55bCUyMGZsb29yaW5nfGVufDF8fHx8MTc2MTU3NTY0MHww&ixlib=rb-4.1.0&q=80&w=1080",
    category: "PVC",
    brand: "Stech",
    legmethode: "Zwevend",
    hoofdcategorie: "Vloeren",
    subcategorie: "PVC",
    legpatroon: "Rechte stroken",
    typeVloerverwarming: "Gebonden; Gefreesd; Noppen platen",
    geintegreerdeOndervloer: "Ja",
    pakgrootte: 2.18,
    snijverlies: 10
  },

  // Enigma PVC Klik Producten - Visgraat
  {
    id: "5",
    name: "Enigma Paradox Visgraat XL Klik PVC 735x147x7mm 0,55 (met geïntegreerde ondervloer geen 10DB) 1509",
    code: "6-Xcx-Eni-1509",
    configuratorName: "VOORBEREIDEN-10598",
    image: "https://images.unsplash.com/photo-1761053130711-2515ef532bb5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZXJyaW5nYm9uZSUyMHdvb2QlMjBmbG9vcnxlbnwxfHx8fDE3NjE1NzU2NDB8MA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "PVC",
    brand: "Enigma",
    legmethode: "Zwevend",
    hoofdcategorie: "Vloeren",
    subcategorie: "PVC",
    legpatroon: "Visgraat",
    typeVloerverwarming: "Gebonden; Gefreesd; Noppen platen",
    geintegreerdeOndervloer: "Ja",
    pakgrootte: 2.18,
    snijverlies: 15,
    aanbevolen: true
  },
  {
    id: "6",
    name: "Enigma Riddle Visgraat XL Klik PVC 735x147x7mm 0,55 (met geïntegreerde ondervloer geen 10DB) 1506",
    code: "6-Xcx-Eni-1506",
    configuratorName: "VOORBEREIDEN-10599",
    image: "https://images.unsplash.com/photo-1761053130711-2515ef532bb5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZXJyaW5nYm9uZSUyMHdvb2QlMjBmbG9vcnxlbnwxfHx8fDE3NjE1NzU2NDB8MA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "PVC",
    brand: "Enigma",
    legmethode: "Zwevend",
    hoofdcategorie: "Vloeren",
    subcategorie: "PVC",
    legpatroon: "Visgraat",
    typeVloerverwarming: "Gebonden; Gefreesd; Noppen platen",
    geintegreerdeOndervloer: "Ja",
    pakgrootte: 2.18,
    snijverlies: 15
  },
  {
    id: "7",
    name: "Enigma Puzzle Klik PVC 914x457x7mm 0,55 (met geïntegreerde ondervloer geen 10DB) 603",
    code: "4-Xcx-Eni-603",
    configuratorName: "VOORBEREIDEN-10600",
    image: "https://images.unsplash.com/photo-1627851679590-d3c915460856?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdG9uZSUyMHRpbGUlMjBmbG9vcmluZ3xlbnwxfHx8fDE3NjE1NzU2NDF8MA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "PVC",
    brand: "Enigma",
    legmethode: "Zwevend",
    hoofdcategorie: "Vloeren",
    subcategorie: "PVC",
    legpatroon: "Tegel",
    typeVloerverwarming: "Gebonden; Gefreesd; Noppen platen",
    geintegreerdeOndervloer: "Ja",
    pakgrootte: 2.18,
    snijverlies: 20
  },
  {
    id: "8",
    name: "Enigma Puzzle Klik PVC 914x457x7mm 0,55 (met geïntegreerde ondervloer geen 10DB) 607",
    code: "4-Xcx-Eni-607",
    configuratorName: "VOORBEREIDEN-10601",
    image: "https://images.unsplash.com/photo-1627851679590-d3c915460856?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdG9uZSUyMHRpbGUlMjBmbG9vcmluZ3xlbnwxfHx8fDE3NjE1NzU2NDF8MA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "PVC",
    brand: "Enigma",
    legmethode: "Zwevend",
    hoofdcategorie: "Vloeren",
    subcategorie: "PVC",
    legpatroon: "Tegel",
    typeVloerverwarming: "Gebonden; Gefreesd; Noppen platen",
    geintegreerdeOndervloer: "Ja",
    pakgrootte: 2.18,
    snijverlies: 20
  },
  {
    id: "9",
    name: "Enigma Paradox XL Plank Klik PVC 1522x240x7mm 0,55 (met geïntegreerde ondervloer geen 10DB) 508",
    code: "4-Xcx-Eni-508",
    configuratorName: "VOORBEREIDEN-10602",
    image: "https://images.unsplash.com/photo-1611759754996-939736cccdd4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjB2aW55bCUyMGZsb29yaW5nfGVufDF8fHx8MTc2MTU3NTY0MHww&ixlib=rb-4.1.0&q=80&w=1080",
    category: "PVC",
    brand: "Enigma",
    legmethode: "Zwevend",
    hoofdcategorie: "Vloeren",
    subcategorie: "PVC",
    legpatroon: "Rechte stroken",
    typeVloerverwarming: "Gebonden; Gefreesd; Noppen platen",
    geintegreerdeOndervloer: "Ja",
    pakgrootte: 2.18,
    snijverlies: 10,
    aanbevolen: true
  },
  {
    id: "10",
    name: "Enigma Intrigue XL Plank Klik PVC 1522x240x7mm 0,55 (met geïntegreerde ondervloer geen 10DB) 505",
    code: "4-Xcx-Eni-505",
    configuratorName: "VOORBEREIDEN-10603",
    image: "https://images.unsplash.com/photo-1611759754996-939736cccdd4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjB2aW55bCUyMGZsb29yaW5nfGVufDF8fHx8MTc2MTU3NTY0MHww&ixlib=rb-4.1.0&q=80&w=1080",
    category: "PVC",
    brand: "Enigma",
    legmethode: "Zwevend",
    hoofdcategorie: "Vloeren",
    subcategorie: "PVC",
    legpatroon: "Rechte stroken",
    typeVloerverwarming: "Gebonden; Gefreesd; Noppen platen",
    geintegreerdeOndervloer: "Ja",
    pakgrootte: 2.18,
    snijverlies: 10
  },

  // Enigma PVC Lijm Producten
  {
    id: "11",
    name: "Enigma Intrigue Visgraat Lijm PVC 595x119x2,5mm 0,55 1500",
    code: "5-Xcx-Eni-1500",
    configuratorName: "VOORBEREIDEN-10604",
    image: "https://images.unsplash.com/photo-1761053130711-2515ef532bb5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZXJyaW5nYm9uZSUyMHdvb2QlMjBmbG9vcnxlbnwxfHx8fDE3NjE1NzU2NDB8MA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "PVC",
    brand: "Enigma",
    legmethode: "Gelijmd",
    hoofdcategorie: "Vloeren",
    subcategorie: "PVC",
    legpatroon: "Visgraat",
    typeVloerverwarming: "Gebonden; Gefreesd; Noppen platen",
    geintegreerdeOndervloer: "Nee",
    pakgrootte: 2.18,
    snijverlies: 15
  },
  {
    id: "12",
    name: "Enigma Intrigue XL Plank Lijm PVC 1530x250x2,5mm 0,55 500",
    code: "3-Xcx-Eni-500",
    configuratorName: "VOORBEREIDEN-10605",
    image: "https://images.unsplash.com/photo-1611759754996-939736cccdd4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjB2aW55bCUyMGZsb29yaW5nfGVufDF8fHx8MTc2MTU3NTY0MHww&ixlib=rb-4.1.0&q=80&w=1080",
    category: "PVC",
    brand: "Enigma",
    legmethode: "Gelijmd",
    hoofdcategorie: "Vloeren",
    subcategorie: "PVC",
    legpatroon: "Rechte stroken",
    typeVloerverwarming: "Gebonden; Gefreesd; Noppen platen",
    geintegreerdeOndervloer: "Nee",
    pakgrootte: 2.18,
    snijverlies: 10,
    aanbevolen: true
  },
  {
    id: "13",
    name: "Enigma Paradox Visgraat XL Lijm PVC 765x153x2,5mm 0,55 1512",
    code: "5-Xcx-Eni-1512",
    configuratorName: "VOORBEREIDEN-10606",
    image: "https://images.unsplash.com/photo-1761053130711-2515ef532bb5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZXJyaW5nYm9uZSUyMHdvb2QlMjBmbG9vcnxlbnwxfHx8fDE3NjE1NzU2NDB8MA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "PVC",
    brand: "Enigma",
    legmethode: "Gelijmd",
    hoofdcategorie: "Vloeren",
    subcategorie: "PVC",
    legpatroon: "Visgraat",
    typeVloerverwarming: "Gebonden; Gefreesd; Noppen platen",
    geintegreerdeOndervloer: "Nee",
    pakgrootte: 2.18,
    snijverlies: 15
  },
  {
    id: "14",
    name: "Enigma Paradox XL Plank Lijm PVC 1530x250x2,5mm 0,55 512",
    code: "3-Xcx-Eni-512",
    configuratorName: "VOORBEREIDEN-10607",
    image: "https://images.unsplash.com/photo-1611759754996-939736cccdd4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjB2aW55bCUyMGZsb29yaW5nfGVufDF8fHx8MTc2MTU3NTY0MHww&ixlib=rb-4.1.0&q=80&w=1080",
    category: "PVC",
    brand: "Enigma",
    legmethode: "Gelijmd",
    hoofdcategorie: "Vloeren",
    subcategorie: "PVC",
    legpatroon: "Rechte stroken",
    typeVloerverwarming: "Gebonden; Gefreesd; Noppen platen",
    geintegreerdeOndervloer: "Nee",
    pakgrootte: 2.18,
    snijverlies: 20
  },
  {
    id: "15",
    name: "Enigma Puzzle rechthoek Lijm PVC 914x457x2,5mm 0,55 608",
    code: "3-Xcx-Eni-608",
    configuratorName: "VOORBEREIDEN-10608",
    image: "https://images.unsplash.com/photo-1627851679590-d3c915460856?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdG9uZSUyMHRpbGUlMjBmbG9vcmluZ3xlbnwxfHx8fDE3NjE1NzU2NDF8MA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "PVC",
    brand: "Enigma",
    legmethode: "Gelijmd",
    hoofdcategorie: "Vloeren",
    subcategorie: "PVC",
    legpatroon: "Tegel",
    typeVloerverwarming: "Gebonden; Gefreesd; Noppen platen",
    geintegreerdeOndervloer: "Nee",
    pakgrootte: 2.18,
    snijverlies: 20
  },
  {
    id: "16",
    name: "Enigma Puzzle vierkant Lijm PVC 914x914x2,5mm 0,55 615",
    code: "3-Xcx-Eni-615",
    configuratorName: "VOORBEREIDEN-10609",
    image: "https://images.unsplash.com/photo-1627851679590-d3c915460856?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdG9uZSUyMHRpbGUlMjBmbG9vcmluZ3xlbnwxfHx8fDE3NjE1NzU2NDF8MA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "PVC",
    brand: "Enigma",
    legmethode: "Gelijmd",
    hoofdcategorie: "Vloeren",
    subcategorie: "PVC",
    legpatroon: "Tegel",
    typeVloerverwarming: "Gebonden; Gefreesd; Noppen platen",
    geintegreerdeOndervloer: "Nee",
    pakgrootte: 2.18,
    snijverlies: 20
  },

  // Prestige PVC Hongaarse Punt
  {
    id: "17",
    name: "Prestige Arrow hongaarse punt lijm pvc smoky 718x152x2,5mm 0,55",
    code: "5-xcx-pr-131612",
    configuratorName: "VOORBEREIDEN-10610",
    image: "https://images.unsplash.com/photo-1761053130711-2515ef532bb5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZXJyaW5nYm9uZSUyMHdvb2QlMjBmbG9vcnxlbnwxfHx8fDE3NjE1NzU2NDB8MA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "PVC",
    brand: "Prestige",
    legmethode: "Gelijmd",
    hoofdcategorie: "Vloeren",
    subcategorie: "PVC",
    legpatroon: "Hongaarse punt; Patroon; Weense punt",
    typeVloerverwarming: "Gebonden; Gefreesd; Noppen platen",
    geintegreerdeOndervloer: "Nee",
    pakgrootte: 2.18,
    snijverlies: 10
  },
  {
    id: "18",
    name: "Prestige Arrow hongaarse punt lijm pvc oak 718x152x2,5mm 0,55",
    code: "5-xcx-pr-131610",
    configuratorName: "VOORBEREIDEN-10611",
    image: "https://images.unsplash.com/photo-1761053130711-2515ef532bb5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZXJyaW5nYm9uZSUyMHdvb2QlMjBmbG9vcnxlbnwxfHx8fDE3NjE1NzU2NDB8MA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "PVC",
    brand: "Prestige",
    legmethode: "Gelijmd",
    hoofdcategorie: "Vloeren",
    subcategorie: "PVC",
    legpatroon: "Hongaarse punt; Weense punt",
    typeVloerverwarming: "Gebonden; Gefreesd; Noppen platen",
    geintegreerdeOndervloer: "Nee",
    pakgrootte: 2.18,
    snijverlies: 10
  },

  // Hout Producten
  {
    id: "19",
    name: "Quercus Actum XXL Eiken Rustiek Pure Geolied 2200x220x14/3",
    code: "XCXO881022",
    configuratorName: "VOORBEREIDEN-10612",
    image: "https://images.unsplash.com/photo-1711915442858-2a5bb7ba67d8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvYWslMjBwYXJxdWV0JTIwZmxvb3Jpbmd8ZW58MXx8fHwxNzYxNTc1NjQwfDA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Hout",
    brand: "Quercus",
    legmethode: "Gelijmd",
    hoofdcategorie: "Vloeren",
    subcategorie: "Hout",
    legpatroon: "Rechte stroken",
    typeVloerverwarming: "Gebonden; Gefreesd; Noppen platen",
    geintegreerdeOndervloer: "Nee",
    pakgrootte: 2.18,
    snijverlies: 15,
    aanbevolen: true
  },
  {
    id: "20",
    name: "Dakota rustic AB 12/4/260 Verouderd/Dark (Afgewerkt met 2K olie van Royal) 2x behandeld, mogelijk 10% kortere planken",
    code: "DHF-124260-08",
    configuratorName: "VOORBEREIDEN-10613",
    image: "https://images.unsplash.com/photo-1686887907058-aad594d4ce01?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXJkd29vZCUyMGZsb29yJTIwbmF0dXJhbHxlbnwxfHx8fDE3NjE1NzU2NDJ8MA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Hout",
    brand: "Dakota",
    legmethode: "Gelijmd",
    hoofdcategorie: "Vloeren",
    subcategorie: "Hout",
    legpatroon: "Rechte stroken",
    typeVloerverwarming: "Gebonden; Gefreesd; Noppen platen",
    geintegreerdeOndervloer: "Nee",
    pakgrootte: 2.18,
    snijverlies: 15
  },
  {
    id: "21",
    name: "Dakota rustic AB 12/4/260 Woodlook (Afgewerkt met Hardwax Ciranova) 3x behandeld, mogelijk 10% kortere planken",
    code: "DHF-124260-04",
    configuratorName: "VOORBEREIDEN-10614",
    image: "https://images.unsplash.com/photo-1686887907058-aad594d4ce01?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXJkd29vZCUyMGZsb29yJTIwbmF0dXJhbHxlbnwxfHx8fDE3NjE1NzU2NDJ8MA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Hout",
    brand: "Dakota",
    legmethode: "Gelijmd",
    hoofdcategorie: "Vloeren",
    subcategorie: "Hout",
    legpatroon: "Rechte stroken",
    typeVloerverwarming: "Gebonden; Gefreesd; Noppen platen",
    geintegreerdeOndervloer: "Nee",
    pakgrootte: 2.18,
    snijverlies: 15
  },
  {
    id: "22",
    name: "Dakota rustic AB 9/3/180 Gerookt/grijs (Afgewerkt met 2K olie van Royal) 2x behandeld, mogelijk 10% kortere planken",
    code: "DHF-093180-03",
    configuratorName: "VOORBEREIDEN-10615",
    image: "https://images.unsplash.com/photo-1686887907058-aad594d4ce01?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXJkd29vZCUyMGZsb29yJTIwbmF0dXJhbHxlbnwxfHx8fDE3NjE1NzU2NDJ8MA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Hout",
    brand: "Dakota",
    legmethode: "Gelijmd",
    hoofdcategorie: "Vloeren",
    subcategorie: "Hout",
    legpatroon: "Rechte stroken",
    typeVloerverwarming: "Gebonden; Gefreesd; Noppen platen",
    geintegreerdeOndervloer: "Nee",
    pakgrootte: 2.18,
    snijverlies: 20
  },
  {
    id: "23",
    name: "Nordland Grimsbu Eiken Visgraat Ceram Rustiek Blank Geolied 4V 750x150mm",
    code: "5096750219",
    configuratorName: "VOORBEREIDEN-10616",
    image: "https://images.unsplash.com/photo-1761053130711-2515ef532bb5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZXJyaW5nYm9uZSUyMHdvb2QlMjBmbG9vcnxlbnwxfHx8fDE3NjE1NzU2NDB8MA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Hout",
    brand: "Nordland",
    legmethode: "Gelijmd",
    hoofdcategorie: "Vloeren",
    subcategorie: "Hout",
    legpatroon: "Visgraat",
    typeVloerverwarming: "Gebonden; Gefreesd; Noppen platen",
    geintegreerdeOndervloer: "Nee",
    pakgrootte: 2.18,
    snijverlies: 20,
    aanbevolen: true
  },
  {
    id: "24",
    name: "Nordland Grimsbu Eiken Visgraat Borneo Rustiek Naturel Geolied 4V 750x150mm",
    code: "5096750419",
    configuratorName: "VOORBEREIDEN-10617",
    image: "https://images.unsplash.com/photo-1761053130711-2515ef532bb5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZXJyaW5nYm9uZSUyMHdvb2QlMjBmbG9vcnxlbnwxfHx8fDE3NjE1NzU2NDB8MA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Hout",
    brand: "Nordland",
    legmethode: "Gelijmd",
    hoofdcategorie: "Vloeren",
    subcategorie: "Hout",
    legpatroon: "Visgraat",
    typeVloerverwarming: "Gebonden; Gefreesd; Noppen platen",
    geintegreerdeOndervloer: "Nee",
    pakgrootte: 2.18,
    snijverlies: 10
  },

  // Laminaat Producten
  {
    id: "25",
    name: "Poseidon Laminaat Rydal Aqua 24HRS 1292x246x8mm 4V",
    code: "44100907",
    configuratorName: "VOORBEREIDEN-10618",
    image: "https://images.unsplash.com/photo-1693948568453-a3564f179a84?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYW1pbmF0ZSUyMGZsb29yJTIwcGxhbmtzfGVufDF8fHx8MTc2MTU3NTY0MHww&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Laminaat",
    brand: "Poseidon",
    legmethode: "Zwevend",
    hoofdcategorie: "Vloeren",
    subcategorie: "Laminaat",
    legpatroon: "Rechte stroken",
    typeVloerverwarming: "Gebonden; Gefreesd; Noppen platen",
    geintegreerdeOndervloer: "Nee",
    pakgrootte: 2.18,
    snijverlies: 10,
    aanbevolen: true
  },
  {
    id: "26",
    name: "Poseidon Laminaat Epping Aqua 24HRS 1292x246x8mm 4V",
    code: "44100709",
    image: "https://images.unsplash.com/photo-1693948568453-a3564f179a84?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYW1pbmF0ZSUyMGZsb29yJTIwcGxhbmtzfGVufDF8fHx8MTc2MTU3NTY0MHww&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Laminaat",
    brand: "Poseidon",
    legmethode: "Zwevend",
    hoofdcategorie: "Vloeren",
    subcategorie: "Laminaat",
    legpatroon: "Rechte stroken",
    typeVloerverwarming: "Gebonden; Gefreesd; Noppen platen",
    geintegreerdeOndervloer: "Nee",
    pakgrootte: 2.18,
    snijverlies: 10
  },
  {
    id: "27",
    name: "Portwood Laminaat Olympia Oak 1292x193x7mm 4V",
    code: "XCX-410388",
    image: "https://images.unsplash.com/photo-1693948568453-a3564f179a84?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYW1pbmF0ZSUyMGZsb29yJTIwcGxhbmtzfGVufDF8fHx8MTc2MTU3NTY0MHww&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Laminaat",
    brand: "Portwood",
    legmethode: "Zwevend",
    hoofdcategorie: "Vloeren",
    subcategorie: "Laminaat",
    legpatroon: "Rechte stroken",
    typeVloerverwarming: "Gebonden; Gefreesd; Noppen platen",
    geintegreerdeOndervloer: "Nee",
    pakgrootte: 2.18,
    snijverlies: 10,
    aanbevolen: true
  },
  {
    id: "28",
    name: "Portwood Laminaat Madison Oak 1292x193x7mm 4V",
    code: "XCX-428338",
    image: "https://images.unsplash.com/photo-1693948568453-a3564f179a84?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYW1pbmF0ZSUyMGZsb29yJTIwcGxhbmtzfGVufDF8fHx8MTc2MTU3NTY0MHww&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Laminaat",
    brand: "Portwood",
    legmethode: "Zwevend",
    hoofdcategorie: "Vloeren",
    subcategorie: "Laminaat",
    legpatroon: "Rechte stroken",
    typeVloerverwarming: "Gebonden; Gefreesd; Noppen platen",
    geintegreerdeOndervloer: "Nee",
    pakgrootte: 2.18,
    snijverlies: 10
  },

  // Producten met legmethode "Keuze" en subcategorie "Hout"
  {
    id: "29",
    name: "Premium Eiken Parket Naturel 1820x150x15mm",
    code: "HOUT-K-001",
    image: "https://images.unsplash.com/photo-1611759754996-939736cccdd4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjB2aW55bCUyMGZsb29yaW5nfGVufDF8fHx8MTc2MTU3NTY0MHww&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Parket",
    brand: "Premium Floors",
    legmethode: "Keuze",
    hoofdcategorie: "Vloeren",
    subcategorie: "Hout",
    legpatroon: "Rechte stroken",
    typeVloerverwarming: "Gebonden; Gefreesd",
    geintegreerdeOndervloer: "Nee",
    pakgrootte: 2.18,
    snijverlies: 10,
    aanbevolen: true
  },
  {
    id: "30",
    name: "Massief Eiken Parket Gerookt 1500x180x14mm",
    code: "HOUT-K-002",
    image: "https://images.unsplash.com/photo-1611759754996-939736cccdd4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjB2aW55bCUyMGZsb29yaW5nfGVufDF8fHx8MTc2MTU3NTY0MHww&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Parket",
    brand: "Massief Hout",
    legmethode: "Keuze",
    hoofdcategorie: "Vloeren",
    subcategorie: "Hout",
    legpatroon: "Rechte stroken",
    typeVloerverwarming: "Gebonden; Gefreesd; Noppen platen",
    geintegreerdeOndervloer: "Nee",
    pakgrootte: 2.18,
    snijverlies: 10
  },
  {
    id: "31",
    name: "Notenhouten Parket Visgraat 600x120x12mm",
    code: "HOUT-K-003",
    image: "https://images.unsplash.com/photo-1761053130711-2515ef532bb5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZXJyaW5nYm9uZSUyMHdvb2QlMjBmbG9vcnxlbnwxfHx8fDE3NjE1NzU2NDB8MA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Parket",
    brand: "Premium Floors",
    legmethode: "Keuze",
    hoofdcategorie: "Vloeren",
    subcategorie: "Hout",
    legpatroon: "Visgraat",
    typeVloerverwarming: "Gebonden; Gefreesd",
    geintegreerdeOndervloer: "Nee",
    pakgrootte: 2.18,
    snijverlies: 10
  },
  {
    id: "32",
    name: "Esdoorn Parket Licht 1200x140x13mm",
    code: "HOUT-K-004",
    image: "https://images.unsplash.com/photo-1611759754996-939736cccdd4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjB2aW55bCUyMGZsb29yaW5nfGVufDF8fHx8MTc2MTU3NTY0MHww&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Parket",
    brand: "Massief Hout",
    legmethode: "Keuze",
    hoofdcategorie: "Vloeren",
    subcategorie: "Hout",
    legpatroon: "Rechte stroken",
    typeVloerverwarming: "Gebonden; Gefreesd; Noppen platen",
    geintegreerdeOndervloer: "Nee",
    pakgrootte: 2.18,
    snijverlies: 10
  },
  
  // Optioneel Voorbereiden Product
  {
    id: "33",
    name: "Voorbereiden Karakteristieke Tegels LAB21",
    code: "PREP-LAB21-10605",
    configuratorName: "VOORBEREIDEN-10605",
    extraConfigurator: "Verwijderen",
    image: "https://images.unsplash.com/photo-1615971677499-5467cbab01c0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0aWxlJTIwZmxvb3J8ZW58MXx8fHwxNzYxNTc1NjQwfDA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "PVC",
    brand: "Diverse",
    legmethode: "Zwevend",
    hoofdcategorie: "Vloeren",
    subcategorie: "PVC; Laminaat; Hout",
    legpatroon: "Rechte stroken",
    typeVloerverwarming: "Gebonden; Gefreesd; Noppen platen",
    geintegreerdeOndervloer: "Nee",
    pakgrootte: 2.18,
    snijverlies: 10
  },

  // Jaloezieën producten (Raamdecoratie - Jaloezieën)
  {
    id: "100",
    name: "Aluminium Jaloezie 25mm - Wit",
    code: "JALOEZIE-ALU-25-WIT",
    configuratorName: "ZONWERING-JALOEZIE-001",
    image: "https://images.unsplash.com/photo-1615529162924-f8605388461d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aW5kb3clMjBibGluZHMlMjBhbHVtaW51bXxlbnwxfHx8fDE3NjE1NzU2NDB8MA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Jaloezieën",
    brand: "LAB21",
    hoofdcategorie: "Zonwering",
    subcategorie: "Jaloezieën",
    color: "Wit",
    eenheid: "M2",
    doelKlant: ["Sfeer", "Privacy", "Doorkijk mogelijk", "Hitte en UV bestendigheid"],
    eigenschappen: ["Uni"],
    aanbevolen: true
  },
  {
    id: "101",
    name: "Aluminium Jaloezie 25mm - Zilver",
    code: "JALOEZIE-ALU-25-ZILVER",
    configuratorName: "ZONWERING-JALOEZIE-002",
    image: "https://images.unsplash.com/photo-1615529162924-f8605388461d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aW5kb3clMjBibGluZHMlMjBhbHVtaW51bXxlbnwxfHx8fDE3NjE1NzU2NDB8MA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Jaloezieën",
    brand: "LAB21",
    hoofdcategorie: "Zonwering",
    subcategorie: "Jaloezieën",
    color: "Zilver",
    eenheid: "M2",
    doelKlant: ["Sfeer", "Privacy", "Doorkijk mogelijk"],
    eigenschappen: ["Uni"]
  },
  {
    id: "102",
    name: "Houten Jaloezie 50mm - Naturel Eiken",
    code: "JALOEZIE-HOUT-50-EIKEN",
    configuratorName: "ZONWERING-JALOEZIE-003",
    image: "https://images.unsplash.com/photo-1615529162924-f8605388461d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aW5kb3clMjBibGluZHMlMjBhbHVtaW51bXxlbnwxfHx8fDE3NjE1NzU2NDB8MA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Jaloezieën",
    brand: "LAB21",
    hoofdcategorie: "Zonwering",
    subcategorie: "Jaloezieën",
    color: "Naturel Eiken",
    eenheid: "M2",
    doelKlant: ["Sfeer", "Privacy", "Warmteislolatie", "Akoestiek"],
    eigenschappen: ["Patroon", "Isolerend"],
    aanbevolen: true
  },

  // Duettes producten (Raamdecoratie - Duettes)
  {
    id: "103",
    name: "Luxaflex Duette Shades Energie Besparing 25mm - Wit",
    code: "DUETTE-LS-25-WIT",
    configuratorName: "ZONWERING-DUETTE-001",
    image: "https://images.unsplash.com/photo-1601313333992-cc4e55a6db93?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aW5kb3clMjBibGluZHMlMjBkdWV0dGV8ZW58MXx8fHwxNzYxNTc1NjQwfDA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Duettes",
    brand: "Luxaflex",
    hoofdcategorie: "Zonwering",
    subcategorie: "Duettes",
    color: "Wit",
    eenheid: "M2",
    doelKlant: ["Warmteislolatie", "Hitte en UV bestendigheid", "Privacy", "Sfeer"],
    eigenschappen: ["Uni", "Isolerend", "Brandvertragend"],
    aanbevolen: true
  },
  {
    id: "104",
    name: "Luxaflex Duette Shades Lichtdoorlatend 32mm - Beige",
    code: "DUETTE-LD-32-BEIGE",
    configuratorName: "ZONWERING-DUETTE-002",
    image: "https://images.unsplash.com/photo-1601313333992-cc4e55a6db93?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aW5kb3clMjBibGluZHMlMjBkdWV0dGV8ZW58MXx8fHwxNzYxNTc1NjQwfDA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Duettes",
    brand: "Luxaflex",
    hoofdcategorie: "Zonwering",
    subcategorie: "Duettes",
    color: "Beige",
    eenheid: "M2",
    doelKlant: ["Warmteislolatie", "Sfeer", "Inkijk reguleren"],
    eigenschappen: ["Uni", "Isolerend"]
  },
  {
    id: "105",
    name: "Luxaflex Duette Shades Transparant 25mm - Grijs",
    code: "DUETTE-TR-25-GRIJS",
    configuratorName: "ZONWERING-DUETTE-003",
    image: "https://images.unsplash.com/photo-1601313333992-cc4e55a6db93?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aW5kb3clMjBibGluZHMlMjBkdWV0dGV8ZW58MXx8fHwxNzYxNTc1NjQwfDA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Duettes",
    brand: "Luxaflex",
    hoofdcategorie: "Zonwering",
    subcategorie: "Duettes",
    color: "Grijs",
    eenheid: "M2",
    doelKlant: ["Doorkijk mogelijk", "Sfeer", "Inkijk reguleren"],
    eigenschappen: ["Patroon"]
  },

  // Rolgordijnen producten (Raamdecoratie - Rolgordijnen)
  {
    id: "106",
    name: "Rolgordijn Screen 5% - Wit",
    code: "ROLGORDIJN-SCREEN-5-WIT",
    configuratorName: "ZONWERING-ROLGORDIJN-001",
    image: "https://images.unsplash.com/photo-1594643781845-80abe7449863?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyb2xsZXIlMjBibGluZHN8ZW58MXx8fHwxNzYxNTc1NjQwfDA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Rolgordijnen",
    brand: "LAB21",
    hoofdcategorie: "Zonwering",
    subcategorie: "Rolgordijnen",
    color: "Wit",
    eenheid: "M2",
    doelKlant: ["Doorkijk mogelijk", "Hitte en UV bestendigheid", "Inkijk reguleren"],
    eigenschappen: ["Patroon", "Brandvertragend"],
    aanbevolen: true
  },
  {
    id: "107",
    name: "Rolgordijn Verduisterend - Antraciet",
    code: "ROLGORDIJN-VD-ANTRACIET",
    configuratorName: "ZONWERING-ROLGORDIJN-002",
    image: "https://images.unsplash.com/photo-1594643781845-80abe7449863?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyb2xsZXIlMjBibGluZHN8ZW58MXx8fHwxNzYxNTc1NjQwfDA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Rolgordijnen",
    brand: "LAB21",
    hoofdcategorie: "Zonwering",
    subcategorie: "Rolgordijnen",
    color: "Antraciet",
    eenheid: "M2",
    doelKlant: ["100% Verduistering", "Privacy", "Hitte en UV bestendigheid"],
    eigenschappen: ["Uni", "Brandvertragend"]
  },
  {
    id: "108",
    name: "Rolgordijn Screen 10% - Beige",
    code: "ROLGORDIJN-SCREEN-10-BEIGE",
    configuratorName: "ZONWERING-ROLGORDIJN-003",
    image: "https://images.unsplash.com/photo-1594643781845-80abe7449863?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyb2xsZXIlMjBibGluZHN8ZW58MXx8fHwxNzYxNTc1NjQwfDA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Rolgordijnen",
    brand: "LAB21",
    hoofdcategorie: "Zonwering",
    subcategorie: "Rolgordijnen",
    color: "Beige",
    eenheid: "M2",
    doelKlant: ["Doorkijk mogelijk", "Sfeer", "Inkijk reguleren"],
    eigenschappen: ["Patroon"]
  }
];

export function ProductArticleSelection({ 
  onBack, 
  onProceed, 
  onClose, 
  onOpenProductDetail,
  language,
  isModal = false,
  currentConfigurator = "Vloer" // Default to Vloer
}: ProductArticleSelectionProps) {
  const t = useTranslation(language);
  
  // Helper function to translate product property values
  const translateValue = (category: keyof typeof t.productValues, value: string): string => {
    return t.productValues[category]?.[value] || value;
  };

  // Map configurator to hoofdcategorie to filter products
  const getHoofdcategorieForConfigurator = (configurator: string): string | null => {
    const mapping: { [key: string]: string } = {
      "Vloer": "Vloeren",
      "Raamdecoratie": "Zonwering"
    };
    return mapping[configurator] || null;
  };

  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  // Removed selectedProduct state - no longer needed with direct selection
  
  // Filter states - no default selection
  const [filters, setFilters] = useState({
    categories: [] as string[], // Start with no category selection
    brands: [] as string[],
    gebruikersklasse: [] as string[],
    geschiktVoorVloerverwarming: [] as string[],
    garantienorm: [] as string[],
    // Removed filters: collections, sizes, thicknesses, surfaces - can be re-added later
    colors: [] as string[],
    doelKlant: [] as string[], // Voor zonwering
    eigenschappen: [] as string[] // Voor zonwering
  });
  
  // Dynamically check if user has searched or filtered
  const hasFiltered = filters.categories.length > 0 || 
    filters.brands.length > 0 || 
    filters.gebruikersklasse.length > 0 || 
    filters.geschiktVoorVloerverwarming.length > 0 || 
    filters.garantienorm.length > 0 || 
    filters.colors.length > 0 ||
    filters.doelKlant.length > 0 ||
    filters.eigenschappen.length > 0;
  
  const hasSearchedOrFiltered = searchTerm.trim().length > 0 || hasFiltered;
  
  // Filter section collapsed states
  const [filterSections, setFilterSections] = useState({
    categories: true,
    brands: false, // Now collapsible like other sections
    gebruikersklasse: false,
    geschiktVoorVloerverwarming: false,
    garantienorm: false,
    // Removed filter sections: collections, sizes, thicknesses, surfaces - can be re-added later
    colors: false,
    doelKlant: false, // Voor zonwering
    eigenschappen: false // Voor zonwering
  });

  // State for installation method selection popup
  const [showInstallationMethodDialog, setShowInstallationMethodDialog] = useState(false);
  const [pendingProduct, setPendingProduct] = useState<Product | null>(null);

  // Get unique values for filter options
  const getUniqueValues = (key: keyof Product) => {
    const values = mockProducts.map(p => p[key]).filter(Boolean) as string[];
    return [...new Set(values)].sort();
  };

  const filteredProducts = mockProducts.filter(product => {
    // Filter by current configurator first
    const targetHoofdcategorie = getHoofdcategorieForConfigurator(currentConfigurator);
    const matchesConfigurator = !targetHoofdcategorie || 
                                 product.hoofdcategorie === targetHoofdcategorie;
    
    if (!matchesConfigurator) return false;

    // Search filter
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.code.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Category filter
    const matchesCategory = filters.categories.length === 0 || 
                           (product.category && filters.categories.includes(product.category));
    
    // Brand filter
    const matchesBrand = filters.brands.length === 0 || 
                        (product.brand && filters.brands.includes(product.brand));
    
    // Gebruikersklasse filter  
    const matchesGebruikersklasse = filters.gebruikersklasse.length === 0 || 
                                   (product.thickness && filters.gebruikersklasse.some(klasse => {
                                     // Map gebruikersklasse to thickness values
                                     const thicknessMapping: { [key: string]: string[] } = {
                                       '0,20mm (licht gebruik)': ['0.2mm', '0,2mm', '2mm'],
                                       '0,30mm (gemiddeld gebruik)': ['0.3mm', '0,3mm', '3mm'],  
                                       '0,55mm (intensief gebruik)': ['0.55mm', '0,55mm', '5.5mm'],
                                       '0,70mm (hotel/winkel/horeca)': ['0.7mm', '0,7mm', '7mm']
                                     };
                                     const allowedThicknesses = thicknessMapping[klasse] || [];
                                     return allowedThicknesses.includes(product.thickness);
                                   }));
    
    // Geschikt voor vloerverwarming filter
    const matchesGeschiktVoorVloerverwarming = filters.geschiktVoorVloerverwarming.length === 0 || 
                                               (product.typeVloerverwarming && filters.geschiktVoorVloerverwarming.some(geschiktheid => {
                                                 // Map geschiktheid to product typeVloerverwarming values
                                                 const vloerverwarmingMapping: { [key: string]: string[] } = {
                                                   'Heel erg geschikt': ['excellent', 'zeer geschikt', 'heel erg geschikt'],
                                                   'Geschikt': ['good', 'geschikt', 'suitable'],
                                                   'Minder geschikt': ['limited', 'beperkt', 'minder geschikt']
                                                 };
                                                 const allowedTypes = vloerverwarmingMapping[geschiktheid] || [];
                                                 return allowedTypes.some(type => 
                                                   product.typeVloerverwarming.toLowerCase().includes(type.toLowerCase())
                                                 );
                                               }));
    
    // Garantienorm filter
    const matchesGarantienorm = filters.garantienorm.length === 0 || 
                               (product.thickness && filters.garantienorm.some(garantie => {
                                 // Map garantienorm to product properties (using thickness as proxy for warranty)
                                 const garantieMapping: { [key: string]: string[] } = {
                                   '< 10 jaar': ['0.2mm', '0,2mm', '2mm'],
                                   '10-15 jaar': ['0.3mm', '0,3mm', '3mm'],
                                   '15-20 jaar': ['0.55mm', '0,55mm', '5.5mm'],
                                   '25 jaar': ['0.7mm', '0,7mm', '7mm']
                                 };
                                 const allowedThicknesses = garantieMapping[garantie] || [];
                                 return allowedThicknesses.includes(product.thickness);
                               }));
    
    // Removed filters: collection, size, surface - can be re-added later
    
    // Color filter
    const matchesColor = filters.colors.length === 0 || 
                        (product.color && filters.colors.includes(product.color));
    
    // Doel klant filter (voor zonwering) - product moet alle geselecteerde doelen hebben
    const matchesDoelKlant = filters.doelKlant.length === 0 || 
                            (product.doelKlant && filters.doelKlant.every(doel => 
                              product.doelKlant!.includes(doel)
                            ));
    
    // Eigenschappen filter (voor zonwering) - product moet alle geselecteerde eigenschappen hebben
    const matchesEigenschappen = filters.eigenschappen.length === 0 || 
                                (product.eigenschappen && filters.eigenschappen.every(eigenschap => 
                                  product.eigenschappen!.includes(eigenschap)
                                ));
    
    return matchesSearch && matchesCategory && matchesBrand && matchesGebruikersklasse && matchesGeschiktVoorVloerverwarming && matchesGarantienorm && matchesColor && matchesDoelKlant && matchesEigenschappen;
  });

  const handleProductSelect = (product: Product) => {
    // Check if product has "Keuze" as installation method
    if (product.legmethode === "Keuze") {
      setPendingProduct(product);
      setShowInstallationMethodDialog(true);
    } else {
      onProceed(product);
    }
  };

  const handleInstallationMethodChoice = (method: "Gelijmd" | "Zwevend") => {
    if (pendingProduct) {
      // Update the product with the chosen installation method
      const updatedProduct = {
        ...pendingProduct,
        legmethode: method
      };
      setShowInstallationMethodDialog(false);
      setPendingProduct(null);
      onProceed(updatedProduct);
    }
  };

  const handleFilterChange = (filterType: keyof typeof filters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: prev[filterType].includes(value)
        ? prev[filterType].filter(item => item !== value)
        : [...prev[filterType], value]
    }));
  };

  const handleSearch = () => {
    setSearchTerm(searchInput);
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearFilters = () => {
    setFilters({
      categories: [],
      brands: [],
      gebruikersklasse: [],
      geschiktVoorVloerverwarming: [],
      garantienorm: [],
      // Removed filters: collections, sizes, thicknesses, surfaces - can be re-added later
      colors: []
    });
  };

  const clearSearch = () => {
    setSearchInput("");
    setSearchTerm("");
  };

  const clearAll = () => {
    clearFilters();
    clearSearch();
  };

  const toggleFilterSection = (section: keyof typeof filterSections) => {
    setFilterSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div className={isModal ? "h-full bg-white rounded-xl overflow-hidden" : "min-h-screen bg-gray-100"}>
      <div className={isModal ? "h-full flex flex-col" : "max-w-6xl mx-auto bg-white shadow-lg min-h-screen"}>
        {/* Header */}
        <div className={`bg-[#2d4724] text-white p-4 flex justify-between items-center flex-shrink-0 ${isModal ? 'rounded-t-xl' : ''}`}>
          <h1 className="text-xl">Configurator</h1>

        </div>

        {/* Content */}
        <div className={`${isModal ? 'flex-1 flex' : 'flex'}`} style={isModal ? {height: 'calc(100% - 72px)'} : {}}>
          {/* Filter Sidebar */}
          <div className={`w-60 bg-gray-50 border-r border-gray-200 flex-shrink-0 flex flex-col ${isModal ? '' : 'min-h-[600px]'}`}>
            <div className="flex justify-between items-center p-3 pb-2">
              <h3 className="font-medium">
                {language === 'en' ? 'Filters' : 'Filters'}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-xs text-gray-600 hover:text-gray-800"
              >
                {language === 'en' ? 'Clear' : 'Wis'}
              </Button>
            </div>

            {/* Product Counter */}
            <div className="px-3 pb-2">
              <p className="text-xs text-gray-600">
                {language === 'en' ? 'Total records' : 'Totaal aantal records'}: {hasSearchedOrFiltered ? filteredProducts.length : mockProducts.length}
              </p>
            </div>

            <ScrollArea className="flex-1 px-3" style={isModal ? {height: 'calc(100% - 60px)'} : {}}>
              <div className="space-y-2">
              {/* Category Filter */}
              <Collapsible open={filterSections.categories} onOpenChange={() => toggleFilterSection('categories')}>
                <CollapsibleTrigger className="flex items-center justify-between w-full p-2 text-left hover:bg-gray-100 rounded text-sm">
                  <span>{language === 'en' ? 'Subcategory' : 'Subcategorie'}</span>
                  {filterSections.categories ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </CollapsibleTrigger>
                <CollapsibleContent className="pl-4 space-y-1">
                  {(() => {
                    // Define categories based on current configurator
                    const mainCategories = currentConfigurator === "Raamdecoratie" ? [
                      {
                        key: 'jaloezieen',
                        nl: 'Jaloezieën',
                        en: 'Venetian Blinds',
                        matchCategories: ['Jaloezieën']
                      },
                      {
                        key: 'duettes',
                        nl: 'Duettes',
                        en: 'Duettes',
                        matchCategories: ['Duettes']
                      },
                      {
                        key: 'rolgordijnen',
                        nl: 'Rolgordijnen',
                        en: 'Roller Blinds',
                        matchCategories: ['Rolgordijnen']
                      }
                    ] : [
                      {
                        key: 'pvc-vloer',
                        nl: 'PVC vloer',
                        en: 'PVC flooring',
                        matchCategories: ['PVC', 'Vinyl', 'LVT']
                      },
                      {
                        key: 'laminaat', 
                        nl: 'Laminaat',
                        en: 'Laminate',
                        matchCategories: ['Laminaat', 'Laminate']
                      },
                      {
                        key: 'houten-vloer',
                        nl: 'Houten vloer', 
                        en: 'Wooden flooring',
                        matchCategories: ['Parket', 'Massief Hout', 'Engineered Wood', 'Hardwood']
                      }
                    ];

                    return mainCategories.map(category => {
                      const isSelected = filters.categories.some(selectedCat => 
                        category.matchCategories.includes(selectedCat)
                      );
                      
                      return (
                        <label key={category.key} className="flex items-center space-x-2 text-sm cursor-pointer">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => {
                              // Toggle all matching categories
                              const currentlySelected = filters.categories.filter(cat => 
                                category.matchCategories.includes(cat)
                              );
                              
                              if (currentlySelected.length > 0) {
                                // Remove all matching categories
                                setFilters(prev => ({
                                  ...prev,
                                  categories: prev.categories.filter(cat => 
                                    !category.matchCategories.includes(cat)
                                  )
                                }));
                              } else {
                                // Add all available matching categories
                                const availableCategories = getUniqueValues('category').filter(cat =>
                                  category.matchCategories.includes(cat)
                                );
                                setFilters(prev => ({
                                  ...prev,
                                  categories: [...prev.categories, ...availableCategories]
                                }));
                              }
                            }}
                          />
                          <span className={isSelected ? 'text-[#2d4724] font-medium' : ''}>
                            {language === 'en' ? category.en : category.nl}
                          </span>
                        </label>
                      );
                    });
                  })()}
                </CollapsibleContent>
              </Collapsible>

              {/* Brand Filter */}
              <Collapsible open={filterSections.brands} onOpenChange={() => toggleFilterSection('brands')}>
                <CollapsibleTrigger className="flex items-center justify-between w-full p-2 text-left hover:bg-gray-100 rounded text-sm">
                  <span>{language === 'en' ? 'Brand' : 'Merk'}</span>
                  {filterSections.brands ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </CollapsibleTrigger>
                <CollapsibleContent className="pl-4 space-y-1">
                  {getUniqueValues('brand').map(brand => (
                    <label key={brand} className="flex items-center space-x-2 text-sm cursor-pointer">
                      <Checkbox
                        checked={filters.brands.includes(brand)}
                        onCheckedChange={() => handleFilterChange('brands', brand)}
                      />
                      <span>{brand}</span>
                    </label>
                  ))}
                </CollapsibleContent>
              </Collapsible>

              {/* Gebruikersklasse Filter - only for non-Raamdecoratie */}
              {currentConfigurator !== "Raamdecoratie" && (
              <Collapsible open={filterSections.gebruikersklasse} onOpenChange={() => toggleFilterSection('gebruikersklasse')}>
                <CollapsibleTrigger className="flex items-center justify-between w-full p-2 text-left hover:bg-gray-100 rounded text-sm">
                  <span>{language === 'en' ? 'Usage Class' : 'Gebruikersklasse'}</span>
                  {filterSections.gebruikersklasse ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </CollapsibleTrigger>
                <CollapsibleContent className="pl-4 space-y-1">
                  {(() => {
                    // Define the usage classes with translations
                    const gebruikersklasses = [
                      {
                        key: '0,20mm (licht gebruik)',
                        nl: '0,20mm (licht gebruik)',
                        en: '0.20mm (light use)'
                      },
                      {
                        key: '0,30mm (gemiddeld gebruik)',
                        nl: '0,30mm (gemiddeld gebruik)',
                        en: '0.30mm (medium use)'
                      },
                      {
                        key: '0,55mm (intensief gebruik)',
                        nl: '0,55mm (intensief gebruik)',
                        en: '0.55mm (intensive use)'
                      },
                      {
                        key: '0,70mm (hotel/winkel/horeca)',
                        nl: '0,70mm (hotel/winkel/horeca)',
                        en: '0.70mm (hotel/shop/horeca)'
                      }
                    ];

                    return gebruikersklasses.map(klasse => (
                      <label key={klasse.key} className="flex items-center space-x-2 text-sm cursor-pointer">
                        <Checkbox
                          checked={filters.gebruikersklasse.includes(klasse.key)}
                          onCheckedChange={() => handleFilterChange('gebruikersklasse', klasse.key)}
                        />
                        <span>{language === 'en' ? klasse.en : klasse.nl}</span>
                      </label>
                    ));
                  })()}
                </CollapsibleContent>
              </Collapsible>
              )}

              {/* Geschikt voor vloerverwarming Filter - only for non-Raamdecoratie */}
              {currentConfigurator !== "Raamdecoratie" && (
              <Collapsible open={filterSections.geschiktVoorVloerverwarming} onOpenChange={() => toggleFilterSection('geschiktVoorVloerverwarming')}>
                <CollapsibleTrigger className="flex items-center justify-between w-full p-2 text-left hover:bg-gray-100 rounded text-sm">
                  <span>{language === 'en' ? 'Suitable for Underfloor Heating' : 'Geschikt voor vloerverwarming'}</span>
                  {filterSections.geschiktVoorVloerverwarming ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </CollapsibleTrigger>
                <CollapsibleContent className="pl-4 space-y-1">
                  {(() => {
                    // Define the underfloor heating suitability options with translations
                    const vloerverwarmingOpties = [
                      {
                        key: 'Heel erg geschikt',
                        nl: 'Heel erg geschikt',
                        en: 'Very suitable'
                      },
                      {
                        key: 'Geschikt',
                        nl: 'Geschikt',
                        en: 'Suitable'
                      },
                      {
                        key: 'Minder geschikt',
                        nl: 'Minder geschikt',
                        en: 'Less suitable'
                      }
                    ];

                    return vloerverwarmingOpties.map(optie => (
                      <label key={optie.key} className="flex items-center space-x-2 text-sm cursor-pointer">
                        <Checkbox
                          checked={filters.geschiktVoorVloerverwarming.includes(optie.key)}
                          onCheckedChange={() => handleFilterChange('geschiktVoorVloerverwarming', optie.key)}
                        />
                        <span>{language === 'en' ? optie.en : optie.nl}</span>
                      </label>
                    ));
                  })()}
                </CollapsibleContent>
              </Collapsible>
              )}

              {/* Garantie-norm Filter */}
              <Collapsible open={filterSections.garantienorm} onOpenChange={() => toggleFilterSection('garantienorm')}>
                <CollapsibleTrigger className="flex items-center justify-between w-full p-2 text-left hover:bg-gray-100 rounded text-sm">
                  <span>{language === 'en' ? 'Warranty Standard' : 'Garantie-norm'}</span>
                  {filterSections.garantienorm ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </CollapsibleTrigger>
                <CollapsibleContent className="pl-4 space-y-1">
                  {(() => {
                    // Define the warranty standards with translations
                    const garantienormen = [
                      {
                        key: '< 10 jaar',
                        nl: '< 10 jaar',
                        en: '< 10 years'
                      },
                      {
                        key: '10-15 jaar',
                        nl: '10-15 jaar',
                        en: '10-15 years'
                      },
                      {
                        key: '15-20 jaar',
                        nl: '15-20 jaar',
                        en: '15-20 years'
                      },
                      {
                        key: '25 jaar',
                        nl: '25 jaar',
                        en: '25 years'
                      }
                    ];

                    return garantienormen.map(norm => (
                      <label key={norm.key} className="flex items-center space-x-2 text-sm cursor-pointer">
                        <Checkbox
                          checked={filters.garantienorm.includes(norm.key)}
                          onCheckedChange={() => handleFilterChange('garantienorm', norm.key)}
                        />
                        <span>{language === 'en' ? norm.en : norm.nl}</span>
                      </label>
                    ));
                  })()}
                </CollapsibleContent>
              </Collapsible>

              {/* Removed filters: Collection, Size, Thickness, Surface - can be re-added later */}

              {/* Color Filter */}
              <Collapsible open={filterSections.colors} onOpenChange={() => toggleFilterSection('colors')}>
                <CollapsibleTrigger className="flex items-center justify-between w-full p-2 text-left hover:bg-gray-100 rounded text-sm">
                  <span>{language === 'en' ? 'Color' : 'Kleur'}</span>
                  {filterSections.colors ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </CollapsibleTrigger>
                <CollapsibleContent className="pl-4 space-y-1">
                  {getUniqueValues('color').map(color => (
                    <label key={color} className="flex items-center space-x-2 text-sm cursor-pointer">
                      <Checkbox
                        checked={filters.colors.includes(color)}
                        onCheckedChange={() => handleFilterChange('colors', color)}
                      />
                      <span>{color}</span>
                    </label>
                  ))}
                </CollapsibleContent>
              </Collapsible>

              {/* Doel klant Filter - only for Raamdecoratie */}
              {currentConfigurator === "Raamdecoratie" && (
                <Collapsible open={filterSections.doelKlant} onOpenChange={() => toggleFilterSection('doelKlant')}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-2 text-left hover:bg-gray-100 rounded text-sm">
                    <span>{language === 'en' ? 'Customer Goal' : 'Doel klant'}</span>
                    {filterSections.doelKlant ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pl-4 space-y-1">
                    {(() => {
                      const doelKlantOptions = [
                        { key: 'Sfeer', nl: 'Sfeer', en: 'Ambiance' },
                        { key: 'Privacy', nl: 'Privacy', en: 'Privacy' },
                        { key: 'Doorkijk mogelijk', nl: 'Doorkijk mogelijk', en: 'See-through' },
                        { key: 'Hitte en UV bestendigheid', nl: 'Hitte en UV bestendigheid', en: 'Heat and UV resistance' },
                        { key: '100% Verduistering', nl: '100% Verduistering', en: '100% Blackout' },
                        { key: 'Akoestiek', nl: 'Akoestiek', en: 'Acoustics' },
                        { key: 'Warmteislolatie', nl: 'Warmteislolatie', en: 'Thermal insulation' },
                        { key: 'Inkijk reguleren', nl: 'Inkijk reguleren', en: 'Control visibility' }
                      ];

                      return doelKlantOptions.map(doel => (
                        <label key={doel.key} className="flex items-center space-x-2 text-sm cursor-pointer">
                          <Checkbox
                            checked={filters.doelKlant.includes(doel.key)}
                            onCheckedChange={() => handleFilterChange('doelKlant', doel.key)}
                          />
                          <span>{language === 'en' ? doel.en : doel.nl}</span>
                        </label>
                      ));
                    })()}
                  </CollapsibleContent>
                </Collapsible>
              )}

              {/* Eigenschappen Filter - only for Raamdecoratie */}
              {currentConfigurator === "Raamdecoratie" && (
                <Collapsible open={filterSections.eigenschappen} onOpenChange={() => toggleFilterSection('eigenschappen')}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-2 text-left hover:bg-gray-100 rounded text-sm">
                    <span>{language === 'en' ? 'Properties' : 'Eigenschappen'}</span>
                    {filterSections.eigenschappen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pl-4 space-y-1">
                    {(() => {
                      const eigenschappenOptions = [
                        { key: 'Brandvertragend', nl: 'Brandvertragend', en: 'Fire retardant' },
                        { key: 'Isolerend', nl: 'Isolerend', en: 'Insulating' },
                        { key: 'Patroon', nl: 'Patroon', en: 'Pattern' },
                        { key: 'Uni', nl: 'Uni', en: 'Solid' }
                      ];

                      return eigenschappenOptions.map(eigenschap => (
                        <label key={eigenschap.key} className="flex items-center space-x-2 text-sm cursor-pointer">
                          <Checkbox
                            checked={filters.eigenschappen.includes(eigenschap.key)}
                            onCheckedChange={() => handleFilterChange('eigenschappen', eigenschap.key)}
                          />
                          <span>{language === 'en' ? eigenschap.en : eigenschap.nl}</span>
                        </label>
                      ));
                    })()}
                  </CollapsibleContent>
                </Collapsible>
              )}
              </div>
            </ScrollArea>
          </div>

          {/* Main Content */}
          <div className={`flex-1 flex flex-col ${isModal ? '' : ''}`}>
            {/* Top Section */}
            <div className="flex justify-between items-center p-6 pb-4 flex-shrink-0">
              <Button
                onClick={onBack}
                className="bg-[#2d4724] hover:bg-[#1f3319] text-white px-8 py-2"
              >
                {t.productArticleSelection.back}
              </Button>
              
              <h2 className="text-base font-normal">{t.productArticleSelection.selectOneProduct}</h2>
              
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  placeholder={hasFiltered 
                    ? (language === 'en' ? 'Search in results...' : 'Zoek in resultaten...')
                    : t.productArticleSelection.searchPlaceholder
                  }
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyPress={handleSearchKeyPress}
                  className="w-48 h-9"
                />
                <Button
                  onClick={handleSearch}
                  className="bg-[#2d4724] hover:bg-[#1f3319] text-white h-9 px-4"
                >
                  <Search className="h-4 w-4" />
                </Button>
                {hasSearchedOrFiltered && (
                  <Button
                    onClick={clearAll}
                    variant="outline"
                    className="h-9 px-3 text-sm"
                  >
                    {language === 'en' ? 'Clear All' : 'Wis Alles'}
                  </Button>
                )}
              </div>
            </div>

            {/* Results count - only show when user has searched or filtered */}
            {hasSearchedOrFiltered && (
              <div className="px-6 pb-4 text-sm text-gray-600 flex-shrink-0">
                {language === 'en' 
                  ? `${filteredProducts.length} products found`
                  : `${filteredProducts.length} producten gevonden`
                }
              </div>
            )}

            {/* Scrollable Product Table or Initial Message */}
            <div className="flex-1 px-6 pb-6" style={isModal ? {height: 'calc(100% - 120px)'} : {}}>
              <ScrollArea className="h-full" style={isModal ? {height: '100%'} : {}}>
                  <div className="border border-gray-300">
                    <table className="w-full">
                      <thead className="bg-gray-100 sticky top-0">
                        <tr>
                          <th className="w-40 p-3 text-left border-r border-gray-300 text-sm font-normal">{t.productArticleSelection.productImage}</th>
                          <th className="p-3 text-left border-r border-gray-300 text-sm font-normal">{t.productArticleSelection.productName}</th>
                          <th className="w-36 p-3 text-left border-r border-gray-300 text-sm font-normal">{t.productArticleSelection.productCode}</th>
                          <th className="w-32 p-3 text-left text-sm font-normal"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProducts.map((product, index) => (
                          <tr 
                            key={product.id}
                            className="border-t border-gray-300 hover:bg-gray-50"
                            style={{ minHeight: '120px' }}
                          >
                            <td className="p-3 border-r border-gray-300 align-top">
                              {product.image ? (
                                <img 
                                  src={product.image}
                                  alt={`${product.code} - ${product.name}`}
                                  className="w-32 h-24 object-cover rounded"
                                />
                              ) : (
                                <div className="w-32 h-24 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
                                  No Image
                                </div>
                              )}
                            </td>
                            <td className="p-3 border-r border-gray-300 text-sm align-top">
                              <div className="space-y-2">
                                <div className="font-medium">{product.code} - {product.name}</div>
                                {(product.hoofdcategorie || product.subcategorie || product.legmethode || product.legpatroon || product.typeVloerverwarming || product.geintegreerdeOndervloer) && (
                                  <div className="text-xs text-gray-600">
                                    {[
                                      product.hoofdcategorie && `${t.roomConfigurator.mainCategory}: ${product.hoofdcategorie}`,
                                      product.subcategorie && `${t.roomConfigurator.subCategory}: ${translateValue('subcategorie', product.subcategorie)}`,
                                      product.legmethode && `${t.serviceSection.installationMethod}: ${translateValue('legmethode', product.legmethode)}`,
                                      product.legpatroon && `${t.serviceSection.pattern}: ${translateValue('legpatroon', product.legpatroon)}`,
                                      product.typeVloerverwarming && `${t.serviceSection.heatingType}: ${translateValue('typeVloerverwarming', product.typeVloerverwarming)}`,
                                      product.geintegreerdeOndervloer && `${t.serviceSection.integratedUnderfloor}: ${translateValue('geintegreerdeOndervloer', product.geintegreerdeOndervloer)}`,
                                      product.brand && `${t.serviceSection.brand}: ${product.brand}`
                                    ].filter(Boolean).join(' / ')}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="p-3 border-r border-gray-300 text-sm align-top">
                              {product.code}
                            </td>
                            <td className="p-3 text-sm align-top">
                              <Button
                                onClick={() => handleProductSelect(product)}
                                className="bg-[#2d4724] hover:bg-[#1f3319] text-white px-4 py-2 h-8 text-xs"
                              >
                                {language === 'en' ? 'Select' : 'Selecteer'}
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {filteredProducts.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      {language === 'en' ? 'No products found' : 'Geen producten gevonden'}
                    </div>
                  )}
                </ScrollArea>
            </div>
          </div>
        </div>
      </div>

      {/* Installation Method Selection Dialog */}
      <AlertDialog open={showInstallationMethodDialog} onOpenChange={setShowInstallationMethodDialog}>
        <AlertDialogContent>
          <AlertDialogHeader className="bg-[#2d4724] text-white -m-6 mb-4 p-6 rounded-t-lg">
            <AlertDialogTitle className="text-white">
              {language === 'en' ? 'Choose Installation' : 'Kies Installatie'}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-200">
              {language === 'en' 
                ? 'This product can be installed using either method. Please select your preferred installation method.'
                : 'Dit product kan op beide manieren geïnstalleerd worden. Kies de gewenste installatie.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex flex-col gap-3 py-4">
            <Button
              onClick={() => handleInstallationMethodChoice("Gelijmd")}
              variant="outline"
              className="w-full border-[#2d4724] text-[#2d4724] hover:bg-[#2d4724] hover:text-white h-12 text-base"
            >
              {language === 'en' ? 'Glued' : 'Gelijmd'}
            </Button>
            <Button
              onClick={() => handleInstallationMethodChoice("Zwevend")}
              variant="outline"
              className="w-full border-[#2d4724] text-[#2d4724] hover:bg-[#2d4724] hover:text-white h-12 text-base"
            >
              {language === 'en' ? 'Floating' : 'Zwevend'}
            </Button>
          </div>
          <AlertDialogFooter>
            <Button
              onClick={() => {
                setShowInstallationMethodDialog(false);
                setPendingProduct(null);
              }}
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              {language === 'en' ? 'Cancel' : 'Annuleren'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}