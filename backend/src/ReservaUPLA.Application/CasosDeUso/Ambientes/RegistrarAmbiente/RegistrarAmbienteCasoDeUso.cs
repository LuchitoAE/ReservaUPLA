using ReservaUPLA.Application.Datos;
using ReservaUPLA.Application.Interfaces;
using ReservaUPLA.Domain.Comun;
using ReservaUPLA.Domain.Entidades;
using ReservaUPLA.Domain.Enumeraciones;

namespace ReservaUPLA.Application.CasosDeUso.Ambientes.RegistrarAmbiente;

// RF-02: busca al responsable (si se indicó), averigua si el nombre ya existe, deja que la entidad valide y guarda.
public sealed class RegistrarAmbienteCasoDeUso
{
    private readonly IRepositorioDeAmbientes _repositorioDeAmbientes;
    private readonly IRepositorioDeUsuarios _repositorioDeUsuarios;

    public RegistrarAmbienteCasoDeUso(
        IRepositorioDeAmbientes repositorioDeAmbientes, IRepositorioDeUsuarios repositorioDeUsuarios)
    {
        _repositorioDeAmbientes = repositorioDeAmbientes;
        _repositorioDeUsuarios = repositorioDeUsuarios;
    }

    public async Task<DatosDeAmbiente> EjecutarAsync(
        RegistrarAmbienteComando comando, CancellationToken cancelacion = default)
    {
        var responsableIndicado = comando.IdResponsableAmbiente is { } id && id != Guid.Empty;
        var responsable = responsableIndicado
            ? await _repositorioDeUsuarios.ObtenerPorIdAsync(comando.IdResponsableAmbiente!.Value, cancelacion)
            : null;

        var nombre = Texto.NormalizarLinea(comando.NombreAmbiente);
        var nombreYaRegistrado = nombre.Length > 0
            && await _repositorioDeAmbientes.ExisteNombreAsync(nombre, cancelacion);

        var ambiente = Ambiente.Registrar(new DatosDeRegistroDeAmbiente(
            comando.NombreAmbiente,
            comando.TipoAmbiente,
            comando.CapacidadAmbiente,
            comando.UbicacionAmbiente,
            comando.EstadoAmbiente ?? EstadoAmbiente.Disponible,
            responsableIndicado,
            responsable,
            nombreYaRegistrado));

        await _repositorioDeAmbientes.AgregarAsync(ambiente, cancelacion);

        return new DatosDeAmbiente(
            ambiente.IdAmbiente,
            ambiente.NombreAmbiente,
            ambiente.TipoAmbiente,
            ambiente.CapacidadAmbiente,
            ambiente.UbicacionAmbiente,
            ambiente.EstadoAmbiente,
            ambiente.IdResponsableAmbiente,
            responsable?.NombreCompletoUsuario);
    }
}
