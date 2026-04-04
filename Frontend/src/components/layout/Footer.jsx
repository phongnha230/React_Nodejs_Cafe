import { FaFacebook, FaInstagram, FaTwitter, FaYoutube } from 'react-icons/fa'

export function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="footer" id="contact">
      <div className="container footer-inner">
        <div className="footer-brand">
          <h3 className="footer-logo">Cafe Nhà Mình</h3>
          <p className="footer-tag">
            Không gian ấm cúng — hương vị ghi dấu từng khoảnh khắc.
          </p>
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
              <li>
                <a href="/">Trang chủ</a>
              </li>
              <li>
                <a href="/menu">Thực đơn</a>
              </li>
              <li>
                <a href="/about">Về chúng tôi</a>
              </li>
              <li>
                <a href="/contact">Liên hệ</a>
              </li>
            </ul>
          </div>
          <div className="footer-column">
            <h4>Hỗ trợ</h4>
            <ul>
              <li>
                <a href="/faq">FAQs</a>
              </li>
              <li>
                <a href="/policy">Chính sách</a>
              </li>
              <li>
                <a href="/terms">Điều khoản</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-newsletter">
          <h4>Nhận tin & Ưu đãi</h4>
          <p className="muted">
            Đăng ký nhận mã giảm giá, menu mới và sự kiện đặc biệt.
          </p>
          <form
            className="newsletter-form"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              aria-label="email"
              className="input newsletter-input"
              type="email"
              placeholder="Email của bạn"
            />
            <button className="btn newsletter-btn" type="submit">
              Đăng ký
            </button>
          </form>
          <div className="contact-block">
            <p className="muted">45 Lê Lợi, Quận 1, TP.HCM</p>
            <p className="muted">contact@nhaminh.cafe</p>
            <p className="muted">0901 234 567</p>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <p>© {year} Cafe Nhà Mình. All rights reserved.</p>
          <div className="footer-credits">
            Designed with ♥ for coffee lovers
          </div>
        </div>
      </div>
    </footer>
  )
}
