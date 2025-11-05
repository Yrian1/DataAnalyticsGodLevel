from flask import Blueprint, jsonify, request
import pandas as pd
from app.db import get_db_engine

regions_bp = Blueprint('regions', __name__)

# --- FUNÇÃO HELPER (Não muda) ---
def _get_region_map(store_id):
    # ... (código da sua versão enviada, que está correto)
    print(f"[HELPER] Buscando mapa de regiões para loja: {store_id}")
    sql_query = """
        SELECT DISTINCT da.neighborhood 
        FROM public.sales s
        JOIN public.delivery_addresses da ON s.id = da.sale_id
        JOIN public.stores st ON s.store_id = st.id
        WHERE 
            s.store_id = %s
            AND da.neighborhood IS NOT NULL AND da.neighborhood != ''
            AND LOWER(TRIM(da.city)) = LOWER(TRIM(st.city)); 
    """
    try:
        engine = get_db_engine()
        df = pd.read_sql(sql_query, engine, params=(int(store_id),))
        id_to_name_map = {
            bairro.lower().replace(' ', '-'): bairro 
            for bairro in df['neighborhood']
        }
        print(f"[HELPER] Encontrados {len(id_to_name_map)} bairros para esta loja/cidade.")
        return id_to_name_map
    except Exception as e:
        print(f"ERRO no helper _get_region_map: {e}")
        return None

# --- ENDPOINT 1: FILTROS (Não muda) ---
@regions_bp.route('/filters/regions', methods=['GET'])
def get_region_filters():
    # ... (código da sua versão enviada, que está correto)
    store_id = request.args.get('storeId')
    if not store_id:
        return jsonify({"error": "storeId é obrigatório"}), 400
    id_to_name_map = _get_region_map(store_id)
    if id_to_name_map is None:
        return jsonify({"error": "Falha ao buscar filtros de região"}), 500
    options = [{'id': id, 'name': name} for id, name in id_to_name_map.items()]
    return jsonify(options)

# --- ENDPOINT 2: ANÁLISE (ATUALIZADO) ---
@regions_bp.route('/analysis/region', methods=['GET'])
def get_region_analysis():
    print("\n--- CHAMADO: /api/analysis/region ---")
    try:
        store_id = request.args.get('storeId')
        start_date = request.args.get('startDate')
        end_date = request.args.get('endDate')
        # metric = request.args.get('metric', 'revenue') # <-- REMOVIDO
        selected_ids_str = request.args.get('selectedIds', default="")
        selected_ids = selected_ids_str.split(',') if selected_ids_str else []

        if not store_id or not selected_ids:
            return jsonify({"data": [], "data_format": "simple"})

        id_to_name_map = _get_region_map(store_id)
        if id_to_name_map is None:
             return jsonify({"error": "Falha ao buscar mapa de nomes"}), 500
        
        selected_names = [id_to_name_map[id] for id in selected_ids if id in id_to_name_map]

        if not selected_names:
            return jsonify({"data": [], "data_format": "simple"})

        neighborhood_placeholders = ', '.join(['%s'] * len(selected_names))
        
        # --- MUDANÇA NA QUERY SQL ---
        # Agora calculamos AS DUAS métricas de uma vez
        metric_sql = """
            SUM(s.total_amount) AS revenue, 
            COUNT(DISTINCT s.id) AS volume
        """
        # --- FIM DA MUDANÇA ---

        sql_query = f"""
            SELECT 
                da.neighborhood AS name, {metric_sql}
            FROM 
                public.sales s
            JOIN 
                public.delivery_addresses da ON s.id = da.sale_id
            WHERE 
                s.store_id = %s
                AND s.created_at BETWEEN %s AND %s
                AND da.neighborhood IN ({neighborhood_placeholders})
            GROUP BY
                da.neighborhood;
        """
        
        params = (int(store_id), start_date, end_date) + tuple(selected_names)
        engine = get_db_engine()
        df = pd.read_sql(sql_query, engine, params=params)
        
        # Converte os tipos de dados para JSON
        df['revenue'] = df['revenue'].astype(float)
        df['volume'] = df['volume'].astype(float)
        
        return jsonify({"data": df.to_dict(orient='records'), "data_format": "simple"})
        
    except Exception as e:
        print(f"ERRO CRÍTICO em /analysis/region: {e}")
        return jsonify({"error": str(e)}), 500
