using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using ReservaUPLA.Application.Interfaces;
using ReservaUPLA.Infrastructure.Consultas;
using ReservaUPLA.Infrastructure.Persistence;
using ReservaUPLA.Infrastructure.Repositories;
using ReservaUPLA.Infrastructure.Servicios;

namespace ReservaUPLA.Infrastructure;

// Conecta los contratos de la capa de Aplicación con su implementación en PostgreSQL.
public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, string cadena_conexion)
    {
        services.AddDbContext<ReservaUPLADbContext>(opciones => opciones.UseNpgsql(cadena_conexion));

        services.AddSingleton<IReloj, RelojDelSistema>();
        services.AddSingleton<IProtectorDeContrasenas, HasherPbkdf2>();

        // Guardar entidades (repositorios) y leer para mostrar (consultas): cada contrato con su clase.
        services.AddScoped<IRepositorioDeUsuarios, UsuarioRepository>();
        services.AddScoped<IConsultaDeUsuarios, ConsultaDeUsuarios>();
        services.AddScoped<IRepositorioDeAmbientes, AmbienteRepository>();
        services.AddScoped<IConsultaDeAmbientes, ConsultaDeAmbientes>();
        services.AddScoped<IRepositorioDeReservas, ReservaRepository>();
        services.AddScoped<IConsultaDeReservas, ConsultaDeReservas>();
        services.AddScoped<IConsultaDeIndicadores, ConsultaDeIndicadores>();

        return services;
    }
}
