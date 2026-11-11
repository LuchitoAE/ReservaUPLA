using ReservaUPLA.Application.CasosDeUso.Usuarios.RegistrarUsuario;
using ReservaUPLA.Domain.Enumeraciones;

namespace ReservaUPLA.Application.CasosDeUso.Usuarios.CuentasIniciales;

// Cuenta que se crea al arrancar la API, con datos configurados fuera del repositorio (secretos de usuario): el primer
// administrador (RF-15) y, solo en desarrollo, las cuentas de prueba (RNF-22).
public sealed record CuentaInicial(
    string? CodigoUsuario,
    string? NombreCompletoUsuario,
    string? CorreoUsuario,
    RolUsuario RolUsuario,
    string? ContrasenaUsuario)
{
    // Si falta un dato no se intenta crear: se avisa en el registro de la API y se sigue.
    public bool EstaCompleta =>
        !string.IsNullOrWhiteSpace(CodigoUsuario)
        && !string.IsNullOrWhiteSpace(NombreCompletoUsuario)
        && !string.IsNullOrWhiteSpace(CorreoUsuario)
        && !string.IsNullOrEmpty(ContrasenaUsuario);

    public RegistrarUsuarioComando ComoRegistro(RolUsuario rol) =>
        new(CodigoUsuario, NombreCompletoUsuario, CorreoUsuario, rol, ContrasenaUsuario);
}
