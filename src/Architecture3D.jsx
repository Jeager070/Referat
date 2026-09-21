import React from 'react';
import { UserRound, ShoppingCart, ClipboardList, CreditCard, PanelsTopLeft, Settings, Database } from 'lucide-react';
import './architecture.css';

const modules = [
  ['Users', UserRound], ['Products', ShoppingCart],
  ['Orders', ClipboardList], ['Payments', CreditCard],
];
const layers = [['Frontend', PanelsTopLeft], ['Logik', Settings], ['Daten', Database]];

// Real text stays sharp; only the decorative top and side faces are skewed.
// Transitions run on state changes, without a continuous rendering loop.
export default function Architecture3D({ modular = false, opened = false }) {
  const items = modular ? modules : layers;
  return <div className="architecture-render architecture-light" data-mode={modular ? 'modular' : opened ? 'open' : 'closed'}>
    <div className={`architecture-blocks ${modular ? 'is-modular' : ''} ${opened ? 'is-open' : ''}`}
      role="img" aria-label={modular ? 'Vier Module: Users, Products, Orders und Payments.' : opened ? 'Monolith mit Frontend, Logik und Daten.' : 'Eine Anwendung.'}>
      {items.map(([name, Icon], index) => <div className="architecture-block" key={index} style={{ '--index': index }} aria-hidden="true">
        <div className="block-top"/><div className="block-side"/>
        <div className="block-front"><span className="block-label"><Icon size={27} strokeWidth={1.8}/><span>{name}</span></span></div>
      </div>)}
    </div>
  </div>;
}
