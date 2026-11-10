using ReservaUPLA.Domain.Entidades;

namespace ReservaUPLA.Application.Interfaces;

// Lo que los casos de uso necesitan para guardar y leer ambientes. Lo implementa la Infraestructura.
public interface IRepositorioDeAmbientes
{
    Task<Ambiente?> ObtenerPorIdAsync(Guid id_ambiente, CancellationToken cancelacion = default);

    // Sin distinguir mayúsculas: «Auditorio central» y «AUDITORIO CENTRAL» son el mismo ambiente.
    Task<bool> ExisteNombreAsync(string nombre_ambiente, CancellationToken cancelacion = default);

    Task AgregarAsync(Ambiente ambiente, CancellationToken cancelacion = default);
}
