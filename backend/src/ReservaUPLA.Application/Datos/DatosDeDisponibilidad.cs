using ReservaUPLA.Domain.Enumeraciones;

namespace ReservaUPLA.Application.Datos;

// Respuesta de la consulta de disponibilidad (RF-04): si el horario está libre, por qué no, y qué reservas tiene
// ese ambiente ese día (para que el solicitante elija otro horario sin adivinar).
public sealed record DatosDeDisponibilidad(
    bool Disponible,
    string Mensaje,
    IReadOnlyList<DatosDeHorarioOcupado> ReservasDelDia);

public sealed record DatosDeHorarioOcupado(
    string CodigoReserva,
    TimeOnly HoraInicioReserva,
    TimeOnly HoraFinReserva,
    EstadoReserva EstadoReserva);
