using ReservaUPLA.Domain.Common;
using ReservaUPLA.Domain.Entities;
using ReservaUPLA.Domain.Enums;
using ReservaUPLA.Domain.Exceptions;

namespace ReservaUPLA.Pruebas.Dominio;

// RF-01 con RN-13 y RN-14: el usuario se registra con su código, que no puede repetirse.
public sealed class UsuarioPruebas
{
    private static readonly Func<string, ContrasenaCifrada> Cifrar = texto => new ContrasenaCifrada([1], [2]);

    private static Usuario Registrar(string codigo = "p00914k", bool codigo_ya_registrado = false) =>
        Usuario.Registrar(codigo, "Luis Aquino Espinoza", "luis.aquino@upla.edu.pe", Roles_Usuario.Solicitante, "Reserva2026",
            codigo_ya_registrado, correo_ya_registrado: false, Cifrar);

    [Fact]
    public void Registrar_guarda_el_codigo_normalizado()
    {
        var usuario = Registrar();

        Assert.Equal("P00914K", usuario.Codigo_Usuario);
        Assert.True(usuario.Activo_Usuario);
    }

    [Fact]
    public void Registrar_rechaza_un_codigo_que_ya_existe()
    {
        var error = Assert.Throws<DatosNoValidosException>(() => Registrar(codigo_ya_registrado: true));

        Assert.Equal(["Este código ya existe."], error.Errores["Codigo_Usuario"]);
    }

    [Fact]
    public void Registrar_junta_el_error_del_codigo_con_los_demas()
    {
        var error = Assert.Throws<DatosNoValidosException>(() =>
            Usuario.Registrar("", "Luis", "correo", Roles_Usuario.Solicitante, "corta", false, false, Cifrar));

        Assert.Contains("Codigo_Usuario", error.Errores.Keys);
        Assert.Contains("Nombre_Completo_Usuario", error.Errores.Keys);
        Assert.Contains("Correo_Usuario", error.Errores.Keys);
        Assert.Contains("Contrasena_Usuario", error.Errores.Keys);
    }
}
