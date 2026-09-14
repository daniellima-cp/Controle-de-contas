import React, { useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  LayoutDashboard, WalletCards, CreditCard, ArrowDownLeft, ArrowUpRight,
  Users, Settings, FileText, Search, Plus, Menu, X, ShieldCheck,
  CalendarDays, ChevronDown
} from 'lucide-react'
import './styles.css'

const initialAccounts = [
  { id: 1, name: 'Conta Principal', bank: 'Santander', balance: 48500.00, card: 'Cartão Principal', cardTotal: 7280.40 },
  { id: 2, name: 'Conta Reserva 1', bank: 'Santander', balance: 8300.00, card: 'Cartão Reserva 1', cardTotal: 1420.00 },
  { id: 3, name: 'Conta Reserva 2', bank: 'Santander', balance: 2140.00, card: 'Cartão Reserva 2', cardTotal: 690.90 },
  { id: 4, name: 'Conta Reserva 3', bank: 'Santander', balance: 960.00, card: 'Cartão Reserva 3', cardTotal: 315.50 }
]

const initialMovements = [
  { id: 1, account: 1, date: '14/09/2026', type: 'Entrada', description: 'Aporte recebido', value: 12000, reference: 'Pagamento de contas' },
  { id: 2, account: 1, date: '14/09/2026', type: 'Saída', description: 'Devolução de saldo', value: 3500, reference: 'Sobra do aporte' },
  { id: 3, account: 1, date: '13/09/2026', type: 'Saída', description: 'Transferência para pagamento', value: 2800, reference: 'Contas' },
  { id: 4, account: 2, date: '12/09/2026', type: 'Entrada', description: 'Aporte recebido', value: 4000, reference: 'Reposição' }
]

function money(v) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}

