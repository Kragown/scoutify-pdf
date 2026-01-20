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

export function SkillsStep() {
    const { data, updateData, setStep } = usePlayerStore();

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

    const onSubmit = (formData: SkillsData) => {
        // @ts-ignore
        updateData(formData);
        setStep(4); // Or finish
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
                                <input {...form.register(`career.${index}.division` as const)} placeholder="Division" className="input-field" />
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
                    className="bg-scout-orange hover:bg-orange-600 text-black font-bold py-3 px-8 rounded-xl flex items-center gap-2 transition-transform hover:scale-105 shadow-lg shadow-orange-900/20"
                >
                    Terminer
                    <Check className="w-5 h-5" />
                </button>
            </div>
        </form>
    );
}
