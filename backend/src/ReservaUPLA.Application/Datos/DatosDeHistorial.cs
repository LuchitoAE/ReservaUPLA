using ReservaUPLA.Domain.Enumeraciones;

namespace ReservaUPLA.Application.Datos;

// Una entrada del historial de una reserva (RF-06), como la muestra la interfaz: el estado, cuándo y quién hizo el
// cambio. Sin usuario solo en los cambios anteriores al historial, cargados por la migración.
public sealed record DatosDeHistorial(
    EstadoReserva EstadoHistorial,
    DateTime FechaHistorial,
    Guid? IdUsuario,
    string? NombreCompletoUsuario);
