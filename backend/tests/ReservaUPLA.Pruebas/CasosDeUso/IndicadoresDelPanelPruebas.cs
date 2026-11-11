using ReservaUPLA.Application.CasosDeUso.Panel.ObtenerIndicadores;
using ReservaUPLA.Application.Datos;
using ReservaUPLA.Application.Interfaces;
using ReservaUPLA.Domain.Comun;
using ReservaUPLA.Domain.Entidades;
using ReservaUPLA.Domain.Enumeraciones;
using ReservaUPLA.Domain.Excepciones;
using ReservaUPLA.Pruebas.Dobles;

namespace ReservaUPLA.Pruebas.CasosDeUso;

// RF-12: el panel principal cuenta lo que le toca a cada rol. Al solicitante, sus reservas; al responsable, las de
// los ambientes a su cargo; al administrador, todas. El rol se lee de la base, no de la cookie.
public sealed class IndicadoresDelPanelPruebas
{
    private static readonly Func<string, ContrasenaCifrada> Cifrar = _ => new ContrasenaCifrada([1], [2]);

    private static Usuario NuevoUsuario(string codigo, RolUsuario rol) =>
        Usuario.Registrar(new DatosDeRegistroDeUsuario(
            codigo, "Persona de Prueba", $"{codigo.ToLowerInvariant()}@upla.edu.pe", rol, "Reserva2026",
            CodigoYaRegistrado: false, CorreoYaRegistrado: false, Cifrar));

    [Fact]
    public void El_solicitante_ve_solo_sus_reservas()
    {
        var solicitante = NuevoUsuario("P00914K", RolUsuario.Solicitante);

        Assert.Equal(
            new AlcanceDeIndicadores(IdSolicitante: solicitante.IdUsuario),
            AlcanceDeIndicadores.Para(solicitante));
    }

    [Fact]
    public void El_responsable_ve_las_de_sus_ambientes()
    {
        var responsable = NuevoUsuario("P00288H", RolUsuario.ResponsableDeAmbiente);

        Assert.Equal(
            new AlcanceDeIndicadores(IdResponsableAmbiente: responsable.IdUsuario),
            AlcanceDeIndicadores.Para(responsable));
    }

    [Fact]
    public void El_administrador_ve_todas()
    {
        Assert.Equal(
            AlcanceDeIndicadores.Todas,
            AlcanceDeIndicadores.Para(NuevoUsuario("ADMIN01", RolUsuario.Administrador)));
    }

    [Fact]
    public async Task El_caso_de_uso_pide_los_indicadores_con_el_alcance_del_usuario_de_la_sesion()
    {
        var repositorio = new RepositorioDeUsuariosEnMemoria();
        var solicitante = NuevoUsuario("P00914K", RolUsuario.Solicitante);
        await repositorio.AgregarAsync(solicitante);
        var consulta = new ConsultaDeIndicadoresQueAnota();

        await new ObtenerIndicadoresDelPanelCasoDeUso(repositorio, consulta).EjecutarAsync(solicitante.IdUsuario);

        Assert.Equal(AlcanceDeIndicadores.Para(solicitante), consulta.Alcance);
    }

    [Fact]
    public async Task Sin_un_usuario_activo_en_la_sesion_no_muestra_nada()
    {
        var consulta = new ConsultaDeIndicadoresQueAnota();

        await Assert.ThrowsAsync<SesionNoValidaExcepcion>(() =>
            new ObtenerIndicadoresDelPanelCasoDeUso(new RepositorioDeUsuariosEnMemoria(), consulta)
                .EjecutarAsync(Guid.NewGuid()));
        Assert.Null(consulta.Alcance);
    }

    // Doble de la consulta: anota con qué alcance se la llamó.
    private sealed class ConsultaDeIndicadoresQueAnota : IConsultaDeIndicadores
    {
        public AlcanceDeIndicadores? Alcance { get; private set; }

        public Task<DatosDeIndicadores> ObtenerAsync(
            AlcanceDeIndicadores alcance, CancellationToken cancelacion = default)
        {
            Alcance = alcance;
            return Task.FromResult(new DatosDeIndicadores(0, 0, 0, 0, 0, [], []));
        }
    }
}
