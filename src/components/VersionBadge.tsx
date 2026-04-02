import { useState } from "react";
import { APP_VERSION, changelog } from "../changelog";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";

export function VersionBadge() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-3 right-3 z-50 bg-gray-200 hover:bg-gray-300 text-gray-600 text-xs px-2.5 py-1 rounded-full transition-colors shadow-sm"
        title="Versie-info"
      >
        v{APP_VERSION}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogTitle className="text-lg font-semibold text-[#2d4724]">
            Logboek
          </DialogTitle>
          <DialogDescription className="sr-only">
            Overzicht van versies en wijzigingen
          </DialogDescription>
          <div className="space-y-4 mt-2">
            {changelog.map((entry) => (
              <div key={entry.version} className="border-b pb-3 last:border-b-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm text-[#2d4724]">
                    v{entry.version}
                  </span>
                  <span className="text-xs text-gray-400">{entry.date}</span>
                </div>
                <ul className="space-y-0.5">
                  {entry.changes.map((change, i) => (
                    <li key={i} className="text-sm text-gray-600 flex items-start gap-1.5">
                      <span className="text-[#2d4724] mt-0.5">•</span>
                      <span>{change}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
