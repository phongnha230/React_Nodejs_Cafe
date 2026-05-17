import heroImage from '../../assets/Hinh-anh-cafe-dep-nhat.png'
import spaceImage from '../../assets/space_coffee.jpg'
import matchaImage from '../../assets/Matcha.jpeg'
import guavaImage from '../../assets/nuoc-ep-oi.jpg'
import orangeImage from '../../assets/nuoc-cam-vat_master.jpg'

const featured = [
  { name: 'Không gian Jokopi', image: spaceImage },
  { name: 'Matcha latte', image: matchaImage },
  { name: 'Nước ổi ép', image: guavaImage },
  { name: 'Cam vắt', image: orangeImage },
]

export function Banner() {
  return (
    <section className="relative flex min-h-[82vh] items-center justify-center overflow-hidden px-5 py-20 max-[900px]:min-h-0 max-[900px]:py-14">
      <img
        src={heroImage}
        alt="Không gian cafe Jokopi"
        className="absolute inset-0 z-0 h-full w-full scale-105 object-cover"
      />
      <div className="absolute inset-0 z-0 bg-black/55" />

      <div className="relative z-10 w-full max-w-[980px] text-center">
        <div className="rounded-[32px] border border-white/20 bg-white/10 px-10 py-14 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] backdrop-blur-md animate-in fade-in slide-in-from-bottom-6 duration-700 max-[900px]:px-5 max-[900px]:py-10">
          <h2 className="m-0 text-[clamp(2.4rem,6vw,4.5rem)] font-extrabold leading-tight text-white [text-shadow:0_4px_12px_rgba(0,0,0,0.3)]">
            Thức uống mát lạnh, tươi ngon mỗi ngày
          </h2>
          <p className="mx-auto mb-10 mt-5 max-w-[640px] text-[clamp(1.05rem,2vw,1.35rem)] leading-relaxed text-white/90">
            Chọn món yêu thích và đặt ngay. Tận hưởng hương vị được chuẩn bị nhanh trong vài phút.
          </p>

          <div className="mb-14 flex justify-center">
            <a
              className="inline-flex rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 px-10 py-4 text-lg font-bold text-white no-underline shadow-[0_10px_25px_rgba(54,201,148,0.3)] transition hover:-translate-y-1 hover:scale-[1.03] hover:from-emerald-300 hover:to-emerald-500 hover:text-white hover:shadow-[0_20px_35px_rgba(54,201,148,0.4)]"
              href="#menu"
            >
              Xem menu ngay
            </a>
          </div>

          <div className="grid grid-cols-4 gap-6 max-[900px]:grid-cols-2 max-[900px]:gap-4 max-[500px]:mx-auto max-[500px]:max-w-[280px] max-[500px]:grid-cols-1">
            {featured.map((item) => (
              <article
                key={item.name}
                className="rounded-3xl border border-white/10 bg-white/5 p-3 transition duration-300 hover:-translate-y-2 hover:rotate-1 hover:border-white/30 hover:bg-white/15 hover:shadow-[0_30px_60px_-12px_rgba(0,0,0,0.6)]"
              >
                <div className="mb-3 aspect-square overflow-hidden rounded-[18px]">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-cover transition duration-500 hover:scale-110"
                  />
                </div>
                <span className="block text-center text-[0.95rem] font-semibold text-white">
                  {item.name}
                </span>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
