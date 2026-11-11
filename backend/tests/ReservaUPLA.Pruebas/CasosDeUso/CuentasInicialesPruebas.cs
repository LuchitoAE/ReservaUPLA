using ReservaUPLA.Application.CasosDeUso.Usuarios.CuentasIniciales;
using ReservaUPLA.Application.CasosDeUso.Usuarios.RegistrarUsuario;
using ReservaUPLA.Domain.Enumeraciones;
using ReservaUPLA.Pruebas.Dobles;

namespace ReservaUPLA.Pruebas.CasosDeUso;

// RF-15 y RNF-22: el primer administrador y las cuentas de prueba se crean al arrancar, sin registro propio.
public sealed class CuentasInicialesPruebas
{
    private readonly RepositorioDeUsuariosEnMemoria _repositorio = new();
    private readonly ProtectorDeContrasenasFalso _protectorDeContrasenas = new();

    private static readonly CuentaInicial Admin =
        new("ADMIN01", "Administrador UPLA", "admin@upla.edu.pe", RolUsuario.Administrador, "Admin2026");

    private CrearPrimerAdministradorCasoDeUso PrimerAdministrador() =>
        new(_repositorio, new RegistrarUsuarioCasoDeUso(_repositorio, _protectorDeContrasenas));

    private CrearCuentasDePruebaCasoDeUso CuentasDePrueba() =>
        new(_repositorio, new RegistrarUsuarioCasoDeUso(_repositorio, _protectorDeContrasenas));

    [Fact]
    public async Task Crea_el_primer_administrador_si_no_hay_ninguno()
    {
        var resultado = await PrimerAdministrador().EjecutarAsync(Admin);

        Assert.Equal(ResultadoDeCuentaInicial.Creada, resultado);
        var admin = Assert.Single(_repositorio.Usuarios);
        Assert.Equal(RolUsuario.Administrador, admin.RolUsuario);
        Assert.Equal("ADMIN01", admin.CodigoUsuario);
    }

    [Fact]
    public async Task No_hace_nada_si_ya_hay_un_administrador_activo()
    {
        await PrimerAdministrador().EjecutarAsync(Admin);

        var resultado = await PrimerAdministrador().EjecutarAsync(
            Admin with { CodigoUsuario = "ADMIN02", CorreoUsuario = "otro@upla.edu.pe" });

        Assert.Equal(ResultadoDeCuentaInicial.YaExistia, resultado);
        Assert.Single(_repositorio.Usuarios);
    }

    [Fact]
    public async Task Avisa_si_faltan_los_datos_configurados()
    {
        var resultado = await PrimerAdministrador().EjecutarAsync(Admin with { ContrasenaUsuario = "" });

        Assert.Equal(ResultadoDeCuentaInicial.FaltanDatos, resultado);
        Assert.Empty(_repositorio.Usuarios);
    }

    [Fact]
    public async Task El_primer_administrador_siempre_es_administrador()
    {
        await PrimerAdministrador().EjecutarAsync(Admin with { RolUsuario = RolUsuario.Solicitante });

        Assert.Equal(RolUsuario.Administrador, Assert.Single(_repositorio.Usuarios).RolUsuario);
    }

    [Fact]
    public async Task Crea_solo_las_cuentas_de_prueba_que_faltan()
    {
        await PrimerAdministrador().EjecutarAsync(Admin);
        CuentaInicial[] cuentas =
        [
            Admin,
            new("SOLIC01", "Solicitante de prueba", "solicitante@upla.edu.pe", RolUsuario.Solicitante, "Solic2026"),
            new("RESPO01", "Responsable de prueba", "responsable@upla.edu.pe", RolUsuario.ResponsableDeAmbiente, "Respo2026"),
        ];

        var resultados = await CuentasDePrueba().EjecutarAsync(cuentas);

        Assert.Equal(
            [ResultadoDeCuentaInicial.YaExistia, ResultadoDeCuentaInicial.Creada, ResultadoDeCuentaInicial.Creada],
            resultados.Select(r => r.Resultado));
        Assert.Equal(3, _repositorio.Usuarios.Count);
    }
}
