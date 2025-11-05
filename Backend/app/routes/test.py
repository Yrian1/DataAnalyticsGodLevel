import os
import psycopg2
from flask import Blueprint, jsonify
from dotenv import load_dotenv, find_dotenv

# Carrega as variáveis do .env (para pegar os dados de conexão)
load_dotenv(find_dotenv())
DB_USER = os.environ.get('DB_USER')
DB_PASS = os.environ.get('DB_PASS')
DB_HOST = os.environ.get('DB_HOST')
DB_PORT = os.environ.get('DB_PORT')
DB_NAME = os.environ.get('DB_NAME')

# Cria o Blueprint de Teste
test_bp = Blueprint('test', __name__)

# A query de teste SIMPLES (buscando dados corrompidos)
SIMPLE_TEST_QUERY = """
    SELECT 
        neighborhood 
    FROM 
        public.delivery_addresses
    WHERE 
        neighborhood ~ E'[\\x80-\\xFF]'  -- Filtra por bytes não-ASCII
    LIMIT 10;
"""

def run_test(encoding_option):
    conn = None
    print(f"\n--- TESTANDO COM ENCODING: {encoding_option} ---")
    try:
        # Tenta conectar passando o 'options'
        # Isso é um comando SQL que roda no momento da conexão
        conn = psycopg2.connect(
            host=DB_HOST,
            database=DB_NAME,
            user=DB_USER,
            password=DB_PASS,
            port=DB_PORT,
            options=f"-c client_encoding={encoding_option}"
        )
        
        cursor = conn.cursor()
        print(f"--- Conectado. Executando query simples... ---")
        cursor.execute(SIMPLE_TEST_QUERY)
        
        data = cursor.fetchall() # É aqui que o erro de decode acontece
        
        results = [row[0] for row in data]
        print(f"--- SUCESSO na leitura com {encoding_option} ---")
        cursor.close()
        return {"status": "Sucesso", "data": results}

    except Exception as e:
        print(f"--- FALHA no teste {encoding_option}: {e} ---")
        return {"status": "Falha", "error": str(e)}
    finally:
        if conn:
            conn.close()

@test_bp.route('/test-encoding-all', methods=['GET'])
def test_all_encodings():
    # Roda o teste para o padrão (UTF-8), latin1 e windows-1252
    results = {
        "teste_latin1": run_test('latin1'),
        "teste_windows1252": run_test('windows-1252'),
        "teste_default_utf8": run_test('utf8')
    }
    
    return jsonify(results)
