using Microsoft.EntityFrameworkCore;
using ReservaUPLA.Application.DTOs;
using ReservaUPLA.Application.Interfaces;
using ReservaUPLA.Domain.Entidades;
using ReservaUPLA.Infrastructure.Persistence;

namespace ReservaUPLA.Infrastructure.Consultas;

// Consultas de solo lectura para el módulo de salida. Unen reservas con usuarios y ambientes en una sola consulta
// SQL y traen solo las columnas que el DTO necesita (proyección), sin cargar entidades completas.
internal sealed class ConsultaDeReservas : IConsultaDeReservas
{
    private readonly ReservaUPLADbContext _contexto;

    public ConsultaDeReservas(ReservaUPLADbContext contexto)
    {
        _contexto = contexto;
    }

    public async Task<IReadOnlyList<ReservaResumenDto>> ListarAsync(FiltroDeReservas filtro, CancellationToken cancelacion = default)
    {
        var reservas = Filtrar(_contexto.Reservas.AsNoTracking(), filtro);

        // Primero las fechas más recientes; dentro del día, por hora de inicio.
        return await (
                from reserva in reservas
                join ambiente in _contexto.Ambientes on reserva.Id_Ambiente equals ambiente.Id_Ambiente
                join usuario in _contexto.Usuarios on reserva.Id_Usuario equals usuario.Id_Usuario
                orderby reserva.Fecha_Reserva descending, reserva.Hora_Inicio_Reserva, ambiente.Nombre_Ambiente
                select new ReservaResumenDto(
                    reserva.Id_Reserva,
                    reserva.Codigo_Reserva,
                    reserva.Fecha_Reserva,
                    reserva.Hora_Inicio_Reserva,
                    reserva.Hora_Fin_Reserva,
                    reserva.Estado_Reserva,
                    ambiente.Id_Ambiente,
                    ambiente.Nombre_Ambiente,
                    usuario.Id_Usuario,
                    usuario.Nombre_Completo_Usuario))
            .ToListAsync(cancelacion);
    }

    public async Task<ReservaDetalleDto?> ObtenerDetalleAsync(Guid id_reserva, CancellationToken cancelacion = default)
    {
        var fila = await (
                from reserva in _contexto.Reservas.AsNoTracking()
                join ambiente in _contexto.Ambientes on reserva.Id_Ambiente equals ambiente.Id_Ambiente
                join usuario in _contexto.Usuarios on reserva.Id_Usuario equals usuario.Id_Usuario
                where reserva.Id_Reserva == id_reserva
                select new { reserva, ambiente, usuario })
            .FirstOrDefaultAsync(cancelacion);

        // Los estados siguientes los decide el estado actual (patrón State): se calculan aquí, no en SQL.
        return fila is null ? null : ReservaDetalleDto.DesdeEntidades(fila.reserva, fila.usuario, fila.ambiente);
    }

    private IQueryable<Reserva> Filtrar(IQueryable<Reserva> reservas, FiltroDeReservas filtro)
    {
        if (filtro.Estado_Reserva is { } estado)
        {
            reservas = reservas.Where(r => r.Estado_Reserva == estado);
        }

        if (filtro.Id_Ambiente is { } id_ambiente)
        {
            reservas = reservas.Where(r => r.Id_Ambiente == id_ambiente);
        }

        if (filtro.Fecha_Reserva is { } fecha)
        {
            reservas = reservas.Where(r => r.Fecha_Reserva == fecha);
        }

        if (filtro.Id_Usuario is { } id_usuario)
        {
            reservas = reservas.Where(r => r.Id_Usuario == id_usuario);
        }

        if (filtro.Id_Responsable_Ambiente is { } id_responsable)
        {
            var ambientes_a_cargo = _contexto.Ambientes
                .Where(a => a.Id_Responsable_Ambiente == id_responsable)
                .Select(a => a.Id_Ambiente);
            reservas = reservas.Where(r => ambientes_a_cargo.Contains(r.Id_Ambiente));
        }

        return reservas;
    }
}
