using ReservaUPLA.Domain.Entidades;
using ReservaUPLA.Domain.Enumeraciones;

namespace ReservaUPLA.Application.Datos;

// Qué reservas cuenta el panel principal de cada rol (RF-12): el solicitante, las suyas; el responsable, las de los
// ambientes a su cargo (y solo esos ambientes); el administrador, todas. Los dos en null: todas.
public sealed record AlcanceDeIndicadores(Guid? Id_Solicitante = null, Guid? Id_Responsable_Ambiente = null)
{
    public static readonly AlcanceDeIndicadores Todas = new();

    public static AlcanceDeIndicadores Para(Usuario usuario) => usuario.Rol_Usuario switch
    {
        Roles_Usuario.Solicitante => new AlcanceDeIndicadores(Id_Solicitante: usuario.Id_Usuario),
        Roles_Usuario.ResponsableDeAmbiente => new AlcanceDeIndicadores(Id_Responsable_Ambiente: usuario.Id_Usuario),
        _ => Todas,
    };
}
