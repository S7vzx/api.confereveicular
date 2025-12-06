import MinimalFooter from "@/components/MinimalFooter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Termos() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <div className="bg-white shadow-sm py-4">
                <div className="container mx-auto px-4">
                    <Button variant="ghost" onClick={() => navigate("/")} className="gap-2">
                        <ArrowLeft className="w-4 h-4" /> Voltar
                    </Button>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 max-w-4xl flex-grow">
                <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12 prose prose-slate max-w-none">
                    <h1 className="text-3xl font-bold mb-8">Termos de Uso</h1>

                    <p className="text-sm text-gray-500 mb-8">Última atualização: {new Date().toLocaleDateString()}</p>

                    <h3>1. Aceite dos Termos</h3>
                    <p>
                        Ao acessar e usar a plataforma Confere Veicular, você concorda em cumprir e ficar vinculado a estes Termos de Uso.
                        Se você não concordar com qualquer parte destes termos, você não deve usar nossos serviços.
                    </p>

                    <h3>2. Serviços Oferecidos</h3>
                    <p>
                        O Confere Veicular é uma plataforma de consulta de dados veiculares que agrega informações de fontes públicas e privadas.
                        Fornecemos relatórios detalhados sobre a situação de veículos automotores registrados no Brasil.
                    </p>

                    <h3>3. Uso dos Dados</h3>
                    <p>
                        As informações fornecidas são para uso exclusivamente pessoal e informativo. É proibida a revenda,
                        redistribuição ou uso automatizado (scraping) dos dados sem autorização expressa.
                    </p>

                    <h3>4. Responsabilidade</h3>
                    <p>
                        Embora nos esforcemos para manter os dados atualizados, não garantimos a precisão absoluta das informações,
                        pois dependemos de bases de dados de terceiros (Detran, Denatran, etc). O Confere Veicular não se responsabiliza
                        por decisões de compra ou venda baseadas exclusivamente nos relatórios.
                    </p>

                    <h3>5. Pagamentos e Reembolsos</h3>
                    <p>
                        Os relatórios são liberados mediante pagamento único. Em caso de falha técnica na geração do relatório ou dados indisponíveis
                        que foram prometidos como disponíveis, o usuário tem direito ao reembolso integral no prazo de 7 dias, conforme o Código de Defesa do Consumidor.
                    </p>

                    <h3>6. Privacidade</h3>
                    <p>
                        O tratamento de seus dados pessoais é regido por nossa Política de Privacidade. Ao usar o serviço,
                        você consente com a coleta e uso de informações conforme descrito na política.
                    </p>

                    <h3>7. Alterações</h3>
                    <p>
                        Reservamo-nos o direito de modificar estes termos a qualquer momento. Alterações entrarão em vigor imediatamente após a publicação no site.
                    </p>

                    <div className="mt-12 pt-8 border-t">
                        <p className="text-sm text-gray-500">
                            Confere Veicular Consultoria LTDA<br />
                            CNPJ: 63.799.632/0001-87
                        </p>
                    </div>
                </div>
            </div>

            <MinimalFooter />
        </div>
    );
}
