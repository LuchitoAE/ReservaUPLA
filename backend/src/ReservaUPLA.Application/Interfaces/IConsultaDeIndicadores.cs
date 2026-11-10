using ReservaUPLA.Application.Datos;

namespace ReservaUPLA.Application.Interfaces;

// Módulo de salida del panel principal (RF-08, RF-12). Interfaz propia, separada de la de reservas: quien solo muestra
// indicadores no depende de métodos que no usa (ISP). Cuenta dentro del alcance que recibe (ver AlcanceDeIndicadores).
public interface IConsultaDeIndicadores
{
    Task<DatosDeIndicadores> ObtenerAsync(AlcanceDeIndicadores alcance, CancellationToken cancelacion = default);
}
