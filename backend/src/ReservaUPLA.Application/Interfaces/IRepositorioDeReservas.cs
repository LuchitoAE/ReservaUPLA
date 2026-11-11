using ReservaUPLA.Domain.Entidades;

namespace ReservaUPLA.Application.Interfaces;

// Lo que los casos de uso necesitan para guardar y leer reservas. Lo implementa la Infraestructura.
public interface IRepositorioDeReservas
{
    // Para cambiarla: la entidad queda en seguimiento y GuardarCambiosAsync guarda lo que cambió.
    Task<Reserva?> ObtenerPorIdAsync(Guid idReserva, CancellationToken cancelacion = default);

    // Reservas del mismo ambiente en la misma fecha: con ellas se arma la agenda con la que la entidad revisa
    // la disponibilidad (RN-01).
    Task<IReadOnlyList<Reserva>> ListarDelAmbienteEnLaFechaAsync(
        Guid idAmbiente, DateOnly fechaReserva, CancellationToken cancelacion = default);

    Task<int> ObtenerSiguienteNumeroAsync(CancellationToken cancelacion = default);

    Task AgregarAsync(Reserva reserva, CancellationToken cancelacion = default);

    Task GuardarCambiosAsync(CancellationToken cancelacion = default);
}
