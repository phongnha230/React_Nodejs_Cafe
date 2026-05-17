import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { ROUTES } from '../../../config/routes'

export function AuthIntro() {
  return (
    <>
      <Link
        className="inline-flex items-center gap-2.5 rounded-full border border-[#4e2f1924] bg-[#fffaf4b8] px-4.5 py-3 text-[#442818] no-underline shadow-[0_18px_32px_rgba(95,59,33,0.08)] backdrop-blur transition hover:-translate-x-1 hover:bg-[#fff8eff0] hover:shadow-[0_22px_38px_rgba(95,59,33,0.14)]"
        to={ROUTES.HOME}
      >
        <ArrowLeft className="size-4" />
        <span>Quay lại trang chủ</span>
      </Link>

      <section className="mt-8 max-w-[620px] text-[#422718]">
        <span className="mb-3 inline-block rounded-full bg-[#5e371914] px-3.5 py-2 text-[0.78rem] font-bold uppercase tracking-[0.18em] text-[#6f452b]">
          Jokopi Coffee House
        </span>
        <h1 className="m-0 font-serif text-[clamp(2.4rem,4vw,4.3rem)] leading-none">
          Đăng nhập như đang bước vào quán cà phê quen của bạn.
        </h1>
        <p className="mt-3.5 max-w-[560px] text-base leading-7 text-[#422718cc]">
          Một không gian riêng cho đăng nhập và đăng ký, giữ tinh thần quán cà phê thủ công.
        </p>
      </section>
    </>
  )
}
