"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { identitySchema, linksSchema, physicalSchema } from "@/lib/schemas";
import { usePlayerStore } from "@/store/usePlayerStore";
import { ArrowRight, Check, X, Calendar } from "lucide-react";
import { z } from "zod";
import clsx from "clsx";
import React, { useState } from "react";

// Combine les schémas de validation pour cette étape
const step1Schema = identitySchema
    .merge(physicalSchema)
    .merge(linksSchema)
    .extend({
        photoUrl: z.string().optional(),
    });

type Step1Data = z.infer<typeof step1Schema>;

// Palette de couleurs pour le CV
const CV_COLORS = ["#1E5EFF", "#C46A4A", "#5B6B3A", "#0F2A43", "#D6C6A8", "#7A1E3A"];

// Niveaux internationaux disponibles (U13 à A)
const INTERNATIONAL_LEVELS = ["U13", "U14", "U15", "U16", "U17", "U18", "U19", "U20", "U21", "A"];

export function IdentityStep() {
    const { data, updateData, setStep } = usePlayerStore();

    // État pour les nationalités sélectionnées
    const [selectedNationalities, setSelectedNationalities] = useState<string[]>(
        (data.nationalities as string[]) || []
    );

    // État pour l'input du champ libre de nationalité
    const [otherNationalityInput, setOtherNationalityInput] = useState<string>("");

    // Configuration du formulaire avec react-hook-form
    const form = useForm<Step1Data>({
        resolver: zodResolver(step1Schema),
        defaultValues: {
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            nationalities: (data.nationalities as string[]) || [],
            email: data.email || "",
            phone: data.phone || "",
            emailAgent: data.emailAgent || "",
            phoneAgent: data.phoneAgent || "",
            birthDate: data.birthDate || "",
            cvColor: data.cvColor || "#1E5EFF",
            isInternational: data.isInternational || false,
            internationalLevel: data.internationalLevel || "",
            internationalCountry: data.internationalCountry || "",
            height: data.height || "",
            strongFoot: (data.strongFoot || "") as any,
            vma: data.vma || "",
            envergure: data.envergure || "",
            statsLink: data.statsLink || "",
            videoLink: data.videoLink || "",
            photoUrl: data.photoUrl || undefined,
        },
        mode: "onBlur"
    });

    // Ajoute une nouvelle nationalité au champ libre
    const handleAddOtherNationality = () => {
        const trimmed = otherNationalityInput.trim();
        if (trimmed && !selectedNationalities.includes(trimmed)) {
            const updated = [...selectedNationalities, trimmed];
            setSelectedNationalities(updated);
            form.setValue("nationalities", updated);
            setOtherNationalityInput(""); // Vide le champ après ajout
        }
    };

    // Supprime une nationalité sélectionnée
    const handleRemoveNationality = (nationality: string) => {
        const updated = selectedNationalities.filter(n => n !== nationality);
        setSelectedNationalities(updated);
        form.setValue("nationalities", updated);
    };

    // Soumet le formulaire et passe à l'étape 2
    const onSubmit = (formData: Step1Data): void => {
        updateData(formData);
        setStep(2);
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 animate-fade-in pb-10">

            {/* ========== SECTION 1: IDENTITÉ ========== */}
            <div className="space-y-6">
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-white">Identité</h2>
                    <p className="text-sm text-scout-muted">Vos informations personnelles.</p>
                </div>

                {/* Prénom et Nom - Bloque les chiffres */}
                <div className="grid grid-cols-2 gap-4">
                    <InputGroup label={<>Prénom <span className="text-red-500">*</span></>} error={form.formState.errors.firstName?.message}>
                        <input
                            {...form.register("firstName")}
                            className="input-field"
                            placeholder="Prénom"
                            onInput={(e) => {
                                e.currentTarget.value = e.currentTarget.value.replace(/[0-9]/g, '');
                            }}
                        />
                    </InputGroup>
                    <InputGroup label={<>Nom <span className="text-red-500">*</span></>} error={form.formState.errors.lastName?.message}>
                        <input
                            {...form.register("lastName")}
                            className="input-field"
                            placeholder="Nom"
                            onInput={(e) => {
                                e.currentTarget.value = e.currentTarget.value.replace(/[0-9]/g, '');
                            }}
                        />
                    </InputGroup>
                </div>

                {/* Date de naissance avec icone calendrier blanc */}
                <div className="grid grid-cols-1 gap-4">
                    <InputGroup label={<>Date de naissance <span className="text-red-500">*</span></>} error={form.formState.errors.birthDate?.message}>
                        <div className="relative">
                            <input
                                type="date"
                                {...form.register("birthDate")}
                                className="input-field pl-10 [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-100"
                            />
                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white pointer-events-none" />
                        </div>
                    </InputGroup>
                </div>

                {/* ========== NATIONALITÉS - CHAMP LIBRE UNIQUEMENT ========== */}
                <div className="space-y-3">
                    <label className="text-sm font-medium text-white/80">Nationalité(s) <span className="text-red-500">*</span></label>

                    {/* Champ texte pour ajouter une nationalité - Bloque les chiffres */}
                    <div className="space-y-2">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Entrez une nationalité"
                                value={otherNationalityInput}
                                onChange={(e) => setOtherNationalityInput(e.target.value)}
                                onInput={(e) => {
                                    e.currentTarget.value = e.currentTarget.value.replace(/[0-9]/g, '');
                                }}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleAddOtherNationality();
                                    }
                                }}
                                className="input-field flex-1"
                            />
                            {/* Bouton + pour ajouter la nationalité */}
                            <button
                                type="button"
                                onClick={handleAddOtherNationality}
                                className="bg-scout-orange hover:bg-orange-600 text-black font-bold py-2 px-4 rounded-lg transition-all"
                            >
                                +
                            </button>
                        </div>
                    </div>

                    {/* Affiche les nationalités sélectionnées sous forme de tags */}
                    {selectedNationalities.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-2">
                            {selectedNationalities.map((nat) => (
                                <span key={nat} className="bg-scout-orange/20 text-scout-orange px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2 border border-scout-orange/40">
                                    {nat}
                                    {/* Bouton pour supprimer la nationalité */}
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveNationality(nat)}
                                        className="hover:text-scout-orange/60 cursor-pointer"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Affiche l'erreur de validation si au moins une nationalité est requise */}
                    {form.formState.errors.nationalities && (
                        <span className="text-red-400 text-xs block">{form.formState.errors.nationalities.message}</span>
                    )}
                </div>

                {/* Sélecteur de couleur CV - 6 couleurs prédéfinies */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-white/80">Couleur du CV</label>
                    <div className="flex gap-4">
                        {CV_COLORS.map((color) => (
                            <label key={color} className="relative cursor-pointer group">
                                <input
                                    type="radio"
                                    value={color}
                                    {...form.register("cvColor")}
                                    className="sr-only"
                                />
                                <div
                                    className={clsx(
                                        "w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center",
                                        form.watch("cvColor") === color ? "border-white scale-110" : "border-transparent opacity-50 group-hover:opacity-100"
                                    )}
                                    style={{ backgroundColor: color }}
                                >
                                    {form.watch("cvColor") === color && <Check className="w-5 h-5 text-white drop-shadow-md" />}
                                </div>
                            </label>
                        ))}
                    </div>
                </div>
            </div>

            <div className="border-t border-white/10" />

            {/* ========== SECTION 2: PHYSIQUE ========== */}
            <div className="space-y-6">
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-white">Physique</h2>
                    <p className="text-sm text-scout-muted">Vos aptitudes physiques.</p>
                </div>

                {/* Taille (max 3 chiffres) et Pied fort */}
                <div className="grid grid-cols-2 gap-4">
                    <InputGroup label={<>Taille (cm) <span className="text-red-500">*</span></>} error={form.formState.errors.height?.message}>
                        <input
                            type="number"
                            {...form.register("height")}
                            className="input-field"
                            placeholder="185"
                            onInput={(e) => {
                                e.currentTarget.value = e.currentTarget.value.slice(0, 3);
                            }}
                        />
                    </InputGroup>
                    <InputGroup label={<>Pied Fort <span className="text-red-500">*</span></>} error={form.formState.errors.strongFoot?.message}>
                        <select {...form.register("strongFoot")} className="input-field">
                            <option value="">Sélectionner</option>
                            <option value="Droit">Droit</option>
                            <option value="Gauche">Gauche</option>
                            <option value="Ambidextre">Ambidextre</option>
                        </select>
                    </InputGroup>
                </div>

                {/* VMA (Optionnel) et Envergure (Gardien) */}
                <div className="grid grid-cols-2 gap-4">
                    <InputGroup label="VMA (Optionnel)" error={form.formState.errors.vma?.message}>
                        <input
                            {...form.register("vma")}
                            className="input-field"
                            placeholder="ex: 18.5"
                            onInput={(e) => {
                                e.currentTarget.value = e.currentTarget.value.replace(/[^0-9.,]/g, '');
                            }}
                        />
                    </InputGroup>
                    <InputGroup label="Envergure (Gardien)" error={form.formState.errors.envergure?.message}>
                        <input
                            {...form.register("envergure")}
                            className="input-field"
                            placeholder="ex: 190"
                            onInput={(e) => {
                                e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '');
                            }}
                        />
                    </InputGroup>
                </div>
            </div>

            <div className="border-t border-white/10" />

            {/* ========== SECTION 3: INTERNATIONAL ========== */}
            <div className="space-y-6">
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-white">International</h2>
                    <p className="text-sm text-scout-muted">Informations sur votre parcours international.</p>
                </div>

                {/* Checkbox pour activer/désactiver la section international */}
                <label className="flex items-center gap-3 cursor-pointer">
                    <input
                        type="checkbox"
                        {...form.register("isInternational")}
                        className="w-4 h-4 cursor-pointer"
                    />
                    <span className="text-sm font-medium text-white">Joueur international</span>
                </label>

                {/* Affiche les champs niveau + pays SEULEMENT si checkbox cochée */}
                {form.watch("isInternational") && (
                    <div className="grid grid-cols-1 gap-4 p-4 bg-white/5 rounded-lg md:grid-cols-2">
                        {/* Niveau international - Sélect */}
                        <InputGroup label={<>Niveau international <span className="text-red-500">*</span></>} error={form.formState.errors.internationalLevel?.message}>
                            <select {...form.register("internationalLevel")} className="input-field">
                                <option value="">Sélectionner</option>
                                {INTERNATIONAL_LEVELS.map((level) => (
                                    <option key={level} value={level}>{level}</option>
                                ))}
                            </select>
                        </InputGroup>

                        {/* Pays - Champ libre texte (Bloque les chiffres) */}
                        <InputGroup label={<>Pays <span className="text-red-500">*</span></>} error={form.formState.errors.internationalCountry?.message}>
                            <input
                                type="text"
                                {...form.register("internationalCountry")}
                                className="input-field"
                                placeholder="Entrez le pays"
                                onInput={(e) => {
                                    e.currentTarget.value = e.currentTarget.value.replace(/[0-9]/g, '');
                                }}
                            />
                        </InputGroup>
                    </div>
                )}
            </div>

            <div className="border-t border-white/10" />

            {/* ========== SECTION 4: CONTACT & LIENS ========== */}
            <div className="space-y-6">
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-white">Contact & Liens</h2>
                </div>

                {/* Contact joueur - Email et Téléphone obligatoires */}
                <div className="space-y-4">
                    <h3 className="text-sm font-medium text-white">Contact joueur *</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputGroup label={<>Email <span className="text-red-500">*</span></>} error={form.formState.errors.email?.message}>
                            <input type="email" {...form.register("email")} className="input-field" placeholder="contact@example.com" />
                        </InputGroup>
                        <InputGroup label={<>Téléphone <span className="text-red-500">*</span></>} error={form.formState.errors.phone?.message}>
                            <input
                                type="tel"
                                {...form.register("phone")}
                                className="input-field"
                                placeholder="+33 6 12 34 56 78"
                                onInput={(e) => {
                                    e.currentTarget.value = e.currentTarget.value.replace(/[^0-9+\s-]/g, '');
                                }}
                            />
                        </InputGroup>
                    </div>
                </div>

                {/* Contact agent sportif - Optionnel, caché sur PDF si vide */}
                <div className="space-y-4 p-4 bg-white/5 rounded-lg">
                    <h3 className="text-sm font-medium text-white">Contact agent sportif (optionnel)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputGroup label="Email agent" error={form.formState.errors.emailAgent?.message}>
                            <input type="email" {...form.register("emailAgent")} className="input-field" placeholder="agent@example.com" />
                        </InputGroup>
                        <InputGroup label="Téléphone agent" error={form.formState.errors.phoneAgent?.message}>
                            <input
                                type="tel"
                                {...form.register("phoneAgent")}
                                className="input-field"
                                placeholder="+33 6 12 34 56 78"
                                onInput={(e) => {
                                    e.currentTarget.value = e.currentTarget.value.replace(/[^0-9+\s-]/g, '');
                                }}
                            />
                        </InputGroup>
                    </div>
                </div>

                {/* Liens optionnels - Stats, Vidéo, Photo */}
                <div className="space-y-4 pt-4">
                    <h3 className="text-sm font-medium text-white">Liens optionnels</h3>
                    <InputGroup label="Lien Stats (Transfermarkt...)" error={form.formState.errors.statsLink?.message}>
                        <input {...form.register("statsLink")} className="input-field" placeholder="https://..." />
                    </InputGroup>
                    <InputGroup label="Lien Vidéo (Highlights)" error={form.formState.errors.videoLink?.message}>
                        <input {...form.register("videoLink")} className="input-field" placeholder="https://youtube.com/..." />
                    </InputGroup>

                    {/* Upload photo - Convertit en base64 */}
                    <InputGroup label="Photo de profil" error={form.formState.errors.photoUrl?.message}>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                        const base64String = reader.result as string;
                                        form.setValue("photoUrl", base64String);
                                    };
                                    reader.readAsDataURL(file);
                                }
                            }}
                            className="input-field file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-scout-orange file:text-black hover:file:bg-orange-600"
                        />
                    </InputGroup>
                </div>
            </div>

            {/* Bouton de soumission */}
            <div className="pt-6 flex justify-end">
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

// Composant réutilisable pour les groupes d'inputs avec label et erreur
function InputGroup({ label, error, children }: { label: React.ReactNode; error?: string; children: React.ReactNode }) {
    return (
        <div className="space-y-1">
            <label className="text-sm font-medium text-white/80">{label}</label>
            {children}
            {error && <span className="text-red-400 text-xs">{error}</span>}
        </div>
    );
}