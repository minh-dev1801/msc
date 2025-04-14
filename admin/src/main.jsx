import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { ReactKeycloakProvider } from "@react-keycloak/web";
import keycloak from "./utils/keycloak";

createRoot(document.getElementById("root")).render(
  <ReactKeycloakProvider authClient={keycloak}>
    <StrictMode>
      <App />
    </StrictMode>
  </ReactKeycloakProvider>
);
