using Microsoft.EntityFrameworkCore;
using ApiLocadoradeFilmes.Models;

namespace ApiLocadoradeFilmes.Data;

public class ApiDbContext : DbContext
{
    public ApiDbContext(DbContextOptions<ApiDbContext> options) : base(options)
    {
    }

    public DbSet<FilmeEntity> Filmes => Set<FilmeEntity>();
}
