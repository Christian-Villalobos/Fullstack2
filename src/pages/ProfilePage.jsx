import { useEffect, useState } from 'react';
import { ProfileTemplate } from '../components/templates/ProfileTemplate';
import { getCurrentUser, getUsers, deleteUser } from '../services/auth';
import { getContactMessages, toggleMessageStatus, deleteContactMessage } from '../services/contact';
import { getUserOrders, getAllOrders, updateOrderStatus } from '../services/orders';

export function ProfilePage({ navbar, footer }) {
    const user = getCurrentUser();
    const isAdmin = user && (user.role === 'admin' || user.role === 'ROLE_ADMIN');

    const [users, setUsers] = useState(() => (isAdmin ? getUsers() : []));
    const [contactMessages, setContactMessages] = useState([]);
    const [orders, setOrders] = useState([]);

    const loadOrders = async () => {
        if (!user) return;
        const data = isAdmin ? await getAllOrders() : await getUserOrders(user);
        if (data) setOrders(data);
    };

    useEffect(() => {
        if (!user) {
            window.location.hash = '#login';
            return;
        }

        loadOrders();

        if (isAdmin) {
            let isMounted = true;
            getContactMessages().then(msgs => {
                if (isMounted) setContactMessages(msgs);
            });
            return () => { isMounted = false; };
        }
    }, [user, isAdmin]);

    if (!user) {
        return null;
    }

    const handleDeleteUser = (email) => {
        if (!isAdmin) return;
        const confirmed = window.confirm(`¿Seguro que quieres eliminar a ${email}?`);
        if (!confirmed) return;

        const result = deleteUser(email);
        alert(result.message);
        setUsers(getUsers());
    };

    const handleToggleContactStatus = async (id) => {
        const res = await toggleMessageStatus(id);
        if (res.ok) {
            setContactMessages(res.messages);
        }
    };

    const handleDeleteContactMessage = async (id) => {
        const confirmed = window.confirm('¿Deseas eliminar este mensaje de contacto?');
        if (!confirmed) return;

        const res = await deleteContactMessage(id);
        if (res.ok) {
            setContactMessages(res.messages);
        }
    };

    const handleUpdateOrderStatus = async (orderId, newStatus) => {
        const res = await updateOrderStatus(orderId, newStatus);
        if (res.ok) {
            await loadOrders();
        }
    };

    const titles = [
        {
            variant: "h1",
            content: isAdmin ? 'Panel de Administrador' : 'Mi Perfil',
            className: "titulo-principal"
        },
        { variant: "p", content: `Bienvenido, ${user.name}`, className: "subtitulo" }
    ];

    return (
        <ProfileTemplate
            navbar={navbar}
            titles={titles}
            user={user}
            users={users}
            onDeleteUser={handleDeleteUser}
            contactMessages={contactMessages}
            onToggleContactStatus={handleToggleContactStatus}
            onDeleteContactMessage={handleDeleteContactMessage}
            orders={orders}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            footer={footer}
        />
    );
}
