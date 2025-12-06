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
          <ScrollReveal delay={200} className="space-y-4 md:space-y-6 text-center lg:text-left">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary leading-tight">
              Veja como é simples, fácil e rápido consultar no ConfereVeicular!
            </h2>

            <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
              O ConfereVeicular é uma plataforma especializada em consultas veiculares rápidas e detalhadas.
              Oferecemos dados confiáveis, como modelo, cor, débitos e multas, com mais de 20
              informações sobre veículos. Ideal para quem busca segurança e agilidade na compra, venda ou
              análise de veículos.
            </p>

            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg font-bold rounded-xl shadow-lg hover:shadow-primary/30 hover:-translate-y-1 transition-all duration-300 w-full sm:w-auto"
              onClick={() => {
                document.getElementById('consulta-principal')?.scrollIntoView({
                  behavior: 'smooth',
                  block: 'center'
                });
              }}
            >
              <Search className="h-5 w-5 mr-2" />
              COMECE SUA CONSULTA AGORA
            </Button>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};

export default VideoExplainerSection;
