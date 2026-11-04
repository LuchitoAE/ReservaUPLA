namespace ReservaUPLA.Application.UseCases.Autenticacion.IniciarSesion;

// Correo y contraseña que escribe el usuario en la pantalla de ingreso.
public sealed record IniciarSesionCommand(string? Correo_Usuario, string? Contrasena_Usuario);
