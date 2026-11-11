using System.Globalization;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace ReservaUPLA.WebApi.Json;

// Las horas viajan como «HH:mm» (09:30), igual que las muestra un <input type="time">. Al leer también se acepta
// «HH:mm:ss». Sin este convertidor, .NET escribe «09:30:00» y rechaza «09:30» con un mensaje en inglés.
internal sealed class ConvertidorHora : JsonConverter<TimeOnly>
{
    private static readonly string[] Formatos = ["HH:mm", "HH:mm:ss"];

    public override TimeOnly Read(ref Utf8JsonReader lector, Type tipo, JsonSerializerOptions opciones)
    {
        var texto = lector.GetString();

        return TimeOnly.TryParseExact(texto, Formatos, CultureInfo.InvariantCulture, DateTimeStyles.None, out var hora)
            ? hora
            : throw new JsonException();   // sin mensaje: .NET arma el suyo con el campo que falló
    }

    public override void Write(Utf8JsonWriter escritor, TimeOnly hora, JsonSerializerOptions opciones) =>
        escritor.WriteStringValue(hora.ToString("HH:mm", CultureInfo.InvariantCulture));
}
