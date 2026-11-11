using ReservaUPLA.Application.Datos;
using ReservaUPLA.Application.Interfaces;
using ReservaUPLA.Domain.Comun;
using ReservaUPLA.Domain.Entidades;
using ReservaUPLA.Domain.Enumeraciones;
using ReservaUPLA.Domain.Excepciones;

namespace ReservaUPLA.Application.CasosDeUso.Reservas.ConsultarDisponibilidad;

// RF-04 antes de enviar: el formulario pregunta si el horario está libre mientras el solicitante lo elige.
// Usa la misma regla del dominio que el registro (Agenda), así que nunca se contradicen.
public sealed class ConsultarDisponibilidadCasoDeUso
{
    private readonly IRepositorioDeReservas _repositorioDeReservas;
    private readonly IRepositorioDeAmbientes _repositorioDeAmbientes;

    public ConsultarDisponibilidadCasoDeUso(
        IRepositorioDeReservas repositorioDeReservas, IRepositorioDeAmbientes repositorioDeAmbientes)
    {
        _repositorioDeReservas = repositorioDeReservas;
        _repositorioDeAmbientes = repositorioDeAmbientes;
    }

    public async Task<DatosDeDisponibilidad> EjecutarAsync(
        Guid idAmbiente,
        DateOnly fechaReserva,
        TimeOnly horaInicioReserva,
        TimeOnly horaFinReserva,
        CancellationToken cancelacion = default)
    {
        if (horaFinReserva <= horaInicioReserva)
        {
            throw new DatosNoValidosExcepcion(
                nameof(Reserva.HoraFinReserva), "La hora de fin debe ser mayor que la hora de inicio.");
        }

        var ambiente = await _repositorioDeAmbientes.ObtenerPorIdAsync(idAmbiente, cancelacion)
            ?? throw new RecursoNoEncontradoExcepcion("No existe un ambiente con el identificador indicado.");

        var reservas = await _repositorioDeReservas.ListarDelAmbienteEnLaFechaAsync(
            idAmbiente, fechaReserva, cancelacion);
        var delDia = reservas
            .Where(reserva => reserva.EstadoReserva is EstadoReserva.Pendiente or EstadoReserva.Aprobada)
            .OrderBy(reserva => reserva.HoraInicioReserva)
            .Select(reserva => new DatosDeHorarioOcupado(
                reserva.CodigoReserva, reserva.HoraInicioReserva, reserva.HoraFinReserva, reserva.EstadoReserva))
            .ToList();

        if (!ambiente.AdmiteReservas())
        {
            return new DatosDeDisponibilidad(
                false,
                $"{ambiente.NombreAmbiente} no recibe reservas: está {ambiente.DescribirEstado()}.",
                delDia);
        }

        var horario = new Horario(fechaReserva, horaInicioReserva, horaFinReserva);
        var cruce = Agenda.De(reservas).CruceAprobadoCon(horario);

        return cruce is null
            ? new DatosDeDisponibilidad(true, $"{ambiente.NombreAmbiente} está libre {horario}.", delDia)
            : new DatosDeDisponibilidad(
                false,
                $"{ambiente.NombreAmbiente} ya está reservado {cruce.ObtenerHorario()} ({cruce.CodigoReserva}, aprobada).",
                delDia);
    }
}
