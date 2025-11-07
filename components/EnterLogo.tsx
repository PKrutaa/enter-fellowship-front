'use client';

import React from 'react';
import Image from 'next/image';

interface EnterLogoProps {
  className?: string;
  variant?: 'full' | 'icon';
}

export default function EnterLogo({ className = "h-8", variant = 'full' }: EnterLogoProps) {
  if (variant === 'icon') {
    return (
      <div className={className}>
        <svg width="30" height="33" viewBox="0 0 458 511" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M451.427 0H166.682C163.368 0 160.682 2.68629 160.682 6V279.082C160.682 282.396 157.996 285.082 154.682 285.082H6C2.68629 285.082 0 287.768 0 291.082V504.556C0 507.869 2.68629 510.556 6 510.556H451.427C454.741 510.556 457.427 507.869 457.427 504.556V6C457.427 2.68629 454.741 0 451.427 0Z" fill="#FFAE35"/>
        </svg>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg width="30" height="33" viewBox="0 0 458 511" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M451.427 0H166.682C163.368 0 160.682 2.68629 160.682 6V279.082C160.682 282.396 157.996 285.082 154.682 285.082H6C2.68629 285.082 0 287.768 0 291.082V504.556C0 507.869 2.68629 510.556 6 510.556H451.427C454.741 510.556 457.427 507.869 457.427 504.556V6C457.427 2.68629 454.741 0 451.427 0Z" fill="#FFAE35"/>
      </svg>
      <span className="text-2xl font-bold tracking-tight text-white">
        ENTER
      </span>
    </div>
  );
}

