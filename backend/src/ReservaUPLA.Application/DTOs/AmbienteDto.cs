using ReservaUPLA.Domain.Enums;

namespace ReservaUPLA.Application.DTOs;

// Datos de un ambiente que salen hacia la API. Lleva el nombre del responsable para mostrarlo sin otra consulta.
public sealed record AmbienteDto(
    Guid Id_Ambiente,
    string Nombre_Ambiente,
    Tipos_Ambiente Tipo_Ambiente,
    int Capacidad_Ambiente,
    string Ubicacion_Ambiente,
    Estados_Ambiente Estado_Ambiente,
    Guid? Id_Responsable_Ambiente,
    string? Nombre_Responsable_Ambiente);
