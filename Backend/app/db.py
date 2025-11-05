# /app/db.py
import os
from sqlalchemy import create_engine
from dotenv import load_dotenv

load_dotenv()

DB_USER = os.environ.get('DB_USER')
DB_PASS = os.environ.get('DB_PASS')
DB_HOST = os.environ.get('DB_HOST')
DB_PORT = os.environ.get('DB_PORT')
DB_NAME = os.environ.get('DB_NAME')

if not all([DB_USER, DB_PASS, DB_HOST, DB_PORT, DB_NAME]):
    print("ERRO: Variáveis de ambiente do banco de dados não encontradas.")

DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# O engine com a correção UTF-8 que descobrimos
engine = create_engine(DATABASE_URL, 
                            connect_args={'options': '-cclient_encoding=utf8'}
                       )

def get_db_engine():
    """Retorna a instância do engine de conexão."""
    return engine
