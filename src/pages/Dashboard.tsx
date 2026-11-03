
import { useCallback, useEffect, useState } from "react";

import {
  fetchDashboardData,
  type DashboardResponse,
} from "../services/dashboardApi";

import "./Dashboard.css";

// 混雑率を計算
function getOccupancyRate(current: number, capacity: number) {
  if (capacity <= 0) return 0;
  return (current / capacity) * 100;
}

// 混雑状態を判定
function getOccupancyStatus(rate: number) {
  if (rate >= 80) return "混雑";
  if (rate >= 50) return "普通";
  return "空き";
}

export default function Dashboard() {
  // APIから取得したデータ
  const [data, setData] = useState<DashboardResponse | null>(null);

  // 通信状態
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // データを取得する処理
  const handleRefresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await fetchDashboardData();

      setData(result);
      setLastUpdated(new Date());
    } catch {
      setError("データの取得に失敗しました。");
    } finally {
      setLoading(false);
    }
  }, []);

  // 初回表示時にデータを取得
  useEffect(() => {
    void handleRefresh();
  }, [handleRefresh]);

  return (
    <main className="dashboard">
      {/* ヘッダー */}
      <header className="dashboard-header">
        <h1>避難所運営ダッシュボード</h1>

        <p>全避難所の状況を確認できます。</p>

        <span className="demo-label">
          ※ 現在はサンプルデータを表示しています
        </span>

        {/* 更新ボタン */}
        <div className="dashboard-actions">
          <button
            type="button"
            onClick={() => void handleRefresh()}
            disabled={loading}
            className="refresh-button"
          >
            {loading ? "読み込み中..." : "更新"}
          </button>

          {lastUpdated && (
            <span className="last-updated">
              最終更新：
              {lastUpdated.toLocaleTimeString("ja-JP")}
            </span>
          )}
        </div>

        {/* エラー表示 */}
        {error && (
          <p className="dashboard-error" role="alert">
            {error}
          </p>
        )}
      </header>

      {/* 初回読み込み中 */}
      {!data && loading && (
        <p role="status">ダッシュボードのデータを読み込み中...</p>
      )}

      {/* データ取得失敗時 */}
      {!data && error && (
        <p>データを表示できません。更新ボタンから再試行してください。</p>
      )}

      {/* データ取得成功後に表示 */}
      {data && (
        <>
          {/* ① 集計カード */}
          <section className="dashboard-cards">
            {data.dashboardData.map((item) => (
              <div className="dashboard-card" key={item.label}>
                <p className="card-label">{item.label}</p>

                <div className="card-value">
                  {item.value.toLocaleString()}
                  <span className="card-unit">{item.unit}</span>
                </div>
              </div>
            ))}
          </section>

          {/* ② 避難所別の状況 */}
          <section className="dashboard-section">
            <h2>避難所別の状況</h2>

            <div className="dashboard-table-wrapper">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>避難所名</th>
                    <th>現在人数</th>
                    <th>到着見込み人数</th>
                    <th>収容可能人数</th>
                    <th>混雑率</th>
                    <th>状態</th>
                  </tr>
                </thead>

                <tbody>
                  {data.shelters.map((shelter) => {
                    const rate = getOccupancyRate(
                      shelter.currentCount,
                      shelter.capacity
                    );

                    const status = getOccupancyStatus(rate);

                    return (
                      <tr key={shelter.id}>
                        <td>{shelter.name}</td>
                        <td>{shelter.currentCount}人</td>
                        <td>+{shelter.predictedCount}人</td>
                        <td>{shelter.capacity}人</td>

                        <td>
                          <div className="occupancy-cell">
                            <div className="occupancy-bar">
                              <div
                                className={`occupancy-fill ${
                                  rate >= 80
                                    ? "high"
                                    : rate >= 50
                                      ? "medium"
                                      : "low"
                                }`}
                                style={{
                                  width: `${Math.min(rate, 100)}%`,
                                }}
                              />
                            </div>

                            <span>{rate.toFixed(1)}%</span>
                          </div>
                        </td>

                        <td>
                          <span
                            className={`status-badge ${
                              rate >= 80
                                ? "status-high"
                                : rate >= 50
                                  ? "status-medium"
                                  : "status-low"
                            }`}
                          >
                            {status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {/* ③ 物資不足情報 */}
          <section className="dashboard-section">
            <h2>物資不足情報</h2>

            <div className="dashboard-table-wrapper">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>避難所名</th>
                    <th>物資名</th>
                    <th>現在の在庫数</th>
                    <th>必要量</th>
                    <th>不足量</th>
                    <th>状態</th>
                  </tr>
                </thead>

                <tbody>
                  {data.supplies.map((supply) => {
                    const shortage = Math.max(
                      0,
                      supply.required - supply.stock
                    );

                    return (
                      <tr key={supply.id}>
                        <td>{supply.shelterName}</td>
                        <td>{supply.itemName}</td>
                        <td>
                          {supply.stock}
                          {supply.unit}
                        </td>
                        <td>
                          {supply.required}
                          {supply.unit}
                        </td>

                        <td className="shortage-value">
                          {shortage}
                          {supply.unit}
                        </td>

                        <td>
                          <span
                            className={`status-badge ${
                              shortage > 0
                                ? "status-high"
                                : "status-low"
                            }`}
                          >
                            {shortage > 0 ? "不足" : "充足"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </main>
  );
}
