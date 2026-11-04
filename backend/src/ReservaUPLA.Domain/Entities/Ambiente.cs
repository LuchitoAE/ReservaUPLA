using ReservaUPLA.Domain.Common;
using ReservaUPLA.Domain.Enums;

namespace ReservaUPLA.Domain.Entities;

// Laboratorio, auditorio o sala que se puede reservar (RF-02). El modelo del caso se amplía con el responsable
// del ambiente (opcional), que es quien consulta su uso (actor «Responsable de ambiente»).
public sealed class Ambiente
{
    public const int Longitud_Minima_Nombre = 3;
    public const int Longitud_Maxima_Nombre = 100;
    public const int Longitud_Minima_Ubicacion = 3;
    public const int Longitud_Maxima_Ubicacion = 100;
    public const int Capacidad_Minima = 1;
    public const int Capacidad_Maxima = 1000;

    private static readonly ReglaDeTexto Regla_Nombre = new(
        "El nombre", Longitud_Minima_Nombre, Longitud_Maxima_Nombre, "Escriba el nombre del ambiente, por ejemplo «Laboratorio de cómputo 1».");

    private static readonly ReglaDeTexto Regla_Ubicacion = new(
        "La ubicación", Longitud_Minima_Ubicacion, Longitud_Maxima_Ubicacion, "Indique dónde está: pabellón, piso o aula.");

    private Ambiente()
    {
    }

    public Guid Id_Ambiente { get; private set; }

    public string Nombre_Ambiente { get; private set; } = string.Empty;

    public Tipos_Ambiente Tipo_Ambiente { get; private set; }

    public int Capacidad_Ambiente { get; private set; }

    public string Ubicacion_Ambiente { get; private set; } = string.Empty;

    public Estados_Ambiente Estado_Ambiente { get; private set; }

    public Guid? Id_Responsable_Ambiente { get; private set; }

    // Revisa todos los datos y, si alguno falla, informa todos los errores juntos, cada uno con su campo.
    // El responsable llega ya buscado: la entidad comprueba que exista, esté activo y tenga el rol que corresponde.
    public static Ambiente Registrar(
        string? nombre,
        Tipos_Ambiente tipo,
        int? capacidad,
        string? ubicacion,
        Estados_Ambiente estado,
        bool responsable_indicado,
        Usuario? responsable,
        bool nombre_ya_registrado)
    {
        var errores = new ErroresDeValidacion();

        var nombre_normalizado = errores.ValidarTexto(nameof(Nombre_Ambiente), Texto.NormalizarLinea(nombre), Regla_Nombre);
        if (!errores.TieneErrorEn(nameof(Nombre_Ambiente)) && nombre_ya_registrado)
        {
            errores.Agregar(nameof(Nombre_Ambiente), "Ya existe un ambiente con este nombre.");
        }

        errores.ValidarOpcion(nameof(Tipo_Ambiente), tipo,
            "Elija el tipo: laboratorio de cómputo, auditorio, sala de reuniones o laboratorio especializado.");

        if (capacidad is null)
        {
            errores.Agregar(nameof(Capacidad_Ambiente), "Indique cuántas personas caben en el ambiente.");
        }
        else if (capacidad < Capacidad_Minima || capacidad > Capacidad_Maxima)
        {
            errores.Agregar(nameof(Capacidad_Ambiente), $"La capacidad debe estar entre {Capacidad_Minima} y {Capacidad_Maxima} personas.");
        }

        var ubicacion_normalizada = errores.ValidarTexto(
            nameof(Ubicacion_Ambiente), Texto.NormalizarLinea(ubicacion), Regla_Ubicacion, exigir_contenido_util: false);

        errores.ValidarOpcion(nameof(Estado_Ambiente), estado, "Elija el estado: disponible, en mantenimiento o inactivo.");

        if (responsable_indicado)
        {
            if (responsable is null || !responsable.Activo_Usuario)
            {
                errores.Agregar(nameof(Id_Responsable_Ambiente), "Elija un responsable registrado y activo.");
            }
            else if (responsable.Rol_Usuario != Roles_Usuario.ResponsableDeAmbiente)
            {
                errores.Agregar(nameof(Id_Responsable_Ambiente), "El responsable debe tener el rol «Responsable de ambiente».");
            }
        }

        errores.LanzarSiHay();

        return new Ambiente
        {
            Id_Ambiente = Guid.CreateVersion7(),
            Nombre_Ambiente = nombre_normalizado,
            Tipo_Ambiente = tipo,
            Capacidad_Ambiente = capacidad!.Value,
            Ubicacion_Ambiente = ubicacion_normalizada,
            Estado_Ambiente = estado,
            Id_Responsable_Ambiente = responsable?.Id_Usuario,
        };
    }

    // Solo un ambiente disponible recibe reservas: uno en mantenimiento o inactivo, no.
    public bool AdmiteReservas() => Estado_Ambiente == Estados_Ambiente.Disponible;

    // El estado dicho como en una frase: «está en mantenimiento».
    public string DescribirEstado() => Estado_Ambiente switch
    {
        Estados_Ambiente.Disponible => "disponible",
        Estados_Ambiente.EnMantenimiento => "en mantenimiento",
        _ => "inactivo",
    };
}
