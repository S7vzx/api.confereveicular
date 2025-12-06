import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Search, Car, ScanBarcode, FileText, ShieldAlert, User, History } from "lucide-react";
import { ScrollReveal } from "@/hooks/useScrollReveal";

const VehicleInfoSection = () => {
  const infoCards = [
    {
      icon: Car,
      title: "Informações do Veículo",
      description: "Acesse dados como cor, modelo, categoria e muito mais!"
    },
    {
      icon: ScanBarcode,
      title: "Descubra o Chassi",
      description: "Consulte o número do chassi do veículo com rapidez e segurança!"
    },
    {
      icon: FileText,
      title: "Descubra o Renavam",
      description: "Consulte o número do renavam de forma rápida e segura."
    },
    {
      icon: ShieldAlert,
      title: "Situação de roubo ou furto",
      description: "Verifique se o veículo possui registro de roubo ou furto."
    },
    {
      icon: User,
      title: "Nome do proprietário",
      description: "Descubra a quem o veículo está registrado (PF ou PJ)."
    },
    {
      icon: History,
      title: "Histórico do veículo",
      description: "Descubra o histórico completo do veículo e tenha mais segurança."
    }
  ];

  return (
    <section className="py-16 md:py-24 bg-info-section-bg relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left side - Content */}
          <div className="lg:col-span-5">
            <ScrollReveal className="space-y-6 md:space-y-8 text-center lg:text-left">
              <div className="space-y-4">
                <span className="inline-block px-4 py-1.5 rounded-full bg-white/50 text-primary text-sm font-semibold tracking-wide uppercase border border-primary/10">
                  Por que nos escolher?
                </span>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-primary leading-[1.15] tracking-tight">
                  Seu portal completo para consultas veiculares <span className="text-accent">rápidas</span>.
                </h2>
              </div>

              <p className="text-muted-foreground text-lg leading-relaxed max-w-xl mx-auto lg:mx-0">
                Somos o maior site de consultas veiculares do Brasil.
                Descubra mais de 20 informações essenciais sobre veículos, como chassi, Renavam, cor, modelo, roubo e furto.
                Tudo com rapidez e confiança.
              </p>

              <div className="pt-2">
                <Button
                  variant="cta"
                  size="lg"
                  className="h-14 px-8 text-lg font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all w-full sm:w-auto group"
                  onClick={() => {
                    document.getElementById('consulta-principal')?.scrollIntoView({
                      behavior: 'smooth',
                      block: 'center'
                    });
                  }}
                >
                  <Search className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                  CONSULTAR AGORA
                </Button>

                <p className="mt-4 text-sm text-muted-foreground flex items-center justify-center lg:justify-start gap-2">
                  <ShieldAlert className="w-4 h-4 text-accent" />
                  Dados criptografados e seguros
                </p>
              </div>
            </ScrollReveal>
          </div>

          {/* Right side - Info Cards Grid */}
          <div className="lg:col-span-7">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {infoCards.map((card, index) => (
                <ScrollReveal key={index} delay={200 + index * 50} className="h-full">
                  <div className="h-full bg-white p-6 rounded-2xl border border-border/50 shadow-soft hover:shadow-medium hover:-translate-y-1 transition-all duration-300 group flex items-start gap-4">
                    <div className="shrink-0 w-12 h-12 rounded-xl bg-blue-50 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                      <card.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-primary mb-2 text-base leading-tight">
                        {card.title}
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed text-balance">
                        {card.description}
                      </p>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VehicleInfoSection;
