using ReservaUPLA.Application.Datos;
using ReservaUPLA.Application.Interfaces;
using ReservaUPLA.Domain.Comun;
using ReservaUPLA.Domain.Excepciones;

namespace ReservaUPLA.Application.CasosDeUso.Autenticacion.IniciarSesion;

// RF-09: comprueba el código y la contraseña. Si no coinciden, o el usuario está inactivo, responde lo mismo en todos
// los casos: no se revela qué dato falló ni si el código existe.
public sealed class IniciarSesionCasoDeUso
{
    private const string MensajeGenerico = "El código o la contraseña no son correctos. Revíselos e inténtelo de nuevo.";

    private readonly IRepositorioDeUsuarios _repositorioDeUsuarios;
    private readonly IProtectorDeContrasenas _protectorDeContrasenas;

    public IniciarSesionCasoDeUso(
        IRepositorioDeUsuarios repositorioDeUsuarios, IProtectorDeContrasenas protectorDeContrasenas)
    {
        _repositorioDeUsuarios = repositorioDeUsuarios;
        _protectorDeContrasenas = protectorDeContrasenas;
    }

    public async Task<DatosDeUsuario> EjecutarAsync(
        IniciarSesionComando comando, CancellationToken cancelacion = default)
    {
        var errores = new ErroresDeValidacion();
        var codigo = CodigoDeUsuario.Normalizar(comando.CodigoUsuario);
        if (codigo.Length == 0)
        {
            errores.Agregar("CodigoUsuario", "Escriba su código.");
        }

        if (string.IsNullOrEmpty(comando.ContrasenaUsuario))
        {
            errores.Agregar("ContrasenaUsuario", "Escriba su contraseña.");
        }

        errores.LanzarSiHay();

        var usuario = await _repositorioDeUsuarios.ObtenerPorCodigoAsync(codigo, cancelacion);
        var valida = usuario is not null
            && usuario.ActivoUsuario
            && _protectorDeContrasenas.Verificar(
                comando.ContrasenaUsuario!,
                new ContrasenaCifrada(usuario.SalContrasenaUsuario, usuario.HashContrasenaUsuario));

        return valida
            ? DatosDeUsuario.DesdeEntidad(usuario!)
            : throw new SesionNoValidaExcepcion(MensajeGenerico);
    }
}
