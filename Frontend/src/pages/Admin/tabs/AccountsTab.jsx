import React, { useState, useEffect } from 'react'
import userService from '../../../services/userService.js'
import { formatDateTime, formatDate } from './utils.js'
import { Pagination } from '../../../components/common/Pagination.jsx'

export function AccountsTab({ users, usersLoading, loadUsers, removeUser }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [users]);

  const customers = users.filter(u => u.role !== 'admin');
  const totalPages = Math.ceil(customers.length / itemsPerPage);
  const currentCustomers = customers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleDeleteUser = async (userId) => {
    if (!confirm('Bạn chắc chắn muốn xóa tài khoản này?')) return
    try {
      await removeUser(userId)
      alert('Xóa tài khoản thành công!')
      await loadUsers() 
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('Có lỗi xảy ra khi xóa tài khoản')
    }
  }

  return (
    <div className="dashboard-section">
      <h3>Quản lý đăng nhập</h3>

      <form
        className="newsletter-form account-form"
        onSubmit={async (e) => {
          e.preventDefault()
          const f = e.currentTarget
          const username = f.username.value.trim()
          const email = f.email.value.trim()
          const password = f.password.value.trim()
          const role = f.role.value

          if (!username || !email || !password) {
            alert('Vui lòng điền đầy đủ thông tin!')
            return
          }

          try {
            await userService.create({
              username,
              email,
              password,
              role,
            })
            alert('Tạo tài khoản thành công!')
            f.reset()
            loadUsers()
          } catch (error) {
            console.error('Error creating user:', error)
            alert(error.response?.data?.message || 'Có lỗi xảy ra khi tạo tài khoản')
          }
        }}
        style={{ marginBottom: '20px' }}
      >
        <input
          name="username"
          placeholder="Tên người dùng"
          className="newsletter-input"
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          className="newsletter-input"
        />
        <input
          name="password"
          type="password"
          placeholder="Mật khẩu"
          className="newsletter-input"
        />
        <select name="role" className="newsletter-input">
          <option value="customer">Customer</option>
          <option value="admin">Admin</option>
          <option value="staff">Staff</option>
          <option value="barista">Barista</option>
        </select>
        <button className="btn">Thêm tài khoản</button>
      </form>

      {usersLoading ? (
        <div style={{ textAlign: 'center', padding: '20px', background: '#f7f7f7' }}>
          <p>Đang tải dữ liệu...</p>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: '20px' }}>
            <p style={{ fontSize: '14px', color: '#666' }}>
              Tổng số tài khoản: <strong>{users.length}</strong> (
              <span style={{ color: '#6B4CE6' }}>
                {users.filter(u => u.role === 'admin').length} admin
              </span>
              {' | '}
              <span style={{ color: '#4CAF50' }}>
                {users.filter(u => u.role === 'customer').length} customer
              </span>
              )
            </p>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Email</th>
                <th>Tên</th>
                <th>Role</th>
                <th>Lượt truy cập</th>
                <th>Đăng nhập cuối</th>
                <th>Ngày tạo</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {customers.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    style={{ textAlign: 'center', padding: '20px' }}
                  >
                    Chưa có tài khoản customer nào
                  </td>
                </tr>
              ) : (
                currentCustomers.map((user) => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>{user.email}</td>
                      <td>{user.name || user.username || 'N/A'}</td>
                      <td>
                        <span
                          style={{
                            padding: '4px 12px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            backgroundColor:
                              user.role === 'admin' ? '#6B4CE6' : '#4CAF50',
                            color: 'white',
                          }}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td>
                        <strong>{user.loginCount || user.login_count || 0}</strong> lần
                      </td>
                      <td style={{ fontSize: '13px' }}>
                        {formatDateTime(user.lastLoginAt || user.last_login_at)}
                      </td>
                      <td style={{ fontSize: '13px' }}>
                        {formatDate(user.createdAt || user.created_at)}
                      </td>
                      <td>
                        <button
                          className="btn secondary"
                          style={{ fontSize: '12px', padding: '4px 12px' }}
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
          
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </>
      )}
    </div>
  )
}
