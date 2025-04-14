import { useKeycloak } from "@react-keycloak/web";

const Dashboard = () => {
  const { keycloak } = useKeycloak();

  return (
    <div>
      <h1>Dashboard</h1>
      <p>User: {keycloak.tokenParsed?.preferred_username}</p>
      <p>Email: {keycloak.tokenParsed?.email}</p>
    </div>
  );
};

export default Dashboard;
