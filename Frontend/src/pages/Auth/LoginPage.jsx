import coffeeInteriorImage from '../../assets/space_coffee.jpg'
import coffeeHeroImage from '../../assets/Hinh-anh-cafe-dep-nhat.png'
import { AuthFormPanel } from './components/AuthFormPanel'
import { AuthIntro } from './components/AuthIntro'
import { AuthVisualPanel } from './components/AuthVisualPanel'
import { useLoginRegisterForm } from './hooks/useLoginRegisterForm'

export function LoginPage() {
  const form = useLoginRegisterForm()

  return (
    <main
      className="relative min-h-screen overflow-hidden bg-[#eadcca] bg-cover bg-center px-5 py-8"
      style={{
        backgroundImage: `linear-gradient(135deg,rgba(247,239,228,0.94),rgba(212,182,148,0.92)),url(${coffeeHeroImage})`,
      }}
    >
      <div className="mx-auto max-w-[1180px]">
        <AuthIntro />

        <section className="mt-7 grid min-h-[680px] overflow-hidden rounded-[34px] border border-[#6640231f] bg-[#fffbf7b8] shadow-[0_28px_60px_rgba(80,46,21,0.18)] backdrop-blur-xl lg:grid-cols-2 max-[640px]:rounded-[28px]">
          <AuthFormPanel {...form} />
          <AuthVisualPanel
            isRegister={form.isRegister}
            switchMode={form.switchMode}
            coffeeHeroImage={coffeeHeroImage}
            coffeeInteriorImage={coffeeInteriorImage}
          />
        </section>
      </div>
    </main>
  )
}
