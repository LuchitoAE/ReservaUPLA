namespace ReservaUPLA.Application.CasosDeUso.Usuarios.CuentasIniciales;

// Qué pasó con una cuenta inicial al arrancar; la API lo escribe en su registro.
public enum ResultadoDeCuentaInicial
{
    Creada = 1,
    YaExistia = 2,
    FaltanDatos = 3,
}
