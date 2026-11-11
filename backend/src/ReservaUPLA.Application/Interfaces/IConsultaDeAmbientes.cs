using ReservaUPLA.Application.Datos;
using ReservaUPLA.Domain.Enumeraciones;

namespace ReservaUPLA.Application.Interfaces;

// Módulo de salida de ambientes: entrega los datos que muestra la interfaz, con el nombre del responsable.
public interface IConsultaDeAmbientes
{
    Task<IReadOnlyList<DatosDeAmbiente>> ListarAsync(
        EstadoAmbiente? estadoAmbiente, Guid? idResponsableAmbiente, CancellationToken cancelacion = default);
}
