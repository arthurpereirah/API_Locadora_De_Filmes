using System.Text.Json;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors();

builder.Services.AddDbContext<ApiDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();

//tela inicial da api ao rodar o projeto
//app.MapGet("/", () => "Api de locadora de filmes está no ar!");

// listar todos os filmes cadastrados
app.MapGet("/api/locadoradefilmes", async (ApiDbContext db) =>
{
    var filmes = await db.Filmes.ToListAsync();
    return Results.Ok(filmes);
});

// listar um filme pelo id
app.MapGet("/api/locadoradefilmes/{id:int}", async (int id, ApiDbContext db) =>
{
    //find procura o filme pelo id, caso não encontre retorna null
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
    //salvando em memoria e preparando para salvar em banco de dados
    db.Filmes.Add(filmeDto);
    //salvando no banco de dados
    await db.SaveChangesAsync();
    return Results.Created($"/api/locadoradefilmes/{filmeDto.Id}", filmeDto);
});

//Atualizar um filme
app.MapPut("/api/locadoradefilmes/{id:int}", async(int id, FilmeEntity filmeatualAtualizado, ApiDbContext db) =>
{
    var filmeExistente = await db.Filmes.FindAsync(id);
    if(filmeExistente is  null) return Results.NotFound();
    filmeExistente.Titulo = filmeatualAtualizado.Titulo;
    filmeExistente.Genero = filmeatualAtualizado.Genero;
    filmeExistente.Disponivel = filmeatualAtualizado.Disponivel;

    await db.SaveChangesAsync();
    return Results.Ok(filmeExistente);
    

});

app.MapDelete("/api/locadoradefilmes/{id:int}", async (int id, ApiDbContext db) =>
{
    var filmes = await db.Filmes.FindAsync(id);
    if(filmes is  null) return Results.NotFound();


    db.Filmes.Remove(filmes);
    await db.SaveChangesAsync();
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


