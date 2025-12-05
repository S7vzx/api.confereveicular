import { useState, useEffect } from "react";
import { X, Copy, Check, Gift, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CouponPopup() {
    const [isVisible, setIsVisible] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const [isClosed, setIsClosed] = useState(false);

    useEffect(() => {
        // Show popup after 3 seconds
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    const copyToClipboard = () => {
        navigator.clipboard.writeText("PRIMEIRA20");
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    if (isClosed) return null;

    return (
        <div
            className={`fixed bottom-4 right-4 md:bottom-8 md:right-8 z-50 transition-all duration-700 transform ${isVisible ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"
                }`}
        >
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-5 md:p-6 w-[90vw] md:w-96 relative overflow-hidden">
                {/* Decorative Background */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#00Cca7]/10 to-transparent rounded-bl-full -mr-8 -mt-8" />

                {/* Close Button */}
                <button
                    onClick={() => setIsClosed(true)}
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1 transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>

                <div className="relative z-10 flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-[#00Cca7]/10 rounded-xl flex items-center justify-center text-[#00Cca7]">
                        <Gift className="w-6 h-6 animate-pulse" />
                    </div>

                    <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wide uppercase">
                                Desconto Exclusivo
                            </span>
                        </div>
                        <h3 className="text-gray-900 font-bold text-lg leading-tight">
                            Ganhe <span className="text-[#00Cca7]">20% OFF</span> agora!
                        </h3>
                        <p className="text-gray-500 text-sm leading-snug">
                            Use o cupom abaixo e libere todas as informações do veículo.
                        </p>

                        <div className="mt-4 flex items-center gap-2">
                            <div className="flex-1 bg-gray-50 border border-gray-200 border-dashed rounded-lg p-2.5 flex items-center justify-between group hover:border-[#00Cca7]/50 transition-colors">
                                <div className="flex items-center gap-2 text-gray-700 font-mono font-bold tracking-wider">
                                    <Tag className="w-4 h-4 text-[#00Cca7]" />
                                    <span>PRIMEIRA20</span>
                                </div>
                            </div>

                            <Button
                                size="sm"
                                className={`h-10 px-4 transition-all duration-300 ${isCopied
                                        ? "bg-green-600 hover:bg-green-700 text-white"
                                        : "bg-[#00Cca7] hover:bg-[#00Cca7]/90 text-white"
                                    }`}
                                onClick={copyToClipboard}
                            >
                                {isCopied ? (
                                    <Check className="w-4 h-4" />
                                ) : (
                                    <div className="flex items-center gap-1.5 font-semibold">
                                        <Copy className="w-3.5 h-3.5" />
                                        <span>Copiar</span>
                                    </div>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
