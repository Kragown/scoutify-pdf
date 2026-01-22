"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { positionSchema } from "@/lib/schemas";
import { usePlayerStore } from "@/store/usePlayerStore";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { z } from "zod";
import clsx from "clsx";
import { motion } from "framer-motion";
import { useEffect } from "react";

type PositionData = z.infer<typeof positionSchema>;

// Postes pour la formation 3-5-2
const POSITIONS_352: Record<string, { x: number; y: number; label: string }> = {
    "GB": { x: 50, y: 90, label: "Gardien" },
    "DC": { x: 50, y: 75, label: "Défenseur Central" },
    "Piston G": { x: 15, y: 60, label: "Piston Gauche" },
    "Piston D": { x: 85, y: 60, label: "Piston Droit" },
    "MDC": { x: 50, y: 55, label: "Milieu Défensif Central" },
    "MC": { x: 35, y: 45, label: "Milieu Central Gauche" },
    "MOC": { x: 65, y: 45, label: "Milieu Offensif Central" },
    "BU": { x: 40, y: 20, label: "Buteur Gauche" },
    "AD": { x: 60, y: 20, label: "Attaquant Droit" },
};

// Postes pour la formation 4-3-3
const POSITIONS_433: Record<string, { x: number; y: number; label: string }> = {
    "GB": { x: 50, y: 90, label: "Gardien" },
    "DG": { x: 15, y: 75, label: "Défenseur Gauche" },
    "DC": { x: 50, y: 78, label: "Défenseur Central" },
    "DD": { x: 85, y: 75, label: "Défenseur Droit" },
    "MDC": { x: 50, y: 55, label: "Milieu Défensif Central" },
    "MC": { x: 35, y: 45, label: "Milieu Central" },
    "MOC": { x: 65, y: 45, label: "Milieu Offensif Central" },
    "AG": { x: 15, y: 20, label: "Ailier Gauche" },
    "BU": { x: 50, y: 15, label: "Buteur" },
    "AD": { x: 85, y: 20, label: "Ailier Droit" },
};

