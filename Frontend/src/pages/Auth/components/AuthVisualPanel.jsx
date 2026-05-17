import { ArrowRight, Clock3, Coffee, MapPin, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { authCopy } from '../loginPage.constants'
import { Highlight } from './AuthPieces'

export function AuthVisualPanel({
  isRegister,
  switchMode,
  coffeeHeroImage,
  coffeeInteriorImage,
}) {
  const copy = isRegister ? authCopy.register : authCopy.login
  const image = isRegister ? coffeeHeroImage : coffeeInteriorImage

  return (
    <aside className="relative flex min-h-[680px] flex-col justify-end overflow-hidden bg-[#2f1c14] p-12 text-[#fff6ee] max-[900px]:min-h-[520px] max-[640px]:p-5">
      <img
        src={image}
        alt="Không gian cafe Jokopi"
        className="absolute inset-0 h-full w-full object-cover opacity-70"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(28,18,13,0.08)_0%,rgba(28,18,13,0.88)_100%)]" />
      <div className="relative z-10">
        <span className="mb-4 inline-flex w-fit rounded-full border border-[#ffecd63d] bg-[#fff9f014] px-3.5 py-2 text-[0.78rem] font-bold uppercase tracking-[0.16em]">
          {copy.visualEyebrow}
        </span>
        <h2 className="m-0 font-serif text-[clamp(2.1rem,2.8vw,3.15rem)] leading-tight">
          {copy.visualTitle}
        </h2>
        <p className="mt-4 text-[0.98rem] leading-7 text-[#fff3e7d6]">
          {copy.visualDescription}
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          {isRegister ? (
            <>
              <Highlight icon={Coffee}>Lưu món yêu thích</Highlight>
              <Highlight icon={Clock3}>Nhận nhắc lịch mới</Highlight>
              <Highlight icon={MapPin}>Khám phá không gian</Highlight>
            </>
          ) : (
            <>
              <Highlight icon={Clock3}>Đặt món nhanh</Highlight>
              <Highlight icon={MapPin}>Giữ bàn quen</Highlight>
              <Highlight icon={Star}>Theo dõi ưu đãi</Highlight>
            </>
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          className="mt-6 rounded-full border-[#fff5e86b] bg-[#fff8ef14] px-7 py-3.5 font-bold tracking-wide text-[#fff6ee] hover:-translate-y-0.5 hover:bg-[#fff9f2f5] hover:text-[#4b2c19] max-[640px]:w-full"
          onClick={() => switchMode(!isRegister)}
        >
          {isRegister ? 'Đăng nhập' : 'Tạo tài khoản'}
          {!isRegister && <ArrowRight className="size-4" />}
        </Button>
      </div>
    </aside>
  )
}
