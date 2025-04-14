import { useKeycloak } from "@react-keycloak/web";

const ProtectedRoute = ({ children }) => {
  const { keycloak, initialized } = useKeycloak();

  if (!initialized) {
    return <div>Loading...</div>;
  }

  if (!keycloak.authenticated) {
    keycloak.login();
    return null;
  }

  return children;
};

export default ProtectedRoute;
