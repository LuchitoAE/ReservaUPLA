using ReservaUPLA.Domain.Common;

namespace ReservaUPLA.Application.Interfaces;

// Cifra y verifica contraseñas. Lo implementa la Infraestructura (PBKDF2): el dominio y los casos de uso no saben
// con qué algoritmo.
public interface IHasherDeContrasenas
{
    ContrasenaCifrada Cifrar(string contrasena);

    bool Verificar(string contrasena, ContrasenaCifrada guardada);
}
