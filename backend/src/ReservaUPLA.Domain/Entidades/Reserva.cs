using ReservaUPLA.Domain.Comun;
using ReservaUPLA.Domain.Enumeraciones;
using ReservaUPLA.Domain.Estados;
using ReservaUPLA.Domain.Excepciones;

namespace ReservaUPLA.Domain.Entidades;

// Solicitud de uso de un ambiente en una fecha y un horario (RF-03). Concentra las reglas del caso:
//   RN-02 todos los datos; RN-03 fin mayor que inicio; RN-04 entre 07:00 y 22:00;
//   RN-01 sin cruce con otra aprobada; RN-05 y RN-06 a través de su estado (patrón State).
// Solo se crea con Solicitar y solo cambia de estado con CambiarEstado.
public sealed class Reserva
{
    public static readonly TimeOnly HoraApertura = new(7, 0);
    public static readonly TimeOnly HoraCierre = new(22, 0);
    public const int LongitudMaximaCodigo = 20;
    public const int LongitudMinimaMotivo = 10;
    public const int LongitudMaximaMotivo = 500;

    private static readonly ReglaDeTexto ReglaMotivo = new(
        "El motivo", LongitudMinimaMotivo, LongitudMaximaMotivo, "Explique para qué necesita el ambiente.");

    // RF-06: cada estado por el que pasó, con la fecha y quién hizo el cambio. Solo la reserva lo escribe.
    private readonly List<Historial> _historial = [];

    private Reserva()
    {
    }

    public Guid IdReserva { get; private set; }

    public string CodigoReserva { get; private set; } = string.Empty;

    public DateOnly FechaReserva { get; private set; }

    public TimeOnly HoraInicioReserva { get; private set; }

    public TimeOnly HoraFinReserva { get; private set; }

    public string MotivoReserva { get; private set; } = string.Empty;

    public EstadoReserva EstadoReserva { get; private set; }

    public Guid IdUsuario { get; private set; }

    public Guid IdAmbiente { get; private set; }

    public DateTime FechaRegistroReserva { get; private set; }

    public DateTime? FechaActualizacionReserva { get; private set; }

    // Copia defensiva: quien lo lee no puede alterar el historial por la espalda de la entidad.
    public IReadOnlyList<Historial> HistorialReserva => _historial.AsReadOnly();

    // Revisa todos los datos y, si alguno falla, informa todos los errores juntos, cada uno con su campo.
    // El solicitante y el ambiente llegan ya buscados; el momento decide qué es «pasado» y de qué año es el código.
    public static Reserva Solicitar(DatosDeSolicitud datos)
    {
        var errores = new ErroresDeValidacion();

        if (datos.Solicitante is null || !datos.Solicitante.ActivoUsuario)
        {
            errores.Agregar(nameof(IdUsuario), "Inicie sesión con un usuario activo para solicitar la reserva.");
        }

        if (datos.Ambiente is null)
        {
            errores.Agregar(nameof(IdAmbiente), "Elija el ambiente que necesita.");
        }
        else if (!datos.Ambiente.AdmiteReservas())
        {
            errores.Agregar(nameof(IdAmbiente),
                $"{datos.Ambiente.NombreAmbiente} no recibe reservas: está {datos.Ambiente.DescribirEstado()}.");
        }

        var hoy = datos.Momento.FechaEnPeru;
        if (datos.Fecha is null)
        {
            errores.Agregar(nameof(FechaReserva), "Elija la fecha de la reserva.");
        }
        else if (datos.Fecha < hoy)
        {
            errores.Agregar(nameof(FechaReserva), $"La fecha no puede ser anterior a hoy ({hoy:dd/MM/yyyy}).");
        }

        ValidarHorarioPermitido(errores, datos.HoraInicio, datos.HoraFin);
        ValidarNoEnElPasado(errores, datos.Fecha, datos.HoraInicio, datos.Momento);

        var motivoNormalizado = errores.ValidarTexto(nameof(MotivoReserva), Texto.NormalizarParrafos(datos.Motivo), ReglaMotivo);

        errores.LanzarSiHay();

        var reserva = new Reserva
        {
            IdReserva = Guid.CreateVersion7(),
            FechaReserva = datos.Fecha!.Value,
            HoraInicioReserva = datos.HoraInicio!.Value,
            HoraFinReserva = datos.HoraFin!.Value,
            MotivoReserva = motivoNormalizado,
            EstadoReserva = EstadoReserva.Pendiente,
            IdUsuario = datos.Solicitante!.IdUsuario,
            IdAmbiente = datos.Ambiente!.IdAmbiente,
            FechaRegistroReserva = datos.Momento.EnUtc,
        };

        // Toda reserva nace Pendiente, registrada por quien la solicita: es la primera entrada de su historial.
        reserva._historial.Add(Historial.Registrar(
            reserva.IdReserva, EstadoReserva.Pendiente, reserva.IdUsuario, datos.Momento.EnUtc));

        return reserva;
    }

