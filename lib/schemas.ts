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

// Saison Schema
export const saisonSchema = z.object({
    club: z.string().min(1, "Le nom du club est requis"),
    categorie: z.string().min(1, "La catégorie est requise"),
    division: z.enum([
        'Ligue 1',
        'Ligue 2',
        'National',
        'National 2',
        'National 3',
        'Régional 1',
        'Régional 2',
        'Régional 3',
        'Départemental 1',
        'Départemental 2',
        'Départemental 3',
        'Autre'
    ] as const),
    logo_club: z.string().min(1, "Le logo du club est obligatoire"),
    logo_division: z.string().min(1, "Le logo de la division est obligatoire"),
    badge_capitanat: z.boolean().default(false),
    badge_surclasse: z.boolean().default(false),
    badge_champion: z.boolean().default(false),
    badge_coupe_remportee: z.boolean().default(false),
    matchs: z.number().int().min(0).nullable().optional(),
    buts: z.number().int().min(0).nullable().optional(),
    passes_decisives: z.number().int().min(0).nullable().optional(),
    temps_jeu_moyen: z.number().int().min(1).max(90).nullable().optional(),
    saison_actuelle: z.boolean().default(false),
    ordre: z.number().int().min(0).default(0),
}).refine((data) => {
    // Matchs obligatoire sauf saison actuelle
    if (!data.saison_actuelle && (data.matchs === null || data.matchs === undefined)) {
        return false;
    }
    return true;
}, {
    message: "Le nombre de matchs est obligatoire sauf pour la saison actuelle",
    path: ["matchs"]
});

export const saisonsSchema = z.array(saisonSchema).min(1, "Au moins une saison est requise");

// Full Player Store Schema (Simplified)
export const fullPlayerSchema = identitySchema
    .merge(linksSchema)
    .extend({
        photoUrl: z.string().optional(), // Local preview URL
        qualites: qualitesSchema.optional(), // Qualités sportives (1 à 6)
        saisons: saisonsSchema.optional(), // Saisons (1 à plusieurs)
    });

export type PlayerData = z.infer<typeof fullPlayerSchema>;
export type SaisonData = z.infer<typeof saisonSchema>;
