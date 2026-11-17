
import { useEffect, useState } from "react";
import type { Shelter } from "../data/mockDashboard";
import { supplies as mockSupplies } from "../data/mockDashboard";
import { getShelter } from "../services/shelterApi";
import { getShelterSupplies } from "../services/supplyApi";
import type { Supply as ApiSupply } from "../services/supplyApi";
import "./ShelterDetail.css";

type ShelterDetailProps = {
  shelter: Shelter;
  onBack: () => void;
};

const API_ENABLED = Boolean(import.meta.env.VITE_API_BASE_URL);

function ShelterDetail({ shelter, onBack }: ShelterDetailProps) {
  const [detail, setDetail] = useState<Shelter>(shelter);
  const [apiSupplies, setApiSupplies] = useState<ApiSupply[]>([]);
  const [loading, setLoading] = useState(API_ENABLED);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setDetail(shelter);
    setApiSupplies([]);
    setError(null);
    setLoading(API_ENABLED);

    if (!API_ENABLED) return;

    let active = true;
    let requesting = false;

    const fetchDetail = async () => {
      if (requesting) return;
      requesting = true;

      try {
        const [shelterData, supplyData] = await Promise.all([
          getShelter(shelter.id),
          getShelterSupplies(shelter.id),
        ]);

        if (!active) return;

        setDetail({
          id: shelterData.id,
          name: shelterData.name,
          currentCount: shelterData.currentOccupancy,
          predictedCount: null,
          capacity: shelterData.capacity,
          isOverCapacity: shelterData.isOverCapacity,
        });

        setApiSupplies(supplyData);
        setError(null);
      } catch (err) {
        if (!active) return;

        setError(
          err instanceof Error
            ? err.message
            : "避難所情報の取得に失敗しました。"
        );
      } finally {
        requesting = false;
        if (active) setLoading(false);
      }
    };

    void fetchDetail();

    const intervalId = window.setInterval(() => {
      void fetchDetail();
    }, 10000);

    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [shelter]);

  const occupancyRate =
    detail.capacity > 0
      ? Math.round((detail.currentCount / detail.capacity) * 100)
      : 0;

  const isOverCapacity =
    detail.isOverCapacity ??
    detail.currentCount > detail.capacity;

  const status = isOverCapacity
    ? "定員超過"
    : occupancyRate >= 80
    ? "混雑"
    : occupancyRate >= 50
    ? "通常"
    : "空きあり";

  const shelterSupplies = mockSupplies.filter(
    (supply) => supply.shelterName === detail.name
  );

  return (
    <div className="shelter-detail-page">
      <button
        type="button"
        className="detail-back-button"
        onClick={onBack}
      >
        ← 避難所一覧に戻る
      </button>

      <div className="detail-heading">
        <div>
          <h1>{detail.name}</h1>
          <p>避難所の詳細情報を確認できます。</p>
        </div>

        <span className="detail-status">{status}</span>
      </div>

      {loading && (
        <p>避難所情報を読み込み中...</p>
      )}

      {error && (
        <p role="alert" style={{ color: "#dc2626" }}>
          {error}
        </p>
      )}

      <div className="detail-stats">
        <div className="detail-stat-card">
          <p>現在の避難者数</p>
          <strong>{detail.currentCount} 人</strong>
        </div>

        <div className="detail-stat-card">
          <p>到着見込み人数</p>
          <strong>
            {detail.predictedCount === null
              ? "—"
              : `${detail.predictedCount} 人`}
          </strong>
        </div>

        <div className="detail-stat-card">
          <p>収容可能人数</p>
          <strong>{detail.capacity} 人</strong>
        </div>

        <div className="detail-stat-card">
          <p>混雑率</p>
          <strong>{occupancyRate}%</strong>
        </div>
      </div>

      <section className="detail-section">
        <h2>収容状況</h2>

        <div className="detail-progress">
          <div
            className="detail-progress-fill"
            style={{
              width: `${Math.max(0, Math.min(occupancyRate, 100))}%`,
              backgroundColor:
                isOverCapacity || occupancyRate >= 80
                  ? "#ef4444"
                  : occupancyRate >= 50
                  ? "#f59e0b"
                  : "#22c55e",
            }}
          />
        </div>

        <p>
          {detail.currentCount} / {detail.capacity} 人
        </p>
      </section>

      <section className="detail-section">
        <h2>物資状況</h2>

        <div className="detail-table-wrapper">
          <table className="detail-table">
            <thead>
              <tr>
                <th>物資名</th>
                <th>在庫数</th>
                <th>必要数</th>
                <th>不足数</th>
                <th>状態</th>
              </tr>
            </thead>

            <tbody>
              {API_ENABLED
                ? apiSupplies.map((supply) => (
                    <tr key={supply.id}>
                      <td>{supply.name}</td>
                      <td>
                        {supply.quantity} {supply.unit}
                      </td>
                      <td>—</td>
                      <td>—</td>
                      <td>—</td>
                    </tr>
                  ))
                : shelterSupplies.map((supply) => {
                    const shortage = Math.max(
                      0,
                      supply.required - supply.stock
                    );

                    return (
                      <tr key={supply.id}>
                        <td>{supply.itemName}</td>
                        <td>
                          {supply.stock} {supply.unit}
                        </td>
                        <td>
                          {supply.required} {supply.unit}
                        </td>
                        <td>{shortage} {supply.unit}</td>
                        <td>
                          {shortage > 0 ? "不足" : "充足"}
                        </td>
                      </tr>
                    );
                  })}
            </tbody>
          </table>

          {(API_ENABLED
            ? apiSupplies.length === 0
            : shelterSupplies.length === 0) &&
            !loading && (
              <p className="detail-empty">
                {error && API_ENABLED
                  ? "物資情報を取得できませんでした。"
                  : "物資データがありません。"}
              </p>
            )}
        </div>
      </section>
    </div>
  );
}

export default ShelterDetail;
