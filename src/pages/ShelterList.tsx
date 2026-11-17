
import { useState } from "react";
import { shelters } from "../data/mockDashboard";
import type { Shelter } from "../data/mockDashboard";
import "./ShelterList.css";

// 親コンポーネント(App.tsx)から受け取る関数
type ShelterListProps = {
  onSelectShelter: (shelter: Shelter) => void;
};

function ShelterList({ onSelectShelter }: ShelterListProps) {
  // 検索欄の入力内容
  const [search, setSearch] = useState("");

  // 避難所名による検索
  const filteredShelters = shelters.filter((shelter) =>
    shelter.name.toLowerCase().includes(search.toLowerCase())
  );

  // 混雑率を計算
  const getOccupancyRate = (current: number, capacity: number) => {
    if (capacity === 0) return 0;
    return Math.round((current / capacity) * 100);
  };

  // 混雑状況を判定
  const getStatus = (rate: number) => {
    if (rate >= 80) return "混雑";
    if (rate >= 50) return "通常";
    return "空きあり";
  };

  return (
    <div className="shelter-list-page">
      <h1>避難所管理</h1>

      <p className="shelter-list-description">
        各避難所の人数や混雑状況を確認できます。
      </p>

      {/* 検索欄 */}
      <div className="shelter-list-toolbar">
        <input
          type="search"
          placeholder="避難所名で検索"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <span>全 {filteredShelters.length} 件</span>
      </div>

      {/* 避難所一覧テーブル */}
      <div className="shelter-list-table-wrapper">
        <table className="shelter-list-table">
          <thead>
            <tr>
              <th>避難所名</th>
              <th>現在の避難者数</th>
              <th>到着見込み</th>
              <th>収容人数</th>
              <th>混雑率</th>
              <th>混雑状況</th>
            </tr>
          </thead>

          <tbody>
            {filteredShelters.map((shelter) => {
              const rate = getOccupancyRate(
                shelter.currentCount,
                shelter.capacity
              );

              const status = getStatus(rate);

              return (
                <tr key={shelter.id}>
                  {/* 避難所名をクリックすると詳細ページへ */}
                  <td>
                    <button
                      type="button"
                      className="shelter-name-button"
                      onClick={() => onSelectShelter(shelter)}
                    >
                      {shelter.name}
                    </button>
                  </td>

                  <td>{shelter.currentCount} 人</td>

                  <td>{shelter.predictedCount} 人</td>

                  <td>{shelter.capacity} 人</td>

                  <td>{rate}%</td>

                  <td>
                    <span
                      className={`shelter-status ${
                        rate >= 80
                          ? "crowded"
                          : rate >= 50
                          ? "normal"
                          : "available"
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

        {/* 検索結果がない場合 */}
        {filteredShelters.length === 0 && (
          <p className="shelter-list-empty">
            該当する避難所がありません。
          </p>
        )}
      </div>
    </div>
  );
}

export default ShelterList;
