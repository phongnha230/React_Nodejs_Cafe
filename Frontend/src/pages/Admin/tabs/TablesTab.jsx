import React from 'react'
import { buildQrImageUrl } from '../../../utils/tableSession.js'

export function TablesTab({
  sortedTables,
  tableStats,
  loadingTables,
  loadTables,
  qrLinksByTableNumber,
  loadQrLinks,
  printTableQRCodes,
  activeOrdersByTable,
  onViewOrders
}) {
  const getTableStatusText = (status) => {
    const statuses = {
      available: 'Trong',
      occupied: 'Dang co khach',
      reserved: 'Da dat',
      inactive: 'Tam khoa',
    }
    return statuses[status] || status || 'Khong ro'
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
                sortedTables.map((table) => {
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
                          <strong>Ban {table.table_number}</strong>
                        </div>
                      </td>
                      <td>
                        <span className={`table-state-badge ${table.status}`}>
                          {getTableStatusText(table.status)}
                        </span>
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
                                const popup = window.open('', '_blank', 'width=450,height=600')
                                if (!popup) return
                                popup.document.write(`
                                  <html>
                                    <head>
                                      <meta charset="utf-8" />
                                      <title>QR Ban ${table.table_number}</title>
                                      <style>
                                        body { font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f8fafc; }
                                        .card { background: white; padding: 40px; border-radius: 24px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); text-align: center; max-width: 350px; }
                                        h2 { margin: 0 0 10px; color: #1e293b; }
                                        img { width: 250px; height: 250px; margin: 20px 0; border: 1px solid #f1f5f9; padding: 10px; border-radius: 12px; }
                                        p { color: #64748b; font-size: 14px; margin-bottom: 24px; }
                                        button { padding: 12px 24px; background: #6366f1; color: white; border: none; border-radius: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
                                        button:hover { background: #4f46e5; transform: translateY(-1px); }
                                        @media print { button { display: none; } body { background: white; } .card { box-shadow: none; } }
                                      </style>
                                    </head>
                                    <body>
                                      <div class="card">
                                        <h2>Ban ${table.table_number}</h2>
                                        <p>Quet de xem thuc don va goi mon</p>
                                        <img src="${qrUrl}" />
                                        <div style="font-size: 10px; color: #cbd5e1; margin-bottom: 20px; word-break: break-all;">${menuUrl}</div>
                                        <button onclick="window.print()">IN MA QR NAY</button>
                                      </div>
                                    </body>
                                  </html>
                                `)
                                popup.document.close()
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
                        <button
                          className="btn secondary"
                          style={{ fontSize: '12px', padding: '6px 12px' }}
                          onClick={() => onViewOrders(table.id)}
                        >
                          Xem don
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </>
      )}
    </div>
  )
}
