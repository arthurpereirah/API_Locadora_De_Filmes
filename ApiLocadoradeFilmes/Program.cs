//using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

//lista de filmes inicial do projeto
var filmes = new List<Filme>
{
    new Filme(1,"As branquelas", "Comedia", true),
    new Filme(2,"O poderoso chefão", "Drama", true),
    new Filme(3,"Ponyo","Animação", false),
};

//tela inicial da api ao rodar o projeto
app.MapGet("/", () => "Api de locadora de filmes está no ar!");

// listar todos os filmes cadastrados
app.MapGet("/api/locadoradefilmes", () =>
{
    return Results.Ok(filmes);
});

// listar um filme pelo id
app.MapGet("/api/locadoradefilmes/{id:int}", (int id) =>
{
    var filmeEncontrado = filmes.Find(filme => filme.Id == id);
    if (filmeEncontrado is null)
    {
        return Results.NotFound();
    }
    return Results.Ok(filmeEncontrado);
}
);

//Adicionar um novo filme
app.MapPost("/api/locadoradefilmes", (FilmeDto filmeDto) =>
{
    int novoId = filmes.Count +1;
    var novoFilme = new Filme(novoId, filmeDto.Titulo, filmeDto.Genero, true);
    filmes.Add(novoFilme);
    return Results.Created($"/api/locadoradefilmes/{novoFilme.Id}", novoFilme);
});

//Atualizar um filme
app.MapPut("/api/locadoradefilmes/{id:int}", (int id, FilmeAtualizadoDto filmeatualAtualizado) =>
{
    int indice = filmes.FindIndex(filmedaLista => filmedaLista.Id == id);
    if (indice == -1)
    {
        return Results.NotFound();
    }

    var filmeAtualizado = new Filme(id, filmeatualAtualizado.Titulo, filmeatualAtualizado.Genero, filmeatualAtualizado.Disponivel);
    filmes[indice] = filmeAtualizado;
    return Results.Ok(filmeAtualizado);
});

app.MapDelete("/api/locadoradefilmes/{id:int}", (int id) =>
{
    int indice = filmes.FindIndex(filmesdaLista => filmesdaLista.Id == id);
    if (indice == -1)
    {
        return Results.NotFound();
    }

    filmes.RemoveAt(indice);
    return Results.NoContent();
});



app.Run();

record Filme(int Id, string Titulo,string Genero, bool Disponivel);

record FilmeDto(string Titulo, string Genero);

record FilmeAtualizadoDto(string Titulo, string Genero, bool Disponivel);
