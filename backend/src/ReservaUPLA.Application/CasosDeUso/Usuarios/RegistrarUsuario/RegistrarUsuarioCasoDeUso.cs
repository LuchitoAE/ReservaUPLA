using ReservaUPLA.Application.Datos;
using ReservaUPLA.Application.Interfaces;
using ReservaUPLA.Domain.Comun;
using ReservaUPLA.Domain.Entidades;

namespace ReservaUPLA.Application.CasosDeUso.Usuarios.RegistrarUsuario;

// RF-01: averigua si el código o el correo ya existen, deja que la entidad valide y guarda con la contraseña cifrada.
// Es la única forma de crear usuarios: la usan el administrador y las cuentas iniciales (no hay registro propio, RN-07).
public sealed class RegistrarUsuarioCasoDeUso
{
    private readonly IRepositorioDeUsuarios _repositorioDeUsuarios;
    private readonly IProtectorDeContrasenas _protectorDeContrasenas;

    public RegistrarUsuarioCasoDeUso(
        IRepositorioDeUsuarios repositorioDeUsuarios, IProtectorDeContrasenas protectorDeContrasenas)
    {
        _repositorioDeUsuarios = repositorioDeUsuarios;
        _protectorDeContrasenas = protectorDeContrasenas;
    }

    public async Task<DatosDeUsuario> EjecutarAsync(
        RegistrarUsuarioComando comando, CancellationToken cancelacion = default)
    {
        var codigo = CodigoDeUsuario.Normalizar(comando.CodigoUsuario);
        var codigoYaRegistrado = CodigoDeUsuario.Revisar(codigo) is null
            && await _repositorioDeUsuarios.ExisteCodigoAsync(codigo, cancelacion);
        var correo = Texto.NormalizarCorreo(comando.CorreoUsuario);
        var correoYaRegistrado = correo.Length > 0
            && await _repositorioDeUsuarios.ExisteCorreoAsync(correo, cancelacion);

        var usuario = Usuario.Registrar(new DatosDeRegistroDeUsuario(
            comando.CodigoUsuario,
            comando.NombreCompletoUsuario,
            comando.CorreoUsuario,
            comando.RolUsuario,
            comando.ContrasenaUsuario,
            codigoYaRegistrado,
            correoYaRegistrado,
            _protectorDeContrasenas.Cifrar));

        await _repositorioDeUsuarios.AgregarAsync(usuario, cancelacion);

        return DatosDeUsuario.DesdeEntidad(usuario);
    }
}
