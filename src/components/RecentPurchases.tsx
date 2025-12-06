import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, MapPin } from 'lucide-react';

const NAMES = [
    "Maria S.", "João P.", "Ana C.", "Carlos M.", "Fernanda L.",
    "Roberto G.", "Patricia A.", "Lucas R.", "Juliana B.", "Marcos O."
];

const LOCATIONS = [
    "São Paulo, SP", "Rio de Janeiro, RJ", "Belo Horizonte, MG",
    "Curitiba, PR", "Porto Alegre, RS", "Salvador, BA",
    "Brasília, DF", "Fortaleza, CE", "Recife, PE", "Florianópolis, SC"
];

const MESSAGES = [
    "acabou de consultar um veículo",
    "liberou o relatório completo",
    "realizou uma consulta completa",
    "verificou um histórico veicular"
];

const RecentPurchases = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [currentNotification, setCurrentNotification] = useState({ name: "", location: "", message: "" });

    useEffect(() => {
        // Initial delay before first notification
        const initialTimeout = setTimeout(() => {
            showNotification();
        }, 5000);

        return () => clearTimeout(initialTimeout);
    }, []);

    const showNotification = () => {
        const name = NAMES[Math.floor(Math.random() * NAMES.length)];
        const location = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
        const message = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];

        setCurrentNotification({ name, location, message });
        setIsVisible(true);

        // Hide after 5 seconds
        setTimeout(() => {
            setIsVisible(false);

            // Schedule next notification (random delay between 15-30s)
            const nextDelay = Math.random() * 15000 + 15000;
            setTimeout(showNotification, nextDelay);
        }, 5000);
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 50, x: 20 }}
                    animate={{ opacity: 1, y: 0, x: 0 }}
                    exit={{ opacity: 0, y: 20, x: 20 }}
                    className="fixed bottom-4 left-4 md:bottom-6 md:left-6 z-50 max-w-[320px] w-full"
                >
                    <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-green-500/20 shadow-lg shadow-green-500/10 rounded-xl p-4 flex items-start gap-4">
                        <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full shrink-0">
                            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">
                                {currentNotification.name}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-300">
                                {currentNotification.message}
                            </p>
                            <div className="flex items-center gap-1 mt-1">
                                <MapPin className="w-3 h-3 text-gray-400" />
                                <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">
                                    {currentNotification.location}
                                </span>
                                <span className="text-[10px] text-gray-300 mx-1">•</span>
                                <span className="text-[10px] text-gray-400">Agora mesmo</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default RecentPurchases;
