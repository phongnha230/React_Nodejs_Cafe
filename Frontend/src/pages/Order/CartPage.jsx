import { useEffect, useState } from 'react';
import { useCartStore } from '../../stores/cartStore.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useOrderStore } from '../../stores/orderStore.js';
import paymentService from '../../services/paymentService.js';
import tableService from '../../services/tableService.js';
import { clearTableSession, getTableSession } from '../../utils/tableSession.js';

const genId = () =>
  crypto?.randomUUID
    ? crypto.randomUUID()
    : `o_${Date.now()}_${Math.random().toString(36).slice(2)}`;

export function CartPage() {
  const items = useCartStore((state) => state.detailed());
  const total = useCartStore((state) => state.total());
  const add = useCartStore((state) => state.add);
  const remove = useCartStore((state) => state.remove);
  const clear = useCartStore((state) => state.clear);
  const { customerName, isCustomer } = useAuth();
  const displayName = customerName ?? 'Khach vang lai';
  const place = useOrderStore((state) => state.place);
  const placeGuest = useOrderStore((state) => state.placeGuest);

  const [showPayment, setShowPayment] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState('direct');
  const [tables, setTables] = useState([]);
  const [tablesLoading, setTablesLoading] = useState(false);
  const [selectedTableId, setSelectedTableId] = useState('');
  const [guestName, setGuestName] = useState('');
  const [qrError, setQrError] = useState('');

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const qrTableSession = getTableSession();
  const qrTableNumber = Number(qrTableSession?.tableNumber || 0);
  const qrTimestamp = Number(qrTableSession?.ts || 0);
  const qrSignature = qrTableSession?.sig || null;
  const orderableTables = tables.filter((table) => ['available', 'occupied'].includes(table.status));
  const qrMatchedTable = qrTableNumber > 0
    ? tables.find((table) => Number(table.table_number) === qrTableNumber)
    : null;
  const isQrMode = Boolean(qrMatchedTable);
  const selectableTables = isQrMode
    ? tables.filter((table) => table.id === qrMatchedTable?.id)
    : orderableTables;
  const selectedTable = selectableTables.find((table) => String(table.id) === String(selectedTableId));

  const renderTableOptions = () => {
    if (tablesLoading) {
      return <option value="">Dang tai danh sach ban...</option>;
    }

    if (selectableTables.length === 0) {
      return <option value="">Chua co ban nhan order</option>;
    }

    return selectableTables.map((table) => (
      <option key={table.id} value={table.id}>
        Ban {table.table_number}
      </option>
    ));
  };

  useEffect(() => {
    let mounted = true;

    const loadTables = async () => {
      setTablesLoading(true);
      try {
        const response = await tableService.getAll();
        const payload = response.data;
        const apiTables = Array.isArray(payload) ? payload : (payload?.data || []);

        if (!mounted) return;

        setTables(apiTables);

        if (qrTableNumber > 0) {
          const matchedTable = apiTables.find((table) => Number(table.table_number) === qrTableNumber);
          if (matchedTable && ['available', 'occupied'].includes(matchedTable.status)) {
            setSelectedTableId(String(matchedTable.id));
            setQrError('');
          } else {
            clearTableSession();
            setQrError(`QR cua Ban ${qrTableNumber} hien khong con hop le hoac ban nay khong the nhan order.`);
            alert(`Ban ${qrTableNumber} hien khong the nhan order QR.`);
          }
          return;
        }

        const firstOrderableTable = apiTables.find((table) => ['available', 'occupied'].includes(table.status));
        setSelectedTableId((current) => {
          const currentIsOrderable = apiTables.some(
            (table) => ['available', 'occupied'].includes(table.status) && String(table.id) === String(current)
          );

          if (currentIsOrderable) {
            return current;
          }

          return firstOrderableTable ? String(firstOrderableTable.id) : '';
        });
      } catch (error) {
        console.error('Load tables failed:', error);
      } finally {
        if (mounted) {
          setTablesLoading(false);
        }
      }
    };

    loadTables();

    return () => {
      mounted = false;
    };
  }, [qrTableNumber]);

  useEffect(() => {
    if (!isCustomer) {
      setSelectedPayment('direct');
    }
  }, [isCustomer]);

  const getFriendlyGuestOrderError = (error) => {
    const message = String(
      error?.response?.data?.message ||
      error?.response?.data?.errors ||
      error?.message ||
      ''
    ).toLowerCase();

    if (message.includes('expired')) {
      return 'Ma QR nay da het han. Vui long quet lai ma QR tai ban de tiep tuc dat mon.';
    }

    if (
      message.includes('signature') ||
      message.includes('timestamp') ||
      message.includes('invalid qr')
    ) {
      return 'Ma QR khong hop le hoac da bi thay doi. Vui long quet lai ma QR goc tai ban.';
    }

    if (message.includes('not available') || message.includes('inactive')) {
      return 'Ban nay hien khong the nhan order. Vui long lien he nhan vien hoac quet lai ma QR khac.';
    }

    return error?.response?.data?.message || 'Dat hang that bai. Vui long thu lai.';
  };

  const checkout = () => {
    if (items.length === 0) return;
    if (!isQrMode && orderableTables.length === 0) {
      alert('Chua co ban nao co the nhan order');
      return;
    }
    if (!selectedTable) {
      alert('Vui long chon ban');
      return;
    }
    setQrError('');
    setShowPayment(true);
  };

  const confirmPayment = async () => {
    if (!selectedTable) {
      alert('Vui long chon ban');
      return;
    }

    if (!isCustomer && (!Number.isInteger(qrTimestamp) || qrTimestamp <= 0 || !qrSignature)) {
      setQrError('Ma QR nay khong day du thong tin xac thuc. Vui long quet lai ma QR tai ban.');
      return;
    }

    const tableLabel = `Ban ${selectedTable.table_number}`;
    const resolvedGuestName = String(guestName || '').trim() || 'Khach QR';
    const order = {
      id: genId(),
      customerName: isCustomer ? displayName : resolvedGuestName,
      items: items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        product: item.product,
      })),
      total,
      createdAt: new Date().toISOString(),
      paymentMethod: selectedPayment,
      tableId: selectedTable.id,
      tableNumber: selectedTable.table_number,
      qrTimestamp,
      qrSignature,
      address: tableLabel,
    };

    try {
      const orderId = isCustomer
        ? await place(order)
        : await placeGuest(order);

      if (isCustomer) {
        try {
          await paymentService.create({
            order_id: orderId,
            amount: total,
            method: selectedPayment === 'direct' ? 'cash' : selectedPayment,
            status: 'completed',
            transaction_id: selectedPayment !== 'direct' ? `TXN-${Date.now()}` : null,
          });
        } catch (error) {
          console.error('Failed to create payment record:', error);
        }
      }

      clear();
      setShowPayment(false);
      setGuestName('');
      setQrError('');

      if (selectedPayment === 'direct') {
        const popup = window.open('', '_blank');
        const lines = items
          .map(
            (item) =>
              `\n${item.product.name} x${item.quantity} - ${(
                item.product.price * item.quantity
              ).toLocaleString('vi-VN')}d`
          )
          .join('');

        const html = `<!doctype html><html><head><meta charset="utf-8"><title>Hoa don</title></head><body>
          <pre style="font:14px/1.6 system-ui, -apple-system, Segoe UI, Roboto">CAFE APP\n------------------------------\nKhach: ${
            order.customerName
          }\nBan: ${order.address}\nThoi gian: ${new Date(order.createdAt).toLocaleString(
            'vi-VN'
          )}\n\nMat hang:${lines}\n\nTong tien: ${total.toLocaleString(
            'vi-VN'
          )}d\nPhuong thuc: Truc tiep\n\nCam on quy khach!</pre>
          <script>window.onload=()=>{window.print(); setTimeout(()=>window.close(), 300);}</script>
        </body></html>`;

        popup.document.write(html);
        popup.document.close();
      } else {
        alert('Thanh toan online da ghi nhan!');
      }
    } catch (error) {
      console.error('Order creation failed:', error);
      const friendlyError = getFriendlyGuestOrderError(error);
      if (!isCustomer) {
        setQrError(friendlyError);
      }
      alert('Dat hang that bai: ' + friendlyError);
    }
  };

  if (showPayment) {
    return (
      <div className="container">
        <h2>Thanh toan</h2>
        <div className="payment-section">
          <div className="payment-info">
            <h3>Tong tien: {total.toLocaleString('vi-VN')}d</h3>
            {qrError && (
              <div
                style={{
                  marginBottom: '16px',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#991b1b',
                  fontSize: '14px',
                  lineHeight: 1.5,
                }}
              >
                <strong>QR order gap van de:</strong> {qrError}
              </div>
            )}
            <div className="order-summary">
              <h4>Don hang cua ban</h4>
              <div className="order-items">
                {items.map((item) => (
                  <div key={item.productId} className="order-item">
                    <div className="order-item-left">
                      <img src={item.product.image} alt={item.product.name} />
                      <div className="order-item-name">{item.product.name}</div>
                    </div>
                    <div className="order-item-qty">x{item.quantity}</div>
                    <div className="order-item-price">
                      {(item.product.price * item.quantity).toLocaleString('vi-VN')}d
                    </div>
                  </div>
                ))}
              </div>
              <div className="order-total">
                <strong>Tam tinh:</strong> {total.toLocaleString('vi-VN')}d
              </div>
            </div>

            <div className="address-section">
              <label className="address-label">Chon so ban:</label>
              <select
                className="address-input table-select"
                value={selectedTableId}
                onChange={(event) => setSelectedTableId(event.target.value)}
                disabled={tablesLoading || selectableTables.length === 0 || isQrMode}
              >
                {renderTableOptions()}
              </select>
              {isQrMode && selectedTable && (
                <p style={{ marginTop: '8px', color: '#0f766e', fontSize: '14px' }}>
                  QR dang khoa vao Ban {selectedTable.table_number}. Khach khong can chon lai ban.
                </p>
              )}
            </div>

            {!isCustomer && (
              <div className="address-section">
                <label className="address-label">Ten khach:</label>
                <input
                  className="address-input"
                  value={guestName}
                  onChange={(event) => setGuestName(event.target.value)}
                  placeholder="Vi du: Anh Nam"
                />
              </div>
            )}

            <p>Chon phuong thuc thanh toan:</p>
          </div>
          <div className="payment-options">
            <label className="payment-option">
              <input
                type="radio"
                name="payment"
                value="direct"
                checked={selectedPayment === 'direct'}
                onChange={(event) => setSelectedPayment(event.target.value)}
              />
              <div
                className="payment-card"
                style={{
                  background: selectedPayment === 'direct' ? '#ecfeff' : '',
                  borderColor: selectedPayment === 'direct' ? '#06b6d4' : '',
                }}
              >
                <div className="payment-logo">$$</div>
                <span>Truc tiep</span>
              </div>
            </label>
            <label className="payment-option">
              <input
                type="radio"
                name="payment"
                value="vnpay"
                checked={selectedPayment === 'vnpay'}
                onChange={(event) => setSelectedPayment(event.target.value)}
                disabled={!isCustomer}
              />
              <div
                className="payment-card"
                style={!isCustomer ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
              >
                <div className="payment-logo">QR</div>
                <span>VNPay</span>
              </div>
            </label>
          </div>

          {!isCustomer && (
            <p style={{ color: '#92400e', marginTop: '8px' }}>
              Guest QR MVP hien chi mo thanh toan truc tiep. Neu can, toi se noi them luong VNPay/MoMo that sau.
            </p>
          )}

          {selectedPayment !== 'direct' && (
            <div className="qr-section">
              <div className="qr-code">
                {selectedPayment === 'vnpay' ? 'VNPay QR' : 'QR Code'}
              </div>
              <p>Quet ma QR de thanh toan</p>
            </div>
          )}

          <div className="payment-actions">
            <button
              className="btn secondary"
              onClick={() => setShowPayment(false)}
            >
              Quay lai
            </button>
            <button
              className="btn"
              onClick={confirmPayment}
              disabled={tablesLoading || !selectedTable}
            >
              {isCustomer ? 'Xac nhan thanh toan' : 'Gui order cho quan'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h2>Gio hang</h2>
      {items.length === 0 ? (
        <div className="empty-cart">
          <p>Chua co san pham nao trong gio hang.</p>
        </div>
      ) : (
        <>
          <div className="cart-items">
            {items.map((item) => (
              <div key={item.productId} className="cart-item">
                <img
                  className="cart-item-image"
                  src={item.product.image}
                  alt={item.product.name}
                />
                <div className="cart-item-info">
                  <div className="cart-item-price">
                    {item.product.price.toLocaleString('vi-VN')}d
                  </div>
                  <div className="quantity-controls">
                    <button
                      className="qty-btn"
                      onClick={() => remove(item.productId)}
                    >
                      -
                    </button>
                    <span className="qty-display">{item.quantity}</span>
                    <button
                      className="qty-btn"
                      onClick={() => add(item.productId)}
                    >
                      +
                    </button>
                  </div>
                </div>
                <button
                  className="delete-btn"
                  onClick={() => {
                    for (let index = 0; index < item.quantity; index += 1) {
                      remove(item.productId);
                    }
                  }}
                >
                  Xoa
                </button>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <div className="summary-row">
              <label>So luong:</label>
              <input
                type="text"
                value={totalQuantity}
                readOnly
                className="summary-input"
              />
            </div>
            <div className="summary-row summary-total-row">
              <label>Tong tien:</label>
              <div className="total-amount">
                {total.toLocaleString('vi-VN')}d
              </div>
            </div>
            <div className="summary-row table-summary-row">
              <label htmlFor="cart-table-select">Ban:</label>
              <div className="summary-table-control">
                <select
                  id="cart-table-select"
                  className="summary-table-select"
                  value={selectedTableId}
                  onChange={(event) => setSelectedTableId(event.target.value)}
                  disabled={tablesLoading || selectableTables.length === 0 || isQrMode}
                >
                  {renderTableOptions()}
                </select>
                {isQrMode && selectedTable && (
                  <p className="table-helper-text success">
                    QR dang khoa vao Ban {selectedTable.table_number}.
                  </p>
                )}
                {!isQrMode && !tablesLoading && selectedTable && (
                  <p className="table-helper-text">
                    Don nay se gan vao Ban {selectedTable.table_number}.
                  </p>
                )}
                {!isQrMode && !tablesLoading && selectableTables.length === 0 && (
                  <p className="table-helper-text error">
                    Hien chua co ban nao co the nhan order.
                  </p>
                )}
              </div>
            </div>
          </div>

          <button
            className="checkout-btn"
            onClick={checkout}
            disabled={tablesLoading || !selectedTable}
          >
            Thanh toan
          </button>
        </>
      )}
    </div>
  );
}
