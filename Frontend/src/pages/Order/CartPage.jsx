import { useEffect, useState } from 'react';
import { CreditCard, Minus, Plus, QrCode, ReceiptText, ShoppingCart, Trash2, WalletCards } from 'lucide-react';
import { useCartStore } from '../../stores/cartStore.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useOrderStore } from '../../stores/orderStore.js';
import paymentService from '../../services/paymentService.js';
import tableService from '../../services/tableService.js';
import { useVoucherStore } from '../../stores/voucherStore.js';
import { clearTableSession, getTableSession } from '../../utils/tableSession.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const genId = () =>
  crypto?.randomUUID
    ? crypto.randomUUID()
    : `o_${Date.now()}_${Math.random().toString(36).slice(2)}`;

const fieldClass =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 disabled:cursor-not-allowed disabled:opacity-60';

function Field({ label, children, hint, tone = 'default' }) {
  return (
    <div className="mb-6 text-left">
      <label className="mb-2 block font-semibold text-slate-700">{label}</label>
      {children}
      {hint && (
        <p
          className={cn(
            'mt-2 text-sm leading-relaxed',
            tone === 'success' && 'text-teal-700',
            tone === 'error' && 'text-red-700',
            tone === 'default' && 'text-slate-500'
          )}
        >
          {hint}
        </p>
      )}
    </div>
  );
}

