# API Locadora de Filmes

API REST para gerenciamento de filmes, desenvolvida em ASP.NET Core com .NET 10. Esta entrega evolui o projeto da AP1: substitui o armazenamento em memória por persistência em SQLite com Entity Framework Core e integra a interface web aos endpoints reais da API.
Vídeo de demonstração — AP2
Link: https://drive.google.com/drive/folders/1vxytn2Q7k8N0WoCxImFOTvL0CKtzT8ki?usp=sharing


Tecnologias e requisitos
- .NET SDK 10.0 ou superior
- ASP.NET Core Minimal API
- Entity Framework Core 10 com provedor SQLite
- SQLite
- HTML, CSS e JavaScript no frontend, sem frameworks adicionais
- Bruno para testar os endpoints (Collection em ../Bruno/)
Estrutura do projeto
- Program.cs: configuração da aplicação e endpoints HTTP.
- FilmeEntity: modelo de dados do filme.
- ApiDbContext: contexto do Entity Framework Core e conjunto Filmes.
- Migrations/: migrations versionadas para criar/atualizar o banco.
- wwwroot/: interface web (index.html, style.css e app.js) integrada à API.
- appsettings.Development.json: string de conexão SQLite usada no ambiente de desenvolvimento.
- ../Bruno/: Collection para testar a API.
Preparar e executar
Abra um terminal na pasta ApiLocadoradeFilmes, onde está o arquivo ApiLocadoradeFilmes.csproj.
1. Restaurar dependências e compilar
dotnet restore
dotnet build
O comando dotnet build deve terminar sem erros.
2. Preparar o banco SQLite
A aplicação usa a connection string DefaultConnection, configurada em appsettings.Development.json, com o arquivo local api-LocadoraDeFilmes-aula09.db. O arquivo do banco não é versionado; ele será criado localmente quando as migrations forem aplicadas.

Se ainda não tiver a ferramenta dotnet-ef, instale-a:
dotnet tool install --global dotnet-ef
Se já estiver instalada, atualize-a quando necessário:
dotnet tool update --global dotnet-ef
Aplique as migrations versionadas:
dotnet ef database update
Execute esse comando na pasta que contém o .csproj. Não é necessário criar uma nova migration para preparar o banco existente no repositório: a migration inicial já está versionada em Migrations/.

3. Iniciar a aplicação
dotnet run
Use o endereço HTTP informado no terminal. Neste projeto, o perfil de desenvolvimento normalmente utiliza http://localhost:5080; se o terminal indicar outra porta, use a indicada por ele.
4. Abrir a interface
Acesse a raiz do endereço exibido no terminal, por exemplo:
http://localhost:5080/
A interface está em wwwroot/ e é servida pela própria aplicação ASP.NET Core, na mesma origem da API. Ela consulta e altera os filmes por meio dos endpoints reais, sem depender de uma lista fictícia no navegador.
Modelo de dados
Cada filme possui as seguintes propriedades JSON:
{
  "id": 1,
  "titulo": "Interestelar",
  "genero": "Ficção Científica",
  "disponivel": true
}
- id: identificador único gerado pelo banco.
- titulo: título do filme.
- genero: gênero do filme.
- disponivel: indica se o filme está disponível; novos registros usam true por padrão quando o campo não é informado.
Rotas da API
A rota base é /api/locadoradefilmes.
Método	Rota	Descrição	Resposta esperada
GET	/api/locadoradefilmes	Lista todos os filmes	200 OK
GET	/api/locadoradefilmes/{id}	Busca um filme por ID	200 OK ou 404 Not Found
POST	/api/locadoradefilmes	Cadastra um filme	201 Created
PUT	/api/locadoradefilmes/{id}	Atualiza um filme existente	200 OK ou 404 Not Found
DELETE	/api/locadoradefilmes/{id}	Exclui um filme	204 No Content ou 404 Not Found


Exemplos de requisições
Cadastrar — POST /api/locadoradefilmes

Cabeçalho: Content-Type: application/json
{
  "titulo": "Interestelar",
  "genero": "Ficção Científica",
  "disponivel": true
}
A API grava o registro usando Entity Framework Core e retorna 201 Created, incluindo o filme criado.

Consultar lista — GET /api/locadoradefilmes

Retorna a lista de filmes armazenados no SQLite. Se não houver registros, retorna uma lista vazia.

Consultar por ID — GET /api/locadoradefilmes/1

Retorna o filme solicitado (200 OK) ou 404 Not Found quando o ID não existe.

Atualizar — PUT /api/locadoradefilmes/1

Cabeçalho: Content-Type: application/json
{
  "titulo": "As Branquelas",
  "genero": "Comédia",
  "disponivel": false
}
Atualiza título, gênero e disponibilidade e persiste as alterações no banco. Retorna 200 OK com o filme atualizado ou 404 Not Found se o ID não existir.

Excluir — DELETE /api/locadoradefilmes/1

Exclui o registro e retorna 204 No Content. Se o ID não existir, retorna 404 Not Found.
Testar com Bruno
1. Inicie a API com dotnet run.
2. Abra/importa a Collection localizada em Bruno/API locadora de filmes.yml.
3. Configure o ambiente Local com baseUrl igual ao endereço exibido no terminal, por exemplo http://localhost:5080.
4. Execute e confira GET da coleção, GET por ID, POST, PUT e DELETE.
5. Depois de excluir um filme, faça um GET para o mesmo ID e confirme 404 Not Found.
Para o PUT e o DELETE, a URL deve incluir o ID do registro: /api/locadoradefilmes/{id}. Confira se as URLs salvas na Collection correspondem a esse formato.
Integração do frontend
A interface em wwwroot/ usa fetch para se comunicar com /api/locadoradefilmes e permite:
- listar os filmes persistidos;
- cadastrar um filme;
- carregar um filme por ID e editar seus dados;
- excluir um filme;
- visualizar estados de carregamento, lista vazia e falha de comunicação.
Após iniciar a API, realize as operações pelo navegador e confirme ao menos um resultado também no Bruno. Como a interface e a API são servidas pela mesma aplicação, não é necessário configurar uma URL de backend separada no frontend.
Persistência e reinicialização
As operações de criação, atualização e exclusão usam SaveChangesAsync() do Entity Framework Core. Os registros não excluídos permanecem no arquivo SQLite após encerrar e iniciar novamente a aplicação. Para comprovar isso na avaliação, cadastre um filme, reinicie a API e confirme que o filme continua aparecendo na interface e na resposta da API.

O banco SQLite local é criado na máquina durante a execução e não deve ser enviado ao repositório. As migrations versionadas permitem que o avaliador crie o banco a partir do código.
Checklist antes da entrega
- [ ] git status revisado; somente arquivos necessários estão sendo enviados.
- [ ] dotnet build conclui sem erros.
- [ ] dotnet ef database update prepara o banco usando as migrations versionadas.
- [ ] Bruno contém GET da coleção, GET por ID, POST, PUT e DELETE, com URLs corretas.
- [ ] Frontend testa cadastro, listagem, edição e exclusão com dados reais da API.
- [ ] Testado 404 Not Found para um ID inexistente, incluindo um ID excluído.
- [ ] Após reiniciar a API, pelo menos um registro não excluído continua disponível.
- [ ] Vídeo público mostra backend e frontend juntos, operações e persistência, e pode ser aberto sem solicitar acesso.
- [ ] Nenhum segredo, bin/, obj/ ou arquivo SQLite local foi incluído no commit.