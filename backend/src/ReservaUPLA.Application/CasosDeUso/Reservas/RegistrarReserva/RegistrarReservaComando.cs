namespace ReservaUPLA.Application.CasosDeUso.Reservas.RegistrarReserva;

// Datos que llegan para solicitar una reserva (RN-02: fecha, horas, ambiente y motivo; el solicitante es el usuario
// de la sesión, no un dato que se pueda escribir). Admiten null a propósito: si falta alguno, el dominio responde con
// su mensaje en español, junto a su campo.
public sealed record RegistrarReservaComando(
    Guid? IdAmbiente,
    DateOnly? FechaReserva,
    TimeOnly? HoraInicioReserva,
    TimeOnly? HoraFinReserva,
    string? MotivoReserva);
