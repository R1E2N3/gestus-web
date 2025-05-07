import Link from 'next/link';
import Logo from '../Logo/page';
import Image from 'next/image';
import logoImg from '../../images/logo.png';

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/our-solution", label: "Our Solution" },
  { href: "/about", label: "About Us" },
  { href: "/prototype", label: "Prototype" },
];

export default function Nav() {
  return (
    <nav className="fixed top-4 inset-x-0 z-50 w-full">
      <div className="bg-transparent px-6 py-2 flex items-center justify-between w-full">
        {/* Logo on the left */}
        <Link href="/">
          <div className="overflow-hidden w-16 h-16 flex items-center justify-center p-1">
            <Image src={logoImg} alt="Gestus Logo" width={40} height={40} className="object-contain" />
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
  );
} 