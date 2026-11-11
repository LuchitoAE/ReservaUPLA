using ReservaUPLA.Domain.Excepciones;

namespace ReservaUPLA.Domain.Comun;

// Junta los errores de todos los campos: el usuario los ve todos de una vez, no uno por intento.
// La usan las tres entidades; cada una declara sus reglas y esta clase las aplica igual.
public sealed class ErroresDeValidacion
{
    private readonly Dictionary<string, List<string>> _errores = [];

    public bool TieneErrorEn(string campo) => _errores.ContainsKey(campo);

    public void Agregar(string campo, string mensaje)
    {
        if (!_errores.TryGetValue(campo, out var mensajes))
        {
            mensajes = [];
            _errores[campo] = mensajes;
        }

        mensajes.Add(mensaje);
    }

    // Valida un texto ya normalizado con su regla y devuelve el mismo texto, para asignarlo si todo está bien.
    public string ValidarTexto(string campo, string texto, ReglaDeTexto regla, bool exigirContenidoUtil = true)
    {
        if (texto.Length == 0)
        {
            Agregar(campo, regla.MensajeObligatorio);
        }
        else if (texto.Length < regla.Minimo)
        {
            Agregar(campo, $"{regla.Nombre} debe tener al menos {regla.Minimo} caracteres (tiene {texto.Length}).");
        }
        else if (texto.Length > regla.Maximo)
        {
            Agregar(campo, $"{regla.Nombre} no puede superar los {regla.Maximo} caracteres (tiene {texto.Length}).");
        }
        else if (exigirContenidoUtil && !Texto.TieneContenidoUtil(texto))
        {
            Agregar(campo, $"{regla.Nombre} debe escribirse con palabras, no con caracteres repetidos.");
        }

        return texto;
    }

    // Valida que un valor de una lista cerrada (enum) sea uno de los permitidos.
    public void ValidarOpcion<TEnum>(string campo, TEnum valor, string mensaje) where TEnum : struct, Enum
    {
        if (!Enum.IsDefined(valor))
        {
            Agregar(campo, mensaje);
        }
    }

    public void LanzarSiHay()
    {
        if (_errores.Count > 0)
        {
            throw new DatosNoValidosExcepcion(_errores.ToDictionary(error => error.Key, error => error.Value.ToArray()));
        }
    }
}
