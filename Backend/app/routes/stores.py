from flask import Blueprint, jsonify
import pandas as pd
from app.db import get_db_engine # Importa nosso conector

stores_bp = Blueprint('stores', __name__)

# --- ENDPOINT 1: BUSCAR TODAS AS LOJAS (para o filtro principal) ---
@stores_bp.route('/filters/stores', methods=['GET'])
def get_store_filters():
    print("\n--- CHAMADO: /api/filters/stores ---")
    # Query otimizada: Apenas lojas ativas
    # (Baseado no seu schema, a tabela é 'stores' e a coluna 'name')
    sql_query = """
        SELECT id, name 
        FROM public.stores
        WHERE is_active = true
        ORDER BY name;
    """
    try:
        engine = get_db_engine()
        df = pd.read_sql(sql_query, engine)
        
        # Formata para o front-end (id e name já estão corretos)
        options = df.to_dict(orient='records')
        
        print(f"--- Retornando {len(options)} lojas ativas.")
        return jsonify(options)
        
    except Exception as e:
        print(f"ERRO em /filters/stores: {e}")
        return jsonify({"error": str(e)}), 500
