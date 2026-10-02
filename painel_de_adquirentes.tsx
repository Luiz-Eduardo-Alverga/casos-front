import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, Wifi, Signal, FileText, X, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

// Mock data based on the image provided
const acquirersData = [
  {
    id: 'playstore',
    name: 'Playstore',
    status: 'Em teste',
    statusColor: 'text-purple-600',
    currentVersion: '8.0.0.0',
    nextVersion: '8.0.1.0',
    sentDate: null,
    connection: { wifi: true, mobile: true },
    devices: [{ name: 'Smartphone Android', recommended: true }],
    logoColor: 'bg-gradient-to-tr from-blue-400 via-green-400 to-yellow-400'
  },
  {
    id: 'rede',
    name: 'Rede',
    status: 'Em certificação',
    statusColor: 'text-blue-600',
    currentVersion: '8.0.0.0',
    nextVersion: '8.0.1.0',
    sentDate: '21/09/2026',
    connection: { wifi: true, mobile: true },
    devices: [
      { name: 'L400', recommended: true },
      { name: 'N960K', recommended: false }
    ],
    logoColor: 'bg-orange-500'
  },
  {
    id: 'stone',
    name: 'Stone',
    status: 'Em certificação',
    statusColor: 'text-blue-600',
    currentVersion: '8.0.0.0',
    nextVersion: '8.0.1.0',
    sentDate: '24/09/2026',
    connection: { wifi: true, mobile: true },
    devices: [
      { name: 'L400', recommended: true },
      { name: 'P2', recommended: false },
      { name: 'GPOS700X', recommended: false },
      { name: 'A8', recommended: false },
      { name: 'T8', recommended: false },
      { name: 'L300', recommended: false },
      { name: 'P2 A11', recommended: false },
      { name: 'GPOS730', recommended: false }
    ],
    logoColor: 'bg-green-600'
  },
  {
    id: 'pagbank',
    name: 'Pagbank',
    status: 'Em teste',
    statusColor: 'text-purple-600',
    currentVersion: '8.0.0.0',
    nextVersion: null,
    sentDate: null,
    connection: { wifi: true, mobile: true },
    devices: [
      { name: 'P2', recommended: true },
      { name: 'A50', recommended: false },
      { name: 'A920', recommended: false },
      { name: 'A930', recommended: false },
      { name: 'SK800', recommended: false }
    ],
    logoColor: 'bg-yellow-400'
  },
  {
    id: 'cielo',
    name: 'Cielo',
    status: 'Concluído',
    statusColor: 'text-green-600',
    currentVersion: '8.0.1.0',
    nextVersion: null,
    sentDate: null,
    connection: { wifi: true, mobile: true },
    devices: [
      { name: 'Lio v3', recommended: true },
      { name: 'L400', recommended: false },
      { name: 'L300', recommended: false },
      { name: 'DX8000', recommended: false },
      { name: 'GPOS720', recommended: false }
    ],
    logoColor: 'bg-cyan-500'
  },
  {
    id: 'getnet',
    name: 'Getnet',
    status: 'Em certificação',
    statusColor: 'text-blue-600',
    currentVersion: '8.0.0.0',
    nextVersion: '8.0.1.0',
    sentDate: '21/09/2026',
    connection: { wifi: true, mobile: true },
    devices: [],
    logoColor: 'bg-red-600'
  }
];

type Acquirer = (typeof acquirersData)[number];

// Mock documentation data for each acquirer
const documentationData: Record<string, string> = {
  cielo: `
## Dispositivos Compatíveis

* **Lio v3** (Recomendado/Principal)
* L400
* L300
* DX8000
* GPOS720

### Procedimentos Comuns

**Como realizar a configuração do Smart?**
Para iniciar a configuração do terminal Smart, siga as instruções detalhadas no nosso portal de ajuda.
[Link do FAQ - Configuração Smart](https://helptools.softcomsistemas.com.br/core/promover/detalhe/id/7698)

**Como realizar a reconfiguração do Smart?**
Caso seja necessário reconfigurar o dispositivo após uma atualização ou reset, consulte o guia passo a passo.
[Link do FAQ - Reconfiguração](#)

---

### Links Úteis

* **Senha de Administração Cielo Lio (Senha do dia):** [Link das senhas](https://docs.google.com/spreadsheets/d/13DbjgmJFtvzcWBfkptrnegjhhyINQdk2CvRy5a4A_ko/edit?gid=1470701697#gid=1470701697)
* **Portal do Desenvolvedor Cielo:** [Acessar](#)
  `,
  stone: `
## Dispositivos Compatíveis Stone

* **L400** (Recomendado)
* P2
* GPOS700X
* A8
* T8
* L300

### Procedimentos

**Ativação do Terminal:**
1. Ligue o equipamento
2. Insira o código de ativação Stone
3. Aguarde o download das tabelas

[Manual Completo Stone](#)
  `
};

