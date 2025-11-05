import React from 'react';
import { 
    LineChart, 
    Line, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    Legend, 
    ResponsiveContainer 
} from 'recharts';

/**
 * Componente "Dumb" para Gráficos de Linha.
 * Recebe:
 * - data: O array de dados (ex: [{mes: '2025-07', ...}])
 * - lines: Um array de configuração (ex: [{dataKey: 'novos', name: 'Novos', color: '#...'}])
 * - xAxisKey: A 'key' do Eixo X (padrão 'mes')
 */
const TimeSeriesChart = ({ data, lines, xAxisKey = 'mes' }) => {
    
    if (!data || data.length === 0 || !lines || lines.length === 0) {
        return <p className="placeholder-text">Dados insuficientes para o gráfico.</p>;
    }

    return (
        <ResponsiveContainer width="100%" height="100%">
            <LineChart
                data={data}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={xAxisKey} />
                <YAxis />
                <Tooltip />
                <Legend />
                
                {/* Itera sobre a configuração de linhas passada via props */}
                {lines.map((line) => (
                    <Line 
                        key={line.dataKey}
                        type="monotone" 
                        dataKey={line.dataKey} 
                        name={line.name} 
                        stroke={line.color} 
                        strokeWidth={2}
                        activeDot={{ r: 8 }} 
                    />
                ))}
            </LineChart>
        </ResponsiveContainer>
    );
};

export default TimeSeriesChart;
