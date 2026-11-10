using ReservaUPLA.Application.Datos;
using ReservaUPLA.Application.Interfaces;
using ReservaUPLA.Domain.Comun;
using ReservaUPLA.Domain.Entidades;
using ReservaUPLA.Domain.Enumeraciones;

namespace ReservaUPLA.Application.CasosDeUso.Ambientes.RegistrarAmbiente;

// RF-02: busca al responsable (si se indicó), averigua si el nombre ya existe, deja que la entidad valide y guarda.
public sealed class RegistrarAmbienteCasoDeUso
{
    private readonly IRepositorioDeAmbientes _repositorio_de_ambientes;
    private readonly IRepositorioDeUsuarios _repositorio_de_usuarios;

    public RegistrarAmbienteCasoDeUso(IRepositorioDeAmbientes repositorio_de_ambientes, IRepositorioDeUsuarios repositorio_de_usuarios)
    {
        _repositorio_de_ambientes = repositorio_de_ambientes;
        _repositorio_de_usuarios = repositorio_de_usuarios;
    }

    public async Task<DatosDeAmbiente> EjecutarAsync(RegistrarAmbienteComando comando, CancellationToken cancelacion = default)
    {
        var responsable_indicado = comando.Id_Responsable_Ambiente is { } id && id != Guid.Empty;
        var responsable = responsable_indicado
            ? await _repositorio_de_usuarios.ObtenerPorIdAsync(comando.Id_Responsable_Ambiente!.Value, cancelacion)
            : null;

        var nombre = Texto.NormalizarLinea(comando.Nombre_Ambiente);
        var nombre_ya_registrado = nombre.Length > 0 && await _repositorio_de_ambientes.ExisteNombreAsync(nombre, cancelacion);

        var ambiente = Ambiente.Registrar(
            comando.Nombre_Ambiente,
            comando.Tipo_Ambiente,
            comando.Capacidad_Ambiente,
            comando.Ubicacion_Ambiente,
            comando.Estado_Ambiente ?? Estados_Ambiente.Disponible,
            responsable_indicado,
            responsable,
            nombre_ya_registrado);

        await _repositorio_de_ambientes.AgregarAsync(ambiente, cancelacion);

        return new DatosDeAmbiente(
            ambiente.Id_Ambiente,
            ambiente.Nombre_Ambiente,
            ambiente.Tipo_Ambiente,
            ambiente.Capacidad_Ambiente,
            ambiente.Ubicacion_Ambiente,
            ambiente.Estado_Ambiente,
            ambiente.Id_Responsable_Ambiente,
            responsable?.Nombre_Completo_Usuario);
    }
}
