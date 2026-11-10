using ReservaUPLA.Application.DTOs;
using ReservaUPLA.Domain.Enumeraciones;

namespace ReservaUPLA.Application.Interfaces;

// Módulo de salida de ambientes: entrega los DTOs que muestra la interfaz, con el nombre del responsable.
public interface IConsultaDeAmbientes
{
    Task<IReadOnlyList<AmbienteDto>> ListarAsync(
        Estados_Ambiente? estado_ambiente, Guid? id_responsable_ambiente, CancellationToken cancelacion = default);
}
