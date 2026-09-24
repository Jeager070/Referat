import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Box, Code2, Grid2X2, Layers3, Zap, Workflow, Sparkles, Component } from 'lucide-react';

export const lastSteps = [3, 4, 3, 4, 3];

function Reveal({ show, children, className = '' }) {
  const reduced = useReducedMotion();
  return <motion.div className={`reveal ${className}`} aria-hidden={!show} inert={!show ? true : undefined}
    initial={false} animate={{ opacity: show ? 1 : 0, y: show || reduced ? 0 : 24 }}
    transition={{ duration: reduced ? 0 : .5, ease: [.16, 1, .3, 1] }}
    style={{ visibility: show ? 'visible' : 'hidden', pointerEvents: show ? 'auto' : 'none' }}>
    {children}
  </motion.div>;
}

function Heading({ number, kicker, title, accent }) {
  const reduced=useReducedMotion();
  return <div className="slide-heading"><motion.div className="eyebrow" initial={{opacity:0}} animate={{opacity:1}} transition={{duration:.4}}><span>{number} /</span> {kicker}</motion.div><h1><motion.span initial={{opacity:0,y:reduced?0:22}} animate={{opacity:1,y:0}} transition={{duration:.7,ease:[.16,1,.3,1]}}>{title}</motion.span>{' '}<motion.em initial={{opacity:0,y:reduced?0:22}} animate={{opacity:1,y:0}} transition={{duration:.7,delay:reduced?0:.12,ease:[.16,1,.3,1]}}>{accent}</motion.em></h1></div>;
}

function Point({ show, number, children }) {
  const Icon=[Layers3,Zap,Workflow][Number(number)-1];
  return <Reveal show={show}><article><span className="point-icon"><Icon size={26} strokeWidth={1.4}/></span><h2>{children}</h2><span className="point-number">{number}</span></article></Reveal>;
}

function Overview({ step, Cube, animated }) {
  return <><Heading number="01" kicker="ZWEI ANSÄTZE. EIN SYSTEM." title="Monolith" accent="↔ Modular"/>
    <div className="hero-comparison">
      <Reveal show={step >= 0} className="hero-object"><Cube animated={animated}/><div className="object-caption"><h2>Ein großes Ganzes.</h2><span className="tag">MONOLITHISCH</span></div></Reveal>
      <Reveal show={step >= 1} className="versus"><span/><ArrowRight size={25}/><span/></Reveal>
      <Reveal show={step >= 1} className="hero-object"><Cube modular animated={animated} active={step >= 1}/><div className="object-caption"><h2>Klare Bausteine.</h2><span className="tag green">MODULAR</span></div></Reveal>
    </div>
    <Reveal show={step >= 3} className="bottom-insight"><span className="live-dot"/> Gleiche Funktionen. Andere Struktur.</Reveal>
  </>;
}

function ArchitectureSequence({ step, Cube, index, animated }) {
  const modular = index === 2;
  const phase = modular ? (step === 0 ? 'partition' : step === 1 ? 'split' : step === 2 ? 'connected' : 'deployment') : 'monolith';
  return <><Heading key={index} number={modular ? '03' : '02'} kicker={modular ? 'MODULAR AUFGEBAUT' : 'DER MONOLITH'} title={modular ? 'Eine Anwendung.' : 'Alles unter'} accent={modular ? 'Klare Aufgaben.' : 'einem Dach.'}/>
    <div className="detail-layout">
      <div className={`visual-panel architecture-sequence ${modular ? 'module-panel' : ''}`} data-phase={phase}>
        <div className="boundary-label" aria-hidden={!modular}><span className="live-dot"/> SHOPAPP · EINE ANWENDUNG</div>
        <Cube sequence phase={phase} opened={!modular && step >= 1} animated={animated}/>
        <div className="phase-caption" aria-live="polite">{modular ? ['Fachliche Grenzen werden sichtbar.', 'Vier Aufgaben. Vier Module.', 'Zusammenarbeit über Schnittstellen.', 'Gemeinsam bereitstellen.'][step] : step >= 1 ? 'Ein Blick in die Anwendung.' : 'Eine gemeinsame Anwendung.'}</div>
      </div>
      <div className="points staged-points">
        <Point show={step >= (modular ? 1 : 2)} number="01">{modular ? 'Ein Modul. Eine Aufgabe.' : 'Eine Anwendung.'}</Point>
        <Point show={step >= (modular ? 2 : 3)} number="02">{modular ? 'Klare Schnittstellen.' : 'Einfach starten.'}</Point>
        <Point show={step >= (modular ? 3 : 4)} number="03">{modular ? 'Ein gemeinsames Deployment.' : 'Wachstum braucht Ordnung.'}</Point>
      </div>
    </div>
  </>;
}

