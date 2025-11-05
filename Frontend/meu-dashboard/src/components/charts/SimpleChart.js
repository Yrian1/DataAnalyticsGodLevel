import React from 'react';
import { 
    BarChart, Bar, PieChart, Pie, Cell, 
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

// --- Função de Label (não muda) ---
const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ 
    cx, cy, midAngle, outerRadius, 
    percent, value, maxValue, minValue 
}) => {
    
    const radius = outerRadius + 30;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    const percentage = `${(percent * 100).toFixed(0)}%`;
    let labelColor = '#333';
    let labelWeight = 'normal';
    if (value === maxValue) {
        labelColor = '#006400';
        labelWeight = 'bold';
    } else if (value === minValue) {
        labelColor = '#B22222';
        labelWeight = 'bold';
    }
    return (
        <text 
            x={x} y={y} fill={labelColor} 
            style={{ fontWeight: labelWeight, fontSize: '14px' }} 
            textAnchor={x > cx ? 'start' : 'end'} 
            dominantBaseline="central"
        >
            {percentage}
        </text>
    );
};
// --- Fim da Função de Label ---


const SimpleChart = ({ data, metric, chartType }) => {
    
    if (!data || data.length === 0) {
        return <p className="placeholder-text">Nenhum dado encontrado para esta seleção.</p>;
    }

    const dataKey = metric;
    
    if (chartType === 'pie') {
        
        // --- A CORREÇÃO ESTÁ AQUI (Ordenação no Front-End) ---
        // 1. Cria uma cópia segura dos dados e ordena do maior para o menor
        //    (Usamos [...data] para não modificar o 'prop' original)
        const sortedData = [...data].sort((a, b) => b[dataKey] - a[dataKey]);
        // --- FIM DA CORREÇÃO ---

        // 2. Calcula Max/Min usando os dados JÁ ORDENADOS
        //    (Agora o [0] é sempre o maior e o [último] é sempre o menor)
        const maxValue = sortedData[0][dataKey];
        const minValue = sortedData[sortedData.length - 1][dataKey];

        return (
            <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 40, right: 70, bottom: 40, left: 70 }}>
                    <Pie 
                        data={sortedData} // <-- 3. Usa os dados ordenados
                        dataKey={dataKey} 
                        nameKey="name" 
                        cx="50%" cy="50%" 
                        innerRadius={0} 
                        outerRadius={130}
                        fill="#8884d8" 
                        labelLine={true}
                        
                        label={(props) => renderCustomizedLabel({ 
                            ...props, 
                            maxValue: maxValue, 
                            minValue: minValue 
                        })}
                    >
                        {data.map((entry, index) => <Cell key={`cell-${index}`} fill={`hsl(${index * 60}, 70%, 60%)`} />)}
                    </Pie>
                    <Tooltip formatter={(value) => (metric === 'revenue' ? `R$ ${value.toFixed(2)}` : value)} />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        );
    }

    // O Gráfico de Barras (não precisa de ordenação)
    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}> {/* <-- Usa os dados originais, sem ordenação */}
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => (metric === 'revenue' ? `R$ ${value.toFixed(2)}` : value)} />
                <Legend />
                <Bar 
                    dataKey={dataKey} 
                    fill="#8884d8" 
                    name={metric === 'revenue' ? 'Faturamento' : 'Volume'} 
                />
            </BarChart>
        </ResponsiveContainer>
    );
};

export default SimpleChart;
