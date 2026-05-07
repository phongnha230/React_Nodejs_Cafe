import { FaFacebook, FaInstagram, FaTwitter, FaYoutube } from 'react-icons/fa';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer" id="contact">
      <div className="container footer-inner">
        <div className="footer-brand">
          <span className="footer-kicker">Jokopi Corner</span>
          <h3 className="footer-logo">Cafe Nhà Mình</h3>
          <p className="footer-tag">
            Một góc cà phê ấm, yên và đủ đẹp để ngồi lâu hơn một chút.
          </p>
          <div className="footer-note">
            Mở cửa mỗi ngày 07:00 - 22:30
          </div>
          <div className="social-icons">
            <a href="#" className="social-icon" aria-label="facebook">
              <FaFacebook />
            </a>
            <a href="#" className="social-icon" aria-label="instagram">
              <FaInstagram />
            </a>
            <a href="#" className="social-icon" aria-label="twitter">
              <FaTwitter />
            </a>
            <a href="#" className="social-icon" aria-label="youtube">
              <FaYoutube />
            </a>
          </div>
        </div>

        <div className="footer-links">
          <div className="footer-column">
            <h4>Khám phá</h4>
            <ul>
              <li><a href="/">Trang chủ</a></li>
              <li><a href="#menu">Thực đơn</a></li>
              <li><a href="#activities">Hoạt động</a></li>
              <li><a href="#news">Tin tức</a></li>
            </ul>
          </div>
          <div className="footer-column">
            <h4>Hỗ trợ</h4>
            <ul>
              <li><a href="#contact">Liên hệ</a></li>
              <li><a href="/faq">FAQs</a></li>
              <li><a href="/policy">Chính sách</a></li>
              <li><a href="/terms">Điều khoản</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-newsletter">
          <h4>Nhận tin & ưu đãi</h4>
          <p className="muted">
            Đăng ký để nhận menu mới, mã giảm giá và lịch workshop theo mùa.
          </p>
          <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
            <input
              aria-label="email"
              className="input newsletter-input"
              type="email"
              placeholder="Nhập email của bạn"
            />
            <button className="btn newsletter-btn" type="submit">
              Đăng ký ngay
            </button>
          </form>
          <div className="contact-block">
            <p><span>Địa chỉ</span>45 Lê Lợi, Quận 1, TP.HCM</p>
            <p><span>Email</span>contact@nhaminh.cafe</p>
            <p><span>Hotline</span>0901 234 567</p>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <p>© {year} Cafe Nhà Mình. All rights reserved.</p>
          <div className="footer-credits">Designed for slow coffee moments.</div>
        </div>
      </div>
    </footer>
  );
}
