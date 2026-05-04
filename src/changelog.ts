// Changelog data - voeg nieuwe entries bovenaan toe
export const APP_VERSION = "1.4.6";

export interface ChangelogEntry {
    version: string;
    date: string;
    changes: string[];
}

export const changelog: ChangelogEntry[] = [
  {
        version: "1.4.6",
        date: "2026-04-30",
        changes: [
            "LEG PROFIEL keuze-popup: paarse vervolg-knop verborgen voor profielen (alleen relevant voor matten)",
        ],
    },
    {
        version: "1.4.5",
        date: "2026-04-30",
        changes: [
            "LEG PROFIEL nu zichtbaar in Afwerken → Optioneel (UI-sectie was nog niet gerenderd)",
        ],
    },
    {
        version: "1.4.4",
        date: "2026-04-30",
        changes: [
            "Afwerken: nieuwe service 'LEG PROFIEL' (basis kosten pas maken + plaatsen profiel)",
            "LEG PROFIEL: 6 keuze-producten in popup (Trapuitloop RVS/zilver/zwart, Trapneus PVC RVS/zwart, Duo-hoeklijn 24,5x30mm zilver 3m)",
        ],
    },
    {
        version: "1.4.2",
        date: "2026-04-30",
        changes: [
            "Klant-modus: aantal-invoerveld duidelijker zichtbaar (groene rand)",
            "Klant-modus: lege Selecteer product-rij verwijderd, alleen gekozen artikelen tonen",
            "Klant-modus: Producten en Services sectie weggehaald uit overzichtspagina",
        ],
    },
  {
        version: "1.4.0",
        date: "2026-04-30",
        changes: [
                "Klant-modus: bij 'Uitvoering leggen = Klant' verdwijnt de ruimte-/dienstenflow",
                "Nieuwe artikellijst: ongelimiteerd producten toevoegen met aantal-invoer",
                "Automatische berekening m² → pakken inclusief snijverlies",
                "Aanbevolen-popup overgeslagen in Klant-modus",
              ],
  },
  {
        version: "1.3.1",
        date: "2026-04-02",
        changes: [
                "'Aanbevolen: Ja/Nee' toegevoegd in artikel details-regel",
                "Aanbevolen popup: checkbox vervangen door prullenbak-icoon",
              ],
  },
  {
        version: "1.3.0",
        date: "2026-04-02",
        changes: [
                "Blokkerende popup bij niet-ingevulde aanbevolen artikelen",
                "Gebruiker moet waarde invullen of artikel verwijderen bij doorgaan",
                "Aanbevolen artikelen staan standaard aangevinkt in popup",
              ],
  },
  {
        version: "1.2.0",
        date: "2026-04-02",
        changes: [
                "'Aanbevolen' badge bij optionele en keuze-artikelen",
                "Voorbereiden, installeren en verwarmen artikelen gemarkeerd",
              ],
  },
  {
        version: "1.1.0",
        date: "2026-04-02",
        changes: [
                "Standaard basisvloer 'Zandcement' voor eerste ruimte",
                "Versie-indicator en logboek toegevoegd",
              ],
  },
  {
        version: "1.0.0",
        date: "2026-04-02",
        changes: [
                "Configurator live op Vercel (GitHub-integratie)",
                "Migratie vanuit Figma Make omgeving",
                "Automatische deployment via GitHub → Vercel",
              ],
  },
  ];