function App() {
  const [page, setPage] = useState('dashboard')
  const [accounts, setAccounts] = useState(initialAccounts)
  const [movements, setMovements] = useState(initialMovements)
  const [selectedAccount, setSelectedAccount] = useState(1)
  const [year, setYear] = useState('2026')
  const [period, setPeriod] = useState('Todos')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [modal, setModal] = useState(null)

  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0)
  const totalCards = accounts.reduce((s, a) => s + a.cardTotal, 0)
  const filtered = useMemo(() => movements.filter(m => {
    if (m.account !== selectedAccount) return false
    if (period === 'Hoje') return m.date === '14/09/2026'
    if (period === 'Semana') return ['14/09/2026','13/09/2026','12/09/2026'].includes(m.date)
    if (period === 'Mês') return m.date.endsWith('/09/2026')
    return true
  }), [movements, selectedAccount, period])

  function addMovement(e) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const type = f.get('type')
    const value = Number(f.get('value'))
    const accountId = Number(f.get('account'))
    setAccounts(prev => prev.map(a => a.id === accountId
      ? { ...a, balance: a.balance + (type === 'Entrada' ? value : -value) }
      : a
    ))
    setMovements(prev => [{
      id: Date.now(), account: accountId, date: '14/09/2026', type,
      description: f.get('description'), value, reference: f.get('reference')
    }, ...prev])
    setModal(null)
  }

  const nav = [
    ['dashboard','Visão geral',LayoutDashboard],
    ['accounts','Contas',WalletCards],
    ['cards','Cartões de crédito',CreditCard],
    ['movements','Movimentações',ArrowDownLeft],
    ['receipts','Comprovantes',FileText],
    ['users','Usuários e permissões',Users],
    ['settings','Configurações',Settings],
  ]

  return <div className="app">
    <aside className={mobileOpen ? 'sidebar open' : 'sidebar'}>
      <div className="brand">
        <div className="brand-mark">CF</div>
        <div><strong>Central Financeira</strong><span>Controle financeiro</span></div>
        <button className="icon mobile-close" onClick={() => setMobileOpen(false)}><X size={20}/></button>
      </div>
      <nav>{nav.map(([key,label,Icon]) =>
        <button key={key} className={page === key ? 'nav active' : 'nav'} onClick={() => {setPage(key);setMobileOpen(false)}}>
          <Icon size={19}/><span>{label}</span>
        </button>
      )}</nav>
      <div className="admin"><ShieldCheck size={18}/><div><b>Administrador</b><small>Acesso completo</small></div></div>
    </aside>

    <main>
      <header>
        <button className="icon menu" onClick={() => setMobileOpen(true)}><Menu/></button>
        <div><h1>{nav.find(n => n[0] === page)?.[1] || 'Visão geral'}</h1><p>Controle centralizado das suas contas</p></div>
        <div className="header-actions"><button className="user-chip">Administrador <ChevronDown size={16}/></button></div>
      </header>

      {page === 'dashboard' && <section className="content">
        <div className="toolbar">
          <div className="filters"><CalendarDays size={17}/><select value={year} onChange={e=>setYear(e.target.value)}><option>2026</option><option>2025</option></select>
          {['Todos','Mês','Semana','Hoje'].map(p=><button className={period===p?'filter active':'filter'} onClick={()=>setPeriod(p)} key={p}>{p}</button>)}</div>
          <button className="primary" onClick={()=>setModal('movement')}><Plus size={18}/> Nova movimentação</button>
        </div>
        <div className="cards">
          <div className="stat"><span>Saldo total controlado</span><strong>{money(totalBalance)}</strong><small>Em {accounts.length} contas</small></div>
          <div className="stat"><span>Fatura dos cartões</span><strong>{money(totalCards)}</strong><small>Valor acumulado</small></div>
          <div className="stat"><span>Contas cadastradas</span><strong>{accounts.length}</strong><small>Controles independentes</small></div>
          <div className="stat"><span>Movimentações filtradas</span><strong>{filtered.length}</strong><small>Período: {period}</small></div>
        </div>
        <div className="grid">
          <div className="panel wide"><div className="panel-head"><div><h2>Movimentações recentes</h2><p>Conta selecionada e período filtrado</p></div>
            <select value={selectedAccount} onChange={e=>setSelectedAccount(Number(e.target.value))}>{accounts.map(a=><option value={a.id} key={a.id}>{a.name}</option>)}</select>
          </div>
          <div className="table-wrap"><table><thead><tr><th>Data</th><th>Movimentação</th><th>Referência</th><th>Valor</th></tr></thead><tbody>
            {filtered.map(m=><tr key={m.id}><td>{m.date}</td><td><span className={m.type==='Entrada'?'movement in':'movement out'}>{m.type==='Entrada'?<ArrowDownLeft size={15}/>:<ArrowUpRight size={15}/>} {m.description}</span></td><td>{m.reference}</td><td className={m.type==='Entrada'?'positive':'negative'}>{m.type==='Entrada'?'+':'-'} {money(m.value)}</td></tr>)}
          </tbody></table></div></div>
          <div className="panel"><div className="panel-head"><div><h2>Contas</h2><p>Saldo atual</p></div></div>
            {accounts.map(a=><button className="account-row" key={a.id} onClick={()=>{setSelectedAccount(a.id);setPage('accounts')}}><span className="bank-icon">S</span><div><b>{a.name}</b><small>{a.bank}</small></div><strong>{money(a.balance)}</strong></button>)}
          </div>
        </div>
      </section>}

      {page === 'accounts' && <section className="content"><div className="toolbar"><div><h2>Contas cadastradas</h2><p>Quantidade ilimitada de controles de conta</p></div><button className="primary"><Plus size={18}/> Nova conta</button></div>
        <div className="account-grid">{accounts.map(a=><div className="account-card" key={a.id}><div className="account-title"><span className="bank-icon">S</span><div><h3>{a.name}</h3><p>{a.bank}</p></div></div><span className="label">Saldo atual</span><strong>{money(a.balance)}</strong><button className="secondary" onClick={()=>{setSelectedAccount(a.id);setPage('movements')}}>Ver movimentações</button></div>)}</div>
      </section>}

      {page === 'cards' && <section className="content"><div className="toolbar"><div><h2>Cartões de crédito</h2><p>Compras e valor acumulado por conta</p></div><button className="primary"><Plus size={18}/> Registrar compra</button></div>
        <div className="account-grid">{accounts.map(a=><div className="credit-card" key={a.id}><div><CreditCard size={25}/><span>{a.name}</span></div><small>{a.card}</small><strong>{money(a.cardTotal)}</strong><span>Fatura acumulada</span></div>)}</div>
      </section>}

      {page === 'movements' && <section className="content"><div className="toolbar"><div><h2>Movimentações</h2><p>Consulte entradas e saídas por período</p></div><button className="primary" onClick={()=>setModal('movement')}><Plus size={18}/> Nova movimentação</button></div>
        <div className="panel"><div className="filter-line"><Search size={17}/><select value={year} onChange={e=>setYear(e.target.value)}><option>2026</option></select>{['Todos','Mês','Semana','Hoje'].map(p=><button className={period===p?'filter active':'filter'} onClick={()=>setPeriod(p)} key={p}>{p}</button>)}</div>
        <div className="table-wrap"><table><thead><tr><th>Data</th><th>Conta</th><th>Tipo</th><th>Descrição</th><th>Referência</th><th>Valor</th></tr></thead><tbody>{movements.filter(m=>period==='Todos'||(period==='Hoje'&&m.date==='14/09/2026')||(period==='Mês'&&m.date.endsWith('/09/2026'))).map(m=><tr key={m.id}><td>{m.date}</td><td>{accounts.find(a=>a.id===m.account)?.name}</td><td>{m.type}</td><td>{m.description}</td><td>{m.reference}</td><td className={m.type==='Entrada'?'positive':'negative'}>{money(m.value)}</td></tr>)}</tbody></table></div></div>
      </section>}

      {['receipts','users','settings'].includes(page) && <section className="content"><div className="empty-state"><div className="empty-icon">{page==='receipts'?<FileText/>:page==='users'?<Users/>:<Settings/>}</div><h2>{nav.find(n=>n[0]===page)?.[1]}</h2><p>Área preparada para a implementação das funcionalidades descritas no projeto.</p>{page==='users'&&<button className="primary" onClick={()=>alert('Área de criação de usuários preparada no protótipo.')}> <Plus size={18}/> Novo usuário</button>}</div></section>}

      {modal === 'movement' && <div className="modal-bg" onMouseDown={()=>setModal(null)}><div className="modal" onMouseDown={e=>e.stopPropagation()}><div className="modal-head"><div><h2>Nova movimentação</h2><p>O saldo da conta será atualizado automaticamente.</p></div><button className="icon" onClick={()=>setModal(null)}><X/></button></div>
        <form onSubmit={addMovement}><label>Conta<select name="account" defaultValue={selectedAccount}>{accounts.map(a=><option value={a.id} key={a.id}>{a.name}</option>)}</select></label>
        <label>Tipo<select name="type"><option>Entrada</option><option>Saída</option></select></label>
        <label>Valor<input name="value" type="number" step="0.01" required placeholder="0,00"/></label>
        <label>Descrição<input name="description" required placeholder="Ex.: Aporte recebido"/></label>
        <label>Referência<input name="reference" required placeholder="A que se refere este valor?"/></label>
        <label>Comprovante<input type="file" name="receipt"/></label>
        <div className="modal-actions"><button type="button" className="secondary" onClick={()=>setModal(null)}>Cancelar</button><button className="primary">Salvar movimentação</button></div></form>
      </div></div>}
    </main>
  </div>
}

createRoot(document.getElementById('root')).render(<App />)
