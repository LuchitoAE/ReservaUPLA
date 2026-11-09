using System.Text.RegularExpressions;
using ReservaUPLA.Domain.Exceptions;

namespace ReservaUPLA.Domain.Common;

// Objeto de valor del código con el que cada persona ingresa (RN-14): 7 letras (A-Z) o dígitos, sin espacios y en
// mayúsculas. Admite los códigos que entrega la universidad (P00914K) y las cuentas de prueba (ADMIN01).
public sealed partial record CodigoDeUsuario
{
    public const int Longitud = 7;

    private CodigoDeUsuario(string valor)
    {
        Valor = valor;
    }

    public string Valor { get; }

    // « p00914k » y «P00914K» son el mismo código: se quitan los espacios y se pasa a mayúsculas.
    public static string Normalizar(string? texto) =>
        EspaciosEnCualquierParte().Replace(texto ?? string.Empty, string.Empty).ToUpperInvariant();

    // Revisa un código ya normalizado. Devuelve qué falta, o null si cumple.
    public static string? Revisar(string codigo_normalizado)
    {
        if (codigo_normalizado.Length == 0)
        {
            return "Escriba el código del usuario.";
        }

        return FormatoDeCodigo().IsMatch(codigo_normalizado)
            ? null
            : $"El código debe tener {Longitud} letras o números, por ejemplo P00914K.";
    }

    public static CodigoDeUsuario Crear(string? texto)
    {
        var normalizado = Normalizar(texto);
        var mensaje = Revisar(normalizado);

        return mensaje is null ? new CodigoDeUsuario(normalizado) : throw new DatosNoValidosException("Codigo_Usuario", mensaje);
    }

    public override string ToString() => Valor;

    [GeneratedRegex(@"\s+")]
    private static partial Regex EspaciosEnCualquierParte();

    [GeneratedRegex("^[A-Z0-9]{7}$")]
    private static partial Regex FormatoDeCodigo();
}
