import { useState } from "react";
import { supplies } from "../data/mockDashboard";
import "./Busshikanri.css";

function Busshikanri() {
  const [search, setSearch] = useState("");
  const [selectedShelter, setSelectedShelter] = useState("すべて");

  const shelterNames = [...new Set(supplies.map((supply) => supply.shelterName))];
  const filteredSupplies = supplies.filter((supply) => {
    const matchesSearch = `${supply.itemName} ${supply.shelterName}`
      .toLowerCase()
      .includes(search.trim().toLowerCase());
    const matchesShelter =
      selectedShelter === "すべて" || supply.shelterName === selectedShelter;

    return matchesSearch && matchesShelter;
  });
  const shortageCount = supplies.filter(
    (supply) => supply.stock < supply.required
  ).length;

  return (
    <section className="supplies-page">
      <header className="supplies-heading">
        <h1>物資管理</h1>
        <p>避難所ごとの物資在庫と必要数を確認できます。</p>
      </header>

      <div className="supplies-summary" aria-label="物資の概要">
        <article className="supplies-summary-card">
          <span>登録物資数</span>
          <strong>{supplies.length}<small> 件</small></strong>
        </article>
        <article className="supplies-summary-card supplies-summary-shortage">
          <span>不足している物資</span>
          <strong>{shortageCount}<small> 件</small></strong>
        </article>
        <article className="supplies-summary-card">
          <span>管理中の避難所</span>
          <strong>{shelterNames.length}<small> か所</small></strong>
        </article>
      </div>

      <div className="supplies-toolbar">
        <label>
          <span className="supplies-sr-only">物資名または避難所名で検索</span>
          <input
            type="search"
            placeholder="物資名・避難所名で検索"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
        <label>
          <span className="supplies-sr-only">避難所で絞り込み</span>
          <select
            value={selectedShelter}
            onChange={(event) => setSelectedShelter(event.target.value)}
          >
            <option value="すべて">すべての避難所</option>
            {shelterNames.map((shelterName) => (
              <option key={shelterName} value={shelterName}>
                {shelterName}
              </option>
            ))}
          </select>
        </label>
        <span className="supplies-result-count">
          {filteredSupplies.length} 件
        </span>
      </div>

      <div className="supplies-table-wrapper">
        <table className="supplies-table">
          <thead>
            <tr>
              <th scope="col">物資名</th>
              <th scope="col">避難所</th>
              <th scope="col">在庫数</th>
              <th scope="col">必要数</th>
              <th scope="col">不足数</th>
              <th scope="col">状態</th>
            </tr>
          </thead>
          <tbody>
            {filteredSupplies.map((supply) => {
              const shortage = Math.max(0, supply.required - supply.stock);
              const isShortage = shortage > 0;

              return (
                <tr key={supply.id}>
                  <td className="supplies-item-name">{supply.itemName}</td>
                  <td>{supply.shelterName}</td>
                  <td>{supply.stock} {supply.unit}</td>
                  <td>{supply.required} {supply.unit}</td>
                  <td>{shortage} {supply.unit}</td>
                  <td>
                    <span
                      className={`supplies-status ${isShortage ? "is-shortage" : "is-stocked"}`}
                    >
                      {isShortage ? "不足" : "充足"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredSupplies.length === 0 && (
          <p className="supplies-empty">該当する物資がありません。</p>
        )}
      </div>
    </section>
  );
}

export default Busshikanri;
