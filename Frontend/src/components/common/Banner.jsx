export function Banner() {
  return (
    <div className="banner reveal">
      <div className="banner-bg">
        <div className="container banner-content">
          <h2>Thức uống mát lạnh, tươi ngon mỗi ngày</h2>
          <p>Chọn món yêu thích và đặt ngay. Giao nhanh trong vài phút.</p>
          <a className="btn animate-float" href="#menu">Xem Menu</a>

          {/* Featured Products Gallery */}
          <div className="banner-featured-products">
            <div className="featured-product-card">
              <img src="/src/assets/cà phê đen.jpeg" alt="Cà phê đen" />
              <span className="featured-label">Cà phê đen</span>
            </div>
            <div className="featured-product-card">
              <img src="/src/assets/Matcha.jpeg" alt="Matcha latte" />
              <span className="featured-label">Matcha latte</span>
            </div>
            <div className="featured-product-card">
              <img src="/src/assets/Trà Đào.jpeg" alt="Trà Đào" />
              <span className="featured-label">Trà Đào</span>
            </div>
            <div className="featured-product-card">
              <img src="/src/assets/Milo_Dằm.jpeg" alt="Milo Dằm" />
              <span className="featured-label">Milo Dằm</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

