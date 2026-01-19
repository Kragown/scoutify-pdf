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
    cvColor: z.enum(["#FF9900", "#22c55e", "#3b82f6", "#ec4899", "#a855f7"]).default("#FF9900"),
});

// Links & Media Schema
export const linksSchema = z.object({
    statsLink: z.string().url("URL invalide").optional().or(z.literal("")),
    videoLink: z.string().url("URL invalide").optional().or(z.literal("")),
});

// Full Player Store Schema (Simplified)
export const fullPlayerSchema = identitySchema
    .merge(linksSchema)
    .extend({
        photoUrl: z.string().optional(), // Local preview URL
    });

export type PlayerData = z.infer<typeof fullPlayerSchema>;