export function PositionStep() {
    const { data, updateData, setStep } = usePlayerStore();

    const form = useForm<PositionData>({
        resolver: zodResolver(positionSchema),
        defaultValues: {
            formation: data.formation || undefined,
            primaryPosition: data.primaryPosition || "",
            secondaryPosition: data.secondaryPosition || "",
        }
    });

    const selectedFormation = form.watch("formation");
    const POSITIONS = selectedFormation === "3-5-2" ? POSITIONS_352 : POSITIONS_433;

    // Réinitialiser les postes quand la formation change
    useEffect(() => {
        if (selectedFormation) {
            form.setValue("primaryPosition", "");
            form.setValue("secondaryPosition", "");
        }
    }, [selectedFormation]);

    const onSubmit = (formData: PositionData) => {
        updateData(formData);
        setStep(3);
    };

    const handlePositionClick = (posKey: string) => {
        const currentPrimary = form.getValues("primaryPosition");
        if (!currentPrimary) {
            form.setValue("primaryPosition", posKey);
        } else if (currentPrimary === posKey) {
            form.setValue("primaryPosition", "");
        } else {
            const currentSecondary = form.getValues("secondaryPosition");
            if (currentSecondary === posKey) {
                form.setValue("secondaryPosition", "");
            } else {
                form.setValue("secondaryPosition", posKey);
            }
        }
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 animate-fade-in">
            <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white">Poste</h2>
                <p className="text-sm text-scout-muted">Choisissez votre formation puis sélectionnez votre position <span className="text-red-500">*</span>.</p>
            </div>

            {/* SÉLECTION DE FORMATION */}
            <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white">Formation <span className="text-red-500">*</span></h3>
                <div className="grid grid-cols-2 gap-4">
                    <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => form.setValue("formation", "3-5-2")}
                        className={clsx(
                            "p-6 rounded-xl border-2 transition-all text-center font-bold text-lg",
                            selectedFormation === "3-5-2"
                                ? "bg-scout-orange/20 border-scout-orange text-scout-orange shadow-lg shadow-orange-900/30"
                                : "bg-scout-card border-white/10 text-white/70 hover:border-white/30"
                        )}
                    >
                        3-5-2
                    </motion.button>
                    <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => form.setValue("formation", "4-3-3")}
                        className={clsx(
                            "p-6 rounded-xl border-2 transition-all text-center font-bold text-lg",
                            selectedFormation === "4-3-3"
                                ? "bg-scout-orange/20 border-scout-orange text-scout-orange shadow-lg shadow-orange-900/30"
                                : "bg-scout-card border-white/10 text-white/70 hover:border-white/30"
                        )}
                    >
                        4-3-3
                    </motion.button>
                </div>
                {form.formState.errors.formation && (
                    <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-sm flex items-center gap-2">
                        ⚠️ {form.formState.errors.formation.message}
                    </div>
                )}
            </div>

            {/* TERRAIN - Affiché seulement si formation choisie */}
            {selectedFormation && (
                <div className="flex flex-col md:flex-row gap-8 items-start">
                    {/* PITCH VISUALIZATION */}
                    <div className="relative w-full md:w-[400px] aspect-[2/3] bg-scout-orange/5 border-2 border-white/20 rounded-xl overflow-hidden shadow-2xl mx-auto backdrop-blur-sm">
                        {/* Pitch Lines */}
                        <div className="absolute inset-4 border-2 border-white/20 rounded-sm"></div>
                        <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-white/10 -translate-x-1/2"></div>
                        <div className="absolute top-1/2 left-1/2 w-24 h-24 border-2 border-white/10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-16 border-b-2 border-x-2 border-white/20 rounded-b-lg"></div>
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-16 border-t-2 border-x-2 border-white/20 rounded-t-lg"></div>

                        {/* Formation Label */}
                        <div className="absolute top-2 right-2 bg-scout-orange text-black px-3 py-1 rounded-lg text-xs font-bold">
                            {selectedFormation}
                        </div>

                        {/* Positions */}
                        {Object.entries(POSITIONS).map(([key, pos]) => {
                            const isPrimary = form.watch("primaryPosition") === key;
                            const isSecondary = form.watch("secondaryPosition") === key;

                            return (
                                <motion.button
                                    key={key}
                                    type="button"
                                    whileHover={{ scale: 1.2 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => handlePositionClick(key)}
                                    className={clsx(
                                        "absolute w-10 h-10 -ml-5 -mt-5 rounded-full flex items-center justify-center font-bold text-xs transition-all shadow-lg border-2",
                                        isPrimary ? "bg-scout-orange text-black border-white scale-110 z-20" :
                                            isSecondary ? "bg-white text-black border-scout-orange scale-105 z-10" :
                                                "bg-black/60 text-white/70 border-white/30 hover:bg-white/20 hover:border-white"
                                    )}
                                    style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                                >
                                    {key}
                                </motion.button>
                            );
                        })}
                    </div>

                    {/* CONTROLS */}
                    <div className="flex-1 space-y-6 w-full">
                        <div className="p-4 bg-scout-card border border-white/10 rounded-xl space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-4 h-4 rounded-full bg-scout-orange border border-white"></div>
                                <span className="text-sm font-medium text-white">Poste Principal <span className="text-red-500">*</span></span>
                                <span className="ml-auto text-scout-orange font-bold">{form.watch("primaryPosition") || "-"}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-4 h-4 rounded-full bg-white border border-scout-orange"></div>
                                <span className="text-sm font-medium text-white">Poste Secondaire</span>
                                <span className="ml-auto text-white font-bold">{form.watch("secondaryPosition") || "-"}</span>
                            </div>
                        </div>

                        {form.formState.errors.primaryPosition && (
                            <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-sm flex items-center gap-2">
                                ⚠️ Sélectionnez au moins un poste principal
                            </div>
                        )}

                        <div className="text-xs text-scout-muted leading-relaxed">
                            Cliquez sur les points du terrain pour sélectionner votre poste.
                            <br />
                            Premier clic : <span className="text-scout-orange">Principal</span>
                            <br />
                            Second clic (autre poste) : <span className="text-white">Secondaire</span>
                        </div>
                    </div>
                </div>
            )}

            <div className="pt-6 flex justify-between items-center border-t border-white/10">
                <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-scout-muted hover:text-white transition-colors flex items-center gap-2"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Retour
                </button>
                <button
                    type="submit"
                    className="bg-scout-orange hover:bg-orange-600 text-black font-bold py-3 px-8 rounded-xl flex items-center gap-2 transition-transform hover:scale-105 shadow-lg shadow-orange-900/20"
                >
                    Suivant
                    <ArrowRight className="w-5 h-5" />
                </button>
            </div>
        </form>
    );
}
