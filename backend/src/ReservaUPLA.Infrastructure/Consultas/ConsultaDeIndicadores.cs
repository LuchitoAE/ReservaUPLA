using Microsoft.EntityFrameworkCore;
using ReservaUPLA.Application.Datos;
using ReservaUPLA.Application.Interfaces;
using ReservaUPLA.Domain.Enumeraciones;
using ReservaUPLA.Infrastructure.Persistencia;

namespace ReservaUPLA.Infrastructure.Consultas;

// Calcula los indicadores en PostgreSQL (GROUP BY), sin traer las reservas a memoria: dos consultas pequeñas. Cuenta
// dentro del alcance: las reservas de un solicitante, las de los ambientes de un responsable o todas (RF-12).
internal sealed class ConsultaDeIndicadores : IConsultaDeIndicadores
{
    private readonly ContextoDeReservaUPLA _contexto;

    public ConsultaDeIndicadores(ContextoDeReservaUPLA contexto)
    {
        _contexto = contexto;
    }

    public async Task<DatosDeIndicadores> ObtenerAsync(
        AlcanceDeIndicadores alcance, CancellationToken cancelacion = default)
    {
        var reservas = _contexto.Reservas.AsNoTracking();
        var ambientes = _contexto.Ambientes.AsNoTracking();
        if (alcance.IdSolicitante is { } idSolicitante)
        {
            reservas = reservas.Where(r => r.IdUsuario == idSolicitante);
        }

        if (alcance.IdResponsableAmbiente is { } idResponsable)
        {
            ambientes = ambientes.Where(a => a.IdResponsableAmbiente == idResponsable);
            var aCargo = ambientes.Select(a => a.IdAmbiente);
            reservas = reservas.Where(r => aCargo.Contains(r.IdAmbiente));
        }

        // Cantidad de reservas por estado: SELECT estado_reserva, count(*) ... GROUP BY estado_reserva.
        var porEstado = await reservas
            .GroupBy(r => r.EstadoReserva)
            .Select(grupo => new { Estado = grupo.Key, Cantidad = grupo.Count() })
            .ToDictionaryAsync(fila => fila.Estado, fila => fila.Cantidad, cancelacion);

        int Contar(EstadoReserva estado) => porEstado.GetValueOrDefault(estado);

        // Los ambientes del alcance, también los que aún no tienen reservas, de más a menos reservado.
        var porAmbiente = (await ambientes
                .Select(ambiente => new
                {
                    ambiente.IdAmbiente,
                    ambiente.NombreAmbiente,
                    Total = reservas.Count(r => r.IdAmbiente == ambiente.IdAmbiente),
                    Aprobadas = reservas.Count(r =>
                        r.IdAmbiente == ambiente.IdAmbiente && r.EstadoReserva == EstadoReserva.Aprobada),
                })
                .OrderByDescending(uso => uso.Total)
                .ThenBy(uso => uso.NombreAmbiente)
                .ToListAsync(cancelacion))
            .Select(uso => new DatosDeUsoDeAmbiente(uso.IdAmbiente, uso.NombreAmbiente, uso.Total, uso.Aprobadas))
            .ToList();

        // «Ambiente con mayor número de reservas» (caso, sección 10). Si hay empate, van todos los empatados.
        var maximo = porAmbiente.Count == 0 ? 0 : porAmbiente.Max(uso => uso.TotalReservas);
        var masUtilizados = maximo == 0 ? [] : porAmbiente.Where(uso => uso.TotalReservas == maximo).ToList();

        return new DatosDeIndicadores(
            porEstado.Values.Sum(),
            Contar(EstadoReserva.Pendiente),
            Contar(EstadoReserva.Aprobada),
            Contar(EstadoReserva.Rechazada),
            Contar(EstadoReserva.Cancelada),
            masUtilizados,
            porAmbiente);
    }
}
