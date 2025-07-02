"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
}

const NavLink: React.FC<NavLinkProps> = ({ href, children, onClick }) => {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`no-underline group cursor-pointer relative rounded-full p-px text-xs font-bold leading-6 text-white hover:text-cyan-300 inline-block transition-all duration-300 hover-lift
        ${isActive ? "neon-glow-blue" : ""}`}
    >
      <span className="absolute inset-0 overflow-hidden rounded-full">
        <span
          className={`absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/20 via-cyan-400/20 to-blue-500/20 transition-opacity duration-500 ${
            isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
        ></span>
      </span>
      <div className={`relative flex space-x-2 items-center z-10 rounded-full glass py-2 px-6 transition-all duration-300 group-hover:scale-105 ${
        isActive ? "border border-blue-400/50" : "border border-blue-400/20"
      }`}>
        {children}
      </div>
      <span
        className={`absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-cyan-400/0 via-cyan-400/90 to-cyan-400/0 transition-opacity duration-500 ${
          isActive ? "opacity-60" : "opacity-0 group-hover:opacity-40"
        }`}
      ></span>
    </Link>
  );
};

export default NavLink;
