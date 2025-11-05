import React from 'react';
import SimpleChart from '../charts/SimpleChart';
import TimeSeriesChart from '../charts/TimeSeriesChart';

// Este é o "Especialista" em Produtos
const ProductAnalysis = ({ chartData, metric, chartType }) => {
    
    // O back-end nos diz qual formato de dados ele enviou
    const { data_format } = chartData;
    
    // Gráfico de Barras ou Pizza
    if (data_format === 'simple') {
        return (
            <SimpleChart 
                data={chartData.data} 
                metric={metric} 
                chartType={chartType} 
            />
        );
    }

    // Gráfico de Linha
    if (data_format === 'time_series') {
        return (
            <TimeSeriesChart 
                chartData={chartData} // Passa o objeto inteiro {data, keys}
                metric={metric} 
            />
        );
    }

    return <p style={{color: 'orange'}}>Formato de dados inesperado para 'Produtos'.</p>;
};

export default ProductAnalysis;
