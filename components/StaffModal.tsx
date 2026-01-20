"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Lock } from "lucide-react";

interface StaffModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const STAFF_CODE = 1234;

export default function StaffModal({ isOpen, onClose }: StaffModalProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const codeNumber = parseInt(code, 10);
    if (codeNumber === STAFF_CODE) {
      router.push("/staff");
      onClose();
    } else {
      setError("Code incorrect. Veuillez réessayer.");
      setCode("");
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="bg-scout-dark border border-scout-orange/30 rounded-2xl p-8 w-full max-w-md mx-4 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Lock className="w-6 h-6 text-scout-orange" />
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">
              Accès Staff
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors"
            aria-label="Fermer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="code"
              className="block text-sm font-bold text-white/80 mb-2 uppercase tracking-wide"
            >
              Code d'accès
            </label>
            <input
              id="code"
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              value={code}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");
                if (value.length <= 4) {
                  setCode(value);
                }
              }}
              className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-scout-orange focus:ring-2 focus:ring-scout-orange/20 transition-all tracking-wider font-bold text-center text-2xl"
              placeholder="1234"
              autoFocus
              autoComplete="off"
            />
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg px-4 py-2 text-red-400 text-sm font-bold">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-6 rounded-lg uppercase tracking-wide transition-all"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 bg-scout-orange hover:bg-orange-600 text-black font-extrabold py-3 px-6 rounded-lg uppercase tracking-wide transition-all transform hover:scale-105"
            >
              Valider
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
