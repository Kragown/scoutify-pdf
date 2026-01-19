"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { identitySchema, linksSchema } from "@/lib/schemas";
import { usePlayerStore } from "@/store/usePlayerStore";
import { ArrowRight, Check } from "lucide-react";
import { z } from "zod";
import { clsx } from "clsx";

// Combine schemas for this specific step (Identity + Links + Photo)
// Removed Physical schema as requested
const step1Schema = identitySchema
    .merge(linksSchema)
    .extend({
        photoUrl: z.string().optional(),
    });

type Step1Data = z.infer<typeof step1Schema>;

const CV_COLORS = ["#1E5EFF", "#C46A4A", "#5B6B3A", "#0F2A43", "#D6C6A8", "#7A1E3A"];

export function IdentityStep() {
    const { data, updateData, setStep } = usePlayerStore();

    const form = useForm<Step1Data>({

        resolver: zodResolver(step1Schema) as any,
        defaultValues: {
            // Identity
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            nationality: data.nationality || "",
            email: data.email || "",
            phone: data.phone || "",
            birthDate: data.birthDate || "",
            cvColor: (data.cvColor as any) || "#1E5EFF",

            // Links & Media
            statsLink: data.statsLink || "",
            videoLink: data.videoLink || "",
            photoUrl: data.photoUrl || undefined,


        },
        mode: "onBlur"
    });

    const onSubmit = (formData: any) => {
        updateData(formData);
        setStep(2);
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 animate-fade-in pb-10">

            {/* SECTION 1: IDENTITÉ */}
            <div className="space-y-6">
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-white">Identité</h2>
                    <p className="text-sm text-scout-muted">Vos informations personnelles.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <InputGroup label="Prénom" error={form.formState.errors.firstName?.message}>
                        <input {...form.register("firstName")} className="input-field" placeholder="Prénom" />
                    </InputGroup>
                    <InputGroup label="Nom" error={form.formState.errors.lastName?.message}>
                        <input {...form.register("lastName")} className="input-field" placeholder="Nom" />
                    </InputGroup>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <InputGroup label="Date de naissance" error={form.formState.errors.birthDate?.message}>
                        <input type="date" {...form.register("birthDate")} className="input-field" />
                    </InputGroup>
                    <InputGroup label="Nationalité(s)" error={form.formState.errors.nationality?.message}>
                        <input {...form.register("nationality")} className="input-field" placeholder="Française" />
                    </InputGroup>
                </div>

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

            {/* SECTION 2: CONTACT & LIENS */}
            <div className="space-y-6">
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-white">Contact & Liens</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputGroup label="Email" error={form.formState.errors.email?.message}>
                        <input type="email" {...form.register("email")} className="input-field" placeholder="contact@example.com" />
                    </InputGroup>
                    <InputGroup label="Téléphone" error={form.formState.errors.phone?.message}>
                        <input type="tel" {...form.register("phone")} className="input-field" placeholder="06 12 34 56 78" />
                    </InputGroup>
                    <InputGroup label="Lien Stats (Transfermarkt...)" error={form.formState.errors.statsLink?.message}>
                        <input {...form.register("statsLink")} className="input-field" placeholder="https://..." />
                    </InputGroup>
                    {/* VIDEO LINK ADDED */}
                    <InputGroup label="Lien Vidéo (Highlights)" error={form.formState.errors.videoLink?.message}>
                        <input {...form.register("videoLink")} className="input-field" placeholder="https://youtube.com/..." />
                    </InputGroup>

                    <div className="col-span-1 md:col-span-2">
                        <InputGroup label="Photo de profil" error={form.formState.errors.photoUrl?.message}>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        const url = URL.createObjectURL(file);
                                        form.setValue("photoUrl", url);
                                    }
                                }}
                                className="input-field file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-scout-orange file:text-black hover:file:bg-orange-600"
                            />
                        </InputGroup>
                    </div>
                </div>
            </div>

            <div className="pt-6 flex justify-end">
                <button
                    type="submit"
                    className="bg-scout-orange hover:bg-orange-600 text-black font-bold py-3 px-8 rounded-xl flex items-center gap-2 transition-transform hover:scale-105"
                >
                    Terminer
                    <Check className="w-5 h-5" />
                </button>
            </div>
        </form>
    );
}

function InputGroup({ label, error, children }: { label: string, error?: string, children: React.ReactNode }) {
    return (
        <div className="space-y-1">
            <label className="text-sm font-medium text-white/80">{label}</label>
            {children}
            {error && <span className="text-red-400 text-xs">{error}</span>}
        </div>
    );
}
