using ReservaUPLA.Application.Datos;
using ReservaUPLA.Application.Interfaces;
using ReservaUPLA.Domain.Excepciones;

namespace ReservaUPLA.Application.CasosDeUso.Panel.ObtenerIndicadores;

// RF-08 y RF-12: los indicadores del panel principal según el rol del usuario de la sesión. El rol se lee de la base
// (como al aprobar, RN-05): si cambió, el panel ya lo refleja. La consulta solo cuenta; esta clase decide qué cuenta.
public sealed class ObtenerIndicadoresDelPanelCasoDeUso
{
    private readonly IRepositorioDeUsuarios _repositorioDeUsuarios;
    private readonly IConsultaDeIndicadores _consultaDeIndicadores;

    public ObtenerIndicadoresDelPanelCasoDeUso(
        IRepositorioDeUsuarios repositorioDeUsuarios, IConsultaDeIndicadores consultaDeIndicadores)
    {
        _repositorioDeUsuarios = repositorioDeUsuarios;
        _consultaDeIndicadores = consultaDeIndicadores;
    }

    public async Task<DatosDeIndicadores> EjecutarAsync(
        Guid idUsuarioSesion, CancellationToken cancelacion = default)
    {
        var usuario = await _repositorioDeUsuarios.ObtenerPorIdAsync(idUsuarioSesion, cancelacion);
        if (usuario is null || !usuario.ActivoUsuario)
        {
            throw new SesionNoValidaExcepcion("Su sesión ya no es válida. Vuelva a ingresar.");
        }

        return await _consultaDeIndicadores.ObtenerAsync(AlcanceDeIndicadores.Para(usuario), cancelacion);
    }
}
