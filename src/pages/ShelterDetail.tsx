
import type { Shelter } from "../data/mockDashboard";
import { supplies } from "../data/mockDashboard";
import "./ShelterDetail.css";

type ShelterDetailProps = {
  shelter: Shelter;
  onBack: () => void;
};

function ShelterDetail({ shelter, onBack }: ShelterDetailProps) {
  const occupancyRate =
    shelter.capacity > 0
      ? Math.round((shelter.currentCount / shelter.capacity) * 100)
      : 0;

  const status =
    occupancyRate >= 80
      ? "混雑"
      : occupancyRate >= 50
      ? "通常"
      : "空きあり";

  const shelterSupplies = supplies.filter(
    (supply) => supply.shelterName === shelter.name
  );

  return (
    <div className="shelter-detail-page">
      <button className="detail-back-button" onClick={onBack}>
        ← 避難所一覧に戻る
      </button>

      <div className="detail-heading">
        <div>
          <h1>{shelter.name}</h1>
          <p>避難所の詳細情報を確認できます。</p>
        </div>
        <span className="detail-status">{status}</span>
      </div>

      <div className="detail-stats">
        <div className="detail-stat-card">
          <p>現在の避難者数</p>
          <strong>{shelter.currentCount} 人</strong>
        </div>

        <div className="detail-stat-card">
          <p>到着見込み人数</p>
          <strong>{shelter.predictedCount} 人</strong>
        </div>

        <div className="detail-stat-card">
          <p>収容可能人数</p>
          <strong>{shelter.capacity} 人</strong>
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
              width: `${Math.min(occupancyRate, 100)}%`,
              backgroundColor:
                occupancyRate >= 80
                  ? "#ef4444"
                  : occupancyRate >= 50
                  ? "#f59e0b"
                  : "#22c55e",
            }}
          />
        </div>

        <p>
          {shelter.currentCount} / {shelter.capacity} 人
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
              {shelterSupplies.map((supply) => {
                const shortage = Math.max(
                  0,
                  supply.required - supply.stock
                );

                return (
                  <tr key={supply.id}>
                    <td>{supply.itemName}</td>
                    <td>{supply.stock} {supply.unit}</td>
                    <td>{supply.required} {supply.unit}</td>
                    <td>{shortage} {supply.unit}</td>
                    <td>
                      {shortage > 0 ? "不足" : "充足"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {shelterSupplies.length === 0 && (
            <p className="detail-empty">
              物資データがありません。
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

export default ShelterDetail;
