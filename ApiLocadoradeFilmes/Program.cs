using System.Text.Json;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<ApiDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

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
app.MapGet("/api/locadoradefilmes", async (ApiDbContext db) =>
{
    var filmes = await db.Filmes.ToListAsync();
    return Results.Ok(filmes);
});

// listar um filme pelo id
app.MapGet("/api/locadoradefilmes/{id:int}", async (int id, ApiDbContext db) =>
{
    var filmeEncontrado = db.Filmes.Find(id);   
    if (filmeEncontrado is null)
    {
        return Results.NotFound();
    }
    return Results.Ok(filmeEncontrado);
}
);

//Adicionar um novo filme
app.MapPost("/api/locadoradefilmes", async (FilmeEntity filmeDto, ApiDbContext db) =>
{
    
    //var novoFilme = new Filme(novoId, filmeDto.Titulo, filmeDto.Genero, true);

    //salvando em memoria e preparando para salvar em banco de dados
    db.Filmes.Add(filmeDto);
    //salvando no banco de dados
    await db.SaveChangesAsync();
    return Results.Created($"/api/locadoradefilmes/{filmeDto.Id}", filmeDto);
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

class FilmeEntity
{
    public int Id { get; set; }
    public string Titulo { get; set; } = string.Empty;
    public string Genero { get; set; } = string.Empty;
    public bool Disponivel { get; set; } = true;
}

class ApiDbContext : DbContext
{
    public ApiDbContext(DbContextOptions<ApiDbContext> options) : base(options)
    {
    }

    public DbSet<FilmeEntity> Filmes => Set<FilmeEntity>();
}

record Filme(int Id, string Titulo,string Genero, bool Disponivel);

record FilmeDto(string Titulo, string Genero);

record FilmeAtualizadoDto(string Titulo, string Genero, bool Disponivel);
