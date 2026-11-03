using System.Text.Json;

namespace ReservaUPLA.WebApi.Json;

// Las propiedades con guion bajo ya llevan el nombre de su entidad: basta pasarlas a minúsculas
// (Id_Ambiente -> id_ambiente), y el dato se llama igual en el código, en la base y en la API.
// Las demás siguen la convención de JSON, camelCase: Success -> success, y el traceId de los errores no cambia.
internal sealed class Politica_Nombres_Json : JsonNamingPolicy
{
    public override string ConvertName(string nombre) =>
        nombre.Contains('_') ? nombre.ToLowerInvariant() : CamelCase.ConvertName(nombre);
}
