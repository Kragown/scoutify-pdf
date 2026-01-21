"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePlayerStore } from "@/store/usePlayerStore";
import { ArrowLeft, Check, Plus, Trash2, Heart } from "lucide-react";
import { z } from "zod";
import React from "react";
import { interetSchema, interetsSchema } from "@/lib/schemas";
import { useRouter } from "next/navigation";

// Schema local pour le formulaire
const interestsFormSchema = z.object({
    interets: interetsSchema
});

type InterestsFormData = z.infer<typeof interestsFormSchema>;

export function InterestsStep() {
    const { data, updateData, setStep } = usePlayerStore();
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const router = useRouter();

    const form = useForm<InterestsFormData>({
        resolver: zodResolver(interestsFormSchema),
        defaultValues: {
            interets: (data.interets && data.interets.length > 0 ? data.interets : []) as any
        },
        mode: "onBlur"
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "interets"
    });

    const onSubmit = async (formData: InterestsFormData) => {
        setIsSubmitting(true);
        updateData({ interets: formData.interets });

        // Fusion des données pour l'envoi final
        const finalData = { ...data, interets: formData.interets };

        try {
            const payload = {
                nom: finalData.lastName,
                prenom: finalData.firstName,
                nationalites: Array.isArray(finalData.nationalities) ? finalData.nationalities.join(", ") : (finalData.nationalities || ""),
                date_naissance: finalData.birthDate,
                pied_fort: finalData.strongFoot,
                taille_cm: parseInt(finalData.height || "0"),
                couleur_cv: finalData.cvColor,
                poste_principal: finalData.primaryPosition,
                poste_secondaire: finalData.secondaryPosition || null,
                url_transfermarkt: finalData.statsLink || null,
                photo_joueur: finalData.photoUrl || "",
                vma: finalData.vma ? parseFloat(finalData.vma) : null,
                envergure: finalData.envergure ? parseFloat(finalData.envergure) : null,
                email: finalData.email,
                telephone: finalData.phone,
                email_agent_sportif: finalData.emailAgent || null,
                telephone_agent_sportif: finalData.phoneAgent || null,
                qualites: finalData.qualites || [],
                status: "À traiter",

                // Mapping Saisons/Carrière
                saisons: finalData.career?.map((c, index) => ({
                    club: c.club,
                    categorie: `${c.category} (${c.year})`,
                    division: c.division,
                    logo_club: "/logos/default-club.png",
                    logo_division: "/logos/default-division.png",
                    badge_capitanat: !!c.badge_capitanat,
                    badge_surclasse: !!c.badge_surclasse,
                    badge_champion: !!c.badge_champion,
                    badge_coupe_remportee: !!c.badge_coupe_remportee,
                    mi_saison: !!c.mi_saison,
                    periode_type: c.periode_type || null,
                    matchs: c.saison_actuelle ? null : (c.matchs ?? 0),
                    buts: c.buts || 0,
                    passes_decisives: c.passes_decisives || 0,
                    clean_sheets: c.clean_sheets || null,
                    temps_jeu_moyen: c.temps_jeu_moyen || null,
                    saison_actuelle: !!c.saison_actuelle,
                    ordre: index
                })) || [],

                // Mapping Intérêts
                interets: formData.interets.map((i, index) => ({
                    club: i.club,
                    annee: i.annee,
                    logo_club: i.logo_club || "/logos/default-club.png",
                    ordre: index
                })),


                // Formations
                formations: finalData.formations?.map((f, index) => ({
                    annee_ou_periode: f.annee_ou_periode,
                    titre_structure: f.titre_structure,
                    details: f.details || null,
                    ordre: f.ordre ?? index
                })) || []
            };

            const response = await fetch('/api/formulaires-joueur', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (!response.ok) {
                console.error("Erreur serveur:", result);
                throw new Error(result.error || "Erreur lors de la sauvegarde.");
            }

            // Redirect to landing page
            router.push('/');

        } catch (error: any) {
            alert("Erreur : " + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const YEARS = Array.from({ length: 7 }, (_, i) => (2020 + i).toString());

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 animate-fade-in pb-20">
            <div className="flex items-center justify-between mb-6">
                <div className="space-y-1">
                    <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#F3E5AB] to-[#C5A028]">
                        Marques d'intérêts / Essais
                    </h2>
                    <p className="text-sm text-white/60">Ajoutez les clubs intéressés par votre profil.</p>
                </div>
                <button
                    type="button"
                    onClick={() => append({ club: "", annee: "", logo_club: "/logos/default-club.png", ordre: fields.length })}
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

                        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-2 space-y-1">
                                <label className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider">Club / Essai</label>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 shrink-0">
                                        <Heart className="w-5 h-5 text-white/30" />
                                    </div>
                                    <input
                                        {...form.register(`interets.${index}.club`)}
                                        placeholder="Nom du club"
                                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#D4AF37] outline-none transition-colors"
                                    />
                                </div>
                                {form.formState.errors.interets?.[index]?.club && (
                                    <p className="text-red-400 text-xs ml-14">{form.formState.errors.interets[index]?.club?.message}</p>
                                )}
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-white/50 uppercase tracking-wider">Année</label>
                                <select
                                    {...form.register(`interets.${index}.annee`)}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#D4AF37] outline-none appearance-none text-center"
                                >
                                    <option value="">Choisir...</option>
                                    {YEARS.map(y => (
                                        <option key={y} value={y} className="bg-black">{y}</option>
                                    ))}
                                </select>
                                {form.formState.errors.interets?.[index]?.annee && (
                                    <p className="text-red-400 text-xs">{form.formState.errors.interets[index]?.annee?.message}</p>
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
                    onClick={() => setStep(5)}
                    className="flex items-center gap-2 text-white/50 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" /> Retour
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 bg-gradient-to-r from-[#F3E5AB] to-[#C5A028] text-black font-bold py-3 px-8 rounded-xl shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:scale-105 transition-transform disabled:opacity-50 disabled:grayscale"
                >
                    {isSubmitting ? "Envoi en cours..." : "Finaliser mon CV"}
                    <Check className="w-5 h-5" />
                </button>
            </div>
        </form>
    );
}
