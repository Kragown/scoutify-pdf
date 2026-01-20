import { z } from "zod";

// Identity & Contact Schema - Updated
export const identitySchema = z.object({
    firstName: z.string().min(2, "Le prénom doit faire au moins 2 caractères"),
    lastName: z.string().min(2, "Le nom doit faire au moins 2 caractères"),
    nationalities: z.array(z.string()).min(1, "Au moins une nationalité requise"),
    birthDate: z.string().refine((date) => new Date(date).toString() !== 'Invalid Date', { message: "Date invalide" }),
    email: z.string().email("Email invalide"),
    phone: z.string().min(10, "Numéro valide requis"),
    emailAgent: z.string().email("Email agent invalide").optional().or(z.literal("")),
    phoneAgent: z.string().optional(),
    isInternational: z.boolean().default(false),
    internationalLevel: z.string().optional(),
    internationalCountry: z.string().optional(),
    cvColor: z.enum(["#1E5EFF", "#C46A4A", "#5B6B3A", "#0F2A43", "#D6C6A8", "#7A1E3A"]).default("#1E5EFF"),
}).refine(
    (data) => !data.isInternational || (data.internationalLevel && data.internationalCountry),
    {
        message: "Niveau et pays requis si joueur international",
        path: ["internationalLevel"]
    }
);

// Physical Schema
export const physicalSchema = z.object({
    height: z.string().min(2, "Taille requise (ex: 185)"),
    strongFoot: z.enum(["Droit", "Gauche", "Ambidextre"], { message: "Sélectionnez un pied" }),
    vma: z.string().optional(),
    envergure: z.string().optional(),
});

// Position Schema
export const positionSchema = z.object({
    primaryPosition: z.string().min(2, "Sélectionnez un poste principal"),
    secondaryPosition: z.string().optional(),
});

// Qualities Schema
export const qualitesSchema = z.array(
    z.string()
        .min(1, "Une qualité ne peut pas être vide")
        .max(24, "Une qualité ne peut pas dépasser 24 caractères")
)
    .min(1, "Au moins une qualité est requise")
    .max(6, "Maximum 6 qualités autorisées");

// Links & Media Schema (From Frontend)
export const linksSchema = z.object({
    statsLink: z.string().url("URL invalide").optional().or(z.literal("")),
    videoLink: z.string().url("URL invalide").optional().or(z.literal("")),
});

// Career Step Schema (From Frontend - kept for compatibility if needed, using backend schemas mostly)
export const careerStepSchema = z.object({
    year: z.string().min(4, "Année requise"),
    club: z.string().min(2, "Club requis"),
    category: z.string().optional(),
    division: z.string().optional(),
    badge_capitanat: z.boolean().optional(),
    badge_surclasse: z.boolean().optional(),
    badge_champion: z.boolean().optional(),
    badge_coupe_remportee: z.boolean().optional(),
    matchs: z.number().nullable().optional(),
    buts: z.number().nullable().optional(),
    passes_decisives: z.number().nullable().optional(),
    temps_jeu_moyen: z.number().nullable().optional(),
    saison_actuelle: z.boolean().optional(),
});

// Saison Schema (From Backend)
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
    if (!data.saison_actuelle && (data.matchs === null || data.matchs === undefined)) {
        return false;
    }
    return true;
}, {
    message: "Le nombre de matchs est obligatoire sauf pour la saison actuelle",
    path: ["matchs"]
});

export const saisonsSchema = z.array(saisonSchema).min(1, "Au moins une saison est requise");

// Formation Schema (From Backend)
export const formationSchema = z.object({
    annee_ou_periode: z.string().min(1, "L'année ou période est requise"),
    titre_structure: z.string()
        .min(1, "Le titre ou structure est requis")
        .max(1000, "Le titre ou structure ne peut pas dépasser 1000 caractères"),
    details: z.string()
        .max(1000, "Les détails ne peuvent pas dépasser 1000 caractères")
        .nullable()
        .optional(),
    ordre: z.number().int().min(0).default(0),
});

export const formationsSchema = z.array(formationSchema).min(1, "Au moins une formation est requise");

// Interet Schema (From Backend)
export const interetSchema = z.object({
    club: z.string().min(1, "Le nom du club est requis").max(200, "Maximum 200 caractères"),
    annee: z.string().length(4, "L'année doit comporter 4 chiffres").regex(/^\d{4}$/, "Année invalide"),
    logo_club: z.string().min(1, "Le logo du club est obligatoire"),
    ordre: z.number().int().min(0).default(0),
});

export const interetsSchema = z.array(interetSchema).min(1, "Au moins un intérêt est requis");

// Full Player Store Schema (Merged)
export const fullPlayerSchema = identitySchema
    .merge(physicalSchema)
    .merge(positionSchema)
    .merge(linksSchema)
    .extend({
        photoUrl: z.string().optional(),
        qualites: qualitesSchema.optional(),
        career: z.array(careerStepSchema).optional(),
        saisons: saisonsSchema.optional(),
        formations: formationsSchema.optional(),
        interets: interetsSchema.optional(),
    });

export type PlayerData = z.infer<typeof fullPlayerSchema>;
export type SaisonData = z.infer<typeof saisonSchema>;
export type FormationData = z.infer<typeof formationSchema>;
export type InteretData = z.infer<typeof interetSchema>;