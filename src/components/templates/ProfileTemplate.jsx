import { Navbar } from '../organisms/Navbar';
import { Texts } from '../molecules/Texts';
import { ProfileCard } from '../organisms/ProfileCard';
import { UserList } from '../organisms/UserList';
import { ContactRequestList } from '../organisms/ContactRequestList';
import { OrderList } from '../organisms/OrderList';
import { Footer } from '../organisms/Footer';
import { Button } from '../atoms/Button';

export function ProfileTemplate({
    navbar,
    titles,
    user,
    users,
    onDeleteUser,
    contactMessages = [],
    onToggleContactStatus,
    onDeleteContactMessage,
    orders = [],
    onUpdateOrderStatus,
    footer
}) {
    const isAdmin = user.role === 'admin' || user.role === 'ROLE_ADMIN';

    return (
        <div className="profile-template">
            {/* 1. Barra superior */}
            <Navbar {...navbar} />

            <div className="max-w-5xl mx-auto px-4 py-6">
                {/* 2. Título y subtítulo */}
                {titles && <Texts texts={titles} />}

                {/* 3. Tarjeta con los datos del usuario */}
                <div className="flex flex-col items-center">
                    <ProfileCard user={user} />

                    {/* Botones de acción según rol */}
                    <div className="mt-4 mb-6 flex flex-wrap gap-4 justify-center">
                        <Button
                            className="btn-gold text-sm shadow-md"
                            onClick={() => { window.location.hash = '#editar-perfil'; }}
                        >
                            ⚙️ Editar Perfil y Cambiar Contraseña
                        </Button>

                        {/* Botón exclusivo para admin */}
                        {isAdmin && (
                            <Button
                                className="btn-white text-sm shadow-md"
                                onClick={() => { window.location.hash = '#admin-productos'; }}
                            >
                                📦 Administrar Productos de la Tienda
                            </Button>
                        )}
                    </div>
                </div>

                {/* 4. HISTORIAL DE ÓRDENES (Para usuarios y admin) */}
                <OrderList
                    orders={orders}
                    isAdmin={isAdmin}
                    onUpdateStatus={onUpdateOrderStatus}
                />

                {/* 5. SECCIÓN EXCLUSIVA DE ADMINISTRADOR */}
                {isAdmin && (
                    <div className="flex flex-col gap-6 mt-6">
                        {/* Tabla de usuarios */}
                        <UserList users={users} onDelete={onDeleteUser} />

                        {/* Gestión de solicitudes de contacto */}
                        <ContactRequestList
                            messages={contactMessages}
                            onToggleStatus={onToggleContactStatus}
                            onDeleteMessage={onDeleteContactMessage}
                        />
                    </div>
                )}
            </div>

            {/* 6. Footer */}
            {footer && <Footer {...footer} />}
        </div>
    );
}
