using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using ReservaUPLA.Application.Interfaces;
using ReservaUPLA.Infrastructure.Persistence;
using ReservaUPLA.Infrastructure.Servicios;

namespace ReservaUPLA.Infrastructure;

// Conecta los contratos de la capa de Aplicación con su implementación en PostgreSQL.
public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, string cadena_conexion)
    {
        services.AddDbContext<ReservaUPLADbContext>(opciones => opciones.UseNpgsql(cadena_conexion));

        services.AddSingleton<IReloj, RelojDelSistema>();

        return services;
    }
}
