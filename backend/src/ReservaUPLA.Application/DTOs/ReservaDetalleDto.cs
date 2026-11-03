using ReservaUPLA.Domain.Entities;
using ReservaUPLA.Domain.Enums;

namespace ReservaUPLA.Application.DTOs;

// Todo lo que se muestra de una reserva (RF-06): sus datos, los del solicitante y los del ambiente, y a qué estados
// puede pasar (lo responde su estado actual, patrón State). La interfaz no necesita otra consulta.
public sealed record ReservaDetalleDto(
    Guid Id_Reserva,
    string Codigo_Reserva,
    DateOnly Fecha_Reserva,
    TimeOnly Hora_Inicio_Reserva,
    TimeOnly Hora_Fin_Reserva,
    string Motivo_Reserva,
    Estados_Reserva Estado_Reserva,
    IReadOnlyList<Estados_Reserva> Estados_Siguientes_Reserva,
    DateTime Fecha_Registro_Reserva,
    DateTime? Fecha_Actualizacion_Reserva,
    Guid Id_Usuario,
    string Nombre_Completo_Usuario,
    string Correo_Usuario,
    Guid Id_Ambiente,
    string Nombre_Ambiente,
    Tipos_Ambiente Tipo_Ambiente,
    int Capacidad_Ambiente,
    string Ubicacion_Ambiente)
{
    public static ReservaDetalleDto DesdeEntidades(Reserva reserva, Usuario solicitante, Ambiente ambiente) => new(
        reserva.Id_Reserva,
        reserva.Codigo_Reserva,
        reserva.Fecha_Reserva,
        reserva.Hora_Inicio_Reserva,
        reserva.Hora_Fin_Reserva,
        reserva.Motivo_Reserva,
        reserva.Estado_Reserva,
        reserva.ObtenerEstado().Siguientes,
        reserva.Fecha_Registro_Reserva,
        reserva.Fecha_Actualizacion_Reserva,
        solicitante.Id_Usuario,
        solicitante.Nombre_Completo_Usuario,
        solicitante.Correo_Usuario,
        ambiente.Id_Ambiente,
        ambiente.Nombre_Ambiente,
        ambiente.Tipo_Ambiente,
        ambiente.Capacidad_Ambiente,
        ambiente.Ubicacion_Ambiente);
}
