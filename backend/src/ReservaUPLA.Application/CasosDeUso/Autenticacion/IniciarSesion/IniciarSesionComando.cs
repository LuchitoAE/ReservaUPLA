namespace ReservaUPLA.Application.CasosDeUso.Autenticacion.IniciarSesion;

// Código y contraseña que escribe el usuario en la pantalla de ingreso (RF-09).
public sealed record IniciarSesionComando(string? CodigoUsuario, string? ContrasenaUsuario);
