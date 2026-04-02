
  import { createRoot } from "react-dom/client";
  import App from "./App.tsx";
  import { VersionBadge } from "./components/VersionBadge";
  import "./index.css";

  createRoot(document.getElementById("root")!).render(
    <>
      <App />
      <VersionBadge />
    </>
  );
