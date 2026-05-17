import { useCartStore } from '../../stores/cartStore.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useNotifyStore } from '../../stores/notifyStore.js';
import { useNavigate, Link } from 'react-router-dom';
import { useReviewStore } from '../../stores/reviewStore.js';
import { ROUTES } from '../../config/routes';
import { MESSAGES } from '../../constants/messages';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function ProductCard({ product }) {
  const add = useCartStore((s) => s.add);
  const { isGuest } = useAuth();
  const notify = useNotifyStore();
  const navigate = useNavigate();
  const { avg, count } = useReviewStore((s) => s.average(product.id));
  const roundedAvg = Math.min(5, Math.max(0, Math.round(avg)));

  return (
    <article className="group flex min-h-[318px] flex-col gap-3 rounded-2xl bg-card p-3 text-card-foreground shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-all duration-200 ease-out hover:-translate-y-1.5 hover:shadow-[0_12px_30px_rgba(0,0,0,0.12)] active:-translate-y-0.5">
      <Link
        to={ROUTES.PRODUCT_DETAIL(product.id)}
        className="block overflow-hidden rounded-xl text-inherit no-underline"
      >
        <img
          className={cn(
            'h-[150px] w-full cursor-pointer object-cover transition duration-200 group-hover:scale-[1.03]',
            !product.is_available && 'opacity-60 grayscale'
          )}
          src={product.image}
          alt={product.name}
        />
      </Link>

      <div className="flex flex-1 items-center justify-between gap-3">
        <div className="min-w-0">
          <Link
            to={ROUTES.PRODUCT_DETAIL(product.id)}
            className="block truncate text-inherit no-underline"
          >
            <h3 className="cursor-pointer text-lg font-semibold leading-tight text-slate-700">
              {product.name}
            </h3>
          </Link>

          <div className="mt-2 inline-flex min-w-[132px] items-center rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
            {product.price.toLocaleString('vi-VN')}đ
          </div>

          <div className="mt-3 flex items-center gap-1.5">
            <span className="text-sm leading-none text-amber-500">
              {'★'.repeat(roundedAvg)}
              {'☆'.repeat(5 - roundedAvg)}
            </span>
            <span className="text-slate-500">({count})</span>
          </div>

          <Link
            to={ROUTES.PRODUCT_DETAIL(product.id)}
            className="mt-4 inline-flex text-lg font-bold text-emerald-500 no-underline transition hover:text-emerald-600 hover:underline"
          >
            Xem chi tiết
          </Link>
        </div>

        <Button
          className={cn(
            'h-12 shrink-0 rounded-2xl bg-emerald-400 px-4 text-lg font-semibold text-white shadow-none hover:bg-emerald-500',
            !product.is_available && 'bg-slate-800 hover:bg-slate-800'
          )}
          disabled={!product.is_available}
          onClick={() => {
            if (isGuest) {
              notify.show({
                message: MESSAGES.ERROR.UNAUTHORIZED,
                type: 'warning',
                actionLabel: 'Đăng nhập',
                onAction: () => navigate(ROUTES.LOGIN),
                duration: 4000,
              });
              return;
            }
            add(product.id);
            notify.show({
              message: 'Đã thêm vào giỏ hàng',
              type: 'success',
              duration: 1500,
            });
          }}
        >
          {product.is_available ? 'Order' : 'Hết hàng'}
        </Button>
      </div>
    </article>
  )
}
