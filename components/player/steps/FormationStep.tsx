"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePlayerStore } from "@/store/usePlayerStore";
import { ArrowLeft, ArrowRight, Plus, Trash2, GraduationCap } from "lucide-react";
import { z } from "zod";
import React from "react";
import { formationsSchema } from "@/lib/schemas";

// Schema local pour le formulaire
const formationFormSchema = z.object({
    formations: formationsSchema
});

type FormationFormData = z.infer<typeof formationFormSchema>;

export function FormationStep() {
    const { data, updateData, setStep } = usePlayerStore();

    const form = useForm<FormationFormData>({
        resolver: zodResolver(formationFormSchema),
        defaultValues: {
            formations: (data.formations && data.formations.length > 0 ? data.formations : []) as any
        },
        mode: "onBlur"
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "formations"
    });

    const onSubmit = (formData: FormationFormData) => {
        updateData({ formations: formData.formations });
        setStep(6); // Go to Interests Step
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 animate-fade-in pb-20">
            <div className="flex items-center justify-between mb-6">
                <div className="space-y-1">
                    <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#F3E5AB] to-[#C5A028]">
                        Formations
                    </h2>
                    <p className="text-sm text-white/60">Ajoutez vos formations (Centre de formation, Pôle espoir, sélections...).</p>
                </div>
                <button
                    type="button"
                    onClick={() => append({ annee_ou_periode: "", titre_structure: "", details: "", ordre: fields.length })}
                    className="flex items-center gap-2 px-4 py-2 bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] rounded-full hover:bg-[#D4AF37]/20 transition-all text-sm font-bold"
                >
                    <Plus className="w-4 h-4" />
                    Ajouter
                </button>
            </div>

            <div className="space-y-6">
                {fields.map((field, index) => (
                    <div key={field.id} className="group relative bg-[#111] border border-white/5 rounded-2xl p-6 transition-all hover:border-[#D4AF37]/30 hover:shadow-[0_0_20px_rgba(212,175,55,0.05)]">
                        <div className="absolute top-4 right-4 text-[#D4AF37]/20 font-black text-6xl select-none -z-0">
                            {index + 1}
                        </div>

                        <div className="relative z-10 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-white/50 uppercase tracking-wider">Période / Année <span className="text-red-500">*</span></label>
                                    <select
                                        {...form.register(`formations.${index}.annee_ou_periode`)}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#D4AF37] outline-none appearance-none"
                                    >
                                        <option value="">Choisir...</option>
                                        {Array.from({ length: 7 }, (_, i) => `${2020 + i}/${2020 + i + 1}`).map(y => (
                                            <option key={y} value={y} className="bg-black">{y}</option>
                                        ))}
                                    </select>
                                    {form.formState.errors.formations?.[index]?.annee_ou_periode && (
                                        <p className="text-red-400 text-xs">{form.formState.errors.formations[index]?.annee_ou_periode?.message}</p>
                                    )}
                                </div>

                                <div className="md:col-span-2 space-y-1">
                                    <label className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider">Titre / Structure <span className="text-red-500">*</span></label>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 shrink-0">
                                            <GraduationCap className="w-5 h-5 text-white/30" />
                                        </div>
                                        <input
                                            {...form.register(`formations.${index}.titre_structure`)}
                                            placeholder="Ex: Pôle espoir, Centre de formation..."
                                            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#D4AF37] outline-none transition-colors"
                                        />
                                    </div>
                                    {form.formState.errors.formations?.[index]?.titre_structure && (
                                        <p className="text-red-400 text-xs ml-14">{form.formState.errors.formations[index]?.titre_structure?.message}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-white/50 uppercase tracking-wider">Détails (Optionnel)</label>
                                <textarea
                                    {...form.register(`formations.${index}.details`)}
                                    placeholder="Informations complémentaires..."
                                    rows={2}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#D4AF37] outline-none transition-colors resize-none"
                                />
                                {form.formState.errors.formations?.[index]?.details && (
                                    <p className="text-red-400 text-xs">{form.formState.errors.formations[index]?.details?.message}</p>
                                )}
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => remove(index)}
                            className="absolute -bottom-3 right-6 bg-[#111] text-red-500/50 hover:text-red-500 text-xs px-3 py-1 rounded-full border border-white/5 hover:border-red-500/30 transition-all flex items-center gap-1"
                        >
                            <Trash2 className="w-3 h-3" /> Supprimer
                        </button>
                    </div>
                ))}
            </div>

            <div className="flex justify-between items-center pt-8 border-t border-white/10">
                <button
                    type="button"
                    onClick={() => setStep(4)}
                    className="flex items-center gap-2 text-white/50 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" /> Retour
                </button>
                <button
                    type="submit"
                    className="flex items-center gap-2 bg-white text-black font-bold py-3 px-8 rounded-xl hover:bg-white/90 transition-all"
                >
                    Suivant
                    <ArrowRight className="w-5 h-5" />
                </button>
            </div>
        </form>
    );
}
