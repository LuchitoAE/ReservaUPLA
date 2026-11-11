using ReservaUPLA.Domain.Comun;
using ReservaUPLA.Domain.Enumeraciones;

namespace ReservaUPLA.Domain.Entidades;

// Persona que usa el sistema (RF-01). Su rol decide qué puede hacer: solicitar, aprobar o consultar su ambiente.
// Solo se crea con Registrar, que normaliza y exige las reglas; un usuario nuevo nace activo. Ingresa con su código
// (RN-14) y guarda la sal y el hash de su contraseña (el modelo del caso se amplía con esos tres campos).
public sealed class Usuario
{
    public const int LongitudMinimaNombre = 5;
    public const int LongitudMaximaNombre = 150;
    public const int LongitudMaximaCorreo = 150;
    public const int LongitudMinimaContrasena = 8;
    public const int LongitudMaximaContrasena = 64;

    private static readonly ReglaDeTexto ReglaNombre = new(
        "El nombre completo", LongitudMinimaNombre, LongitudMaximaNombre, "Escriba el nombre y los apellidos del usuario.");

    private Usuario()
    {
    }

    public Guid IdUsuario { get; private set; }

    public string CodigoUsuario { get; private set; } = string.Empty;

    public string NombreCompletoUsuario { get; private set; } = string.Empty;

    public string CorreoUsuario { get; private set; } = string.Empty;

    public RolUsuario RolUsuario { get; private set; }

    public bool ActivoUsuario { get; private set; }

    public byte[] SalContrasenaUsuario { get; private set; } = [];

    public byte[] HashContrasenaUsuario { get; private set; } = [];

    // Revisa todos los datos y, si alguno falla, informa todos los errores juntos, cada uno con su campo.
    // «codigoYaRegistrado» y «correoYaRegistrado» los averigua el caso de uso en la base, con el dato ya
    // normalizado. «cifrar» lo da la Infraestructura (PBKDF2): la entidad solo decide si la contraseña cumple las reglas.
    public static Usuario Registrar(DatosDeRegistroDeUsuario datos)
    {
        var errores = new ErroresDeValidacion();

        var codigoNormalizado = CodigoDeUsuario.Normalizar(datos.Codigo);
        var mensajeCodigo = CodigoDeUsuario.Revisar(codigoNormalizado);
        if (mensajeCodigo is not null)
        {
            errores.Agregar(nameof(CodigoUsuario), mensajeCodigo);
        }
        else if (datos.CodigoYaRegistrado)
        {
            errores.Agregar(nameof(CodigoUsuario), "Este código ya existe.");
        }

        var nombre = errores.ValidarTexto(
            nameof(NombreCompletoUsuario), Texto.NormalizarLinea(datos.NombreCompleto), ReglaNombre);
        if (!errores.TieneErrorEn(nameof(NombreCompletoUsuario)) && !nombre.Contains(' '))
        {
            errores.Agregar(nameof(NombreCompletoUsuario), "Escriba el nombre y al menos un apellido.");
        }

        var correoNormalizado = Texto.NormalizarCorreo(datos.Correo);
        if (correoNormalizado.Length == 0)
        {
            errores.Agregar(nameof(CorreoUsuario), "Escriba el correo del usuario.");
        }
        else if (correoNormalizado.Length > LongitudMaximaCorreo)
        {
            errores.Agregar(nameof(CorreoUsuario), $"El correo no puede superar los {LongitudMaximaCorreo} caracteres.");
        }
        else if (!Texto.EsCorreo(correoNormalizado))
        {
            errores.Agregar(nameof(CorreoUsuario), "Escriba un correo válido, por ejemplo nombre.apellido@upla.edu.pe.");
        }
        else if (datos.CorreoYaRegistrado)
        {
            errores.Agregar(nameof(CorreoUsuario), "Ya existe un usuario con este correo.");
        }

        errores.ValidarOpcion(nameof(RolUsuario), datos.Rol,
            "Elija el rol: Solicitante, Administrador o Responsable de ambiente.");

        var mensajeContrasena = RevisarContrasena(datos.Contrasena);
        if (mensajeContrasena is not null)
        {
            errores.Agregar("ContrasenaUsuario", mensajeContrasena);
        }

        errores.LanzarSiHay();

        var cifrada = datos.Cifrar(datos.Contrasena!);

        return new Usuario
        {
            IdUsuario = Guid.CreateVersion7(),
            CodigoUsuario = codigoNormalizado,
            NombreCompletoUsuario = nombre,
            CorreoUsuario = correoNormalizado,
            RolUsuario = datos.Rol,
            ActivoUsuario = true,
            SalContrasenaUsuario = cifrada.Sal,
            HashContrasenaUsuario = cifrada.Hash,
        };
    }

    // De 8 a 64 caracteres, con al menos una mayúscula, una minúscula y un número. Devuelve qué falta, o null.
    public static string? RevisarContrasena(string? contrasena)
    {
        if (string.IsNullOrEmpty(contrasena))
        {
            return "Escriba una contraseña.";
        }

        if (contrasena.Length < LongitudMinimaContrasena || contrasena.Length > LongitudMaximaContrasena)
        {
            return $"La contraseña debe tener entre {LongitudMinimaContrasena} y {LongitudMaximaContrasena} caracteres.";
        }

        return contrasena.Any(char.IsUpper) && contrasena.Any(char.IsLower) && contrasena.Any(char.IsDigit)
            ? null
            : "La contraseña debe tener al menos una mayúscula, una minúscula y un número.";
    }

    // RF-11: cambia la contraseña de la propia cuenta. La actual debe coincidir con la guardada; la nueva cumple RN-13
    // y no repite la actual. Si algo falla, informa todos los errores juntos, cada uno con su campo, y no cambia nada.
    public void CambiarContrasena(
        string? actual,
        string? nueva,
        Func<string, ContrasenaCifrada, bool> verificar,
        Func<string, ContrasenaCifrada> cifrar)
    {
        var errores = new ErroresDeValidacion();

        if (string.IsNullOrEmpty(actual))
        {
            errores.Agregar("ContrasenaActual", "Escriba su contraseña actual.");
        }
        else if (!verificar(actual, new ContrasenaCifrada(SalContrasenaUsuario, HashContrasenaUsuario)))
        {
            errores.Agregar("ContrasenaActual", "La contraseña actual no es correcta.");
        }

        var mensajeNueva = RevisarContrasena(nueva);
        if (mensajeNueva is not null)
        {
            errores.Agregar("ContrasenaNueva", mensajeNueva);
        }
        else if (nueva == actual)
        {
            errores.Agregar("ContrasenaNueva", "Debe ser distinta de la actual.");
        }

        errores.LanzarSiHay();

        var cifrada = cifrar(nueva!);
        SalContrasenaUsuario = cifrada.Sal;
        HashContrasenaUsuario = cifrada.Hash;
    }

    // RN-05: solo un administrador activo aprueba o rechaza reservas.
    public bool EsAdministrador() => ActivoUsuario && RolUsuario == Enumeraciones.RolUsuario.Administrador;
}
