using ReservaUPLA.Domain.Entities;

namespace ReservaUPLA.Application.Interfaces;

// Lo que los casos de uso necesitan para guardar y leer reservas. Lo implementa la Infraestructura.
public interface IReservaRepository
{
    // Para cambiarla: la entidad queda en seguimiento y GuardarCambiosAsync guarda lo que cambió.
    Task<Reserva?> ObtenerPorIdAsync(Guid id_reserva, CancellationToken cancelacion = default);

    // Reservas del mismo ambiente en la misma fecha: con ellas la entidad revisa la disponibilidad (RN-01).
    Task<IReadOnlyList<Reserva>> ListarDelAmbienteEnLaFechaAsync(Guid id_ambiente, DateOnly fecha_reserva, CancellationToken cancelacion = default);

    Task<int> ObtenerSiguienteNumeroAsync(CancellationToken cancelacion = default);

    Task AgregarAsync(Reserva reserva, CancellationToken cancelacion = default);

    Task GuardarCambiosAsync(CancellationToken cancelacion = default);
}
