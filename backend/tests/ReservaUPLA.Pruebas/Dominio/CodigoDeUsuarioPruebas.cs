using ReservaUPLA.Domain.Common;
using ReservaUPLA.Domain.Exceptions;

namespace ReservaUPLA.Pruebas.Dominio;

// RN-14: el código tiene 7 letras o dígitos y se guarda en mayúsculas, sin espacios.
public sealed class CodigoDeUsuarioPruebas
{
    [Theory]
    [InlineData(" p00914k ", "P00914K")]
    [InlineData("admin01", "ADMIN01")]
    [InlineData("P 00914 K", "P00914K")]
    public void Crear_quita_espacios_y_pasa_a_mayusculas(string escrito, string guardado)
    {
        Assert.Equal(guardado, CodigoDeUsuario.Crear(escrito).Valor);
    }

    [Theory]
    [InlineData("P00914K")]
    [InlineData("ADMIN01")]
    [InlineData("SOLIC01")]
    [InlineData("1234567")]
    public void Acepta_siete_letras_o_digitos(string codigo)
    {
        Assert.Null(CodigoDeUsuario.Revisar(codigo));
    }

    [Theory]
    [InlineData("", "Escriba el código del usuario.")]
    [InlineData("P0091", "El código debe tener 7 letras o números, por ejemplo P00914K.")]
    [InlineData("P00914KX", "El código debe tener 7 letras o números, por ejemplo P00914K.")]
    [InlineData("P0091-K", "El código debe tener 7 letras o números, por ejemplo P00914K.")]
    [InlineData("PÑ0914K", "El código debe tener 7 letras o números, por ejemplo P00914K.")]
    public void Rechaza_lo_que_no_cumple_con_un_mensaje_claro(string codigo, string mensaje)
    {
        Assert.Equal(mensaje, CodigoDeUsuario.Revisar(CodigoDeUsuario.Normalizar(codigo)));
    }

    [Fact]
    public void Crear_lanza_el_error_en_el_campo_del_codigo()
    {
        var error = Assert.Throws<DatosNoValidosException>(() => CodigoDeUsuario.Crear("abc"));

        Assert.True(error.Errores.ContainsKey("Codigo_Usuario"));
    }
}
