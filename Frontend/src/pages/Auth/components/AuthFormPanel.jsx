import { Coffee, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { authCopy, inputClass } from '../loginPage.constants'
import { Divider, SocialButtons } from './AuthPieces'

export function AuthFormPanel({
  email,
  setEmail,
  password,
  setPassword,
  username,
  setUsername,
  confirmPassword,
  setConfirmPassword,
  isRegister,
  loading,
  switchMode,
  submit,
}) {
  const copy = isRegister ? authCopy.register : authCopy.login

  return (
    <form
      className="relative flex h-full flex-col justify-center bg-[radial-gradient(circle_at_top_right,rgba(186,130,88,0.12),transparent_22%),linear-gradient(180deg,rgba(255,254,251,0.96)_0%,rgba(246,235,220,0.94)_100%)] px-14 py-12 text-left text-[#3e2617] max-[1100px]:px-10 max-[640px]:px-5.5"
      onSubmit={(event) => {
        event.preventDefault()
        submit()
      }}
    >
      <div className="mb-5 inline-flex w-fit rounded-full bg-[#8b573614] p-1">
        <button
          type="button"
          className={cn(
            'rounded-full px-4 py-2 text-sm font-bold text-[#8b5736] transition',
            !isRegister && 'bg-white text-[#422718] shadow-sm'
          )}
          onClick={() => switchMode(false)}
        >
          Đăng nhập
        </button>
        <button
          type="button"
          className={cn(
            'rounded-full px-4 py-2 text-sm font-bold text-[#8b5736] transition',
            isRegister && 'bg-white text-[#422718] shadow-sm'
          )}
          onClick={() => switchMode(true)}
        >
          Đăng ký
        </button>
      </div>

      <span className="mb-2.5 text-xs font-bold uppercase tracking-[0.18em] text-[#8b5736]">
        {copy.eyebrow}
      </span>
      <h2 className="m-0 font-serif text-[clamp(2rem,2.5vw,3rem)] leading-tight">
        {copy.title}
      </h2>
      <p className="mb-0 mt-3.5 text-[0.98rem] leading-7 text-[#3e2617bd]">
        {copy.description}
      </p>

      <SocialButtons />
      <Divider>{copy.divider}</Divider>

      <div className="grid gap-3.5">
        {isRegister && (
          <Input
            className={inputClass}
            type="text"
            placeholder="Tên khách"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            autoComplete="username"
          />
        )}
        <Input
          className={inputClass}
          type="email"
          placeholder="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
        />
        <Input
          className={inputClass}
          type="password"
          placeholder="Mật khẩu"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete={isRegister ? 'new-password' : 'current-password'}
        />
        {isRegister && (
          <Input
            className={inputClass}
            type="password"
            placeholder="Xác nhận mật khẩu"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            autoComplete="new-password"
          />
        )}
      </div>

      {isRegister ? (
        <div className="mt-3.5 text-[0.84rem] leading-6 text-[#57361fad]">
          Mật khẩu nên có ít nhất 6 ký tự, gồm chữ hoa, chữ thường và số.
        </div>
      ) : (
        <button
          className="mt-4 w-fit border-0 bg-transparent p-0 text-sm text-[#825134] transition hover:text-[#603824]"
          type="button"
        >
          Quên mật khẩu? Hãy liên hệ quầy để được hỗ trợ nhanh.
        </button>
      )}

      <Button
        className="mt-5 w-fit rounded-full bg-gradient-to-br from-[#7f4b2b] to-[#a76c45] px-7 py-4 font-bold tracking-wide text-[#fff9f4] shadow-[0_16px_26px_rgba(116,73,41,0.22)] hover:-translate-y-0.5 hover:shadow-[0_20px_30px_rgba(116,73,41,0.28)] disabled:cursor-wait disabled:opacity-70 max-[640px]:w-full"
        type="submit"
        disabled={loading}
      >
        {loading ? copy.loading : copy.submit}
      </Button>

      <div className="mt-4 inline-flex items-start gap-2.5 text-[0.88rem] leading-6 text-[#4c2e1cb8]">
        {isRegister ? <Coffee className="mt-0.5 size-4 shrink-0" /> : <Star className="mt-0.5 size-4 shrink-0" />}
        <span>{copy.note}</span>
      </div>
    </form>
  )
}
