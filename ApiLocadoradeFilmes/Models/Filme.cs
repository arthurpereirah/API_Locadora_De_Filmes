namespace ApiLocadoradeFilmes.Models;

public class FilmeEntity
{
    public int Id { get; set; }
    public string Titulo { get; set; } = string.Empty;
    public string Genero { get; set; } = string.Empty;
    public bool Disponivel { get; set; } = true;
}
