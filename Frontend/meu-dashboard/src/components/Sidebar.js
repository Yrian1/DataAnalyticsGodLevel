import React from 'react';

const MIN_DATE = '2025-06-01';
const MAX_DATE = '2025-11-30';


// --- COMPONENTE CHECKBOXLIST (Não muda) ---
const CheckboxList = ({ categoryOptions, searchTerm, selectedOptions, onSelectedOptionsChange, onSearchChange }) => {
    
    const filteredData = categoryOptions.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelectAll = (event) => {
        if (event.target.checked) {
            onSelectedOptionsChange(filteredData.map(item => item.id));
        } else {
            onSelectedOptionsChange([]);
        }
    };

    const handleToggle = (optionId) => {
        onSelectedOptionsChange(prev => 
            prev.includes(optionId)
                ? prev.filter(id => id !== optionId) 
                : [...prev, optionId]
        );
    };

    const areAllFilteredSelected = filteredData.length > 0 && 
                                   filteredData.every(item => selectedOptions.includes(item.id));

    return (
        <div className="filter-group">
            <label>Itens da Análise:</label>
            <div className="list-header" style={{
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '8px'
            }}>
                <div className="list-header-select-all" style={{ whiteSpace: 'nowrap', fontSize: '14px' }}>
                    <input type="checkbox" id="select-all"
                           checked={areAllFilteredSelected}
                           onChange={handleSelectAll} />
                    <label htmlFor="select-all" style={{ fontWeight: 'bold' }}>Todos</label>
                </div>
                <input type="text" placeholder="Pesquisar..."
                       value={searchTerm}
                       onChange={(e) => onSearchChange(e.target.value)}
                       className="list-header-search"
                       style={{ width: '65%', padding: '6px', border: '1px solid #ccc', borderRadius: '4px' }}
                />
            </div>
            <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #ccc', padding: '10px', borderRadius: '4px', background: '#fff' }}>
                {filteredData.length > 0 ? (
                    filteredData.map(option => (
                        <div key={option.id}>
                            <input type="checkbox" id={`cb-${option.id}`}
                                   checked={selectedOptions.includes(option.id)}
                                   onChange={() => handleToggle(option.id)} />
                            <label htmlFor={`cb-${option.id}`} style={{ fontWeight: 'normal' }}>
                                {option.name}
                            </label>
                        </div>
                    ))
                ) : ( <small>Nenhum item encontrado.</small> )}
            </div>
        </div>
    );
};


