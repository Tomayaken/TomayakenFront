
import { useEffect, useState } from "react";
import { shelters as mockShelters } from "../data/mockDashboard";
import type { Shelter } from "../data/mockDashboard";
import { getShelters } from "../services/shelterApi";
import type { Shelter as ApiShelter } from "../services/shelterApi";
import "./ShelterList.css";

type ShelterListProps = {
  onSelectShelter: (shelter: Shelter) => void;
};

const API_ENABLED = Boolean(import.meta.env.VITE_API_BASE_URL);

function convertShelter(shelter: ApiShelter): Shelter {
  return {
    id: shelter.id,
    name: shelter.name,
    currentCount: shelter.currentOccupancy,
    predictedCount: null,
    capacity: shelter.capacity,
    isOverCapacity: shelter.isOverCapacity,
  };
}

function ShelterList({ onSelectShelter }: ShelterListProps) {
  const [search, setSearch] = useState("");
  const [shelters, setShelters] = useState<Shelter[]>(
    API_ENABLED ? [] : mockShelters
  );
  const [loading, setLoading] = useState(API_ENABLED);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!API_ENABLED) return;

    let active = true;
    let requesting = false;

    const fetchShelters = async () => {
      if (requesting) return;
      requesting = true;

      try {
        const data = await getShelters();

        if (!active) return;

        setShelters(data.map(convertShelter));
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

    void fetchShelters();

    const intervalId = window.setInterval(() => {
      void fetchShelters();
    }, 10000);

    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, []);

  const filteredShelters = shelters.filter((shelter) =>
    shelter.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="shelter-list-page">
      <div className="shelter-list-header">
        <div>
          <h1>避難所管理</h1>
          <p className="shelter-list-description">
            各避難所の人数や混雑状況を確認できます。
          </p>
        </div>
        <span className="shelter-list-count">
          全 {filteredShelters.length} 件
        </span>
      </div>

      {!API_ENABLED && (
        <p className="shelter-list-notice">
          現在はサンプルデータを表示しています。
        </p>
      )}

      {error && (
        <p className="shelter-list-error" role="alert">
          {error}
        </p>
      )}

      <div className="shelter-list-toolbar">
        <input
          type="search"
          placeholder="避難所名で検索"
          aria-label="避難所名で検索"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading && (
        <p className="shelter-list-empty">
          避難所情報を読み込み中...
        </p>
      )}

      {!loading && (
        <div className="shelter-card-grid">
          {filteredShelters.map((shelter) => {
            const rate =
              shelter.capacity > 0
                ? Math.round(
                    (shelter.currentCount / shelter.capacity) * 100
                  )
                : 0;

            const isOverCapacity =
              shelter.isOverCapacity ??
              shelter.currentCount > shelter.capacity;

            const status = isOverCapacity
              ? "定員超過"
              : rate >= 80
              ? "混雑"
              : rate >= 50
              ? "通常"
              : "空きあり";

            const statusClass =
              isOverCapacity || rate >= 80
                ? "crowded"
                : rate >= 50
                ? "normal"
                : "available";

            return (
              <button
                key={shelter.id}
                type="button"
                className="shelter-card"
                onClick={() => onSelectShelter(shelter)}
                aria-label={`${shelter.name}の詳細を見る`}
              >
                <div className="shelter-card-header">
                  <h2>{shelter.name}</h2>
                  <span className={`shelter-status ${statusClass}`}>
                    {status}
                  </span>
                </div>

                <div className="shelter-card-body">
                  <p className="shelter-card-label">
                    現在の避難者数
                  </p>

                  <div className="shelter-card-occupancy">
                    <strong>{shelter.currentCount}</strong>
                    <span>/ {shelter.capacity} 人</span>
                  </div>

                  <div
                    className="shelter-card-progress"
                    role="progressbar"
                    aria-label="収容率"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={Math.max(0, Math.min(rate, 100))}
                    aria-valuetext={`${rate}%`}
                  >
                    <div
                      className={`shelter-card-progress-fill ${statusClass}`}
                      style={{
                        width: `${Math.max(0, Math.min(rate, 100))}%`,
                      }}
                    />
                  </div>

                  <div className="shelter-card-footer">
                    <span>収容率 {rate}%</span>
                    <span className="shelter-card-link">
                      詳細を見る →
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {!loading && filteredShelters.length === 0 && (
        <p className="shelter-list-empty">
          {error
            ? "避難所情報を表示できません。"
            : "該当する避難所がありません。"}
        </p>
      )}
    </div>
  );
}

export default ShelterList;
