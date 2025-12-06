import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Play, Search } from "lucide-react";
import { ScrollReveal } from "@/hooks/useScrollReveal";

const VideoExplainerSection = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoId = "RfksnhGJwiA";

  return (
    <section id="video-explainer" className="py-12 md:py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Coluna Esquerda - Vídeo/Imagem */}
          <ScrollReveal className="relative">
            <div className="bg-white rounded-2xl shadow-2xl shadow-gray-200/50 overflow-hidden border border-white/20 group transform hover:scale-[1.01] transition-all duration-500">
              <div className="relative w-full aspect-video bg-gray-900">
                {!isPlaying ? (
                  <div
                    className="absolute inset-0 cursor-pointer"
                    onClick={() => setIsPlaying(true)}
                  >
                    <img
                      src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
                      alt="Thumbnail do vídeo"
                      className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-500"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-500" />

                    {/* Custom Play Button */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="relative w-20 h-20 flex items-center justify-center group/btn">
                        <span className="absolute inset-0 w-full h-full rounded-full bg-[#00Cca7] opacity-20 animate-ping" style={{ animationDuration: '5s' }}></span>
                        <Button
                          size="icon"
                          className="relative w-12 h-12 flex items-center justify-center rounded-full bg-[#00Cca7] hover:bg-[#00BFA0] text-white shadow-xl hover:scale-105 transition-all duration-300 border-2 border-white/20 z-10"
                        >
                          <Play fill="currentColor" className="w-6 h-6 ml-0.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                    title="Vídeo Explicativo ConfereVeicular"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                    onLoad={(e) => (e.target as HTMLIFrameElement).focus()}
                  ></iframe>
                )}
              </div>
            </div>
          </ScrollReveal>

          {/* Coluna Direita - Conteúdo */}
          <ScrollReveal delay={200} className="relative">
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10"></div>

            <div className="space-y-6 lg:pl-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00Cca7]/10 text-[#00Cca7] text-sm font-bold tracking-wide uppercase">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00Cca7] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00Cca7]"></span>
                </span>
                Plataforma Lider
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 leading-tight">
                Veja como é <span className="text-[#00Cca7]">Simples, Fácil e Rápido</span> consultar!
              </h2>

              <p className="text-gray-600 text-lg leading-relaxed">
                O <strong>ConfereVeicular</strong> é a solução definitiva para quem busca segurança na compra e venda. Nossa tecnologia cruza dados de fontes oficiais para entregar um relatório completo em segundos.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {[
                  "Base de Dados Oficial",
                  "Histórico de Roubo e Furto",
                  "+20 Indicadores de Análise",
                  "Leilões e Sinistros",
                  "Débitos e Multas",
                  "Suporte Especializado"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-[#00Cca7]/10 flex items-center justify-center text-[#00Cca7]">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-gray-700 font-medium text-sm">{item}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-white h-14 px-8 text-lg font-bold rounded-xl shadow-xl shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-1 transition-all duration-300 w-full sm:w-auto group relative overflow-hidden"
                  onClick={() => {
                    document.getElementById('consulta-principal')?.scrollIntoView({
                      behavior: 'smooth',
                      block: 'center'
                    });
                  }}
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                  <Search className="h-5 w-5 mr-3 relative z-10" />
                  <span className="relative z-10">COMECE SUA CONSULTA</span>
                </Button>
                <p className="mt-3 text-sm text-gray-400 font-medium">
                  * Consulta segura e anônima.
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};

export default VideoExplainerSection;
