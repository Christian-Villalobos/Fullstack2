import { Text } from '../atoms/Text';

// Organismo: tarjeta con los datos del usuario que inició sesión
// user: { name, email, role }
export function ProfileCard({ user }) {
    // true si el usuario es administrador (compatible con 'admin' y 'ROLE_ADMIN')
    const isAdmin = user.role === 'admin' || user.role === 'ROLE_ADMIN';

    return (
        <div className="profile-card">
            {/* Nombre del usuario */}
            <Text variant="h2" className="profile-name">{user.name}</Text>

            {/* Correo del usuario */}
            <Text variant="p">Correo: {user.email}</Text>

            {/* Etiqueta de rol: cambia el texto y el color según si es admin o no */}
            <Text variant="span" className={`profile-role ${isAdmin ? 'role-admin' : 'role-user'}`}>
                {isAdmin ? 'Administrador' : 'Usuario'}
            </Text>
        </div>
    );
}
