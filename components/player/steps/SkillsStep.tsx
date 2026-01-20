"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePlayerStore } from "@/store/usePlayerStore";
import { ArrowLeft, Check, Plus, Trash2, Trophy, Medal, Star, Crown } from "lucide-react";
import { z } from "zod";
import React from "react";
import clsx from "clsx";

// Types & Data
const DIVISIONS = [
    'Ligue 1', 'Ligue 2', 'National', 'National 2', 'National 3',
    'Régional 1', 'Régional 2', 'Régional 3',
    'Départemental 1', 'Départemental 2', 'Départemental 3',
    'Autre'
];

const CATEGORIES = [
    'U13', 'U14', 'U15', 'U16', 'U17', 'U18', 'U19', 'U20', 'U21', 'Séniors'
];

const BADGES = [
    { key: 'badge_capitanat', label: 'Capitaine', icon: Star },
    { key: 'badge_surclasse', label: 'Surclassé', icon: Crown },
    { key: 'badge_champion', label: 'Champion', icon: Trophy },
    { key: 'badge_coupe_remportee', label: 'Coupe', icon: Medal }
] as const;

// Schema Local Simplifié pour UI
const careerLocalSchema = z.object({
    career: z.array(z.object({
        year: z.string().min(4, "Saison requise (ex: 2023/2024)"),
        club: z.string().min(2, "Club requis"),
        categorie: z.string().min(1, "Catégorie requise"),
        division: z.string().min(1, "Division requise"),
        badge_capitanat: z.boolean().default(false),
        badge_surclasse: z.boolean().default(false),
        badge_champion: z.boolean().default(false),
        badge_coupe_remportee: z.boolean().default(false),
        saison_actuelle: z.boolean().default(false),
        matchs: z.number().nullable().optional(),
        buts: z.number().nullable().optional(),
        passes_decisives: z.number().nullable().optional(),
        temps_jeu_moyen: z.number().nullable().optional(),
    }))
        .min(1, "Au moins une saison est requise")
        .max(5, "Maximum 5 saisons")
});

type SkillsData = z.infer<typeof careerLocalSchema>;

