using ReservaUPLA.Application.DTOs;
using ReservaUPLA.Application.Interfaces;
using ReservaUPLA.Domain.Common;
using ReservaUPLA.Domain.Entities;
using ReservaUPLA.Domain.Enums;

namespace ReservaUPLA.Application.UseCases.Ambientes.RegistrarAmbiente;

// RF-02: busca al responsable (si se indicó), averigua si el nombre ya existe, deja que la entidad valide y guarda.
public sealed class RegistrarAmbienteUseCase
{
    private readonly IAmbienteRepository _ambiente_repository;
    private readonly IUsuarioRepository _usuario_repository;

    public RegistrarAmbienteUseCase(IAmbienteRepository ambiente_repository, IUsuarioRepository usuario_repository)
    {
        _ambiente_repository = ambiente_repository;
        _usuario_repository = usuario_repository;
    }

    public async Task<AmbienteDto> EjecutarAsync(RegistrarAmbienteCommand comando, CancellationToken cancelacion = default)
    {
        var responsable_indicado = comando.Id_Responsable_Ambiente is { } id && id != Guid.Empty;
        var responsable = responsable_indicado
            ? await _usuario_repository.ObtenerPorIdAsync(comando.Id_Responsable_Ambiente!.Value, cancelacion)
            : null;

        var nombre = Texto.NormalizarLinea(comando.Nombre_Ambiente);
        var nombre_ya_registrado = nombre.Length > 0 && await _ambiente_repository.ExisteNombreAsync(nombre, cancelacion);

        var ambiente = Ambiente.Registrar(
            comando.Nombre_Ambiente,
            comando.Tipo_Ambiente,
            comando.Capacidad_Ambiente,
            comando.Ubicacion_Ambiente,
            comando.Estado_Ambiente ?? Estados_Ambiente.Disponible,
            responsable_indicado,
            responsable,
            nombre_ya_registrado);

        await _ambiente_repository.AgregarAsync(ambiente, cancelacion);

        return new AmbienteDto(
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
