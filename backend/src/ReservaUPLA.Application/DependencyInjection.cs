using Microsoft.Extensions.DependencyInjection;
using ReservaUPLA.Application.UseCases.Ambientes.RegistrarAmbiente;
using ReservaUPLA.Application.UseCases.Reservas.ConsultarDisponibilidad;
using ReservaUPLA.Application.UseCases.Reservas.RegistrarReserva;
using ReservaUPLA.Application.UseCases.Usuarios.RegistrarUsuario;

namespace ReservaUPLA.Application;

// Registra los casos de uso de esta capa.
public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<RegistrarUsuarioUseCase>();
        services.AddScoped<RegistrarAmbienteUseCase>();
        services.AddScoped<RegistrarReservaUseCase>();
        services.AddScoped<ConsultarDisponibilidadUseCase>();

        return services;
    }
}
