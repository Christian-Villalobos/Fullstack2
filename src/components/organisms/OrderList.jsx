import { Text } from '../atoms/Text';
import { Button } from '../atoms/Button';

export function OrderList({ orders = [], onUpdateStatus, isAdmin = false }) {
  if (!orders || orders.length === 0) {
    return (
      <div className="bg-[#181614] border border-[#a37938]/40 p-6 rounded-lg shadow-lg mt-6 text-left">
        <Text variant="h2" className="text-xl text-[#f3caa1] font-bold mb-2">
          📜 {isAdmin ? 'Gestión de Todas las Órdenes' : 'Mis Órdenes de Compra'}
        </Text>
        <p className="text-gray-400 italic text-sm">No hay órdenes registradas.</p>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return <span className="bg-green-900/60 text-green-300 border border-green-600 px-2 py-0.5 rounded text-xs">Entregado</span>;
      case 'CANCELLED':
        return <span className="bg-red-900/60 text-red-300 border border-red-600 px-2 py-0.5 rounded text-xs">Cancelado</span>;
      case 'PENDING':
      default:
        return <span className="bg-yellow-900/60 text-yellow-300 border border-yellow-600 px-2 py-0.5 rounded text-xs">Pendiente de Trade</span>;
    }
  };

  return (
    <div className="bg-[#181614] border border-[#a37938]/40 p-6 rounded-lg shadow-lg mt-6 text-left">
      <Text variant="h2" className="text-xl text-[#f3caa1] font-bold mb-2">
        📜 {isAdmin ? 'Gestión de Todas las Órdenes' : 'Mis Órdenes de Compra'} ({orders.length})
      </Text>
      <Text variant="p" className="text-sm text-gray-400 mb-4">
        {isAdmin
          ? 'Revisa el historial de ventas y cambia el estado tras la entrega in-game.'
          : 'Consulta tus pedidos realizados y el código para coordinar la entrega.'}
      </Text>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-[#524434] text-[#ceaa7b]">
              <th className="pb-3 px-2">Código</th>
              <th className="pb-3 px-2">Fecha</th>
              {isAdmin && <th className="pb-3 px-2">Cliente</th>}
              <th className="pb-3 px-2">Detalle Ítems</th>
              <th className="pb-3 px-2">Total</th>
              <th className="pb-3 px-2">Estado</th>
              {isAdmin && <th className="pb-3 px-2 text-right">Acción</th>}
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.orderNumber || order.id} className="border-b border-[#524434]/40 hover:bg-[#201d19]">
                <td className="py-3 px-2 font-mono font-semibold text-[#f3caa1]">
                  {order.orderNumber}
                </td>
                <td className="py-3 px-2 text-xs text-gray-400 whitespace-nowrap">
                  {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Hoy'}
                </td>
                {isAdmin && (
                  <td className="py-3 px-2">
                    <div className="font-medium text-white">{order.userName}</div>
                    <div className="text-xs text-gray-400">{order.userEmail}</div>
                  </td>
                )}
                <td className="py-3 px-2 text-xs text-gray-300">
                  {order.items?.map((it, idx) => (
                    <div key={idx}>
                      • {it.quantity}x {it.productName}
                    </div>
                  ))}
                </td>
                <td className="py-3 px-2 font-semibold text-[#e5c285]">
                  ${Number(order.totalAmount).toFixed(2)} USD
                </td>
                <td className="py-3 px-2">
                  {getStatusBadge(order.status)}
                </td>
                {isAdmin && (
                  <td className="py-3 px-2 text-right">
                    {order.status === 'PENDING' && (
                      <div className="flex gap-2 justify-end">
                        <Button
                          className="btn-gold text-xs py-1 px-2"
                          onClick={() => onUpdateStatus(order.id, 'COMPLETED')}
                        >
                          Entregar
                        </Button>
                        <Button
                          className="btn-danger text-xs py-1 px-2"
                          onClick={() => onUpdateStatus(order.id, 'CANCELLED')}
                        >
                          Cancelar
                        </Button>
                      </div>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
