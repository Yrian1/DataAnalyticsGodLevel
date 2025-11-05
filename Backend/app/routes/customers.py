# C:\Users\ideapad\Documents\Vault Alpha\Nola-god-level\Program\Backend\app\routes\customers.py

# --- Imports Essenciais ---
import logging
from flask import Blueprint, request, jsonify
from datetime import datetime
from dateutil.relativedelta import relativedelta 
import pandas as pd # <-- Importado, assim como em regions.py

# --- Importação Correta do Banco (seguindo o padrão regions.py) ---
from app.db import get_db_engine # <-- Este é o caminho correto

# --- Configuração do Logger ---
log = logging.getLogger(__name__)

# --- 1. Definição do Blueprint ---
customers_bp = Blueprint('customers_api', __name__)


# --- 2. Funções Helper ---

def get_customer_set(storeId, analysis_month_str):
    """
    Busca no banco (tabela 'sales') todos os IDs de clientes únicos
    para uma loja/mês, usando o padrão PANDAS + SQL ENGINE.
    """
    log.debug(f"Gerando set para Loja {storeId} no mês {analysis_month_str}")
    
    if not storeId or not analysis_month_str:
        log.warn("get_customer_set chamado com parâmetros nulos.")
        return set()
        
    try:
        # 1. Obter o engine do banco (padrão regions.py)
        engine = get_db_engine()
        
        # 2. Converter a string 'YYYY-MM' em data
        analysis_date = datetime.strptime(analysis_month_str, '%Y-%m')
        
        # 3. Criar a Query SQL (usando %s como placeholder, igual regions.py)
        # Usamos EXTRACT para compatibilidade com PostgreSQL (visto em regions.py)
        sql_query = """
            SELECT DISTINCT customer_id 
            FROM public.sales
            WHERE 
                store_id = %s
                AND customer_id IS NOT NULL
                AND EXTRACT(MONTH FROM created_at) = %s
                AND EXTRACT(YEAR FROM created_at) = %s
        """
        
        # 4. Definir os parâmetros
        params = (int(storeId), analysis_date.month, analysis_date.year)
        
        # 5. Executar a query com Pandas (padrão regions.py)
        df = pd.read_sql(sql_query, engine, params=params)
        
        # 6. Converter a coluna 'customer_id' do DataFrame em um set
        customer_ids = set(df['customer_id'])
        
        log.debug(f"Encontrados {len(customer_ids)} clientes únicos para {storeId}/{analysis_month_str}")
        return customer_ids
            
    except Exception as e:
        log.error(f"Falha crítica ao executar query em 'get_customer_set' para {storeId}/{analysis_month_str}: {e}", exc_info=True)
        return set()

def generate_month_range(start_date, end_date):
    """
    Gera uma lista de strings 'YYYY-MM' entre duas datas (inclusivas).
    (Esta função é puramente Python, não muda)
    """
    months = []
    current = start_date
    while current <= end_date:
        months.append(current.strftime('%Y-%m'))
        current += relativedelta(months=1)
    return months


# --- 3. A Rota da API (usando o Blueprint) ---

@customers_bp.route('/analysis/range', methods=['GET'])
def get_analysis_range():
    """
    Endpoint de análise de range (série temporal) de clientes 
    para popular gráficos no front-end.
    """
    log.info(f"Recebida requisição para {request.full_path}")
    
    try:
        # --- 3a. Validação de Parâmetros ---
        storeId = request.args.get('storeId')
        startMonth_str = request.args.get('startMonth')
        endMonth_str = request.args.get('endMonth')

        if not all([storeId, startMonth_str, endMonth_str]):
            log.warn("Requisição incompleta para /analysis/range. Faltam parâmetros.")
            return jsonify({"error": "Parâmetros storeId, startMonth e endMonth são obrigatórios."}), 400

        start_date = datetime.strptime(startMonth_str, '%Y-%m').date()
        end_date = datetime.strptime(endMonth_str, '%Y-%m').date()

        if end_date < start_date:
            return jsonify({"error": "A data final (endMonth) não pode ser anterior à data inicial (startMonth)."}), 400

        log.debug(f"Iniciando análise para Loja {storeId} de {startMonth_str} até {endMonth_str}")

        # --- 3b. Lógica de Análise "Rolling" (Esta lógica não muda) ---
        
        previous_month_date = start_date - relativedelta(months=1)
        previous_set = get_customer_set(storeId, previous_month_date.strftime('%Y-%m'))
        
        months_to_analyze = generate_month_range(start_date, end_date)
        results_list = []

        for month_str in months_to_analyze:
            
            # Gerar set do mês atual (Agora usa a função correta com Pandas)
            current_set = get_customer_set(storeId, month_str)
            
            # Comparar os sets
            novos = len(current_set - previous_set)
            perdidos = len(previous_set - current_set)
            retidos = len(current_set.intersection(previous_set))
            
            # Adicionar à lista
            analysis_data = {
                "mes": month_str,
                "novos": novos,
                "perdidos": perdidos,
                "retidos": retidos,
                "total_ativos": len(current_set)
            }
            results_list.append(analysis_data)
            
            # O "ROLLING": O atual vira o anterior para o próximo loop
            previous_set = current_set 

        # 4. Retornar a lista completa
        log.info(f"Análise de range concluída com sucesso para Loja {storeId}.")
        
        # O formato de retorno (data_format: "simple") não é necessário aqui,
        # pois a estrutura da lista é fixa, ao contrário do regions.py
        # que tinha uma métrica dinâmica.
        return jsonify(results_list), 200

    except Exception as e:
        # Captura de erro genérica para a rota
        log.error(f"ERRO CRÍTICO em /analysis/range: {e}", exc_info=True)
        return jsonify({"error": f"Erro interno no servidor: {e}"}), 500

# --- FIM DO ARQUIVO ---