export function SkillsStep() {
    const { data, updateData, setStep } = usePlayerStore();
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const form = useForm<SkillsData>({
        resolver: zodResolver(careerLocalSchema),
        defaultValues: {
            career: (data.career && data.career.length > 0 ? data.career.map(c => ({
                year: c.year || "",
                club: c.club || "",
                categorie: c.category || "",
                division: c.division || "",
                badge_capitanat: c.badge_capitanat || false,
                badge_surclasse: c.badge_surclasse || false,
                badge_champion: c.badge_champion || false,
                badge_coupe_remportee: c.badge_coupe_remportee || false,
                saison_actuelle: c.saison_actuelle || false,
                matchs: c.matchs || null,
                buts: c.buts || null,
                passes_decisives: c.passes_decisives || null,
                temps_jeu_moyen: c.temps_jeu_moyen || null
            })) : [{
                year: "", club: "", categorie: "", division: "",
                badge_capitanat: false, badge_surclasse: false, badge_champion: false, badge_coupe_remportee: false,
                saison_actuelle: false, matchs: null, buts: null, passes_decisives: null, temps_jeu_moyen: null
            }]) as any
        },
        mode: "onBlur"
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "career"
    });

    const onSubmit = async (formData: SkillsData) => {
        setIsSubmitting(true);
        // Sauvegarde locale dans le store (mapping inverse)
        updateData({
            career: formData.career.map(c => ({
                year: c.year,
                club: c.club,
                category: c.categorie,
                division: c.division,
                badge_capitanat: c.badge_capitanat,
                badge_surclasse: c.badge_surclasse,
                badge_champion: c.badge_champion,
                badge_coupe_remportee: c.badge_coupe_remportee,
                saison_actuelle: c.saison_actuelle,
                matchs: c.matchs || undefined,
                buts: c.buts || undefined,
                passes_decisives: c.passes_decisives || undefined,
                temps_jeu_moyen: c.temps_jeu_moyen || undefined
            }))
        });

        setIsSubmitting(false);
        setStep(5); // Go to Interests Step
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 animate-fade-in pb-20">

            <div className="flex items-center justify-between mb-6">
                <div className="space-y-1">
                    <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#F3E5AB] to-[#C5A028]">
                        Votre Parcours
                    </h2>
                    <p className="text-sm text-white/60">Ajoutez vos 5 dernières saisons.</p>
                </div>
                {fields.length < 5 && (
                    <button
                        type="button"
                        onClick={() => append({
                            year: "", club: "", categorie: "", division: "",
                            matchs: null, buts: null, passes_decisives: null, temps_jeu_moyen: null,
                            saison_actuelle: false, badge_capitanat: false, badge_surclasse: false, badge_champion: false, badge_coupe_remportee: false
                        })}
                        className="flex items-center gap-2 px-4 py-2 bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] rounded-full hover:bg-[#D4AF37]/20 transition-all text-sm font-bold"
                    >
                        <Plus className="w-4 h-4" />
                        Ajouter
                    </button>
                )}
            </div>

            <div className="space-y-6">
                {fields.map((field, index) => {
                    const isCurrent = form.watch(`career.${index}.saison_actuelle`);
                    return (
                        <div key={field.id} className="group relative bg-[#111] border border-white/5 rounded-2xl p-6 transition-all hover:border-[#D4AF37]/30 hover:shadow-[0_0_20px_rgba(212,175,55,0.05)]">
                            <div className="absolute top-4 right-4 text-[#D4AF37]/20 font-black text-6xl select-none -z-0">
                                {index + 1}
                            </div>

                            <div className="relative z-10 space-y-6">
                                {/* Header Ligne: Saison & Club */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider">Saison</label>
                                        <input
                                            {...form.register(`career.${index}.year`)}
                                            placeholder="Ex: 2023/2024"
                                            onInput={(e) => {
                                                const target = e.target as HTMLInputElement;
                                                target.value = target.value.replace(/[a-zA-Z]/g, '');
                                            }}
                                            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#D4AF37] outline-none transition-colors"
                                        />
                                        {form.formState.errors.career?.[index]?.year && (
                                            <p className="text-red-400 text-xs">{form.formState.errors.career[index]?.year?.message}</p>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider">Club</label>
                                        <input
                                            {...form.register(`career.${index}.club`)}
                                            placeholder="Nom du club"
                                            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#D4AF37] outline-none transition-colors"
                                        />
                                    </div>
                                </div>

                                {/* Ligne: Categorie & Division */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-white/50 uppercase tracking-wider">Catégorie</label>
                                        <select {...form.register(`career.${index}.categorie`)} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#D4AF37] outline-none appearance-none">
                                            <option value="">Choisir...</option>
                                            {CATEGORIES.map(c => <option key={c} value={c} className="bg-black">{c}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-white/50 uppercase tracking-wider">Division</label>
                                        <select {...form.register(`career.${index}.division`)} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#D4AF37] outline-none appearance-none">
                                            <option value="">Choisir...</option>
                                            {DIVISIONS.map(d => <option key={d} value={d} className="bg-black">{d}</option>)}
                                        </select>
                                    </div>
                                </div>

                                {/* Toggle Saison Actuelle */}
                                <div className="flex items-center gap-3 py-2">
                                    <input
                                        type="checkbox"
                                        id={`current-${index}`}
                                        {...form.register(`career.${index}.saison_actuelle`)}
                                        className="w-5 h-5 rounded border-white/20 bg-black/40 text-[#D4AF37] focus:ring-offset-0 focus:ring-[#D4AF37]"
                                    />
                                    <label htmlFor={`current-${index}`} className="text-sm text-white cursor-pointer select-none">
                                        C'est ma <span className="text-[#D4AF37] font-bold">saison actuelle</span>
                                    </label>
                                </div>

                                {/* Stats Section (Masquée si active) */}
                                {!isCurrent && (
                                    <div className="bg-black/30 rounded-xl p-4 border border-white/5 space-y-4">
                                        <p className="text-xs font-bold text-white/40 uppercase mb-2">Statistiques</p>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            <div>
                                                <input type="number" {...form.register(`career.${index}.matchs`, { valueAsNumber: true })} placeholder="Matchs" className="w-full bg-[#1A1A1A] border border-white/5 rounded-lg text-center py-2 text-white focus:border-[#D4AF37] outline-none text-sm" />
                                                <span className="text-[10px] text-white/30 block text-center mt-1">Matchs</span>
                                            </div>
                                            <div>
                                                <input type="number" {...form.register(`career.${index}.buts`, { valueAsNumber: true })} placeholder="Buts" className="w-full bg-[#1A1A1A] border border-white/5 rounded-lg text-center py-2 text-white focus:border-[#D4AF37] outline-none text-sm" />
                                                <span className="text-[10px] text-white/30 block text-center mt-1">Buts</span>
                                            </div>
                                            <div>
                                                <input type="number" {...form.register(`career.${index}.passes_decisives`, { valueAsNumber: true })} placeholder="Passes" className="w-full bg-[#1A1A1A] border border-white/5 rounded-lg text-center py-2 text-white focus:border-[#D4AF37] outline-none text-sm" />
                                                <span className="text-[10px] text-white/30 block text-center mt-1">Passes</span>
                                            </div>
                                            <div>
                                                <input type="number" {...form.register(`career.${index}.temps_jeu_moyen`, { valueAsNumber: true })} placeholder="Min/M" className="w-full bg-[#1A1A1A] border border-white/5 rounded-lg text-center py-2 text-white focus:border-[#D4AF37] outline-none text-sm" />
                                                <span className="text-[10px] text-white/30 block text-center mt-1">Jeu Moy.</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Badges */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-white/50 uppercase tracking-wider">Distinctions</label>
                                    <div className="flex flex-wrap gap-2">
                                        {BADGES.map(badge => {
                                            const Icon = badge.icon;
                                            const isChecked = form.watch(`career.${index}.${badge.key}`);
                                            return (
                                                <label key={badge.key} className={clsx(
                                                    "cursor-pointer flex items-center gap-2 px-3 py-2 rounded-lg border transition-all select-none",
                                                    isChecked
                                                        ? "bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37]"
                                                        : "bg-black/20 border-white/5 text-white/40 hover:border-white/20"
                                                )}>
                                                    <input type="checkbox" {...form.register(`career.${index}.${badge.key}`)} className="hidden" />
                                                    <Icon className="w-4 h-4" />
                                                    <span className="text-xs font-bold">{badge.label}</span>
                                                </label>
                                            )
                                        })}
                                    </div>
                                </div>

                                {fields.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => remove(index)}
                                        className="absolute top-4 right-4 md:static md:w-full mt-4 flex items-center justify-center gap-2 text-red-500/50 hover:text-red-500 text-sm py-2 hover:bg-red-500/10 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" /> Supprimer
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="flex justify-between items-center pt-8 border-t border-white/10">
                <button
                    type="button"
                    onClick={() => setStep(3)} // Step 3 depends on prev steps, assuming POSITION was 2. Skills is usually 3 or 4.
                    className="flex items-center gap-2 text-white/50 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" /> Retour
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 bg-gradient-to-r from-[#F3E5AB] to-[#C5A028] text-black font-bold py-3 px-8 rounded-xl shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:scale-105 transition-transform disabled:opacity-50 disabled:grayscale"
                >
                    {isSubmitting ? "Chargement..." : "Suivant"}
                    <Check className="w-5 h-5" />
                </button>
            </div>
        </form>
    );
}

