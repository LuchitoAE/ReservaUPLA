namespace ReservaUPLA.Application.Datos;

// Indicadores del dashboard (RF-08): los cinco que pide el caso y, además, las canceladas (para que el total cuadre
// con la suma) y el número de reservas de cada ambiente, que sustenta cuál es «el más utilizado».
public sealed record DatosDeIndicadores(
    int Total_Reservas,
    int Reservas_Pendientes,
    int Reservas_Aprobadas,
    int Reservas_Rechazadas,
    int Reservas_Canceladas,
    IReadOnlyList<DatosDeUsoDeAmbiente> Ambientes_Mas_Utilizados,
    IReadOnlyList<DatosDeUsoDeAmbiente> Reservas_Por_Ambiente);

// Cuántas reservas tiene un ambiente (todas y las aprobadas).
public sealed record DatosDeUsoDeAmbiente(
    Guid Id_Ambiente,
    string Nombre_Ambiente,
    int Total_Reservas,
    int Reservas_Aprobadas);
