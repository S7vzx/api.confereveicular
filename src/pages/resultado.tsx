import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Lock, Car, FileText, CheckCircle2, DollarSign, Timer, ShieldCheck, Loader2, AlertCircle, User, Info, Copy, Printer, Crown } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
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
            } catch (err: any) {
                setError(err.message || "Erro ao consultar placa. Tente novamente.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [placa, navigate]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f0f2f5] flex flex-col items-center justify-center p-4">
                <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                <h2 className="text-xl font-bold text-gray-700">Consultando base de dados...</h2>
                <p className="text-gray-500">Aguarde um momento enquanto buscamos as informações.</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#f0f2f5] flex flex-col items-center justify-center p-4">
                <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="h-8 w-8 text-red-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Ops! Algo deu errado</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <Button onClick={() => navigate("/")} className="w-full">
                        Voltar e tentar novamente
                    </Button>
                </div>
            </div>
        );
    }

    if (!veiculo) return null;

    return (
        <div className="min-h-screen bg-[#f0f2f5] flex flex-col">
            {/* Header Azul com Logo */}
            <div className="bg-primary pb-48">
                <div className="container mx-auto px-4 flex justify-center pb-6">
                    <div className="bg-white rounded-b-2xl px-12 py-6 shadow-lg">
                        <img src="/uploads/logo nova.png" alt="CONFERE VEICULAR" className="h-16" />
                    </div>
                </div>
            </div>

            {/* Conteúdo */}
            <div className="container mx-auto px-4 max-w-5xl -mt-40 flex-grow">
                <Button variant="ghost" onClick={() => navigate("/")} className="mb-6 text-white hover:text-white/80 pl-0 hover:bg-transparent">
                    <ArrowLeft className="h-4 w-4 mr-2" />Voltar para busca
                </Button>

                {/* Header Card */}
                <div className="bg-white rounded-[2rem] shadow-2xl shadow-blue-900/5 border border-slate-100 p-8 md:p-12 mb-10 flex flex-col md:flex-row items-center justify-between gap-10 md:gap-16 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-50/50 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />

                    <div className="space-y-4 text-center md:text-left flex-1 relative z-10">
                        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight tracking-tight">
                            Resultado da sua <br />consulta!
                        </h1>
                        <div className="inline-flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
                            <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">
                                VEÍCULO CONSULTADO:
                            </span>
                            <span className="text-slate-800 font-bold text-sm">
                                {veiculo.MARCA}/{veiculo.MODELO.split(' ')[0]}
                            </span>
                        </div>
                    </div>

                    {/* Placa Mercosul */}
                    <div className="relative w-72 h-24 bg-white border-4 border-black rounded-lg shadow-xl shadow-black/10 overflow-hidden flex flex-col transform hover:scale-105 transition-transform duration-300 z-10">
                        <div className="bg-[#003399] h-7 w-full flex items-center justify-between px-2 relative border-b border-white/20">
                            <span className="text-[6px] text-white font-bold tracking-wider absolute top-1 left-1">MERCOSUL</span>
                            <div className="w-full text-center text-white font-bold text-xs tracking-widest">BRASIL</div>
                            <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/0/05/Flag_of_Brazil.svg" alt="Bandeira Brasil" className="w-5 h-3.5 object-cover rounded-[1px] border border-white/20" />
                            </div>
                        </div>
                        <div className="flex-1 flex items-center justify-center relative bg-white">
                            <span className="text-5xl font-black tracking-widest text-black whitespace-nowrap" style={{ fontFamily: 'MercosulPlate, sans-serif' }}>
                                {(() => {
                                    const clean = placa.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
                                    if (clean.length !== 7) return placa;

                                    return `${clean.slice(0, 3)}-${clean.slice(3)}`;
                                })()}
                            </span>
                            <span className="absolute bottom-1 left-2 font-bold text-[10px] text-black/80 leading-none">BR</span>
                        </div>
                    </div>
                </div>

                {/* Botões de Ação */}
                <div className="flex flex-wrap justify-center gap-4 mb-10">
                    <Button
                        variant="outline"
                        className="h-12 px-6 rounded-xl gap-2 text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 shadow-sm transition-all"
                        onClick={() => {
                            const fipeText = veiculo.fipe?.dados?.map(f =>
                                `- ${f.texto_modelo} (${f.combustivel}): ${f.texto_valor} (Ref: ${f.mes_referencia})`
                            ).join('\n') || 'Não disponível';

                            const text = `
RELATÓRIO DE CONSULTA VEICULAR
--------------------------------
PRINCIPAIS
Placa: ${veiculo.placa || placa}
Marca/Modelo: ${veiculo.MARCA}/${veiculo.MODELO}
Ano Fabricação: ${veiculo.extra.ano_fabricacao || veiculo.ano}
Ano Modelo: ${veiculo.extra.ano_modelo || veiculo.anoModelo}
Cor: ${veiculo.cor}
Combustível: ${veiculo.extra.combustivel}

IDENTIFICAÇÃO
Renavam: BLOQUEADO (Assine para liberar)
Chassi: BLOQUEADO (Assine para liberar)
Motor: BLOQUEADO (Assine para liberar)
Procedência: ${veiculo.extra.procedencia || veiculo.origem || "NACIONAL"}
Câmbio: BLOQUEADO (Assine para liberar)
Carroceria: BLOQUEADO (Assine para liberar)
Categoria: ${veiculo.extra.especie || "PARTICULAR"}

PROPRIETÁRIO
Nome: BLOQUEADO (Assine para liberar)
Documento: BLOQUEADO (Assine para liberar)
Tipo Doc: BLOQUEADO (Assine para liberar)
Tipo Doc. Faturado: ${veiculo.extra?.tipo_doc_faturado || '-'}
UF Faturado: ${veiculo.extra?.uf_faturado || '-'}

OUTROS
Roubo/Furto: BLOQUEADO (Assine para liberar)
Município: ${veiculo.municipio || '-'}
UF: ${veiculo.uf || '-'}
Segmento: ${veiculo.segmento || '-'}
Sub Segmento: ${veiculo.sub_segmento || '-'}

TABELA FIPE
${fipeText}
--------------------------------
Gerado por Confere Veicular
                            `.trim();

                            navigator.clipboard.writeText(text);
                            toast({
                                title: "Copiado!",
                                description: "Todas as informações foram copiadas para a área de transferência.",
                            });
                        }}
                    >
                        <Copy className="w-4 h-4" />
                        Copiar Relatório
                    </Button>
                    <Button
                        variant="outline"
                        className="h-12 px-6 rounded-xl gap-2 text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 shadow-sm transition-all"
                        onClick={() => window.print()}
                    >
                        <Printer className="w-4 h-4" />
                        Imprimir
                    </Button>
                    <Button
                        className="h-12 px-8 rounded-xl gap-2 bg-gradient-to-r from-[#00Cca7] to-[#00b896] hover:from-[#00b896] hover:to-[#00a385] text-white font-bold border-0 shadow-lg shadow-[#00Cca7]/25 hover:shadow-xl hover:shadow-[#00Cca7]/35 hover:-translate-y-0.5 transition-all text-base"
                        onClick={() => navigate(`/checkout?placa=${placa}`)}
                    >
                        <Crown className="w-5 h-5" />
                        Liberar Informações Completas
                    </Button>
                </div>

                {/* Grid Informações */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    <InfoCard title="Principais" icon={Car} iconColor="text-blue-600" iconBg="bg-blue-50">
                        <InfoRow label="Placa" value={veiculo.placa || placa} />
                        <InfoRow label="Marca/Modelo" value={`${veiculo.MARCA}/${veiculo.MODELO}`} />
                        <InfoRow label="Marca" value={veiculo.MARCA} />
                        <InfoRow label="Modelo" value={veiculo.MODELO} />
                        <InfoRow label="Ano Fabricação" value={veiculo.extra.ano_fabricacao || veiculo.ano} />
                        <InfoRow label="Ano Modelo" value={veiculo.extra.ano_modelo || veiculo.anoModelo} />
                        <InfoRow label="Cor" value={veiculo.cor} />
                        <InfoRow label="Combustível" value={veiculo.extra.combustivel} />
                    </InfoCard>

                    <InfoCard title="Identificação" icon={FileText} iconColor="text-indigo-600" iconBg="bg-indigo-50">
                        <LockedRow label="Renavam" />
                        <LockedRow label="Chassi" />
                        <LockedRow label="Motor" />
                        <InfoRow label="Procedência" value={veiculo.extra.procedencia || veiculo.origem || "NACIONAL"} />
                        <LockedRow label="Câmbio" />
                        <LockedRow label="Carroceria" />
                        <InfoRow label="Categoria" value={veiculo.extra.especie || "PARTICULAR"} />
                    </InfoCard>
                </div>

                {/* Grid Informações Adicionais */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    <InfoCard title="Proprietário" icon={User} iconColor="text-purple-600" iconBg="bg-purple-50">
                        <LockedRow label="Nome do Proprietário" />
                        <LockedRow label="Doc. Proprietário (Parcial)" />
                        <LockedRow label="Tipo Doc. Proprietário" />
                        <InfoRow label="Tipo Doc. Faturado" value={veiculo.extra?.tipo_doc_faturado || '-'} />
                        <InfoRow label="Estado (UF) Faturado" value={veiculo.extra?.uf_faturado || '-'} />
                    </InfoCard>

                    <InfoCard title="Outros" icon={Info} iconColor="text-teal-600" iconBg="bg-teal-50">
                        <LockedRow label="Situação Roubo/Furto" />
                        <InfoRow label="Município" value={veiculo.municipio || '-'} />
                        <InfoRow label="Estado (UF)" value={veiculo.uf || '-'} />
                        <InfoRow label="Segmento" value={veiculo.segmento || '-'} />
                        <InfoRow label="Sub Segmento" value={veiculo.sub_segmento || '-'} />
                    </InfoCard>
                </div>

                {/* Tabela FIPE */}
                {
                    veiculo.fipe && veiculo.fipe.dados && veiculo.fipe.dados.length > 0 && (
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8 mb-8">
                            <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-100">
                                <div className="w-12 h-12 rounded-full bg-[#00Cca7]/10 flex items-center justify-center">
                                    <DollarSign className="w-6 h-6 text-[#00Cca7]" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-800">Tabela FIPE</h2>
                                    <p className="text-sm text-gray-500">Aqui estão os valores do seu veículo</p>
                                </div>
                            </div>
                            <Accordion type="single" collapsible className="w-full">
                                {veiculo.fipe.dados.map((fipeData, index) => (
                                    <AccordionItem key={index} value={`item-${index}`} className="border-b-0 mb-2">
                                        <AccordionTrigger className="bg-gray-50 px-4 rounded-lg hover:no-underline hover:bg-gray-100">
                                            {fipeData.texto_modelo} - {fipeData.combustivel}
                                        </AccordionTrigger>
                                        <AccordionContent className="px-4 pt-4 pb-2">
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600">Mês de referência:</span>
                                                <span className="font-bold text-gray-800">{fipeData.mes_referencia}</span>
                                            </div>
                                            <div className="flex justify-between items-center mt-2">
                                                <span className="text-gray-600">Valor estimado:</span>
                                                <span className="font-bold text-[#00Cca7] text-lg">{fipeData.texto_valor}</span>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </div>
                    )
                }

                {/* Banner Promocional Premium */}
                <div className="relative rounded-2xl overflow-hidden shadow-xl bg-gradient-to-br from-primary via-primary/95 to-primary/90 mb-16">
                    <div className="absolute inset-0 opacity-5">
                        <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: `radial-gradient(circle at 20% 50%, white 1px, transparent 1px)`, backgroundSize: '40px 40px' }}></div>
                    </div>
                    <div className="absolute top-0 right-0 w-[40%] h-full hidden md:block">
                        <svg className="absolute top-0 right-0 h-full" viewBox="0 0 400 600" fill="none" preserveAspectRatio="none">
                            <path d="M0 0 Q 200 300 0 600 L 400 600 L 400 0 Z" fill="white" opacity="0.95" />
                        </svg>
                    </div>

                    <div className="container mx-auto px-6 md:px-12 relative z-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center py-8 md:py-10">
                            <div className="text-white space-y-5">
                                <div className="space-y-3">
                                    <h2 className="text-3xl md:text-4xl font-black leading-tight">
                                        Libere as informações<br /><span className="text-accent drop-shadow-lg">agora mesmo!</span>
                                    </h2>
                                    <p className="text-blue-100 text-base font-light max-w-md">
                                        Nome do proprietário, Renavam, Chassi e muito mais.
                                    </p>
                                </div>

                                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 max-w-sm">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-blue-200 text-xs line-through mb-1">De R$ 27,99</p>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-accent text-xl font-bold">R$</span>
                                                <span className="text-accent text-5xl font-black tracking-tighter">24,90</span>
                                            </div>
                                        </div>
                                        <div className="bg-accent/20 text-accent px-3 py-1.5 rounded-lg border border-accent/30">
                                            <div className="flex items-center gap-1 text-xs font-bold">
                                                <Timer className="w-3.5 h-3.5" /><span>Oferta limitada</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    className="bg-accent hover:bg-accent/90 text-primary font-bold text-lg h-12 px-8 rounded-xl w-full md:w-auto shadow-xl hover:shadow-accent/50 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 group"
                                    onClick={() => navigate(`/checkout?placa=${placa}`)}
                                >
                                    <Lock className="w-5 h-5 group-hover:scale-110 transition-transform" />Liberar por R$ 24,90
                                </Button>

                                <div className="flex items-center gap-3 text-xs text-blue-200/80">
                                    <div className="flex items-center gap-1">
                                        <ShieldCheck className="w-3.5 h-3.5" /><span>Seguro</span>
                                    </div>
                                    <span>•</span>
                                    <div className="flex items-center gap-1">
                                        <CheckCircle2 className="w-3.5 h-3.5" /><span>+1M clientes</span>
                                    </div>
                                </div>
                            </div>

                            <div className="hidden md:flex items-center justify-center relative">
                                <img
                                    src="/uploads/banner-homem-carro.png"
                                    alt="Consulta Veicular - Renavam, Chassi, Situação"
                                    className="w-full max-w-md h-auto object-contain"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <MinimalFooter />
            <CouponPopup />
        </div>
    );
}

const InfoCard = ({ title, icon: Icon, iconColor, iconBg, children }: any) => (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-50">
            <div className={`w-12 h-12 rounded-2xl ${iconBg} flex items-center justify-center shadow-sm`}>
                <Icon className={`w-6 h-6 ${iconColor}`} />
            </div>
            <div>
                <h2 className="text-xl font-bold text-gray-800">{title}</h2>
                <p className="text-sm text-gray-400">Dados verificados</p>
            </div>
        </div>
        <div className="space-y-1">{children}</div>
    </div>
);

const InfoRow = ({ label, value }: { label: string, value?: string }) => (
    <div className="flex items-center justify-between py-3 px-2 border-b border-gray-50 last:border-0 hover:bg-gray-50 rounded-lg transition-colors">
        <span className="font-medium text-gray-600 text-sm">{label}</span>
        <span className="text-gray-900 font-bold text-right text-sm md:text-base">{value || '-'}</span>
    </div>
);

const LockedRow = ({ label }: { label: string }) => (
    <div className="flex items-center justify-between py-3 px-2 border-b border-gray-50 last:border-0 hover:bg-red-50/30 rounded-lg transition-colors group cursor-pointer">
        <span className="font-medium text-gray-500 text-sm group-hover:text-red-400 transition-colors">{label}</span>
        <div className="relative flex items-center bg-gray-100 px-3 py-1.5 rounded-md border border-gray-200 group-hover:border-red-200 group-hover:bg-red-50 transition-all overflow-hidden">
            <span className="text-gray-400 font-bold text-sm blur-[4px] select-none group-hover:text-red-300 transition-colors">DADO SIGILOSO</span>
            <div className="absolute inset-0 flex items-center justify-center">
                <Lock className="w-3.5 h-3.5 text-gray-500 group-hover:text-red-500 transition-colors" />
            </div>
        </div>
    </div>
);
