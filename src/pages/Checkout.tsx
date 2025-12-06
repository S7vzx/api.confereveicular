import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Shield, Lock, Check, CreditCard, Tag, ArrowRight, Copy, QrCode, FileCheck, Search, ShieldCheck, CheckCircle } from "lucide-react";
import TrustIndicators from "@/components/social-proof/TrustIndicators";
import RecentPurchases from "@/components/RecentPurchases";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import MinimalFooter from "@/components/MinimalFooter";
import pagarme from "@/services/pagarme";
import { QRCodeSVG } from 'qrcode.react';

const Checkout = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const plate = searchParams.get("placa") || "ABC-1234";

    const [email, setEmail] = useState("");
    const [cpf, setCpf] = useState("");
    const [coupon, setCoupon] = useState("");
    const [discount, setDiscount] = useState(0);
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [orderId, setOrderId] = useState<string | null>(null);
    const [status, setStatus] = useState<string>("pending");
    const [pixData, setPixData] = useState<any>(null);

    // Upsells state
    const [upsells, setUpsells] = useState({
        debitos: false,
        leilao: false
    });

    const basePrice = 24.90;
    const debitosPrice = 7.99;
    const leilaoPrice = 24.99;

    const getGrossTotal = () => {
        let total = basePrice;
        if (upsells.debitos) total += debitosPrice;
        if (upsells.leilao) total += leilaoPrice;
        return total;
    };

    const calculateTotal = () => {
        const gross = getGrossTotal();
        return gross * (1 - discount);
    };

    const handleApplyCoupon = async () => {
        try {
            const response = await pagarme.validateCoupon(coupon);
            if (response.valid) {
                setDiscount(response.discount);
                toast({
                    title: "Sucesso!",
                    description: `Cupom de ${(response.discount * 100).toFixed(0)}% aplicado com sucesso.`,
                    className: "bg-green-600 text-white border-none"
                });
            } else {
                setDiscount(0);
                toast({
                    title: "Cupom inválido",
                    description: "O código informado não é válido ou expirou.",
                    variant: "destructive"
                });
            }
        } catch (error) {
            console.error(error);
            toast({
                title: "Erro",
                description: "Erro ao validar cupom.",
                variant: "destructive"
            });
        }
    };

    // Polling for payment status
    useEffect(() => {
        let intervalId: NodeJS.Timeout;

        if (orderId && status === 'pending') {
            intervalId = setInterval(async () => {
                try {
                    const order = await pagarme.getOrder(orderId);
                    if (order.status === 'paid') {
                        setStatus('paid');
                        toast({
                            title: "Pagamento Confirmado!",
                            description: "Seu relatório já está disponível.",
                            className: "bg-green-600 text-white border-none"
                        });
                        clearInterval(intervalId);
                    }
                } catch (error) {
                    console.error("Erro ao verificar status:", error);
                }
            }, 3000); // Check every 3 seconds
        }

        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [orderId, status, toast]);

    const handlePayment = async () => {
        if (!email || !email.includes("@")) {
            toast({
                title: "E-mail inválido",
                description: "Por favor, informe um endereço de e-mail válido para receber o relatório.",
                variant: "destructive"
            });
            return;
        }

        if (!cpf || cpf.length < 11) {
            toast({
                title: "CPF inválido",
                description: "Por favor, informe um numero de CPF válido.",
                variant: "destructive"
            });
            return;
        }

        if (!acceptedTerms) {
            toast({
                title: "Termos de uso",
                description: "Você precisa aceitar os termos e condições para continuar.",
                variant: "destructive"
            });
            return;
        }

        setIsLoading(true);

        try {
            // Basic amount calculation in cents
            const total = calculateTotal();
            const amount = Math.round(total * 100);
            const description = `Consulta Veicular Placa ${plate}`;

            const customer = {
                name: "Cliente Confere", // In a real app we'd ask for the name
                email: email,
                document: cpf.replace(/\D/g, '') // Remove non-digits
            };

            let data;

            // Check if it is a free order (100% discount)
            if (amount === 0) {
                data = await pagarme.createFreeOrder(description, customer);
                setOrderId(data.id);
                setStatus('paid');
                toast({
                    title: "Sucesso!",
                    description: "Seu pedido foi confirmado gratuitamente.",
                    className: "bg-green-600 text-white border-none"
                });
                return;
            } else {
                data = await pagarme.createPixTransaction(amount, description, customer);

                if (data.id) {
                    setOrderId(data.id);
                }

                const charge = data.charges[0];
                const transaction = charge.last_transaction;

                setPixData({
                    qr_code: transaction.qr_code,
                    qr_code_url: transaction.qr_code_url,
                    expires_at: transaction.expires_at
                });

                toast({
                    title: "Pedido gerado!",
                    description: "Utilize o QR Code para realizar o pagamento.",
                    className: "bg-green-600 text-white border-none"
                });
            }

        } catch (error: any) {
            console.error("Payment error:", error);
            toast({
                title: "Erro no pedido",
                description: error.message || "Não foi possível processar o pedido. Tente novamente.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = () => {
        if (pixData?.qr_code) {
            navigator.clipboard.writeText(pixData.qr_code);
            toast({
                title: "Copiado!",
                description: "Código Pix copiado para a área de transferência.",
            });
        }
    };

    // Success View
    if (status === 'paid') {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
                <header className="bg-white border-b border-gray-100 py-4 sticky top-0 z-50">
                    <div className="container mx-auto px-4 flex justify-between items-center">
                        <img src="/uploads/logo nova.png" alt="Confere Veicular" className="h-8 md:h-10 w-auto" />
                        <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                            <ShieldCheck className="w-4 h-4" />
                            Ambiente Seguro
                        </div>
                    </div>
                </header>
                <main className="flex-grow container mx-auto px-4 py-8 md:py-16 flex justify-center items-center">
                    <div className="max-w-lg w-full bg-white rounded-3xl shadow-xl shadow-green-900/5 border border-green-100/50 p-8 text-center animate-in fade-in zoom-in duration-500 overflow-hidden relative">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-emerald-600" />
                        <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner ring-8 ring-green-50/50">
                            <Check className="w-12 h-12 text-green-600" />
                        </div>
                        <h2 className="text-3xl font-extrabold text-[#19406C] mb-2 tracking-tight">
                            {discount === 1 ? "Pedido Confirmado!" : "Pagamento Recebido!"}
                        </h2>
                        <p className="text-gray-500 mb-8 text-lg">
                            {discount === 1
                                ? "Seu pedido foi processado com sucesso."
                                : "Obrigado! Seu pagamento foi confirmado."}
                            <br />
                            <span className="text-sm mt-2 block">O relatório está sendo gerado agora.</span>
                        </p>

                        <div className="space-y-4">
                            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 text-slate-700">
                                <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">Enviado para</p>
                                <strong className="text-lg text-[#19406C]">{email}</strong>
                            </div>

                            <Button
                                className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg rounded-xl shadow-lg shadow-emerald-200 transition-all hover:-translate-y-0.5"
                                onClick={() => window.location.reload()}
                            >
                                <FileCheck className="w-5 h-5 mr-2" />
                                Visualizar Relatório
                            </Button>
                        </div>
                    </div>
                </main>
                <MinimalFooter />
            </div>
        );
    }

    // Pix Payment View
    if (pixData) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
                <header className="bg-white border-b border-gray-100 py-4 sticky top-0 z-50">
                    <div className="container mx-auto px-4 flex justify-between items-center">
                        <img src="/uploads/logo nova.png" alt="Confere Veicular" className="h-8 md:h-10 w-auto" />
                        <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest pl-4 border-l border-gray-200">Checkout Seguro</div>
                    </div>
                </header>
                <main className="flex-grow container mx-auto px-4 py-8 md:py-12 flex justify-center items-center">
                    <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl shadow-blue-900/10 border border-white/50 p-8 text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#19406C] to-[#00Cca7]" />

                        {/* Loading Spinner */}
                        <div className="absolute top-6 right-6">
                            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                                Aguardando
                            </div>
                        </div>

                        <div className="w-16 h-16 bg-blue-50 rounded-2xl rotate-3 flex items-center justify-center mx-auto mb-6 shadow-sm">
                            <div className="-rotate-3">
                                <img src="/pix-logo-final.png" alt="Pix" className="w-8 h-8 object-contain" />
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold text-[#19406C] mb-1">Pagamento via Pix</h2>
                        <p className="text-gray-500 mb-8 text-sm">Pague e receba seu relatório em segundos.</p>

                        <div className="mb-8 p-6 border border-gray-100 rounded-2xl flex flex-col items-center justify-center bg-white shadow-inner">
                            {pixData.qr_code ? (
                                <>
                                    <QRCodeSVG
                                        value={pixData.qr_code}
                                        size={200}
                                        level={"M"}
                                        className="mb-4"
                                    />
                                    <p className="text-xs text-center text-gray-400 max-w-[200px]">Aponte a câmera do seu celular no app do banco</p>
                                </>
                            ) : (
                                <div className="text-gray-400 text-sm">Gerando QR Code...</div>
                            )}
                        </div>

                        <div className="space-y-3">
                            <Button
                                onClick={copyToClipboard}
                                className="w-full h-12 bg-[#19406C] hover:bg-[#15355a] text-white font-bold rounded-xl shadow-lg shadow-blue-900/10 transition-all active:scale-[0.98]"
                            >
                                <Copy className="w-4 h-4 mr-2" />
                                Copiar Código Pix
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={() => setPixData(null)}
                                className="w-full h-12 text-gray-500 hover:text-gray-800 hover:bg-gray-50 rounded-xl"
                            >
                                Voltar e alterar pagamento
                            </Button>
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-50">
                            <p className="text-xs text-gray-400">
                                Pagamento seguro processado por Pagar.me
                            </p>
                        </div>
                    </div>
                </main>
                <MinimalFooter />
            </div>
        )
    }

    // Main Form View
    return (
        <div className="min-h-screen bg-[#F8F9FA] flex flex-col font-sans">
            {/* Header com Stepper */}
            <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/60 py-4 sticky top-0 z-50">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <img
                            src="/uploads/logo nova.png"
                            alt="Confere Veicular"
                            className="h-8 md:h-10 w-auto"
                        />

                        {/* Stepper */}
                        <div className="flex items-center gap-2 md:gap-4 text-xs md:text-sm font-medium text-gray-400">
                            <div className="flex items-center gap-1.5 opacity-50">
                                <div className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center">1</div>
                                <span>Consulta</span>
                            </div>
                            <div className="w-8 h-[1px] bg-gray-300"></div>
                            <div className="flex items-center gap-1.5 text-[#19406C]">
                                <div className="w-6 h-6 rounded-full bg-[#19406C] text-white flex items-center justify-center shadow-lg shadow-blue-900/20">2</div>
                                <span className="font-bold">Pagamento</span>
                            </div>
                            <div className="w-8 h-[1px] bg-gray-300"></div>
                            <div className="flex items-center gap-1.5 opacity-50">
                                <div className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center">3</div>
                                <span>Relatório</span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

                    {/* Coluna da Esquerda - Identificação e Ofertas */}
                    <div className="lg:col-span-7 space-y-8">

                        {/* Seção 1: Dados do Cliente */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 rounded-lg bg-[#19406C]/10 flex items-center justify-center text-[#19406C] font-bold">1</div>
                                <h2 className="text-xl font-bold text-gray-900">Seus Dados</h2>
                            </div>

                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6 md:p-8 hover:shadow-md transition-shadow duration-300">
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-gray-700 font-semibold flex items-center gap-2">
                                            E-mail para envio <span className="text-red-500">*</span>
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="exemplo@email.com"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="h-12 pl-4 text-lg bg-gray-50 border-gray-200 focus:bg-white focus:border-[#19406C] focus:ring-[#19406C] transition-all rounded-xl"
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500 flex items-center gap-1">
                                            <Lock className="w-3 h-3" /> Seus dados estão protegidos e não enviaremos spam.
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="cpf" className="text-gray-700 font-semibold flex items-center gap-2">
                                            CPF<span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="cpf"
                                            type="text"
                                            placeholder="000.000.000-00"
                                            value={cpf}
                                            onChange={(e) => setCpf(e.target.value)}
                                            className="h-12 pl-4 text-lg bg-gray-50 border-gray-200 focus:bg-white focus:border-[#19406C] focus:ring-[#19406C] transition-all rounded-xl"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Seção 2: Ofertas Especiais */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 rounded-lg bg-[#00Cca7]/10 flex items-center justify-center text-[#00Cca7] font-bold">2</div>
                                <h2 className="text-xl font-bold text-gray-900">Turbine sua Consulta</h2>
                            </div>

                            <div className="grid gap-4">
                                {/* Upsell - Débitos */}
                                <div
                                    className={`relative group rounded-2xl border-2 p-1 transition-all cursor-pointer overflow-hidden ${upsells.debitos ? 'border-[#00Cca7] ring-4 ring-[#00Cca7]/10' : 'border-transparent bg-white shadow-sm hover:shadow-md'}`}
                                    onClick={() => setUpsells(prev => ({ ...prev, debitos: !prev.debitos }))}
                                >
                                    <div className={`rounded-xl p-5 h-full transition-all ${upsells.debitos ? 'bg-[#00Cca7]/5' : 'bg-white border border-gray-100'}`}>
                                        <div className="flex items-start gap-4 z-10 relative">
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mt-1 transition-colors shrink-0 ${upsells.debitos ? 'border-[#00Cca7] bg-[#00Cca7]' : 'border-gray-300 bg-white'}`}>
                                                {upsells.debitos && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start mb-1 flex-wrap gap-2">
                                                    <h3 className="font-bold text-[#19406C] text-lg">Débitos e Multas</h3>
                                                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-sm">RECOMENDADO</span>
                                                </div>
                                                <p className="text-gray-600 text-sm mb-3 leading-relaxed">
                                                    Evite surpresas. Verifique IPVA, Licenciamento, DPVAT e Multas detalhadas.
                                                </p>
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-gray-400 line-through text-sm">R$ 14,99</span>
                                                    <span className="text-[#00Cca7] font-bold text-lg">R$ 7,99</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Upsell - Leilão */}
                                <div
                                    className={`relative group rounded-2xl border-2 p-1 transition-all cursor-pointer overflow-hidden ${upsells.leilao ? 'border-[#19406C] ring-4 ring-[#19406C]/10' : 'border-transparent bg-white shadow-sm hover:shadow-md'}`}
                                    onClick={() => setUpsells(prev => ({ ...prev, leilao: !prev.leilao }))}
                                >
                                    <div className={`rounded-xl p-5 h-full transition-all ${upsells.leilao ? 'bg-[#19406C]/5' : 'bg-white border border-gray-100'}`}>
                                        <div className="flex items-start gap-4 z-10 relative">
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mt-1 transition-colors shrink-0 ${upsells.leilao ? 'border-[#19406C] bg-[#19406C]' : 'border-gray-300 bg-white'}`}>
                                                {upsells.leilao && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start mb-1">
                                                    <h3 className="font-bold text-[#19406C] text-lg">Indício de Leilão</h3>
                                                </div>
                                                <p className="text-gray-600 text-sm mb-3 leading-relaxed">
                                                    Saiba se o veículo já foi ofertado em leilão. Essencial para negociações.
                                                </p>
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-gray-400 line-through text-sm">R$ 29,99</span>
                                                    <span className="text-[#19406C] font-bold text-lg">R$ 24,99</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Coluna da Direita - Resumo e Pagamento */}
                    <div className="lg:col-span-5 relative">
                        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 p-6 md:p-8 sticky top-24">
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#19406C] to-[#00Cca7] rounded-t-3xl" />

                            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <div className="p-2 bg-gray-50 rounded-lg text-[#19406C]">
                                    <FileCheck className="w-5 h-5" />
                                </div>
                                Resumo do Pedido
                            </h2>

                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between items-center py-3 border-b border-gray-50">
                                    <span className="text-gray-600 font-medium">Placa Consultada</span>
                                    <div className="font-bold text-[#19406C] bg-blue-50/50 border border-blue-100 px-3 py-1 rounded-lg tracking-wide shadow-sm">
                                        {plate}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-600">Consulta Completa</span>
                                        <span className="font-semibold text-gray-900">R$ {basePrice.toFixed(2).replace('.', ',')}</span>
                                    </div>

                                    {upsells.debitos && (
                                        <div className="flex justify-between items-center text-sm animate-in fade-in slide-in-from-right-4">
                                            <span className="text-gray-600 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#00Cca7]"></span> Débitos Veiculares</span>
                                            <span className="font-semibold text-gray-900">R$ {debitosPrice.toFixed(2).replace('.', ',')}</span>
                                        </div>
                                    )}

                                    {upsells.leilao && (
                                        <div className="flex justify-between items-center text-sm animate-in fade-in slide-in-from-right-4">
                                            <span className="text-gray-600 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#19406C]"></span> Leilão</span>
                                            <span className="font-semibold text-gray-900">R$ {leilaoPrice.toFixed(2).replace('.', ',')}</span>
                                        </div>
                                    )}
                                </div>

                                {discount > 0 && (
                                    <div className="flex justify-between items-center p-3 text-emerald-700 bg-emerald-50 rounded-xl border border-emerald-100/50 mt-2">
                                        <span className="text-sm font-bold flex items-center gap-1.5"><Tag className="w-3.5 h-3.5" /> Desconto aplicado</span>
                                        <span className="font-bold">- R$ {(getGrossTotal() * discount).toFixed(2).replace('.', ',')}</span>
                                    </div>
                                )}

                                <div className="flex justify-between items-end pt-6 border-t border-dashed border-gray-200 mt-4">
                                    <div className="text-sm text-gray-500 font-medium mb-1">Valor Total</div>
                                    <div className="text-3xl font-black text-[#19406C] tracking-tight">
                                        <span className="text-lg font-bold mr-0.5">R$</span>
                                        {calculateTotal().toFixed(2).replace('.', ',')}
                                    </div>
                                </div>
                            </div>

                            {/* Cupom */}
                            <div className="mb-8">
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Tag className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <Input
                                        placeholder="Possui cupom de desconto?"
                                        value={coupon}
                                        onChange={(e) => setCoupon(e.target.value)}
                                        className="pl-10 h-10 text-sm border-gray-200 bg-gray-50/50 focus:bg-white transition-all rounded-lg pr-20"
                                    />
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-1 top-1 h-8 px-3 text-[#19406C] font-semibold hover:bg-[#19406C]/10 rounded-md"
                                        onClick={handleApplyCoupon}
                                    >
                                        Aplicar
                                    </Button>
                                </div>
                            </div>

                            {/* Termos */}
                            <div className="mb-6 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                                <div className="flex items-start gap-3">
                                    <Checkbox
                                        id="terms"
                                        checked={acceptedTerms}
                                        onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                                        className="mt-0.5 border-gray-300 data-[state=checked]:bg-[#19406C] data-[state=checked]:border-[#19406C]"
                                    />
                                    <Label htmlFor="terms" className="text-xs text-gray-600 leading-relaxed cursor-pointer select-none">
                                        Ao continuar, declaro que li e concordo com os <span className="font-bold text-[#19406C] hover:underline">Termos de Uso</span> e <span className="font-bold text-[#19406C] hover:underline">Política de Privacidade</span>.
                                    </Label>
                                </div>
                            </div>

                            {/* Botão de Ação */}
                            <Button
                                className="w-full h-14 bg-[#19406C] hover:bg-[#15355a] text-white font-bold text-lg rounded-xl shadow-xl shadow-blue-900/20 transition-all hover:scale-[1.02] active:scale-[0.98] group"
                                onClick={handlePayment}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Processando...
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        GARANTIR CONSULTA
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                )}
                            </Button>

                            {/* Trust Signals Footer */}
                            <div className="mt-8 pt-6 border-t border-gray-100">
                                <div className="flex justify-center items-center gap-6 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                                    <div className="flex flex-col items-center gap-1">
                                        <ShieldCheck className="w-5 h-5 text-gray-800" />
                                        <span className="text-[10px] font-medium text-gray-500 uppercase">Compra Segura</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-1">
                                        <CreditCard className="w-5 h-5 text-gray-800" />
                                        <span className="text-[10px] font-medium text-gray-500 uppercase">Dados Protegidos</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-1">
                                        <CheckCircle className="w-5 h-5 text-gray-800" />
                                        <span className="text-[10px] font-medium text-gray-500 uppercase">Entrega Garantida</span>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                </div>
            </main>

            <MinimalFooter />
            <RecentPurchases />
        </div>
    );
};

export default Checkout;
