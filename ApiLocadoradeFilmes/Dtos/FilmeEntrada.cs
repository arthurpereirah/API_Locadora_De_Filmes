namespace ApiLocadoradeFilmes.Dtos;

public class FilmeEntrada
{
    public string Titulo { get; set; } = string.Empty;
    public string Genero { get; set; } = string.Empty;
    public bool Disponivel { get; set; } = true;
}
