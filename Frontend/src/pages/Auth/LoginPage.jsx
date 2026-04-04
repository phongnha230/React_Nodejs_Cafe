import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore.js';
import userServices from '../../services/usersServices.js';
import { ROLES } from '../../constants/roles';
import { ROUTES } from '../../config/routes';
import { MESSAGES } from '../../constants/messages';

export function LoginPage() {
  const setAuthData = useAuthStore((s) => s.setAuthData)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const [confirmPassword, setConfirmPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async () => {
    if (!email || !password) {
      alert('Vui lòng nhập đầy đủ thông tin')
      return
    }

    try {
      setLoading(true)
      const response = await userServices.login({ email, password })

      if (response.data && response.data.token) {
        const { token, user } = response.data

        // Lưu token và thông tin user
        setAuthData({
          token,
          role: user.role,
          username: user.username || user.email.split('@')[0],
        })

        // Điều hướng theo role
        if (user.role === 'admin') {
          alert(
            'Chào mừng chủ quán! Bạn có thể xem doanh thu và quản lý đơn hàng.'
          )
          navigate('/admin')
        } else {
          alert('Đăng nhập thành công! Chào mừng bạn đến với jokopi.')
          navigate('/')
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      alert(
        error.response?.data?.message ||
        'Đăng nhập thất bại. Vui lòng kiểm tra email và mật khẩu.'
      )
    } finally {
      setLoading(false)
    }
  }

  // Kiểm tra password có hợp lệ không
  const validatePassword = (pwd) => {
    const hasMinLength = pwd.length >= 6
    const hasLowerCase = /[a-z]/.test(pwd)
    const hasUpperCase = /[A-Z]/.test(pwd)
    const hasNumber = /\d/.test(pwd)
    return hasMinLength && hasLowerCase && hasUpperCase && hasNumber
  }

  // Reset tất cả các trường khi chuyển đổi giữa đăng nhập và đăng ký
  const resetForm = () => {
    setEmail('')
    setPassword('')
    setUsername('')
    setConfirmPassword('')
    setPhone('')
  }

  const handleRegister = async () => {
    if (!username || !email || !password || !confirmPassword) {
      alert('Vui lòng nhập đầy đủ thông tin')
      return
    }

    if (!validatePassword(password)) {
      alert(
        'Password phải có:\n• Tối thiểu 6 ký tự\n• Ít nhất 1 chữ thường (a-z)\n• Ít nhất 1 chữ HOA (A-Z)\n• Ít nhất 1 số (0-9)\n\nVí dụ: Password123, Cafe2024'
      )
      return
    }

    if (password !== confirmPassword) {
      alert('Mật khẩu xác nhận không khớp')
      return
    }

    try {
      setLoading(true)
      const response = await userServices.register({
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
      console.error('Register error:', error)
      alert(
        error.response?.data?.message ||
        'Đăng ký thất bại. Email có thể đã được sử dụng.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-root">
      <div className={`auth-container ${isRegister ? 'right-panel-active' : ''}`} id="container">

        {/* Sign Up Container */}
        <div className="form-container sign-up-container">
          <div className="auth-form">
            <h1>Create Account</h1>
            <div className="social-container">
              <a href="#" className="social"><i className="fab fa-facebook-f"></i></a>
              <a href="#" className="social"><i className="fab fa-google-plus-g"></i></a>
              <a href="#" className="social"><i className="fab fa-linkedin-in"></i></a>
            </div>
            <span>or use your email for registration</span>
            <input
              className="auth-input"
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              className="auth-input"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              className="auth-input"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <input
              className="auth-input"
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button className="action-btn" onClick={handleRegister} disabled={loading}>
              {loading ? 'Signing Up...' : 'Sign Up'}
            </button>
          </div>
        </div>

        {/* Sign In Container */}
        <div className="form-container sign-in-container">
          <div className="auth-form">
            <h1>Sign in</h1>
            <div className="social-container">
              <a href="#" className="social"><i className="fab fa-facebook-f"></i></a>
              <a href="#" className="social"><i className="fab fa-google-plus-g"></i></a>
              <a href="#" className="social"><i className="fab fa-linkedin-in"></i></a>
            </div>
            <span>or use your account</span>
            <input
              className="auth-input"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="off"
            />
            <input
              className="auth-input"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
            <a href="#" className="forgot-pass">Forgot your password?</a>
            <button className="action-btn" onClick={handleLogin} disabled={loading}>
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </div>
        </div>

        {/* Overlay Container */}
        <div className="overlay-container">
          <div className="overlay">
            <div className="overlay-panel overlay-left">
              <h1>Welcome Back!</h1>
              <p>To keep connected with us please login with your personal info</p>
              <button className="ghost" onClick={() => { resetForm(); setIsRegister(false); }}>Sign In</button>
            </div>
            <div className="overlay-panel overlay-right">
              <h1>Hello, Friend!</h1>
              <p>Enter your personal details and start journey with us</p>
              <button className="ghost" onClick={() => { resetForm(); setIsRegister(true); }}>Sign Up</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
