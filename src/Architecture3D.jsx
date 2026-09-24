import React, { useEffect, useRef, useState } from 'react';
import { UserRound, ShoppingCart, ClipboardList, CreditCard, PanelsTopLeft, Settings, Database } from 'lucide-react';
const modules = [['Users', UserRound], ['Products', ShoppingCart], ['Orders', ClipboardList], ['Payments', CreditCard]];
const layers = [['Frontend', PanelsTopLeft], ['Logik', Settings], ['Daten', Database]];

export default function Architecture3D({ modular = false, opened = false, sequence = false, phase = 'monolith', animated = true, active = true }) {
  const host = useRef(null);
  const engine = useRef(null);
  const mode = sequence ? phase : modular ? 'split' : 'monolith';
  const latest = useRef({ mode, opened, animated, active });
  latest.current = { mode, opened, animated, active };
  const [status, setStatus] = useState('loading');
  useEffect(() => {
    let disposed = false;
    import('./glassScene.js').then(({ createGlassScene }) => {
      if (disposed) return;
      engine.current = createGlassScene(host.current, latest.current, () => setStatus('fallback'));
      setStatus('ready');
    }).catch(error => { if (!disposed) { console.warn('Glass scene unavailable:', error); setStatus('fallback'); } });
    return () => { disposed = true; engine.current?.dispose(); engine.current = null; };
  }, []);
  useEffect(() => { engine.current?.update({ mode, opened, animated, active }); }, [mode, opened, animated, active]);
  return <div ref={host} className={`glass-scene architecture-render ${sequence ? 'sequence-render' : ''}`} data-mode={mode} data-opened={opened} data-status={status}
    role="img" aria-label={mode === 'monolith' ? (opened ? 'Holografischer Monolith, geöffnet in Frontend, Logik und Daten.' : 'Ein rotierender holografischer Monolith.') : 'Vier schwebende Hologramm-Module: Users, Products, Orders und Payments. Eine gemeinsame Anwendung.'}>
    <div className="glass-aura" aria-hidden="true"/>
    <div className="glass-labels" aria-hidden="true">
      {modules.map(([name, Icon], i) => <span className="glass-label module-label" data-label={i} key={name}><Icon size={19} strokeWidth={1.4}/><span>{name}</span></span>)}
      {layers.map(([name, Icon], i) => <span className="glass-label layer-label" data-layer={i} key={name}><Icon size={16} strokeWidth={1.4}/><span>{name}</span></span>)}
    </div>
    <div className="glass-fallback" aria-hidden="true">{(mode === 'monolith' ? layers : modules).map(([name, Icon]) => <div key={name}><Icon size={25}/><span>{name}</span></div>)}</div>
    <div className="glass-deployment" aria-hidden="true">SHOPAPP · EIN DEPLOYMENT</div>
  </div>;
}
