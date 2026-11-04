using ReservaUPLA.Application.DTOs;
using ReservaUPLA.Application.Interfaces;
using ReservaUPLA.Domain.Common;
using ReservaUPLA.Domain.Exceptions;

namespace ReservaUPLA.Application.UseCases.Autenticacion.IniciarSesion;

// Comprueba el correo y la contraseña. Si no coinciden, o el usuario está inactivo, responde lo mismo en todos los
// casos: no se revela qué dato falló ni si el correo existe.
public sealed class IniciarSesionUseCase
{
    private const string Mensaje_Generico = "El correo o la contraseña no son correctos. Revíselos e inténtelo de nuevo.";

    private readonly IUsuarioRepository _usuario_repository;
    private readonly IHasherDeContrasenas _hasher;

    public IniciarSesionUseCase(IUsuarioRepository usuario_repository, IHasherDeContrasenas hasher)
    {
        _usuario_repository = usuario_repository;
        _hasher = hasher;
    }

    public async Task<UsuarioDto> EjecutarAsync(IniciarSesionCommand comando, CancellationToken cancelacion = default)
    {
        var errores = new ErroresDeValidacion();
        var correo = Texto.NormalizarCorreo(comando.Correo_Usuario);
        if (correo.Length == 0)
        {
            errores.Agregar("Correo_Usuario", "Escriba su correo.");
        }

        if (string.IsNullOrEmpty(comando.Contrasena_Usuario))
        {
            errores.Agregar("Contrasena_Usuario", "Escriba su contraseña.");
        }

        errores.LanzarSiHay();

        var usuario = await _usuario_repository.ObtenerPorCorreoAsync(correo, cancelacion);
        var valida = usuario is not null
            && usuario.Activo_Usuario
            && _hasher.Verificar(comando.Contrasena_Usuario!, new ContrasenaCifrada(usuario.Sal_Contrasena_Usuario, usuario.Hash_Contrasena_Usuario));

        return valida ? UsuarioDto.DesdeEntidad(usuario!) : throw new SesionNoValidaException(Mensaje_Generico);
    }
}
