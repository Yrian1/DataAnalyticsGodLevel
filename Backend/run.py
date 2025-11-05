# /run.py
from app import create_app

# Cria a instância da nossa aplicação a partir da "fábrica" em app/__init__.py
app = create_app()

if __name__ == '__main__':
    # Roda o servidor (porta 5000)
    app.run(debug=True, port=5000)
