using ReservaUPLA.Application.UseCases.Usuarios.CuentasIniciales;
using ReservaUPLA.Domain.Excepciones;

namespace ReservaUPLA.WebApi.Arranque;

// Al arrancar la API crea las cuentas que no pueden registrarse desde la aplicación (no hay registro propio, RN-07):
// el primer administrador (RF-15) y, solo en desarrollo, una cuenta de prueba por rol (RNF-22). Los datos vienen de
// los secretos de usuario («PrimerAdministrador» y «CuentasDePrueba»), nunca del repositorio. Si algo falla, lo
// escribe en el registro de la API y sigue: la API arranca igual.
public static class CuentasIniciales
{
    public static async Task CrearCuentasInicialesAsync(this WebApplication app)
    {
        using var alcance = app.Services.CreateScope();
        var servicios = alcance.ServiceProvider;
        var registro = servicios.GetRequiredService<ILoggerFactory>().CreateLogger("ReservaUPLA.Arranque");

        var primer_administrador = app.Configuration.GetSection("PrimerAdministrador").Get<CuentaInicial>();
        await IntentarAsync(registro, "el primer administrador", async () =>
        {
            var resultado = await servicios.GetRequiredService<CrearPrimerAdministradorUseCase>().EjecutarAsync(primer_administrador);
            if (resultado == ResultadoDeCuentaInicial.YaExistia)
            {
                registro.LogInformation("Primer administrador: ya hay un administrador activo; no se crea otro.");
                return;
            }

            Informar(registro, "Primer administrador", primer_administrador?.Codigo_Usuario, resultado);
        });

        if (!app.Environment.IsDevelopment())
        {
            return;
        }

        var cuentas_de_prueba = app.Configuration.GetSection("CuentasDePrueba").Get<CuentaInicial[]>() ?? [];
        await IntentarAsync(registro, "las cuentas de prueba", async () =>
        {
            var resultados = await servicios.GetRequiredService<CrearCuentasDePruebaUseCase>().EjecutarAsync(cuentas_de_prueba);
            foreach (var (codigo, resultado) in resultados)
            {
                Informar(registro, "Cuenta de prueba", codigo, resultado);
            }
        });
    }

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
