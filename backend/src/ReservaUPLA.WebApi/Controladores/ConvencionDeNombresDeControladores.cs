using Microsoft.AspNetCore.Mvc.ApplicationModels;

namespace ReservaUPLA.WebApi.Controladores;

// Los controladores se llaman «…Controlador» (ESTANDARES.md), pero ASP.NET solo quita el sufijo «Controller» al tomar
// el nombre del controlador. Esta convención quita «Controlador»: Swagger los agrupa como Reservas, Usuarios o Panel.
// Las rutas no dependen de esto: cada controlador escribe la suya con [Route].
public sealed class ConvencionDeNombresDeControladores : IControllerModelConvention
{
    private const string Sufijo = "Controlador";

    public void Apply(ControllerModel controlador)
    {
        if (controlador.ControllerName.EndsWith(Sufijo, StringComparison.Ordinal))
        {
            controlador.ControllerName = controlador.ControllerName[..^Sufijo.Length];
        }
    }
}
