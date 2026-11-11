using System.Text.Json;
using ReservaUPLA.Application.CasosDeUso.Autenticacion.IniciarSesion;
using ReservaUPLA.Application.CasosDeUso.Reservas.RegistrarReserva;
using ReservaUPLA.Application.Datos;
using ReservaUPLA.Domain.Enumeraciones;
using ReservaUPLA.WebApi.Json;
using ReservaUPLA.WebApi.Respuestas;

namespace ReservaUPLA.Pruebas.Contrato;

// El contrato de la API no cambia con el refactor: las claves siguen en snake_case, los enums como texto y las
// horas como «HH:mm». Se prueba la misma configuración que usa Program.cs.
public sealed class ContratoJsonPruebas
{
    private static readonly JsonSerializerOptions Opciones = CrearOpciones();

    private static JsonSerializerOptions CrearOpciones()
    {
        var opciones = new JsonSerializerOptions();
        ConfiguracionDeJson.Aplicar(opciones);
        return opciones;
    }

    [Fact]
    public void Las_respuestas_exitosas_conservan_sus_claves()
    {
        var datos = new DatosDeUsuario(
            Guid.NewGuid(), "P00914K", "Luis Aquino Espinoza", "luis.aquino@upla.edu.pe", RolUsuario.Solicitante, true);

        using var documento = JsonDocument.Parse(
            JsonSerializer.Serialize(RespuestaApi.Exito(datos, "Sesión de Luis Aquino Espinoza."), Opciones));
        var raiz = documento.RootElement;

        Assert.True(raiz.GetProperty("success").GetBoolean());
        Assert.Equal("Sesión de Luis Aquino Espinoza.", raiz.GetProperty("message").GetString());
        var usuario = raiz.GetProperty("data");
        Assert.Equal("P00914K", usuario.GetProperty("codigo_usuario").GetString());
        Assert.Equal("Luis Aquino Espinoza", usuario.GetProperty("nombre_completo_usuario").GetString());
        Assert.Equal("luis.aquino@upla.edu.pe", usuario.GetProperty("correo_usuario").GetString());
        Assert.Equal("Solicitante", usuario.GetProperty("rol_usuario").GetString());
        Assert.True(usuario.GetProperty("activo_usuario").GetBoolean());
        Assert.True(usuario.TryGetProperty("id_usuario", out _));
    }

    [Fact]
    public void Las_horas_y_los_estados_viajan_como_antes()
    {
        var horario = new DatosDeHorarioOcupado(
            "RES-2026-0001", new TimeOnly(9, 30), new TimeOnly(11, 0), EstadoReserva.Aprobada);

        using var documento = JsonDocument.Parse(JsonSerializer.Serialize(horario, Opciones));
        var raiz = documento.RootElement;

        Assert.Equal("RES-2026-0001", raiz.GetProperty("codigo_reserva").GetString());
        Assert.Equal("09:30", raiz.GetProperty("hora_inicio_reserva").GetString());
        Assert.Equal("11:00", raiz.GetProperty("hora_fin_reserva").GetString());
        Assert.Equal("Aprobada", raiz.GetProperty("estado_reserva").GetString());
    }

    [Fact]
    public void Los_comandos_se_leen_con_las_mismas_claves_y_horas()
    {
        var ingreso = JsonSerializer.Deserialize<IniciarSesionComando>(
            """{"codigo_usuario":"p00914k","contrasena_usuario":"Reserva2026"}""", Opciones);
        var registro = JsonSerializer.Deserialize<RegistrarReservaComando>(
            """
            {
              "id_ambiente": "00000000-0000-0000-0000-000000000001",
              "fecha_reserva": "2026-11-18",
              "hora_inicio_reserva": "09:30",
              "hora_fin_reserva": "11:00",
              "motivo_reserva": "Sesión de práctica."
            }
            """, Opciones);

        Assert.Equal("p00914k", ingreso!.CodigoUsuario);
        Assert.Equal("Reserva2026", ingreso.ContrasenaUsuario);
        Assert.Equal(new DateOnly(2026, 11, 18), registro!.FechaReserva);
        Assert.Equal(new TimeOnly(9, 30), registro.HoraInicioReserva);
        Assert.Equal(new TimeOnly(11, 0), registro.HoraFinReserva);
    }

    [Fact]
    public void El_detalle_de_la_reserva_conserva_las_claves_de_sus_relaciones()
    {
        var detalle = new DetalleDeReserva(
            Guid.NewGuid(), "RES-2026-0001", new DateOnly(2026, 11, 18), new TimeOnly(14, 0), new TimeOnly(16, 0),
            "Sesión de práctica.", EstadoReserva.Pendiente, [EstadoReserva.Aprobada, EstadoReserva.Cancelada],
            DateTime.UtcNow, null, Guid.NewGuid(), "Luis Aquino Espinoza", "luis.aquino@upla.edu.pe", "P00914K",
            RolUsuario.Solicitante, Guid.NewGuid(), "Laboratorio de cómputo 1", TipoAmbiente.LaboratorioDeComputo,
            30, "Pabellón B", []);

        using var documento = JsonDocument.Parse(JsonSerializer.Serialize(detalle, Opciones));
        var raiz = documento.RootElement;

        Assert.Equal("RES-2026-0001", raiz.GetProperty("codigo_reserva").GetString());
        Assert.Equal("Pendiente", raiz.GetProperty("estado_reserva").GetString());
        Assert.Equal(2, raiz.GetProperty("estados_siguientes_reserva").GetArrayLength());
        Assert.True(raiz.TryGetProperty("historial_reserva", out _));
        Assert.True(raiz.TryGetProperty("nombre_completo_usuario", out _));
        Assert.True(raiz.TryGetProperty("nombre_ambiente", out _));
    }
}
