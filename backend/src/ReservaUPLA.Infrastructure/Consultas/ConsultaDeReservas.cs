using Microsoft.EntityFrameworkCore;
using ReservaUPLA.Application.Datos;
using ReservaUPLA.Application.Interfaces;
using ReservaUPLA.Domain.Entidades;
using ReservaUPLA.Infrastructure.Persistencia;

namespace ReservaUPLA.Infrastructure.Consultas;

// Consultas de solo lectura para el módulo de salida. Unen reservas con usuarios y ambientes en una sola consulta
// SQL y traen solo las columnas que los datos de salida necesitan (proyección), sin cargar entidades completas.
internal sealed class ConsultaDeReservas : IConsultaDeReservas
{
    private readonly ContextoDeReservaUPLA _contexto;

    public ConsultaDeReservas(ContextoDeReservaUPLA contexto)
    {
        _contexto = contexto;
    }

    public async Task<IReadOnlyList<ResumenDeReserva>> ListarAsync(
        FiltroDeReservas filtro, CancellationToken cancelacion = default)
    {
        var reservas = Filtrar(_contexto.Reservas.AsNoTracking(), filtro);

        // Primero las fechas más recientes; dentro del día, por hora de inicio.
        return await (
                from reserva in reservas
                join ambiente in _contexto.Ambientes on reserva.IdAmbiente equals ambiente.IdAmbiente
                join usuario in _contexto.Usuarios on reserva.IdUsuario equals usuario.IdUsuario
                orderby reserva.FechaReserva descending, reserva.HoraInicioReserva, ambiente.NombreAmbiente
                select new ResumenDeReserva(
                    reserva.IdReserva,
                    reserva.CodigoReserva,
                    reserva.FechaReserva,
                    reserva.HoraInicioReserva,
                    reserva.HoraFinReserva,
                    reserva.EstadoReserva,
                    ambiente.IdAmbiente,
                    ambiente.NombreAmbiente,
                    usuario.IdUsuario,
                    usuario.NombreCompletoUsuario))
            .ToListAsync(cancelacion);
    }

    public async Task<DetalleDeReserva?> ObtenerDetalleAsync(
        Guid idReserva, CancellationToken cancelacion = default)
    {
        var fila = await (
                from reserva in _contexto.Reservas.AsNoTracking()
                join ambiente in _contexto.Ambientes on reserva.IdAmbiente equals ambiente.IdAmbiente
                join usuario in _contexto.Usuarios on reserva.IdUsuario equals usuario.IdUsuario
                where reserva.IdReserva == idReserva
                select new { reserva, ambiente, usuario })
            .FirstOrDefaultAsync(cancelacion);

        if (fila is null)
        {
            return null;
        }

        // RF-06: el historial con el nombre de quien hizo cada cambio (left join: las entradas anteriores al
        // historial no tienen usuario), del más antiguo al más reciente.
        var historial = await (
                from entrada in _contexto.Historiales.AsNoTracking()
                join usuario in _contexto.Usuarios on entrada.IdUsuario equals usuario.IdUsuario into autores
                from autor in autores.DefaultIfEmpty()
                where entrada.IdReserva == idReserva
                orderby entrada.FechaHistorial, entrada.IdHistorial
                select new DatosDeHistorial(
                    entrada.EstadoHistorial,
                    entrada.FechaHistorial,
                    entrada.IdUsuario,
                    autor == null ? null : autor.NombreCompletoUsuario))
            .ToListAsync(cancelacion);

        // Los estados siguientes los decide el estado actual (patrón State): se calculan aquí, no en SQL.
        return DetalleDeReserva.DesdeEntidades(fila.reserva, fila.usuario, fila.ambiente, historial);
    }

    private IQueryable<Reserva> Filtrar(IQueryable<Reserva> reservas, FiltroDeReservas filtro)
    {
        if (filtro.EstadoReserva is { } estado)
        {
            reservas = reservas.Where(r => r.EstadoReserva == estado);
        }

        if (filtro.IdAmbiente is { } idAmbiente)
        {
            reservas = reservas.Where(r => r.IdAmbiente == idAmbiente);
        }

        if (filtro.FechaReserva is { } fecha)
        {
            reservas = reservas.Where(r => r.FechaReserva == fecha);
        }

        if (filtro.IdUsuario is { } idUsuario)
        {
            reservas = reservas.Where(r => r.IdUsuario == idUsuario);
        }

        if (filtro.FechaDesde is { } desde)
        {
            reservas = reservas.Where(r => r.FechaReserva >= desde);
        }

        if (filtro.FechaHasta is { } hasta)
        {
            reservas = reservas.Where(r => r.FechaReserva <= hasta);
        }

        // Búsqueda (RF-05): parte del código o del nombre del solicitante, sin distinguir mayúsculas (ILIKE). Los % y _
        // que escriba la persona se buscan tal cual: se escapan para que no funcionen como comodines.
        var texto = filtro.Texto?.Trim();
        if (!string.IsNullOrEmpty(texto))
        {
            var patron = $"%{EscaparComodines(texto[..Math.Min(texto.Length, FiltroDeReservas.LongitudMaximaTexto)])}%";
            var solicitantes = _contexto.Usuarios
                .Where(u => EF.Functions.ILike(u.NombreCompletoUsuario, patron, Escape))
                .Select(u => u.IdUsuario);
            reservas = reservas.Where(r =>
                EF.Functions.ILike(r.CodigoReserva, patron, Escape) || solicitantes.Contains(r.IdUsuario));
        }

        if (filtro.IdResponsableAmbiente is { } idResponsable)
        {
            var ambientesACargo = _contexto.Ambientes
                .Where(a => a.IdResponsableAmbiente == idResponsable)
                .Select(a => a.IdAmbiente);
            reservas = reservas.Where(r => ambientesACargo.Contains(r.IdAmbiente));
        }

        return reservas;
    }

    private const string Escape = "\\";

    private static string EscaparComodines(string texto) =>
        texto.Replace(Escape, Escape + Escape).Replace("%", Escape + "%").Replace("_", Escape + "_");
}
