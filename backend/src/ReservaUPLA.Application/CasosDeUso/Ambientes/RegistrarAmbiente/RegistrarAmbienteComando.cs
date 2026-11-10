using ReservaUPLA.Domain.Enumeraciones;

namespace ReservaUPLA.Application.CasosDeUso.Ambientes.RegistrarAmbiente;

// Datos que llegan para registrar un ambiente. Si no se indica el estado, el ambiente nace Disponible;
// el responsable es opcional.
public sealed record RegistrarAmbienteComando(
    string? Nombre_Ambiente,
    Tipos_Ambiente Tipo_Ambiente,
    int? Capacidad_Ambiente,
    string? Ubicacion_Ambiente,
    Estados_Ambiente? Estado_Ambiente,
    Guid? Id_Responsable_Ambiente);
