import { Text } from '../atoms/Text';
import { Button } from '../atoms/Button';

export function ContactRequestList({ messages = [], onToggleStatus, onDeleteMessage }) {
  return (
    <div className="bg-[#181614] border border-[#a37938]/40 p-6 rounded-lg shadow-lg mt-8 text-left">
      <div className="flex justify-between items-center mb-4">
        <div>
          <Text variant="h2" className="text-xl text-[#f3caa1] font-bold">
            📬 Solicitudes de Contacto ({messages.length})
          </Text>
          <Text variant="p" className="text-sm text-gray-400">
            Mensajes enviados por usuarios y visitantes a través del formulario de soporte.
          </Text>
        </div>
      </div>

      {messages.length === 0 ? (
        <p className="text-gray-500 italic py-4">No hay mensajes o consultas pendientes.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-[#524434] text-[#ceaa7b]">
                <th className="pb-3 px-2">Fecha</th>
                <th className="pb-3 px-2">Remitente</th>
                <th className="pb-3 px-2">Asunto / Mensaje</th>
                <th className="pb-3 px-2">Estado</th>
                <th className="pb-3 px-2 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {messages.map((msg) => (
                <tr key={msg.id} className="border-b border-[#524434]/40 hover:bg-[#201d19]">
                  <td className="py-3 px-2 text-xs text-gray-400 whitespace-nowrap">{msg.createdAt}</td>
                  <td className="py-3 px-2">
                    <div className="font-semibold text-white">{msg.name}</div>
                    <div className="text-xs text-gray-400">{msg.email}</div>
                  </td>
                  <td className="py-3 px-2 max-w-xs">
                    <div className="font-medium text-[#f3caa1]">{msg.subject}</div>
                    <div className="text-xs text-gray-300 truncate">{msg.message}</div>
                  </td>
                  <td className="py-3 px-2">
                    <span
                      onClick={() => onToggleStatus(msg.id)}
                      className={`cursor-pointer inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                        msg.status === 'Resuelto'
                          ? 'bg-green-900/60 text-green-300 border border-green-700'
                          : 'bg-yellow-900/60 text-yellow-300 border border-yellow-700'
                      }`}
                      title="Clic para cambiar estado"
                    >
                      {msg.status} ↺
                    </span>
                  </td>
                  <td className="py-3 px-2 text-right whitespace-nowrap">
                    <Button
                      className="btn-danger text-xs py-1 px-3"
                      onClick={() => onDeleteMessage(msg.id)}
                    >
                      Eliminar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
