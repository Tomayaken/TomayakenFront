
import { useEffect, useState } from "react";
import { getShelters } from "../services/shelterApi";
import {
  getShelterSupplies,
  getSupplyTransactions,
  addSupply,
  distributeSupply,
} from "../services/supplyApi";
import type {
  Supply,
  SupplyTransaction,
} from "../services/supplyApi";
import "./SupplyManagement.css";

type ShelterOption = {
  id: string;
  name: string;
};

type Transaction = {
  id: string;
  shelterId: string;
  supplyName: string;
  type: "IN" | "OUT";
  quantity: number;
  unit: string;
  date: string;
};

const API_ENABLED = Boolean(
  import.meta.env.VITE_API_BASE_URL?.trim()
);

const initialShelters: ShelterOption[] = [
  { id: "mock-a", name: "避難所A" },
  { id: "mock-b", name: "避難所B" },
  { id: "mock-c", name: "避難所C" },
];

const initialSupplies: Record<string, Supply[]> = {
  "mock-a": [
    { id: "a-1", name: "食料", quantity: 120, unit: "食" },
    { id: "a-2", name: "飲料水", quantity: 200, unit: "本" },
  ],
  "mock-b": [
    { id: "b-1", name: "食料", quantity: 80, unit: "食" },
    { id: "b-2", name: "毛布", quantity: 40, unit: "枚" },
  ],
  "mock-c": [
    { id: "c-1", name: "飲料水", quantity: 150, unit: "本" },
  ],
};

function formatDate(value: string) {
  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString("ja-JP");
}

