using Microsoft.EntityFrameworkCore;
using ReservaUPLA.Application.Datos;
using ReservaUPLA.Application.Interfaces;
using ReservaUPLA.Domain.Enumeraciones;
using ReservaUPLA.Infrastructure.Persistencia;

namespace ReservaUPLA.Infrastructure.Consultas;

// Calcula los indicadores en PostgreSQL (GROUP BY), sin traer las reservas a memoria: dos consultas pequeñas.
internal sealed class ConsultaDeIndicadores : IConsultaDeIndicadores
{
    private readonly ContextoDeReservaUPLA _contexto;

    public ConsultaDeIndicadores(ContextoDeReservaUPLA contexto)
    {
        _contexto = contexto;
    }

    public async Task<DatosDeIndicadores> ObtenerAsync(CancellationToken cancelacion = default)
    {
        // Cantidad de reservas por estado: SELECT estado_reserva, count(*) ... GROUP BY estado_reserva.
        var por_estado = await _contexto.Reservas
            .AsNoTracking()
            .GroupBy(r => r.Estado_Reserva)
            .Select(grupo => new { Estado = grupo.Key, Cantidad = grupo.Count() })
            .ToDictionaryAsync(fila => fila.Estado, fila => fila.Cantidad, cancelacion);

        int Contar(Estados_Reserva estado) => por_estado.GetValueOrDefault(estado);

        // Todos los ambientes, también los que aún no tienen reservas, de más a menos reservado.
        var por_ambiente = (await _contexto.Ambientes
                .AsNoTracking()
                .Select(ambiente => new
                {
                    ambiente.Id_Ambiente,
                    ambiente.Nombre_Ambiente,
                    Total = _contexto.Reservas.Count(r => r.Id_Ambiente == ambiente.Id_Ambiente),
                    Aprobadas = _contexto.Reservas.Count(r =>
                        r.Id_Ambiente == ambiente.Id_Ambiente && r.Estado_Reserva == Estados_Reserva.Aprobada),
                })
                .OrderByDescending(uso => uso.Total)
                .ThenBy(uso => uso.Nombre_Ambiente)
                .ToListAsync(cancelacion))
            .Select(uso => new DatosDeUsoDeAmbiente(uso.Id_Ambiente, uso.Nombre_Ambiente, uso.Total, uso.Aprobadas))
            .ToList();

        // «Ambiente con mayor número de reservas» (caso, sección 10). Si hay empate, van todos los empatados.
        var maximo = por_ambiente.Count == 0 ? 0 : por_ambiente.Max(uso => uso.Total_Reservas);
        var mas_utilizados = maximo == 0 ? [] : por_ambiente.Where(uso => uso.Total_Reservas == maximo).ToList();

        return new DatosDeIndicadores(
            por_estado.Values.Sum(),
            Contar(Estados_Reserva.Pendiente),
            Contar(Estados_Reserva.Aprobada),
            Contar(Estados_Reserva.Rechazada),
            Contar(Estados_Reserva.Cancelada),
            mas_utilizados,
            por_ambiente);
    }
}
