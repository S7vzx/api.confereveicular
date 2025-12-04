import { useNavigate, useLocation } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-[#19406C] text-blue-100 py-16 border-t border-white/10">
      <div className="container mx-auto px-4 flex flex-col items-center text-center space-y-8">

        {/* Logo */}
        <div className="transform hover:scale-105 transition-transform duration-300">
          <img
            src="/uploads/logo nova.png"
            alt="Confere Veicular"
            className="h-12 w-auto opacity-90 hover:opacity-100 transition-opacity brightness-0 invert"
          />
        </div>

        {/* Link de Suporte */}
        <a
          href="https://wa.me/5511921021578"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-blue-100 hover:text-white transition-colors duration-200 border-b border-transparent hover:border-white/20 pb-0.5"
        >
          Suporte
        </a>

        {/* Copyright e Informações Legais */}
        <div className="space-y-3 max-w-2xl mx-auto">
          <p className="text-xs text-blue-200/80 font-medium">
            © 2025 Confere Veicular Consultoria LTDA - CNPJ: 63.799.632/0001-87
          </p>
          <p className="text-[10px] text-blue-200/60 uppercase tracking-wide">
            Serviço de emissão do CRLV Digital. Documento oficial válido em todo território nacional.
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;