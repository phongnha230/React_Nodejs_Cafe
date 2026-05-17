import React, { useState, useEffect } from 'react'
import { buildQrImageUrl } from '../../../utils/tableSession.js'
import { Pagination } from '../../../components/common/Pagination.jsx'

const TABLE_STATUSES = [
  { value: 'available', label: 'Trong' },
  { value: 'occupied', label: 'Dang co khach' },
  { value: 'reserved', label: 'Da dat' },
  { value: 'inactive', label: 'Tam khoa' },
]

const escapeHtml = (value) => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;')

const openQrPreview = ({ tableNumber, qrUrl, menuUrl }) => {
  const safeTableNumber = escapeHtml(tableNumber)
  const safeQrUrl = escapeHtml(qrUrl)
  const safeMenuUrl = escapeHtml(menuUrl)
  const html = `<!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>QR Ban ${safeTableNumber}</title>
        <style>
          * { box-sizing: border-box; }
          body {
            font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            padding: 24px;
            background: #f8fafc;
            color: #1e293b;
          }
          .card {
            width: min(350px, 100%);
            background: white;
            padding: 32px;
            border-radius: 24px;
            box-shadow: 0 10px 24px rgba(15, 23, 42, 0.12);
            text-align: center;
          }
          h2 { margin: 0 0 10px; font-size: 28px; }
          p { color: #64748b; font-size: 14px; margin: 0 0 18px; }
          img {
            width: 250px;
            height: 250px;
            max-width: 100%;
            margin: 8px 0 18px;
            border: 1px solid #f1f5f9;
            padding: 10px;
            border-radius: 12px;
            background: white;
          }
          .url {
            font-size: 10px;
            color: #94a3b8;
            margin-bottom: 20px;
            word-break: break-all;
          }
          button {
            padding: 12px 24px;
            background: #6366f1;
            color: white;
            border: 0;
            border-radius: 12px;
            font-weight: 700;
            cursor: pointer;
          }
          @media print {
            body { background: white; padding: 0; }
            .card { box-shadow: none; }
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="card">
          <h2>Ban ${safeTableNumber}</h2>
          <p>Quet de xem thuc don va goi mon</p>
          <img src="${safeQrUrl}" alt="QR Ban ${safeTableNumber}" />
          <div class="url">${safeMenuUrl}</div>
          <button onclick="window.print()">IN MA QR NAY</button>
        </div>
      </body>
    </html>`

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const popup = window.open(url, '_blank', 'width=450,height=600')

  if (!popup) {
    URL.revokeObjectURL(url)
    return
  }

  setTimeout(() => URL.revokeObjectURL(url), 60_000)
}

