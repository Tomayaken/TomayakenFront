
import { useState } from "react";
import Dashboard from "./pages/Dashboard";
import ShelterList from "./pages/ShelterList";
import ShelterDetail from "./pages/ShelterDetail";
import Sidebar from "./components/Sidebar";
import type { Shelter } from "./data/mockDashboard";

type Page = "dashboard" | "shelters";

function App() {
  const [page, setPage] = useState<Page>("dashboard");
  const [selectedShelter, setSelectedShelter] = useState<Shelter | null>(null);

  const handleNavigate = (nextPage: Page) => {
    setSelectedShelter(null);
    setPage(nextPage);
  };

  return (
    <div>
      <Sidebar onNavigate={handleNavigate} />

      <main
        style={{
          marginLeft: "250px",
          width: "calc(100% - 250px)",
          minWidth: 0,
          boxSizing: "border-box",
        }}
      >
        {page === "dashboard" && <Dashboard />}

        {page === "shelters" && (
          selectedShelter ? (
            <ShelterDetail
              shelter={selectedShelter}
              onBack={() => setSelectedShelter(null)}
            />
          ) : (
            <ShelterList
              onSelectShelter={setSelectedShelter}
            />
          )
        )}
      </main>
    </div>
  );
}

export default App;
