import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../../stores/authStore.js'
import userService from '../../../services/userService.js'
import { ROLES } from '../../../constants/roles'
import { ROUTES } from '../../../config/routes'

function validatePassword(value) {
  const hasMinLength = value.length >= 6
  const hasLowerCase = /[a-z]/.test(value)
  const hasUpperCase = /[A-Z]/.test(value)
  const hasNumber = /\d/.test(value)
  return hasMinLength && hasLowerCase && hasUpperCase && hasNumber
}

export function useLoginRegisterForm() {
  const setAuthData = useAuthStore((state) => state.setAuthData)
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const [loading, setLoading] = useState(false)

  const resetForm = () => {
    setEmail('')
    setPassword('')
    setUsername('')
    setConfirmPassword('')
  }

  const handleLogin = async () => {
    if (!email || !password) {
      alert('Vui lòng nhập đầy đủ thông tin.')
      return
    }

    try {
      setLoading(true)
      const response = await userService.login({ email, password })

      if (response.data && response.data.token) {
        const { token, user } = response.data

        setAuthData({
          token,
          role: user.role,
          username: user.username || user.email.split('@')[0],
        })

        if (user.role === ROLES.ADMIN) {
          alert('Chào mừng chủ quán! Bạn có thể xem doanh thu và quản lý đơn hàng.')
          navigate(ROUTES.ADMIN)
        } else if (user.role === ROLES.STAFF || user.role === ROLES.BARISTA) {
          alert('Đăng nhập thành công! Bạn có thể xử lý đơn hàng.')
          navigate(`${ROUTES.ADMIN}/orders`)
        } else {
          alert('Đăng nhập thành công! Chào mừng bạn đến với Jokopi.')
          navigate(ROUTES.HOME)
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

  const handleRegister = async () => {
    if (!username || !email || !password || !confirmPassword) {
      alert('Vui lòng nhập đầy đủ thông tin.')
      return
    }

    if (!validatePassword(password)) {
      alert(
        'Mật khẩu phải có:\n- Tối thiểu 6 ký tự\n- Ít nhất 1 chữ thường (a-z)\n- Ít nhất 1 chữ HOA (A-Z)\n- Ít nhất 1 số (0-9)\n\nVí dụ: Password123, Cafe2024'
      )
      return
    }

    if (password !== confirmPassword) {
      alert('Mật khẩu xác nhận không khớp.')
      return
    }

    try {
      setLoading(true)
      const response = await userService.register({
        username,
        email,
        password,
        role: ROLES.CUSTOMER,
      })

      if (response.data) {
        alert('Đăng ký thành công! Vui lòng đăng nhập.')
        resetForm()
        setIsRegister(false)
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

  const switchMode = (register) => {
    resetForm()
    setIsRegister(register)
  }

  const submit = async () => {
    if (isRegister) {
      await handleRegister()
    } else {
      await handleLogin()
    }
  }

  return {
    email,
    setEmail,
    password,
    setPassword,
    username,
    setUsername,
    confirmPassword,
    setConfirmPassword,
    isRegister,
    loading,
    switchMode,
    submit,
  }
}
