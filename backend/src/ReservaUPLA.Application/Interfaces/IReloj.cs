namespace ReservaUPLA.Application.Interfaces;

// La fecha y la hora actuales vienen de afuera: el dominio no lee el reloj del servidor y las reglas
// («la reserva no puede empezar en el pasado») se prueban con cualquier fecha.
public interface IReloj
{
    DateTime AhoraUtc { get; }

    // Fecha y hora de Huancayo (hora de Perú), que son las que importan para una reserva.
    DateTime AhoraEnPeru { get; }
}
