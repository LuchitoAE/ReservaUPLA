using ReservaUPLA.Application.DTOs;

namespace ReservaUPLA.Application.Interfaces;

// Módulo de salida del dashboard (RF-08). Interfaz propia, separada de la de reservas: quien solo muestra
// indicadores no depende de métodos que no usa (ISP).
public interface IConsultaDeIndicadores
{
    Task<IndicadoresDto> ObtenerAsync(CancellationToken cancelacion = default);
}
