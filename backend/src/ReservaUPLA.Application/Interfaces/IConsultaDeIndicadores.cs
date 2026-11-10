using ReservaUPLA.Application.Datos;

namespace ReservaUPLA.Application.Interfaces;

// Módulo de salida del dashboard (RF-08). Interfaz propia, separada de la de reservas: quien solo muestra
// indicadores no depende de métodos que no usa (ISP).
public interface IConsultaDeIndicadores
{
    Task<DatosDeIndicadores> ObtenerAsync(CancellationToken cancelacion = default);
}
