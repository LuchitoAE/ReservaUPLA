using ReservaUPLA.Domain.Comun;
using ReservaUPLA.Domain.Entidades;
using ReservaUPLA.Domain.Enumeraciones;
using ReservaUPLA.Domain.Excepciones;

namespace ReservaUPLA.Pruebas.Dominio;

// RF-06: cada reserva guarda su historial de estados, con la fecha y quién hizo cada cambio. Lo escribe la propia
// reserva al registrarse y en cada cambio de estado; un cambio que no se permite no deja rastro.
public sealed class ReservaPruebas
{
    private static readonly Func<string, ContrasenaCifrada> Cifrar = _ => new ContrasenaCifrada([1], [2]);
    private static readonly DateTime Registro = new(2026, 11, 9, 15, 0, 0, DateTimeKind.Utc);
    private static readonly DateTime Aprobacion = new(2026, 11, 10, 14, 30, 0, DateTimeKind.Utc);
    private static readonly DateTime Cancelacion = new(2026, 11, 11, 9, 15, 0, DateTimeKind.Utc);

    private static Usuario NuevoUsuario(string codigo, Roles_Usuario rol) =>
        Usuario.Registrar(codigo, "Persona de Prueba", $"{codigo.ToLowerInvariant()}@upla.edu.pe", rol, "Reserva2026",
            codigo_ya_registrado: false, correo_ya_registrado: false, Cifrar);

    private static readonly Usuario Solicitante = NuevoUsuario("P00914K", Roles_Usuario.Solicitante);
    private static readonly Usuario Administrador = NuevoUsuario("ADMIN01", Roles_Usuario.Administrador);

    private static Reserva Solicitar()
    {
        var ambiente = Ambiente.Registrar("Laboratorio de cómputo 1", Tipos_Ambiente.LaboratorioDeComputo, 30, "Pabellón B, segundo piso",
            Estados_Ambiente.Disponible, responsable_indicado: false, responsable: null, nombre_ya_registrado: false);
        var ahora_en_peru = new DateTime(2026, 11, 9, 10, 0, 0);

        return Reserva.Solicitar(Solicitante, ambiente, new DateOnly(2026, 11, 18), new TimeOnly(14, 0), new TimeOnly(16, 0),
            "Sesión de práctica para el examen final.", ahora_en_peru, Registro);
    }

    [Fact]
    public void Solicitar_registra_la_primera_entrada_del_historial()
    {
        var reserva = Solicitar();

        var entrada = Assert.Single(reserva.Historial_Reserva);
        Assert.Equal(Estados_Reserva.Pendiente, entrada.Estado_Historial);
        Assert.Equal(Solicitante.Id_Usuario, entrada.Id_Usuario);
        Assert.Equal(Registro, entrada.Fecha_Historial);
        Assert.Equal(reserva.Id_Reserva, entrada.Id_Reserva);
    }

    [Fact]
    public void CambiarEstado_agrega_una_entrada_con_el_estado_quien_y_cuando()
    {
        var reserva = Solicitar();

        reserva.CambiarEstado(Estados_Reserva.Aprobada, Administrador, [], Aprobacion);

        var ultima = reserva.Historial_Reserva[^1];
        Assert.Equal(2, reserva.Historial_Reserva.Count);
        Assert.Equal(Estados_Reserva.Aprobada, ultima.Estado_Historial);
        Assert.Equal(Administrador.Id_Usuario, ultima.Id_Usuario);
        Assert.Equal(Aprobacion, ultima.Fecha_Historial);
    }

    [Fact]
    public void Un_cambio_que_no_se_permite_no_deja_entrada()
    {
        var reserva = Solicitar();

        // RN-05: solo el administrador aprueba.
        Assert.Throws<AccionNoPermitidaExcepcion>(() => reserva.CambiarEstado(Estados_Reserva.Aprobada, Solicitante, [], Aprobacion));

        Assert.Single(reserva.Historial_Reserva);
        Assert.Equal(Estados_Reserva.Pendiente, reserva.Estado_Reserva);
    }

    [Fact]
    public void El_historial_guarda_los_cambios_en_orden()
    {
        var reserva = Solicitar();

        reserva.CambiarEstado(Estados_Reserva.Aprobada, Administrador, [], Aprobacion);
        reserva.CambiarEstado(Estados_Reserva.Cancelada, Solicitante, [], Cancelacion);

        Assert.Equal(
            [Estados_Reserva.Pendiente, Estados_Reserva.Aprobada, Estados_Reserva.Cancelada],
            reserva.Historial_Reserva.Select(entrada => entrada.Estado_Historial));
        Assert.Equal([Registro, Aprobacion, Cancelacion], reserva.Historial_Reserva.Select(entrada => entrada.Fecha_Historial));
        Assert.Equal(Solicitante.Id_Usuario, reserva.Historial_Reserva[^1].Id_Usuario);
    }
}
