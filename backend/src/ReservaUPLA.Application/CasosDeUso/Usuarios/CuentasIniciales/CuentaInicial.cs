using ReservaUPLA.Application.CasosDeUso.Usuarios.RegistrarUsuario;
using ReservaUPLA.Domain.Enumeraciones;

namespace ReservaUPLA.Application.CasosDeUso.Usuarios.CuentasIniciales;

// Cuenta que se crea al arrancar la API, con datos configurados fuera del repositorio (secretos de usuario): el primer
// administrador (RF-15) y, solo en desarrollo, las cuentas de prueba (RNF-22).
public sealed record CuentaInicial(
    string? Codigo_Usuario,
    string? Nombre_Completo_Usuario,
    string? Correo_Usuario,
    Roles_Usuario Rol_Usuario,
    string? Contrasena_Usuario)
{
    // Si falta un dato no se intenta crear: se avisa en el registro de la API y se sigue.
    public bool EstaCompleta =>
        !string.IsNullOrWhiteSpace(Codigo_Usuario)
        && !string.IsNullOrWhiteSpace(Nombre_Completo_Usuario)
        && !string.IsNullOrWhiteSpace(Correo_Usuario)
        && !string.IsNullOrEmpty(Contrasena_Usuario);

    public RegistrarUsuarioComando ComoRegistro(Roles_Usuario rol) =>
        new(Codigo_Usuario, Nombre_Completo_Usuario, Correo_Usuario, rol, Contrasena_Usuario);
}
