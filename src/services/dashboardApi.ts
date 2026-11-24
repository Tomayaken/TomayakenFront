import { dashboardData, shelters, supplies } from "../data/mockDashboard";
import { getShelters } from "./shelterApi";
import { getShelterSupplies } from "./supplyApi";

export const DASHBOARD_API_ENABLED = Boolean(
  import.meta.env.VITE_API_BASE_URL?.trim()
);

export type DashboardResponse = {
  dashboardData: { label: string; value: number | null; unit: string }[];
  shelters: { id: string; name: string; currentCount: number; predictedCount: number | null; capacity: number }[];
  supplies: { id: string; shelterName: string; itemName: string; stock: number; required: number | null; unit: string }[];
};

function formatUnit(unit: string, name: string): string {
  if (unit === "bottle") return "本";
  if (unit === "meal") return "食";
  if (unit === "piece") return name.includes("毛布") ? "枚" : "個";
  return unit;
}

export async function fetchDashboardData(): Promise<DashboardResponse> {
  if (!DASHBOARD_API_ENABLED) {
    return {
      dashboardData,
      shelters,
      supplies: supplies.map((item) => ({
        ...item,
        id: String(item.id),
      })),
    };
  }

  const shelterData = await getShelters();
  const supplyGroups = await Promise.all(
    shelterData.map(async (shelter) => {
      const items = await getShelterSupplies(shelter.id);
      return items.map((item) => ({
        id: `${shelter.id}-${item.id}`,
        shelterName: shelter.name,
        itemName: item.name,
        stock: item.quantity,
        required: null,
        unit: formatUnit(item.unit, item.name),
      }));
    })
  );

  return {
    dashboardData: [
      { label: "総避難所数", value: shelterData.length, unit: "か所" },
      { label: "総避難者数", value: shelterData.reduce((sum, item) => sum + item.currentOccupancy, 0), unit: "人" },
      { label: "移動中避難者数", value: null, unit: "人" },
      { label: "到着見込み人数", value: null, unit: "人" },
      { label: "物資不足数", value: null, unit: "件" },
    ],
    shelters: shelterData.map((item) => ({
      id: item.id,
      name: item.name,
      currentCount: item.currentOccupancy,
      predictedCount: null,
      capacity: item.capacity,
    })),
    supplies: supplyGroups.flat(),
  };
}