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

    public async Task<DatosDeIndicadores> ObtenerAsync(AlcanceDeIndicadores alcance, CancellationToken cancelacion = default)
    {
        var reservas = _contexto.Reservas.AsNoTracking();
        var ambientes = _contexto.Ambientes.AsNoTracking();
        if (alcance.Id_Solicitante is { } id_solicitante)
        {
            reservas = reservas.Where(r => r.Id_Usuario == id_solicitante);
        }

        if (alcance.Id_Responsable_Ambiente is { } id_responsable)
        {
            ambientes = ambientes.Where(a => a.Id_Responsable_Ambiente == id_responsable);
            var a_cargo = ambientes.Select(a => a.Id_Ambiente);
            reservas = reservas.Where(r => a_cargo.Contains(r.Id_Ambiente));
        }

        // Cantidad de reservas por estado: SELECT estado_reserva, count(*) ... GROUP BY estado_reserva.
        var por_estado = await reservas
            .GroupBy(r => r.Estado_Reserva)
            .Select(grupo => new { Estado = grupo.Key, Cantidad = grupo.Count() })
            .ToDictionaryAsync(fila => fila.Estado, fila => fila.Cantidad, cancelacion);

        int Contar(Estados_Reserva estado) => por_estado.GetValueOrDefault(estado);

        // Los ambientes del alcance, también los que aún no tienen reservas, de más a menos reservado.
        var por_ambiente = (await ambientes
                .Select(ambiente => new
                {
                    ambiente.Id_Ambiente,
                    ambiente.Nombre_Ambiente,
                    Total = reservas.Count(r => r.Id_Ambiente == ambiente.Id_Ambiente),
                    Aprobadas = reservas.Count(r =>
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
