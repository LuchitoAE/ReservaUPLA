namespace ReservaUPLA.Application.Datos;

// Indicadores del dashboard (RF-08): los cinco que pide el caso y, además, las canceladas (para que el total cuadre
// con la suma) y el número de reservas de cada ambiente, que sustenta cuál es «el más utilizado».
public sealed record DatosDeIndicadores(
    int TotalReservas,
    int ReservasPendientes,
    int ReservasAprobadas,
    int ReservasRechazadas,
    int ReservasCanceladas,
    IReadOnlyList<DatosDeUsoDeAmbiente> AmbientesMasUtilizados,
    IReadOnlyList<DatosDeUsoDeAmbiente> ReservasPorAmbiente);

// Cuántas reservas tiene un ambiente (todas y las aprobadas).
public sealed record DatosDeUsoDeAmbiente(
    Guid IdAmbiente,
    string NombreAmbiente,
    int TotalReservas,
    int ReservasAprobadas);
