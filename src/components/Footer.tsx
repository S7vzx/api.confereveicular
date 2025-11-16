
import { Facebook, Instagram, Mail, Phone, MapPin, Clock } from "lucide-react";
import { ScrollReveal } from "@/hooks/useScrollReveal";
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Footer = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const scrollToSection = (sectionId: string) => {
    // Se não estivermos na página principal, navegar primeiro
    if (location.pathname !== '/') {
      navigate('/');
      // Aguardar a navegação e depois fazer scroll
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          const headerHeight = 80;
          const elementPosition = element.offsetTop - headerHeight;
          window.scrollTo({
            top: elementPosition,
            behavior: 'smooth'
          });
        }
      }, 100);
    } else {
      // Se já estivermos na página principal, fazer scroll diretamente
      const element = document.getElementById(sectionId);
      if (element) {
        const headerHeight = 80;
        const elementPosition = element.offsetTop - headerHeight;
        window.scrollTo({
          top: elementPosition,
          behavior: 'smooth'
        });
      }
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const navigateToHome = () => {
    if (location.pathname === '/') {
      scrollToTop();
    } else {
      navigate('/');
      // Scroll para o topo após navegação
      setTimeout(() => scrollToTop(), 100);
    }
  };

  const navigateToAboutUs = () => {
    if (location.pathname === '/sobre-nos') {
      scrollToTop();
    } else {
      navigate('/sobre-nos');
      // Scroll para o topo após navegação
      setTimeout(() => scrollToTop(), 100);
    }
  };

  const footerLinks = {
    navegacao: [
      { name: "Início", href: "/", type: "home" },
      { name: "Sobre Nós", href: "/sobre-nos", type: "about" },
      { name: "Consultas", href: "consultas", type: "scroll" },
      { name: "FAQ", href: "faq", type: "scroll" },
      { name: "Contato", href: "", type: "whatsapp" }
    ],
    servicos: [
      { 
        name: "Consulta por Placa", 
        whatsappMessage: "Olá! Gostaria de fazer uma consulta por placa do meu veículo. Pode me ajudar?"
      },
      { 
        name: "Consulta por Chassi", 
        whatsappMessage: "Olá! Preciso fazer uma consulta por chassi. Podem me auxiliar?"
      },
      { 
        name: "Consulta RENAVAM", 
        whatsappMessage: "Olá! Gostaria de fazer uma consulta RENAVAM do meu veículo. Como proceder?"
      },
      { 
        name: "Histórico Veicular", 
        whatsappMessage: "Olá! Preciso do histórico completo do meu veículo. Podem me ajudar?"
      },
      { 
        name: "Débitos e Multas", 
        whatsappMessage: "Olá! Gostaria de consultar débitos e multas do meu veículo. Como posso fazer?"
      }
    ],
  };

  const openWhatsApp = (message: string) => {
    const phoneNumber = "5511921021578";
    // Try multiple WhatsApp URL variations (same as VehicleConsultationSection)
    const urls = [
      `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`,
    ];
    
    // Try opening different URLs until one works
    const tryUrl = (index: number) => {
      if (index >= urls.length) {
        // Fallback: copy number to clipboard
        navigator.clipboard.writeText(phoneNumber).then(() => {
          console.log(`WhatsApp não pôde ser aberto. Número copiado: ${phoneNumber}`);
        }).catch(() => {
          console.log(`WhatsApp: ${phoneNumber}`);
        });
        return;
      }
      
      try {
        const newWindow = window.open(urls[index], '_blank');
        if (!newWindow || newWindow.closed || typeof newWindow.closed == 'undefined') {
          // If blocked, try next URL after a short delay
          setTimeout(() => tryUrl(index + 1), 100);
        }
      } catch (error) {
        // Try next URL if this one fails
        tryUrl(index + 1);
      }
    };
    
    tryUrl(0);
  };

  return (
    <footer className="bg-gradient-to-b from-info-section-bg to-background border-t border-border/50">
      <div className="container mx-auto px-4 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          
          {/* Coluna 1 - Informações da Empresa */}
          <ScrollReveal className="lg:col-span-2 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <img 
                  src="/uploads/logo nova.png" 
                  alt="ConfereVeicular"
                  className="h-12 w-auto"
                />
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-md">
                Plataforma líder em consultas veiculares no Brasil. Oferecemos informações 
                precisas e atualizadas sobre veículos emplacados, com dados confiáveis 
                diretamente dos órgãos oficiais.
              </p>
              
              {/* Indicadores de Confiança */}
              <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <span>+10k consultas realizadas</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <span>Dados atualizados em tempo real</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <span>Segurança SSL/HTTPS</span>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Coluna 2 - Navegação */}
          <ScrollReveal delay={100} className="space-y-4">
            <h3 className="font-semibold text-primary text-base">Navegação</h3>
            <ul className="space-y-2">
              {footerLinks.navegacao.map((link, index) => (
                <li key={index}>
                  {link.type === "home" ? (
                    <button
                      onClick={navigateToHome}
                      className="text-muted-foreground hover:text-primary transition-colors text-sm hover:underline text-left"
                    >
                      {link.name}
                    </button>
                  ) : link.type === "about" ? (
                    <button
                      onClick={navigateToAboutUs}
                      className="text-muted-foreground hover:text-primary transition-colors text-sm hover:underline text-left"
                    >
                      {link.name}
                    </button>
                  ) : link.type === "whatsapp" ? (
                    <button 
                      onClick={() => {
                        const message = "Olá! Gostaria de entrar em contato para mais informações sobre os serviços.";
                        const phoneNumber = "5511921021578";
                        
                        // Try multiple WhatsApp URL variations
                        const urls = [
                          `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`,
                        ];
                        
                        // Try opening different URLs until one works
                        const tryUrl = (index: number) => {
                          if (index >= urls.length) {
                            // Fallback: copy number to clipboard
                            navigator.clipboard.writeText(phoneNumber).then(() => {
                              console.log(`WhatsApp não pôde ser aberto. Número copiado: ${phoneNumber}`);
                            }).catch(() => {
                              console.log(`WhatsApp: ${phoneNumber}`);
                            });
                            return;
                          }
                          
                          try {
                            const newWindow = window.open(urls[index], '_blank');
                            if (!newWindow || newWindow.closed || typeof newWindow.closed == 'undefined') {
                              // If blocked, try next URL after a short delay
                              setTimeout(() => tryUrl(index + 1), 100);
                            }
                          } catch (error) {
                            // Try next URL if this one fails
                            tryUrl(index + 1);
                          }
                        };
                        
                        tryUrl(0);
                      }}
                      className="text-muted-foreground hover:text-primary transition-colors text-sm hover:underline text-left"
                    >
                      {link.name}
                    </button>
                  ) : (
                    <button
                      onClick={() => scrollToSection(link.href)}
                      className="text-muted-foreground hover:text-primary transition-colors text-sm hover:underline text-left"
                    >
                      {link.name}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </ScrollReveal>

          {/* Coluna 3 - Serviços */}
          <ScrollReveal delay={150} className="space-y-4">
            <h3 className="font-semibold text-accent text-base">Serviços</h3>
            <ul className="space-y-2">
              {footerLinks.servicos.map((service, index) => (
                <li key={index}>
                  <button 
                    onClick={() => openWhatsApp(service.whatsappMessage)}
                    className="text-muted-foreground hover:text-accent transition-colors text-sm hover:underline text-left"
                  >
                    {service.name}
                  </button>
                </li>
              ))}
            </ul>
          </ScrollReveal>

          {/* Coluna 4 - Contato e Redes Sociais */}
          <ScrollReveal delay={200} className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-primary text-base">Contato</h3>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-accent flex-shrink-0" />
                  <span>confereveicular@gmail.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-accent flex-shrink-0" />
                  <span>(11) 92102-1578</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                  <span>São Paulo, SP - Brasil</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-accent flex-shrink-0" />
                  <span>24h por dia, 7 dias por semana</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-accent text-base">Redes Sociais</h3>
              <div className="flex gap-3">
                <button 
                  onClick={() => window.open('https://facebook.com/conferveicular', '_blank')}
                  className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center hover:bg-accent/20 hover:scale-105 transition-all duration-200"
                  aria-label="Facebook"
                >
                  <Facebook className="h-5 w-5 text-accent" />
                </button>
                <button 
                  onClick={() => window.open('https://instagram.com/confereveicular', '_blank')}
                  className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center hover:bg-accent/20 hover:scale-105 transition-all duration-200"
                  aria-label="Instagram"
                >
                  <Instagram className="h-5 w-5 text-accent" />
                </button>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* Separador */}
        <div className="border-t border-border/50 mt-12 pt-8">
          

          {/* Copyright e Informações Corporativas */}
          <div className="text-center space-y-2">
            <p className="text-xs text-muted-foreground">
              © 2025 ConfereVeicular - Todos os direitos reservados
            </p>
            <p className="text-xs text-muted-foreground/80">
              Este site é protegido por SSL e utiliza as melhores práticas de segurança
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
