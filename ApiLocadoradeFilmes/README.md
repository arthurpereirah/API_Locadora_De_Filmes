# API Locadora de Filmes

API REST minimalista para gerenciamento de filmes, desenvolvida com ASP.NET Core e .NET como trabalho de avaliação da cadeira de Desenvolvimento Backend.

## Requisitos

* .NET SDK 10.0 ou superior

## Como executar

Na raiz do projeto, execute:

```
dotnet run
```

A API estará disponível no endereço informado pelo terminal após a execução do projeto.

Para verificar se a API está funcionando:

```http
GET /
```

Resposta esperada:

```text
Api de locadora de filmes está no ar!
```

## Endpoints

| Método | Rota                         | Descrição                         |
| ------ | ---------------------------- | --------------------------------- |
| GET    | `/api/locadoradefilmes`      | Lista todos os filmes cadastrados |
| GET    | `/api/locadoradefilmes/{id}` | Busca um filme pelo ID            |
| POST   | `/api/locadoradefilmes`      | Cadastra um novo filme            |
| PUT    | `/api/locadoradefilmes/{id}` | Atualiza um filme existente       |
| DELETE | `/api/locadoradefilmes/{id}` | Remove um filme                   |

### Listar filmes

```http
GET /api/locadoradefilmes
```

Retorna todos os filmes cadastrados na locadora.

### Buscar filme por ID

```http
GET /api/locadoradefilmes/1
```

Retorna o filme correspondente ao ID informado.

Caso o ID não exista, a API retorna `404 Not Found`.

### Cadastrar filme

```http
POST /api/locadoradefilmes
Content-Type: application/json

{
  "titulo": "Interestelar",
  "genero": "Ficção Científica"
}
```

O filme é cadastrado como disponível por padrão e recebe um novo ID.

A operação retorna `201 Created`.

### Atualizar filme

```http
PUT /api/locadoradefilmes/1
Content-Type: application/json

{
  "titulo": "As Branquelas",
  "genero": "Comédia",
  "disponivel": false
}
```

Atualiza o título, gênero e disponibilidade do filme informado.

Caso o ID não exista, a API retorna `404 Not Found`.

### Remover filme

```http
DELETE /api/locadoradefilmes/1
```

Remove o filme correspondente ao ID informado.

Caso o filme seja removido com sucesso, a API retorna `204 No Content`.

## Estrutura dos dados

Cada filme possui as seguintes informações:

```json
{
  "id": 1,
  "titulo": "As branquelas",
  "genero": "Comedia",
  "disponivel": true
}
```

* `id`: identificador único do filme.
* `titulo`: título do filme.
* `genero`: gênero do filme.
* `disponivel`: indica se o filme está disponível.

## Observações

* A aplicação inicia com três filmes cadastrados: `As branquelas`, `O poderoso chefão` e `Ponyo`.
* Os dados são armazenados somente em memória, através de uma lista, e não são persistidos em um banco de dados.
* Ao reiniciar a aplicação, os dados adicionados, alterados ou removidos durante a execução são perdidos.
* Operações de busca, atualização ou remoção para um ID inexistente retornam `404 Not Found`. - O cadastro de um filme retorna `201 Created`.
* A remoção bem-sucedida retorna `204 No Content`.
* No cadastro, a disponibilidade do novo filme é definida inicialmente como `true`.
