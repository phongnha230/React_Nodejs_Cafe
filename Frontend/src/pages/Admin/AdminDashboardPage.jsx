import { useCallback, useEffect, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Sidebar } from '../../components/layout/Sidebar.jsx'
import { useOrderStore } from '../../stores/orderStore.js'
import { useUsersStore } from '../../stores/usersStore.js'
import { useNewsStore } from '../../stores/newsStore.js'
import { useProductStore } from '../../stores/productStore.js'
import { useActivitiesStore } from '../../stores/activitiesStore.js'
import tableService from '../../services/tableService.js'
import { buildQrImageUrl } from '../../utils/tableSession.js'
import {
  getAdminSectionFromPathname,
  getAdminSectionHref,
} from './adminSections.js'
import { getOrderTableNumber } from './tabs/utils.js'

export function AdminDashboard({ sidebarOpen, setSidebarOpen }) {
  const location = useLocation()
  const navigate = useNavigate()
  const activeTab = getAdminSectionFromPathname(location.pathname)

  const [tables, setTables] = useState([])
  const [loadingTables, setLoadingTables] = useState(false)
  const [qrLinksByTableNumber, setQrLinksByTableNumber] = useState({})

  const orders = useOrderStore((s) => s.orders)
  const loadOrders = useOrderStore((s) => s.loadFromAPI)
  const stats = useOrderStore((s) => s.stats())
  const setOrderStatus = useOrderStore((s) => s.updateStatus)

  const users = useUsersStore((s) => s.users)
  const loadUsers = useUsersStore((s) => s.loadFromAPI)
  const removeUser = useUsersStore((s) => s.remove)
  const usersLoading = useUsersStore((s) => s.loading)

  const news = useNewsStore((s) => s.news)
  const loadNews = useNewsStore((s) => s.loadFromAPI)
  const addNews = useNewsStore((s) => s.add)
  const updateNews = useNewsStore((s) => s.update)
  const removeNews = useNewsStore((s) => s.remove)

  const prodList = useProductStore((s) => s.products)
  const loadProducts = useProductStore((s) => s.loadFromAPI)
  const addProduct = useProductStore((s) => s.add)
  const updateProduct = useProductStore((s) => s.update)
  const removeProduct = useProductStore((s) => s.remove)

  const activityItems = useActivitiesStore((s) => s.items)
  const addActivity = useActivitiesStore((s) => s.add)
  const removeActivity = useActivitiesStore((s) => s.remove)

  const loadTables = useCallback(async () => {
    try {
      setLoadingTables(true)
      const response = await tableService.getAll()
      const payload = response.data
      const apiTables = Array.isArray(payload) ? payload : payload?.data || []
      setTables(apiTables)
    } catch (error) {
      console.error('Error loading tables:', error)
    } finally {
      setLoadingTables(false)
    }
  }, [])

  const loadQrLinks = useCallback(async () => {
    try {
      const response = await tableService.getQrLinks()
      const payload = response.data
      const qrLinks = Array.isArray(payload) ? payload : payload?.data || []

      const next = qrLinks.reduce((acc, item) => {
        acc[item.table_number] = item
        return acc
      }, {})

      setQrLinksByTableNumber(next)
      return qrLinks
    } catch (error) {
      console.error('Error loading QR links:', error)
      throw error
    }
  }, [])

  useEffect(() => {
    loadOrders()
    loadNews()
    loadProducts()
    loadTables()
    loadUsers()
    loadQrLinks().catch(() => {})
  }, [loadOrders, loadNews, loadProducts, loadTables, loadUsers, loadQrLinks])

  const sortedTables = tables
    .slice()
    .sort((a, b) => a.table_number - b.table_number)

  const activeOrdersByTable = sortedTables.reduce((acc, table) => {
    const matchingOrders = orders.filter((order) => {
      const orderTableId = order.tableId ?? order.table_id ?? null
      const orderTableNumber = getOrderTableNumber(order)
      const isSameTable =
        String(orderTableId) === String(table.id) ||
        orderTableNumber === table.table_number

      return (
        isSameTable &&
        order.status !== 'delivered' &&
        order.status !== 'cancelled'
      )
    })

    acc[table.id] = matchingOrders
    return acc
  }, {})

  const tableStats = tables.reduce(
    (acc, table) => {
      acc.total += 1
      acc[table.status] = (acc[table.status] || 0) + 1
      return acc
    },
    { total: 0, available: 0, occupied: 0, reserved: 0, inactive: 0 }
  )

  const printTableQRCodes = async () => {
    let qrTables = Object.values(qrLinksByTableNumber)

    if (qrTables.length === 0) {
      try {
        qrTables = await loadQrLinks()
      } catch (error) {
        alert('Khong tai duoc QR signed links. Kiem tra QR_SIGNING_SECRET va dang nhap admin.')
        return
      }
    }

    const popup = window.open('', '_blank', 'width=1100,height=900')
    if (!popup) return

    const cards = qrTables
      .map((table) => {
        const menuUrl = table.menu_url
        const qrUrl = buildQrImageUrl(menuUrl)

        return `
        <div class="qr-card">
          <div class="qr-header">
            <div class="brand-name">CAFE APP</div>
            <div class="table-badge">BÀN ${table.table_number}</div>
          </div>
          <div class="qr-body">
            <img src="${qrUrl}" alt="QR Ban ${table.table_number}" />
          </div>
          <div class="qr-footer">
            <div class="qr-instruction">QUÉT ĐỂ XEM THỰC ĐƠN</div>
            <div class="qr-subtext">Vui lòng chọn món và gọi tại bàn</div>
            <div class="qr-link">${menuUrl}</div>
          </div>
        </div>
      `
      })
      .join('')

    popup.document.write(`<!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>QR Order Table List</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&display=swap" rel="stylesheet">
          <style>
            * { box-sizing: border-box; }
            body { font-family: 'Outfit', sans-serif; margin: 40px; color: #1e293b; background: #f8fafc; }
            @media print { body { background: white; margin: 0; } .no-print { display: none; } }
            .header-info { margin-bottom: 30px; text-align: center; }
            h1 { margin: 0 0 10px; font-size: 32px; font-weight: 700; color: #0f172a; }
            p { margin: 0; color: #64748b; font-size: 16px; }
            .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 30px; }
            .qr-card { background: white; border: 2px solid #e2e8f0; border-radius: 24px; padding: 24px; text-align: center; page-break-inside: avoid; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); display: flex; flex-direction: column; align-items: center; position: relative; overflow: hidden; }
            .qr-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 6px; background: linear-gradient(90deg, #6366f1 0%, #a855f7 100%); }
            .qr-header { display: flex; justify-content: space-between; width: 100%; align-items: center; margin-bottom: 20px; }
            .brand-name { font-weight: 700; font-size: 14px; letter-spacing: 1px; color: #6366f1; }
            .table-badge { background: #f1f5f9; padding: 4px 12px; border-radius: 100px; font-weight: 700; font-size: 14px; color: #475569; }
            .qr-body { background: #f8fafc; padding: 15px; border-radius: 20px; margin-bottom: 20px; }
            .qr-body img { width: 180px; height: 180px; display: block; }
            .qr-instruction { font-size: 18px; font-weight: 700; color: #1e293b; text-transform: uppercase; margin-bottom: 4px; }
            .qr-subtext { font-size: 13px; color: #64748b; margin-bottom: 12px; }
            .qr-link { font-size: 10px; color: #94a3b8; word-break: break-all; padding: 8px; background: #f1f5f9; border-radius: 8px; width: 100%; }
          </style>
        </head>
        <body>
          <div class="header-info">
            <h1>MÃ QR ORDER TẠI BÀN</h1>
            <p>In dán tại bàn để khách hàng gọi món nhanh chóng không cần đăng nhập.</p>
          </div>
          <div class="grid">${cards}</div>
          <script>window.onload = () => { setTimeout(() => { window.print(); }, 500); }</script>
        </body>
      </html>`)
    popup.document.close()
  }

  const handleTabChange = (section) => {
    navigate(getAdminSectionHref(section))
  }

  const navigateToSection = (section, search = '') => {
    const suffix = search ? `?${search}` : ''
    navigate(`${getAdminSectionHref(section)}${suffix}`)
  }

  const outletContext = {
    activeTab,
    orders,
    stats,
    setOrderStatus,
    users,
    loadUsers,
    removeUser,
    usersLoading,
    news,
    addNews,
    updateNews,
    removeNews,
    prodList,
    addProduct,
    updateProduct,
    removeProduct,
    activityItems,
    addActivity,
    removeActivity,
    tables,
    sortedTables,
    tableStats,
    loadingTables,
    loadTables,
    qrLinksByTableNumber,
    loadQrLinks,
    printTableQRCodes,
    activeOrdersByTable,
    navigateToSection,
  }

  return (
    <>
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
      <div className="container">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
          }}
        >
          <h2>Dashboard Quản Lý</h2>
          <button
            onClick={() => {
              if (
                confirm(
                  '⚠️ XÓA TOÀN BỘ DỮ LIỆU GIẢ?\n\nHành động này không thể hoàn tác!'
                )
              ) {
                const keys = [
                  'orders',
                  'products',
                  'news',
                  'customers',
                  'accounts',
                  'activities',
                  'cart',
                ]
                keys.forEach((key) => localStorage.removeItem(key))
                alert('✅ Đã xóa tất cả dữ liệu giả!')
                window.location.reload()
              }
            }}
            className="btn secondary"
            style={{ color: '#dc3545', border: '2px solid #dc3545' }}
          >
            🗑️ Xóa dữ liệu test
          </button>
        </div>
        <Outlet context={outletContext} />
      </div>
    </>
  )
}
