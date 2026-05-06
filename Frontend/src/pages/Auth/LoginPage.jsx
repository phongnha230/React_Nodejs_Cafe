import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore.js';
import userService from '../../services/userService.js';
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
      alert('Vui lòng nh?p d?y d? thông tin')
      return
    }

    try {
      setLoading(true)
      const response = await userService.login({ email, password })

      if (response.data && response.data.token) {
        const { token, user } = response.data

        // Luu token và thông tin user
        setAuthData({
          token,
          role: user.role,
          username: user.username || user.email.split('@')[0],
        })

        // Ði?u hu?ng theo role
        if (user.role === 'admin') {
          alert(
            'Chào m?ng ch? quán! B?n có th? xem doanh thu và qu?n lý don hàng.'
          )
          navigate('/admin')
        } else {
          alert('Ðang nh?p thành công! Chào m?ng b?n d?n v?i jokopi.')
          navigate('/')
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      alert(
        error.response?.data?.message ||
        'Ðang nh?p th?t b?i. Vui lòng ki?m tra email và m?t kh?u.'
      )
    } finally {
      setLoading(false)
    }
  }

  // Ki?m tra password có h?p l? không
  const validatePassword = (pwd) => {
    const hasMinLength = pwd.length >= 6
    const hasLowerCase = /[a-z]/.test(pwd)
    const hasUpperCase = /[A-Z]/.test(pwd)
    const hasNumber = /\d/.test(pwd)
    return hasMinLength && hasLowerCase && hasUpperCase && hasNumber
  }

  // Reset t?t c? các tru?ng khi chuy?n d?i gi?a dang nh?p và dang ký
  const resetForm = () => {
    setEmail('')
    setPassword('')
    setUsername('')
    setConfirmPassword('')
    setPhone('')
  }

  const handleRegister = async () => {
    if (!username || !email || !password || !confirmPassword) {
      alert('Vui lòng nh?p d?y d? thông tin')
      return
    }

    if (!validatePassword(password)) {
      alert(
        'Password ph?i có:\n• T?i thi?u 6 ký t?\n• Ít nh?t 1 ch? thu?ng (a-z)\n• Ít nh?t 1 ch? HOA (A-Z)\n• Ít nh?t 1 s? (0-9)\n\nVí d?: Password123, Cafe2024'
      )
      return
    }

    if (password !== confirmPassword) {
      alert('M?t kh?u xác nh?n không kh?p')
      return
    }

    try {
      setLoading(true)
      const response = await userService.register({
        username,
        email,
        password,
        role: ROLES.CUSTOMER,
      });

      if (response.data) {
        alert('Ðang ký thành công! Vui lòng dang nh?p.');
        resetForm();
        setIsRegister(false);
      }
    } catch (error) {
      console.error('Register error:', error)
      alert(
        error.response?.data?.message ||
        'Ðang ký th?t b?i. Email có th? dã du?c s? d?ng.'
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
