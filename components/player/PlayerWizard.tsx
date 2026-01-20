import { usePlayerStore } from "@/store/usePlayerStore";
import { motion, AnimatePresence } from "framer-motion";
import { IdentityStep } from "./steps/IdentityStep";
import { PositionStep } from "./steps/PositionStep";
import { QualitiesStep } from "./steps/QualitiesStep";
import { SkillsStep } from "./steps/SkillsStep";
import { FormationStep } from "./steps/FormationStep";
import { InterestsStep } from "./steps/InterestsStep";

export function PlayerWizard() {
    const { currentStep } = usePlayerStore();

    return (
        <div className="relative">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    {/* Step 1: Identité */}
                    {currentStep === 1 && <IdentityStep />}

                    {/* Step 2: Poste */}
                    {currentStep === 2 && <PositionStep />}

                    {/* Step 3: Qualités */}
                    {currentStep === 3 && <QualitiesStep />}

                    {/* Step 4: Parcours */}
                    {currentStep === 4 && <SkillsStep />}

                    {/* Step 5: Formation */}
                    {currentStep === 5 && <FormationStep />}

                    {/* Step 6: Intérêts */}
                    {currentStep === 6 && <InterestsStep />}

                    {/* Page de confirmation */}
                    {currentStep > 6 && (
                        <div className="p-12 text-center border border-white/10 rounded-xl bg-scout-card space-y-4 animate-fade-in">
                            <div className="w-16 h-16 bg-scout-orange rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-8 h-8 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h2 className="text-3xl font-bold text-white">CV Transmis !</h2>
                            <p className="text-scout-muted max-w-md mx-auto">
                                Votre profil a été enregistré. Le staff technique va maintenant valider vos informations.
                            </p>
                            <button
                                onClick={() => window.location.reload()}
                                className="mt-8 text-scout-orange hover:text-white font-bold transition-colors"
                            >
                                Retour à laccueil
                            </button>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}