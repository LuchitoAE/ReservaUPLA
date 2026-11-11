using ReservaUPLA.Domain.Comun;
using ReservaUPLA.Domain.Enumeraciones;

namespace ReservaUPLA.Domain.Entidades;

// Laboratorio, auditorio o sala que se puede reservar (RF-02). El modelo del caso se amplía con el responsable
// del ambiente (opcional), que es quien consulta su uso (actor «Responsable de ambiente»).
public sealed class Ambiente
{
    public const int LongitudMinimaNombre = 3;
    public const int LongitudMaximaNombre = 100;
    public const int LongitudMinimaUbicacion = 3;
    public const int LongitudMaximaUbicacion = 100;
    public const int CapacidadMinima = 1;
    public const int CapacidadMaxima = 1000;

    private static readonly ReglaDeTexto ReglaNombre = new(
        "El nombre", LongitudMinimaNombre, LongitudMaximaNombre, "Escriba el nombre del ambiente, por ejemplo «Laboratorio de cómputo 1».");

    private static readonly ReglaDeTexto ReglaUbicacion = new(
        "La ubicación", LongitudMinimaUbicacion, LongitudMaximaUbicacion, "Indique dónde está: pabellón, piso o aula.");

    private Ambiente()
    {
    }

    public Guid IdAmbiente { get; private set; }

    public string NombreAmbiente { get; private set; } = string.Empty;

    public TipoAmbiente TipoAmbiente { get; private set; }

    public int CapacidadAmbiente { get; private set; }

    public string UbicacionAmbiente { get; private set; } = string.Empty;

    public EstadoAmbiente EstadoAmbiente { get; private set; }

    public Guid? IdResponsableAmbiente { get; private set; }

    // Revisa todos los datos y, si alguno falla, informa todos los errores juntos, cada uno con su campo.
    // El responsable llega ya buscado: la entidad comprueba que exista, esté activo y tenga el rol que corresponde.
    public static Ambiente Registrar(DatosDeRegistroDeAmbiente datos)
    {
        var errores = new ErroresDeValidacion();

        var nombreNormalizado = errores.ValidarTexto(
            nameof(NombreAmbiente), Texto.NormalizarLinea(datos.Nombre), ReglaNombre);
        if (!errores.TieneErrorEn(nameof(NombreAmbiente)) && datos.NombreYaRegistrado)
        {
            errores.Agregar(nameof(NombreAmbiente), "Ya existe un ambiente con este nombre.");
        }

        errores.ValidarOpcion(nameof(TipoAmbiente), datos.Tipo,
            "Elija el tipo: laboratorio de cómputo, auditorio, sala de reuniones o laboratorio especializado.");

        if (datos.Capacidad is null)
        {
            errores.Agregar(nameof(CapacidadAmbiente), "Indique cuántas personas caben en el ambiente.");
        }
        else if (datos.Capacidad < CapacidadMinima || datos.Capacidad > CapacidadMaxima)
        {
            errores.Agregar(nameof(CapacidadAmbiente),
                $"La capacidad debe estar entre {CapacidadMinima} y {CapacidadMaxima} personas.");
        }

        var ubicacionNormalizada = errores.ValidarTexto(
            nameof(UbicacionAmbiente), Texto.NormalizarLinea(datos.Ubicacion), ReglaUbicacion, exigirContenidoUtil: false);

        errores.ValidarOpcion(nameof(EstadoAmbiente), datos.Estado,
            "Elija el estado: disponible, en mantenimiento o inactivo.");

        if (datos.ResponsableIndicado)
        {
            if (datos.Responsable is null || !datos.Responsable.ActivoUsuario)
            {
                errores.Agregar(nameof(IdResponsableAmbiente), "Elija un responsable registrado y activo.");
            }
            else if (datos.Responsable.RolUsuario != RolUsuario.ResponsableDeAmbiente)
            {
                errores.Agregar(nameof(IdResponsableAmbiente), "El responsable debe tener el rol «Responsable de ambiente».");
            }
        }

        errores.LanzarSiHay();

        return new Ambiente
        {
            IdAmbiente = Guid.CreateVersion7(),
            NombreAmbiente = nombreNormalizado,
            TipoAmbiente = datos.Tipo,
            CapacidadAmbiente = datos.Capacidad!.Value,
            UbicacionAmbiente = ubicacionNormalizada,
            EstadoAmbiente = datos.Estado,
            IdResponsableAmbiente = datos.Responsable?.IdUsuario,
        };
    }

    // Solo un ambiente disponible recibe reservas: uno en mantenimiento o inactivo, no.
    public bool AdmiteReservas() => EstadoAmbiente == Enumeraciones.EstadoAmbiente.Disponible;

    // El estado dicho como en una frase: «está en mantenimiento».
    public string DescribirEstado() => EstadoAmbiente switch
    {
        Enumeraciones.EstadoAmbiente.Disponible => "disponible",
        Enumeraciones.EstadoAmbiente.EnMantenimiento => "en mantenimiento",
        _ => "inactivo",
    };
}
