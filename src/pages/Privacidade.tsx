import MinimalFooter from "@/components/MinimalFooter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Privacidade() {
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
                    <h1 className="text-3xl font-bold mb-8">Política de Privacidade</h1>

                    <p className="text-sm text-gray-500 mb-8">Última atualização: {new Date().toLocaleDateString()}</p>

                    <h3>1. Coleta de Informações</h3>
                    <p>
                        Coletamos informações que você nos fornece diretamente, como ao realizar uma consulta (placa do veículo)
                        ou efetuar um pagamento (nome, e-mail, CPF).
                    </p>

                    <h3>2. Uso das Informações</h3>
                    <p>
                        Utilizamos as informações coletadas para:
                    </p>
                    <ul>
                        <li>Processar suas consultas e gerar relatórios.</li>
                        <li>Processar pagamentos e enviar comprovantes.</li>
                        <li>Melhorar nossos serviços e suporte ao cliente.</li>
                        <li>Cumprir obrigações legais e regulatórias.</li>
                    </ul>

                    <h3>3. Compartilhamento de Dados</h3>
                    <p>
                        Não vendemos seus dados pessoais. Compartilhamos informações apenas com processadores de pagamento (para efetuar a transação)
                        e conforme exigido por lei.
                    </p>

                    <h3>4. Segurança</h3>
                    <p>
                        Implementamos medidas de segurança técnicas e organizacionais para proteger seus dados, incluindo criptografia SSL
                        em todas as transações e armazenamento seguro.
                    </p>

                    <h3>5. Seus Direitos</h3>
                    <p>
                        Conforme a LGPD (Lei Geral de Proteção de Dados), você tem direito a acessar, corrigir ou solicitar a exclusão
                        de seus dados pessoais de nossa base, exceto quando a manutenção for necessária para cumprimento legal.
                    </p>

                    <h3>6. Cookies</h3>
                    <p>
                        Utilizamos cookies essenciais para o funcionamento do site e cookies de análise para entender como os usuários
                        interagem com nossa plataforma.
                    </p>

                    <h3>7. Contato</h3>
                    <p>
                        Para questões sobre privacidade, entre em contato conosco através do e-mail: confereveicular@gmail.com
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