// --- Componente Sidebar Principal (COM LÓGICA CONDICIONAL) ---
function Sidebar({ 
    // Lojas
    allStores, selectedStore, onStoreChange, isLoadingStores,
    
    // Categoria
    selectedCategory, onCategoryChange,
    
    // Datas (Ambos os tipos)
    startDate, onStartDateChange,
    endDate, onEndDateChange,
    analysisMonth, onMonthChange,
    
    // Checkboxes
    isLoadingFilters, categoryOptions, searchTerm, onSearchChange, selectedOptions, onSelectedOptionsChange,
    
    // Análise
    chartType, onChartTypeChange,
    analysisMetric, onAnalysisMetricChange,
    
    // Ação
    onAnalyzeClick, isLoadingData
}) {
    const isStoreSelected = selectedStore !== '';

    // --- FUNÇÃO DE FILTRO DE DATA CONDICIONAL ---
    const renderDateFilters = () => {
        if (!selectedCategory) return null; 

        if (selectedCategory === 'clientes') {
            // 1. Não mostra NENHUM filtro de data
            return null;
        }
        
        // 2. Padrão (mostra Período para 'regiao', 'produtos', etc.)
        return (
            <>
                <div className="filter-group">
                    {/* ... (input de start-date) ... */}
                </div>
                <div className="filter-group">
                    {/* ... (input de end-date) ... */}
                </div>
            </>
        );
    };
    
    // --- FUNÇÃO DE OPÇÕES DE ANÁLISE CONDICIONAL ---
    const renderAnalysisOptions = () => {
        // 1. Oculta para 'clientes'
        if (!selectedCategory || selectedCategory === 'clientes') return null;
        
        // 2. Padrão (mostra Switch e Tipo de Gráfico)
        return (
            <>
                <div className="filter-group">
                    <label>Analisar por:</label>
                    <div className="switch-field">
                        <input type="radio" id="radio-revenue" name="switch-metric" value="revenue"
                               checked={analysisMetric === 'revenue'}
                               onChange={(e) => onAnalysisMetricChange(e.target.value)} />
                        <label htmlFor="radio-revenue">Faturamento (R$)</label>
                        <input type="radio" id="radio-volume" name="switch-metric" value="volume"
                               checked={analysisMetric === 'volume'}
                               onChange={(e) => onAnalysisMetricChange(e.target.value)} />
                        <label htmlFor="radio-volume">Volume (Pedidos)</label>
                    </div>
                </div>
                <div className="filter-group">
                    <label htmlFor="chart-type-select">Tipo de Gráfico:</label>
                    <select id="chart-type-select" value={chartType} onChange={(e) => onChartTypeChange(e.target.value)}>
                        <option value="bar">Gráfico de Barras</option>
                        <option value="pie">Gráfico de Pizza</option>
                        {/* Habilita a linha quando 'produtos' estiver pronto */}
                        {selectedCategory === 'produtos' && <option value="line">Gráfico de Linhas</option>}
                    </select>
                </div>
            </>
        );
    };

    return (
        <div className="sidebar">
            <h2 className="sidebar-title">Análise</h2>
            
            {/* Filtro de Loja */}
            <div className="filter-group">
                <label htmlFor="store-select">Loja:</label>
                {isLoadingStores ? <p>Carregando lojas...</p> : (
                    <select 
                        id="store-select" 
                        value={selectedStore} 
                        onChange={(e) => onStoreChange(e.target.value)}
                    >
                        <option value="">-- Selecione uma loja --</option>
                        {allStores.map(store => (
                            <option key={store.id} value={store.id}>
                                {store.name}
                            </option>
                        ))}
                    </select>
                )}
            </div>

            {/* Fieldset desabilita tudo se a loja não for selecionada */}
            <fieldset disabled={!isStoreSelected} style={{border: 'none', padding: 0, margin: 0}}>
                
                {/* Filtro de Categoria */}
                <div className="filter-group">
                    <label htmlFor="category-select">Categoria:</label>
                    <select id="category-select" value={selectedCategory} onChange={(e) => onCategoryChange(e.target.value)}>
                        <option value="">-- Selecione --</option>
                        <option value="regiao">Região</option>
                        <option value="produtos">Produtos</option>
                        <option value="adicionais">Adicionais</option>
                        <option value="clientes">Clientes</option>
                    </select>
                </div>

                {renderDateFilters()}     {/* <-- Renderiza o filtro de data CORRETO */}
                {renderAnalysisOptions()} {/* <-- OCULTA para 'clientes' */}

                {/* --- RENDERIZAÇÃO CONDICIONAL DO CHECKBOXLIST --- */}
                {isLoadingFilters && <p>Carregando filtros...</p>}
                {!isLoadingFilters && categoryOptions.length > 0 && selectedCategory !== 'clientes' && (
                    <CheckboxList 
                        categoryOptions={categoryOptions}
                        searchTerm={searchTerm}
                        selectedOptions={selectedOptions}
                        onSearchChange={onSearchChange}
                        onSelectedOptionsChange={onSelectedOptionsChange}
                    />
                )}
                
                {/* Botão "Analisar" */}
                {selectedCategory && (
                    <button 
                        className="analyze-button" 
                        onClick={onAnalyzeClick}
                        disabled={isLoadingData || isLoadingFilters}
                        style={{marginTop: '20px'}}
                    >
                        {isLoadingData ? 'Analisando...' : 'Analisar'}
                    </button>
                )}
            </fieldset>
            {!isStoreSelected && <p style={{color: '#777', fontStyle: 'italic', marginTop: '10px'}}>Selecione uma loja para continuar.</p>}
        </div>
    );
}

export default Sidebar;
