"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { fullPlayerSchema } from "@/lib/schemas"; // Using full schema part for types or defining new
import { usePlayerStore } from "@/store/usePlayerStore";
import { ArrowLeft, Check, Plus, Trash2 } from "lucide-react";
import { z } from "zod";
import clsx from "clsx";

// Use simplified local schema for this step to avoid complex full merge types issues in component
const skillsStepSchema = z.object({
    qualites: z.array(z.string()).min(1, "Sélectionnez au moins une qualité").max(6, "Maximum 6 qualités"),
    career: z.array(z.object({
        year: z.string().min(4, "Année ???"),
        club: z.string().min(2, "Club ???"),
        category: z.string().optional(),
        division: z.string().optional(),
    })).optional()
});

type SkillsData = z.infer<typeof skillsStepSchema>;

const QUALITIES_LIST = [
    "Vitesse", "Accélération", "Endurance", "Puissance", "Détente",
    "Technique", "Dribble", "Contrôle", "Finition", "Passes courtes", "Passes longues",
    "Vision", "Placement", "Anticipation", "Leadership", "Agressivité (positive)",
    "Jeu de tête", "Tacles", "Marquage", "Réflexes (GB)", "Jeu au pied (GB)"
];

const DIVISIONS = [
    'Ligue 1', 'Ligue 2', 'National', 'National 2', 'National 3',
    'Régional 1', 'Régional 2', 'Régional 3',
    'Départemental 1', 'Départemental 2', 'Départemental 3',
    'Autre'
];

