using ReservaUPLA.Application.Datos;
using ReservaUPLA.Application.Interfaces;
using ReservaUPLA.Domain.Excepciones;

namespace ReservaUPLA.Application.CasosDeUso.Panel.ObtenerIndicadores;

// RF-08 y RF-12: los indicadores del panel principal según el rol del usuario de la sesión. El rol se lee de la base
// (como al aprobar, RN-05): si cambió, el panel ya lo refleja. La consulta solo cuenta; esta clase decide qué cuenta.
public sealed class ObtenerIndicadoresDelPanelCasoDeUso
{
    private readonly IRepositorioDeUsuarios _repositorio_de_usuarios;
    private readonly IConsultaDeIndicadores _consulta_de_indicadores;

    public ObtenerIndicadoresDelPanelCasoDeUso(IRepositorioDeUsuarios repositorio_de_usuarios, IConsultaDeIndicadores consulta_de_indicadores)
    {
        _repositorio_de_usuarios = repositorio_de_usuarios;
        _consulta_de_indicadores = consulta_de_indicadores;
    }

    public async Task<DatosDeIndicadores> EjecutarAsync(Guid id_usuario_sesion, CancellationToken cancelacion = default)
    {
        var usuario = await _repositorio_de_usuarios.ObtenerPorIdAsync(id_usuario_sesion, cancelacion);
        if (usuario is null || !usuario.Activo_Usuario)
        {
            throw new SesionNoValidaExcepcion("Su sesión ya no es válida. Vuelva a ingresar.");
        }

        return await _consulta_de_indicadores.ObtenerAsync(AlcanceDeIndicadores.Para(usuario), cancelacion);
    }
}
