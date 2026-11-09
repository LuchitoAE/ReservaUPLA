namespace ReservaUPLA.Application.UseCases.Autenticacion.IniciarSesion;

// Código y contraseña que escribe el usuario en la pantalla de ingreso (RF-09).
public sealed record IniciarSesionCommand(string? Codigo_Usuario, string? Contrasena_Usuario);
