namespace ReservaUPLA.Application.CasosDeUso.Cuenta.CambiarContrasena;

// Lo que envía Mi cuenta para cambiar la contraseña (RF-11). La repetición de la nueva la revisa la interfaz.
public sealed record CambiarContrasenaComando(string? ContrasenaActual, string? ContrasenaNueva);
