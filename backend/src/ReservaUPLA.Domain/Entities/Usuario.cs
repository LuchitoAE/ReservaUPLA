using ReservaUPLA.Domain.Common;
using ReservaUPLA.Domain.Enums;

namespace ReservaUPLA.Domain.Entities;

// Persona que usa el sistema (RF-01). Su rol decide qué puede hacer: solicitar, aprobar o consultar su ambiente.
// Solo se crea con Registrar, que normaliza y exige las reglas; un usuario nuevo nace activo.
public sealed class Usuario
{
    public const int Longitud_Minima_Nombre = 5;
    public const int Longitud_Maxima_Nombre = 150;
    public const int Longitud_Maxima_Correo = 150;

    private static readonly ReglaDeTexto Regla_Nombre = new(
        "El nombre completo", Longitud_Minima_Nombre, Longitud_Maxima_Nombre, "Escriba el nombre y los apellidos del usuario.");

    private Usuario()
    {
    }

    public Guid Id_Usuario { get; private set; }

    public string Nombre_Completo_Usuario { get; private set; } = string.Empty;

    public string Correo_Usuario { get; private set; } = string.Empty;

    public Roles_Usuario Rol_Usuario { get; private set; }

    public bool Activo_Usuario { get; private set; }

    // Revisa todos los datos y, si alguno falla, informa todos los errores juntos, cada uno con su campo.
    // «correo_ya_registrado» lo averigua el caso de uso en la base, con el correo ya normalizado.
    public static Usuario Registrar(string? nombre_completo, string? correo, Roles_Usuario rol, bool correo_ya_registrado)
    {
        var errores = new ErroresDeValidacion();

        var nombre = errores.ValidarTexto(nameof(Nombre_Completo_Usuario), Texto.NormalizarLinea(nombre_completo), Regla_Nombre);
        if (!errores.TieneErrorEn(nameof(Nombre_Completo_Usuario)) && !nombre.Contains(' '))
        {
            errores.Agregar(nameof(Nombre_Completo_Usuario), "Escriba el nombre y al menos un apellido.");
        }

        var correo_normalizado = Texto.NormalizarCorreo(correo);
        if (correo_normalizado.Length == 0)
        {
            errores.Agregar(nameof(Correo_Usuario), "Escriba el correo del usuario.");
        }
        else if (correo_normalizado.Length > Longitud_Maxima_Correo)
        {
            errores.Agregar(nameof(Correo_Usuario), $"El correo no puede superar los {Longitud_Maxima_Correo} caracteres.");
        }
        else if (!Texto.EsCorreo(correo_normalizado))
        {
            errores.Agregar(nameof(Correo_Usuario), "Escriba un correo válido, por ejemplo nombre.apellido@upla.edu.pe.");
        }
        else if (correo_ya_registrado)
        {
            errores.Agregar(nameof(Correo_Usuario), "Ya existe un usuario con este correo.");
        }

        errores.ValidarOpcion(nameof(Rol_Usuario), rol, "Elija el rol: Solicitante, Administrador o ResponsableDeAmbiente.");

        errores.LanzarSiHay();

        return new Usuario
        {
            Id_Usuario = Guid.CreateVersion7(),
            Nombre_Completo_Usuario = nombre,
            Correo_Usuario = correo_normalizado,
            Rol_Usuario = rol,
            Activo_Usuario = true,
        };
    }

    // RN-05: solo un administrador activo aprueba o rechaza reservas.
    public bool EsAdministrador() => Activo_Usuario && Rol_Usuario == Roles_Usuario.Administrador;
}
