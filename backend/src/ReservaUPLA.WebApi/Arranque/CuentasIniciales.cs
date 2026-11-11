using ReservaUPLA.Application.CasosDeUso.Usuarios.CuentasIniciales;
using ReservaUPLA.Domain.Enumeraciones;
using ReservaUPLA.Domain.Excepciones;

namespace ReservaUPLA.WebApi.Arranque;

// Al arrancar la API crea las cuentas que no pueden registrarse desde la aplicación (no hay registro propio, RN-07):
// el primer administrador (RF-15) y, solo en desarrollo, una cuenta de prueba por rol (RNF-22). Los datos vienen de
// los secretos de usuario («PrimerAdministrador» y «CuentasDePrueba»), nunca del repositorio. Si algo falla, lo
// escribe en el registro de la API y sigue: la API arranca igual.
public static class CuentasIniciales
{
    public static async Task CrearCuentasInicialesAsync(this WebApplication aplicacion)
    {
        using var alcance = aplicacion.Services.CreateScope();
        var servicios = alcance.ServiceProvider;
        var registro = servicios.GetRequiredService<ILoggerFactory>().CreateLogger("ReservaUPLA.Arranque");

        var primerAdministrador = LeerCuenta(aplicacion.Configuration.GetSection("PrimerAdministrador"));
        await IntentarAsync(registro, "el primer administrador", async () =>
        {
            var resultado = await servicios.GetRequiredService<CrearPrimerAdministradorCasoDeUso>()
                .EjecutarAsync(primerAdministrador);
            if (resultado == ResultadoDeCuentaInicial.YaExistia)
            {
                registro.LogInformation("Primer administrador: ya hay un administrador activo; no se crea otro.");
                return;
            }

            Informar(registro, "Primer administrador", primerAdministrador?.CodigoUsuario, resultado);
        });

        if (!aplicacion.Environment.IsDevelopment())
        {
            return;
        }

        var cuentasDePrueba = aplicacion.Configuration.GetSection("CuentasDePrueba").GetChildren()
            .Select(LeerCuenta)
            .OfType<CuentaInicial>()
            .ToList();
        await IntentarAsync(registro, "las cuentas de prueba", async () =>
        {
            var resultados = await servicios.GetRequiredService<CrearCuentasDePruebaCasoDeUso>()
                .EjecutarAsync(cuentasDePrueba);
            foreach (var (codigo, resultado) in resultados)
            {
                Informar(registro, "Cuenta de prueba", codigo, resultado);
            }
        });
    }

    // Las claves de los secretos de usuario conservan el nombre con guion bajo; se acepta también el nombre nuevo
    // de la propiedad para no romper una configuración ya existente.
    private static CuentaInicial? LeerCuenta(IConfigurationSection seccion) =>
        seccion.Exists()
            ? new CuentaInicial(
                Valor(seccion, "Codigo_Usuario", "CodigoUsuario"),
                Valor(seccion, "Nombre_Completo_Usuario", "NombreCompletoUsuario"),
                Valor(seccion, "Correo_Usuario", "CorreoUsuario"),
                Enum.TryParse<RolUsuario>(Valor(seccion, "Rol_Usuario", "RolUsuario"), ignoreCase: true, out var rol)
                    ? rol
                    : default,
                Valor(seccion, "Contrasena_Usuario", "ContrasenaUsuario"))
            : null;

    private static string? Valor(IConfigurationSection seccion, params string[] claves) =>
        claves.Select(clave => seccion[clave]).FirstOrDefault(valor => !string.IsNullOrEmpty(valor));

    private static async Task IntentarAsync(ILogger registro, string que, Func<Task> accion)
    {
        try
        {
            await accion();
        }
        catch (DatosNoValidosExcepcion error)
        {
            // Por ejemplo, una contraseña configurada que no cumple RN-13: se dice qué campo falló, nunca su valor.
            registro.LogWarning("No se pudo crear {Que}: {Errores}", que,
                string.Join(" ", error.Errores.Select(campo => $"{campo.Key}: {string.Join(" ", campo.Value)}")));
        }
    }

    private static void Informar(ILogger registro, string que, string? codigo, ResultadoDeCuentaInicial resultado)
    {
        switch (resultado)
        {
            case ResultadoDeCuentaInicial.Creada:
                registro.LogInformation("{Que} {Codigo}: se creó.", que, codigo);
                break;
            case ResultadoDeCuentaInicial.YaExistia:
                registro.LogInformation("{Que} {Codigo}: ya existe; no se cambia.", que, codigo);
                break;
            default:
                registro.LogWarning("{Que}: faltan datos en los secretos de usuario; no se crea.", que);
                break;
        }
    }
}
