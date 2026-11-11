using ReservaUPLA.Application.CasosDeUso.Usuarios.RegistrarUsuario;
using ReservaUPLA.Application.Interfaces;
using ReservaUPLA.Domain.Enumeraciones;

namespace ReservaUPLA.Application.CasosDeUso.Usuarios.CuentasIniciales;

// RF-15: sin registro propio (RN-07), alguien tiene que poder entrar la primera vez. Al arrancar, si no hay ningún
// administrador activo, se crea uno con los datos configurados; si ya hay uno, no se hace nada. Se registra con las
// mismas reglas que cualquier usuario (RegistrarUsuario), y siempre con el rol de administrador.
public sealed class CrearPrimerAdministradorCasoDeUso
{
    private readonly IRepositorioDeUsuarios _repositorioDeUsuarios;
    private readonly RegistrarUsuarioCasoDeUso _registrarUsuario;

    public CrearPrimerAdministradorCasoDeUso(
        IRepositorioDeUsuarios repositorioDeUsuarios, RegistrarUsuarioCasoDeUso registrarUsuario)
    {
        _repositorioDeUsuarios = repositorioDeUsuarios;
        _registrarUsuario = registrarUsuario;
    }

    public async Task<ResultadoDeCuentaInicial> EjecutarAsync(
        CuentaInicial? cuenta, CancellationToken cancelacion = default)
    {
        if (await _repositorioDeUsuarios.ExisteAdministradorActivoAsync(cancelacion))
        {
            return ResultadoDeCuentaInicial.YaExistia;
        }

        if (cuenta is null || !cuenta.EstaCompleta)
        {
            return ResultadoDeCuentaInicial.FaltanDatos;
        }

        await _registrarUsuario.EjecutarAsync(cuenta.ComoRegistro(RolUsuario.Administrador), cancelacion);

        return ResultadoDeCuentaInicial.Creada;
    }
}
