using ReservaUPLA.Domain.Enumeraciones;

namespace ReservaUPLA.Application.Datos;

// Filtros opcionales del listado (RF-05). Los que llegan en null no filtran.
//   Id_Usuario: las reservas de un solicitante («mis reservas»).
//   Id_Responsable_Ambiente: las de los ambientes a cargo de un responsable (actor «Responsable de ambiente»).
public sealed record FiltroDeReservas(
    Estados_Reserva? Estado_Reserva = null,
    Guid? Id_Ambiente = null,
    DateOnly? Fecha_Reserva = null,
    Guid? Id_Usuario = null,
    Guid? Id_Responsable_Ambiente = null);