export function CartPage() {
  const items = useCartStore((state) => state.detailed());
  const total = useCartStore((state) => state.total());
  const add = useCartStore((state) => state.add);
  const remove = useCartStore((state) => state.remove);
  const clear = useCartStore((state) => state.clear);
  const { customerName, isAdmin, isCustomer, isGuest } = useAuth();
  const displayName = customerName ?? 'Khách vãng lai';
  const isAuthenticatedOrder = isAdmin || isCustomer;
  const place = useOrderStore((state) => state.place);
  const placeGuest = useOrderStore((state) => state.placeGuest);
  const coins = useVoucherStore((state) => state.coins);
  const walletVouchers = useVoucherStore((state) => state.walletVouchers);
  const loadWallet = useVoucherStore((state) => state.loadWallet);

  const [showPayment, setShowPayment] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState('direct');
  const [voucherCode, setVoucherCode] = useState('');
  const [selectedUserVoucherId, setSelectedUserVoucherId] = useState('');
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
  const hasQrSession = qrTableNumber > 0 && Number.isInteger(qrTimestamp) && qrTimestamp > 0 && Boolean(qrSignature);
  const qrMatchedTable = qrTableNumber > 0
    ? tables.find((table) => Number(table.table_number) === qrTableNumber)
    : null;
  const isQrMode = isGuest && hasQrSession && Boolean(qrMatchedTable);
  const selectableTables = isQrMode
    ? tables.filter((table) => table.id === qrMatchedTable?.id)
    : orderableTables;
  const selectedTable = selectableTables.find((table) => String(table.id) === String(selectedTableId));
  const usableWalletVouchers = walletVouchers.filter((entry) => !entry.is_used && entry.voucher);
  const selectedWalletVoucher = usableWalletVouchers.find(
    (entry) => String(entry.id) === String(selectedUserVoucherId)
  );

  const estimateWalletDiscount = (entry) => {
    const voucher = entry?.voucher;
    if (!voucher || total < Number(voucher.min_order_amount || 0)) return 0;
    let discount = 0;
    if (voucher.discount_type === 'percent') {
      discount = total * (Number(voucher.discount_value || 0) / 100);
      if (voucher.max_discount_amount) {
        discount = Math.min(discount, Number(voucher.max_discount_amount));
      }
    } else {
      discount = Number(voucher.discount_value || 0);
    }
    return Math.min(total, Math.max(0, Math.floor(discount)));
  };

  const estimatedDiscount = selectedWalletVoucher ? estimateWalletDiscount(selectedWalletVoucher) : 0;
  const estimatedTotal = Math.max(0, total - estimatedDiscount);

  const renderTableOptions = () => {
    if (tablesLoading) {
      return <option value="">Đang tải danh sách bàn...</option>;
    }

    if (selectableTables.length === 0) {
      return <option value="">Chưa có bàn nhận order</option>;
    }

    return selectableTables.map((table) => (
      <option key={table.id} value={table.id}>
        Bàn {table.table_number}
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

        if (isGuest && qrTableNumber > 0) {
          const matchedTable = apiTables.find((table) => Number(table.table_number) === qrTableNumber);
          if (matchedTable && ['available', 'occupied'].includes(matchedTable.status)) {
            setSelectedTableId(String(matchedTable.id));
            setQrError('');
          } else {
            clearTableSession();
            setQrError(`QR của Bàn ${qrTableNumber} hiện không còn hợp lệ hoặc bàn này không thể nhận order.`);
            alert(`Bàn ${qrTableNumber} hiện không thể nhận order QR.`);
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
  }, [isGuest, qrTableNumber]);

  useEffect(() => {
    if (!isCustomer) {
      setSelectedPayment('direct');
      setSelectedUserVoucherId('');
    }
  }, [isCustomer]);

  useEffect(() => {
    if (isCustomer) {
      loadWallet();
    }
  }, [isCustomer, loadWallet]);

  const getFriendlyGuestOrderError = (error) => {
    const message = String(
      error?.response?.data?.message ||
      error?.response?.data?.errors ||
      error?.message ||
      ''
    ).toLowerCase();

    if (message.includes('expired')) {
      return 'Mã QR này đã hết hạn. Vui lòng quét lại mã QR tại bàn để tiếp tục đặt món.';
    }

    if (
      message.includes('signature') ||
      message.includes('timestamp') ||
      message.includes('invalid qr')
    ) {
      return 'Mã QR không hợp lệ hoặc đã bị thay đổi. Vui lòng quét lại mã QR gốc tại bàn.';
    }

    if (message.includes('not available') || message.includes('inactive')) {
      return 'Bàn này hiện không thể nhận order. Vui lòng liên hệ nhân viên hoặc quét lại mã QR khác.';
    }

    return error?.response?.data?.message || 'Đặt hàng thất bại. Vui lòng thử lại.';
  };

  const checkout = () => {
    if (items.length === 0) return;
    if (!isQrMode && orderableTables.length === 0) {
      alert('Chưa có bàn nào có thể nhận order');
      return;
    }
    if (!selectedTable) {
      alert('Vui lòng chọn bàn');
      return;
    }
    setQrError('');
    setShowPayment(true);
  };

  const confirmPayment = async () => {
    if (!selectedTable) {
      alert('Vui lòng chọn bàn');
      return;
    }

    if (!isAuthenticatedOrder && (!Number.isInteger(qrTimestamp) || qrTimestamp <= 0 || !qrSignature)) {
      setQrError('Mã QR này không đầy đủ thông tin xác thực. Vui lòng quét lại mã QR tại bàn.');
      return;
    }

    const tableLabel = `Bàn ${selectedTable.table_number}`;
    const resolvedGuestName = String(guestName || '').trim() || 'Khách QR';
    const order = {
      id: genId(),
      customerName: isAuthenticatedOrder ? displayName : resolvedGuestName,
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
      voucherCode: selectedUserVoucherId || !voucherCode.trim() ? null : voucherCode.trim().toUpperCase(),
      userVoucherId: selectedUserVoucherId ? Number(selectedUserVoucherId) : null,
      qrTimestamp,
      qrSignature,
      address: tableLabel,
    };

    try {
      const createdOrder = isAuthenticatedOrder
        ? await place(order)
        : await placeGuest(order);
      const orderId = createdOrder.id;
      const payableAmount = Number(createdOrder.total_amount ?? estimatedTotal);

      if (isCustomer) {
        try {
          await paymentService.create({
            order_id: orderId,
            amount: payableAmount,
            method: selectedPayment === 'direct' ? 'cash' : selectedPayment,
            status: 'completed',
            transaction_id: selectedPayment !== 'direct' ? `TXN-${Date.now()}` : null,
          });
        } catch (error) {
          console.error('Failed to create payment record:', error);
        }
      }

      clear();
      if (isCustomer) {
        await loadWallet();
      }
      setShowPayment(false);
      setGuestName('');
      setQrError('');
      setVoucherCode('');
      setSelectedUserVoucherId('');

      if (selectedPayment === 'direct') {
        const popup = window.open('', '_blank');
        const lines = items
          .map(
            (item) =>
              `\n${item.product.name} x${item.quantity} - ${(
                item.product.price * item.quantity
              ).toLocaleString('vi-VN')}đ`
          )
          .join('');

        const html = `<!doctype html><html><head><meta charset="utf-8"><title>Hoa don</title></head><body>
          <pre style="font:14px/1.6 system-ui, -apple-system, Segoe UI, Roboto">CAFE APP\n------------------------------\nKhach: ${
            order.customerName
          }\nBan: ${order.address}\nThoi gian: ${new Date(order.createdAt).toLocaleString(
            'vi-VN'
          )}\n\nMat hang:${lines}\n\nTong tien: ${total.toLocaleString(
            'vi-VN'
              )}d\nGiam gia: ${Number(createdOrder.discount_amount || 0).toLocaleString(
                'vi-VN'
              )}d\nThanh toan: ${payableAmount.toLocaleString('vi-VN')}d\nPhuong thuc: Truc tiep\n\nCam on quy khach!</pre>
          <script>window.onload=()=>{window.print(); setTimeout(()=>window.close(), 300);}</script>
        </body></html>`;

        popup.document.write(html);
        popup.document.close();
      } else {
        alert('Thanh toán online đã ghi nhận!');
      }
    } catch (error) {
      console.error('Order creation failed:', error);
      const friendlyError = getFriendlyGuestOrderError(error);
      if (!isCustomer) {
        setQrError(friendlyError);
      }
      alert('Đặt hàng thất bại: ' + friendlyError);
    }
  };

  if (showPayment) {
    return (
      <div className="container">
        <div className="mx-auto max-w-[560px]">
          <h2 className="mb-5 mt-0 text-2xl font-bold text-slate-900">Thanh toán</h2>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_2px_10px_rgba(15,23,42,0.08)]">
            <div className="mb-8 text-center">
              <h3 className="mb-5 mt-0 text-xl font-bold text-slate-700">
                Tổng tiền: {estimatedTotal.toLocaleString('vi-VN')}đ
              </h3>
              {qrError && (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-left text-sm leading-relaxed text-red-800">
                  <strong>QR order gặp vấn đề:</strong> {qrError}
                </div>
              )}

              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-left">
                <h4 className="mb-3 mt-0 flex items-center gap-2 text-base font-bold text-slate-800">
                  <ReceiptText className="size-4" />
                  Đơn hàng của bạn
                </h4>
                <div className="grid gap-3">
                  {items.map((item) => (
                    <div key={item.productId} className="flex items-center gap-3 rounded-xl bg-white p-3">
                      <img src={item.product.image} alt={item.product.name} className="size-12 rounded-lg object-cover" />
                      <div className="min-w-0 flex-1 font-semibold text-slate-800">{item.product.name}</div>
                      <div className="text-sm font-bold text-slate-500">x{item.quantity}</div>
                      <div className="text-sm font-bold text-slate-800">
                        {(item.product.price * item.quantity).toLocaleString('vi-VN')}đ
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 grid gap-2 border-t border-slate-200 pt-4 text-sm text-slate-700">
                  <div className="flex justify-between"><strong>Tạm tính:</strong> {total.toLocaleString('vi-VN')}đ</div>
                  {estimatedDiscount > 0 && (
                    <div className="flex justify-between text-emerald-700"><strong>Giảm giá:</strong> -{estimatedDiscount.toLocaleString('vi-VN')}đ</div>
                  )}
                  <div className="flex justify-between text-base"><strong>Cần thanh toán:</strong> {estimatedTotal.toLocaleString('vi-VN')}đ</div>
                </div>
              </div>
            </div>

            {isCustomer && (
              <Field label="Voucher của tôi" hint={`Xu hiện có: ${coins.toLocaleString('vi-VN')}`}>
                <select
                  className={fieldClass}
                  value={selectedUserVoucherId}
                  onChange={(event) => {
                    setSelectedUserVoucherId(event.target.value);
                    if (event.target.value) setVoucherCode('');
                  }}
                >
                  <option value="">Không dùng voucher đã đổi</option>
                  {usableWalletVouchers.map((entry) => (
                    <option key={entry.id} value={entry.id}>
                      {entry.voucher.name} ({entry.voucher.code})
                    </option>
                  ))}
                </select>
              </Field>
            )}

            <Field label="Mã voucher trực tiếp">
              <Input
                className={fieldClass}
                value={voucherCode}
                onChange={(event) => {
                  setVoucherCode(event.target.value);
                  if (event.target.value.trim()) setSelectedUserVoucherId('');
                }}
                placeholder="Ví dụ: WELCOME10"
                disabled={Boolean(selectedUserVoucherId)}
              />
            </Field>

            <Field
              label="Chọn số bàn"
              hint={isQrMode && selectedTable ? `QR đang khóa vào Bàn ${selectedTable.table_number}. Khách không cần chọn lại bàn.` : null}
              tone="success"
            >
              <select
                className={fieldClass}
                value={selectedTableId}
                onChange={(event) => setSelectedTableId(event.target.value)}
                disabled={tablesLoading || selectableTables.length === 0 || isQrMode}
              >
                {renderTableOptions()}
              </select>
            </Field>

            {!isCustomer && (
              <Field label="Tên khách">
                <Input
                  className={fieldClass}
                  value={guestName}
                  onChange={(event) => setGuestName(event.target.value)}
                  placeholder="Ví dụ: Anh Nam"
                />
              </Field>
            )}

            <p className="mb-3 mt-0 font-semibold text-slate-700">Chọn phương thức thanh toán:</p>
            <div className="mb-8 grid grid-cols-2 gap-4">
              {[
                { value: 'direct', label: 'Trực tiếp', icon: WalletCards, disabled: false },
                { value: 'vnpay', label: 'VNPay', icon: QrCode, disabled: !isCustomer },
              ].map(({ value, label, icon: Icon, disabled }) => {
                const active = selectedPayment === value;
                return (
                  <label key={value} className={cn('cursor-pointer', disabled && 'cursor-not-allowed')}>
                    <input
                      type="radio"
                      name="payment"
                      value={value}
                      checked={active}
                      onChange={(event) => setSelectedPayment(event.target.value)}
                      disabled={disabled}
                      className="sr-only"
                    />
                    <div
                      className={cn(
                        'flex flex-col items-center gap-2 rounded-xl border-2 border-slate-200 p-5 transition',
                        active && 'border-cyan-500 bg-cyan-50',
                        disabled && 'opacity-50'
                      )}
                    >
                      <Icon className="size-7 text-slate-600" />
                      <span className="font-semibold text-slate-700">{label}</span>
                    </div>
                  </label>
                );
              })}
            </div>

            {!isCustomer && (
              <p className="mt-2 text-sm text-amber-800">
                Guest QR MVP hiện chỉ mở thanh toán trực tiếp. Nếu cần, tôi sẽ nối thêm luồng VNPay/MoMo thật sau.
              </p>
            )}

            {selectedPayment !== 'direct' && (
              <div className="mb-8 text-center">
                <div className="mx-auto mb-4 flex size-52 items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 text-base text-slate-500">
                  {selectedPayment === 'vnpay' ? 'VNPay QR' : 'QR Code'}
                </div>
                <p className="text-slate-500">Quét mã QR để thanh toán</p>
              </div>
            )}

            <div className="flex gap-4">
              <Button
                variant="secondary"
                className="flex-1 rounded-xl"
                onClick={() => setShowPayment(false)}
              >
                Quay lại
              </Button>
              <Button
                className="flex-1 rounded-xl bg-teal-500 text-white hover:bg-teal-600"
                onClick={confirmPayment}
                disabled={tablesLoading || !selectedTable}
              >
                {isAuthenticatedOrder ? 'Xác nhận thanh toán' : 'Gửi order cho quán'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h2 className="mb-5 mt-0 text-2xl font-bold text-slate-900">Giỏ hàng</h2>
      {items.length === 0 ? (
        <div className="px-5 py-16 text-center text-slate-500">
          <ShoppingCart className="mx-auto mb-3 size-12 text-slate-300" />
          <p>Chưa có sản phẩm nào trong giỏ hàng.</p>
        </div>
      ) : (
        <>
          <div className="mb-6 flex flex-col gap-4">
            {items.map((item) => (
              <div key={item.productId} className="flex items-center gap-4 rounded-xl bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.1)] max-[640px]:items-start">
                <img
                  className="size-16 rounded-lg object-cover"
                  src={item.product.image}
                  alt={item.product.name}
                />
                <div className="flex flex-1 items-center gap-4 max-[640px]:flex-col max-[640px]:items-start">
                  <div className="min-w-20 font-semibold text-slate-700">
                    {item.product.price.toLocaleString('vi-VN')}đ
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-8 rounded-md"
                      onClick={() => remove(item.productId)}
                    >
                      <Minus className="size-4" />
                    </Button>
                    <span className="min-w-10 text-center font-semibold">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-8 rounded-md"
                      onClick={() => add(item.productId)}
                    >
                      <Plus className="size-4" />
                    </Button>
                  </div>
                </div>
                <Button
                  variant="destructive"
                  className="rounded-lg bg-red-600 text-white hover:bg-red-700"
                  onClick={() => {
                    for (let index = 0; index < item.quantity; index += 1) {
                      remove(item.productId);
                    }
                  }}
                >
                  <Trash2 className="size-4" />
                  Xóa
                </Button>
              </div>
            ))}
          </div>

          <div className="mb-6 rounded-xl bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.1)]">
            <div className="mb-3 flex items-center justify-between">
              <label className="font-medium text-slate-700">Số lượng:</label>
              <Input
                type="text"
                value={totalQuantity}
                readOnly
                className="w-16 rounded-md bg-slate-50 text-center"
              />
            </div>
            <div className="mb-3 flex items-center justify-between border-t border-slate-200 pt-3">
              <label className="font-medium text-slate-700">Tổng tiền:</label>
              <div className="text-lg font-bold text-slate-700">
                {total.toLocaleString('vi-VN')}đ
              </div>
            </div>
            <div className="flex items-start justify-between gap-4 border-t border-slate-200 pt-3 max-[640px]:flex-col">
              <label htmlFor="cart-table-select" className="font-medium text-slate-700">Bàn:</label>
              <div className="w-[min(320px,55%)] max-[640px]:w-full">
                <select
                  id="cart-table-select"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-[15px] text-slate-900 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                  value={selectedTableId}
                  onChange={(event) => setSelectedTableId(event.target.value)}
                  disabled={tablesLoading || selectableTables.length === 0 || isQrMode}
                >
                  {renderTableOptions()}
                </select>
                {isQrMode && selectedTable && (
                  <p className="mt-2 text-sm leading-relaxed text-teal-700">
                    QR đang khóa vào Bàn {selectedTable.table_number}.
                  </p>
                )}
                {!isQrMode && !tablesLoading && selectedTable && (
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">
                    Đơn này sẽ gắn vào Bàn {selectedTable.table_number}.
                  </p>
                )}
                {!isQrMode && !tablesLoading && selectableTables.length === 0 && (
                  <p className="mt-2 text-sm leading-relaxed text-red-700">
                    Hiện chưa có bàn nào có thể nhận order.
                  </p>
                )}
              </div>
            </div>
          </div>

          <Button
            className="w-full rounded-xl bg-teal-500 p-4 text-lg font-semibold text-white hover:-translate-y-0.5 hover:bg-teal-600 disabled:cursor-not-allowed disabled:opacity-65 disabled:hover:translate-y-0"
            onClick={checkout}
            disabled={tablesLoading || !selectedTable}
          >
            <CreditCard className="size-5" />
            Thanh toán
          </Button>
        </>
      )}
    </div>
  );
}
