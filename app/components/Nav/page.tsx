import Link from "next/link"

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/our-solution", label: "Our Solution" },
  { href: "/about", label: "About Us" },
  { href: "/prototype", label: "Prototype" },
]

export default function Nav() {
  return (
    <nav className="relative w-full">
      <div className="bg-transparent px-6 py-2 flex items-center justify-between w-full">
        {/* Logo on the left */}
        <Link href="/">
          <div className="overflow-hidden w-16 h-16 flex items-center justify-center p-1 bg-[#ffd23f] rounded-full text-white font-bold">
            G
          </div>
        </Link>
        {/* Centered links */}
        <div className="flex-1 flex justify-center">
          <div className="flex space-x-10">
            {navLinks.slice(1).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xl font-semibold text-[var(--foreground)] hover:text-[var(--accent)] transition"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        {/* Spacer to balance the logo's width */}
        <div className="w-10 h-10" />
      </div>
    </nav>
  )
}
