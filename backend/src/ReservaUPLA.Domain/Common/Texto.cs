using System.Text.RegularExpressions;

namespace ReservaUPLA.Domain.Common;

// Normaliza los textos ANTES de validarlos: así la regla se aplica a lo que de verdad se guarda.
// El frontend aplica la misma regla en src/utils/normalizarTexto.js.
public static partial class Texto
{
    // Textos de un renglón (nombres, ubicación): sin espacios al inicio ni al final y uno solo entre palabras.
    public static string NormalizarLinea(string? texto) =>
        EspaciosSeguidos().Replace((texto ?? string.Empty).Trim(), " ");

    // Textos de varios renglones (el motivo): igual en cada renglón, pero conserva los saltos de línea
    // y deja como máximo una línea en blanco seguida.
    public static string NormalizarParrafos(string? texto)
    {
        var renglones = (texto ?? string.Empty)
            .Replace("\r\n", "\n")
            .Replace('\r', '\n')
            .Split('\n')
            .Select(NormalizarLinea);

        return LineasEnBlancoSeguidas().Replace(string.Join('\n', renglones), "\n\n").Trim();
    }

    // El correo se guarda sin espacios y en minúsculas: «Ana.Rojas@UPLA.edu.pe » y «ana.rojas@upla.edu.pe»
    // son el mismo usuario.
    public static string NormalizarCorreo(string? correo) => (correo ?? string.Empty).Trim().ToLowerInvariant();

    // Formato básico de correo: algo@dominio.ext, sin espacios.
    public static bool EsCorreo(string correo) => FormatoDeCorreo().IsMatch(correo);

    // Un texto con contenido útil tiene letras y al menos tres caracteres distintos:
    // rechaza «aaaaaaaaaa», «abababab» o «1234567890».
    public static bool TieneContenidoUtil(string texto) =>
        texto.Any(char.IsLetter)
        && texto.Where(char.IsLetterOrDigit).Select(char.ToLowerInvariant).Distinct().Count() >= 3;

    [GeneratedRegex(@"\s+")]
    private static partial Regex EspaciosSeguidos();

    [GeneratedRegex(@"\n{3,}")]
    private static partial Regex LineasEnBlancoSeguidas();

    [GeneratedRegex(@"^[^\s@]+@[^\s@]+\.[^\s@]{2,}$")]
    private static partial Regex FormatoDeCorreo();
}
