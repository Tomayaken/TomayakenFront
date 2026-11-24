
import type { paths } from "../types/api";
import { apiRequest } from "./apiClient";

type SupplyListResponse =
  paths["/api/v1/shelters/{shelterId}/supplies"]["get"]["responses"][200]["content"]["application/json"];

type TransactionListResponse =
  paths["/api/v1/admin/shelters/{shelterId}/supply-transactions"]["get"]["responses"][200]["content"]["application/json"];

type SupplyOperationRequest =
  paths["/api/v1/admin/shelters/{shelterId}/supplies/{supplyId}/in"]["post"]["requestBody"]["content"]["application/json"];

export type Supply = SupplyListResponse["items"][number];

export type SupplyTransaction =
  TransactionListResponse["items"][number];

export async function getShelterSupplies(
  shelterId: string
): Promise<Supply[]> {
  const response = await apiRequest<SupplyListResponse>(
    `/shelters/${encodeURIComponent(shelterId)}/supplies`
  );

  return response.items;
}

async function updateSupply(
  shelterId: string,
  supplyId: string,
  operation: "in" | "out",
  data: SupplyOperationRequest
): Promise<Supply> {
  return apiRequest<Supply>(
    `/admin/shelters/${encodeURIComponent(shelterId)}/supplies/${encodeURIComponent(supplyId)}/${operation}`,
    {
      method: "POST",
      body: JSON.stringify(data),
    },
    true
  );
}

export async function addSupply(
  shelterId: string,
  supplyId: string,
  quantity: number,
  operatorName?: string,
  note?: string
): Promise<Supply> {
  return updateSupply(shelterId, supplyId, "in", {
    quantity,
    ...(operatorName ? { operatorName } : {}),
    ...(note ? { note } : {}),
  });
}

export async function distributeSupply(
  shelterId: string,
  supplyId: string,
  quantity: number,
  operatorName?: string,
  note?: string
): Promise<Supply> {
  return updateSupply(shelterId, supplyId, "out", {
    quantity,
    ...(operatorName ? { operatorName } : {}),
    ...(note ? { note } : {}),
  });
}

export async function getSupplyTransactions(
  shelterId: string
): Promise<SupplyTransaction[]> {
  const response = await apiRequest<TransactionListResponse>(
    `/admin/shelters/${encodeURIComponent(shelterId)}/supply-transactions`,
    {},
    true
  );

  return response.items;
}
