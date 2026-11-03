using ReservaUPLA.Domain.Enums;

namespace ReservaUPLA.Application.DTOs;

// Respuesta de la consulta de disponibilidad (RF-04): si el horario está libre, por qué no, y qué reservas tiene
// ese ambiente ese día (para que el solicitante elija otro horario sin adivinar).
public sealed record DisponibilidadDto(
    bool Disponible,
    string Mensaje,
    IReadOnlyList<HorarioOcupadoDto> Reservas_Del_Dia);

public sealed record HorarioOcupadoDto(
    string Codigo_Reserva,
    TimeOnly Hora_Inicio_Reserva,
    TimeOnly Hora_Fin_Reserva,
    Estados_Reserva Estado_Reserva);
