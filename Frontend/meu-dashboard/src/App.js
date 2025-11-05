import React, { useState, useEffect } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import ChartDisplay from './components/ChartDisplay';
import axios from 'axios';

const MIN_DATE = '2025-06-01';
const MAX_DATE = '2025-11-30';
const API_URL = 'http://127.0.0.1:5000';

function App() {
    
    // --- ESTADO DE LOJA ---
    const [allStores, setAllStores] = useState([]);
    const [selectedStore, setSelectedStore] = useState('');
    const [isLoadingStores, setIsLoadingStores] = useState(true);

    // --- ESTADO DE CATEGORIA ---
    const [selectedCategory, setSelectedCategory] = useState('');
    
    // --- ESTADO DOS FILTROS (Sidebar) ---
    const [startDate, setStartDate] = useState(MIN_DATE);
    const [endDate, setEndDate] = useState(MAX_DATE);
    const [analysisMonth, setAnalysisMonth] = useState('2025-11'); // 'YYYY-MM'
    const [chartType, setChartType] = useState('bar');
    const [analysisMetric, setAnalysisMetric] = useState('revenue');
    const [searchTerm, setSearchTerm] = useState(""); 
    
    // --- ESTADO DAS OPÇÕES (Checkboxes) ---
    const [categoryOptions, setCategoryOptions] = useState([]); 
    const [selectedOptions, setSelectedOptions] = useState([]); 
    const [isLoadingFilters, setIsLoadingFilters] = useState(false);

    // --- ESTADO DOS DADOS (Gráfico) ---
    const [chartData, setChartData] = useState(null); // Inicia como nulo
    const [isLoadingData, setIsLoadingData] = useState(false);
    const [apiError, setApiError] = useState(null);

    
    // --- LÓGICA DE API ---

    // EFEITO 1: Busca as LOJAS (na abertura do site)
    useEffect(() => {
        const fetchStores = async () => {
            setIsLoadingStores(true);
            try {
                const response = await axios.get(`${API_URL}/api/filters/stores`);
                setAllStores(response.data);
            } catch (err) {
                setApiError('Erro ao buscar lista de lojas. O back-end está rodando?');
            } finally {
                setIsLoadingStores(false);
            }
        };
        fetchStores();
    }, []); // <-- Roda na montagem

    // EFEITO 2: Busca os FILTROS (checkboxes) quando a Loja ou Categoria mudam
    useEffect(() => {
        const fetchFilterOptions = async () => {
            
            // Limpa o gráfico anterior e erros
            setChartData(null); 
            setApiError(null);

            // Não busca filtros se for 'clientes' ou nada selecionado
            if (!selectedStore || !selectedCategory || selectedCategory === 'clientes') {
                setCategoryOptions([]);
                setSelectedOptions([]);
                return;
            }

            let endpoint = '';
            if (selectedCategory === 'regiao') {
                endpoint = '/api/filters/regions';
            } 
            // else if (selectedCategory === 'produtos') {
            //     endpoint = '/api/filters/products';
            // }

            if (!endpoint) return;

            setIsLoadingFilters(true);
            try {
                const response = await axios.get(`${API_URL}${endpoint}`, {
                    params: { storeId: selectedStore }
                });
                setCategoryOptions(response.data);
                // Pré-seleciona "Todos" por padrão
                setSelectedOptions(response.data.map(item => item.id)); 
            } catch (err) {
                setApiError('Erro ao buscar filtros da API.');
            } finally {
                setIsLoadingFilters(false);
            }
        };

        fetchFilterOptions();
    }, [selectedCategory, selectedStore]); // <-- Dispara na mudança de Categoria OU Loja

    
    // EFEITO 3: O botão "Analisar" chama esta função
    const handleAnalyzeClick = async () => {
        
        // Validação (ignora checkboxes para 'clientes')
        if (selectedCategory !== 'clientes' && selectedOptions.length === 0) {
            alert('Por favor, selecione pelo menos um item para analisar.');
            return;
        }

        setIsLoadingData(true);
        setApiError(null);
        setChartData(null); // Limpa os dados antigos

        let endpoint = '';
        let params = { // Prepara o objeto de parâmetros
            storeId: selectedStore,
        };

        // Lógica de Rota
        if (selectedCategory === 'regiao') {
            endpoint = '/api/analysis/region';
            params.startDate = startDate;
            params.endDate = endDate;
            params.selectedIds = selectedOptions.join(',');
        } 
        else if (selectedCategory === 'produtos') {
             endpoint = '/api/analysis/products'; // (Endpoint ainda não criado)
             params.startDate = startDate;
             params.endDate = endDate;
             params.metric = analysisMetric;
             params.chartType = chartType;
             params.selectedIds = selectedOptions.join(',');
        }
        else if (selectedCategory === 'clientes') {
            endpoint = '/api/analysis/range'; // Novo endpoint
            params.startMonth = '2025-07';
            params.endMonth = '2025-11';
        }

        try {
            const response = await axios.get(`${API_URL}${endpoint}`, { params });
            
            setChartData(response.data); // Salva o objeto { data, data_format }

        } catch (err) {
            setApiError('Erro ao buscar dados da API de Análise.');
            console.error(err);
        } finally {
            setIsLoadingData(false);
        }
    };

return (
        <div className="app-container">
            <Sidebar 
                // Lojas
                allStores={allStores}
                selectedStore={selectedStore}
                onStoreChange={setSelectedStore}
                isLoadingStores={isLoadingStores}

                // Categoria
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                
                // Datas (passa os dois tipos de data)
                startDate={startDate}
                onStartDateChange={setStartDate}
                endDate={endDate}
                onEndDateChange={setEndDate}
                analysisMonth={analysisMonth} 
                onMonthChange={setAnalysisMonth} 

                // Filtros (Checkboxes)
                isLoadingFilters={isLoadingFilters}
                categoryOptions={categoryOptions}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                selectedOptions={selectedOptions}
                onSelectedOptionsChange={setSelectedOptions}
                
                // Opções de Análise
                chartType={chartType}
                onChartTypeChange={setChartType}
                analysisMetric={analysisMetric}
                onAnalysisMetricChange={setAnalysisMetric}
                
                // Ação Principal
                onAnalyzeClick={handleAnalyzeClick}
                isLoadingData={isLoadingData}
            />
            
            {/* 1. Usa a classe '.main-content' que tem 'flex: 1' */}
            <div className="main-content">
            
                {/* 2. Usa a classe '.chart-container' que tem a altura fixa e a borda */}
                <div className="chart-container">
                    
                    {/* 3. O ChartDisplay vive aqui dentro */}
                    <ChartDisplay 
                        isLoading={isLoadingData || isLoadingStores}
                        apiError={apiError}
                        chartData={chartData} 
                        metric={analysisMetric}
                        chartType={chartType}
                        category={selectedCategory}
                    />
                    
                </div>
            </div>
        </div>
    ); // <-- Erro de sintaxe 1 corrigido
} // <-- Erro de sintaxe 2 corrigido

export default App;
