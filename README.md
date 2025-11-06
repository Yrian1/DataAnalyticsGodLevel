# Dashboard de Análise de Vendas (Food Service)

Este projeto é um dashboard de Business Intelligence (BI) focado em transformar dados brutos de vendas de negócios de *food service* em *insights* acionáveis.

A ferramenta permite que gestores de loja visualizem de forma clara:

1.  **Análise de Região:** Performance de vendas (Faturamento vs. Volume) por bairro, permitindo identificar as regiões mais lucrativas ou com maior potencial.
2.  **Análise de Clientes:** A evolução da base de clientes ao longo do tempo, analisando métricas de Retenção, Aquisição (Novos) e Perda (*Churn*).

## Arquitetura

O projeto utiliza uma arquitetura **RESTful**, com uma separação clara entre o cliente (Frontend) e o servidor (Backend).

* **Backend (Motor de Análise):**
    * **Framework:** Flask (Python)
    * **Análise:** Pandas (para agregações e manipulação de dados)
    * **Banco de Dados:** SQLAlchemy (Engine) + Psycopg2 (Driver)
    * **Dependências:** `flask-cors`, `python-dateutil`

* **Frontend (Dashboard):**
    * **Framework:** React (com Hooks `useState`/`useEffect`)
    * **Chamadas API:** Axios
    * **Gráficos:** Recharts

## Como Executar o Projeto

Para executar, você precisará de dois terminais: um para o Backend e um para o Frontend.

### Pré-requisitos

* Python 3.7+ (com `pip` e `venv`)
* Node.js 14+ (com `npm`)
* Um servidor PostgreSQL a correr (ex: na `localhost:5432`)

### 1. Backend (Servidor Flask)

O backend é responsável por se conectar ao banco, executar as análises e servir a API REST.

**Passo 1: Criar o ficheiro `requirements.txt`**

Crie um ficheiro `requirements.txt` na pasta raiz do **backend** com o seguinte conteúdo:

```
flask
flask-cors
pandas sqlalchemy
psycopg2-binary
python-dateutil
dotenv
```

**Passo 2: Configurar o Ambiente**

Na pasta raiz do **backend**, crie um ficheiro `.env` para configurar a sua conexão com o banco de dados. O `app/db.py` (onde está o `get_db_engine`) deve ser configurado para ler estas variáveis.

```
Exemplo de .env (substitua pelos seus dados)

DB_USER=challenge
DB_PASS=challenge
DB_HOST=localhost
DB_PORT=5432
DB_NAME=challenge_db

FLASK_APP=run.py
FLASK_ENV=development
```
**Passo 3: Configurar o Banco de Dados**

1.  Acesse o seu PostgreSQL.
3.  Crie o banco de dados (de preferência: nome=`challenge`, senha=`challenge`).
4.  Execute `database-schema.sql` na query tool do seu banco alvo para criar todas as tabelas.(garante que ele contenha as tabelas esperadas).
5.  Execute generate_data.py. O arquivo usa `challenge` para nome e senha padrão para o banco que irá popular (e.g. linha 670 `postgresql://challenge:challenge@localhost:5432/challenge_db`) através dessa linha você deve ser capaz de mudar o banco que ele direciona os dados.

> Detalhe (se você é da nola) eu fiz uma pequena alteração em generate_data.py para forçar encoding utf-8(i.e. linha 76).

**Passo 4: Instalar e Executar (no terminal 1)**

```bash
# 1. Navegue até a pasta do backend
cd /caminho/para/o/projeto/backend

# 2. Crie um ambiente virtual
python -m venv venv

# 3. Ative o ambiente
# Windows
.\venv\Scripts\activate
# Mac/Linux
source venv/bin/activate

# 4. Instale as dependências
pip install -r requirements.txt

# 5. Execute o servidor Flask
# (Ele carregará as variáveis do ficheiro .env)
flask run
```
O backend estará a correr em: [http://127.0.0.1:5000](http://127.0.0.1:5000)
Url para testes
```
// retorna os bairros aos quais aquela loja vende/tem cadastrados
http://127.0.0.1:5000/api/filters/regions?storeId=26
retorna lista com {mes:[clientes_retidos, clientes_perdidos, clientes_novos]} analisando cada mês com o mês anterior para chegar aos valores
http://127.0.0.1:5000/api/analysis/range?storeId=44&startMonth=2025-07&endMonth=2025-11
// retorna lista com valores de faturamento e volume de vendas totais para o periodo especificiado e filtrando de acordo com selectedIds
http://127.0.0.1:5000/api/analysis/region?storeId=44&startDate=2025-06-01&endDate=2025-11-30&selectedIds=vila-sesc,california,cenaculo
```
# 2. Frontend (Dashboard React)
O frontend é o painel de controlo que o utilizador vê.
**Passo 1: Instalar e Executar (no terminal 2)**

```bash
# 1. Navegue até a pasta do frontend
cd /caminho/para/o/projeto/Frontend/meu_dashboard

# 2. Instale as dependências (react, axios, recharts)
npm install

# 3. Execute o servidor de desenvolvimento
npm start
```

3. **Acesso**
O **Backend** estará a servir a API em `http://127.0.0.1:5000`.

O **Frontend** abrirá automaticamente no seu navegador em `http://localhost:3000`.

A aplicação está pronta a usar.
