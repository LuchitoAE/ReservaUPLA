using ReservaUPLA.Application.Interfaces;
using ReservaUPLA.Application.CasosDeUso.Usuarios.RegistrarUsuario;
using ReservaUPLA.Domain.Enumeraciones;

namespace ReservaUPLA.Application.CasosDeUso.Usuarios.CuentasIniciales;

// RF-15: sin registro propio (RN-07), alguien tiene que poder entrar la primera vez. Al arrancar, si no hay ningún
// administrador activo, se crea uno con los datos configurados; si ya hay uno, no se hace nada. Se registra con las
// mismas reglas que cualquier usuario (RegistrarUsuario), y siempre con el rol de administrador.
public sealed class CrearPrimerAdministradorCasoDeUso
{
    private readonly IRepositorioDeUsuarios _repositorio_de_usuarios;
    private readonly RegistrarUsuarioCasoDeUso _registrar_usuario;

    public CrearPrimerAdministradorCasoDeUso(IRepositorioDeUsuarios repositorio_de_usuarios, RegistrarUsuarioCasoDeUso registrar_usuario)
    {
        _repositorio_de_usuarios = repositorio_de_usuarios;
        _registrar_usuario = registrar_usuario;
    }

    public async Task<ResultadoDeCuentaInicial> EjecutarAsync(CuentaInicial? cuenta, CancellationToken cancelacion = default)
    {
        if (await _repositorio_de_usuarios.ExisteAdministradorActivoAsync(cancelacion))
        {
            return ResultadoDeCuentaInicial.YaExistia;
        }

        if (cuenta is null || !cuenta.EstaCompleta)
        {
            return ResultadoDeCuentaInicial.FaltanDatos;
        }

        await _registrar_usuario.EjecutarAsync(cuenta.ComoRegistro(Roles_Usuario.Administrador), cancelacion);

        return ResultadoDeCuentaInicial.Creada;
    }
}
