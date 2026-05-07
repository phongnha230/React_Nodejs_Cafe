export function Banner() {
  return (
    <div className="banner">
      <div className="banner-bg"></div>
      <div className="container banner-content">
        <div className="banner-content-inner">
          <h2>Thức uống mát lạnh, tươi ngon mỗi ngày</h2>
          <p>Chọn món yêu thích và đặt ngay. Tận hưởng hương vị tuyệt vời được giao nhanh đến tận tay bạn trong vài phút.</p>
          
          <div className="banner-btn-wrapper">
            <a className="btn-premium" href="#menu">Xem Menu Ngay</a>
          </div>

          {/* Featured Products Gallery */}
          <div className="banner-featured-products">
            <div className="featured-product-card">
              <div className="featured-image-container">
                <img src="/src/assets/cà phê đen.jpeg" alt="Cà phê đen" />
              </div>
              <span className="featured-label">Cà phê đen</span>
            </div>
            <div className="featured-product-card">
              <div className="featured-image-container">
                <img src="/src/assets/Matcha.jpeg" alt="Matcha latte" />
              </div>
              <span className="featured-label">Matcha latte</span>
            </div>
            <div className="featured-product-card">
              <div className="featured-image-container">
                <img src="/src/assets/Trà Đào.jpeg" alt="Trà Đào" />
              </div>
              <span className="featured-label">Trà Đào</span>
            </div>
            <div className="featured-product-card">
              <div className="featured-image-container">
                <img src="/src/assets/Milo_Dằm.jpeg" alt="Milo Dằm" />
              </div>
              <span className="featured-label">Milo Dằm</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


