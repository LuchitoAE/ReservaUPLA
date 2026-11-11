using Microsoft.EntityFrameworkCore;
using ReservaUPLA.Application.Datos;
using ReservaUPLA.Application.Interfaces;
using ReservaUPLA.Domain.Enumeraciones;
using ReservaUPLA.Infrastructure.Persistencia;

namespace ReservaUPLA.Infrastructure.Consultas;

// Lista de ambientes para la interfaz, con el nombre de su responsable (unión con usuarios). Solo lectura.
internal sealed class ConsultaDeAmbientes : IConsultaDeAmbientes
{
    private readonly ContextoDeReservaUPLA _contexto;

    public ConsultaDeAmbientes(ContextoDeReservaUPLA contexto)
    {
        _contexto = contexto;
    }

    public async Task<IReadOnlyList<DatosDeAmbiente>> ListarAsync(
        EstadoAmbiente? estadoAmbiente, Guid? idResponsableAmbiente, CancellationToken cancelacion = default)
    {
        var ambientes = _contexto.Ambientes.AsNoTracking();

        if (estadoAmbiente is not null)
        {
            ambientes = ambientes.Where(a => a.EstadoAmbiente == estadoAmbiente);
        }

        if (idResponsableAmbiente is not null)
        {
            ambientes = ambientes.Where(a => a.IdResponsableAmbiente == idResponsableAmbiente);
        }

        return await (
                from ambiente in ambientes
                join responsable in _contexto.Usuarios
                    on ambiente.IdResponsableAmbiente equals responsable.IdUsuario into responsables
                from responsable in responsables.DefaultIfEmpty()
                orderby ambiente.NombreAmbiente
                select new DatosDeAmbiente(
                    ambiente.IdAmbiente,
                    ambiente.NombreAmbiente,
                    ambiente.TipoAmbiente,
                    ambiente.CapacidadAmbiente,
                    ambiente.UbicacionAmbiente,
                    ambiente.EstadoAmbiente,
                    ambiente.IdResponsableAmbiente,
                    responsable == null ? null : responsable.NombreCompletoUsuario))
            .ToListAsync(cancelacion);
    }
}
