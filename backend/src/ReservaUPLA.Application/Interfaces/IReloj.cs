namespace ReservaUPLA.Application.Interfaces;

// La fecha y la hora actuales vienen de afuera: el dominio no lee el reloj del servidor y las reglas
// («la fecha no puede ser anterior a hoy») se prueban con cualquier fecha.
public interface IReloj
{
    DateTime AhoraUtc { get; }

    // Fecha de hoy en Huancayo (hora de Perú), que es la que importa para una reserva.
    DateOnly HoyEnPeru { get; }
}
