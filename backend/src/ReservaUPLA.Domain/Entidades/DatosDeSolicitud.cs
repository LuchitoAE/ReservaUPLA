using ReservaUPLA.Domain.Comun;
using ReservaUPLA.Domain.Enumeraciones;

namespace ReservaUPLA.Domain.Entidades;

// Los datos con los que se pide una reserva (RN-02). Agruparlos evita una lista larga de parámetros y deja claro
// que el solicitante y el momento son contexto del caso de uso, no datos que el usuario escriba.
public sealed record DatosDeSolicitud(
    Usuario? Solicitante,
    Ambiente? Ambiente,
    DateOnly? Fecha,
    TimeOnly? HoraInicio,
    TimeOnly? HoraFin,
    string? Motivo,
    MomentoActual Momento);
