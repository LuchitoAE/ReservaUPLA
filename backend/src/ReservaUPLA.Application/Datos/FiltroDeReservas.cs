using ReservaUPLA.Domain.Enumeraciones;

namespace ReservaUPLA.Application.Datos;

// Filtros opcionales del listado (RF-05). Los que llegan en null no filtran.
//   IdUsuario: las reservas de un solicitante («mis reservas»).
//   IdResponsableAmbiente: las de los ambientes a cargo de un responsable (actor «Responsable de ambiente»).
//   FechaDesde y FechaHasta: un rango de fechas, inclusivo (la agenda de una semana, RF-13).
//   Texto: parte del código o del nombre del solicitante, sin distinguir mayúsculas (búsqueda, RF-05).
public sealed record FiltroDeReservas(
    EstadoReserva? EstadoReserva = null,
    Guid? IdAmbiente = null,
    DateOnly? FechaReserva = null,
    Guid? IdUsuario = null,
    Guid? IdResponsableAmbiente = null,
    DateOnly? FechaDesde = null,
    DateOnly? FechaHasta = null,
    string? Texto = null)
{
    public const int LongitudMaximaTexto = 100;
}
