import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaFacebookF, FaGoogle, FaInstagram } from 'react-icons/fa';
import { FiArrowLeft, FiArrowRight, FiClock, FiCoffee, FiMapPin, FiStar } from 'react-icons/fi';
import { useAuthStore } from '../../stores/authStore.js';
import userService from '../../services/userService.js';
import { ROLES } from '../../constants/roles';
import { ROUTES } from '../../config/routes';
import coffeeInteriorImage from '../../assets/space_coffee.jpg';
import coffeeHeroImage from '../../assets/Hinh-anh-cafe-dep-nhat.png';

export function LoginPage() {
  const setAuthData = useAuthStore((state) => state.setAuthData);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const socialEntries = [
    { icon: <FaFacebookF />, label: 'Facebook' },
    { icon: <FaGoogle />, label: 'Google' },
    { icon: <FaInstagram />, label: 'Instagram' },
  ];

  const handleLogin = async () => {
    if (!email || !password) {
      alert('Vui lòng nhập đầy đủ thông tin.');
      return;
    }

    try {
      setLoading(true);
      const response = await userService.login({ email, password });

      if (response.data && response.data.token) {
        const { token, user } = response.data;

        setAuthData({
          token,
          role: user.role,
          username: user.username || user.email.split('@')[0],
        });

        if (user.role === ROLES.ADMIN) {
          alert('Chào mừng chủ quán! Bạn có thể xem doanh thu và quản lý đơn hàng.');
          navigate(ROUTES.ADMIN);
        } else {
          alert('Đăng nhập thành công! Chào mừng bạn đến với Jokopi.');
          navigate(ROUTES.HOME);
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      alert(
        error.response?.data?.message ||
        'Đăng nhập thất bại. Vui lòng kiểm tra email và mật khẩu.'
      );
    } finally {
      setLoading(false);
    }
  };

  const validatePassword = (value) => {
    const hasMinLength = value.length >= 6;
    const hasLowerCase = /[a-z]/.test(value);
    const hasUpperCase = /[A-Z]/.test(value);
    const hasNumber = /\d/.test(value);
    return hasMinLength && hasLowerCase && hasUpperCase && hasNumber;
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setUsername('');
    setConfirmPassword('');
  };

  const handleRegister = async () => {
    if (!username || !email || !password || !confirmPassword) {
      alert('Vui lòng nhập đầy đủ thông tin.');
      return;
    }

    if (!validatePassword(password)) {
      alert(
        'Mật khẩu phải có:\n• Tối thiểu 6 ký tự\n• Ít nhất 1 chữ thường (a-z)\n• Ít nhất 1 chữ HOA (A-Z)\n• Ít nhất 1 số (0-9)\n\nVí dụ: Password123, Cafe2024'
      );
      return;
    }

    if (password !== confirmPassword) {
      alert('Mật khẩu xác nhận không khớp.');
      return;
    }

    try {
      setLoading(true);
      const response = await userService.register({
        username,
        email,
        password,
        role: ROLES.CUSTOMER,
      });

      if (response.data) {
        alert('Đăng ký thành công! Vui lòng đăng nhập.');
        resetForm();
        setIsRegister(false);
      }
    } catch (error) {
      console.error('Register error:', error);
      alert(
        error.response?.data?.message ||
        'Đăng ký thất bại. Email có thể đã được sử dụng.'
      );
    } finally {
      setLoading(false);
    }
  };

  const openLoginPanel = () => {
    resetForm();
    setIsRegister(false);
  };

  const openRegisterPanel = () => {
    resetForm();
    setIsRegister(true);
  };

  return (
    <div className="login-root">
      <div className="login-aroma login-aroma-left" aria-hidden="true"></div>
      <div className="login-aroma login-aroma-right" aria-hidden="true"></div>
      <div className="login-grain" aria-hidden="true"></div>

      <div className="login-scene">
        <Link className="login-back" to={ROUTES.HOME}>
          <FiArrowLeft />
          <span>Quay lại trang chủ</span>
        </Link>

        <div className="login-heading">
          <span className="login-heading-kicker">Jokopi Coffee House</span>
          <h1>Đăng nhập như đang bước vào quán cà phê quen của bạn.</h1>
          <p>
            Trang này là một không gian riêng cho đăng nhập và đăng ký, có chuyển động
            qua lại giữa hai bên và giữ rõ tinh thần quán cà phê thủ công.
          </p>
        </div>

        <div className={`auth-container ${isRegister ? 'right-panel-active' : ''}`} id="container">
          <div className="form-container sign-up-container">
            <form
              className="auth-form"
              onSubmit={(event) => {
                event.preventDefault();
                handleRegister();
              }}
            >
              <span className="auth-kicker">Khách mới của Jokopi</span>
              <h1>Tạo tài khoản để giữ hương vị quen</h1>
              <p className="auth-copy">
                Đăng ký để đặt món sớm, lưu bàn yêu thích và nhận thông báo về workshop
                pha chế mỗi tuần.
              </p>

              <div className="social-container">
                {socialEntries.map((entry) => (
                  <button
                    key={entry.label}
                    className="social-btn"
                    type="button"
                    aria-label={entry.label}
                  >
                    {entry.icon}
                  </button>
                ))}
              </div>

              <div className="auth-divider">
                <span>hoặc đăng ký bằng email</span>
              </div>

              <input
                className="auth-input"
                type="text"
                placeholder="Tên khách"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                autoComplete="username"
              />
              <input
                className="auth-input"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
              />
              <input
                className="auth-input"
                type="password"
                placeholder="Mật khẩu"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="new-password"
              />
              <input
                className="auth-input"
                type="password"
                placeholder="Xác nhận mật khẩu"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                autoComplete="new-password"
              />

              <div className="auth-helper">
                Mật khẩu nên có ít nhất 6 ký tự, gồm chữ hoa, chữ thường và số.
              </div>

              <button className="action-btn" type="submit" disabled={loading}>
                {loading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
              </button>

              <div className="auth-footnote">
                <FiCoffee />
                <span>Khách mới sẽ nhận được menu gợi ý và góc ngồi phù hợp ngay lần đầu.</span>
              </div>
            </form>
          </div>

          <div className="form-container sign-in-container">
            <form
              className="auth-form"
              onSubmit={(event) => {
                event.preventDefault();
                handleLogin();
              }}
            >
              <span className="auth-kicker">Khách quen quay lại</span>
              <h1>Đăng nhập để tiếp tục ly cà phê đang chờ</h1>
              <p className="auth-copy">
                Theo dõi đơn đang chuẩn bị, lịch sử món ruột và ưu đãi theo mùa của quán.
              </p>

              <div className="social-container">
                {socialEntries.map((entry) => (
                  <button
                    key={entry.label}
                    className="social-btn"
                    type="button"
                    aria-label={entry.label}
                  >
                    {entry.icon}
                  </button>
                ))}
              </div>

              <div className="auth-divider">
                <span>hoặc dùng email của bạn</span>
              </div>

              <input
                className="auth-input"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
              />
              <input
                className="auth-input"
                type="password"
                placeholder="Mật khẩu"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
              />

              <button className="auth-link" type="button">
                Quên mật khẩu? Hãy liên hệ quầy để được hỗ trợ nhanh.
              </button>

              <button className="action-btn" type="submit" disabled={loading}>
                {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </button>

              <div className="auth-footnote">
                <FiStar />
                <span>Khách quen có thể xem đơn cũ, tích điểm và nhận ưu đãi trong ngày.</span>
              </div>
            </form>
          </div>

          <div className="overlay-container">
            <div className="overlay">
              <div className="overlay-panel overlay-left">
                <div
                  className="overlay-art"
                  style={{ backgroundImage: `url(${coffeeInteriorImage})` }}
                ></div>
                <span className="overlay-kicker">Quầy quen đã sẵn sàng</span>
                <h1>Ly cà phê của bạn vẫn đang nóng.</h1>
                <p>
                  Đăng nhập để mở lại đơn cũ, giữ chỗ ngồi quen và xem các ưu đãi dành riêng
                  cho khách trở lại quán.
                </p>
                <div className="overlay-highlights">
                  <span><FiClock /> Đặt món nhanh</span>
                  <span><FiMapPin /> Giữ bàn quen</span>
                  <span><FiStar /> Theo dõi ưu đãi</span>
                </div>
                <button className="ghost" type="button" onClick={openLoginPanel}>
                  Đăng nhập
                </button>
              </div>

              <div className="overlay-panel overlay-right">
                <div
                  className="overlay-art overlay-art-alt"
                  style={{ backgroundImage: `url(${coffeeHeroImage})` }}
                ></div>
                <span className="overlay-kicker">Lối vào cho khách mới</span>
                <h1>Bắt đầu hành trình ghé quán mỗi ngày.</h1>
                <p>
                  Tạo tài khoản để lưu món ruột, săn ưu đãi theo mùa và nhận thông báo sự kiện
                  cà phê ngay khi quán mở lịch mới.
                </p>
                <div className="overlay-highlights">
                  <span><FiCoffee /> Lưu món yêu thích</span>
                  <span><FiClock /> Nhận nhắc lịch mới</span>
                  <span><FiMapPin /> Khám phá không gian</span>
                </div>
                <button className="ghost" type="button" onClick={openRegisterPanel}>
                  <span>Tạo tài khoản</span>
                  <FiArrowRight />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
