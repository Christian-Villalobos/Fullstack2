import { useState } from 'react';
import { Text } from '../atoms/Text';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';

export function ProductManager({ products = [], onAddProduct, onDeleteProduct }) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [imageMode, setImageMode] = useState('upload'); // 'upload' o 'preset'
  const [imagePreview, setImagePreview] = useState('');
  const [selectedPreset, setSelectedPreset] = useState('/images/divine.webp');
  const [message, setMessage] = useState({ text: '', type: '' });

  const availablePresets = [
    { label: 'Divine Orb', src: '/images/divine.webp' },
    { label: 'Chaos Orb', src: '/images/chaos.webp' },
    { label: 'Mirror of Kalandra', src: '/images/mirror.webp' },
    { label: 'Exalted Orb', src: '/images/exalted.webp' }
  ];

  // Maneja la subida de un archivo desde el computador (conversión a Base64)
  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMessage({ text: 'Por favor selecciona un archivo de imagen válido.', type: 'error' });
      return;
    }

    // Límite práctico para localStorage (~1.5 MB)
    if (file.size > 1.5 * 1024 * 1024) {
      setMessage({ text: 'La imagen es muy pesada. Elige una menor a 1.5 MB.', type: 'error' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    const finalSrc = imageMode === 'upload' ? imagePreview : selectedPreset;

    if (imageMode === 'upload' && !imagePreview) {
      setMessage({ text: 'Debes seleccionar una imagen desde tu archivo.', type: 'error' });
      return;
    }

    const res = await onAddProduct({ name, price, src: finalSrc });
    if (res?.ok) {
      setMessage({ text: res.message, type: 'success' });
      setName('');
      setPrice('');
      setImagePreview('');
    } else {
      setMessage({ text: res?.message || 'Error al agregar producto', type: 'error' });
    }
  };

  return (
    <div className="bg-[#181614] border border-[#a37938]/40 p-6 rounded-lg shadow-lg mt-8 text-left">
      <Text variant="h2" className="text-xl text-[#f3caa1] font-bold mb-2">
        📦 Gestión de Productos (Tienda)
      </Text>
      <Text variant="p" className="text-sm text-gray-400 mb-6">
        Agrega nuevos orbes u objetos a la tienda subiendo su imagen desde tu equipo o eligiendo una existente.
      </Text>

      {message.text && (
        <div className={`p-3 mb-4 rounded text-sm ${message.type === 'success' ? 'bg-green-900/60 text-green-200 border border-green-600' : 'bg-red-900/60 text-red-200 border border-red-600'}`}>
          {message.text}
        </div>
      )}

      {/* Formulario para agregar producto */}
      <form onSubmit={handleSubmit} className="mb-8 bg-[#12100e] p-5 rounded border border-[#524434]/50">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs text-[#ceaa7b] mb-1 font-semibold">Nombre del Objeto</label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Ancient Orb"
              required
              className="w-full bg-[#181614] border border-[#524434] text-white p-2 rounded text-sm outline-none focus:border-[#a37938]"
            />
          </div>

          <div>
            <label className="block text-xs text-[#ceaa7b] mb-1 font-semibold">Precio (USD)</label>
            <Input
              type="text"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Ej. 1.25 o $1.25 USD"
              required
              className="w-full bg-[#181614] border border-[#524434] text-white p-2 rounded text-sm outline-none focus:border-[#a37938]"
            />
          </div>
        </div>

        {/* Selector de modo de imagen */}
        <div className="mb-4">
          <label className="block text-xs text-[#ceaa7b] mb-2 font-semibold">Origen de la Imagen</label>
          <div className="flex gap-4 text-sm text-white mb-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="imageMode"
                value="upload"
                checked={imageMode === 'upload'}
                onChange={() => setImageMode('upload')}
              />
              Subir archivo desde mi equipo
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="imageMode"
                value="preset"
                checked={imageMode === 'preset'}
                onChange={() => setImageMode('preset')}
              />
              Elegir imagen predeterminada
            </label>
          </div>

          {imageMode === 'upload' ? (
            <div className="flex items-center gap-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="block text-xs text-gray-400 file:mr-3 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-[#a37938] file:text-black hover:file:bg-[#ceaa7b] cursor-pointer"
              />
              {imagePreview && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">Vista previa:</span>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-10 h-10 object-contain rounded border border-[#a37938]"
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <select
                value={selectedPreset}
                onChange={(e) => setSelectedPreset(e.target.value)}
                className="bg-[#181614] border border-[#524434] text-white p-2 rounded text-sm outline-none focus:border-[#a37938]"
              >
                {availablePresets.map(img => (
                  <option key={img.src} value={img.src}>{img.label}</option>
                ))}
              </select>
              <img
                src={selectedPreset}
                alt="Preset Preview"
                className="w-8 h-8 object-contain rounded border border-[#a37938]"
              />
            </div>
          )}
        </div>

        <div className="pt-2">
          <Button type="submit" className="btn-gold text-sm px-6">
            + Agregar a Tienda
          </Button>
        </div>
      </form>

      {/* Tabla de productos actuales */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-[#524434] text-[#ceaa7b]">
              <th className="pb-3 px-2">Vista previa</th>
              <th className="pb-3 px-2">Nombre</th>
              <th className="pb-3 px-2">Precio</th>
              <th className="pb-3 px-2 text-right">Acción</th>
            </tr>
          </thead>
          <tbody>
            {products.map((item) => (
              <tr key={item.name} className="border-b border-[#524434]/40 hover:bg-[#201d19]">
                <td className="py-2 px-2">
                  <img src={item.src} alt={item.alt || item.name} className="w-10 h-10 object-contain rounded bg-[#0d0c0b] p-1 border border-[#332b21]" />
                </td>
                <td className="py-2 px-2 font-medium text-white">{item.name}</td>
                <td className="py-2 px-2 text-[#e5c285]">{item.price}</td>
                <td className="py-2 px-2 text-right">
                  <Button
                    className="btn-danger text-xs py-1 px-3"
                    onClick={() => onDeleteProduct(item.name)}
                  >
                    Eliminar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
