namespace ReservaUPLA.Domain.Excepciones;

// Datos que no cumplen las reglas, con un mensaje por campo para mostrarlo junto a él.
// La API la traduce a 400 con la lista de errores (ValidationProblemDetails).
public sealed class DatosNoValidosExcepcion : Exception
{
    public DatosNoValidosExcepcion(IReadOnlyDictionary<string, string[]> errores)
        : base("Hay datos que no cumplen las reglas.")
    {
        Errores = errores;
    }

    // Un solo campo con un solo mensaje (por ejemplo, un correo que ya existe).
    public DatosNoValidosExcepcion(string campo, string mensaje)
        : this(new Dictionary<string, string[]> { [campo] = [mensaje] })
    {
    }

    // Clave: nombre de la propiedad de la entidad (Correo_Usuario). Valor: los mensajes de ese campo.
    public IReadOnlyDictionary<string, string[]> Errores { get; }
}
