
import type { paths } from "../types/api";
import { apiRequest } from "./apiClient";

// OpenAPIから生成された避難所一覧のレスポンス型
type ShelterListResponse =
  paths["/api/v1/shelters"]["get"]["responses"][200]["content"]["application/json"];

// 避難所1件分の型
export type Shelter = ShelterListResponse["items"][number];

// 避難所一覧を取得
export async function getShelters(): Promise<Shelter[]> {
  const response = await apiRequest<ShelterListResponse>("/shelters");
  return response.items;
}

// 避難所詳細を取得
export async function getShelter(shelterId: string): Promise<Shelter> {
  return apiRequest<Shelter>(
    `/shelters/${encodeURIComponent(shelterId)}`
  );
}