// Default documentation for acquirers without specific data
const defaultDocumentation = `
## Documentação Padrão

A documentação específica para esta adquirente ainda está sendo elaborada pela equipe técnica.

Para dúvidas gerais, entre em contato com o suporte nível 2 ou consulte a base de conhecimento geral.
`;

export default function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos os Status');
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [selectedAcquirerForDoc, setSelectedAcquirerForDoc] = useState<Acquirer | null>(null);

  // Filter logic
  const filteredAcquirers = acquirersData.filter(acquirer => {
    const matchesSearch = acquirer.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'Todos os Status' || acquirer.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const openDocumentation = (acquirer: Acquirer) => {
    setSelectedAcquirerForDoc(acquirer);
    setIsDocModalOpen(true);
  };

  const closeDocumentation = () => {
    setIsDocModalOpen(false);
    setTimeout(() => setSelectedAcquirerForDoc(null), 300); // Wait for transition
  };

  const getStatusIcon = (status: Acquirer["status"]) => {
    switch (status) {
      case 'Concluído': return <CheckCircle2 size={14} className="mr-1" />;
      case 'Em teste': return <Clock size={14} className="mr-1" />;
      case 'Em certificação': return <AlertCircle size={14} className="mr-1" />;
      default: return <div className="w-2 h-2 rounded-full bg-current mr-1.5" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-xl">
            a
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 leading-tight">Adquirentes Softcom Smart</h1>
            <p className="text-sm text-slate-500">Acompanhamento de versões e dispositivos</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400">by</span>
          <div className="font-black text-lg text-slate-800 flex items-center">
            <div className="w-5 h-5 bg-yellow-400 rounded-sm mr-1 border-b-2 border-r-2 border-yellow-600"></div>
            softcom
          </div>
        </div>
      </header>

      <main className="p-6 max-w-[1600px] mx-auto">
        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Pesquise a adquirente desejada"
              className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative w-64">
            <select
              className="block w-full pl-4 pr-10 py-2.5 text-base border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-xl appearance-none bg-white cursor-pointer transition-shadow"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option>Todos os Status</option>
              <option>Em teste</option>
              <option>Em certificação</option>
              <option>Concluído</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
          {filteredAcquirers.map(acquirer => (
            <div key={acquirer.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col h-full relative group">
              
              {/* Card Header */}
              <div className="p-5 border-b border-slate-100 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full ${acquirer.logoColor} flex items-center justify-center text-white font-bold shadow-inner`}>
                    {acquirer.name.substring(0, 1)}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-800">{acquirer.name}</h3>
                    <div className={`text-xs font-semibold flex items-center ${acquirer.statusColor}`}>
                      {getStatusIcon(acquirer.status)}
                      {acquirer.status}
                    </div>
                  </div>
                </div>
                
                {/* NEW FEATURE: Documentation Button */}
                <button 
                  onClick={() => openDocumentation(acquirer)}
                  className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1 group/btn"
                  title="Ver Documentação de Suporte"
                >
                  <FileText size={18} />
                  <span className="text-xs font-medium hidden group-hover/btn:block opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap absolute right-12 bg-slate-800 text-white px-2 py-1 rounded shadow-lg">Docs</span>
                </button>
              </div>

              <div className="p-5 flex-grow flex flex-col gap-4">
                {/* Current Version */}
                <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
                  <div className="text-xs text-slate-500 font-medium mb-1">Versão Atual</div>
                  <div className="text-xl font-bold text-slate-800">{acquirer.currentVersion}</div>
                </div>

                {/* Next Version */}
                <div className="flex justify-between items-center text-sm">
                  <div>
                    <div className="text-xs text-slate-500 font-medium">Próxima</div>
                    <div className="font-semibold text-slate-800">{acquirer.nextVersion || '—'}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-500 font-medium">Enviada em</div>
                    <div className="font-semibold text-slate-800">{acquirer.sentDate || '—'}</div>
                  </div>
                </div>

                {/* Connection */}
                <div>
                  <div className="text-xs text-slate-500 font-medium mb-2">Conexão</div>
                  <div className="flex gap-2">
                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${acquirer.connection.wifi ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                      <Wifi size={12} /> Wi-Fi
                    </div>
                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${acquirer.connection.mobile ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-red-50 text-red-500 border-red-100 line-through'}`}>
                      <Signal size={12} /> 4G
                    </div>
                  </div>
                </div>

                {/* Devices */}
                <div className="mt-auto pt-2">
                  <div className="text-xs text-slate-500 font-medium mb-2">Dispositivos compatíveis</div>
                  <div className="flex flex-wrap gap-1.5">
                    {acquirer.devices.length > 0 ? (
                      acquirer.devices.map((device, idx) => (
                        <span 
                          key={idx} 
                          className={`text-xs px-2 py-1 rounded-md border ${
                            device.recommended 
                              ? 'bg-purple-600 text-white border-purple-600 shadow-sm flex items-center gap-1' 
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          {device.recommended && <span className="text-[10px]">★</span>}
                          {device.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic">Nenhum dispositivo mapeado</span>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Quick action overlay on hover (optional enhancement) */}
              <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-white via-white/90 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex justify-center">
                 <button 
                  onClick={() => openDocumentation(acquirer)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md flex items-center gap-2 transition-colors w-full justify-center"
                 >
                   <FileText size={16} />
                   Ler Documentação Completa
                 </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {}
      {/* Backdrop */}
      {isDocModalOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 transition-opacity"
          onClick={closeDocumentation}
        />
      )}

      {/* Slide-over Panel (Drawer) */}
      <div 
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-2xl bg-white shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${
          isDocModalOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {selectedAcquirerForDoc && (
          <>
            {/* Drawer Header */}
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between sticky top-0">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full ${selectedAcquirerForDoc.logoColor} flex items-center justify-center text-white font-bold shadow-inner`}>
                  {selectedAcquirerForDoc.name.substring(0, 1)}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">
                    Documentação de Suporte
                  </h2>
                  <p className="text-sm text-slate-500 font-medium">
                    Adquirente: <span className="text-slate-800">{selectedAcquirerForDoc.name}</span>
                  </p>
                </div>
              </div>
              <button 
                onClick={closeDocumentation}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Drawer Content - Markdown Renderer */}
            <div className="flex-1 overflow-y-auto p-8 bg-white">
              <div className="prose prose-slate prose-blue max-w-none prose-headings:font-bold prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-li:my-1">
                <ReactMarkdown
                  components={{
                    h2: ({node, ...props}) => <h2 className="text-2xl mt-0 mb-4 pb-2 border-b border-slate-200 text-slate-800" {...props} />,
                    h3: ({node, ...props}) => <h3 className="text-xl mt-8 mb-3 text-slate-800" {...props} />,
                    strong: ({node, ...props}) => <strong className="font-semibold text-slate-900" {...props} />,
                    a: ({node, ...props}) => <a className="inline-flex items-center gap-1 font-medium bg-blue-50 px-2 py-1 rounded-md text-blue-700 hover:bg-blue-100 transition-colors" target="_blank" rel="noopener noreferrer" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-6 space-y-1 text-slate-600" {...props} />,
                    li: ({node, ...props}) => <li {...props} />,
                    p: ({node, ...props}) => <p className="mb-4 text-slate-600 leading-relaxed" {...props} />,
                    hr: ({node, ...props}) => <hr className="my-8 border-slate-200" {...props} />,
                  }}
                >
                  {documentationData[selectedAcquirerForDoc.id.toLowerCase()] || defaultDocumentation}
                </ReactMarkdown>
              </div>
            </div>
            
            {/* Drawer Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button 
                onClick={closeDocumentation}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded-lg transition-colors"
              >
                Fechar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}