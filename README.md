# QLC Stream

Aplicativo local para catálogo pessoal de filmes, descoberta de opções de download e gerenciamento da biblioteca no computador. O projeto não inclui player ou streaming.

## Estrutura

- `backend`: API Java 21 com Spring Boot e arquitetura de monólito modular.
- `frontend`: aplicação Angular.
- `docs`: decisões e visão de arquitetura.
- `compose.yaml`: PostgreSQL, backend e frontend para desenvolvimento local.

## Primeira execução

1. Copie `.env.example` para `.env`.
2. Preencha `TMDB_API_TOKEN` quando iniciar a integração com o catálogo.
3. Execute `docker compose up --build`.
4. Acesse `http://localhost:4200`.

O PostgreSQL fica disponível apenas para os demais contêineres. O endpoint de saúde do backend pode ser consultado em `http://localhost:8080/actuator/health`.

## Desenvolvimento sem Docker

O backend requer Java 21. O frontend requer uma versão de Node suportada pelo Angular 22, preferencialmente Node 26.

```text
cd backend  && ./mvnw spring-boot:run
cd frontend && npm install && npm start
```

Para executar o backend fora do Docker, defina as variáveis de conexão descritas em `.env.example` e mantenha o PostgreSQL acessível.
