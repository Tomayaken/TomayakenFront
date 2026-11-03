function Sidebar() {
  return (
    <div
      style={{
        width: "250px",
        height: "100vh",
        backgroundColor: "#1e293b",
        color: "white",
        padding: "20px",

        position: "fixed",
        top: 0,
        left: 0,
      }}
    >
      <h2>避難所管理</h2>

      <hr />

      <p>🏠 ダッシュボード</p>
      <p>🏢 避難所管理</p>
      <p>👥 避難者管理</p>
      <p>📦 物資管理</p>
      <p>⚙ 設定</p>
    </div>
  );
}

export default Sidebar;