import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Lock, Car, FileText, CheckCircle2, DollarSign, Timer, ShieldCheck, Loader2, AlertCircle, User, Info, Copy, Printer, Crown, Search, Share2, Check, Bike, Clock } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { consultarPlaca, VehicleData } from "@/services/api";
import MinimalFooter from "@/components/MinimalFooter";
import { useToast } from "@/hooks/use-toast";
import { CouponPopup } from "@/components/CouponPopup";

export default function ResultadoConsulta() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const placa = searchParams.get("placa") || "";

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [veiculo, setVeiculo] = useState<VehicleData | null>(null);

    useEffect(() => {
        if (!placa) {
            navigate("/");
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await consultarPlaca(placa);
                setVeiculo(data);

                // Save to Recent Searches
                const history = JSON.parse(localStorage.getItem("recent_searches") || "[]");
                const newEntry = {
                    placa: data.placa || placa,
                    modelo: data.MODELO,
                    data: new Date().toISOString()
                };
                // Filter out duplicates
                const filtered = history.filter((h: any) => h.placa !== newEntry.placa);
                filtered.unshift(newEntry);
                localStorage.setItem("recent_searches", JSON.stringify(filtered.slice(0, 5)));

            } catch (err: any) {
                setError(err.message || "Erro ao consultar placa. Tente novamente.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [placa, navigate]);

    const [scanningStep, setScanningStep] = useState(0);
    const [progress, setProgress] = useState(0);

    // Simulator for scanning steps
    useEffect(() => {
        if (loading) {
            const steps = [
                { msg: "Conectando ao Detran...", time: 0 },
                { msg: "Verificando Bases Nacionais...", time: 1000 },
                { msg: "Buscando Histórico de Leilão...", time: 2500 },
                { msg: "Analisando Débitos e Multas...", time: 4000 },
                { msg: "Compilando Relatório...", time: 5500 }
            ];

            let currentStep = 0;
            const interval = setInterval(() => {
                setProgress((old) => Math.min(old + 1, 100));
            }, 60);

            const stepInterval = setInterval(() => {
                currentStep++;
                if (currentStep < steps.length) {
                    setScanningStep(currentStep);
                }
            }, 1500);

            return () => {
                clearInterval(interval);
                clearInterval(stepInterval);
            };
        }
    }, [loading]);

    if (loading) {
        const steps = [
            "Conectando ao Detran...",
            "Verificando Bases Nacionais...",
            "Buscando Histórico de Leilão...",
            "Analisando Débitos e Multas...",
            "Compilando Relatório..."
        ];

        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 font-sans">
                <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-8 text-center space-y-8 animate-in fade-in zoom-in duration-500">
                    <div className="relative w-24 h-24 mx-auto">
                        <div className="absolute inset-0 border-[6px] border-gray-100 rounded-full"></div>
                        <div className="absolute inset-0 border-[6px] border-[#19406C] border-t-transparent rounded-full animate-spin"></div>
                        <Search className="absolute inset-0 m-auto w-8 h-8 text-[#19406C] animate-pulse" />
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-gray-900 animate-pulse">
                            {steps[scanningStep] || "Processando..."}
                        </h2>
                        <div className="space-y-2">
                            <Progress value={progress} className="h-3 rounded-full bg-gray-100" />
                            <p className="text-sm text-gray-500 font-medium">{progress}% concluído</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className={`p-3 rounded-xl border transition-colors duration-300 flex items-center gap-2 ${scanningStep > 0 ? 'bg-green-50 border-green-100 text-green-700' : 'bg-gray-50 border-gray-100 text-gray-400'}`}>
                            <CheckCircle2 className={`w-4 h-4 ${scanningStep > 0 ? 'text-green-600' : 'text-gray-300'}`} />
                            <span className="font-medium">Detran</span>
                        </div>
                        <div className={`p-3 rounded-xl border transition-colors duration-300 flex items-center gap-2 ${scanningStep > 1 ? 'bg-green-50 border-green-100 text-green-700' : 'bg-gray-50 border-gray-100 text-gray-400'}`}>
                            <CheckCircle2 className={`w-4 h-4 ${scanningStep > 1 ? 'text-green-600' : 'text-gray-300'}`} />
                            <span className="font-medium">Denatran</span>
                        </div>
                        <div className={`p-3 rounded-xl border transition-colors duration-300 flex items-center gap-2 ${scanningStep > 2 ? 'bg-green-50 border-green-100 text-green-700' : 'bg-gray-50 border-gray-100 text-gray-400'}`}>
                            <CheckCircle2 className={`w-4 h-4 ${scanningStep > 2 ? 'text-green-600' : 'text-gray-300'}`} />
                            <span className="font-medium">Leilões</span>
                        </div>
                        <div className={`p-3 rounded-xl border transition-colors duration-300 flex items-center gap-2 ${scanningStep > 3 ? 'bg-green-50 border-green-100 text-green-700' : 'bg-gray-50 border-gray-100 text-gray-400'}`}>
                            <CheckCircle2 className={`w-4 h-4 ${scanningStep > 3 ? 'text-green-600' : 'text-gray-300'}`} />
                            <span className="font-medium">Financeiras</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 font-sans">
                <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-gray-100 text-center animate-in fade-in zoom-in duration-300">
                    <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertCircle className="h-10 w-10 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">Ops! Algo deu errado</h2>
                    <p className="text-gray-500 mb-8 leading-relaxed">{error}</p>
                    <Button onClick={() => navigate("/")} className="w-full h-12 text-lg rounded-xl bg-[#19406C] hover:bg-[#15355a]">
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Voltar e tentar novamente
                    </Button>
                </div>
            </div>
        );
    }

    if (!veiculo) return null;

    const isBike = veiculo.extra?.especie?.toUpperCase().includes("MOTO") ||
        veiculo.extra?.especie?.toUpperCase().includes("CICLOMOTOR") ||
        veiculo.segmento?.toUpperCase().includes("MOTO");

    const VehicleIcon = isBike ? Bike : Car;

    return (
        <div className="min-h-screen bg-[#F8F9FA] flex flex-col font-sans">
            {/* Header Pro */}
            <div className="bg-[#19406C] pb-32 md:pb-48 relative overflow-hidden">
                <div className="absolute inset-0 bg-blue-900/20 pattern-grid-lg opacity-10"></div>
                {/* Background Shapes */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#00Cca7]/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

                <div className="container mx-auto px-4 pt-6 relative z-10">
                    <div className="flex justify-between items-center mb-8">
                        <img src="/uploads/logo nova.png" alt="CONFERE VEICULAR" className="h-10 md:h-12 brightness-0 invert opacity-90" />
                        <Button
                            variant="ghost"
                            onClick={() => navigate("/")}
                            className="text-white hover:bg-white/10 hover:text-white rounded-full px-4"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Nova Consulta
                        </Button>
                    </div>
                </div>
            </div>

            {/* Conteúdo Principal */}
            <div className="container mx-auto px-4 max-w-5xl -mt-24 md:-mt-32 flex-grow relative z-20 pb-16">

                {/* Placa e Header Principal */}
                <div className="bg-white rounded-[2.5rem] shadow-xl shadow-[#19406C]/10 border border-white/50 p-6 md:p-10 mb-8 relative overflow-hidden backdrop-blur-sm">
                    <div className="absolute top-0 right-0 w-full h-2 bg-gradient-to-r from-[#19406C] to-[#00Cca7]"></div>

                    <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12 relative z-10">

                        {/* Informações do Veículo */}
                        <div className="text-center md:text-left space-y-2 flex-1">
                            <div className="inline-flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full text-[#19406C] text-xs font-bold tracking-wider mb-2 border border-blue-100">
                                <Search className="w-3 h-3" />
                                RESULTADO DA CONSULTA
                            </div>
                            <h1 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight">
                                {veiculo.MARCA || 'VEÍCULO'} <span className="text-[#00Cca7] block md:inline">{veiculo.MODELO?.split(' ')[0] || 'ENCONTRADO'}</span>
                            </h1>
                            <div className="flex items-center justify-center md:justify-start gap-4 text-gray-500 font-medium">
                                <span className="flex items-center gap-1.5"><VehicleIcon className="w-4 h-4" />{veiculo.extra?.ano_fabricacao}/{veiculo.extra?.ano_modelo}</span>
                                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                <span className="flex items-center gap-1.5 uppercase">{veiculo.cor}</span>
                            </div>
                        </div>

                        {/* Placa Mercosul Realista */}
                        <div className="relative transform hover:scale-105 transition-transform duration-500 cursor-default group">
                            <div className="absolute inset-0 bg-[#003399]/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <div className="relative w-72 h-24 bg-white border-[4px] border-gray-900 rounded-xl shadow-2xl overflow-hidden flex flex-col">
                                <div className="bg-[#003399] h-8 w-full flex items-center justify-between px-3 relative border-b border-white/20">
                                    <span className="text-[7px] text-white font-bold tracking-widest opacity-90">MERCOSUL</span>
                                    <div className="text-white font-bold text-[10px] tracking-[0.2em]">BRASIL</div>
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/0/05/Flag_of_Brazil.svg" alt="BR" className="w-5 h-3.5 rounded-[1px] shadow-sm border border-white/10" />
                                </div>
                                <div className="flex-1 flex items-center justify-center relative bg-white">
                                    <span className="text-[3.5rem] font-black tracking-[0.15em] text-gray-900 leading-none pt-2" style={{ fontFamily: 'MercosulPlate, sans-serif' }}>
                                        {(() => {
                                            const clean = placa.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
                                            if (clean.length !== 7) return placa;
                                            return `${clean.slice(0, 3)}${clean.slice(3)}`;
                                        })()}
                                    </span>
                                    {/* QR Code Fake */}
                                    <div className="absolute left-3 top-3 w-6 h-6 bg-gray-100 rounded p-0.5 opacity-50">
                                        <div className="w-full h-full border border-gray-300"></div>
                                    </div>
                                    <span className="absolute bottom-1.5 left-3 font-bold text-[9px] text-gray-600/80">BR</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Botões de Ação */}
                <div className="flex flex-wrap items-center justify-center gap-4 mb-10">
                    <Button
                        variant="outline"
                        className="h-12 px-6 rounded-xl gap-2 bg-white text-gray-600 border-gray-200 hover:border-[#19406C] hover:bg-[#19406C]/5 hover:text-[#19406C] shadow-sm transition-all text-base"
                        onClick={() => {
                            // ... existing copy logic ...
                            const fipeText = veiculo.fipe?.dados?.map(f =>
                                `- ${f.texto_modelo} (${f.combustivel}): ${f.texto_valor} (Ref: ${f.mes_referencia})`
                            ).join('\n') || 'Não disponível';

                            const text = `
RELATÓRIO DE CONSULTA VEICULAR
--------------------------------
PRINCIPAIS
Placa: ${veiculo.placa || placa}
Marca/Modelo: ${veiculo.MARCA || 'N/A'}/${veiculo.MODELO || 'N/A'}
Ano Fabricação: ${veiculo.extra?.ano_fabricacao || veiculo.ano || 'N/A'}
Ano Modelo: ${veiculo.extra?.ano_modelo || veiculo.anoModelo || 'N/A'}

IDENTIFICAÇÃO
Procedência: ${veiculo.extra?.procedencia || veiculo.origem || "NACIONAL"}
Categoria: ${veiculo.extra?.especie || "PARTICULAR"}

TABELA FIPE
${fipeText}
--------------------------------
Gerado por Confere Veicular
                            `.trim();
                            navigator.clipboard.writeText(text);
                            toast({
                                title: "Copiado com Sucesso!",
                                description: "Resumo do relatório copiado.",
                                className: "bg-[#19406C] text-white border-none"
                            });
                        }}
                    >
                        <Copy className="w-4 h-4" />
                        Copiar Resumo
                    </Button>

                    <Button
                        className="h-12 px-8 rounded-xl gap-2 bg-[#00Cca7] hover:bg-[#00b896] text-white font-bold text-base shadow-lg shadow-[#00Cca7]/30 hover:shadow-xl hover:shadow-[#00Cca7]/40 hover:-translate-y-0.5 transition-all"
                        onClick={() => navigate(`/checkout?placa=${placa}`)}
                    >
                        <Crown className="w-5 h-5" />
                        Liberar Tudo Agora
                    </Button>
                </div>

                {/* Grid Informações */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8">
                    <InfoCard
                        title="Dados Principais"
                        icon={VehicleIcon}
                        iconColor="text-[#19406C]"
                        iconBg="bg-[#19406C]/10"
                        description="Informações básicas do cadastro"
                    >
                        <InfoRow label="Placa" value={veiculo.placa || placa} />
                        <InfoRow label="Marca/Modelo" value={`${veiculo.MARCA || 'N/A'}/${veiculo.MODELO || 'N/A'}`} />
                        <InfoRow label="Marca" value={veiculo.MARCA || 'N/A'} />
                        <InfoRow label="Modelo" value={veiculo.MODELO || 'N/A'} />
                        <InfoRow label="Ano Fab/Mod" value={`${veiculo.extra?.ano_fabricacao || veiculo.ano || '-'}/${veiculo.extra?.ano_modelo || veiculo.anoModelo || '-'}`} />
                        <InfoRow label="Cor" value={veiculo.cor || 'N/A'} />
                        <InfoRow label="Combustível" value={veiculo.extra?.combustivel || 'N/A'} />
                    </InfoCard>

                    <InfoCard
                        title="Ficha Técnica"
                        icon={FileText}
                        iconColor="text-indigo-600"
                        iconBg="bg-indigo-50"
                        description="Detalhes técnicos e restrições"
                    >
                        <LockedRow label="Renavam" value="************" blur={false} />
                        <LockedRow label="Chassi" value={veiculo.extra?.chassi ? `${veiculo.extra.chassi.substring(0, 5)}*************` : "************"} blur={false} />
                        <LockedRow label="Motor" value="************" blur={false} />
                        <InfoRow label="Procedência" value={veiculo.extra?.procedencia || veiculo.origem || "NACIONAL"} />
                        <LockedRow label="Câmbio" value="************" blur={false} />
                        <LockedRow label="Carroceria" value="************" blur={false} />
                        <InfoRow label="Categoria" value={veiculo.extra?.especie || "PARTICULAR"} />
                    </InfoCard>
                </div>

                {/* Grid Informações Adicionais */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8">
                    <InfoCard
                        title="Proprietário"
                        icon={User}
                        iconColor="text-purple-600"
                        iconBg="bg-purple-50"
                        description="Dados do atual proprietário"
                    >
                        <LockedRow label="Nome Completo" value="***********************" blur={false} />
                        <LockedRow label="CPF/CNPJ (Parcial)" value="***.***.***-**" blur={false} />
                        <LockedRow label="Tipo Documento" value="************" blur={false} />
                        <InfoRow label="Tipo Doc. Faturado" value={veiculo.extra?.tipo_doc_faturado || '-'} />
                        <InfoRow label="UF Faturado" value={veiculo.extra?.uf_faturado || '-'} />
                    </InfoCard>

                    <InfoCard
                        title="Situação Legal"
                        icon={ShieldCheck}
                        iconColor="text-teal-600"
                        iconBg="bg-teal-50"
                        description="Restrições e localização"
                    >
                        <LockedRow label="Roubo e Furto" value="NADA CONSTA" isAlert={true} />
                        <InfoRow label="Município" value={veiculo.municipio || '-'} />
                        <InfoRow label="Estado (UF)" value={veiculo.uf || '-'} />
                        <InfoRow label="Segmento" value={veiculo.segmento || '-'} />
                        <InfoRow label="Sub Segmento" value={veiculo.sub_segmento || '-'} />
                    </InfoCard>
                </div>

                {/* Tabela FIPE */}
                {
                    veiculo.fipe && veiculo.fipe.dados && veiculo.fipe.dados.length > 0 && (
                        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-200/60 p-6 md:p-8 mb-12 hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-100">
                                <div className="w-12 h-12 rounded-2xl bg-[#00Cca7]/10 flex items-center justify-center">
                                    <DollarSign className="w-6 h-6 text-[#00Cca7]" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Histórico de Preços (FIPE)</h2>
                                    <p className="text-sm text-gray-500">Valores de mercado atualizados</p>
                                </div>
                            </div>
                            <Accordion type="single" collapsible className="w-full">
                                {veiculo.fipe.dados.map((fipeData, index) => (
                                    <AccordionItem key={index} value={`item-${index}`} className="border-b-0 mb-3 last:mb-0">
                                        <AccordionTrigger className="bg-gray-50 px-5 py-4 rounded-xl hover:no-underline hover:bg-gray-100 transition-colors border border-gray-100 text-gray-700 font-semibold text-left">
                                            <span className="flex-1">{fipeData.texto_modelo}</span>
                                            <Badge variant="secondary" className="ml-2 font-normal bg-white border-gray-200">{fipeData.combustivel}</Badge>
                                        </AccordionTrigger>
                                        <AccordionContent className="px-5 pt-4 pb-2">
                                            <div className="flex justify-between items-center p-3 bg-blue-50/50 rounded-lg border border-blue-100/50">
                                                <span className="text-gray-600 font-medium">Mês de referência</span>
                                                <span className="font-bold text-[#19406C]">{fipeData.mes_referencia}</span>
                                            </div>
                                            <div className="flex justify-between items-center mt-3 p-3 bg-green-50/50 rounded-lg border border-green-100/50">
                                                <span className="text-gray-600 font-medium">Valor Estimado</span>
                                                <span className="font-black text-[#00Cca7] text-xl tracking-tight">{fipeData.texto_valor}</span>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </div>
                    )
                }

                {/* Banner Promocional Premium */}
                <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl bg-[#19406C] mb-16 group">
                    <div className="absolute inset-0 opacity-10 pattern-grid-lg"></div>
                    <div className="absolute -right-20 -top-20 w-96 h-96 bg-[#00Cca7] rounded-full blur-[100px] opacity-20 group-hover:opacity-30 transition-opacity duration-1000"></div>
                    <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-blue-500 rounded-full blur-[100px] opacity-20 group-hover:opacity-30 transition-opacity duration-1000"></div>

                    <div className="container mx-auto px-8 md:px-12 relative z-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center py-10 md:py-16">
                            <div className="text-white space-y-6">
                                <div className="space-y-4">
                                    <Badge className="bg-[#00Cca7] text-white border-none hover:bg-[#00b896] px-3 py-1 text-sm">
                                        OFERTA EXCLUSIVA
                                    </Badge>
                                    <h2 className="text-3xl md:text-5xl font-black leading-tight tracking-tight">
                                        Descubra o Histórico <span className="text-[#00Cca7]">Completo!</span>
                                    </h2>
                                    <p className="text-blue-100 text-lg font-light leading-relaxed max-w-md">
                                        Não arrisque seu dinheiro. Tenha acesso a leilões, dívidas, restrições judiciais e muito mais.
                                    </p>
                                </div>

                                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 max-w-sm hover:bg-white/15 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-blue-200/80 text-sm line-through mb-1 font-medium">De R$ 27,99</p>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-[#00Cca7] text-xl font-bold">R$</span>
                                                <span className="text-[#00Cca7] text-5xl font-black tracking-tighter">24,90</span>
                                            </div>
                                        </div>
                                        <div className="bg-[#00Cca7]/20 text-[#00Cca7] px-3 py-2 rounded-xl border border-[#00Cca7]/30">
                                            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
                                                <Timer className="w-3.5 h-3.5" /><span>Tempo Limitado</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    className="bg-[#00Cca7] hover:bg-[#00b896] text-white font-bold text-lg h-14 px-8 rounded-xl w-full md:w-auto shadow-xl hover:shadow-[#00Cca7]/50 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2 group"
                                    onClick={() => navigate(`/checkout?placa=${placa}`)}
                                >
                                    <Lock className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                    LIBERAR RELATÓRIO AGORA
                                </Button>

                                <div className="flex items-center gap-4 text-xs font-medium text-blue-200/60 pt-2">
                                    <div className="flex items-center gap-1.5">
                                        <ShieldCheck className="w-4 h-4" /><span>Compra Segura</span>
                                    </div>
                                    <div className="w-1 h-1 rounded-full bg-blue-200/20"></div>
                                    <div className="flex items-center gap-1.5">
                                        <CheckCircle2 className="w-4 h-4" /><span>Satisfação Garantida</span>
                                    </div>
                                </div>
                            </div>

                            {/* Decorative or Image Placeholder */}
                            <div className="hidden md:flex justify-center relative">
                                <div className="relative z-10 w-full max-w-sm bg-white rounded-2xl p-6 shadow-2xl rotate-3 transform transition-transform duration-500 hover:rotate-2">
                                    <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-4">
                                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                                            <AlertCircle className="w-5 h-5 text-red-600" />
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-400 font-bold uppercase">ALERTA DETECTADO</div>
                                            <div className="font-bold text-gray-800">Passagem por Leilão</div>
                                        </div>
                                    </div>
                                    <div className="space-y-3 opacity-60">
                                        <div className="h-2 bg-gray-100 rounded w-3/4"></div>
                                        <div className="h-2 bg-gray-100 rounded w-full"></div>
                                        <div className="h-2 bg-gray-100 rounded w-5/6"></div>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                                        <div className="text-xs text-gray-400">Fonte: Base Nacional</div>
                                        <Badge variant="destructive" className="text-[10px]">RISCO MÉDIO</Badge>
                                    </div>

                                    {/* Blur overlay */}
                                    <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px] rounded-2xl flex items-center justify-center">
                                        <Lock className="w-8 h-8 text-gray-400/50" />
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

            </div>

            {/* Consultas Recentes Section */}
            <div className="container mx-auto px-4 max-w-5xl mb-12">
                <div className="flex items-center gap-3 mb-6">
                    <Clock className="w-6 h-6 text-gray-400" />
                    <h3 className="text-lg font-bold text-gray-700">Consultas Recentes</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {JSON.parse(localStorage.getItem("recent_searches") || "[]").map((item: any, i: number) => (
                        <div key={i} onClick={() => navigate(`/resultado?placa=${item.placa}`)} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md cursor-pointer transition-all flex justify-between items-center group">
                            <div>
                                <div className="font-bold text-[#19406C]">{item.placa}</div>
                                <div className="text-xs text-gray-500 truncate max-w-[150px]">{item.modelo}</div>
                            </div>
                            <ArrowLeft className="w-4 h-4 text-gray-300 group-hover:text-[#00Cca7] rotate-180 transition-colors" />
                        </div>
                    ))}
                    {JSON.parse(localStorage.getItem("recent_searches") || "[]").length === 0 && (
                        <p className="text-gray-400 text-sm col-span-3">Nenhuma consulta recente encontrada.</p>
                    )}
                </div>
            </div>

            <MinimalFooter />
            <CouponPopup />
        </div>
    );
}

const InfoCard = ({ title, icon: Icon, iconColor, iconBg, description, children }: any) => (
    <div className="bg-white rounded-[1.5rem] shadow-sm border border-gray-200/60 p-6 md:p-8 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
        <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-50">
            <div className={`w-12 h-12 rounded-2xl ${iconBg} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                <Icon className={`w-6 h-6 ${iconColor}`} />
            </div>
            <div>
                <h2 className="text-xl font-bold text-gray-900 leading-tight">{title}</h2>
                <p className="text-xs text-gray-500 font-medium mt-0.5">{description}</p>
            </div>
        </div>
        <div className="space-y-1">{children}</div>
    </div>
);

const InfoRow = ({ label, value }: { label: string, value?: string }) => (
    <div className="flex items-center justify-between py-3 px-3 border-b border-gray-50 last:border-0 hover:bg-gray-50/80 rounded-lg transition-colors">
        <span className="font-medium text-gray-500 text-sm">{label}</span>
        <span className="text-gray-900 font-bold text-right text-sm md:text-base break-all pl-4">{value || '-'}</span>
    </div>
);

const LockedRow = ({ label, value = "DADO SIGILOSO", isAlert = false, blur = true }: { label: string, value?: string, isAlert?: boolean, blur?: boolean }) => (
    <div className="flex items-center justify-between py-3 px-3 border-b border-gray-50 last:border-0 hover:bg-gray-50/80 rounded-lg transition-colors group/row cursor-pointer relative overflow-hidden" onClick={() => document.getElementById('checkout-btn')?.click()}>
        <span className="font-medium text-gray-500 text-sm group-hover/row:text-[#19406C] transition-colors flex items-center gap-2 z-10">
            {label}
            {isAlert && <Badge variant="destructive" className="h-5 px-1.5 text-[10px] animate-pulse">ALERTA</Badge>}
        </span>
        <div className={`relative flex items-center px-3 py-1.5 rounded-lg border transition-all z-10 ${isAlert ? 'bg-red-50 border-red-100' : 'bg-gray-100 border-gray-200 group-hover/row:border-[#19406C]/30 group-hover/row:bg-blue-50'}`}>
            <span className={`font-bold text-sm select-none transition-colors ${isAlert ? 'text-red-800' : 'text-gray-500 group-hover/row:text-[#19406C]'} ${blur ? 'blur-[5px] opacity-70' : ''}`}>
                {value}
            </span>
            {blur && (
                <div className="absolute inset-0 flex items-center justify-center">
                    {isAlert ? (
                        <span className="text-[10px] font-black text-red-600 bg-red-100/90 px-2 py-0.5 rounded shadow-sm">VERIFICAR</span>
                    ) : (
                        <Lock className="w-3.5 h-3.5 text-gray-400 group-hover/row:text-[#19406C] transition-colors" />
                    )}
                </div>
            )}
            {!blur && <Lock className="w-3 h-3 text-gray-400 ml-2" />}
        </div>
    </div>
);
