using ReservaUPLA.Domain.Comun;
using ReservaUPLA.Domain.Enumeraciones;

namespace ReservaUPLA.Domain.Entidades;

// Los datos con los que se registra un usuario (RF-01). «Cifrar» lo aporta la Infraestructura: la entidad solo
// decide si la contraseña cumple las reglas y guarda su sal y su hash.
public sealed record DatosDeRegistroDeUsuario(
    string? Codigo,
    string? NombreCompleto,
    string? Correo,
    RolUsuario Rol,
    string? Contrasena,
    bool CodigoYaRegistrado,
    bool CorreoYaRegistrado,
    Func<string, ContrasenaCifrada> Cifrar);
