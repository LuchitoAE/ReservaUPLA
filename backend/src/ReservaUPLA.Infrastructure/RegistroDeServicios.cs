using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using ReservaUPLA.Application.Interfaces;
using ReservaUPLA.Infrastructure.Consultas;
using ReservaUPLA.Infrastructure.Persistencia;
using ReservaUPLA.Infrastructure.Repositorios;
using ReservaUPLA.Infrastructure.Servicios;

namespace ReservaUPLA.Infrastructure;

// Conecta los contratos de la capa de Aplicación con su implementación en PostgreSQL.
public static class RegistroDeServicios
{
    public static IServiceCollection AgregarInfraestructura(this IServiceCollection servicios, string cadena_conexion)
    {
        servicios.AddDbContext<ContextoDeReservaUPLA>(opciones => opciones.UseNpgsql(cadena_conexion));

        servicios.AddSingleton<IReloj, RelojDelSistema>();
        servicios.AddSingleton<IProtectorDeContrasenas, ProtectorPbkdf2>();

        // Guardar entidades (repositorios) y leer para mostrar (consultas): cada contrato con su clase.
        servicios.AddScoped<IRepositorioDeUsuarios, RepositorioDeUsuarios>();
        servicios.AddScoped<IConsultaDeUsuarios, ConsultaDeUsuarios>();
        servicios.AddScoped<IRepositorioDeAmbientes, RepositorioDeAmbientes>();
        servicios.AddScoped<IConsultaDeAmbientes, ConsultaDeAmbientes>();
        servicios.AddScoped<IRepositorioDeReservas, RepositorioDeReservas>();
        servicios.AddScoped<IConsultaDeReservas, ConsultaDeReservas>();
        servicios.AddScoped<IConsultaDeIndicadores, ConsultaDeIndicadores>();

        return servicios;
    }
}
