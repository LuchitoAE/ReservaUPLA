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
    public static readonly TimeOnly Hora_Apertura = new(7, 0);
    public static readonly TimeOnly Hora_Cierre = new(22, 0);
    public const int Longitud_Maxima_Codigo = 20;
    public const int Longitud_Minima_Motivo = 10;
    public const int Longitud_Maxima_Motivo = 500;

    private static readonly ReglaDeTexto Regla_Motivo = new(
        "El motivo", Longitud_Minima_Motivo, Longitud_Maxima_Motivo, "Explique para qué necesita el ambiente.");

    private Reserva()
    {
    }

    public Guid Id_Reserva { get; private set; }

    public string Codigo_Reserva { get; private set; } = string.Empty;

    public DateOnly Fecha_Reserva { get; private set; }

    public TimeOnly Hora_Inicio_Reserva { get; private set; }

    public TimeOnly Hora_Fin_Reserva { get; private set; }

    public string Motivo_Reserva { get; private set; } = string.Empty;

    public Estados_Reserva Estado_Reserva { get; private set; }

    public Guid Id_Usuario { get; private set; }

    public Guid Id_Ambiente { get; private set; }

    public DateTime Fecha_Registro_Reserva { get; private set; }

    public DateTime? Fecha_Actualizacion_Reserva { get; private set; }

    // Revisa todos los datos y, si alguno falla, informa todos los errores juntos, cada uno con su campo.
    // El solicitante y el ambiente llegan ya buscados; «ahora_en_peru» decide qué es «pasado».
    public static Reserva Solicitar(
        Usuario? solicitante,
        Ambiente? ambiente,
        DateOnly? fecha,
        TimeOnly? hora_inicio,
        TimeOnly? hora_fin,
        string? motivo,
        DateTime ahora_en_peru,
        DateTime ahora_utc)
    {
        var errores = new ErroresDeValidacion();

        if (solicitante is null || !solicitante.Activo_Usuario)
        {
            errores.Agregar(nameof(Id_Usuario), "Inicie sesión con un usuario activo para solicitar la reserva.");
        }

        if (ambiente is null)
        {
            errores.Agregar(nameof(Id_Ambiente), "Elija el ambiente que necesita.");
        }
        else if (!ambiente.AdmiteReservas())
        {
            errores.Agregar(nameof(Id_Ambiente), $"{ambiente.Nombre_Ambiente} no recibe reservas: está {ambiente.DescribirEstado()}.");
        }

        var hoy = DateOnly.FromDateTime(ahora_en_peru);
        if (fecha is null)
        {
            errores.Agregar(nameof(Fecha_Reserva), "Elija la fecha de la reserva.");
        }
        else if (fecha < hoy)
        {
            errores.Agregar(nameof(Fecha_Reserva), $"La fecha no puede ser anterior a hoy ({hoy:dd/MM/yyyy}).");
        }

        ValidarHoras(errores, fecha, hora_inicio, hora_fin, ahora_en_peru);

        var motivo_normalizado = errores.ValidarTexto(nameof(Motivo_Reserva), Texto.NormalizarParrafos(motivo), Regla_Motivo);

        errores.LanzarSiHay();

        return new Reserva
        {
            Id_Reserva = Guid.CreateVersion7(),
            Fecha_Reserva = fecha!.Value,
            Hora_Inicio_Reserva = hora_inicio!.Value,
            Hora_Fin_Reserva = hora_fin!.Value,
            Motivo_Reserva = motivo_normalizado,
            Estado_Reserva = Estados_Reserva.Pendiente,
            Id_Usuario = solicitante!.Id_Usuario,
            Id_Ambiente = ambiente!.Id_Ambiente,
            Fecha_Registro_Reserva = ahora_utc,
        };
    }

    // RN-03 y RN-04, y que la reserva no empiece en el pasado. Un error por campo.
    private static void ValidarHoras(ErroresDeValidacion errores, DateOnly? fecha, TimeOnly? inicio, TimeOnly? fin, DateTime ahora_en_peru)
    {
        if (inicio is null)
        {
            errores.Agregar(nameof(Hora_Inicio_Reserva), "Indique la hora de inicio.");
        }
        else if (inicio < Hora_Apertura || inicio >= Hora_Cierre)
        {
            errores.Agregar(nameof(Hora_Inicio_Reserva), "La hora de inicio debe estar entre las 07:00 y las 22:00.");
        }
        else if (fecha == DateOnly.FromDateTime(ahora_en_peru) && inicio <= TimeOnly.FromDateTime(ahora_en_peru))
        {
            errores.Agregar(nameof(Hora_Inicio_Reserva), $"Esa hora ya pasó: hoy elija una hora posterior a las {ahora_en_peru:HH\\:mm}.");
        }

        if (fin is null)
        {
            errores.Agregar(nameof(Hora_Fin_Reserva), "Indique la hora de fin.");
        }
        else if (fin > Hora_Cierre)
        {
            errores.Agregar(nameof(Hora_Fin_Reserva), "La hora de fin no puede pasar de las 22:00.");
        }
        else if (inicio is not null && fin <= inicio)
        {
            errores.Agregar(nameof(Hora_Fin_Reserva), "La hora de fin debe ser mayor que la hora de inicio.");
        }
    }

    // El código se asigna después de validar: un registro rechazado no consume un número. RES-2026-0001.
    public void AsignarCodigo(int numero_correlativo)
    {
        if (numero_correlativo <= 0 || Codigo_Reserva.Length > 0)
        {
            throw new InvalidOperationException("El código de la reserva ya se asignó o el número no es válido.");
        }

        Codigo_Reserva = $"RES-{Fecha_Registro_Reserva:yyyy}-{numero_correlativo:D4}";
    }

    public Horario ObtenerHorario() => new(Fecha_Reserva, Hora_Inicio_Reserva, Hora_Fin_Reserva);

    // El estado actual como objeto (patrón State), creado por la fábrica.
    public EstadoDeReserva ObtenerEstado() => FabricaDeEstadosDeReserva.Crear(Estado_Reserva);

    // RF-04 / RN-01: no puede haber otra reserva aprobada del mismo ambiente que se cruce con este horario.
    // «reservas_del_ambiente» son las del mismo ambiente y la misma fecha, que trae el caso de uso.
    public void VerificarDisponibilidad(IEnumerable<Reserva> reservas_del_ambiente)
    {
        var cruce = BuscarCruceAprobado(Id_Ambiente, ObtenerHorario(), reservas_del_ambiente, Id_Reserva);

        if (cruce is not null)
        {
            throw new ConflictoDeNegocioExcepcion(
                $"El ambiente ya está reservado {cruce.ObtenerHorario()} ({cruce.Codigo_Reserva}, aprobada). " +
                "Elija otro horario u otro ambiente.");
        }
    }

    // La reserva aprobada que ocupa ese horario en ese ambiente, o null si está libre. La usa también la consulta de
    // disponibilidad, antes de que exista la reserva.
    public static Reserva? BuscarCruceAprobado(Guid id_ambiente, Horario horario, IEnumerable<Reserva> reservas, Guid? excepto = null) =>
        reservas.FirstOrDefault(otra =>
            otra.Id_Ambiente == id_ambiente
            && otra.Id_Reserva != excepto
            && otra.Estado_Reserva == Estados_Reserva.Aprobada
            && otra.ObtenerHorario().SeCruzaCon(horario));

    // RF-07: el estado actual decide si admite el cambio y si el usuario puede hacerlo (RN-05, RN-06).
    // Para aprobar se vuelve a revisar la disponibilidad: otra pudo aprobarse mientras esta esperaba (RN-01).
    public void CambiarEstado(Estados_Reserva nuevo_estado, Usuario? usuario, IEnumerable<Reserva> reservas_del_ambiente, DateTime ahora_utc)
    {
        if (usuario is null || !usuario.Activo_Usuario)
        {
            throw new AccionNoPermitidaExcepcion("Inicie sesión con un usuario activo para cambiar el estado.");
        }

        if (!Enum.IsDefined(nuevo_estado))
        {
            throw new DatosNoValidosExcepcion(nameof(Estado_Reserva), "Elija el nuevo estado: aprobada, rechazada o cancelada.");
        }

        ObtenerEstado().ValidarCambio(nuevo_estado, this, usuario);

        if (nuevo_estado == Estados_Reserva.Aprobada)
        {
            VerificarDisponibilidad(reservas_del_ambiente);
        }

        Estado_Reserva = nuevo_estado;
        Fecha_Actualizacion_Reserva = ahora_utc;
    }
}
