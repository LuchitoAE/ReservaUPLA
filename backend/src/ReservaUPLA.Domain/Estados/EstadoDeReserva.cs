using ReservaUPLA.Domain.Entities;
using ReservaUPLA.Domain.Enums;
using ReservaUPLA.Domain.Exceptions;

namespace ReservaUPLA.Domain.Estados;

// Patrón State: cada estado de la reserva es una clase que sabe a qué estados puede pasar y cómo explicar por qué
// no puede pasar a otro. La reserva no lleva una cadena de if por estado: le pregunta a su estado actual (polimorfismo).
// Agregar un estado es agregar una clase y una línea en la fábrica, sin tocar las demás (OCP); cualquier estado se
// usa igual que otro a través de esta clase base (LSP).
public abstract class EstadoDeReserva
{
    public abstract Estados_Reserva Valor { get; }

    // Estados a los que se puede pasar desde este. Vacío: es un estado final.
    public abstract IReadOnlyList<Estados_Reserva> Siguientes { get; }

    // Comprueba que el cambio esté permitido desde este estado y para este usuario; si no, lanza la excepción que
    // corresponde: 409 si el estado no lo admite (RN-06) y 403 si el rol no lo permite (RN-05).
    public void ValidarCambio(Estados_Reserva destino, Reserva reserva, Usuario usuario)
    {
        if (!Siguientes.Contains(destino))
        {
            throw new ConflictoDeNegocioException(MotivoDeNoPermitir(destino));
        }

        if (destino is Estados_Reserva.Aprobada or Estados_Reserva.Rechazada && !usuario.EsAdministrador())
        {
            throw new AccionNoPermitidaException("Solo un administrador puede aprobar o rechazar reservas (RN-05).");
        }

        if (destino == Estados_Reserva.Cancelada && !usuario.EsAdministrador() && usuario.Id_Usuario != reserva.Id_Usuario)
        {
            throw new AccionNoPermitidaException("Solo quien solicitó la reserva o un administrador puede cancelarla.");
        }
    }

    // Mensaje para un cambio que este estado no admite. Cada estado lo puede explicar a su manera.
    protected virtual string MotivoDeNoPermitir(Estados_Reserva destino) =>
        $"Una reserva {Valor} no puede pasar a {destino}.";
}
