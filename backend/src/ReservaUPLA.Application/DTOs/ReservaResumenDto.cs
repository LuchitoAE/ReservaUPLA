using ReservaUPLA.Domain.Enumeraciones;

namespace ReservaUPLA.Application.DTOs;

// Una fila del listado de reservas (RF-05): lo necesario para ubicar una reserva de un vistazo, con los nombres del
// ambiente y del solicitante en lugar de sus identificadores. El detalle completo va en ReservaDetalleDto.
public sealed record ReservaResumenDto(
    Guid Id_Reserva,
    string Codigo_Reserva,
    DateOnly Fecha_Reserva,
    TimeOnly Hora_Inicio_Reserva,
    TimeOnly Hora_Fin_Reserva,
    Estados_Reserva Estado_Reserva,
    Guid Id_Ambiente,
    string Nombre_Ambiente,
    Guid Id_Usuario,
    string Nombre_Completo_Usuario);
