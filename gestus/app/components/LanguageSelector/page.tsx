import Link from 'next/link';

export default function LanguageSelector() {
  return (
    <div className="flex space-x-4">
      <Link href="/libras" className="px-6 py-3 border-2 border-accent text-accent rounded-md hover:bg-accent hover:text-white transition">
        LIBRAS
      </Link>
      <Link href="/asl" className="px-6 py-3 border-2 border-accent text-accent rounded-md hover:bg-accent hover:text-white transition">
        ASL
      </Link>
    </div>
  );
} 