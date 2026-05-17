import { FaFacebookF, FaGoogle, FaInstagram } from 'react-icons/fa'

const socialEntries = [
  { icon: <FaFacebookF />, label: 'Facebook' },
  { icon: <FaGoogle />, label: 'Google' },
  { icon: <FaInstagram />, label: 'Instagram' },
]

export function SocialButtons() {
  return (
    <div className="my-5 flex gap-3">
      {socialEntries.map((entry) => (
        <button
          key={entry.label}
          className="inline-flex size-11 items-center justify-center rounded-full border border-[#70472a29] bg-[#fffaf4cc] text-[#6f452b] transition hover:-translate-y-0.5 hover:border-[#70472a4d] hover:shadow-[0_12px_22px_rgba(95,59,33,0.12)]"
          type="button"
          aria-label={entry.label}
        >
          {entry.icon}
        </button>
      ))}
    </div>
  )
}

export function Divider({ children }) {
  return (
    <div className="relative mb-2 w-full text-[0.82rem] text-[#583822a8] after:absolute after:left-0 after:right-0 after:top-1/2 after:border-t after:border-[#6842271f]">
      <span className="relative z-10 bg-[linear-gradient(180deg,rgba(255,254,251,0.96)_0%,rgba(246,235,220,0.94)_100%)] pr-4">
        {children}
      </span>
    </div>
  )
}

export function Highlight({ icon: Icon, children }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[#fff5e92e] bg-[#fffaf41a] px-3.5 py-2.5 text-[0.86rem] text-[#fff4e8]">
      <Icon className="size-4" />
      {children}
    </span>
  )
}
