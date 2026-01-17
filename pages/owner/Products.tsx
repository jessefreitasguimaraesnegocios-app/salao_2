
import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/mockApi';
import { Product } from '../../types';
import { Plus, Search, Edit2, Trash2, Package, X, Upload, ImageIcon, Camera, RefreshCw, Check, AlertCircle } from 'lucide-react';

export const OwnerProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Partial<Product> | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Camera & Upload States
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const user = await api.getCurrentUser();
    if (user?.business_id) {
      const data = await api.getProducts(user.business_id);
      setProducts(data);
    }
  };

  // --- Image Handling Logic ---

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("A imagem é muito grande. Escolha um arquivo de até 2MB.");
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setCurrentProduct(prev => ({ ...prev, image: reader.result as string }));
        stopCamera();
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    setCameraError(null);
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Erro ao acessar câmera:", err);
      setCameraError("Não foi possível acessar a câmera. Verifique as permissões.");
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const imageData = canvasRef.current.toDataURL('image/jpeg', 0.8);
        setCurrentProduct(prev => ({ ...prev, image: imageData }));
        stopCamera();
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = await api.getCurrentUser();
    if (user?.business_id && currentProduct) {
      await api.saveProduct({
        ...currentProduct,
        business_id: user.business_id,
        price: Number(currentProduct.price),
        stock: Number(currentProduct.stock),
        is_active: true,
        image: currentProduct.image || '', // No placeholder needed if we want real data
        category: currentProduct.category || 'Geral'
      } as any);
      closeModal();
      loadProducts();
    }
  };

  const closeModal = () => {
    stopCamera();
    setIsModalOpen(false);
    setCurrentProduct(null);
    setIsCameraActive(false);
    setCameraError(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Deseja excluir este produto?')) {
      await api.deleteProduct(id);
      loadProducts();
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Estoque de Produtos</h1>
          <p className="text-slate-500">Gerencie seu catálogo físico com fotos reais.</p>
        </div>
        <button 
          onClick={() => { setCurrentProduct({}); setIsModalOpen(true); }}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg hover:bg-indigo-700 transition-all active:scale-95"
        >
          <Plus size={20} /> Adicionar Produto
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Pesquisar produtos..."
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100">
                <th className="px-6 py-4">Produto</th>
                <th className="px-6 py-4">Categoria</th>
                <th className="px-6 py-4">Preço</th>
                <th className="px-6 py-4">Estoque</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map(p => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-100 shadow-inner">
                        {p.image ? (
                           <img src={p.image} className="w-full h-full object-cover" alt={p.name} />
                        ) : (
                           <div className="w-full h-full flex items-center justify-center text-slate-300">
                             <ImageIcon size={20} />
                           </div>
                        )}
                      </div>
                      <span className="font-bold text-slate-900 text-sm">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">{p.category}</td>
                  <td className="px-6 py-4 font-black text-slate-900 text-sm">R$ {p.price.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-lg text-xs font-bold ${p.stock < 5 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                      {p.stock} un
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => { setCurrentProduct(p); setIsModalOpen(true); }} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-all border border-transparent hover:border-indigo-100">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-white rounded-lg transition-all border border-transparent hover:border-red-100">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredProducts.length === 0 && (
            <div className="py-20 text-center">
              <Package className="mx-auto text-slate-200 mb-4" size={48} />
              <p className="text-slate-400 font-medium">Nenhum produto cadastrado.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Cadastro */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center shrink-0">
              <h3 className="text-2xl font-black text-slate-900">{currentProduct?.id ? 'Editar Produto' : 'Novo Produto'}</h3>
              <button onClick={closeModal} className="p-2 text-slate-400 hover:text-slate-900 transition-colors"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-6 flex-1 no-scrollbar">
              {/* Media Handling Area */}
              <div>
                <label className="block text-xs font-black uppercase text-slate-400 tracking-widest mb-3">Foto do Produto</label>
                
                <div className="relative group w-full aspect-video rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 overflow-hidden transition-all">
                  {isCameraActive ? (
                    <div className="relative h-full w-full bg-black">
                      <video 
                        ref={videoRef} 
                        autoPlay 
                        playsInline 
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4 px-4">
                        <button 
                          type="button"
                          onClick={capturePhoto}
                          className="bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition-all active:scale-90"
                        >
                          <Check size={24} />
                        </button>
                        <button 
                          type="button"
                          onClick={stopCamera}
                          className="bg-white/20 backdrop-blur text-white p-4 rounded-full shadow-lg hover:bg-white/30 transition-all"
                        >
                          <X size={24} />
                        </button>
                      </div>
                    </div>
                  ) : currentProduct?.image ? (
                    <>
                      <img src={currentProduct.image} className="w-full h-full object-cover" alt="Preview" />
                      <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                        <div className="flex gap-4">
                          <button 
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-white p-3 rounded-2xl shadow-lg text-slate-900 hover:bg-indigo-50 transition-colors flex items-center gap-2 font-bold text-xs"
                          >
                            <RefreshCw size={16} /> Trocar Arquivo
                          </button>
                          <button 
                            type="button"
                            onClick={startCamera}
                            className="bg-indigo-600 p-3 rounded-2xl shadow-lg text-white hover:bg-indigo-700 transition-colors flex items-center gap-2 font-bold text-xs"
                          >
                            <Camera size={16} /> Nova Foto
                          </button>
                        </div>
                        <button 
                          type="button"
                          onClick={() => setCurrentProduct({...currentProduct, image: ''})}
                          className="text-white/70 hover:text-red-400 text-[10px] font-black uppercase tracking-widest"
                        >
                          Remover Imagem
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="h-full w-full flex flex-col items-center justify-center p-6 text-center">
                      {cameraError ? (
                        <div className="flex flex-col items-center text-red-500 mb-4 animate-in shake duration-300">
                          <AlertCircle size={32} className="mb-2" />
                          <p className="text-xs font-bold max-w-[200px]">{cameraError}</p>
                        </div>
                      ) : (
                        <div className="p-4 bg-white rounded-3xl shadow-sm mb-4">
                          <ImageIcon size={32} className="text-indigo-500" />
                        </div>
                      )}
                      
                      <p className="text-sm font-black text-slate-900 mb-1">Nenhuma imagem selecionada</p>
                      <p className="text-xs text-slate-400 mb-6">Capture uma foto agora ou escolha um arquivo</p>
                      
                      <div className="flex gap-3">
                        <button 
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
                        >
                          <Upload size={14} /> Carregar Arquivo
                        </button>
                        <button 
                          type="button"
                          onClick={startCamera}
                          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 rounded-xl text-xs font-bold text-white hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100"
                        >
                          <Camera size={14} /> Usar Câmera
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
                <input 
                  type="file" 
                  ref={fileInputRef}
                  className="hidden" 
                  accept="image/*"
                  onChange={handleImageUpload}
                />
                <canvas ref={canvasRef} className="hidden" />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-slate-400 tracking-widest mb-2">Nome do Produto</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ex: Óleo de Barba Premium"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  value={currentProduct?.name || ''}
                  onChange={(e) => setCurrentProduct({...currentProduct, name: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase text-slate-400 tracking-widest mb-2">Preço (R$)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    required
                    placeholder="0,00"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono"
                    value={currentProduct?.price || ''}
                    onChange={(e) => setCurrentProduct({...currentProduct, price: e.target.value as any})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase text-slate-400 tracking-widest mb-2">Estoque</label>
                  <input 
                    type="number" 
                    required
                    placeholder="Qtd"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    value={currentProduct?.stock || ''}
                    onChange={(e) => setCurrentProduct({...currentProduct, stock: e.target.value as any})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-slate-400 tracking-widest mb-2">Categoria</label>
                <select 
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 appearance-none bg-white transition-all"
                  value={currentProduct?.category || 'Geral'}
                  onChange={(e) => setCurrentProduct({...currentProduct, category: e.target.value})}
                >
                  <option value="Cabelo">Cabelo</option>
                  <option value="Barba">Barba</option>
                  <option value="Skincare">Skincare</option>
                  <option value="Acessórios">Acessórios</option>
                  <option value="Geral">Geral</option>
                </select>
              </div>

              <div className="pt-4">
                <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 flex items-center justify-center gap-2">
                  {currentProduct?.id ? 'Atualizar Produto' : 'Cadastrar Produto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
