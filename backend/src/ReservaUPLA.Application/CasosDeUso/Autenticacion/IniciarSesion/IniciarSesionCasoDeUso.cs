using ReservaUPLA.Application.Datos;
using ReservaUPLA.Application.Interfaces;
using ReservaUPLA.Domain.Comun;
using ReservaUPLA.Domain.Excepciones;

namespace ReservaUPLA.Application.CasosDeUso.Autenticacion.IniciarSesion;

// RF-09: comprueba el código y la contraseña. Si no coinciden, o el usuario está inactivo, responde lo mismo en todos
// los casos: no se revela qué dato falló ni si el código existe.
public sealed class IniciarSesionCasoDeUso
{
    private const string Mensaje_Generico = "El código o la contraseña no son correctos. Revíselos e inténtelo de nuevo.";

    private readonly IRepositorioDeUsuarios _repositorio_de_usuarios;
    private readonly IProtectorDeContrasenas _protector_de_contrasenas;

    public IniciarSesionCasoDeUso(IRepositorioDeUsuarios repositorio_de_usuarios, IProtectorDeContrasenas protector_de_contrasenas)
    {
        _repositorio_de_usuarios = repositorio_de_usuarios;
        _protector_de_contrasenas = protector_de_contrasenas;
    }

    public async Task<DatosDeUsuario> EjecutarAsync(IniciarSesionComando comando, CancellationToken cancelacion = default)
    {
        var errores = new ErroresDeValidacion();
        var codigo = CodigoDeUsuario.Normalizar(comando.Codigo_Usuario);
        if (codigo.Length == 0)
        {
            errores.Agregar("Codigo_Usuario", "Escriba su código.");
        }

        if (string.IsNullOrEmpty(comando.Contrasena_Usuario))
        {
            errores.Agregar("Contrasena_Usuario", "Escriba su contraseña.");
        }

        errores.LanzarSiHay();

        var usuario = await _repositorio_de_usuarios.ObtenerPorCodigoAsync(codigo, cancelacion);
        var valida = usuario is not null
            && usuario.Activo_Usuario
            && _protector_de_contrasenas.Verificar(comando.Contrasena_Usuario!, new ContrasenaCifrada(usuario.Sal_Contrasena_Usuario, usuario.Hash_Contrasena_Usuario));

        return valida ? DatosDeUsuario.DesdeEntidad(usuario!) : throw new SesionNoValidaExcepcion(Mensaje_Generico);
    }
}