export function SkillsStep() {
    const { data, updateData, setStep } = usePlayerStore();
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const form = useForm<SkillsData>({
        resolver: zodResolver(skillsStepSchema),
        defaultValues: {
            qualites: data.qualites || [],
            // @ts-ignore - career type mapping
            career: data.career || [{ year: "", club: "", category: "", division: "" }]
        },
        mode: "onBlur"
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "career"
    });

    const onSubmit = async (formData: SkillsData) => {
        setIsSubmitting(true);
        updateData(formData);

        const completeData = { ...data, ...formData };

        try {
            const payload = {
                nom: completeData.lastName,
                prenom: completeData.firstName,
                nationalites: completeData.nationality,
                date_naissance: completeData.birthDate,
                pied_fort: completeData.strongFoot,
                taille_cm: parseInt(completeData.height || "0"),
                couleur_cv: completeData.cvColor,
                poste_principal: completeData.primaryPosition,
                poste_secondaire: completeData.secondaryPosition || null,
                url_transfermarkt: completeData.statsLink || null,
                photo_joueur: completeData.photoUrl || "",
                vma: completeData.vma ? parseFloat(completeData.vma.replace(',', '.')) : null,
                envergure: completeData.envergure ? parseFloat(completeData.envergure) : null,
                email: completeData.email,
                telephone: completeData.phone,
                email_agent_sportif: null,
                telephone_agent_sportif: null,
                qualites: completeData.qualites,
                status: "À traiter",

                // MAPPING INTELLIGENT
                saisons: formData.career?.map((c, index) => ({
                    club: c.club,
                    // On combine l'année dans la catégorie pour ne pas perdre l'info car pas de colonne 'annee' en BDD
                    categorie: c.year ? `${c.category || 'Séniors'} (${c.year})` : (c.category || "Séniors"),
                    division: c.division && DIVISIONS.includes(c.division) ? c.division : "Autre",
                    logo_club: "/logos/default-club.png",
                    logo_division: "/logos/default-division.png",
                    badge_capitanat: false,
                    badge_surclasse: false,
                    badge_champion: false,
                    badge_coupe_remportee: false,
                    matchs: index === 0 ? null : 0, // Matchs null pour saison actuelle (assumée index 0)
                    buts: 0,
                    passes_decisives: 0,
                    temps_jeu_moyen: null,
                    saison_actuelle: index === 0, // La première ligne est considérée comme actuelle
                    ordre: index
                })) || []
            };

            // Validation DEBUG CLIENT - Vérifie ce qui manque avant l'envoi
            const missingFields = [];
            if (!payload.nom) missingFields.push("Nom");
            if (!payload.prenom) missingFields.push("Prénom");
            if (!payload.nationalites) missingFields.push("Nationalité");
            if (!payload.date_naissance) missingFields.push("Date de naissance");
            if (!payload.pied_fort) missingFields.push("Pied fort");
            if (!payload.taille_cm) missingFields.push("Taille");
            if (!payload.poste_principal) missingFields.push("Poste principal");
            if (!payload.photo_joueur) missingFields.push("Photo du joueur");
            if (!payload.email) missingFields.push("Email");
            if (!payload.telephone) missingFields.push("Téléphone");

            if (missingFields.length > 0) {
                alert(`Il manque des informations obligatoires (étape 1 ou 2) : \n- ${missingFields.join("\n- ")}`);
                setIsSubmitting(false);
                return;
            }

            const response = await fetch('/api/formulaires-joueur', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Erreur inconnue");
            }

            setStep(4);

        } catch (error: any) {
            alert("Erreur lors de la sauvegarde : " + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleQuality = (q: string) => {
        const current = form.getValues("qualites");
        if (current.includes(q)) {
            form.setValue("qualites", current.filter(i => i !== q));
        } else {
            if (current.length < 6) {
                form.setValue("qualites", [...current, q]);
            }
        }
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 animate-fade-in pb-10">

            {/* SECTION 1: QUALITÉS */}
            <div className="space-y-4">
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-white">Vos Qualités</h2>
                    <p className="text-sm text-scout-muted">Sélectionnez vos points forts (1 à 6).</p>
                </div>

                <div className="flex flex-wrap gap-3">
                    {QUALITIES_LIST.map((q) => {
                        const isSelected = form.watch("qualites")?.includes(q);
                        return (
                            <button
                                key={q}
                                type="button"
                                onClick={() => toggleQuality(q)}
                                className={clsx(
                                    "px-4 py-2 rounded-full text-sm font-medium transition-all border",
                                    isSelected
                                        ? "bg-scout-orange text-black border-scout-orange shadow-[0_0_10px_rgba(255,153,0,0.3)]"
                                        : "bg-black/40 text-white/60 border-white/10 hover:border-white/40 hover:text-white"
                                )}
                            >
                                {q}
                            </button>
                        );
                    })}
                </div>
                {form.formState.errors.qualites && (
                    <p className="text-red-400 text-sm">{form.formState.errors.qualites.message}</p>
                )}
            </div>

            <div className="border-t border-white/10" />

            {/* SECTION 2: PARCOURS */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-bold text-white">Parcours</h2>
                        <p className="text-sm text-scout-muted">Vos clubs précédents.</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => append({ year: "", club: "", category: "", division: "" })}
                        className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-4">
                    {fields.map((field, index) => (
                        <div key={field.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 bg-scout-card border border-white/5 rounded-xl animate-fade-in">
                            <div className="md:col-span-2">
                                <input {...form.register(`career.${index}.year` as const)} placeholder="Saison" className="input-field text-center" />
                            </div>
                            <div className="md:col-span-4">
                                <input {...form.register(`career.${index}.club` as const)} placeholder="Club" className="input-field" />
                            </div>
                            <div className="md:col-span-3">
                                <input {...form.register(`career.${index}.category` as const)} placeholder="Catégorie (U19...)" className="input-field" />
                            </div>
                            <div className="md:col-span-2">
                                <select {...form.register(`career.${index}.division` as const)} className="input-field appearance-none">
                                    <option value="">Div...</option>
                                    {DIVISIONS.map(d => (
                                        <option key={d} value={d} className="bg-scout-card">{d}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="md:col-span-1 flex justify-center items-center">
                                {fields.length > 1 && (
                                    <button type="button" onClick={() => remove(index)} className="text-red-500 hover:text-red-400 p-2">
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

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
                    disabled={isSubmitting}
                    className="bg-scout-orange hover:bg-orange-600 text-black font-bold py-3 px-8 rounded-xl flex items-center gap-2 transition-transform hover:scale-105 shadow-lg shadow-orange-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? "Envoi..." : "Terminer"}
                    <Check className="w-5 h-5" />
                </button>
            </div>
        </form>
    );
}

// Add missing React import if needed locally, though next.js handles it often, better safe
import React from 'react';
