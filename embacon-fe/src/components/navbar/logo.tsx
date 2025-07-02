"use client";

import Link from "next/link"
import React from "react";

interface LogoProps {
  text: string;
}

const Logo: React.FC<LogoProps> = ({ text }: LogoProps) => {
  return (
    <Link
      href="/"
      className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 
        animate-gradient-x bg-[length:200%_100%] 
        bg-clip-text text-transparent 
        hover:opacity-80 transition-all duration-300 text-glow hover:scale-105"
    >
      {text}
    </Link>
  );
};

export default Logo;