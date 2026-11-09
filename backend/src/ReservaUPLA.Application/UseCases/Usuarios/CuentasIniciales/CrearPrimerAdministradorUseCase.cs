using ReservaUPLA.Application.Interfaces;
using ReservaUPLA.Application.UseCases.Usuarios.RegistrarUsuario;
using ReservaUPLA.Domain.Enums;

namespace ReservaUPLA.Application.UseCases.Usuarios.CuentasIniciales;

// RF-15: sin registro propio (RN-07), alguien tiene que poder entrar la primera vez. Al arrancar, si no hay ningún
// administrador activo, se crea uno con los datos configurados; si ya hay uno, no se hace nada. Se registra con las
// mismas reglas que cualquier usuario (RegistrarUsuario), y siempre con el rol de administrador.
public sealed class CrearPrimerAdministradorUseCase
{
    private readonly IUsuarioRepository _usuario_repository;
    private readonly RegistrarUsuarioUseCase _registrar_usuario;

    public CrearPrimerAdministradorUseCase(IUsuarioRepository usuario_repository, RegistrarUsuarioUseCase registrar_usuario)
    {
        _usuario_repository = usuario_repository;
        _registrar_usuario = registrar_usuario;
    }

    public async Task<ResultadoDeCuentaInicial> EjecutarAsync(CuentaInicial? cuenta, CancellationToken cancelacion = default)
    {
        if (await _usuario_repository.ExisteAdministradorActivoAsync(cancelacion))
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
