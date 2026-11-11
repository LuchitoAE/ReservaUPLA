using System.Text.Json;
using System.Text.Json.Serialization;

namespace ReservaUPLA.WebApi.Json;

// Un solo lugar para cómo viaja el JSON: claves en snake_case (IdAmbiente -> id_ambiente), enums como texto y horas
// «HH:mm». El nombre de la propiedad en C# ya coincide con el de la columna, y la política le da el nombre del JSON.
public static class ConfiguracionDeJson
{
    public static void Aplicar(JsonSerializerOptions opciones)
    {
        opciones.PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower;
        opciones.Converters.Add(new JsonStringEnumConverter(namingPolicy: null, allowIntegerValues: false));
        opciones.Converters.Add(new ConvertidorHora());
    }
}
