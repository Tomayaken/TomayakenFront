import Dashboard from "./pages/Dashboard";
import Sidebar from "./components/Sidebar";

function App() {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ marginLeft: "250px" }}>
        <Dashboard />
      </div>
    </div>
  );
}

export default App;