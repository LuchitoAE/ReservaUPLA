using ReservaUPLA.Domain.Comun;
using ReservaUPLA.Domain.Enumeraciones;

namespace ReservaUPLA.Domain.Entidades;

// Persona que usa el sistema (RF-01). Su rol decide qué puede hacer: solicitar, aprobar o consultar su ambiente.
// Solo se crea con Registrar, que normaliza y exige las reglas; un usuario nuevo nace activo. Ingresa con su código
// (RN-14) y guarda la sal y el hash de su contraseña (el modelo del caso se amplía con esos tres campos).
public sealed class Usuario
{
    public const int Longitud_Minima_Nombre = 5;
    public const int Longitud_Maxima_Nombre = 150;
    public const int Longitud_Maxima_Correo = 150;
    public const int Longitud_Minima_Contrasena = 8;
    public const int Longitud_Maxima_Contrasena = 64;

    private static readonly ReglaDeTexto Regla_Nombre = new(
        "El nombre completo", Longitud_Minima_Nombre, Longitud_Maxima_Nombre, "Escriba el nombre y los apellidos del usuario.");

    private Usuario()
    {
    }

    public Guid Id_Usuario { get; private set; }

    public string Codigo_Usuario { get; private set; } = string.Empty;

    public string Nombre_Completo_Usuario { get; private set; } = string.Empty;

    public string Correo_Usuario { get; private set; } = string.Empty;

    public Roles_Usuario Rol_Usuario { get; private set; }

    public bool Activo_Usuario { get; private set; }

    public byte[] Sal_Contrasena_Usuario { get; private set; } = [];

    public byte[] Hash_Contrasena_Usuario { get; private set; } = [];

    // Revisa todos los datos y, si alguno falla, informa todos los errores juntos, cada uno con su campo.
    // «codigo_ya_registrado» y «correo_ya_registrado» los averigua el caso de uso en la base, con el dato ya
    // normalizado. «cifrar» lo da la Infraestructura (PBKDF2): la entidad solo decide si la contraseña cumple las reglas.
    public static Usuario Registrar(
        string? codigo,
        string? nombre_completo,
        string? correo,
        Roles_Usuario rol,
        string? contrasena,
        bool codigo_ya_registrado,
        bool correo_ya_registrado,
        Func<string, ContrasenaCifrada> cifrar)
    {
        var errores = new ErroresDeValidacion();

        var codigo_normalizado = CodigoDeUsuario.Normalizar(codigo);
        var mensaje_codigo = CodigoDeUsuario.Revisar(codigo_normalizado);
        if (mensaje_codigo is not null)
        {
            errores.Agregar(nameof(Codigo_Usuario), mensaje_codigo);
        }
        else if (codigo_ya_registrado)
        {
            errores.Agregar(nameof(Codigo_Usuario), "Este código ya existe.");
        }

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

        errores.ValidarOpcion(nameof(Rol_Usuario), rol, "Elija el rol: Solicitante, Administrador o Responsable de ambiente.");

        var mensaje_contrasena = RevisarContrasena(contrasena);
        if (mensaje_contrasena is not null)
        {
            errores.Agregar("Contrasena_Usuario", mensaje_contrasena);
        }

        errores.LanzarSiHay();

        var cifrada = cifrar(contrasena!);

        return new Usuario
        {
            Id_Usuario = Guid.CreateVersion7(),
            Codigo_Usuario = codigo_normalizado,
            Nombre_Completo_Usuario = nombre,
            Correo_Usuario = correo_normalizado,
            Rol_Usuario = rol,
            Activo_Usuario = true,
            Sal_Contrasena_Usuario = cifrada.Sal,
            Hash_Contrasena_Usuario = cifrada.Hash,
        };
    }

    // De 8 a 64 caracteres, con al menos una mayúscula, una minúscula y un número. Devuelve qué falta, o null.
    public static string? RevisarContrasena(string? contrasena)
    {
        if (string.IsNullOrEmpty(contrasena))
        {
            return "Escriba una contraseña.";
        }

        if (contrasena.Length < Longitud_Minima_Contrasena || contrasena.Length > Longitud_Maxima_Contrasena)
        {
            return $"La contraseña debe tener entre {Longitud_Minima_Contrasena} y {Longitud_Maxima_Contrasena} caracteres.";
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
            errores.Agregar("Contrasena_Actual", "Escriba su contraseña actual.");
        }
        else if (!verificar(actual, new ContrasenaCifrada(Sal_Contrasena_Usuario, Hash_Contrasena_Usuario)))
        {
            errores.Agregar("Contrasena_Actual", "La contraseña actual no es correcta.");
        }

        var mensaje_nueva = RevisarContrasena(nueva);
        if (mensaje_nueva is not null)
        {
            errores.Agregar("Contrasena_Nueva", mensaje_nueva);
        }
        else if (nueva == actual)
        {
            errores.Agregar("Contrasena_Nueva", "Debe ser distinta de la actual.");
        }

        errores.LanzarSiHay();

        var cifrada = cifrar(nueva!);
        Sal_Contrasena_Usuario = cifrada.Sal;
        Hash_Contrasena_Usuario = cifrada.Hash;
    }

    // RN-05: solo un administrador activo aprueba o rechaza reservas.
    public bool EsAdministrador() => Activo_Usuario && Rol_Usuario == Roles_Usuario.Administrador;
}
