using ReservaUPLA.Application.DTOs;
using ReservaUPLA.Application.Interfaces;
using ReservaUPLA.Domain.Comun;
using ReservaUPLA.Domain.Entidades;
using ReservaUPLA.Domain.Enumeraciones;
using ReservaUPLA.Domain.Excepciones;

namespace ReservaUPLA.Application.UseCases.Reservas.ConsultarDisponibilidad;

// RF-04 antes de enviar: el formulario pregunta si el horario está libre mientras el solicitante lo elige.
// Usa la misma regla del dominio que el registro (Reserva.BuscarCruceAprobado), así que nunca se contradicen.
public sealed class ConsultarDisponibilidadUseCase
{
    private readonly IReservaRepository _reserva_repository;
    private readonly IAmbienteRepository _ambiente_repository;

    public ConsultarDisponibilidadUseCase(IReservaRepository reserva_repository, IAmbienteRepository ambiente_repository)
    {
        _reserva_repository = reserva_repository;
        _ambiente_repository = ambiente_repository;
    }

    public async Task<DisponibilidadDto> EjecutarAsync(
        Guid id_ambiente, DateOnly fecha_reserva, TimeOnly hora_inicio_reserva, TimeOnly hora_fin_reserva, CancellationToken cancelacion = default)
    {
        if (hora_fin_reserva <= hora_inicio_reserva)
        {
            throw new DatosNoValidosExcepcion(nameof(Reserva.Hora_Fin_Reserva), "La hora de fin debe ser mayor que la hora de inicio.");
        }

        var ambiente = await _ambiente_repository.ObtenerPorIdAsync(id_ambiente, cancelacion)
            ?? throw new RecursoNoEncontradoExcepcion("No existe un ambiente con el identificador indicado.");

        var reservas = await _reserva_repository.ListarDelAmbienteEnLaFechaAsync(id_ambiente, fecha_reserva, cancelacion);
        var del_dia = reservas
            .Where(reserva => reserva.Estado_Reserva is Estados_Reserva.Pendiente or Estados_Reserva.Aprobada)
            .OrderBy(reserva => reserva.Hora_Inicio_Reserva)
            .Select(reserva => new HorarioOcupadoDto(
                reserva.Codigo_Reserva, reserva.Hora_Inicio_Reserva, reserva.Hora_Fin_Reserva, reserva.Estado_Reserva))
            .ToList();

        if (!ambiente.AdmiteReservas())
        {
            return new DisponibilidadDto(false, $"{ambiente.Nombre_Ambiente} no recibe reservas: está {ambiente.DescribirEstado()}.", del_dia);
        }

        var horario = new Horario(fecha_reserva, hora_inicio_reserva, hora_fin_reserva);
        var cruce = Reserva.BuscarCruceAprobado(id_ambiente, horario, reservas);

        return cruce is null
            ? new DisponibilidadDto(true, $"{ambiente.Nombre_Ambiente} está libre {horario}.", del_dia)
            : new DisponibilidadDto(false, $"{ambiente.Nombre_Ambiente} ya está reservado {cruce.ObtenerHorario()} ({cruce.Codigo_Reserva}, aprobada).", del_dia);
    }
}
