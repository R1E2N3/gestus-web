import Link from 'next/link';
import Logo from '../Logo/page';

export default function Nav() {
  return (
    <nav className="flex justify-between items-center py-8 px-4 container mx-auto">
      <Link href="/">
        <Logo />
      </Link>
      <div className="flex items-center space-x-6">
        <Link href="/login" className="font-medium text-blue-600 hover:underline">
          Entrar
        </Link>
        <Link href="/get-started" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          Comece
        </Link>
      </div>
    </nav>
  );
} 