function SupplyManagement() {
  const [shelters, setShelters] = useState<ShelterOption[]>(
    API_ENABLED ? [] : initialShelters
  );

  const [selectedShelterId, setSelectedShelterId] = useState(
    API_ENABLED ? "" : "mock-a"
  );

  const [suppliesByShelter, setSuppliesByShelter] = useState<
    Record<string, Supply[]>
  >(API_ENABLED ? {} : initialSupplies);

  const [transactionsByShelter, setTransactionsByShelter] =
    useState<Record<string, Transaction[]>>({});

  const [selectedSupplyId, setSelectedSupplyId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [operation, setOperation] = useState<"IN" | "OUT">("IN");
  const [operatorName, setOperatorName] = useState("");
  const [note, setNote] = useState("");

  const [loading, setLoading] = useState(API_ENABLED);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const supplies = suppliesByShelter[selectedShelterId] ?? [];
  const transactions =
    transactionsByShelter[selectedShelterId] ?? [];

  const currentSupplyId = supplies.some(
    (item) => item.id === selectedSupplyId
  )
    ? selectedSupplyId
    : (supplies[0]?.id ?? "");

  useEffect(() => {
    if (!API_ENABLED) return;

    let active = true;

    async function loadShelters() {
      setLoading(true);
      setError("");

      try {
        const data = await getShelters();

        if (!active) return;

        const options = data.map((shelter) => ({
          id: shelter.id,
          name: shelter.name,
        }));

        setShelters(options);
        setSelectedShelterId(options[0]?.id ?? "");
      } catch (err) {
        if (!active) return;

        setError(
          err instanceof Error
            ? err.message
            : "避難所一覧の取得に失敗しました。"
        );
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadShelters();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!API_ENABLED || !selectedShelterId) return;

    let active = true;

    async function loadSuppliesAndHistory() {
      setLoading(true);
      setError("");

      // 別の避難所の情報を表示しないようにする
      setSuppliesByShelter((previous) => ({
        ...previous,
        [selectedShelterId]: [],
      }));

      setTransactionsByShelter((previous) => ({
        ...previous,
        [selectedShelterId]: [],
      }));

      try {
        const [supplyData, historyData] = await Promise.all([
          getShelterSupplies(selectedShelterId),
          getSupplyTransactions(selectedShelterId),
        ]);

        if (!active) return;

        setSuppliesByShelter((previous) => ({
          ...previous,
          [selectedShelterId]: supplyData,
        }));

        const history: Transaction[] = historyData.map(
          (item: SupplyTransaction) => ({
            id: item.id,
            shelterId: selectedShelterId,
            supplyName: item.supply.name,
            type: item.type,
            quantity: item.quantity,
            unit: item.supply.unit,
            date: formatDate(item.createdAt),
          })
        );

        setTransactionsByShelter((previous) => ({
          ...previous,
          [selectedShelterId]: history,
        }));
      } catch (err) {
        if (!active) return;

        setError(
          err instanceof Error
            ? err.message
            : "物資情報の取得に失敗しました。"
        );
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadSuppliesAndHistory();

    return () => {
      active = false;
    };
  }, [selectedShelterId]);

  const handleShelterChange = (shelterId: string) => {
    if (submitting) return;

    setSelectedShelterId(shelterId);
    setSelectedSupplyId("");
    setMessage("");
    setError("");
  };

  const handleOperation = async () => {
    if (submitting || loading) return;

    setError("");
    setMessage("");

    const amount = Number(quantity);

    if (!quantity.trim() || !Number.isSafeInteger(amount) || amount <= 0) {
      setError("1以上の整数を入力してください。");
      return;
    }

    const target = supplies.find(
      (item) => item.id === currentSupplyId
    );

    if (!target || !selectedShelterId) {
      setError("避難所と物資を選択してください。");
      return;
    }

    if (
      operation === "IN" &&
      !Number.isSafeInteger(target.quantity + amount)
    ) {
      setError("数量が大きすぎます。");
      return;
    }

    if (operation === "OUT" && target.quantity < amount) {
      setError("在庫数を超える数量は配布できません。");
      return;
    }

    setSubmitting(true);

    try {
      if (API_ENABLED) {
        if (operation === "IN") {
          await addSupply(
            selectedShelterId,
            target.id,
            amount,
            operatorName.trim() || undefined,
            note.trim() || undefined
          );
        } else {
          await distributeSupply(
            selectedShelterId,
            target.id,
            amount,
            operatorName.trim() || undefined,
            note.trim() || undefined
          );
        }

        const [updatedSupplies, updatedHistory] =
          await Promise.all([
            getShelterSupplies(selectedShelterId),
            getSupplyTransactions(selectedShelterId),
          ]);

        setSuppliesByShelter((previous) => ({
          ...previous,
          [selectedShelterId]: updatedSupplies,
        }));

        setTransactionsByShelter((previous) => ({
          ...previous,
          [selectedShelterId]: updatedHistory.map((item) => ({
            id: item.id,
            shelterId: selectedShelterId,
            supplyName: item.supply.name,
            type: item.type,
            quantity: item.quantity,
            unit: item.supply.unit,
            date: formatDate(item.createdAt),
          })),
        }));
      } else {
        const updatedSupplies = supplies.map((item) =>
          item.id === target.id
            ? {
                ...item,
                quantity:
                  operation === "IN"
                    ? item.quantity + amount
                    : item.quantity - amount,
              }
            : item
        );

        setSuppliesByShelter((previous) => ({
          ...previous,
          [selectedShelterId]: updatedSupplies,
        }));

        const transaction: Transaction = {
          id: crypto.randomUUID(),
          shelterId: selectedShelterId,
          supplyName: target.name,
          type: operation,
          quantity: amount,
          unit: target.unit,
          date: new Date().toLocaleString("ja-JP"),
        };

        setTransactionsByShelter((previous) => ({
          ...previous,
          [selectedShelterId]: [
            transaction,
            ...(previous[selectedShelterId] ?? []),
          ],
        }));
      }

      setQuantity("");
      setNote("");
      setMessage(
        `${target.name}を${amount}${target.unit}${
          operation === "IN" ? "入庫" : "配布"
        }しました。`
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "処理に失敗しました。"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="supply-management-page">
      <h1>物資管理</h1>
      <p className="supply-description">
        避難所ごとの物資在庫・入庫・配布履歴を管理します。
      </p>

      {!API_ENABLED && (
        <p className="supply-mock-notice">
          ※ 現在はサンプルデータで動作しています。
        </p>
      )}

      <div className="supply-field">
        <label htmlFor="shelter-select">対象避難所</label>
        <select
          id="shelter-select"
          value={selectedShelterId}
          disabled={loading || submitting || shelters.length === 0}
          onChange={(event) =>
            handleShelterChange(event.target.value)
          }
        >
          {shelters.length === 0 && (
            <option value="">避難所がありません</option>
          )}

          {shelters.map((shelter) => (
            <option key={shelter.id} value={shelter.id}>
              {shelter.name}
            </option>
          ))}
        </select>
      </div>

      {loading && <p role="status">データを読み込み中...</p>}

      {error && (
        <p role="alert" style={{ color: "#dc2626" }}>
          {error}
        </p>
      )}

      {message && (
        <p className="supply-message" role="status">
          {message}
        </p>
      )}

      <section className="supply-section">
        <h2>在庫一覧</h2>

        <div className="supply-table-wrapper">
          <table className="supply-table">
            <thead>
              <tr>
                <th>物資名</th>
                <th>在庫数</th>
                <th>単位</th>
              </tr>
            </thead>
            <tbody>
              {supplies.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.quantity}</td>
                  <td>{item.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {supplies.length === 0 && !loading && (
          <p className="supply-empty">
            {error
              ? "在庫情報を取得できませんでした。"
              : "物資データがありません。"}
          </p>
        )}
      </section>

      <section className="supply-section">
        <h2>入庫・配布処理</h2>

        <div className="supply-form">
          <div className="supply-field">
            <label htmlFor="operation-select">操作</label>
            <select
              id="operation-select"
              value={operation}
              disabled={submitting || loading}
              onChange={(event) =>
                setOperation(event.target.value as "IN" | "OUT")
              }
            >
              <option value="IN">入庫</option>
              <option value="OUT">配布</option>
            </select>
          </div>

          <div className="supply-field">
            <label htmlFor="supply-select">物資</label>
            <select
              id="supply-select"
              value={currentSupplyId}
              disabled={submitting || loading || supplies.length === 0}
              onChange={(event) =>
                setSelectedSupplyId(event.target.value)
              }
            >
              {supplies.length === 0 && (
                <option value="">物資がありません</option>
              )}

              {supplies.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          <div className="supply-field">
            <label htmlFor="quantity-input">数量</label>
            <input
              id="quantity-input"
              type="number"
              min="1"
              step="1"
              value={quantity}
              disabled={submitting || loading}
              onChange={(event) =>
                setQuantity(event.target.value)
              }
              placeholder="数量を入力"
            />
          </div>

          <div className="supply-field">
            <label htmlFor="operator-name-input">担当者名（任意）</label>
            <input
              id="operator-name-input"
              type="text"
              value={operatorName}
              disabled={submitting || loading}
              onChange={(event) =>
                setOperatorName(event.target.value)
              }
              placeholder="例：受付担当A"
            />
          </div>

          <div className="supply-field">
            <label htmlFor="supply-note-input">備考（任意）</label>
            <input
              id="supply-note-input"
              type="text"
              value={note}
              disabled={submitting || loading}
              onChange={(event) =>
                setNote(event.target.value)
              }
              placeholder="例：朝の配布"
            />
          </div>

          <button
            type="button"
            className="supply-submit-button"
            onClick={() => void handleOperation()}
            disabled={
              submitting ||
              loading ||
              supplies.length === 0 ||
              !selectedShelterId ||
              (API_ENABLED && Boolean(error))
            }
          >
            {submitting
              ? "処理中..."
              : operation === "IN"
                ? "入庫する"
                : "配布する"}
          </button>
        </div>
      </section>

      <section className="supply-section">
        <h2>入出庫履歴</h2>

        {transactions.length === 0 ? (
          !loading && (
            <p className="supply-empty">
              {error
                ? "履歴情報を取得できませんでした。"
                : "まだ入出庫履歴がありません。"}
            </p>
          )
        ) : (
          <div className="supply-table-wrapper">
            <table className="supply-table">
              <thead>
                <tr>
                  <th>日時</th>
                  <th>物資名</th>
                  <th>操作</th>
                  <th>数量</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((item) => (
                  <tr key={item.id}>
                    <td>{item.date}</td>
                    <td>{item.supplyName}</td>
                    <td>
                      {item.type === "IN" ? "入庫" : "配布"}
                    </td>
                    <td>
                      {item.quantity} {item.unit}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default SupplyManagement;
