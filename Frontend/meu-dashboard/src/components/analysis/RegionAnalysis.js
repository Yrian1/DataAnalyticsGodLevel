import React from 'react';
import SimpleChart from '../charts/SimpleChart'; // Importa o gráfico reutilizável

// Este componente é o "Especialista" em Regiões
const RegionAnalysis = ({ chartData, metric, chartType }) => {
// (A lógica de verificação 'if' permanece a mesma)
    if (!chartData || !chartData.data || chartData.data_format !== 'simple') {
        return <p style={{color: 'orange'}}>Formato de dados inesperado para 'Região'.</p>;
    }

    return (
        // 1. Layout IDÊNTICO ao ClientAnalysis para consistência
        <div style={{ 
            width: '100%', 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column' 
        }}>
            <h2 style={{ 
                textAlign: 'center', 
                marginTop: 0, 
                marginBottom: '16px', 
                flexShrink: 0 
            }}>
                Análise por Região
            </h2>
            
            {/* 2. O div do gráfico cresce para preencher */}
            <div style={{ flexGrow: 1, width: '100%', position: 'relative' }}>
                <SimpleChart 
                    data={chartData.data} 
                    metric={metric} 
                    chartType={chartType} 
                />
            </div>
        </div>
    );
};

export default RegionAnalysis;
