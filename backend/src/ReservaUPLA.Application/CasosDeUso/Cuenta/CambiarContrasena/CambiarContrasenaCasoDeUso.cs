using ReservaUPLA.Application.Interfaces;
using ReservaUPLA.Domain.Excepciones;

namespace ReservaUPLA.Application.CasosDeUso.Cuenta.CambiarContrasena;

// RF-11: el usuario de la sesión cambia su propia contraseña. La entidad revisa la actual y aplica RN-13 a la nueva;
// solo si todo está bien, se guarda. Nadie cambia la contraseña de otro por esta vía.
public sealed class CambiarContrasenaCasoDeUso
{
    private readonly IRepositorioDeUsuarios _repositorio_de_usuarios;
    private readonly IProtectorDeContrasenas _protector_de_contrasenas;

    public CambiarContrasenaCasoDeUso(IRepositorioDeUsuarios repositorio_de_usuarios, IProtectorDeContrasenas protector_de_contrasenas)
    {
        _repositorio_de_usuarios = repositorio_de_usuarios;
        _protector_de_contrasenas = protector_de_contrasenas;
    }

    public async Task EjecutarAsync(CambiarContrasenaComando comando, Guid id_usuario_sesion, CancellationToken cancelacion = default)
    {
        var usuario = await _repositorio_de_usuarios.ObtenerPorIdAsync(id_usuario_sesion, cancelacion);
        if (usuario is null || !usuario.Activo_Usuario)
        {
            throw new SesionNoValidaExcepcion("Su sesión ya no es válida. Vuelva a ingresar para cambiar su contraseña.");
        }

        usuario.CambiarContrasena(
            comando.Contrasena_Actual, comando.Contrasena_Nueva, _protector_de_contrasenas.Verificar, _protector_de_contrasenas.Cifrar);

        await _repositorio_de_usuarios.ActualizarAsync(usuario, cancelacion);
    }
}
