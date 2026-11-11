namespace ReservaUPLA.Domain.Comun;

// Objeto de valor: un día y un tramo de horas. Dos horarios son iguales si tienen los mismos datos.
// Sabe responder si se cruza con otro (RN-01): mismo día y los tramos se superponen. Que uno termine a las 10:00
// y el otro empiece a las 10:00 no es cruce.
public sealed record Horario(DateOnly Fecha, TimeOnly Inicio, TimeOnly Fin)
{
    public bool SeCruzaCon(Horario otro) => Fecha == otro.Fecha && Inicio < otro.Fin && otro.Inicio < Fin;

    public override string ToString() => $"el {Fecha:dd/MM/yyyy} de {Inicio:HH\\:mm} a {Fin:HH\\:mm}";
}
