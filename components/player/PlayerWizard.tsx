import { usePlayerStore } from "@/store/usePlayerStore";
import { motion, AnimatePresence } from "framer-motion";
import { IdentityStep } from "./steps/IdentityStep";
import { PositionStep } from "./steps/PositionStep";
import { SkillsStep } from "./steps/SkillsStep";

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
                    {currentStep === 1 && <IdentityStep />}
                    {currentStep === 2 && <PositionStep />}
                    {currentStep === 3 && <SkillsStep />}

                    {currentStep > 3 && (
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
                            <button onClick={() => window.location.reload()} className="mt-8 text-scout-orange hover:text-white font-bold transition-colors">
                                Retour à l'accueil
                            </button>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
