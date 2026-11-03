namespace ReservaUPLA.Application.DTOs;

// Indicadores del dashboard (RF-08): los cinco que pide el caso y, además, las canceladas (para que el total cuadre
// con la suma) y el número de reservas de cada ambiente, que sustenta cuál es «el más utilizado».
public sealed record IndicadoresDto(
    int Total_Reservas,
    int Reservas_Pendientes,
    int Reservas_Aprobadas,
    int Reservas_Rechazadas,
    int Reservas_Canceladas,
    IReadOnlyList<UsoDeAmbienteDto> Ambientes_Mas_Utilizados,
    IReadOnlyList<UsoDeAmbienteDto> Reservas_Por_Ambiente);

// Cuántas reservas tiene un ambiente (todas y las aprobadas).
public sealed record UsoDeAmbienteDto(
    Guid Id_Ambiente,
    string Nombre_Ambiente,
    int Total_Reservas,
    int Reservas_Aprobadas);
