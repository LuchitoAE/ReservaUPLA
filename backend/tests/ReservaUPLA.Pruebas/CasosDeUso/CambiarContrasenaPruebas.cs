using ReservaUPLA.Application.CasosDeUso.Autenticacion.IniciarSesion;
using ReservaUPLA.Application.CasosDeUso.Cuenta.CambiarContrasena;
using ReservaUPLA.Application.CasosDeUso.Usuarios.RegistrarUsuario;
using ReservaUPLA.Domain.Enumeraciones;
using ReservaUPLA.Domain.Excepciones;
using ReservaUPLA.Pruebas.Dobles;

namespace ReservaUPLA.Pruebas.CasosDeUso;

// RF-11 con RN-13: cada usuario cambia su contraseña escribiendo la actual; la nueva cumple las reglas y no repite la
// actual. Después ingresa con la nueva y ya no con la anterior.
public sealed class CambiarContrasenaPruebas
{
    private readonly RepositorioDeUsuariosEnMemoria _repositorio = new();
    private readonly ProtectorDeContrasenasFalso _protector_de_contrasenas = new();

    private async Task<Guid> RegistrarLuisAsync()
    {
        var luis = await new RegistrarUsuarioCasoDeUso(_repositorio, _protector_de_contrasenas).EjecutarAsync(new RegistrarUsuarioComando(
            "P00914K", "Luis Aquino Espinoza", "luis.aquino@upla.edu.pe", Roles_Usuario.Solicitante, "Reserva2026"));
        return luis.Id_Usuario;
    }

    private CambiarContrasenaCasoDeUso CasoDeUso() => new(_repositorio, _protector_de_contrasenas);

    private Task Ingresar(string contrasena) =>
        new IniciarSesionCasoDeUso(_repositorio, _protector_de_contrasenas).EjecutarAsync(new IniciarSesionComando("P00914K", contrasena));

    [Fact]
    public async Task Con_la_actual_correcta_cambia_y_se_ingresa_con_la_nueva()
    {
        var id_luis = await RegistrarLuisAsync();

        await CasoDeUso().EjecutarAsync(new CambiarContrasenaComando("Reserva2026", "Nueva2027"), id_luis);

        await Ingresar("Nueva2027");
        await Assert.ThrowsAsync<SesionNoValidaExcepcion>(() => Ingresar("Reserva2026"));
        Assert.Equal(1, _repositorio.Actualizaciones);
    }

    [Fact]
    public async Task Si_la_actual_no_coincide_no_cambia_nada()
    {
        var id_luis = await RegistrarLuisAsync();

        var error = await Assert.ThrowsAsync<DatosNoValidosExcepcion>(() =>
            CasoDeUso().EjecutarAsync(new CambiarContrasenaComando("OtraClave1", "Nueva2027"), id_luis));

        Assert.Equal(["La contraseña actual no es correcta."], error.Errores["Contrasena_Actual"]);
        await Ingresar("Reserva2026");
        Assert.Equal(0, _repositorio.Actualizaciones);
    }

    [Fact]
    public async Task La_nueva_cumple_RN13_y_no_repite_la_actual()
    {
        var id_luis = await RegistrarLuisAsync();

        var debil = await Assert.ThrowsAsync<DatosNoValidosExcepcion>(() =>
            CasoDeUso().EjecutarAsync(new CambiarContrasenaComando("Reserva2026", "corta"), id_luis));
        var repetida = await Assert.ThrowsAsync<DatosNoValidosExcepcion>(() =>
            CasoDeUso().EjecutarAsync(new CambiarContrasenaComando("Reserva2026", "Reserva2026"), id_luis));

        Assert.Contains("Contrasena_Nueva", debil.Errores.Keys);
        Assert.Equal(["Debe ser distinta de la actual."], repetida.Errores["Contrasena_Nueva"]);
    }

    [Fact]
    public async Task Junta_los_errores_de_los_dos_campos()
    {
        var id_luis = await RegistrarLuisAsync();

        var error = await Assert.ThrowsAsync<DatosNoValidosExcepcion>(() =>
            CasoDeUso().EjecutarAsync(new CambiarContrasenaComando("", ""), id_luis));

        Assert.Equal(["Escriba su contraseña actual."], error.Errores["Contrasena_Actual"]);
        Assert.Contains("Contrasena_Nueva", error.Errores.Keys);
    }

    [Fact]
    public async Task Sin_un_usuario_activo_en_la_sesion_responde_sesion_no_valida()
    {
        await Assert.ThrowsAsync<SesionNoValidaExcepcion>(() =>
            CasoDeUso().EjecutarAsync(new CambiarContrasenaComando("Reserva2026", "Nueva2027"), Guid.NewGuid()));
    }
}
