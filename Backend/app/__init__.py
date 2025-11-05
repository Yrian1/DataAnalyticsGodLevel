from flask import Flask
from flask_cors import CORS

def create_app():
    """
    Esta é a "fábrica" da aplicação.
    """
    
    # --- ESTA É A LINHA CRÍTICA ---
    # Ela DEVE estar aqui, dentro da função.
    app = Flask(__name__)
    # -------------------------------
    
    # Garante que o JSON não converta para ASCII (ex: \u00e7)
    app.config['JSON_AS_ASCII'] = False 
    # 2. Força a resposta a SEMPRE incluir o charset=utf-8
    app.config['JSONIFY_MIMETYPE'] = 'application/json; charset=utf-8'

    CORS(app) # Habilita o CORS para o 'app' que acabamos de criar

    # --- REGISTRO DOS BLUEPRINTS (Rotas) ---
    
    # Importa e registra a rota de Regiões
    from .routes.regions import regions_bp
    app.register_blueprint(regions_bp, url_prefix='/api')

    # Importa e registra a rota de Lojas
    from .routes.stores import stores_bp
    app.register_blueprint(stores_bp, url_prefix='/api')
    
    # Importa e registra a rota de clientes
    from .routes.customers import customers_bp
    app.register_blueprint(customers_bp, url_prefix='/api')


    return app
