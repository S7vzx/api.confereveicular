import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Lock, Car, FileText, CheckCircle2, DollarSign, Timer, ShieldCheck } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function ResultadoConsulta() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const placa = searchParams.get("placa") || "";

    const dadosPublicos = {
        placa: placa,
        marca: "VOLKSWAGEN",
        modelo: "GOL 1.0 FLEX",
        ano: "2020/2021",
        cor: "PRATA",
        combustivel: "FLEX",
        procedencia: "NACIONAL"
    };

    useEffect(() => {
        if (!placa) navigate("/");
    }, [placa, navigate]);

    return (
        <div className="min-h-screen bg-[#f0f2f5] py-8 md:py-12">
            <div className="container mx-auto px-4 max-w-5xl">
                <Button variant="ghost" onClick={() => navigate("/")} className="mb-6 text-primary hover:text-primary/80 pl-0 hover:bg-transparent">
                    <ArrowLeft className="h-4 w-4 mr-2" />Voltar para busca
                </Button>

                {/* Header Card */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12 mb-8 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-16">
                    <div className="space-y-3 text-center md:text-left flex-1">
                        <h1 className="text-4xl md:text-5xl font-bold text-primary leading-tight">
                            Resultado da sua <br />consulta!
                        </h1>
                        <p className="text-primary font-medium text-sm md:text-base uppercase tracking-wide">
                            VOCÊ CONSULTOU UM: <span className="font-bold">{dadosPublicos.marca}/{dadosPublicos.modelo.split(' ')[0]}</span>
                        </p>
                    </div>

                    {/* Placa Mercosul */}
                    <div className="relative w-72 h-24 bg-white border-4 border-black rounded-lg shadow-lg overflow-hidden flex flex-col transform hover:scale-105 transition-transform duration-300">
                        <div className="bg-[#003399] h-7 w-full flex items-center justify-between px-2 relative border-b border-white/20">
                            <span className="text-[6px] text-white font-bold tracking-wider absolute top-1 left-1">MERCOSUL</span>
                            <div className="w-full text-center text-white font-bold text-xs tracking-widest">BRASIL</div>
                            <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/0/05/Flag_of_Brazil.svg" alt="Bandeira Brasil" className="w-5 h-3.5 object-cover rounded-[1px] border border-white/20" />
                            </div>
                        </div>
                        <div className="flex-1 flex items-center justify-center relative bg-white">
                            <span className="text-5xl font-black tracking-widest font-mono text-black">{placa.slice(0, 3)} {placa.slice(3)}</span>
                            <span className="absolute bottom-1 left-2 font-bold text-[10px] text-black/80 leading-none">BR</span>
                        </div>
                    </div>
                </div>

                {/* Grid Informações */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    <InfoCard title="Principais" icon={Car} iconColor="text-green-600" iconBg="bg-green-50">
                        <InfoRow label="Placa" value={dadosPublicos.placa} />
                        <InfoRow label="Marca/Modelo" value={`${dadosPublicos.marca}/${dadosPublicos.modelo.split(' ')[0]}`} />
                        <InfoRow label="Marca" value={dadosPublicos.marca} />
                        <InfoRow label="Modelo" value={dadosPublicos.modelo} />
                        <InfoRow label="Ano Fabricação" value={dadosPublicos.ano.split('/')[0]} />
                        <InfoRow label="Ano Modelo" value={dadosPublicos.ano.split('/')[1] || dadosPublicos.ano} />
                        <InfoRow label="Cor" value={dadosPublicos.cor} />
                        <InfoRow label="Combustível" value={dadosPublicos.combustivel} />
                    </InfoCard>

                    <InfoCard title="Identificação" icon={FileText} iconColor="text-blue-600" iconBg="bg-blue-50">
                        <InfoRow label="Renavam" isLocked />
                        <InfoRow label="Chassi" isLocked />
                        <InfoRow label="Motor" isLocked />
                        <InfoRow label="Procedência" value={dadosPublicos.procedencia} />
                        <InfoRow label="Câmbio" isLocked />
                        <InfoRow label="Carroceria" isLocked />
                        <InfoRow label="Categoria" value="PARTICULAR" />
                    </InfoCard>
                </div>

                {/* Tabela FIPE */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8 mb-8">
                    <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-100">
                        <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
                            <DollarSign className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">Tabela FIPE</h2>
                            <p className="text-sm text-gray-500">Aqui estão os valores do seu veículo</p>
                        </div>
                    </div>
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1" className="border-b-0 mb-2">
                            <AccordionTrigger className="bg-gray-50 px-4 rounded-lg hover:no-underline hover:bg-gray-100">
                                {dadosPublicos.modelo} - Gasolina
                            </AccordionTrigger>
                            <AccordionContent className="px-4 pt-4 pb-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Mês de referência:</span>
                                    <span className="font-bold text-gray-800">Dezembro/2025</span>
                                </div>
                                <div className="flex justify-between items-center mt-2">
                                    <span className="text-gray-600">Valor estimado:</span>
                                    <span className="font-bold text-green-600 text-lg">R$ 45.900,00</span>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2" className="border-b-0">
                            <AccordionTrigger className="bg-gray-50 px-4 rounded-lg hover:no-underline hover:bg-gray-100">
                                {dadosPublicos.modelo} - Álcool
                            </AccordionTrigger>
                            <AccordionContent className="px-4 pt-4 pb-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Mês de referência:</span>
                                    <span className="font-bold text-gray-800">Dezembro/2025</span>
                                </div>
                                <div className="flex justify-between items-center mt-2">
                                    <span className="text-gray-600">Valor estimado:</span>
                                    <span className="font-bold text-green-600 text-lg">R$ 44.500,00</span>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>

                {/* Banner Promocional Premium */}
                <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-primary via-primary/95 to-primary/90 min-h-[420px] flex items-center mb-8">
                    <div className="absolute inset-0 opacity-5">
                        <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: `radial-gradient(circle at 20% 50%, white 1px, transparent 1px)`, backgroundSize: '40px 40px' }}></div>
                    </div>
                    <div className="absolute top-0 right-0 w-[50%] h-full hidden md:block">
                        <svg className="absolute top-0 right-0 h-full" viewBox="0 0 400 600" fill="none" preserveAspectRatio="none">
                            <path d="M0 0 Q 200 300 0 600 L 400 600 L 400 0 Z" fill="white" opacity="0.95" />
                        </svg>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-transparent pointer-events-none"></div>

                    <div className="container mx-auto px-6 md:px-12 lg:px-16 relative z-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                            <div className="text-white space-y-6 py-12 md:py-16">
                                <div className="space-y-4">
                                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight">
                                        Libere as<br />informações<br /><span className="text-accent drop-shadow-lg">agora mesmo!</span>
                                    </h2>
                                    <p className="text-blue-100 text-lg md:text-xl font-light max-w-md">
                                        Nome do proprietário, Renavam, Chassi, Município, UF e muito mais.
                                    </p>
                                </div>

                                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 max-w-md">
                                    <div className="flex items-end gap-6">
                                        <div>
                                            <p className="text-blue-200 text-sm font-medium mb-1 line-through">De R$ 27,99</p>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-accent text-2xl font-bold">R$</span>
                                                <span className="text-accent text-7xl font-black tracking-tighter drop-shadow-xl">12,99</span>
                                            </div>
                                        </div>
                                        <div className="mb-2">
                                            <div className="bg-accent/20 text-accent px-4 py-2 rounded-lg border border-accent/30">
                                                <div className="flex items-center gap-2 text-xs font-bold">
                                                    <Timer className="w-4 h-4" /><span>Oferta limitada</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-4 text-sm">
                                    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                                        <ShieldCheck className="w-4 h-4 text-accent" /><span className="text-white/90 font-medium">Seguro e confiável</span>
                                    </div>
                                    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                                        <CheckCircle2 className="w-4 h-4 text-accent" /><span className="text-white/90 font-medium">+1 milhão de clientes</span>
                                    </div>
                                </div>

                                <Button
                                    className="bg-accent hover:bg-accent/90 text-primary font-bold text-xl h-16 px-10 rounded-xl w-full md:w-auto shadow-2xl hover:shadow-accent/50 transition-all transform hover:-translate-y-1 hover:scale-105 flex items-center justify-center gap-3 group"
                                    onClick={() => console.log("Checkout")}
                                >
                                    <Lock className="w-6 h-6 group-hover:scale-110 transition-transform" />Liberar por R$ 12,99
                                </Button>

                                <p className="text-blue-200/80 text-xs">Ambiente 100% seguro • Satisfação garantida</p>
                            </div>

                            <div className="hidden md:flex items-center justify-center relative h-full">
                                <div className="absolute w-[500px] h-[500px]">
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-primary/10 rounded-full blur-3xl"></div>
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-accent/5 rounded-full blur-2xl"></div>
                                </div>
                                <div className="relative z-10 bg-white/90 backdrop-blur-sm p-12 rounded-full shadow-2xl">
                                    <Car className="w-40 h-40 text-primary/20" strokeWidth={1} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <p className="text-xs text-center text-muted-foreground mt-8">
                    Este site utiliza dados e informações de fontes públicas. As informações apresentadas são meramente informativas.
                </p>
            </div>
        </div>
    );
}

const InfoCard = ({ title, icon: Icon, iconColor, iconBg, children }: any) => (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
        <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-100">
            <div className={`w-12 h-12 rounded-full ${iconBg} flex items-center justify-center`}>
                <Icon className={`w-6 h-6 ${iconColor}`} />
            </div>
            <div>
                <h2 className="text-xl font-bold text-gray-800">{title}</h2>
                <p className="text-sm text-gray-500">Aqui estão os {title.toLowerCase()} dados do veículo</p>
            </div>
        </div>
        <div className="space-y-4">{children}</div>
    </div>
);

const InfoRow = ({ label, value, isLocked = false }: { label: string, value?: string, isLocked?: boolean }) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors px-2 rounded-lg">
        <span className="font-semibold text-gray-700">{label}</span>
        {isLocked ? (
            <Badge variant="secondary" className="bg-slate-800 text-white hover:bg-slate-700 gap-1.5 py-1 px-3">
                <Lock className="w-3 h-3" /> Info. Bloqueada!
            </Badge>
        ) : (
            <span className="text-gray-600 font-medium text-right">{value || '-'}</span>
        )}
    </div>
);
