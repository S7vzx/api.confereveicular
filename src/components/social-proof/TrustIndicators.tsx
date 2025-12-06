import { ScrollReveal } from "@/hooks/useScrollReveal";
import { SearchCheck, Star, Users, Headphones, Trophy } from "lucide-react";

const trustData = [
  {
    value: "10.000+",
    label: "Consultas Realizadas",
    icon: SearchCheck,
    color: "text-primary",
    bg: "bg-primary/10"
  },
  {
    value: "4.9",
    label: "Avaliação Média",
    icon: Star,
    color: "text-accent",
    bg: "bg-accent/10"
  },
  {
    value: "98%",
    label: "Clientes Satisfeitos",
    icon: Users,
    color: "text-secondary",
    bg: "bg-secondary/10"
  },
  {
    value: "24h",
    label: "Suporte Online",
    icon: Headphones,
    color: "text-primary",
    bg: "bg-primary/10"
  }
];

const TrustIndicators = () => {
  return (
    <ScrollReveal delay={400}>
      <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto px-4">
        {trustData.map((item, index) => (
          <div
            key={index}
            className="group relative p-6 bg-white rounded-2xl shadow-lg shadow-gray-100 border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
          >
            {/* Background Decor */}
            <div className={`absolute top-0 right-0 w-24 h-24 ${item.bg} rounded-bl-[4rem] -mr-8 -mt-8 opacity-50 group-hover:scale-110 transition-transform duration-500`}></div>

            <div className="relative z-10 flex flex-col items-center">
              <div className={`w-14 h-14 ${item.bg} rounded-2xl flex items-center justify-center mb-4 shadow-sm group-hover:rotate-6 transition-transform duration-300`}>
                <item.icon className={`w-7 h-7 ${item.color}`} strokeWidth={2.5} />
              </div>

              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-3xl font-black text-gray-800 tracking-tight">{item.value}</span>
                {item.icon === Star && <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />}
              </div>

              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide text-center">
                {item.label}
              </p>
            </div>
          </div>
        ))}
      </div>
    </ScrollReveal>
  );
};

export default TrustIndicators;