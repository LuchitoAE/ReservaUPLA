using ReservaUPLA.Domain.Enumeraciones;

namespace ReservaUPLA.Application.Datos;

// Datos de un ambiente que salen hacia la API. Lleva el nombre del responsable para mostrarlo sin otra consulta.
public sealed record DatosDeAmbiente(
    Guid IdAmbiente,
    string NombreAmbiente,
    TipoAmbiente TipoAmbiente,
    int CapacidadAmbiente,
    string UbicacionAmbiente,
    EstadoAmbiente EstadoAmbiente,
    Guid? IdResponsableAmbiente,
    string? NombreResponsableAmbiente);
