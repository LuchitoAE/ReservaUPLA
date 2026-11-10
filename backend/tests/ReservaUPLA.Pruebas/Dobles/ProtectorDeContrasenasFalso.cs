using System.Text;
using ReservaUPLA.Application.Interfaces;
using ReservaUPLA.Domain.Comun;

namespace ReservaUPLA.Pruebas.Dobles;

// Cifrado de mentira y rápido: guarda los bytes del texto. Solo para pruebas; la API usa PBKDF2.
internal sealed class ProtectorDeContrasenasFalso : IProtectorDeContrasenas
{
    public ContrasenaCifrada Cifrar(string contrasena) => new([1], Encoding.UTF8.GetBytes(contrasena));

    public bool Verificar(string contrasena, ContrasenaCifrada guardada) =>
        Encoding.UTF8.GetBytes(contrasena).SequenceEqual(guardada.Hash);
}
