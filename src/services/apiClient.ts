
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");

const TOKEN_KEY = "adminToken";

export type ApiErrorCode =
  | "INVALID_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "USER_NOT_FOUND"
  | "SHELTER_NOT_FOUND"
  | "BEACON_NOT_FOUND"
  | "CHECKIN_NOT_FOUND"
  | "SUPPLY_NOT_FOUND"
  | "DISASTER_NOT_FOUND"
  | "ALREADY_CHECKED_IN"
  | "NOT_CHECKED_IN"
  | "INSUFFICIENT_SUPPLY"
  | "NO_ACTIVE_DISASTER"
  | "DISASTER_ALREADY_ACTIVE"
  | "DISASTER_ALREADY_CLOSED"
  | "INTERNAL_ERROR";

const errorMessages: Record<ApiErrorCode, string> = {
  INVALID_REQUEST: "入力内容を確認してください。",
  UNAUTHORIZED: "認証が必要です。再度ログインしてください。",
  FORBIDDEN: "この操作を行う権限がありません。",
  USER_NOT_FOUND: "利用者が見つかりません。",
  SHELTER_NOT_FOUND: "避難所が見つかりません。",
  BEACON_NOT_FOUND: "Beaconが見つかりません。",
  CHECKIN_NOT_FOUND: "チェックイン情報が見つかりません。",
  SUPPLY_NOT_FOUND: "物資が見つかりません。",
  DISASTER_NOT_FOUND: "災害情報が見つかりません。",
  ALREADY_CHECKED_IN: "別の避難所にチェックインしています。",
  NOT_CHECKED_IN: "すでにチェックアウトされています。",
  INSUFFICIENT_SUPPLY: "在庫が不足しています。",
  NO_ACTIVE_DISASTER: "現在進行中の災害がありません。",
  DISASTER_ALREADY_ACTIVE: "すでに進行中の災害があります。",
  DISASTER_ALREADY_CLOSED: "この災害はすでに終了しています。",
  INTERNAL_ERROR: "サーバーでエラーが発生しました。",
};


export class ApiError extends Error {
  status: number;
  code: string;
  details?: unknown;

  constructor(
    status: number,
    code: string,
    details?: unknown
  ) {
    super(
      errorMessages[code as ApiErrorCode] ??
        "通信中にエラーが発生しました。"
    );

    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}


export function setAdminToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getAdminToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearAdminToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  requiresAuth = false
): Promise<T> {
  if (!API_BASE_URL) {
    throw new Error("APIの接続先が設定されていません。");
  }

  const headers = new Headers(options.headers);

  headers.set("Accept", "application/json");

  if (options.body != null) {
    headers.set("Content-Type", "application/json");
  }

  if (requiresAuth) {
    const token = getAdminToken();

    if (!token) {
      throw new ApiError(401, "UNAUTHORIZED");
    }

    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(
    `${API_BASE_URL}/api/v1${path}`,
    {
      ...options,
      headers,
    }
  );

  if (!response.ok) {
    let errorData: {
      error?: {
        code?: string;
        details?: unknown;
      };
    } = {};

    try {
      errorData = await response.json();
    } catch {
      // JSON以外のエラーレスポンス
    }

    const code =
      errorData.error?.code ??
      (response.status === 401 ? "UNAUTHORIZED" : "UNKNOWN_ERROR");

    if (response.status === 401) {
      clearAdminToken();
      window.dispatchEvent(new Event("admin-unauthorized"));
    }

    throw new ApiError(
      response.status,
      code,
      errorData.error?.details
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
