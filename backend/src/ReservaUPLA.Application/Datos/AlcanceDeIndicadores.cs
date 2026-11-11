using ReservaUPLA.Domain.Entidades;
using ReservaUPLA.Domain.Enumeraciones;

namespace ReservaUPLA.Application.Datos;

// Qué reservas cuenta el panel principal de cada rol (RF-12): el solicitante, las suyas; el responsable, las de los
// ambientes a su cargo (y solo esos ambientes); el administrador, todas. Los dos en null: todas.
public sealed record AlcanceDeIndicadores(Guid? IdSolicitante = null, Guid? IdResponsableAmbiente = null)
{
    public static readonly AlcanceDeIndicadores Todas = new();

    public static AlcanceDeIndicadores Para(Usuario usuario) => usuario.RolUsuario switch
    {
        RolUsuario.Solicitante => new AlcanceDeIndicadores(IdSolicitante: usuario.IdUsuario),
        RolUsuario.ResponsableDeAmbiente => new AlcanceDeIndicadores(IdResponsableAmbiente: usuario.IdUsuario),
        _ => Todas,
    };
}
