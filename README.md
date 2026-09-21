# Monolith ↔ Modular

Interaktive deutsche React-Keynote für ein fünfminütiges Referat. React, Framer Motion, CSS-3D, Vite. Kein Backend nötig.

## Starten

```sh
npm install
npm run dev
```

Die angezeigte lokale Adresse im Browser öffnen. Produktionsversion: `npm run build`, danach `npm run preview`. Der Ordner `dist` kann auf einem statischen Hostingdienst veröffentlicht werden.

## Bedienung

- Pfeiltaste rechts oder Leertaste: nächsten Inhalt einblenden; nach dem letzten Schritt zur nächsten Folie wechseln
- Pfeiltaste links: einen Einblendschritt zurück; am Folienanfang zur vollständig eingeblendeten vorherigen Folie
- Die Abschnittsnavigation startet die gewählte Folie mit der Überschrift. Die Schrittanzeige zeigt den Fortschritt innerhalb der Folie.
- F: Vollbild (alternativ F11)
- N: Sprechzettel und manuell startbaren 5-Minuten-Timer ein-/ausblenden
- O: Abschnittsübersicht
- Escape: Übersicht und Sprechzettel schließen
- Abschnitt 2: Block erscheint, öffnet sich, dann folgen kurze Kernaussagen
- Abschnitt 3: Block erscheint und teilt sich beim Weiterklicken in Module
- Abschnitt 4: C#-Dateistrukturen erscheinen nacheinander und ordnen sich beim Weiterklicken um

Der Sprechzettel ist auf demselben Bildschirm sichtbar; vor einer Bildschirmfreigabe ausblenden. Der Timer läuft dabei weiter. Folienwechsel erfolgen manuell. Auf kleinen Bildschirmen darf der Inhalt scrollen, damit alles lesbar bleibt. Auf Präsentationsbildschirmen dient die Ansicht als Keynote.

Die Präsentation vergleicht wenig gegliederte und modular aufgebaute Anwendungen. Ein modularer Monolith ist weiterhin eine gemeinsame Bereitstellungseinheit. Module bedeuten weder automatisch Microservices noch unabhängige Skalierung oder Fehlerisolation. Ordnerstrukturen illustrieren Zuständigkeiten; Schnittstellen und Abhängigkeitsregeln müssen zusätzlich umgesetzt werden.

Schriftarten werden über Google Fonts geladen; bei fehlendem Internet greifen lokale Ersatzschriften. Die 3D-Elemente werden direkt im Browser dargestellt.
