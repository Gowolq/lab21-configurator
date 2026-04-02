// Changelog data - voeg nieuwe entries bovenaan toe
export const APP_VERSION = "1.3.1";

export interface ChangelogEntry {
  version: string;
  date: string;
  changes: string[];
}

export const changelog: ChangelogEntry[] = [
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
