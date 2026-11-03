using Microsoft.Extensions.DependencyInjection;

namespace ReservaUPLA.Application;

// Registra los casos de uso de esta capa.
public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        return services;
    }
}
