using ReservaUPLA.Application.DTOs;
using ReservaUPLA.Application.Interfaces;
using ReservaUPLA.Domain.Comun;
using ReservaUPLA.Domain.Entidades;

namespace ReservaUPLA.Application.UseCases.Usuarios.RegistrarUsuario;

// RF-01: averigua si el código o el correo ya existen, deja que la entidad valide y guarda con la contraseña cifrada.
// Es la única forma de crear usuarios: la usan el administrador y las cuentas iniciales (no hay registro propio, RN-07).
public sealed class RegistrarUsuarioUseCase
{
    private readonly IUsuarioRepository _usuario_repository;
    private readonly IHasherDeContrasenas _hasher;

    public RegistrarUsuarioUseCase(IUsuarioRepository usuario_repository, IHasherDeContrasenas hasher)
    {
        _usuario_repository = usuario_repository;
        _hasher = hasher;
    }

    public async Task<UsuarioDto> EjecutarAsync(RegistrarUsuarioCommand comando, CancellationToken cancelacion = default)
    {
        var codigo = CodigoDeUsuario.Normalizar(comando.Codigo_Usuario);
        var codigo_ya_registrado = CodigoDeUsuario.Revisar(codigo) is null
            && await _usuario_repository.ExisteCodigoAsync(codigo, cancelacion);
        var correo = Texto.NormalizarCorreo(comando.Correo_Usuario);
        var correo_ya_registrado = correo.Length > 0 && await _usuario_repository.ExisteCorreoAsync(correo, cancelacion);

        var usuario = Usuario.Registrar(
            comando.Codigo_Usuario,
            comando.Nombre_Completo_Usuario,
            comando.Correo_Usuario,
            comando.Rol_Usuario,
            comando.Contrasena_Usuario,
            codigo_ya_registrado,
            correo_ya_registrado,
            _hasher.Cifrar);

        await _usuario_repository.AgregarAsync(usuario, cancelacion);

        return UsuarioDto.DesdeEntidad(usuario);
    }
}
