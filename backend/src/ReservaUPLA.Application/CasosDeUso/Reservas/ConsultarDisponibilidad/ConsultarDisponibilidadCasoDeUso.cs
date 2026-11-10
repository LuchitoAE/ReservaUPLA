using ReservaUPLA.Application.Datos;
using ReservaUPLA.Application.Interfaces;
using ReservaUPLA.Domain.Comun;
using ReservaUPLA.Domain.Entidades;
using ReservaUPLA.Domain.Enumeraciones;
using ReservaUPLA.Domain.Excepciones;

namespace ReservaUPLA.Application.CasosDeUso.Reservas.ConsultarDisponibilidad;

// RF-04 antes de enviar: el formulario pregunta si el horario está libre mientras el solicitante lo elige.
// Usa la misma regla del dominio que el registro (Reserva.BuscarCruceAprobado), así que nunca se contradicen.
public sealed class ConsultarDisponibilidadCasoDeUso
{
    private readonly IRepositorioDeReservas _repositorio_de_reservas;
    private readonly IRepositorioDeAmbientes _repositorio_de_ambientes;

    public ConsultarDisponibilidadCasoDeUso(IRepositorioDeReservas repositorio_de_reservas, IRepositorioDeAmbientes repositorio_de_ambientes)
    {
        _repositorio_de_reservas = repositorio_de_reservas;
        _repositorio_de_ambientes = repositorio_de_ambientes;
    }

    public async Task<DatosDeDisponibilidad> EjecutarAsync(
        Guid id_ambiente, DateOnly fecha_reserva, TimeOnly hora_inicio_reserva, TimeOnly hora_fin_reserva, CancellationToken cancelacion = default)
    {
        if (hora_fin_reserva <= hora_inicio_reserva)
        {
            throw new DatosNoValidosExcepcion(nameof(Reserva.Hora_Fin_Reserva), "La hora de fin debe ser mayor que la hora de inicio.");
        }

        var ambiente = await _repositorio_de_ambientes.ObtenerPorIdAsync(id_ambiente, cancelacion)
            ?? throw new RecursoNoEncontradoExcepcion("No existe un ambiente con el identificador indicado.");

        var reservas = await _repositorio_de_reservas.ListarDelAmbienteEnLaFechaAsync(id_ambiente, fecha_reserva, cancelacion);
        var del_dia = reservas
            .Where(reserva => reserva.Estado_Reserva is Estados_Reserva.Pendiente or Estados_Reserva.Aprobada)
            .OrderBy(reserva => reserva.Hora_Inicio_Reserva)
            .Select(reserva => new DatosDeHorarioOcupado(
                reserva.Codigo_Reserva, reserva.Hora_Inicio_Reserva, reserva.Hora_Fin_Reserva, reserva.Estado_Reserva))
            .ToList();

        if (!ambiente.AdmiteReservas())
        {
            return new DatosDeDisponibilidad(false, $"{ambiente.Nombre_Ambiente} no recibe reservas: está {ambiente.DescribirEstado()}.", del_dia);
        }

        var horario = new Horario(fecha_reserva, hora_inicio_reserva, hora_fin_reserva);
        var cruce = Reserva.BuscarCruceAprobado(id_ambiente, horario, reservas);

        return cruce is null
            ? new DatosDeDisponibilidad(true, $"{ambiente.Nombre_Ambiente} está libre {horario}.", del_dia)
            : new DatosDeDisponibilidad(false, $"{ambiente.Nombre_Ambiente} ya está reservado {cruce.ObtenerHorario()} ({cruce.Codigo_Reserva}, aprobada).", del_dia);
    }
}
