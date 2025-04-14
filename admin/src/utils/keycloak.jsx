import Keycloak from "keycloak-js";

const keycloakConfig = {
  url: "http://localhost:8080",
  realm: "my-realm",
  clientId: "react-app",
};

const keycloak = new Keycloak(keycloakConfig);

export default keycloak;
