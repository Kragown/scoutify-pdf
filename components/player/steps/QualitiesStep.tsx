"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { usePlayerStore } from "@/store/usePlayerStore";
import { ArrowLeft, ArrowRight, Plus, X } from "lucide-react";
import clsx from "clsx";
import { useState } from "react";

// Schéma de validation pour les qualités
const qualitiesStepSchema = z.object({
    qualites: z.array(
        z.string()
            .min(1, "Une qualité ne peut pas être vide")
            .max(24, "Maximum 24 caractères par qualité")
    )
        .min(1, "Sélectionnez ou ajoutez au moins une qualité")
        .max(6, "Maximum 6 qualités autorisées"),
});

type QualitiesData = z.infer<typeof qualitiesStepSchema>;

// Liste complète des qualités prédéfinies
const QUALITIES_LIST = [
    "Vitesse", "Accélération", "Endurance", "Puissance", "Détente",
    "Technique", "Dribble", "Contrôle", "Finition", "Passes courtes", "Passes longues",
    "Vision", "Placement", "Anticipation", "Leadership", "Agressivité (positive)",
    "Jeu de tête", "Tacles", "Marquage", "Réflexes (GB)", "Jeu au pied (GB)"
];

export function QualitiesStep() {
    const { data, updateData, setStep } = usePlayerStore();
    const [customQualityInput, setCustomQualityInput] = useState<string>("");

    // Configuration du formulaire
    const form = useForm<QualitiesData>({
        resolver: zodResolver(qualitiesStepSchema),
        defaultValues: {
            qualites: (data.qualites as string[]) || [],
        },
        mode: "onBlur"
    });

    // Bascule la sélection d'une qualité prédéfinie
    const toggleQuality = (quality: string): void => {
        const current = form.getValues("qualites");
        if (current.includes(quality)) {
            form.setValue("qualites", current.filter(q => q !== quality));
        } else {
            if (current.length < 6) {
                form.setValue("qualites", [...current, quality]);
            }
        }
    };

    // Ajoute une qualité personnalisée
    const handleAddCustomQuality = (): void => {
        const trimmed = customQualityInput.trim();
        
        // Vérification : max 24 caractères
        if (trimmed.length === 0) {
            return;
        }
        if (trimmed.length > 24) {
            alert("Veuillez rester dans la limite de 24 caractères");
            return;
        }

        const current = form.getValues("qualites");
        if (current.includes(trimmed)) {
            alert("Cette qualité est déjà ajoutée");
            return;
        }

        if (current.length < 6) {
            form.setValue("qualites", [...current, trimmed]);
            setCustomQualityInput(""); // Vide le champ après ajout
        }
    };

    // Supprime une qualité
    const handleRemoveQuality = (quality: string): void => {
        const current = form.getValues("qualites");
        form.setValue("qualites", current.filter(q => q !== quality));
    };

    // Soumet et passe à l'étape suivante
    const onSubmit = (formData: QualitiesData): void => {
        updateData(formData);
        setStep(4);
    };

    const selectedCount = form.watch("qualites").length;
    const remainingChars = 24 - customQualityInput.length;

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 animate-fade-in pb-10">

            {/* ========== SECTION 1: QUALITÉS PRÉDÉFINIES ========== */}
            <div className="space-y-6">
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-white">Qualités Sportives</h2>
                    <p className="text-sm text-scout-muted">
                        Sélectionnez vos points forts ({selectedCount}/6)
                    </p>
                </div>

                {/* Grille de qualités prédéfinies */}
                <div className="space-y-4">
                    <p className="text-sm text-white/70 font-medium">Qualités prédéfinies :</p>
                    <div className="flex flex-wrap gap-3">
                        {QUALITIES_LIST.map((quality) => {
                            const isSelected = form.watch("qualites").includes(quality);
                            const isDisabled = !isSelected && selectedCount >= 6;

                            return (
                                <button
                                    key={quality}
                                    type="button"
                                    onClick={() => toggleQuality(quality)}
                                    disabled={isDisabled}
                                    className={clsx(
                                        "px-4 py-2 rounded-full text-sm font-medium transition-all border",
                                        isSelected
                                            ? "bg-scout-orange text-black border-scout-orange shadow-[0_0_10px_rgba(212,175,55,0.5)]"
                                            : isDisabled
                                            ? "bg-black/20 text-white/30 border-white/5 cursor-not-allowed"
                                            : "bg-black/40 text-white/60 border-white/10 hover:border-white/40 hover:text-white hover:bg-white/5 cursor-pointer"
                                    )}
                                >
                                    {quality}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="border-t border-white/10" />

            {/* ========== SECTION 2: QUALITÉS PERSONNALISÉES ========== */}
            <div className="space-y-6">
                <div className="space-y-2">
                    <h2 className="text-lg font-bold text-white">Ajouter une qualité personnalisée</h2>
                    <p className="text-sm text-scout-muted">
                        Saisie libre - Maximum 24 caractères
                    </p>
                </div>

                {/* Champ de saisie libre */}
                <div className="space-y-2">
                    <div className="flex gap-2">
                        <div className="flex-1">
                            <input
                                type="text"
                                value={customQualityInput}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    // Soft-block : empêche la saisie au-delà de 24 caractères
                                    if (value.length <= 24) {
                                        setCustomQualityInput(value);
                                    }
                                }}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleAddCustomQuality();
                                    }
                                }}
                                placeholder="Ex: Endurance cardio-vasculaire"
                                className="input-field"
                                maxLength={24}
                            />
                            <p className="text-xs text-white/50 mt-1">
                                {customQualityInput.length}/24 caractères
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={handleAddCustomQuality}
                            disabled={customQualityInput.trim().length === 0 || selectedCount >= 6}
                            className="bg-scout-orange hover:bg-orange-600 text-black font-bold py-2 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Ajouter
                        </button>
                    </div>
                </div>
            </div>

            {/* ========== SECTION 3: AFFICHAGE DES QUALITÉS SÉLECTIONNÉES ========== */}
            <div className="space-y-4">
                {selectedCount > 0 && (
                    <div className="p-4 bg-white/5 rounded-lg border border-scout-orange/30">
                        <p className="text-white/80 text-sm font-medium mb-3">Qualités sélectionnées ({selectedCount}/6) :</p>
                        <div className="flex flex-wrap gap-2">
                            {form.watch("qualites").map((quality) => (
                                <span
                                    key={quality}
                                    className="bg-scout-orange/20 text-scout-orange px-3 py-2 rounded-full text-xs font-medium border border-scout-orange/40 flex items-center gap-2 group"
                                >
                                    {quality}
                                    {/* Bouton pour supprimer la qualité */}
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveQuality(quality)}
                                        className="hover:text-scout-orange/60 cursor-pointer ml-1 group-hover:opacity-100 opacity-70 transition-opacity"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Affichage des erreurs */}
                {form.formState.errors.qualites && (
                    <p className="text-red-400 text-sm">{form.formState.errors.qualites.message}</p>
                )}
            </div>

            {/* Boutons de navigation */}
            <div className="pt-6 flex justify-between items-center border-t border-white/10">
                <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="text-scout-muted hover:text-white transition-colors flex items-center gap-2"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Retour
                </button>
                <button
                    type="submit"
                    className="bg-scout-orange hover:bg-orange-600 text-black font-bold py-3 px-8 rounded-xl flex items-center gap-2 transition-transform hover:scale-105"
                >
                    Suivant
                    <ArrowRight className="w-5 h-5" />
                </button>
            </div>
        </form>
    );
}