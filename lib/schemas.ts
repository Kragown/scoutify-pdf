import { z } from "zod";

// Identity & Contact Schema
export const identitySchema = z.object({
    firstName: z.string().min(2, "Le prénom doit faire au moins 2 caractères"),
    lastName: z.string().min(2, "Le nom doit faire au moins 2 caractères"),
    nationality: z.string().min(2, "Nationalité requise"),
    birthDate: z.string().refine((date) => new Date(date).toString() !== 'Invalid Date', { message: "Date invalide" }),
    email: z.string().email("Email invalide"),
    phone: z.string().min(10, "Numéro valide requis"),
    agentName: z.string().optional(),
    agentPhone: z.string().optional(),
    cvColor: z.enum(["#1E5EFF", "#C46A4A", "#5B6B3A", "#0F2A43", "#D6C6A8", "#7A1E3A"]).default("#1E5EFF"),
});

// Links & Media Schema
export const linksSchema = z.object({
    statsLink: z.string().url("URL invalide").optional().or(z.literal("")),
    videoLink: z.string().url("URL invalide").optional().or(z.literal("")),
});

// Qualités sportives Schema
export const qualitesSchema = z.array(
    z.string()
        .min(1, "Une qualité ne peut pas être vide")
        .max(24, "Une qualité ne peut pas dépasser 24 caractères")
)
    .min(1, "Au moins une qualité est requise")
    .max(6, "Maximum 6 qualités autorisées");

// Full Player Store Schema (Simplified)
export const fullPlayerSchema = identitySchema
    .merge(linksSchema)
    .extend({
        photoUrl: z.string().optional(), // Local preview URL
        qualites: qualitesSchema.optional(), // Qualités sportives (1 à 6)
    });

export type PlayerData = z.infer<typeof fullPlayerSchema>;
