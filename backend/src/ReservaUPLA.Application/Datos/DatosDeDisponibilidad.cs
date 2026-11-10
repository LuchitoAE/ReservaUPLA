using ReservaUPLA.Domain.Enumeraciones;

namespace ReservaUPLA.Application.Datos;

// Respuesta de la consulta de disponibilidad (RF-04): si el horario está libre, por qué no, y qué reservas tiene
// ese ambiente ese día (para que el solicitante elija otro horario sin adivinar).
public sealed record DatosDeDisponibilidad(
    bool Disponible,
    string Mensaje,
    IReadOnlyList<DatosDeHorarioOcupado> Reservas_Del_Dia);

public sealed record DatosDeHorarioOcupado(
    string Codigo_Reserva,
    TimeOnly Hora_Inicio_Reserva,
    TimeOnly Hora_Fin_Reserva,
    Estados_Reserva Estado_Reserva);
