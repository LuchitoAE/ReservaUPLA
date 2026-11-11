using ReservaUPLA.Domain.Enumeraciones;

namespace ReservaUPLA.Application.CasosDeUso.Ambientes.RegistrarAmbiente;

// Datos que llegan para registrar un ambiente. Si no se indica el estado, el ambiente nace Disponible;
// el responsable es opcional.
public sealed record RegistrarAmbienteComando(
    string? NombreAmbiente,
    TipoAmbiente TipoAmbiente,
    int? CapacidadAmbiente,
    string? UbicacionAmbiente,
    EstadoAmbiente? EstadoAmbiente,
    Guid? IdResponsableAmbiente);
