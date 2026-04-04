export function FilterBar({ q, setQ, cat, setCat, price, setPrice }) {
  return (
    <div className="filterbar">
      <input
        className="input"
        placeholder="Tìm đồ uống..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <select
        className="input"
        value={cat}
        onChange={(e) => setCat(e.target.value)}
      >
        <option value="">Tất cả loại</option>
        <option value="juice">Nước ép</option>
        <option value="tea">Trà</option>
        <option value="coffee">Cà phê</option>
        <option value="milk-tea">Trà sữa</option>
        <option value="Đồ ăn">Đồ ăn</option>
      </select>
      <select
        className="input"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      >
        <option value="">Giá</option>
        <option value="asc">Thấp đến cao</option>
        <option value="desc">Cao đến thấp</option>
      </select>
    </div>
  )
}
