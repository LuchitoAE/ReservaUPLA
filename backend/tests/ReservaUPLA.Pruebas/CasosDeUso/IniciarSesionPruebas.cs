using ReservaUPLA.Application.UseCases.Autenticacion.IniciarSesion;
using ReservaUPLA.Application.UseCases.Usuarios.RegistrarUsuario;
using ReservaUPLA.Domain.Enums;
using ReservaUPLA.Domain.Exceptions;
using ReservaUPLA.Pruebas.Dobles;

namespace ReservaUPLA.Pruebas.CasosDeUso;

// RF-09: se ingresa con el código y la contraseña; si algo no coincide, un solo mensaje que no dice qué falló.
public sealed class IniciarSesionPruebas
{
    private const string Mensaje = "El código o la contraseña no son correctos. Revíselos e inténtelo de nuevo.";

    private readonly RepositorioDeUsuariosEnMemoria _repositorio = new();
    private readonly HasherDeContrasenasFalso _hasher = new();

    private async Task RegistrarLuisAsync()
    {
        await new RegistrarUsuarioUseCase(_repositorio, _hasher).EjecutarAsync(new RegistrarUsuarioCommand(
            "P00914K", "Luis Aquino Espinoza", "luis.aquino@upla.edu.pe", Roles_Usuario.Solicitante, "Reserva2026"));
    }

    private IniciarSesionUseCase CasoDeUso() => new(_repositorio, _hasher);

    [Fact]
    public async Task Ingresa_con_el_codigo_aunque_lo_escriba_en_minusculas()
    {
        await RegistrarLuisAsync();

        var usuario = await CasoDeUso().EjecutarAsync(new IniciarSesionCommand(" p00914k", "Reserva2026"));

        Assert.Equal("P00914K", usuario.Codigo_Usuario);
    }

    [Theory]
    [InlineData("P00000X", "Reserva2026")]
    [InlineData("P00914K", "OtraClave1")]
    public async Task Si_no_coincide_responde_un_solo_mensaje(string codigo, string contrasena)
    {
        await RegistrarLuisAsync();

        var error = await Assert.ThrowsAsync<SesionNoValidaException>(() =>
            CasoDeUso().EjecutarAsync(new IniciarSesionCommand(codigo, contrasena)));

        Assert.Equal(Mensaje, error.Message);
    }

    [Fact]
    public async Task Pide_el_codigo_y_la_contrasena_si_faltan()
    {
        var error = await Assert.ThrowsAsync<DatosNoValidosException>(() =>
            CasoDeUso().EjecutarAsync(new IniciarSesionCommand("", "")));

        Assert.Equal(["Escriba su código."], error.Errores["Codigo_Usuario"]);
        Assert.Equal(["Escriba su contraseña."], error.Errores["Contrasena_Usuario"]);
    }
}
