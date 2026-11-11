using ReservaUPLA.Application.CasosDeUso.Usuarios.RegistrarUsuario;
using ReservaUPLA.Application.Interfaces;
using ReservaUPLA.Domain.Comun;

namespace ReservaUPLA.Application.CasosDeUso.Usuarios.CuentasIniciales;

// RNF-22: una cuenta por rol para entrar rápido a probar (ADMIN01, SOLIC01, RESPO01). Solo la llama la API en el
// entorno de desarrollo. Crea las que faltan y deja como están las que ya existen (por código o por correo).
public sealed class CrearCuentasDePruebaCasoDeUso
{
    private readonly IRepositorioDeUsuarios _repositorioDeUsuarios;
    private readonly RegistrarUsuarioCasoDeUso _registrarUsuario;

    public CrearCuentasDePruebaCasoDeUso(
        IRepositorioDeUsuarios repositorioDeUsuarios, RegistrarUsuarioCasoDeUso registrarUsuario)
    {
        _repositorioDeUsuarios = repositorioDeUsuarios;
        _registrarUsuario = registrarUsuario;
    }

    public async Task<IReadOnlyList<(string CodigoUsuario, ResultadoDeCuentaInicial Resultado)>> EjecutarAsync(
        IEnumerable<CuentaInicial> cuentas, CancellationToken cancelacion = default)
    {
        var resultados = new List<(string, ResultadoDeCuentaInicial)>();

        foreach (var cuenta in cuentas)
        {
            var codigo = CodigoDeUsuario.Normalizar(cuenta.CodigoUsuario);
            resultados.Add((codigo, await CrearSiFaltaAsync(cuenta, codigo, cancelacion)));
        }

        return resultados;
    }

    private async Task<ResultadoDeCuentaInicial> CrearSiFaltaAsync(
        CuentaInicial cuenta, string codigo, CancellationToken cancelacion)
    {
        if (!cuenta.EstaCompleta)
        {
            return ResultadoDeCuentaInicial.FaltanDatos;
        }

        var yaExiste = await _repositorioDeUsuarios.ExisteCodigoAsync(codigo, cancelacion)
            || await _repositorioDeUsuarios.ExisteCorreoAsync(
                Texto.NormalizarCorreo(cuenta.CorreoUsuario), cancelacion);
        if (yaExiste)
        {
            return ResultadoDeCuentaInicial.YaExistia;
        }

        await _registrarUsuario.EjecutarAsync(cuenta.ComoRegistro(cuenta.RolUsuario), cancelacion);

        return ResultadoDeCuentaInicial.Creada;
    }
}
