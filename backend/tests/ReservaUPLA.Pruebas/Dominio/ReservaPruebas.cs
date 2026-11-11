using ReservaUPLA.Domain.Comun;
using ReservaUPLA.Domain.Entidades;
using ReservaUPLA.Domain.Enumeraciones;
using ReservaUPLA.Domain.Estados;
using ReservaUPLA.Domain.Excepciones;

namespace ReservaUPLA.Pruebas.Dominio;

// RF-06 y RF-07: cada reserva guarda su historial de estados y solo cambia a través de su estado actual (patrón
// State), con las reglas RN-01, RN-05 y RN-06. Un cambio que no se permite no deja rastro.
public sealed class ReservaPruebas
{
    private static readonly Func<string, ContrasenaCifrada> Cifrar = _ => new ContrasenaCifrada([1], [2]);
    private static readonly MomentoActual MomentoDeRegistro =
        MomentoActual.Desde(new DateTimeOffset(2026, 11, 9, 15, 0, 0, TimeSpan.Zero));
    private static readonly MomentoActual MomentoDeAprobacion =
        MomentoActual.Desde(new DateTimeOffset(2026, 11, 10, 14, 30, 0, TimeSpan.Zero));
    private static readonly MomentoActual MomentoDeCancelacion =
        MomentoActual.Desde(new DateTimeOffset(2026, 11, 11, 9, 15, 0, TimeSpan.Zero));

    private static Usuario NuevoUsuario(string codigo, RolUsuario rol) =>
        Usuario.Registrar(new DatosDeRegistroDeUsuario(
            codigo, "Persona de Prueba", $"{codigo.ToLowerInvariant()}@upla.edu.pe", rol, "Reserva2026",
            CodigoYaRegistrado: false, CorreoYaRegistrado: false, Cifrar));

    private static readonly Usuario Solicitante = NuevoUsuario("P00914K", RolUsuario.Solicitante);
    private static readonly Usuario Administrador = NuevoUsuario("ADMIN01", RolUsuario.Administrador);

    private static Ambiente NuevoAmbiente(string nombre = "Laboratorio de cómputo 1") =>
        Ambiente.Registrar(new DatosDeRegistroDeAmbiente(
            nombre, TipoAmbiente.LaboratorioDeComputo, 30, "Pabellón B, segundo piso",
            EstadoAmbiente.Disponible, ResponsableIndicado: false, Responsable: null, NombreYaRegistrado: false));

    private static Reserva Solicitar(
        Ambiente? ambiente = null,
        DateOnly? fecha = null,
        MomentoActual? momento = null) =>
        Reserva.Solicitar(new DatosDeSolicitud(
            Solicitante,
            ambiente ?? NuevoAmbiente(),
            fecha ?? new DateOnly(2026, 11, 18),
            new TimeOnly(14, 0),
            new TimeOnly(16, 0),
            "Sesión de práctica para el examen final.",
            momento ?? MomentoDeRegistro));

    private static void Aprobar(Reserva reserva, MomentoActual? momento = null) =>
        reserva.CambiarEstado(new DatosDeCambioDeEstado(
            EstadoReserva.Aprobada, Administrador, Agenda.De([]), momento ?? MomentoDeAprobacion));

    [Fact]
    public void Solicitar_registra_la_primera_entrada_del_historial()
    {
        var reserva = Solicitar();

        var entrada = Assert.Single(reserva.HistorialReserva);
        Assert.Equal(EstadoReserva.Pendiente, entrada.EstadoHistorial);
        Assert.Equal(Solicitante.IdUsuario, entrada.IdUsuario);
        Assert.Equal(MomentoDeRegistro.EnUtc, entrada.FechaHistorial);
        Assert.Equal(reserva.IdReserva, entrada.IdReserva);
    }

    [Fact]
    public void Solicitar_usa_un_solo_momento_para_el_registro_y_el_historial()
    {
        var reserva = Solicitar();

        Assert.Equal(MomentoDeRegistro.EnUtc, reserva.FechaRegistroReserva);
        Assert.Equal(MomentoDeRegistro.EnUtc, Assert.Single(reserva.HistorialReserva).FechaHistorial);
    }

    [Fact]
    public void CambiarEstado_agrega_una_entrada_con_el_estado_quien_y_cuando()
    {
        var reserva = Solicitar();

        Aprobar(reserva);

        var ultima = reserva.HistorialReserva[^1];
        Assert.Equal(2, reserva.HistorialReserva.Count);
        Assert.Equal(EstadoReserva.Aprobada, ultima.EstadoHistorial);
        Assert.Equal(Administrador.IdUsuario, ultima.IdUsuario);
        Assert.Equal(MomentoDeAprobacion.EnUtc, ultima.FechaHistorial);
    }

    [Fact]
    public void Un_cambio_que_no_se_permite_no_deja_entrada()
    {
        var reserva = Solicitar();

        // RN-05: solo el administrador aprueba.
        Assert.Throws<AccionNoPermitidaExcepcion>(() => reserva.CambiarEstado(
            new DatosDeCambioDeEstado(EstadoReserva.Aprobada, Solicitante, Agenda.De([]), MomentoDeAprobacion)));

        Assert.Single(reserva.HistorialReserva);
        Assert.Equal(EstadoReserva.Pendiente, reserva.EstadoReserva);
    }

