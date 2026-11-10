using ReservaUPLA.Application.Datos;

namespace ReservaUPLA.Application.Interfaces;

// Módulo de salida de reservas: lee la base y entrega directamente los DTOs que muestra la interfaz (listado y
// detalle). Separada del repositorio: leer para mostrar y guardar entidades son responsabilidades distintas (SRP).
public interface IConsultaDeReservas
{
    Task<IReadOnlyList<ResumenDeReserva>> ListarAsync(FiltroDeReservas filtro, CancellationToken cancelacion = default);

    Task<DetalleDeReserva?> ObtenerDetalleAsync(Guid id_reserva, CancellationToken cancelacion = default);
}
