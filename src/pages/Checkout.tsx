import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Shield, Lock, Check, CreditCard, Tag, ArrowRight, Copy, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import MinimalFooter from "@/components/MinimalFooter";
import pagarme from "@/services/pagarme";

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

    const handleApplyCoupon = () => {
        if (coupon.trim().toUpperCase() === "PRIMEIRA20") {
            setDiscount(0.20);
            toast({
                title: "Sucesso!",
                description: "Cupom de 20% aplicado com sucesso.",
                className: "bg-green-600 text-white border-none"
            });
        } else {
            setDiscount(0);
            toast({
                title: "Cupom inválido",
                description: "O código informado não é válido.",
                variant: "destructive"
            });
        }
    };

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
            const amount = Math.round(calculateTotal() * 100);
            const description = `Consulta Veicular Placa ${plate}`;

            const customer = {
                name: "Cliente Confere", // In a real app we'd ask for the name
                email: email,
                document: cpf.replace(/\D/g, '') // Remove non-digits
            };

            const data = await pagarme.createPixTransaction(amount, description, customer);

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

        } catch (error: any) {
            console.error("Payment error:", error);
            toast({
                title: "Erro no pagamento",
                description: error.message || "Não foi possível gerar o pagamento. Tente novamente.",
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

    if (pixData) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <header className="bg-white border-b border-gray-200 py-4 sticky top-0 z-50">
                    <div className="container mx-auto px-4 flex justify-center">
                        <img
                            src="/uploads/logo nova.png"
                            alt="Confere Veicular"
                            className="h-8 md:h-10 w-auto"
                        />
                    </div>
                </header>
                <main className="flex-grow container mx-auto px-4 py-8 md:py-12 flex justify-center items-center">
                    <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <QrCode className="w-8 h-8 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-[#19406C] mb-2">Pagamento Pix</h2>
                        <p className="text-gray-600 mb-8">Escaneie o QR Code abaixo ou copie o código para pagar.</p>

                        <div className="mb-8 p-4 border-2 border-dashed border-gray-200 rounded-xl">
                            {pixData.qr_code_url ? (
                                <img src={pixData.qr_code_url} alt="QR Code Pix" className="w-full h-auto" />
                            ) : (
                                <div className="break-all text-xs text-gray-400 p-4 bg-gray-50 rounded">
                                    {pixData.qr_code}
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            <Button
                                onClick={copyToClipboard}
                                className="w-full h-12 bg-[#19406C] hover:bg-[#19406C]/90 font-bold gap-2"
                            >
                                <Copy className="w-4 h-4" />
                                Copiar Código Pix
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setPixData(null)}
                                className="w-full h-12 border-gray-300 text-gray-600 hover:bg-gray-50"
                            >
                                Voltar
                            </Button>
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-100">
                            <p className="text-sm text-gray-500">
                                Após o pagamento, seu relatório será enviado para <span className="font-bold text-[#19406C]">{email}</span>
                            </p>
                        </div>
                    </div>
                </main>
                <MinimalFooter />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header Simplificado */}
            <header className="bg-white border-b border-gray-200 py-4 sticky top-0 z-50">
                <div className="container mx-auto px-4 flex justify-center">
                    <img
                        src="/uploads/logo nova.png"
                        alt="Confere Veicular"
                        className="h-8 md:h-10 w-auto"
                    />
                </div>
            </header>

            <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

                    {/* Coluna da Esquerda - Formulário e Upsells */}
                    <div className="lg:col-span-7 space-y-6">

                        {/* Card de Email */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                            <h2 className="text-xl md:text-2xl font-bold text-[#19406C] mb-6 flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-[#19406C]/10 flex items-center justify-center text-[#19406C] text-sm">1</div>
                                Preencha suas Informações
                            </h2>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-gray-700 font-medium">Informe o seu e-mail</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="seu@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="h-12 text-lg border-gray-300 focus:border-[#19406C] focus:ring-[#19406C]"
                                    />
                                    <p className="text-sm text-gray-500">
                                        Neste e-mail que enviaremos seu relatório completo. Por favor, informe um e-mail válido.
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="cpf" className="text-gray-700 font-medium">Informe o seu CPF</Label>
                                    <Input
                                        id="cpf"
                                        type="text"
                                        placeholder="000.000.000-00"
                                        value={cpf}
                                        onChange={(e) => setCpf(e.target.value)}
                                        className="h-12 text-lg border-gray-300 focus:border-[#19406C] focus:ring-[#19406C]"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Upsell - Débitos */}
                        <div
                            className={`rounded-2xl border-2 p-6 transition-all cursor-pointer relative overflow-hidden ${upsells.debitos ? 'border-[#00Cca7] bg-[#00Cca7]/5' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                            onClick={() => setUpsells(prev => ({ ...prev, debitos: !prev.debitos }))}
                        >
                            <div className="flex items-start gap-4">
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mt-1 transition-colors ${upsells.debitos ? 'border-[#00Cca7]' : 'border-gray-300'}`}>
                                    {upsells.debitos && <div className="w-3 h-3 rounded-full bg-[#00Cca7]" />}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="font-bold text-[#19406C] text-lg">Débitos Veiculares</h3>
                                        <span className="text-[#00Cca7] font-bold text-sm bg-[#00Cca7]/10 px-2 py-1 rounded">OFERTA</span>
                                    </div>
                                    <p className="text-gray-600 text-sm mb-2">Descubra se o veículo tem débitos de <span className="font-bold">IPVA, Licenciamento e multas.</span></p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-gray-400 line-through text-sm">de R$14,99</span>
                                        <span className="text-[#19406C] font-bold text-xl">por R$7,99</span>
                                    </div>
                                </div>
                            </div>
                            {upsells.debitos && (
                                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-[#00Cca7]/20 to-transparent rounded-bl-full -mr-8 -mt-8"></div>
                            )}
                        </div>

                        {/* Upsell - Leilão */}
                        <div
                            className={`rounded-2xl border-2 p-6 transition-all cursor-pointer relative overflow-hidden ${upsells.leilao ? 'border-[#00Cca7] bg-[#00Cca7]/5' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                            onClick={() => setUpsells(prev => ({ ...prev, leilao: !prev.leilao }))}
                        >
                            <div className="flex items-start gap-4">
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mt-1 transition-colors ${upsells.leilao ? 'border-[#00Cca7]' : 'border-gray-300'}`}>
                                    {upsells.leilao && <div className="w-3 h-3 rounded-full bg-[#00Cca7]" />}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="font-bold text-[#19406C] text-lg">Passagem por Leilão</h3>
                                        <span className="text-[#00Cca7] font-bold text-sm bg-[#00Cca7]/10 px-2 py-1 rounded">OFERTA</span>
                                    </div>
                                    <p className="text-gray-600 text-sm mb-2">Descubra se o veículo já teve passagem por leilões e evite prejuízos.</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-gray-400 line-through text-sm">de R$29,99</span>
                                        <span className="text-[#19406C] font-bold text-xl">por R$24,99</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Coluna da Direita - Resumo do Pedido */}
                    <div className="lg:col-span-5">
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8 sticky top-24">
                            <h2 className="text-xl md:text-2xl font-bold text-[#19406C] mb-6 flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-[#19406C]/10 flex items-center justify-center text-[#19406C] text-sm">2</div>
                                Resumo do Pedido
                            </h2>

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                    <span className="text-gray-600">Placa</span>
                                    <span className="font-bold text-[#19406C] bg-gray-100 px-3 py-1 rounded-lg">{plate}</span>
                                </div>

                                <div className="flex justify-between items-center py-2">
                                    <span className="text-gray-600">Consulta Completa</span>
                                    <span className="font-medium text-gray-900">R$ {basePrice.toFixed(2).replace('.', ',')}</span>
                                </div>

                                {upsells.debitos && (
                                    <div className="flex justify-between items-center py-2 animate-in fade-in slide-in-from-top-2">
                                        <span className="text-gray-600 text-sm">+ Débitos Veiculares</span>
                                        <span className="font-medium text-gray-900">R$ {debitosPrice.toFixed(2).replace('.', ',')}</span>
                                    </div>
                                )}

                                {upsells.leilao && (
                                    <div className="flex justify-between items-center py-2 animate-in fade-in slide-in-from-top-2">
                                        <span className="text-gray-600 text-sm">+ Leilão</span>
                                        <span className="font-medium text-gray-900">R$ {leilaoPrice.toFixed(2).replace('.', ',')}</span>
                                    </div>
                                )}

                                {discount > 0 && (
                                    <div className="flex justify-between items-center py-2 text-[#00Cca7] bg-[#00Cca7]/5 px-2 rounded-lg">
                                        <span className="text-sm font-medium flex items-center gap-1"><Tag className="w-3 h-3" /> Desconto (20%)</span>
                                        <span className="font-bold">- R$ {(getGrossTotal() * discount).toFixed(2).replace('.', ',')}</span>
                                    </div>
                                )}

                                <div className="flex justify-between items-center pt-5 pb-2 border-t border-gray-100">
                                    <span className="text-gray-600">Método</span>
                                    <img src="/pix-logo-final.png" alt="PIX" className="h-8 w-auto object-contain" />
                                </div>
                            </div>

                            <div className="flex justify-between items-end mb-8 pt-4 border-t border-gray-100">
                                <span className="text-gray-500 font-medium">TOTAL</span>
                                <span className="text-3xl font-black text-[#19406C]">
                                    R$ {calculateTotal().toFixed(2).replace('.', ',')}
                                </span>
                            </div>

                            {/* Cupom */}
                            <div className="mb-6">
                                <Label className="text-xs text-gray-500 mb-1.5 block">Cupom de desconto</Label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <Input
                                            placeholder="Adicionar Cupom"
                                            value={coupon}
                                            onChange={(e) => setCoupon(e.target.value)}
                                            className="pl-9 h-10 text-sm border-gray-300 border-dashed"
                                        />
                                    </div>
                                    <Button
                                        variant="outline"
                                        className="h-10 px-4 text-[#19406C] border-[#19406C] hover:bg-[#19406C]/5"
                                        onClick={handleApplyCoupon}
                                    >
                                        Validar
                                    </Button>
                                </div>
                            </div>

                            {/* Termos */}
                            <div className="flex items-start gap-2 mb-6">
                                <Checkbox
                                    id="terms"
                                    checked={acceptedTerms}
                                    onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                                    className="mt-1 border-gray-300 data-[state=checked]:bg-[#19406C] data-[state=checked]:border-[#19406C]"
                                />
                                <Label htmlFor="terms" className="text-sm text-gray-500 leading-tight cursor-pointer">
                                    Li e concordo com os <span className="font-bold text-[#19406C] hover:underline">Termos e Condições</span> deste serviço.
                                </Label>
                            </div>

                            {/* Botão Continuar */}
                            <Button
                                className="w-full h-14 text-lg font-bold bg-[#19406C] hover:bg-[#19406C]/90 shadow-lg shadow-[#19406C]/20 transition-all hover:scale-[1.02]"
                                onClick={handlePayment}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        CONTINUAR
                                        <ArrowRight className="ml-2 w-5 h-5" />
                                    </>
                                )}
                            </Button>

                            {/* Selos de Segurança */}
                            <div className="flex justify-center items-center gap-4 mt-6 opacity-80 grayscale hover:grayscale-0 transition-all">
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                    <Shield className="w-4 h-4 text-[#00Cca7]" />
                                    <span>Site Seguro</span>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                    <Lock className="w-4 h-4 text-[#00Cca7]" />
                                    <span>Certificado SSL</span>
                                </div>
                            </div>

                        </div>
                    </div>

                </div>
            </main>

            <MinimalFooter />
        </div>
    );
};

export default Checkout;