    // RN-03 y RN-04. La apertura y el cierre son asimétricos a propósito: el inicio debe cumplir
    // 07:00 <= inicio < 22:00, mientras que el fin puede llegar hasta las 22:00 (nunca pasarse). Así una reserva
    // puede terminar justo al cierre, pero ninguna puede empezar a esa hora.
    private static void ValidarHorarioPermitido(ErroresDeValidacion errores, TimeOnly? inicio, TimeOnly? fin)
    {
        if (inicio is null)
        {
            errores.Agregar(nameof(HoraInicioReserva), "Indique la hora de inicio.");
        }
        else if (inicio < HoraApertura || inicio >= HoraCierre)
        {
            errores.Agregar(nameof(HoraInicioReserva), "La hora de inicio debe estar entre las 07:00 y las 22:00.");
        }

        if (fin is null)
        {
            errores.Agregar(nameof(HoraFinReserva), "Indique la hora de fin.");
        }
        else if (fin > HoraCierre)
        {
            errores.Agregar(nameof(HoraFinReserva), "La hora de fin no puede pasar de las 22:00.");
        }
        else if (inicio is not null && fin <= inicio)
        {
            errores.Agregar(nameof(HoraFinReserva), "La hora de fin debe ser mayor que la hora de inicio.");
        }
    }

    // La fecha de hoy ya no puede quedar atrás, pero la hora solo se compara cuando la reserva es para hoy: para
    // otro día, la hora de inicio se juzga solo con RN-03 y RN-04. Por eso esta validación va aparte.
    private static void ValidarNoEnElPasado(
        ErroresDeValidacion errores, DateOnly? fecha, TimeOnly? inicio, MomentoActual momento)
    {
        if (fecha == momento.FechaEnPeru
            && inicio is { } hora
            && hora >= HoraApertura
            && hora < HoraCierre
            && hora <= momento.HoraEnPeru)
        {
            errores.Agregar(nameof(HoraInicioReserva),
                $"Esa hora ya pasó: hoy elija una hora posterior a las {momento.HoraEnPeru:HH\\:mm}.");
        }
    }

    // El código se asigna después de validar: un registro rechazado no consume un número. RES-2026-0001.
    // El año sale de la fecha de Perú, no de UTC: cerca de la medianoche del 31 de diciembre no se adelanta el año.
    public void AsignarCodigo(int numeroCorrelativo, DateOnly fechaEnPeru)
    {
        if (numeroCorrelativo <= 0 || !string.IsNullOrEmpty(CodigoReserva))
        {
            throw new InvalidOperationException("El código de la reserva ya se asignó o el número no es válido.");
        }

        CodigoReserva = $"RES-{fechaEnPeru:yyyy}-{numeroCorrelativo:D4}";
    }

    public Horario ObtenerHorario() => new(FechaReserva, HoraInicioReserva, HoraFinReserva);

    // El estado actual como objeto (patrón State), creado por la fábrica.
    public EstadoDeReserva ObtenerEstado() => FabricaDeEstadosDeReserva.Crear(EstadoReserva);

    // RF-04 / RN-01: no puede haber otra reserva aprobada de la misma agenda que se cruce con este horario.
    // La agenda ya viene acotada al ambiente y a la fecha; aquí no se vuelve a filtrar por ambiente.
    public void VerificarDisponibilidad(Agenda agenda)
    {
        var cruce = agenda.CruceAprobadoCon(ObtenerHorario(), IdReserva);

        if (cruce is not null)
        {
            throw new ConflictoDeNegocioExcepcion(
                $"El ambiente ya está reservado {cruce.ObtenerHorario()} ({cruce.CodigoReserva}, aprobada). " +
                "Elija otro horario u otro ambiente.");
        }
    }

    // RF-07: el estado actual decide si admite el cambio y si el usuario puede hacerlo (RN-05, RN-06).
    // Para aprobar se vuelve a revisar la disponibilidad: otra pudo aprobarse mientras esta esperaba (RN-01).
    public void CambiarEstado(DatosDeCambioDeEstado datos)
    {
        if (datos.Usuario is null || !datos.Usuario.ActivoUsuario)
        {
            throw new AccionNoPermitidaExcepcion("Inicie sesión con un usuario activo para cambiar el estado.");
        }

        if (!Enum.IsDefined(datos.NuevoEstado))
        {
            throw new DatosNoValidosExcepcion(nameof(EstadoReserva), "Elija el nuevo estado: aprobada, rechazada o cancelada.");
        }

        var estadoActual = ObtenerEstado();
        var nuevoEstado = datos.NuevoEstado switch
        {
            EstadoReserva.Aprobada => estadoActual.Aprobar(this, datos.Usuario),
            EstadoReserva.Rechazada => estadoActual.Rechazar(this, datos.Usuario),
            EstadoReserva.Cancelada => estadoActual.Cancelar(this, datos.Usuario),
            _ => throw new DatosNoValidosExcepcion(nameof(EstadoReserva), "Elija el nuevo estado: aprobada, rechazada o cancelada."),
        };

        if (nuevoEstado == EstadoReserva.Aprobada)
        {
            VerificarDisponibilidad(datos.ReservasDelAmbiente);
        }

        EstadoReserva = nuevoEstado;
        FechaActualizacionReserva = datos.Momento.EnUtc;
        _historial.Add(Historial.Registrar(IdReserva, nuevoEstado, datos.Usuario.IdUsuario, datos.Momento.EnUtc));
    }
}