    [Fact]
    public void El_historial_guarda_los_cambios_en_orden()
    {
        var reserva = Solicitar();

        Aprobar(reserva);
        reserva.CambiarEstado(new DatosDeCambioDeEstado(
            EstadoReserva.Cancelada, Solicitante, Agenda.De([]), MomentoDeCancelacion));

        Assert.Equal(
            [EstadoReserva.Pendiente, EstadoReserva.Aprobada, EstadoReserva.Cancelada],
            reserva.HistorialReserva.Select(entrada => entrada.EstadoHistorial));
        Assert.Equal(
            [MomentoDeRegistro.EnUtc, MomentoDeAprobacion.EnUtc, MomentoDeCancelacion.EnUtc],
            reserva.HistorialReserva.Select(entrada => entrada.FechaHistorial));
        Assert.Equal(Solicitante.IdUsuario, reserva.HistorialReserva[^1].IdUsuario);
    }

    [Fact]
    public void El_historial_es_una_copia_defensiva()
    {
        var reserva = Solicitar();
        var historial = Assert.IsAssignableFrom<IList<Historial>>(reserva.HistorialReserva);

        Assert.Throws<NotSupportedException>(historial.Clear);

        Assert.Single(reserva.HistorialReserva);
    }

    [Fact]
    public void El_codigo_toma_el_anio_de_la_fecha_de_Peru_y_no_de_UTC()
    {
        // 1 de enero de 2027 a las 04:30 UTC es todavía 31 de diciembre de 2026 en Perú (UTC-5).
        var momento = MomentoActual.Desde(new DateTimeOffset(2027, 1, 1, 4, 30, 0, TimeSpan.Zero));
        var reserva = Solicitar(fecha: new DateOnly(2027, 1, 5), momento: momento);

        reserva.AsignarCodigo(7, momento.FechaEnPeru);

        Assert.Equal("RES-2026-0007", reserva.CodigoReserva);
    }

    [Fact]
    public void El_codigo_no_se_asigna_dos_veces()
    {
        var reserva = Solicitar();
        reserva.AsignarCodigo(1, MomentoDeRegistro.FechaEnPeru);

        Assert.Throws<InvalidOperationException>(() => reserva.AsignarCodigo(2, MomentoDeRegistro.FechaEnPeru));
    }

    [Fact]
    public void VerificarDisponibilidad_usa_la_agenda_recibida_sin_volver_a_filtrar_por_ambiente()
    {
        var reserva = Solicitar();
        var otroAmbiente = NuevoAmbiente("Auditorio central");
        var aprobadaEnOtroAmbiente = Solicitar(
            ambiente: otroAmbiente,
            fecha: reserva.FechaReserva,
            momento: MomentoDeRegistro);
        Aprobar(aprobadaEnOtroAmbiente);

        // El contrato de la agenda es recibir solo las reservas del ambiente y la fecha: si llega otra, se detecta.
        Assert.Throws<ConflictoDeNegocioExcepcion>(() =>
            reserva.VerificarDisponibilidad(Agenda.De([aprobadaEnOtroAmbiente])));
    }

    [Fact]
    public void La_agenda_solo_cuenta_las_aprobadas()
    {
        var reserva = Solicitar();
        var pendiente = Solicitar(fecha: reserva.FechaReserva);

        reserva.VerificarDisponibilidad(Agenda.De([pendiente]));
    }

    [Fact]
    public void La_agenda_guarda_una_copia_de_las_reservas_recibidas()
    {
        var reserva = Solicitar();
        var fuente = new List<Reserva>();
        var agenda = Agenda.De(fuente);
        var aprobada = Solicitar(fecha: reserva.FechaReserva);
        Aprobar(aprobada);

        fuente.Add(aprobada);

        // La agenda se armó vacía: lo que se agregue después a la lista original no la cambia.
        reserva.VerificarDisponibilidad(agenda);
        Assert.Empty(agenda.Reservas);
        Assert.Throws<NotSupportedException>(() => ((IList<Reserva>)agenda.Reservas).Clear());
    }

    [Fact]
    public void Los_estados_deciden_las_transiciones_y_el_rol()
    {
        var reserva = Solicitar();
        var pendiente = FabricaDeEstadosDeReserva.Crear(EstadoReserva.Pendiente);

        Assert.Equal(EstadoReserva.Aprobada, pendiente.Aprobar(reserva, Administrador));
        Assert.Equal(EstadoReserva.Rechazada, pendiente.Rechazar(reserva, Administrador));
        Assert.Equal(EstadoReserva.Cancelada, pendiente.Cancelar(reserva, Solicitante));
        Assert.Throws<AccionNoPermitidaExcepcion>(() => pendiente.Aprobar(reserva, Solicitante));

        // RN-06: una reserva cancelada es un estado final.
        Assert.Throws<ConflictoDeNegocioExcepcion>(() =>
            FabricaDeEstadosDeReserva.Crear(EstadoReserva.Cancelada).Aprobar(reserva, Administrador));
    }
}
