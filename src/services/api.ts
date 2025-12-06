
export interface VehicleData {
    // Basic vehicle identifiers
    MARCA: string;
    MODELO: string;
    SUBMODELO: string;
    VERSAO: string;
    ano: string;
    anoModelo: string;
    cor: string;
    municipio: string;
    uf: string;
    situacao: string;
    // Plate information
    placa?: string;
    placa_modelo_antigo?: string;
    placa_modelo_novo?: string;
    // Additional descriptive fields
    logo?: string;
    marca?: string;
    marcaModelo?: string;
    mensagemRetorno?: string;
    origem?: string;
    segmento?: string;
    sub_segmento?: string;
    // Extra nested data
    extra: {
        combustivel?: string;
        chassi?: string;
        renavam?: string;
        motor?: string;
        procedencia?: string; // "NACIONAL" or "IMPORTADO"
        especie?: string;
        tipo_veiculo?: string;
        tipo_carroceria?: string;
        tipo_doc_faturado?: string;
        uf_faturado?: string;
        // Additional optional fields observed in API response
        ano_fabricacao?: string;
        ano_modelo?: string;
        caixa_cambio?: string;
    };
    // FIPE data if available
    fipe?: {
        dados: Array<{
            codigo_fipe: string;
            mes_referencia: string;
            texto_valor: string;
            combustivel: string;
            texto_modelo: string;
            ano_modelo: string;
        }>;
    };
}

// Token removed for security - now handled by server.js proxy
// const API_TOKEN = ""; 
// const BASE_URL = "/api/consultar"; 

export async function consultarPlaca(placa: string): Promise<VehicleData> {
    // Remove any non-alphanumeric characters for the API request
    const cleanPlate = placa.replace(/[^a-zA-Z0-9]/g, "");

    try {
        // Call local proxy instead of external API directly
        const response = await fetch(`/api/consultar/${cleanPlate}`);

        if (!response.ok) {
            throw new Error(`Erro na requisição: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.erro) {
            throw new Error(data.mensagem || "Erro ao consultar placa");
        }

        return data;
    } catch (error) {
        console.error("Erro ao consultar API:", error);
        throw error;
    }
}
