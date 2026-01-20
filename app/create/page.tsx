"use client";

import { usePlayerStore } from "@/store/usePlayerStore";
import { PlayerWizard } from "@/components/player/PlayerWizard";
import Link from 'next/link';

export default function CreateCVPage() {
    const { currentStep } = usePlayerStore();
    const totalSteps = 3;
    const progress = (currentStep / totalSteps) * 100;

    return (
        <div className="min-h-screen bg-scout-dark text-white flex flex-col font-sans">
            {/* Header */}
            <header className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-black/50 backdrop-blur-md sticky top-0 z-50">
                <Link href="/" className="font-bold text-lg flex items-center gap-2">
                    <span className="font-bold text-xl italic tracking-tighter">
                        <span className="text-white">#S</span>
                        <span className="text-white">COUTIFY</span>
                    </span>
                </Link>
                <div className="text-sm font-medium text-scout-muted">
                    Étape {Math.min(currentStep, 3)} sur 3
                </div>
            </header>

            {/* Progress Bar */}
            <div className="w-full h-1 bg-scout-card">
                <div
                    className="h-full bg-scout-orange transition-all duration-500 ease-out shadow-[0_0_10px_rgba(255,153,0,0.5)]"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Main Content */}
            <main className="flex-1 max-w-2xl mx-auto w-full p-6 md:py-12">
                <PlayerWizard />
            </main>
        </div>
    );
}
