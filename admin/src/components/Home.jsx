import { useKeycloak } from "@react-keycloak/web";
import ChartForm from "./ChartForm";

const Home = () => {
  const { keycloak, initialized } = useKeycloak();

  if (!initialized) {
    return <div>Loading ...</div>;
  }

  const callProtectedApi = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/protected", {
        headers: {
          Authorization: `Bearer ${keycloak.token}`,
        },
      });
      const data = await response.json();
      console.log("API Response:", data);
    } catch (error) {
      console.error("API Error:", error);
    }
  };

  return (
    <div>
      <h1>
        Welcome,{" "}
        {keycloak.authenticated
          ? keycloak.tokenParsed?.preferred_username
          : "Guest"}
      </h1>
      {keycloak.authenticated ? (
        <>
          <button onClick={callProtectedApi}>Call Protected API</button>
          <button onClick={() => keycloak.logout()}>Logout</button>
          <button onClick={() => console.log("Token:", keycloak.token)}>
            Log Token
          </button>
        </>
      ) : (
        <button onClick={() => keycloak.login()}>Login</button>
      )}
      <ChartForm token={keycloak.token}/>
    </div>
  );
};

export default Home;
