// Changelog data - voeg nieuwe entries bovenaan toe
export const APP_VERSION = "1.1.0";

export interface ChangelogEntry {
  version: string;
  date: string;
  changes: string[];
}

export const changelog: ChangelogEntry[] = [
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
