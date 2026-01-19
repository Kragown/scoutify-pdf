import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Lock } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-scout-dark font-sans selection:bg-scout-orange selection:text-black">

      {/* Navbar Minimalist */}
      <nav className="fixed w-full z-50 bg-black/50 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo Scoutify Text Exact Match */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-2xl tracking-tighter italic">
              <span className="text-white">#S</span>
              <span className="text-white">COUTIFY</span>
            </span>
          </div>


          <div className="hidden md:flex items-center gap-8">
            {/* Navigation removed as per request */}
          </div>

          <Link
            href="/create"
            className="bg-scout-orange hover:bg-orange-600 text-black font-extrabold text-sm py-2 px-6 rounded-full uppercase tracking-wide transition-all transform hover:scale-105"
          >
            Créez
          </Link>
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
            className="w-full md:w-auto border border-scout-orange text-white hover:bg-scout-orange hover:text-black font-black uppercase tracking-wider py-4 px-10 rounded-full transition-all flex items-center justify-center gap-2 group"
          >
            Créez maintenant
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            href="/staff"
            className="w-full md:w-auto bg-white/5 hover:bg-white/10 text-white border border-white/10 font-bold uppercase tracking-wider py-4 px-10 rounded-full transition-all flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4" />
            Accès Staff
          </Link>
        </div>
      </section>
    </div>
  );
}