const files = [['Program.cs','Program.cs'],['User.cs','Users/'],['Product.cs','Products/'],['Order.cs','Orders/'],['Payment.cs','Payments/'],['Database.cs','Infrastructure/']];

function Tree({ organized = false, target = false }) {
  return <div className={`code-window ${target ? 'target' : ''} ${organized ? 'organized' : ''}`}>
    <div className="window-bar">{target ? <Grid2X2 size={17}/> : <Code2 size={17}/>}<span>{target ? (organized ? 'Nachher · modular' : 'ShopApp') : 'Vorher · flach'}</span></div>
    <div className="tree-root"><Box size={16}/> ShopApp/</div>
    <div className="animated-tree">{files.map(([file,folder], i) => <React.Fragment key={file}>
      {organized && i === 1 && <motion.div initial={{opacity:0}} animate={{opacity:1}} className="folder-row"><span>├─</span> Modules/</motion.div>}
      <motion.div layout transition={{type:'spring',stiffness:130,damping:22}} className={`file-row ${organized && i > 0 && i < 5 ? 'nested' : ''}`}>
        <span>{organized && i > 0 && i < 5 ? '│  ├─' : i === 5 && !organized ? '└─' : '├─'}</span>
        <span className={organized && i > 0 ? 'folder-symbol' : 'cs'}>{organized && i > 0 ? '▱' : 'C#'}</span>
        {organized ? folder : file}
      </motion.div>
    </React.Fragment>)}
    {organized && <motion.div initial={{opacity:0}} animate={{opacity:1}} className="folder-row"><span>└─</span> Shared/</motion.div>}</div>
  </div>;
}

function Practice({ step }) {
  return <><Heading number="04" kicker="C# IN DER PRAXIS" title="Gleicher Shop." accent="Bessere Ordnung."/>
    <div className="code-comparison">
      <Reveal show={step >= 1}><Tree/></Reveal>
      <Reveal show={step >= 2} className="transform-button"><span><ArrowRight size={25}/></span></Reveal>
      <Reveal show={step >= 2}><Tree target organized={step >= 3}/></Reveal>
    </div>
    <Reveal show={step >= 4} className="bottom-insight"><span className="live-dot"/> Ordner + Schnittstellen + klare Abhängigkeiten.</Reveal>
  </>;
}

function Conclusion({ step }) {
  return <><Heading number="05" kicker="VERGLEICH & FAZIT" title="Was passt" accent="wann?"/>
    <div className="verdict-grid">
      <Reveal show={step >= 1} className="verdict-card warm"><div className="verdict-art"><Zap size={52} strokeWidth={1}/></div><span className="eyebrow">EINFACHE STRUKTUR</span><h2>Schnell starten.</h2><p>Für überschaubare Projekte.</p></Reveal>
      <Reveal show={step >= 2} className="verdict-card cool"><div className="verdict-art"><Component size={52} strokeWidth={1}/></div><span className="eyebrow">MODULARE STRUKTUR</span><h2>Gezielt erweitern.</h2><p>Klare Zuständigkeiten.</p></Reveal>
    </div>
    <Reveal show={step >= 3} className="conclusion"><Sparkles className="conclusion-spark" size={22}/><span className="eyebrow">DER MODULARE MONOLITH</span><h2>Eine Anwendung – <em>aber sauber strukturiert.</em></h2></Reveal>
  </>;
}

const MemoArchitectureSequence = React.memo(ArchitectureSequence);
export const slides = [React.memo(Overview), MemoArchitectureSequence, MemoArchitectureSequence, React.memo(Practice), React.memo(Conclusion)];
