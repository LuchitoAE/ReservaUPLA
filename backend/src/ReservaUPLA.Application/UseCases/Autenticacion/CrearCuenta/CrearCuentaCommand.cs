using ReservaUPLA.Application.UseCases.Usuarios.RegistrarUsuario;
using ReservaUPLA.Domain.Enums;

namespace ReservaUPLA.Application.UseCases.Autenticacion.CrearCuenta;

// Cuenta que una persona crea por su cuenta desde la pantalla de ingreso (RF-01: registrar usuarios solicitantes).
// No elige rol: siempre es Solicitante. Los otros roles los registra un administrador.
public sealed record CrearCuentaCommand(string? Nombre_Completo_Usuario, string? Correo_Usuario, string? Contrasena_Usuario)
{
    public RegistrarUsuarioCommand ComoRegistro() =>
        new(Nombre_Completo_Usuario, Correo_Usuario, Roles_Usuario.Solicitante, Contrasena_Usuario);
}
