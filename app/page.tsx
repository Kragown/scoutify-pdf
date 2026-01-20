"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";
import { ArrowRight, Lock, Star, Zap } from "lucide-react";
import StaffModal from "@/components/StaffModal";

export default function Home() {
  const [isStaffModalOpen, setIsStaffModalOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-scout-dark font-sans selection:bg-scout-orange selection:text-black">

      {/* Navbar Minimalist */}
      <nav className="fixed w-full z-50 bg-black/50 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F3E5AB] to-[#C5A028] flex items-center justify-center text-black font-bold text-xl font-serif">
              S
            </div>
            <span className="font-bold text-xl tracking-widest text-[#D4AF37]">
              SCOUTIFY
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {/* Navigation removed as per request */}
          </div>

          <button
            onClick={() => setIsStaffModalOpen(true)}
            className="bg-gradient-to-r from-[#F3E5AB] to-[#C5A028] hover:opacity-90 text-black font-extrabold text-sm py-2 px-6 rounded-full uppercase tracking-wide transition-all transform hover:scale-105 shadow-[0_0_15px_rgba(212,175,55,0.4)]"
          >
            STAFF
          </button>
        </div>
      </nav>

      {/* Hero Section Exact Match */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 overflow-hidden">


        {/* Center Logo Glow */}
        <div className="mb-8 relative animate-fade-in-up">

          {/* Hexagon Logo Simulation */}

        </div>

        <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter text-white mb-2 leading-[0.9] uppercase animate-fade-in-up delay-100">
          Créez votre
        </h1>
        <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter text-scout-orange mb-8 leading-[0.9] uppercase animate-fade-in-up delay-200">
          CV Professionnel
        </h1>

        <div className="flex flex-col md:flex-row items-center justify-center gap-6 w-full animate-fade-in-up delay-400">
          <Link
            href="/create"
            className="w-full md:w-auto bg-gradient-to-b from-[#F3E5AB] to-[#C5A028] text-black hover:scale-105 font-black uppercase tracking-wider py-4 px-10 rounded-full transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(212,175,55,0.3)]"
          >
            Créez maintenant
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      <StaffModal
        isOpen={isStaffModalOpen}
        onClose={() => setIsStaffModalOpen(false)}
      />
    </div>
  );
}
