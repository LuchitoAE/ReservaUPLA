using Microsoft.Extensions.DependencyInjection;
using ReservaUPLA.Application.CasosDeUso.Ambientes.RegistrarAmbiente;
using ReservaUPLA.Application.CasosDeUso.Autenticacion.IniciarSesion;
using ReservaUPLA.Application.CasosDeUso.Cuenta.CambiarContrasena;
using ReservaUPLA.Application.CasosDeUso.Reservas.CambiarEstadoReserva;
using ReservaUPLA.Application.CasosDeUso.Reservas.ConsultarDisponibilidad;
using ReservaUPLA.Application.CasosDeUso.Reservas.RegistrarReserva;
using ReservaUPLA.Application.CasosDeUso.Usuarios.CuentasIniciales;
using ReservaUPLA.Application.CasosDeUso.Usuarios.RegistrarUsuario;

namespace ReservaUPLA.Application;

// Registra los casos de uso de esta capa.
public static class RegistroDeServicios
{
    public static IServiceCollection AgregarAplicacion(this IServiceCollection servicios)
    {
        servicios.AddScoped<IniciarSesionCasoDeUso>();
        servicios.AddScoped<CambiarContrasenaCasoDeUso>();
        servicios.AddScoped<RegistrarUsuarioCasoDeUso>();
        servicios.AddScoped<CrearPrimerAdministradorCasoDeUso>();
        servicios.AddScoped<CrearCuentasDePruebaCasoDeUso>();
        servicios.AddScoped<RegistrarAmbienteCasoDeUso>();
        servicios.AddScoped<RegistrarReservaCasoDeUso>();
        servicios.AddScoped<ConsultarDisponibilidadCasoDeUso>();
        servicios.AddScoped<CambiarEstadoReservaCasoDeUso>();

        return servicios;
    }
}
