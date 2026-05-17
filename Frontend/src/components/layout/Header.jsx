import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Coffee, LogIn, LogOut, Menu, ShoppingBag } from 'lucide-react';
import { useCartStore } from '../../stores/cartStore.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useNotifyStore } from '../../stores/notifyStore.js';
import { ROUTES } from '../../config/routes';
import { MESSAGES } from '../../constants/messages';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navLinkClass = ({ isActive } = {}) =>
  cn(
    'relative inline-flex items-center rounded-xl px-4 py-2 text-[15px] font-semibold text-slate-500 no-underline transition hover:bg-violet-50 hover:text-violet-600',
    'after:absolute after:bottom-1 after:left-4 after:right-4 after:h-0.5 after:rounded-full after:bg-transparent after:transition',
    isActive && 'bg-violet-50 text-violet-600 after:bg-violet-600'
  );

export function Header({ onMenuClick }) {
  const count = useCartStore((s) => (
    Array.isArray(s.items)
      ? s.items.reduce((n, i) => n + (Number(i.quantity) || 0), 0)
      : 0
  ));
  const { logout, customerName, isAdmin, isCustomer, isGuest } = useAuth();
  const navigate = useNavigate();
  const toast = useNotifyStore();
  const voucherRoute = `${ROUTES.HOME}#vouchers`;

  return (
    <header className="sticky top-0 z-40 bg-white shadow-[0_2px_18px_rgba(14,20,24,0.06)] backdrop-blur-md">
      <div className="h-1 w-full bg-gradient-to-r from-pink-400 to-rose-700" />

      <div className="mx-auto flex min-h-20 max-w-[1400px] items-center justify-between gap-6 px-6 py-3 max-[880px]:min-h-0 max-[880px]:flex-col max-[880px]:items-stretch max-[880px]:gap-2 max-[880px]:px-3.5">
        <div className="flex items-center gap-3">
          {isAdmin && (
            <Button
              type="button"
              size="icon-lg"
              onClick={onMenuClick}
              title="Mở menu quản lý"
              aria-label="Mở menu quản lý"
              className="mr-1 rounded-[10px] bg-violet-600 text-white shadow-[0_4px_12px_rgba(107,76,230,0.2)] hover:-translate-y-0.5 hover:bg-violet-700 hover:shadow-[0_6px_16px_rgba(107,76,230,0.3)]"
            >
              <Menu className="size-5" />
            </Button>
          )}

          <Link
            to={ROUTES.HOME}
            className="flex items-center gap-3 text-inherit no-underline transition hover:scale-[1.02]"
          >
            <span className="inline-flex size-12 items-center justify-center rounded-[14px] bg-gradient-to-br from-violet-600 to-violet-400 text-white shadow-[0_8px_20px_rgba(107,76,230,0.2)] max-[520px]:size-10">
              <Coffee className="size-6 max-[520px]:size-5" />
            </span>
            <span className="text-2xl font-extrabold text-slate-900 max-[520px]:text-xl">
              jokopi.
              <span className="ml-0.5 font-bold text-violet-600">
                {isAdmin ? 'Admin' : 'Home'}
              </span>
            </span>
          </Link>
        </div>

        <nav className="flex items-center gap-2 max-[880px]:overflow-x-auto max-[880px]:px-1.5 max-[880px]:py-1.5 max-[880px]:[mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)] max-[880px]:[-webkit-mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
          <NavLink to={ROUTES.HOME} end className={navLinkClass}>
            Trang chủ
          </NavLink>
          <NavLink to={ROUTES.MENU} className={navLinkClass}>
            Thực đơn
          </NavLink>
          <NavLink to={ROUTES.ACTIVITIES} className={navLinkClass}>
            Hoạt động
          </NavLink>
          <NavLink to={ROUTES.NEWS} className={navLinkClass}>
            Tin tức
          </NavLink>
          <Link to={voucherRoute} className={navLinkClass()}>
            Voucher
          </Link>

          {isCustomer && (
            <NavLink to={ROUTES.MY_ORDERS} className={navLinkClass}>
              Đơn của tôi
            </NavLink>
          )}
        </nav>

        <div className="flex shrink-0 items-center justify-end gap-2.5 max-[880px]:gap-2">
          <Link
            to={ROUTES.CART}
            className="relative inline-flex size-11 shrink-0 items-center justify-center rounded-full text-slate-600 no-underline transition hover:bg-slate-100 hover:text-violet-600"
            aria-label={`Giỏ hàng, ${count} sản phẩm`}
          >
            <ShoppingBag className="size-[22px]" />
            {count > 0 && (
              <span className="absolute right-0.5 top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-white bg-red-500 px-1 text-[11px] font-bold leading-none text-white">
                {count}
              </span>
            )}
          </Link>

          {isGuest ? (
            <Link
              to={ROUTES.LOGIN}
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 px-4 text-sm font-semibold text-white no-underline shadow-[0_6px_18px_rgba(56,178,172,0.18)] transition hover:-translate-y-0.5 hover:from-teal-500 hover:to-teal-700 hover:text-white hover:shadow-[0_10px_28px_rgba(56,178,172,0.22)] max-[520px]:px-3 max-[520px]:text-[13px]"
            >
              <LogIn className="size-4" />
              Đăng nhập
            </Link>
          ) : (
            <div className="flex items-center gap-4 rounded-full border border-slate-200 bg-slate-50 py-1.5 pl-4 pr-1.5 transition hover:border-slate-300 hover:bg-slate-100 hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-full bg-violet-600 text-sm font-extrabold text-white shadow-[0_4px_8px_rgba(107,76,230,0.2)]">
                  {customerName ? customerName.charAt(0).toUpperCase() : 'A'}
                </div>
                <div className="flex flex-col max-[520px]:hidden">
                  <span className="text-sm font-bold leading-tight text-slate-800">
                    {customerName || 'Admin'}
                  </span>
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    {isAdmin ? 'Quản trị viên' : 'Khách hàng'}
                  </span>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon-lg"
                onClick={() => {
                  toast.show({
                    message: MESSAGES.CONFIRM.LOGOUT,
                    type: 'warning',
                    actionLabel: 'Đăng xuất',
                    onAction: () => {
                      logout();
                      navigate(ROUTES.HOME);
                    },
                  });
                }}
                title="Đăng xuất"
                aria-label="Đăng xuất"
                className="size-9 rounded-full border-slate-200 bg-white text-slate-500 transition hover:rotate-90 hover:border-red-300 hover:bg-red-50 hover:text-red-600"
              >
                <LogOut className="size-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
