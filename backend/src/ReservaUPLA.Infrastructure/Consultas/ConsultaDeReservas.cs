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

    public async Task<IReadOnlyList<ResumenDeReserva>> ListarAsync(FiltroDeReservas filtro, CancellationToken cancelacion = default)
    {
        var reservas = Filtrar(_contexto.Reservas.AsNoTracking(), filtro);

        // Primero las fechas más recientes; dentro del día, por hora de inicio.
        return await (
                from reserva in reservas
                join ambiente in _contexto.Ambientes on reserva.Id_Ambiente equals ambiente.Id_Ambiente
                join usuario in _contexto.Usuarios on reserva.Id_Usuario equals usuario.Id_Usuario
                orderby reserva.Fecha_Reserva descending, reserva.Hora_Inicio_Reserva, ambiente.Nombre_Ambiente
                select new ResumenDeReserva(
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

    public async Task<DetalleDeReserva?> ObtenerDetalleAsync(Guid id_reserva, CancellationToken cancelacion = default)
    {
        var fila = await (
                from reserva in _contexto.Reservas.AsNoTracking()
                join ambiente in _contexto.Ambientes on reserva.Id_Ambiente equals ambiente.Id_Ambiente
                join usuario in _contexto.Usuarios on reserva.Id_Usuario equals usuario.Id_Usuario
                where reserva.Id_Reserva == id_reserva
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
                join usuario in _contexto.Usuarios on entrada.Id_Usuario equals usuario.Id_Usuario into autores
                from autor in autores.DefaultIfEmpty()
                where entrada.Id_Reserva == id_reserva
                orderby entrada.Fecha_Historial, entrada.Id_Historial
                select new DatosDeHistorial(entrada.Estado_Historial, entrada.Fecha_Historial, entrada.Id_Usuario,
                    autor == null ? null : autor.Nombre_Completo_Usuario))
            .ToListAsync(cancelacion);

        // Los estados siguientes los decide el estado actual (patrón State): se calculan aquí, no en SQL.
        return DetalleDeReserva.DesdeEntidades(fila.reserva, fila.usuario, fila.ambiente, historial);
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

        if (filtro.Fecha_Desde is { } desde)
        {
            reservas = reservas.Where(r => r.Fecha_Reserva >= desde);
        }

        if (filtro.Fecha_Hasta is { } hasta)
        {
            reservas = reservas.Where(r => r.Fecha_Reserva <= hasta);
        }

        // Búsqueda (RF-05): parte del código o del nombre del solicitante, sin distinguir mayúsculas (ILIKE). Los % y _
        // que escriba la persona se buscan tal cual: se escapan para que no funcionen como comodines.
        var texto = filtro.Texto?.Trim();
        if (!string.IsNullOrEmpty(texto))
        {
            var patron = $"%{EscaparComodines(texto[..Math.Min(texto.Length, FiltroDeReservas.Longitud_Maxima_Texto)])}%";
            var solicitantes = _contexto.Usuarios
                .Where(u => EF.Functions.ILike(u.Nombre_Completo_Usuario, patron, Escape))
                .Select(u => u.Id_Usuario);
            reservas = reservas.Where(r => EF.Functions.ILike(r.Codigo_Reserva, patron, Escape) || solicitantes.Contains(r.Id_Usuario));
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

    private const string Escape = "\\";

    private static string EscaparComodines(string texto) =>
        texto.Replace(Escape, Escape + Escape).Replace("%", Escape + "%").Replace("_", Escape + "_");
}
