using Microsoft.EntityFrameworkCore;
using ReservaUPLA.Application.DTOs;
using ReservaUPLA.Application.Interfaces;
using ReservaUPLA.Domain.Enums;
using ReservaUPLA.Infrastructure.Persistence;

namespace ReservaUPLA.Infrastructure.Consultas;

// Lista de ambientes para la interfaz, con el nombre de su responsable (unión con usuarios). Solo lectura.
internal sealed class ConsultaDeAmbientes : IConsultaDeAmbientes
{
    private readonly ReservaUPLADbContext _contexto;

    public ConsultaDeAmbientes(ReservaUPLADbContext contexto)
    {
        _contexto = contexto;
    }

    public async Task<IReadOnlyList<AmbienteDto>> ListarAsync(
        Estados_Ambiente? estado_ambiente, Guid? id_responsable_ambiente, CancellationToken cancelacion = default)
    {
        var ambientes = _contexto.Ambientes.AsNoTracking();

        if (estado_ambiente is not null)
        {
            ambientes = ambientes.Where(a => a.Estado_Ambiente == estado_ambiente);
        }

        if (id_responsable_ambiente is not null)
        {
            ambientes = ambientes.Where(a => a.Id_Responsable_Ambiente == id_responsable_ambiente);
        }

        return await (
                from ambiente in ambientes
                join responsable in _contexto.Usuarios on ambiente.Id_Responsable_Ambiente equals responsable.Id_Usuario into responsables
                from responsable in responsables.DefaultIfEmpty()
                orderby ambiente.Nombre_Ambiente
                select new AmbienteDto(
                    ambiente.Id_Ambiente,
                    ambiente.Nombre_Ambiente,
                    ambiente.Tipo_Ambiente,
                    ambiente.Capacidad_Ambiente,
                    ambiente.Ubicacion_Ambiente,
                    ambiente.Estado_Ambiente,
                    ambiente.Id_Responsable_Ambiente,
                    responsable == null ? null : responsable.Nombre_Completo_Usuario))
            .ToListAsync(cancelacion);
    }
}
