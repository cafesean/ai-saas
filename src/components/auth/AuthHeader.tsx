'use client';

import Image from 'next/image';

interface AuthHeaderProps {
  title: string;
}

export default function AuthHeader({ title }: AuthHeaderProps) {
  return (
    <div className="flex items-center justify-center space-x-4">
      <Image
        src="/logo-small.svg"
        alt="Logo"
        width={40}
        height={40}
      />
      <h2 className="text-3xl font-bold tracking-tight text-gray-900">
        {title}
      </h2>
    </div>
  );
}