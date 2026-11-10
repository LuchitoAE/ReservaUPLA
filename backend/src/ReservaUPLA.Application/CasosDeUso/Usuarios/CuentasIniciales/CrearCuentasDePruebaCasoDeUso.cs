using ReservaUPLA.Application.Interfaces;
using ReservaUPLA.Application.CasosDeUso.Usuarios.RegistrarUsuario;
using ReservaUPLA.Domain.Comun;

namespace ReservaUPLA.Application.CasosDeUso.Usuarios.CuentasIniciales;

// RNF-22: una cuenta por rol para entrar rápido a probar (ADMIN01, SOLIC01, RESPO01). Solo la llama la API en el
// entorno de desarrollo. Crea las que faltan y deja como están las que ya existen (por código o por correo).
public sealed class CrearCuentasDePruebaCasoDeUso
{
    private readonly IRepositorioDeUsuarios _repositorio_de_usuarios;
    private readonly RegistrarUsuarioCasoDeUso _registrar_usuario;

    public CrearCuentasDePruebaCasoDeUso(IRepositorioDeUsuarios repositorio_de_usuarios, RegistrarUsuarioCasoDeUso registrar_usuario)
    {
        _repositorio_de_usuarios = repositorio_de_usuarios;
        _registrar_usuario = registrar_usuario;
    }

    public async Task<IReadOnlyList<(string Codigo_Usuario, ResultadoDeCuentaInicial Resultado)>> EjecutarAsync(
        IEnumerable<CuentaInicial> cuentas, CancellationToken cancelacion = default)
    {
        var resultados = new List<(string, ResultadoDeCuentaInicial)>();

        foreach (var cuenta in cuentas)
        {
            var codigo = CodigoDeUsuario.Normalizar(cuenta.Codigo_Usuario);
            resultados.Add((codigo, await CrearSiFaltaAsync(cuenta, codigo, cancelacion)));
        }

        return resultados;
    }

    private async Task<ResultadoDeCuentaInicial> CrearSiFaltaAsync(CuentaInicial cuenta, string codigo, CancellationToken cancelacion)
    {
        if (!cuenta.EstaCompleta)
        {
            return ResultadoDeCuentaInicial.FaltanDatos;
        }

        var ya_existe = await _repositorio_de_usuarios.ExisteCodigoAsync(codigo, cancelacion)
            || await _repositorio_de_usuarios.ExisteCorreoAsync(Texto.NormalizarCorreo(cuenta.Correo_Usuario), cancelacion);
        if (ya_existe)
        {
            return ResultadoDeCuentaInicial.YaExistia;
        }

        await _registrar_usuario.EjecutarAsync(cuenta.ComoRegistro(cuenta.Rol_Usuario), cancelacion);

        return ResultadoDeCuentaInicial.Creada;
    }
}
