using ReservaUPLA.Application.Datos;
using ReservaUPLA.Application.Interfaces;
using ReservaUPLA.Domain.Comun;
using ReservaUPLA.Domain.Entidades;

namespace ReservaUPLA.Application.CasosDeUso.Usuarios.RegistrarUsuario;

// RF-01: averigua si el código o el correo ya existen, deja que la entidad valide y guarda con la contraseña cifrada.
// Es la única forma de crear usuarios: la usan el administrador y las cuentas iniciales (no hay registro propio, RN-07).
public sealed class RegistrarUsuarioCasoDeUso
{
    private readonly IRepositorioDeUsuarios _repositorio_de_usuarios;
    private readonly IProtectorDeContrasenas _protector_de_contrasenas;

    public RegistrarUsuarioCasoDeUso(IRepositorioDeUsuarios repositorio_de_usuarios, IProtectorDeContrasenas protector_de_contrasenas)
    {
        _repositorio_de_usuarios = repositorio_de_usuarios;
        _protector_de_contrasenas = protector_de_contrasenas;
    }

    public async Task<DatosDeUsuario> EjecutarAsync(RegistrarUsuarioComando comando, CancellationToken cancelacion = default)
    {
        var codigo = CodigoDeUsuario.Normalizar(comando.Codigo_Usuario);
        var codigo_ya_registrado = CodigoDeUsuario.Revisar(codigo) is null
            && await _repositorio_de_usuarios.ExisteCodigoAsync(codigo, cancelacion);
        var correo = Texto.NormalizarCorreo(comando.Correo_Usuario);
        var correo_ya_registrado = correo.Length > 0 && await _repositorio_de_usuarios.ExisteCorreoAsync(correo, cancelacion);

        var usuario = Usuario.Registrar(
            comando.Codigo_Usuario,
            comando.Nombre_Completo_Usuario,
            comando.Correo_Usuario,
            comando.Rol_Usuario,
            comando.Contrasena_Usuario,
            codigo_ya_registrado,
            correo_ya_registrado,
            _protector_de_contrasenas.Cifrar);

        await _repositorio_de_usuarios.AgregarAsync(usuario, cancelacion);

        return DatosDeUsuario.DesdeEntidad(usuario);
    }
}
