import {
  Activity,
  BarChart3,
  Coffee,
  LogOut,
  Newspaper,
  QrCode,
  ReceiptText,
  TicketPercent,
  Users,
  X,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import { useNavigate } from 'react-router-dom';
import { useNotifyStore } from '../../stores/notifyStore.js';
import { ROUTES } from '../../config/routes';
import { ROLE_LABELS } from '../../constants/roles';
import { MESSAGES } from '../../constants/messages';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const menuItems = [
  { key: 'revenue', label: 'Doanh thu', icon: BarChart3 },
  { key: 'accounts', label: 'Tài khoản', icon: Users },
  { key: 'menu', label: 'Thực đơn', icon: Coffee },
  { key: 'news', label: 'Tin tức', icon: Newspaper },
  { key: 'activities', label: 'Hoạt động', icon: Activity },
  { key: 'vouchers', label: 'Voucher', icon: TicketPercent },
  { key: 'orders', label: 'Đơn hàng', icon: ReceiptText },
  { key: 'tables', label: 'Bàn & QR', icon: QrCode },
];

export function Sidebar({ isOpen, onClose, activeTab, onTabChange }) {
  const { role, customerName, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useNotifyStore();

  const handleLogout = () => {
    toast.show({
      message: MESSAGES.CONFIRM.LOGOUT,
      type: 'warning',
      actionLabel: 'Đăng xuất',
      onAction: () => {
        logout();
        navigate(ROUTES.HOME);
        onClose();
      },
    });
  };

  return (
    <>
      {isOpen && (
        <button
          type="button"
          className="fixed inset-0 z-[998] cursor-pointer border-0 bg-slate-900/60 p-0 backdrop-blur-sm animate-in fade-in duration-300"
          onClick={onClose}
          aria-label="Đóng menu quản lý"
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 z-[999] flex h-screen w-80 flex-col bg-slate-900 shadow-[10px_0_30px_rgba(0,0,0,0.3)] transition-transform duration-300 ease-out',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between border-b border-white/5 bg-white/[0.02] px-6 py-8">
          <h3 className="m-0 text-2xl font-extrabold tracking-normal text-white">
            Dashboard<span className="text-violet-600">.</span>
          </h3>
          <Button
            type="button"
            variant="ghost"
            size="icon-lg"
            className="rounded-[10px] bg-white/5 text-slate-400 hover:bg-red-600 hover:text-white"
            onClick={onClose}
            aria-label="Đóng menu quản lý"
          >
            <X className="size-5" />
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.key;

            return (
              <button
                key={item.key}
                type="button"
                className={cn(
                  'mb-1 flex w-full items-center gap-4 rounded-xl border-0 bg-transparent px-4 py-3.5 text-left text-[15px] font-semibold text-slate-400 transition hover:bg-white/5 hover:pl-5 hover:text-white',
                  active && 'bg-violet-600 text-white shadow-[0_8px_16px_rgba(107,76,230,0.3)] hover:bg-violet-600 hover:pl-4'
                )}
                onClick={() => {
                  onTabChange?.(item.key);
                  onClose?.();
                }}
              >
                <Icon className="size-5 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="border-t border-white/5 bg-black/20 p-6">
          <div className="mb-5 flex items-center gap-3 rounded-2xl bg-white/[0.03] p-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-violet-400 text-sm font-extrabold text-white shadow-[0_4px_12px_rgba(107,76,230,0.3)]">
              AD
            </div>
            <div>
              <div className="mb-0.5 text-[15px] font-bold text-white">
                {customerName || 'Admin'}
              </div>
              <div className="text-[13px] font-medium text-slate-500">
                {ROLE_LABELS[role] || 'Người dùng'}
              </div>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full rounded-xl border-red-600/20 bg-red-600/10 py-3 font-bold text-red-500 hover:bg-red-500 hover:text-white"
            onClick={handleLogout}
          >
            <LogOut className="size-4" />
            Đăng xuất
          </Button>
        </div>
      </aside>
    </>
  );
}
