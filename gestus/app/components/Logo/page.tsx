import Image from 'next/image';
import logoImg from '../../images/logo.png';

export default function Logo() {
  return (
    <div className="flex items-center">
      <Image src={logoImg} alt="Gestus Logo" width={48} height={48} className="h-12 w-12" />
    </div>
  );
} 