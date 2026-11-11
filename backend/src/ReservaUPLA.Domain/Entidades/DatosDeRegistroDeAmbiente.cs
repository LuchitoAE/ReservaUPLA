using ReservaUPLA.Domain.Enumeraciones;

namespace ReservaUPLA.Domain.Entidades;

// Los datos con los que se registra un ambiente (RF-02). El responsable y si el nombre ya existe los averigua el
// caso de uso; la entidad se limita a comprobar que sean coherentes.
public sealed record DatosDeRegistroDeAmbiente(
    string? Nombre,
    TipoAmbiente Tipo,
    int? Capacidad,
    string? Ubicacion,
    EstadoAmbiente Estado,
    bool ResponsableIndicado,
    Usuario? Responsable,
    bool NombreYaRegistrado);
