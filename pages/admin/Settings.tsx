import React, { useState } from 'react';
import { 
  Zap, 
  ShieldAlert, 
  Globe, 
  Save, 
  Info,
  RefreshCw,
  PieChart,
  ChevronRight,
  X,
  Store,
  Scissors,
  Search
} from 'lucide-react';

// Mock de estabelecimentos - depois você pode substituir pelos dados reais
const mockEstabelecimentos = [
  { id: 1, nome: 'Salão Beleza Pura', tipo: 'salao', emManutencao: false },
  { id: 2, nome: 'Barbearia do João', tipo: 'barbearia', emManutencao: true },
  { id: 3, nome: 'Studio Hair Premium', tipo: 'salao', emManutencao: false },
  { id: 4, nome: 'Barber Shop Elite', tipo: 'barbearia', emManutencao: false },
  { id: 5, nome: 'Espaço Glamour', tipo: 'salao', emManutencao: true },
  { id: 6, nome: 'Corte & Estilo', tipo: 'barbearia', emManutencao: false },
];

export const AdminSettings: React.FC = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [showEstabelecimentos, setShowEstabelecimentos] = useState(false);
  const [estabelecimentos, setEstabelecimentos] = useState(mockEstabelecimentos);
  const [searchTerm, setSearchTerm] = useState('');

  const toggleManutencaoEstabelecimento = (id: number) => {
    setEstabelecimentos(prev => 
      prev.map(est => 
        est.id === id ? { ...est, emManutencao: !est.emManutencao } : est
      )
    );
  };

  const estabelecimentosFiltrados = estabelecimentos.filter(est =>
    est.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 2000);
  };

  return (
    <>
      {/* Modal de Estabelecimentos */}
      {showEstabelecimentos && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-2xl">
            {/* Header do Modal */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-slate-900">Manutenção por Estabelecimento</h2>
                <p className="text-slate-500 text-sm">Ative ou desative a manutenção individualmente</p>
              </div>
              <button 
                onClick={() => setShowEstabelecimentos(false)}
                className="p-3 hover:bg-slate-100 rounded-xl transition-all"
              >
                <X size={24} className="text-slate-500" />
              </button>
            </div>

            {/* Busca */}
            <div className="p-4 border-b border-slate-100">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  placeholder="Buscar estabelecimento..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 outline-none"
                />
              </div>
            </div>

            {/* Lista de Estabelecimentos */}
            <div className="p-4 overflow-y-auto max-h-[50vh] space-y-3">
              {estabelecimentosFiltrados.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  Nenhum estabelecimento encontrado
                </div>
              ) : (
                estabelecimentosFiltrados.map((est) => (
                  <div 
                    key={est.id}
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                      est.emManutencao 
                        ? 'bg-red-50 border-red-200' 
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${est.emManutencao ? 'bg-red-100' : 'bg-white'}`}>
                        {est.tipo === 'salao' ? (
                          <Scissors size={20} className={est.emManutencao ? 'text-red-500' : 'text-indigo-600'} />
                        ) : (
                          <Store size={20} className={est.emManutencao ? 'text-red-500' : 'text-indigo-600'} />
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">{est.nome}</h4>
                        <p className="text-xs text-slate-500 capitalize">{est.tipo === 'salao' ? 'Salão de Beleza' : 'Barbearia'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {est.emManutencao && (
                        <span className="text-xs font-bold text-red-500 bg-red-100 px-3 py-1 rounded-full">
                          Em Manutenção
                        </span>
                      )}
                      <button 
                        onClick={() => toggleManutencaoEstabelecimento(est.id)}
                        className={`w-14 h-7 rounded-full p-1 transition-all duration-300 ${
                          est.emManutencao ? 'bg-red-500' : 'bg-slate-300'
                        }`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full transition-all duration-300 shadow ${
                          est.emManutencao ? 'translate-x-7' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer do Modal */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
              <p className="text-xs text-slate-500">
                {estabelecimentos.filter(e => e.emManutencao).length} de {estabelecimentos.length} em manutenção
              </p>
              <button 
                onClick={() => setShowEstabelecimentos(false)}
                className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all"
              >
                Concluir
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="p-8 pb-24 max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Configurações do Hub</h1>
            <p className="text-slate-500 font-medium">Parâmetros globais do SaaS e segurança da infraestrutura.</p>
          </div>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="bg-indigo-600 text-white px-10 py-5 rounded-[24px] font-black flex items-center gap-3 shadow-2xl hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50"
          >
            {isSaving ? <RefreshCw size={24} className="animate-spin" /> : <Save size={24} />}
            Salvar Regras
          </button>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {/* Seção Financeira */}
          <div className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-50 rounded-bl-[100px] -z-0 translate-x-10 -translate-y-10 group-hover:scale-110 transition-transform duration-700" />
            
            <div className="relative z-10">
              <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
                <PieChart size={24} className="text-indigo-600" /> Políticas de Faturamento
              </h3>

              <div className="max-w-md">
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-4">Split de Transação Padrão (%)</label>
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-black">%</span>
                  <input 
                    type="number" 
                    defaultValue={10}
                    className="w-full pl-12 pr-6 py-5 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 outline-none font-black text-2xl text-slate-900"
                  />
                </div>
                <p className="mt-3 text-xs text-slate-400 font-medium flex items-center gap-1.5 italic"><Info size={14} /> Aplicado automaticamente a novos lojistas.</p>
              </div>
            </div>
          </div>

          {/* Seção de Segurança & Infra */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-10 rounded-[48px] text-white shadow-2xl relative overflow-hidden">
            {/* Efeitos de fundo */}
            <div className="absolute top-0 left-0 w-72 h-72 bg-red-500/5 blur-[120px] -z-0" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px] -z-0" />
            
            {/* Header da seção */}
            <div className="relative z-10 flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black flex items-center gap-3">
                <div className="p-3 bg-red-500/20 rounded-2xl">
                  <ShieldAlert size={24} className="text-red-400" />
                </div>
                Infraestrutura Crítica
              </h3>
              {estabelecimentos.filter(e => e.emManutencao).length > 0 && (
                <div className="flex items-center gap-2 bg-red-500/20 px-4 py-2 rounded-full">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-xs font-bold text-red-400">
                    {estabelecimentos.filter(e => e.emManutencao).length} em manutenção
                  </span>
                </div>
              )}
            </div>

            <div className="relative z-10 space-y-4">
              {/* Card Manutenção Global */}
              <div className={`p-6 rounded-3xl border transition-all duration-300 ${
                maintenanceMode 
                  ? 'bg-red-500/20 border-red-500/30' 
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-4 rounded-2xl transition-all ${
                      maintenanceMode ? 'bg-red-500/30' : 'bg-white/10'
                    }`}>
                      <ShieldAlert size={28} className={maintenanceMode ? 'text-red-400' : 'text-slate-400'} />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg flex items-center gap-2">
                        Modo de Manutenção Global
                        {maintenanceMode && (
                          <span className="text-[10px] font-black bg-red-500 text-white px-2 py-1 rounded-full uppercase tracking-wider">
                            Ativo
                          </span>
                        )}
                      </h4>
                      <p className="text-slate-400 text-sm mt-1">
                        Bloqueia o acesso de todos os lojistas e clientes temporariamente.
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setMaintenanceMode(!maintenanceMode)}
                    className={`w-16 h-8 rounded-full p-1 transition-all duration-300 ${
                      maintenanceMode ? 'bg-red-500 shadow-lg shadow-red-500/30' : 'bg-slate-700'
                    }`}
                  >
                    <div className={`w-6 h-6 bg-white rounded-full transition-all duration-300 shadow ${
                      maintenanceMode ? 'translate-x-8' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
              </div>

              {/* Card Manutenção Individual */}
              <button 
                onClick={() => setShowEstabelecimentos(true)}
                className="w-full p-6 rounded-3xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-300 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-4 rounded-2xl bg-indigo-500/20 group-hover:bg-indigo-500/30 transition-all">
                      <Store size={28} className="text-indigo-400" />
                    </div>
                    <div className="text-left">
                      <h4 className="font-bold text-lg flex items-center gap-2">
                        Manutenção por Estabelecimento
                        <span className="text-[10px] font-black bg-white/10 text-slate-300 px-2 py-1 rounded-full uppercase tracking-wider">
                          {estabelecimentos.length} cadastrados
                        </span>
                      </h4>
                      <p className="text-slate-400 text-sm mt-1">
                        Gerencie a manutenção individualmente para cada salão ou barbearia.
                      </p>
                    </div>
                  </div>
                  <div className="p-3 bg-white/10 rounded-xl group-hover:bg-indigo-500/30 transition-all">
                    <ChevronRight size={24} className="text-slate-300 group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Branding & Experiência */}
          <div className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm">
            <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
              <Globe size={24} className="text-indigo-600" /> Personalização de Marca
            </h3>

            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-3">Nome Comercial do SaaS</label>
                <input type="text" defaultValue="BelezaHub - Gestão Pro" className="w-full px-6 py-4 rounded-2xl border border-slate-200 font-bold" />
              </div>
              
              <div className="p-6 bg-indigo-50 rounded-3xl border border-indigo-100 flex gap-4 text-indigo-700">
                <Zap size={24} className="shrink-0" />
                <p className="text-xs font-black uppercase leading-relaxed tracking-wider">A marca do hub é exibida no rodapé de todos os subdomínios dos lojistas.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
