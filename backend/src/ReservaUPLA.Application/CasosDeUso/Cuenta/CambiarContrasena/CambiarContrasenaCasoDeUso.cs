using ReservaUPLA.Application.Interfaces;
using ReservaUPLA.Domain.Excepciones;

namespace ReservaUPLA.Application.CasosDeUso.Cuenta.CambiarContrasena;

// RF-11: el usuario de la sesión cambia su propia contraseña. La entidad revisa la actual y aplica RN-13 a la nueva;
// solo si todo está bien, se guarda. Nadie cambia la contraseña de otro por esta vía.
public sealed class CambiarContrasenaCasoDeUso
{
    private readonly IRepositorioDeUsuarios _repositorioDeUsuarios;
    private readonly IProtectorDeContrasenas _protectorDeContrasenas;

    public CambiarContrasenaCasoDeUso(
        IRepositorioDeUsuarios repositorioDeUsuarios, IProtectorDeContrasenas protectorDeContrasenas)
    {
        _repositorioDeUsuarios = repositorioDeUsuarios;
        _protectorDeContrasenas = protectorDeContrasenas;
    }

    public async Task EjecutarAsync(
        CambiarContrasenaComando comando, Guid idUsuarioSesion, CancellationToken cancelacion = default)
    {
        var usuario = await _repositorioDeUsuarios.ObtenerPorIdAsync(idUsuarioSesion, cancelacion);
        if (usuario is null || !usuario.ActivoUsuario)
        {
            throw new SesionNoValidaExcepcion(
                "Su sesión ya no es válida. Vuelva a ingresar para cambiar su contraseña.");
        }

        usuario.CambiarContrasena(
            comando.ContrasenaActual,
            comando.ContrasenaNueva,
            _protectorDeContrasenas.Verificar,
            _protectorDeContrasenas.Cifrar);

        await _repositorioDeUsuarios.ActualizarAsync(usuario, cancelacion);
    }
}
