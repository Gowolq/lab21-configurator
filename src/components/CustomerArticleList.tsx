import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Trash2, Plus } from "lucide-react";
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
  legmethode?: string;
  hoofdcategorie?: string;
  subcategorie?: string;
  legpatroon?: string;
  typeVloerverwarming?: string;
  geintegreerdeOndervloer?: string;
  verdieping?: string;
  pakgrootte?: number;
  snijverlies?: number;
  eenheid?: string;
  omrekenfactor?: number;
}

interface Room {
  id: number;
  level: string;
  roomName: string;
  surface: string;
  oldSurface?: string;
  newSurface?: string;
  area: number;
  product?: string;
  selectedProduct?: Product;
  collapsed?: boolean;
  width?: number;
  height?: number;
}

interface CustomerArticleListProps {
  rooms: Room[];
  language: string;
  onUpdateArea: (roomId: number, area: number) => void;
  onDeleteArticle: (roomId: number) => void;
  onSelectProduct: (roomId: number) => void;
  onAddArticle: () => void;
}

export function CustomerArticleList({
  rooms,
  language,
  onUpdateArea,
  onDeleteArticle,
  onSelectProduct,
  onAddArticle,
}: CustomerArticleListProps) {
  const t = useTranslation(language);

  // Bereken totalen (incl. snijverlies → pakken → te leveren)
  let totalIngevoerd = 0;
  let totalInclSnijverlies = 0;
  let totalOmgerekend = 0;
  let totalPakken = 0;
  let totalTeLeveren = 0;

  rooms.forEach((room) => {
    if (!room.selectedProduct || !room.area || room.area <= 0) return;
    const snijverlies = room.selectedProduct.snijverlies || 0;
    const pakgrootte = room.selectedProduct.pakgrootte || 0;
    const omrekenfactor = (room.selectedProduct as any).omrekenfactor || 1;

    totalIngevoerd += room.area;
    const incl = room.area * (1 + snijverlies / 100);
    totalInclSnijverlies += incl;
    totalOmgerekend += incl / omrekenfactor;
    if (pakgrootte > 0) {
      const pakken = Math.ceil(incl / pakgrootte);
      totalPakken += pakken;
      totalTeLeveren += pakken * pakgrootte;
    }
  });

  const labels = {
    nl: {
      sectionTitle: "Artikelen",
      addArticle: "+ VOEG ARTIKEL TOE",
      selectProduct: "Selecteer product",
      product: "Product",
      entered: "Ingevoerd",
      unit: "Eenheid",
      cuttingWaste: "Snijverlies",
      inclCuttingWaste: "Incl. snijverlies",
      converted: "Omgerekend",
      packages: "Pakken",
      toDeliver: "Te leveren",
      total: "Totaal",
      noArticles: "Nog geen artikelen toegevoegd. Klik op 'Voeg artikel toe' om te beginnen.",
      delete: "Verwijderen",
      amount: "Aantal",
      enterAmount: "Vul aantal in",
    },
    en: {
      sectionTitle: "Articles",
      addArticle: "+ ADD ARTICLE",
      selectProduct: "Select product",
      product: "Product",
      entered: "Entered",
      unit: "Unit",
      cuttingWaste: "Cutting waste",
      inclCuttingWaste: "Incl. cutting waste",
      converted: "Converted",
      packages: "Packages",
      toDeliver: "To deliver",
      total: "Total",
      noArticles: "No articles added yet. Click 'Add article' to start.",
      delete: "Delete",
      amount: "Amount",
      enterAmount: "Enter amount",
    },
  };

  const l = labels[language === "en" ? "en" : "nl"];

  // Toon alleen rooms met een gekozen product — lege/initiele rooms verbergen we
  const articleRooms = rooms.filter((r) => r.selectedProduct);

  return (
    <div className="border rounded-lg bg-white">
      {/* Header */}
      <div className="bg-[#2d4724] text-white px-4 py-2 rounded-t-lg flex items-center justify-between">
        <h2 className="text-lg">{l.sectionTitle}</h2>
      </div>

      {/* Content */}
      <div className="p-4 md:p-6 bg-[#2d472402] space-y-4">
        {articleRooms.length === 0 ||
        articleRooms.every((r) => !r.selectedProduct) ? (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <p className="text-gray-500">{l.noArticles}</p>
          </div>
        ) : (
          <div className="rounded-lg p-4" style={{ backgroundColor: "rgba(16, 79, 37, 0.075)" }}>
            {/* Tabel-header */}
            <div className="hidden md:grid grid-cols-[2fr_110px_70px_90px_110px_110px_70px_90px_40px] gap-3 text-xs font-medium text-gray-700 pb-2 border-b border-gray-300 mb-2">
              <span>{l.product}</span>
              <span className="text-right">{l.entered}</span>
              <span className="text-right">{l.unit}</span>
              <span className="text-right">{l.cuttingWaste}</span>
              <span className="text-right">{l.inclCuttingWaste}</span>
              <span className="text-right">{l.converted}</span>
              <span className="text-right">{l.packages}</span>
              <span className="text-right">{l.toDeliver}</span>
              <span></span>
            </div>

            {/* Rijen */}
            <div className="space-y-2">
              {articleRooms.map((room) => {
                const product = room.selectedProduct;
                const snijverlies = product?.snijverlies || 0;
                const pakgrootte = product?.pakgrootte || 0;
                const eenheid = product?.eenheid || "M2";
                const omrekenfactor = (product as any)?.omrekenfactor || 1;
                const ingevoerd = room.area || 0;
                const incl = ingevoerd * (1 + snijverlies / 100);
                const omgerekend = incl / omrekenfactor;
                const pakken = pakgrootte > 0 ? Math.ceil(incl / pakgrootte) : 0;
                const teLeveren = pakken * pakgrootte;

                if (!product) {
                  return null; // wordt al gefilterd in articleRooms, voor de zekerheid
                }

                return (
                  <div
                    key={room.id}
                    className="grid grid-cols-1 md:grid-cols-[2fr_110px_70px_90px_110px_110px_70px_90px_40px] gap-3 md:items-center text-xs py-2 border-b border-gray-200 last:border-0"
                  >
                    {/* Product */}
                    <div className="flex items-center gap-3 min-w-0">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-10 w-10 rounded object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded bg-gray-200 flex-shrink-0" />
                      )}
                      <div className="min-w-0">
                        <div className="font-medium text-gray-900 truncate">
                          {product.name}
                        </div>
                        {product.code && (
                          <div className="text-gray-500 text-[11px] truncate">
                            {product.code}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Ingevoerd (input) */}
                    <div className="md:text-right">
                      <span className="md:hidden text-gray-500 mr-1 block mb-1 font-medium">
                        {l.amount} ({eenheid}):
                      </span>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={ingevoerd === 0 ? "" : ingevoerd}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          onUpdateArea(room.id, isNaN(val) ? 0 : val);
                        }}
                        placeholder={l.enterAmount}
                        className="h-9 text-right md:ml-auto md:w-[120px] bg-white border-2 border-[#2d4724]/40 focus:border-[#2d4724]"
                      />
                    </div>

                    {/* Eenheid */}
                    <div className="md:text-right text-gray-700">
                      <span className="md:hidden text-gray-500 mr-1">{l.unit}:</span>
                      {eenheid}
                    </div>

                    {/* Snijverlies */}
                    <div className="md:text-right text-gray-700">
                      <span className="md:hidden text-gray-500 mr-1">{l.cuttingWaste}:</span>
                      {snijverlies}%
                    </div>

                    {/* Incl. snijverlies */}
                    <div className="md:text-right text-gray-700">
                      <span className="md:hidden text-gray-500 mr-1">{l.inclCuttingWaste}:</span>
                      {ingevoerd > 0 ? incl.toFixed(2) : "-"}
                    </div>

                    {/* Omgerekend */}
                    <div className="md:text-right text-gray-700">
                      <span className="md:hidden text-gray-500 mr-1">{l.converted}:</span>
                      {ingevoerd > 0 ? omgerekend.toFixed(2) : "-"}
                    </div>

                    {/* Pakken */}
                    <div className="md:text-right text-gray-700">
                      <span className="md:hidden text-gray-500 mr-1">{l.packages}:</span>
                      {pakken > 0 ? pakken : "-"}
                    </div>

                    {/* Te leveren */}
                    <div className="md:text-right text-gray-700">
                      <span className="md:hidden text-gray-500 mr-1">{l.toDeliver}:</span>
                      {teLeveren > 0 ? teLeveren.toFixed(2) : "-"}
                    </div>

                    {/* Verwijder */}
                    <div className="flex md:justify-end">
                      <button
                        type="button"
                        onClick={() => onDeleteArticle(room.id)}
                        className="text-gray-400 hover:text-red-600 p-1"
                        title={l.delete}
                        disabled={rooms.length <= 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Totaalregel */}
            {totalIngevoerd > 0 && (
              <div className="hidden md:grid grid-cols-[2fr_110px_70px_90px_110px_110px_70px_90px_40px] gap-3 text-xs font-medium pt-3 mt-2 border-t-2 border-gray-300">
                <span>
                  <strong>{l.total}:</strong>
                </span>
                <span className="text-right">
                  <strong>{totalIngevoerd}</strong>
                </span>
                <span className="text-right">-</span>
                <span className="text-right">-</span>
                <span className="text-right">
                  <strong>{totalInclSnijverlies.toFixed(2)}</strong>
                </span>
                <span className="text-right">
                  <strong>{totalOmgerekend.toFixed(2)}</strong>
                </span>
                <span className="text-right">
                  <strong>{totalPakken}</strong>
                </span>
                <span className="text-right">
                  <strong>{totalTeLeveren.toFixed(2)}</strong>
                </span>
                <span></span>
              </div>
            )}
          </div>
        )}

        {/* Voeg artikel toe knop */}
        <div className="flex justify-start">
          <Button
            className="bg-[#2d4724] hover:bg-[#1f3319]"
            onClick={onAddArticle}
          >
            <Plus className="h-4 w-4 mr-1" />
            {l.addArticle}
          </Button>
        </div>
      </div>
    </div>
  );
}
