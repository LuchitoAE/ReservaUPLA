namespace ReservaUPLA.Application.UseCases.Reservas.RegistrarReserva;

// Datos que llegan para solicitar una reserva (RN-02: fecha, horas, ambiente y motivo; el solicitante es el usuario
// de la sesión, no un dato que se pueda escribir). Admiten null a propósito: si falta alguno, el dominio responde con
// su mensaje en español, junto a su campo.
public sealed record RegistrarReservaCommand(
    Guid? Id_Ambiente,
    DateOnly? Fecha_Reserva,
    TimeOnly? Hora_Inicio_Reserva,
    TimeOnly? Hora_Fin_Reserva,
    string? Motivo_Reserva);
