import { useState } from "react";
import "./Hinansya.css";

type EvacueeStatus = "無事" | "要支援" | "所在確認中";

type Evacuee = {
  id: number;
  name: string;
  shelterName: string;
  age: number;
  status: EvacueeStatus;
  checkIn: string;
  contact: string;
  note: string;
};

const evacuees: Evacuee[] = [
  {
    id: 1,
    name: "山田 太郎",
    shelterName: "避難所A",
    age: 68,
    status: "要支援",
    checkIn: "2026-11-24 08:30",
    contact: "090-1234-5678",
    note: "介護用品が必要",
  },
  {
    id: 2,
    name: "佐藤 花子",
    shelterName: "避難所A",
    age: 42,
    status: "無事",
    checkIn: "2026-11-24 09:15",
    contact: "080-2345-6789",
    note: "家族2名と入所",
  },
  {
    id: 3,
    name: "鈴木 一郎",
    shelterName: "避難所B",
    age: 75,
    status: "所在確認中",
    checkIn: "2026-11-24 10:05",
    contact: "未登録",
    note: "移動先の確認待ち",
  },
  {
    id: 4,
    name: "田中 美咲",
    shelterName: "避難所B",
    age: 19,
    status: "無事",
    checkIn: "2026-11-24 10:40",
    contact: "070-3456-7890",
    note: "食物アレルギーあり",
  },
  {
    id: 5,
    name: "高橋 健",
    shelterName: "避難所C",
    age: 55,
    status: "要支援",
    checkIn: "2026-11-24 11:20",
    contact: "090-4567-8901",
    note: "車椅子利用",
  },
];

function Hinansya() {
  const [search, setSearch] = useState("");
  const [selectedShelter, setSelectedShelter] = useState("すべて");
  const [selectedStatus, setSelectedStatus] = useState("すべて");

  const shelterNames = [...new Set(evacuees.map((item) => item.shelterName))];

  const filteredEvacuees = evacuees.filter((evacuee) => {
    const matchesSearch = `${evacuee.name} ${evacuee.contact}`
      .toLowerCase()
      .includes(search.trim().toLowerCase());
    const matchesShelter =
      selectedShelter === "すべて" || evacuee.shelterName === selectedShelter;
    const matchesStatus =
      selectedStatus === "すべて" || evacuee.status === selectedStatus;

    return matchesSearch && matchesShelter && matchesStatus;
  });

  const statusCount = (status: EvacueeStatus) =>
    evacuees.filter((evacuee) => evacuee.status === status).length;

  return (
    <section className="evacuees-page">
      <header className="evacuees-heading">
        <h1>避難者管理</h1>
        <p>避難者の入所状況と安否ステータスを確認できます。</p>
      </header>

      <div className="evacuees-summary" aria-label="避難者の概要">
        <article className="evacuees-summary-card">
          <span>登録避難者数</span>
          <strong>{evacuees.length}<small> 人</small></strong>
        </article>
        <article className="evacuees-summary-card evacuees-summary-safe">
          <span>無事</span>
          <strong>{statusCount("無事")}<small> 人</small></strong>
        </article>
        <article className="evacuees-summary-card evacuees-summary-support">
          <span>要支援</span>
          <strong>{statusCount("要支援")}<small> 人</small></strong>
        </article>
        <article className="evacuees-summary-card evacuees-summary-checking">
          <span>所在確認中</span>
          <strong>{statusCount("所在確認中")}<small> 人</small></strong>
        </article>
      </div>

      <div className="evacuees-toolbar">
        <label>
          <span className="evacuees-sr-only">氏名または連絡先で検索</span>
          <input
            type="search"
            placeholder="氏名・連絡先で検索"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>

        <label>
          <span className="evacuees-sr-only">避難所で絞り込み</span>
          <select
            value={selectedShelter}
            onChange={(event) => setSelectedShelter(event.target.value)}
          >
            <option value="すべて">すべての避難所</option>
            {shelterNames.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </label>

        <label>
          <span className="evacuees-sr-only">ステータスで絞り込み</span>
          <select
            value={selectedStatus}
            onChange={(event) => setSelectedStatus(event.target.value)}
          >
            <option value="すべて">すべてのステータス</option>
            <option value="無事">無事</option>
            <option value="要支援">要支援</option>
            <option value="所在確認中">所在確認中</option>
          </select>
        </label>

        <span className="evacuees-result-count">
          {filteredEvacuees.length} 件
        </span>
      </div>

      <div className="evacuees-table-wrapper">
        <table className="evacuees-table">
          <thead>
            <tr>
              <th scope="col">氏名</th>
              <th scope="col">避難所</th>
              <th scope="col">年齢</th>
              <th scope="col">ステータス</th>
              <th scope="col">入所日時</th>
              <th scope="col">連絡先</th>
              <th scope="col">備考</th>
            </tr>
          </thead>
          <tbody>
            {filteredEvacuees.map((evacuee) => (
              <tr key={evacuee.id}>
                <td className="evacuees-person-name">{evacuee.name}</td>
                <td>{evacuee.shelterName}</td>
                <td>{evacuee.age} 歳</td>
                <td>
                  <span className={`evacuees-status is-${evacuee.status === "無事" ? "safe" : evacuee.status === "要支援" ? "support" : "checking"}`}>
                    {evacuee.status}
                  </span>
                </td>
                <td>{evacuee.checkIn}</td>
                <td>{evacuee.contact}</td>
                <td>{evacuee.note}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredEvacuees.length === 0 && (
          <p className="evacuees-empty">該当する避難者がありません。</p>
        )}
      </div>
    </section>
  );
}

export default Hinansya;
