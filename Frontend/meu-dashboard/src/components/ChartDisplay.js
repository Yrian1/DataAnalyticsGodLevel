import React from 'react';

// 1. Importa todos os "Especialistas"
import ClientAnalysis from './analysis/ClientAnalysis';
import RegionAnalysis from './analysis/RegionAnalysis';
// import ProductAnalysis from './analysis/ProductAnalysis'; 

// ... (imports dos gráficos "Dumb" não são necessários aqui)

const ChartDisplay = ({ 
    isLoading, 
    apiError, 
    chartData, // O payload bruto da API
    category,  // A categoria selecionada
    metric,    // 'revenue' ou 'volume'
    chartType  // 'bar' ou 'pie'
}) => {
    
    // Lógica de loading e erro (sempre no topo)
    if (isLoading) {
        return <div className="loading-placeholder"><p>Analisando...</p></div>;
    }
    if (apiError) {
        return <div className="error-placeholder"><p>{apiError}</p></div>;
    }
    if (!chartData) {
        return <div className="loading-placeholder"><p>Selecione seus filtros e clique em "Analisar".</p></div>;
    }

    // --- O "Switchboard" ---
    // Ele decide qual "Especialista" chamar
    try {
        switch (category) {
            case 'clientes':
                // Para 'clientes', o chartData É o array de dados.
                return <ClientAnalysis chartData={chartData} />;

            case 'regiao':
                // Para 'regiao', o chartData é { data: [...], data_format: ... }
                // O Especialista de Região saberá o que fazer com isso
                return (
                    <RegionAnalysis 
                        chartData={chartData} // Passa só o array
                        metric={metric}
                        chartType={chartType}
                    />
                );

            // case 'produtos':
            //     return (
            //         <ProductAnalysis 
            //             chartData={chartData.data}
            //             metric={metric}
            //             chartType={chartType}
            //         />
            //     );

            default:
                return <p className="placeholder-text">Categoria de análise não reconhecida.</p>;
        }
    } catch (e) {
        console.error("Erro ao renderizar gráfico:", e);
        return <div className="error-placeholder"><p>Erro ao processar dados do gráfico.</p></div>;
    }
};

export default ChartDisplay;
