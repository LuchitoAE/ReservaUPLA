using ReservaUPLA.Application.Datos;
using ReservaUPLA.Application.Interfaces;
using ReservaUPLA.Domain.Entidades;

namespace ReservaUPLA.Application.CasosDeUso.Reservas.RegistrarReserva;

// RF-03 y RF-04: busca al solicitante y al ambiente, deja que la entidad valide los datos, revisa la disponibilidad
// con las reservas de ese día y, solo entonces, pide el correlativo y guarda. Toda reserva nace Pendiente.
public sealed class RegistrarReservaCasoDeUso
{
    private readonly IRepositorioDeReservas _repositorio_de_reservas;
    private readonly IRepositorioDeUsuarios _repositorio_de_usuarios;
    private readonly IRepositorioDeAmbientes _repositorio_de_ambientes;
    private readonly IReloj _reloj;

    public RegistrarReservaCasoDeUso(
        IRepositorioDeReservas repositorio_de_reservas,
        IRepositorioDeUsuarios repositorio_de_usuarios,
        IRepositorioDeAmbientes repositorio_de_ambientes,
        IReloj reloj)
    {
        _repositorio_de_reservas = repositorio_de_reservas;
        _repositorio_de_usuarios = repositorio_de_usuarios;
        _repositorio_de_ambientes = repositorio_de_ambientes;
        _reloj = reloj;
    }

    // «id_usuario_sesion»: quien inició sesión; él es el solicitante.
    public async Task<DetalleDeReserva> EjecutarAsync(RegistrarReservaComando comando, Guid id_usuario_sesion, CancellationToken cancelacion = default)
    {
        var solicitante = await _repositorio_de_usuarios.ObtenerPorIdAsync(id_usuario_sesion, cancelacion);
        var ambiente = comando.Id_Ambiente is { } id_ambiente
            ? await _repositorio_de_ambientes.ObtenerPorIdAsync(id_ambiente, cancelacion)
            : null;

        // Si algún dato falla, Solicitar lanza DatosNoValidosExcepcion con todos los errores.
        var reserva = Reserva.Solicitar(
            solicitante,
            ambiente,
            comando.Fecha_Reserva,
            comando.Hora_Inicio_Reserva,
            comando.Hora_Fin_Reserva,
            comando.Motivo_Reserva,
            _reloj.AhoraEnPeru,
            _reloj.AhoraUtc);

        // RF-04: antes de registrar, que no choque con una reserva aprobada (RN-01).
        var reservas_del_dia = await _repositorio_de_reservas.ListarDelAmbienteEnLaFechaAsync(reserva.Id_Ambiente, reserva.Fecha_Reserva, cancelacion);
        reserva.VerificarDisponibilidad(reservas_del_dia);

        reserva.AsignarCodigo(await _repositorio_de_reservas.ObtenerSiguienteNumeroAsync(cancelacion));
        await _repositorio_de_reservas.AgregarAsync(reserva, cancelacion);

        // Recién registrada, su historial tiene una sola entrada: Pendiente, por quien la solicitó.
        var historial = reserva.Historial_Reserva
            .Select(entrada => new DatosDeHistorial(entrada.Estado_Historial, entrada.Fecha_Historial, entrada.Id_Usuario,
                solicitante!.Nombre_Completo_Usuario))
            .ToList();

        return DetalleDeReserva.DesdeEntidades(reserva, solicitante!, ambiente!, historial);
    }
}
