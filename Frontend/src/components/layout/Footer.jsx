import { Link } from 'react-router-dom';
import { FaFacebook, FaInstagram, FaTwitter, FaYoutube } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const socialLinks = [
  { label: 'facebook', icon: FaFacebook, hover: 'hover:bg-[#1877f2]' },
  {
    label: 'instagram',
    icon: FaInstagram,
    hover: 'hover:bg-[radial-gradient(circle_at_30%_107%,#fdf497_0%,#fdf497_5%,#fd5949_45%,#d6249f_60%,#285aeb_90%)]',
  },
  { label: 'twitter', icon: FaTwitter, hover: 'hover:bg-[#1da1f2]' },
  { label: 'youtube', icon: FaYoutube, hover: 'hover:bg-[#ff0000]' },
];

const exploreLinks = [
  { label: 'Trang chủ', to: '/' },
  { label: 'Thực đơn', to: '/menu' },
  { label: 'Hoạt động', to: '/activities' },
  { label: 'Tin tức', to: '/news' },
];

const supportLinks = [
  { label: 'Liên hệ', to: '#contact' },
  { label: 'FAQs', to: '/faq' },
  { label: 'Chính sách', to: '/policy' },
  { label: 'Điều khoản', to: '/terms' },
];

function FooterColumn({ title, links }) {
  return (
    <div>
      <h4 className="mb-4 text-[15px] font-bold uppercase tracking-wide text-[#f4dcc0]">
        {title}
      </h4>
      <ul className="m-0 list-none p-0">
        {links.map((link) => (
          <li className="my-3" key={link.label}>
            <Link
              to={link.to}
              className="inline-block text-[rgba(248,241,231,0.74)] no-underline transition hover:translate-x-1 hover:text-white"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      id="contact"
      className="mt-14 border-t border-white/5 bg-[radial-gradient(circle_at_top_left,rgba(201,147,73,0.18),transparent_28%),radial-gradient(circle_at_top_right,rgba(54,201,148,0.12),transparent_24%),linear-gradient(180deg,#1e1813_0%,#15100d_100%)] text-[#f8f1e7]"
    >
      <div className="mx-auto grid max-w-[1100px] grid-cols-[1.15fr_0.9fr_1.1fr] items-start gap-9 px-4 pb-10 pt-14 max-[900px]:grid-cols-1 max-[900px]:gap-6 max-[900px]:pb-8 max-[900px]:pt-11">
        <div>
          <span className="mb-3.5 inline-flex w-fit items-center rounded-full border border-white/10 bg-[#fff8ef0f] px-3 py-2 text-xs font-bold uppercase tracking-[0.08em] text-[#d8bf99]">
            Jokopi Corner
          </span>
          <h3 className="mb-3 mt-0 text-[32px] font-extrabold leading-tight tracking-normal text-[#f8f1e7] max-[620px]:text-[28px]">
            Cafe Nhà Mình
          </h3>
          <p className="mb-4.5 mt-0 max-w-[340px] text-lg leading-relaxed text-[rgba(248,241,231,0.74)] max-[620px]:text-base">
            Một góc cà phê ấm, yên và đủ đẹp để ngồi lâu hơn một chút.
          </p>
          <div className="mb-5 w-fit rounded-[14px] bg-white/5 px-3.5 py-2.5 text-sm text-[#ead9bf]">
            Mở cửa mỗi ngày 07:00 - 22:30
          </div>
          <div className="mt-2 flex gap-3">
            {socialLinks.map(({ label, icon: Icon, hover }) => (
              <a
                href="#"
                className={cn(
                  'inline-flex size-[42px] items-center justify-center rounded-[14px] border border-white/10 bg-white/10 text-[#f7efe2] no-underline shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition hover:-translate-y-0.5 hover:text-white hover:shadow-[0_12px_30px_rgba(0,0,0,0.22)]',
                  hover
                )}
                aria-label={label}
                key={label}
              >
                <Icon />
              </a>
            ))}
          </div>
        </div>

        <div className="flex gap-9 pt-4.5 max-[900px]:gap-7 max-[900px]:pt-0 max-[620px]:flex-col max-[620px]:gap-4">
          <FooterColumn title="Khám phá" links={exploreLinks} />
          <FooterColumn title="Hỗ trợ" links={supportLinks} />
        </div>

        <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,249,240,0.08),rgba(255,249,240,0.04))] p-6 shadow-[0_24px_50px_rgba(0,0,0,0.18)] max-[900px]:order-3 max-[900px]:p-5">
          <h4 className="mb-2.5 mt-0 text-2xl font-bold text-[#f8f1e7]">
            Nhận tin & ưu đãi
          </h4>
          <p className="mb-2.5 mt-0 leading-relaxed text-[rgba(248,241,231,0.7)]">
            Đăng ký để nhận menu mới, mã giảm giá và lịch workshop theo mùa.
          </p>
          <form
            className="my-5 grid grid-cols-1 gap-3"
            onSubmit={(e) => e.preventDefault()}
          >
            <Input
              aria-label="email"
              type="email"
              placeholder="Nhập email của bạn"
              className="h-auto rounded-[18px] border-white/10 bg-white px-4.5 py-4 text-[15px] text-[#2b241f] placeholder:text-[#8f877f]"
            />
            <Button
              className="h-auto w-full rounded-[18px] bg-gradient-to-br from-[#d28a3d] to-[#b76a22] px-4.5 py-3.5 font-bold text-white shadow-[0_18px_30px_rgba(183,106,34,0.28)] hover:from-[#dd964a] hover:to-[#c37428]"
              type="submit"
            >
              Đăng ký ngay
            </Button>
          </form>
          <div className="grid gap-3">
            <p className="m-0 leading-relaxed text-[rgba(248,241,231,0.82)]">
              <span className="mb-0.5 block text-xs font-bold uppercase tracking-[0.08em] text-[#d8bf99]">
                Địa chỉ
              </span>
              45 Lê Lợi, Quận 1, TP.HCM
            </p>
            <p className="m-0 leading-relaxed text-[rgba(248,241,231,0.82)]">
              <span className="mb-0.5 block text-xs font-bold uppercase tracking-[0.08em] text-[#d8bf99]">
                Email
              </span>
              contact@nhaminh.cafe
            </p>
            <p className="m-0 leading-relaxed text-[rgba(248,241,231,0.82)]">
              <span className="mb-0.5 block text-xs font-bold uppercase tracking-[0.08em] text-[#d8bf99]">
                Hotline
              </span>
              0901 234 567
            </p>
          </div>
        </div>
      </div>

      <div className="mt-3 border-t border-white/10 py-4.5">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between gap-2 px-4 text-[rgba(248,241,231,0.72)] max-[900px]:flex-col max-[900px]:text-center">
          <p className="m-0">© {year} Cafe Nhà Mình. All rights reserved.</p>
          <div className="text-sm text-[#d8bf99]">
            Designed for slow coffee moments.
          </div>
        </div>
      </div>
    </footer>
  );
}
