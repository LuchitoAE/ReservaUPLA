using ReservaUPLA.Domain.Comun;
using ReservaUPLA.Domain.Entidades;
using ReservaUPLA.Domain.Enumeraciones;
using ReservaUPLA.Domain.Excepciones;

namespace ReservaUPLA.Pruebas.Dominio;

// RF-01 con RN-13 y RN-14: el usuario se registra con su código, que no puede repetirse.
public sealed class UsuarioPruebas
{
    private static readonly Func<string, ContrasenaCifrada> Cifrar = _ => new ContrasenaCifrada([1], [2]);

    private static Usuario Registrar(string codigo = "p00914k", bool codigoYaRegistrado = false) =>
        Usuario.Registrar(new DatosDeRegistroDeUsuario(
            codigo, "Luis Aquino Espinoza", "luis.aquino@upla.edu.pe", RolUsuario.Solicitante, "Reserva2026",
            codigoYaRegistrado, CorreoYaRegistrado: false, Cifrar));

    [Fact]
    public void Registrar_guarda_el_codigo_normalizado()
    {
        var usuario = Registrar();

        Assert.Equal("P00914K", usuario.CodigoUsuario);
        Assert.True(usuario.ActivoUsuario);
    }

    [Fact]
    public void Registrar_rechaza_un_codigo_que_ya_existe()
    {
        var error = Assert.Throws<DatosNoValidosExcepcion>(() => Registrar(codigoYaRegistrado: true));

        Assert.Equal(["Este código ya existe."], error.Errores["CodigoUsuario"]);
    }

    [Fact]
    public void Registrar_junta_el_error_del_codigo_con_los_demas()
    {
        var error = Assert.Throws<DatosNoValidosExcepcion>(() =>
            Usuario.Registrar(new DatosDeRegistroDeUsuario(
                "", "Luis", "correo", RolUsuario.Solicitante, "corta",
                CodigoYaRegistrado: false, CorreoYaRegistrado: false, Cifrar)));

        Assert.Contains("CodigoUsuario", error.Errores.Keys);
        Assert.Contains("NombreCompletoUsuario", error.Errores.Keys);
        Assert.Contains("CorreoUsuario", error.Errores.Keys);
        Assert.Contains("ContrasenaUsuario", error.Errores.Keys);
    }
}
