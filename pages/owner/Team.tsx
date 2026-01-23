
import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/supabaseApi';
import { TeamMember } from '../../types';
import { 
  Users, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X, 
  Camera, 
  Upload, 
  Check, 
  AlertCircle,
  Briefcase,
  Star,
  UserCheck,
  UserMinus
} from 'lucide-react';

export const OwnerTeam: React.FC = () => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentMember, setCurrentMember] = useState<Partial<TeamMember> | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Media handling
  const [isCameraActive, setIsCameraActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    const user = await api.getCurrentUser();
    if (user?.business_id) {
      const data = await api.getTeamMembers(user.business_id);
      setMembers(data);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCurrentMember(prev => ({ ...prev, avatar: reader.result as string }));
        setIsCameraActive(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      console.error(err);
      setIsCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const imageData = canvasRef.current.toDataURL('image/jpeg');
        setCurrentMember(prev => ({ ...prev, avatar: imageData }));
        stopCamera();
      }
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
    }
    setIsCameraActive(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = await api.getCurrentUser();
    if (user?.business_id && currentMember) {
      await api.saveTeamMember({
        ...currentMember,
        business_id: user.business_id,
        status: currentMember.status || 'ACTIVE'
      } as any);
      closeModal();
      loadMembers();
    }
  };

  const closeModal = () => {
    stopCamera();
    setIsModalOpen(false);
    setCurrentMember(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Deseja remover este colaborador da equipe?')) {
      await api.deleteTeamMember(id);
      loadMembers();
    }
  };

  const filtered = members.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 pb-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Equipe & Colaboradores</h1>
          <p className="text-slate-500 font-medium">Gerencie o time de profissionais do seu estabelecimento.</p>
        </div>
        <button 
          onClick={() => { setCurrentMember({ status: 'ACTIVE' }); setIsModalOpen(true); }}
          className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
        >
          <Plus size={20} /> Adicionar Colaborador
        </button>
      </div>

      <div className="mb-8 relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder="Pesquisar por nome ou cargo..."
          className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none bg-white"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(member => (
          <div key={member.id} className="bg-white rounded-[32px] border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group">
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div className="relative">
                  <div className="w-20 h-20 rounded-3xl overflow-hidden border-2 border-slate-50 shadow-md">
                    <img src={member.avatar || `https://ui-avatars.com/api/?name=${member.name}&background=6366f1&color=fff`} className="w-full h-full object-cover" alt={member.name} />
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-4 border-white ${member.status === 'ACTIVE' ? 'bg-green-500' : 'bg-slate-300'}`} />
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setCurrentMember(member); setIsModalOpen(true); }} className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => handleDelete(member.id)} className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-900 mb-1">{member.name}</h3>
                <p className="text-indigo-600 font-bold text-sm flex items-center gap-1.5 mb-4">
                  <Briefcase size={14} /> {member.role}
                </p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {member.specialties.split(',').map((spec, i) => (
                    <span key={i} className="px-2.5 py-1 bg-slate-50 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-wider border border-slate-100">
                      {spec.trim()}
                    </span>
                  ))}
                </div>
                {member.bio && <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 italic">{member.bio}</p>}
              </div>
            </div>
            
            <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
               <div className="flex items-center gap-1.5">
                 <Star size={14} className="text-amber-500" fill="currentColor" />
                 <span className="text-xs font-black text-slate-700">4.9</span>
                 <span className="text-[10px] text-slate-400 font-bold">(120 avaliações)</span>
               </div>
               <span className={`text-[10px] font-black uppercase tracking-widest ${member.status === 'ACTIVE' ? 'text-green-600' : 'text-slate-400'}`}>
                 {member.status === 'ACTIVE' ? 'Disponível' : 'Indisponível'}
               </span>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full py-24 text-center bg-white rounded-[48px] border-2 border-dashed border-slate-100">
            <Users className="mx-auto text-slate-200 mb-6" size={64} />
            <h3 className="text-2xl font-black text-slate-900">Sua equipe está vazia</h3>
            <p className="text-slate-400 mt-2 max-w-sm mx-auto font-medium">Colaboradores são essenciais para escalar seu negócio. Comece adicionando um agora.</p>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="mt-8 px-8 py-3 bg-indigo-50 text-indigo-600 rounded-2xl font-bold hover:bg-indigo-100 transition-all"
            >
              Adicionar Primeiro Membro
            </button>
          </div>
        )}
      </div>

      {/* Modal de Colaborador */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xl rounded-[40px] shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-2xl font-black text-slate-900">{currentMember?.id ? 'Editar Perfil' : 'Novo Colaborador'}</h3>
                <p className="text-slate-500 text-sm font-medium">Gerencie as informações do profissional.</p>
              </div>
              <button onClick={closeModal} className="p-3 bg-white text-slate-400 hover:text-slate-900 rounded-2xl shadow-sm transition-all"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSave} className="p-8 space-y-6 overflow-y-auto no-scrollbar flex-1">
              {/* Avatar Handling */}
              <div className="flex flex-col items-center">
                <div className="relative group mb-4">
                  <div className="w-32 h-32 rounded-[40px] overflow-hidden bg-slate-100 border-4 border-white shadow-xl">
                    {isCameraActive ? (
                      <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover scale-x-[-1]" />
                    ) : (
                      <img src={currentMember?.avatar || `https://ui-avatars.com/api/?name=${currentMember?.name || 'User'}&background=6366f1&color=fff`} className="w-full h-full object-cover" alt="Avatar" />
                    )}
                  </div>
                  
                  <div className="absolute -bottom-2 -right-2 flex gap-1">
                    {!isCameraActive ? (
                      <>
                        <button 
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="p-3 bg-white text-indigo-600 rounded-2xl shadow-lg border border-indigo-50 hover:bg-indigo-50 transition-all"
                        >
                          <Upload size={18} />
                        </button>
                        <button 
                          type="button"
                          onClick={startCamera}
                          className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg hover:bg-indigo-700 transition-all"
                        >
                          <Camera size={18} />
                        </button>
                      </>
                    ) : (
                      <button 
                        type="button"
                        onClick={capturePhoto}
                        className="p-4 bg-green-600 text-white rounded-full shadow-lg animate-pulse"
                      >
                        <Check size={20} />
                      </button>
                    )}
                  </div>
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                <canvas ref={canvasRef} className="hidden" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-2">Nome Completo</label>
                  <input 
                    type="text" 
                    required
                    className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none"
                    value={currentMember?.name || ''}
                    onChange={(e) => setCurrentMember({...currentMember, name: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-2">Cargo / Título</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Ex: Barbeiro Sênior"
                    className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none"
                    value={currentMember?.role || ''}
                    onChange={(e) => setCurrentMember({...currentMember, role: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-2">Status</label>
                  <div className="flex bg-slate-100 p-1 rounded-2xl">
                    <button 
                      type="button"
                      onClick={() => setCurrentMember({...currentMember, status: 'ACTIVE'})}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black transition-all ${currentMember?.status === 'ACTIVE' ? 'bg-white text-green-600 shadow-sm' : 'text-slate-500'}`}
                    >
                      <UserCheck size={14} /> ATIVO
                    </button>
                    <button 
                      type="button"
                      onClick={() => setCurrentMember({...currentMember, status: 'INACTIVE'})}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black transition-all ${currentMember?.status === 'INACTIVE' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500'}`}
                    >
                      <UserMinus size={14} /> INATIVO
                    </button>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-2">Especialidades (separadas por vírgula)</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Navalha, Colorimetria, Barboterapia"
                    className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none"
                    value={currentMember?.specialties || ''}
                    onChange={(e) => setCurrentMember({...currentMember, specialties: e.target.value})}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-2">Mini Bio</label>
                  <textarea 
                    rows={3}
                    className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none resize-none"
                    value={currentMember?.bio || ''}
                    onChange={(e) => setCurrentMember({...currentMember, bio: e.target.value})}
                  />
                </div>
              </div>

              <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-[24px] font-black text-lg shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-[0.98]">
                {currentMember?.id ? 'Atualizar Colaborador' : 'Salvar Colaborador'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