export function TablesTab({
  sortedTables,
  tableStats,
  loadingTables,
  loadTables,
  createTable,
  updateTable,
  removeTable,
  qrLinksByTableNumber,
  loadQrLinks,
  printTableQRCodes,
  activeOrdersByTable,
  onViewOrders
}) {
  const getTableStatusText = (status) => {
    return TABLE_STATUSES.find((item) => item.value === status)?.label || status || 'Khong ro'
  }

  const [editingId, setEditingId] = useState(null)
  const [editingNumber, setEditingNumber] = useState('')
  const [savingTableId, setSavingTableId] = useState(null)

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [sortedTables]);

  const totalPages = Math.ceil(sortedTables.length / itemsPerPage);
  const currentTables = sortedTables.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const nextTableNumber = sortedTables.reduce(
    (max, table) => Math.max(max, Number(table.table_number) || 0),
    0
  ) + 1

  const getErrorMessage = (error) => (
    error?.response?.data?.message ||
    error?.response?.data?.errors ||
    error?.message ||
    'Thao tac that bai'
  )

  const handleCreateTable = async (event) => {
    event.preventDefault()
    const form = event.currentTarget
    const tableNumber = Number(form.table_number.value)
    const status = form.status.value

    if (!Number.isInteger(tableNumber) || tableNumber <= 0) {
      alert('So ban phai la so nguyen duong')
      return
    }

    try {
      setSavingTableId('new')
      await createTable({ table_number: tableNumber, status })
      form.reset()
      form.table_number.value = String(tableNumber + 1)
    } catch (error) {
      alert(getErrorMessage(error))
    } finally {
      setSavingTableId(null)
    }
  }

  const handleUpdateStatus = async (table, status) => {
    try {
      setSavingTableId(table.id)
      await updateTable(table.id, { status })
    } catch (error) {
      alert(getErrorMessage(error))
    } finally {
      setSavingTableId(null)
    }
  }

  const startEditing = (table) => {
    setEditingId(table.id)
    setEditingNumber(String(table.table_number))
  }

  const saveTableNumber = async (table) => {
    const tableNumber = Number(editingNumber)

    if (!Number.isInteger(tableNumber) || tableNumber <= 0) {
      alert('So ban phai la so nguyen duong')
      return
    }

    try {
      setSavingTableId(table.id)
      await updateTable(table.id, { table_number: tableNumber })
      setEditingId(null)
      setEditingNumber('')
    } catch (error) {
      alert(getErrorMessage(error))
    } finally {
      setSavingTableId(null)
    }
  }

  const handleDeleteTable = async (table) => {
    if (!confirm(`Xoa Ban ${table.table_number}? Ban da co order se khong xoa duoc, hay chuyen sang Tam khoa.`)) {
      return
    }

    try {
      setSavingTableId(table.id)
      await removeTable(table.id)
    } catch (error) {
      alert(getErrorMessage(error))
    } finally {
      setSavingTableId(null)
    }
  }

  return (
    <div className="dashboard-section">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}
      >
        <div>
          <h3>Quan ly Ban & QR Order</h3>
          <p style={{ margin: '6px 0 0', color: '#64748b' }}>
            He thong tu dong tao ma QR co chu ky cho tung ban de khach goi mon.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className="btn secondary"
            onClick={async () => {
              await loadTables()
              await loadQrLinks().catch(() => {})
            }}
            style={{ fontSize: '13px', padding: '8px 16px' }}
          >
            Lam moi
          </button>
          <button
            className="btn"
            onClick={printTableQRCodes}
            style={{ fontSize: '13px', padding: '8px 16px' }}
          >
            In Tat Ca QR (Dan Ban)
          </button>
        </div>
      </div>

      <div className="table-status-grid">
        <div className="table-status-card">
          <div className="table-status-value">{tableStats.total}</div>
          <div className="table-status-label">Tong ban</div>
        </div>
        <div className="table-status-card available">
          <div className="table-status-value">{tableStats.available}</div>
          <div className="table-status-label">Ban trong</div>
        </div>
        <div className="table-status-card occupied">
          <div className="table-status-value">{tableStats.occupied}</div>
          <div className="table-status-label">Dang co khach</div>
        </div>
        <div className="table-status-card inactive">
          <div className="table-status-value">{tableStats.inactive}</div>
          <div className="table-status-label">Tam khoa</div>
        </div>
      </div>

      <form
        className="newsletter-form table-admin-form"
        onSubmit={handleCreateTable}
        style={{ marginTop: '20px' }}
      >
        <input
          name="table_number"
          type="number"
          min="1"
          defaultValue={nextTableNumber}
          placeholder="So ban"
          className="newsletter-input"
        />
        <select name="status" className="newsletter-input" defaultValue="available">
          {TABLE_STATUSES.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
        <button className="btn" disabled={savingTableId === 'new'}>
          {savingTableId === 'new' ? 'Dang them...' : 'Them ban'}
        </button>
      </form>

      {loadingTables ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <p>Dang tai danh sach ban...</p>
        </div>
      ) : (
        <>
          <table className="table" style={{ marginTop: '20px' }}>
            <thead>
              <tr>
                <th>So Ban</th>
                <th>Trang Thai</th>
                <th>Don Dang Mo</th>
                <th>QR Code (Xem/In)</th>
                <th>Thao Tac</th>
              </tr>
            </thead>
            <tbody>
              {sortedTables.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                    Chua co du lieu ban
                  </td>
                </tr>
              ) : (
                currentTables.map((table) => {
                  const activeOrders = activeOrdersByTable[table.id] || []
                  const signedQr = qrLinksByTableNumber?.[table.table_number]
                  const menuUrl = signedQr?.menu_url || '#'
                  const qrUrl = signedQr?.menu_url ? buildQrImageUrl(signedQr.menu_url) : null

                  return (
                    <tr key={table.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div
                            style={{
                              width: '32px',
                              height: '32px',
                              background: '#f1f5f9',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: '700',
                              fontSize: '14px'
                            }}
                          >
                            {table.table_number}
                          </div>
                          {editingId === table.id ? (
                            <input
                              type="number"
                              min="1"
                              value={editingNumber}
                              onChange={(event) => setEditingNumber(event.target.value)}
                              className="newsletter-input"
                              style={{ width: '110px', minHeight: '38px' }}
                            />
                          ) : (
                            <strong>Ban {table.table_number}</strong>
                          )}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span className={`table-state-badge ${table.status}`}>
                            {getTableStatusText(table.status)}
                          </span>
                          <select
                            className="newsletter-input"
                            value={table.status}
                            disabled={savingTableId === table.id}
                            onChange={(event) => handleUpdateStatus(table, event.target.value)}
                            style={{ minWidth: '145px', minHeight: '38px', padding: '8px 10px' }}
                          >
                            {TABLE_STATUSES.map((status) => (
                              <option key={status.value} value={status.value}>
                                {status.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td>
                        {activeOrders.length > 0 ? (
                          <span style={{ color: '#f59e0b', fontWeight: '600' }}>
                            {activeOrders.length} don hang
                          </span>
                        ) : (
                          <span style={{ color: '#94a3b8' }}>-</span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {qrUrl ? (
                            <img
                              src={qrUrl}
                              alt={`QR Ban ${table.table_number}`}
                              style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '8px',
                                border: '1px solid #e2e8f0',
                                cursor: 'pointer',
                                padding: '2px',
                                background: 'white'
                              }}
                              onClick={() => {
                                openQrPreview({
                                  tableNumber: table.table_number,
                                  qrUrl,
                                  menuUrl,
                                })
                              }}
                            />
                          ) : (
                            <button
                              className="btn secondary"
                              style={{ fontSize: '12px', padding: '6px 10px' }}
                              onClick={() => loadQrLinks()}
                            >
                              Tai QR
                            </button>
                          )}
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '12px', fontWeight: '600', color: '#475569' }}>
                              {qrUrl ? 'Nhap de phong to' : 'Can tai signed QR'}
                            </span>
                            {qrUrl ? (
                              <a
                                href={menuUrl}
                                target="_blank"
                                rel="noreferrer"
                                style={{ fontSize: '11px', color: '#6366f1', textDecoration: 'none' }}
                              >
                                Thuc don ban {table.table_number} ↗
                              </a>
                            ) : (
                              <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                                Chua co signed URL
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {editingId === table.id ? (
                            <>
                              <button
                                className="btn"
                                style={{ fontSize: '12px', padding: '6px 12px' }}
                                onClick={() => saveTableNumber(table)}
                                disabled={savingTableId === table.id}
                              >
                                Luu
                              </button>
                              <button
                                className="btn secondary"
                                style={{ fontSize: '12px', padding: '6px 12px' }}
                                onClick={() => {
                                  setEditingId(null)
                                  setEditingNumber('')
                                }}
                              >
                                Huy
                              </button>
                            </>
                          ) : (
                            <button
                              className="btn"
                              style={{ fontSize: '12px', padding: '6px 12px' }}
                              onClick={() => startEditing(table)}
                            >
                              Sua
                            </button>
                          )}
                          <button
                            className="btn secondary"
                            style={{ fontSize: '12px', padding: '6px 12px' }}
                            onClick={() => onViewOrders(table.id)}
                          >
                            Xem don
                          </button>
                          <button
                            className="btn secondary"
                            style={{ fontSize: '12px', padding: '6px 12px', color: '#b91c1c' }}
                            onClick={() => handleDeleteTable(table)}
                            disabled={savingTableId === table.id}
                          >
                            Xoa
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
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
