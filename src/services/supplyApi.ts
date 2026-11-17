
import type { paths } from "../types/api";
import { apiRequest } from "./apiClient";

type SupplyListResponse =
  paths["/api/v1/shelters/{shelterId}/supplies"]["get"]["responses"][200]["content"]["application/json"];

export type Supply = SupplyListResponse["items"][number];

export async function getShelterSupplies(
  shelterId: string
): Promise<Supply[]> {
  const response = await apiRequest<SupplyListResponse>(
    `/shelters/${encodeURIComponent(shelterId)}/supplies`
  );

  return response.items;
}
