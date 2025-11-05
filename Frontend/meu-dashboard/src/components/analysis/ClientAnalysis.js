import React from 'react';
// 1. Importa o gráfico "Dumb"
import TimeSeriesChart from '../charts/TimeSeriesChart';

// 2. Define as cores e configurações Específicas desta análise
const COLORS = {
    retained: '#0088FE', // Azul
    new: '#00C49F',      // Verde
    churned: '#FF8042'   // Laranja
};

// Configuração que será passada para o TimeSeriesChart
const clientLinesConfig = [
    { 
        dataKey: 'retidos', 
        name: 'Clientes Retidos', 
        color: COLORS.retained 
    },
    { 
        dataKey: 'novos', 
        name: 'Novos Clientes', 
        color: COLORS.new 
    },
    { 
        dataKey: 'perdidos', 
        name: 'Clientes Perdidos', 
        color: COLORS.churned 
    }
];

/**
 * Componente "Smart" de Análise de Clientes.
 * Recebe o 'chartData' do App.js, que (para esta categoria)
 * é o ARRAY vindo direto do /api/analysis/range
 */
const ClientAnalysis = ({ chartData }) => {
    
    // O chartData do App.js é o próprio array de dados
    const data = chartData; 

    if (!data || data.length === 0) {
        return <p className="placeholder-text">Nenhum dado de cliente encontrado.</p>;
    }

return (
        // 1. Este div agora preenche o '.chart-container'
        <div style={{ 
            width: '100%', 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column' // Empilha o título e o gráfico
        }}>
            <h2 style={{ 
                textAlign: 'center', 
                marginTop: 0, 
                marginBottom: '16px', 
                flexShrink: 0  // Impede que o título encolha
            }}>
                Evolução de Clientes (Série Temporal)
            </h2>
            
            {/* 2. Este div cresce (flexGrow) para preencher o espaço restante */}
            <div style={{ flexGrow: 1, width: '100%', position: 'relative' }}>
                {/* 3. O 'position: relative' é crucial para o ResponsiveContainer */}
                <TimeSeriesChart 
                    data={data} 
                    lines={clientLinesConfig}
                    xAxisKey="mes" 
                />
            </div>
        </div>
    );
};

export default ClientAnalysis;
