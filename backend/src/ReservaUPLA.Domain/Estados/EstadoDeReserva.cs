using ReservaUPLA.Domain.Entidades;
using ReservaUPLA.Domain.Enumeraciones;
using ReservaUPLA.Domain.Excepciones;

namespace ReservaUPLA.Domain.Estados;

// Patrón State: cada estado de la reserva es una clase que sabe a qué estados puede pasar, cómo se llega a ellos
// (Aprobar, Rechazar, Cancelar) y cómo explicar por qué no puede pasar a otro. La reserva no lleva una cadena de if
// por estado: le delega la transición a su estado actual (polimorfismo).
// Agregar un estado es agregar una clase y una línea en la fábrica, sin tocar las demás (OCP); cualquier estado se
// usa igual que otro a través de esta clase base (LSP).
public abstract class EstadoDeReserva
{
    public abstract EstadoReserva Valor { get; }

    // Estados a los que se puede pasar desde este. Vacío: es un estado final.
    public abstract IReadOnlyList<EstadoReserva> Siguientes { get; }

    public EstadoReserva Aprobar(Reserva reserva, Usuario usuario) =>
        Transitar(EstadoReserva.Aprobada, reserva, usuario);

    public EstadoReserva Rechazar(Reserva reserva, Usuario usuario) =>
        Transitar(EstadoReserva.Rechazada, reserva, usuario);

    public EstadoReserva Cancelar(Reserva reserva, Usuario usuario) =>
        Transitar(EstadoReserva.Cancelada, reserva, usuario);

    // Valida la transición desde este estado y para este usuario, y devuelve el estado al que se llega.
    // Lanza 409 si el estado no la admite (RN-06) y 403 si el rol no la permite (RN-05).
    protected EstadoReserva Transitar(EstadoReserva destino, Reserva reserva, Usuario usuario)
    {
        if (!Siguientes.Contains(destino))
        {
            throw new ConflictoDeNegocioExcepcion(MotivoDeNoPermitir(destino));
        }

        if (destino is EstadoReserva.Aprobada or EstadoReserva.Rechazada && !usuario.EsAdministrador())
        {
            throw new AccionNoPermitidaExcepcion("Solo un administrador puede aprobar o rechazar reservas.");
        }

        if (destino == EstadoReserva.Cancelada && !usuario.EsAdministrador() && usuario.IdUsuario != reserva.IdUsuario)
        {
            throw new AccionNoPermitidaExcepcion("Solo quien solicitó la reserva o un administrador puede cancelarla.");
        }

        return destino;
    }

    // Mensaje para un cambio que este estado no admite. Cada estado lo puede explicar a su manera.
    protected virtual string MotivoDeNoPermitir(EstadoReserva destino) =>
        $"Una reserva {Valor.ToString().ToLowerInvariant()} no puede pasar a {destino.ToString().ToLowerInvariant()}.";
}
