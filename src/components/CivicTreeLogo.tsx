'use client';

import Image from 'next/image';

type CivicTreeLogoProps = {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  tone?: 'light' | 'dark';
};

const sizes = {
  sm: 'h-9 w-[119px]',
  md: 'h-12 w-[159px]',
  lg: 'h-24 w-[317px] max-w-full',
};

export default function CivicTreeLogo({
  className = '',
  size = 'md',
  tone = 'light',
}: CivicTreeLogoProps) {
  return (
    <span className={`relative inline-block shrink-0 ${sizes[size]} ${className}`}>
      <Image
        src={tone === 'dark' ? '/civictree-wordmark-white-tight.png' : '/civictree-wordmark-tight.png'}
        alt="CivicTree"
        fill
        className="object-contain"
        sizes={size === 'lg' ? '317px' : size === 'md' ? '159px' : '119px'}
        loading="eager"
      />
    </span>
  );
}
