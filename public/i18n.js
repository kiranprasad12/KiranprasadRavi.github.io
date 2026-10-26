/* Language switch (English and German).
   The English text lives in index.html. German text lives in the DE table below.
   Elements with data-i18n="key" get their text swapped. data-i18n-attr="attr:key;..." swaps attributes. */
(function () {
  "use strict";
  var DE = {
"page.1": "Zum Inhalt springen",
"site-header.1": "Kiran Prasad Ravi, Startseite",
"site-header.4": "Hauptnavigation",
"site-header.5": "Projekte",
"site-header.6": "Über mich",
"site-header.7": "Werdegang",
"site-header.8": "Fähigkeiten",
"site-header.9": "Code",
"site-header.10": "Kontakt",
"site-header.11": "Farbschema",
"site-header.12": "Schema Blueprint",
"site-header.14": "Schema Paper",
"site-header.16": "Schema Hi-vis",
"site-header.18": "Schnellsuche",
"site-header.19": "Strg K",
"site-header.20": "Menü öffnen",
"home.4":"Ich arbeite an Reinforcement Learning für die Vorrichtungskonstruktion, eingebetteter Sensorik und Simulation.",
"home.5": "Ich arbeite an ",
"home.7": "Ich studiere Nutzfahrzeugtechnik an der RPTU Kaiserslautern-Landau in Deutschland. Meine Arbeit liegt dort, wo Maschinenbau auf Software und Daten trifft.",
"home.8": "Hybrid-Demo ansehen",
"home.9": "Alle Projekte",
"home.10": "Kontakt aufnehmen",
"home.11": "Lebenslauf herunterladen (PDF)",
"home.12": "Kiran im Überblick",
"home.14": "Porträt von Kiran Prasad Ravi",
"home.15": "Studium",
"home.16": "M.Sc. Nutzfahrzeugtechnik",
"home.17": "Universität",
"home.19": "Hintergrund",
"home.20": "B.E. Maschinenbau, Anna University, Chennai",
"home.21": "Wohnort",
"home.22": "Kaiserslautern, Deutschland",
"home.23": "Sprachen",
"home.24": "Tamil, Englisch, Deutsch",
"home.25": "Gesucht",
"home.26": "Ein Pflichtpraktikum, bis zu 6 Monate",
"drive.1": "Hybridantrieb",
"drive.2": "Nach unten scrollen, um das Fahrzeug zu zeichnen.",
"drive.3": "Seitenansicht eines Hybrid-Nutzfahrzeugs",
"drive.4": "Strichzeichnung eines Kofferlastwagens mit Verbrennungsmotor, Elektromotor, Batterie und Antriebsachse. Pfeile zeigen, wohin die Energie im gewählten Fahrmodus fließt.",
"drive.5": "Motor",
"drive.6": "E-Motor",
"drive.7": "Batterie",
"drive.8": "Antriebsachse",
"drive.9": "Seitenansicht, vereinfacht",
"drive.10": "Fahrmodus",
"drive.11": "Elektrisch fahren",
"drive.12": "Verbrenner fahren",
"drive.13": "Boost",
"drive.14": "Bremsen",
"drive.17": "Ein vereinfachtes Schema eines Hybridantriebs, um die Idee zu erklären. Es ist keine Zeichnung meines Simulationsmodells.",
"drive.18": "weniger Kraftstoffverbrauch als die Basis, in der Simulation (Mittelwert aus FTP-75 und NEDC).",
"drive.19": "Energiemanagement für ein Hybridfahrzeug",
"drive.20": "Ich habe eine Energiemanagement-Strategie auf Basis der dynamischen Programmierung in MATLAB und Simulink entwickelt. Sie entscheidet, wann der Verbrennungsmotor und wann der Elektromotor das Fahrzeug antreiben. Geprüft habe ich sie mit Software-in-the-Loop-Tests (SiL).",
"drive.21": "Basis",
"drive.22": "Meine Strategie",
"drive.23": "Kraftstoffverbrauch in l/100 km, Mittelwert der Zyklen FTP-75 und NEDC. Werkzeuge: MATLAB, Simulink, dynamische Programmierung.",
"agent.1": "Vorrichtungskonstruktion mit Reinforcement Learning",
"agent.2": "Von Mai bis Juli 2026 habe ich als wissenschaftliche Hilfskraft am FBK gearbeitet. Ich habe eine bestehende deutsche Codebasis auf Englisch neu aufgebaut und erweitert. Es ist eine Python-Umgebung, in der ein PPO-Agent Auflager, Spanner und Punktkontakte auf einem Bauteilnetz platziert.",
"agent.3": "Ein Finite-Elemente-Modell (Pynite) prüft, wie stark sich das Bauteil unter Last bewegt. Das Ziel ist eine maximale Verschiebung unter 0,2 mm.",
"agent.4": "Das Training lief auf dem HPC-Cluster der Universität. Als ich im Juli 2026 aufgehört habe, war das System noch in einer frühen Trainingsphase.",
"agent.6": "Darstellung einer Trainingsepisode: ein Bauteil mit Netz, Vorrichtungselemente, eine Prüfung der Bauteilbewegung und ein Belohnungsbalken.",
"agent.7": "Auflager",
"agent.8": "Spanner",
"agent.9": "Wie stark bewegt sich das Bauteil?",
"agent.10": "Weniger Bewegung gibt mehr Belohnung",
"agent.11": "Agent aktualisieren und neu versuchen",
"agent.12": "Bauteil laden",
"agent.13": "Das CAD-Modell wird zu einem Netz.",
"agent.14": "Agent handelt",
"agent.15": "Er setzt ein Auflager oder einen Spanner.",
"agent.16": "FEM-Prüfung",
"agent.17": "Wie stark bewegt sich das Bauteil?",
"agent.18": "Belohnung",
"agent.19": "Weniger Bewegung gibt mehr Punkte.",
"agent.20": "Lernen",
"agent.21": "PPO aktualisiert den Agenten.",
"agent.23": "Eine Darstellung der Idee, keine echten Trainingsergebnisse.",
"thermal.1": "Wärmebildgebung bei einem 3D-Drucker",
"thermal.2": "In einem Kurs zu digitalen Zwillingen hat unsere Gruppe einen 3D-Drucker mit einem MLX90640-Wärmebildsensor beobachtet. Der Sensor schickt ein Temperaturbild mit 32 mal 24 Pixeln über I2C an einen ESP32. Wir haben verschiedene Druckgeschwindigkeiten und Wandstärken verglichen. Die Verkabelung habe ich selbst gemacht.",
"thermal.3": "Die Demo zeigt die Idee. Ändere die Geschwindigkeit oder die Wandstärke und sieh, wie sich die Wärme hinter der Düse verteilt.",
"thermal.4": "Druckgeschwindigkeit",
"thermal.5": "Langsam",
"thermal.6": "Mittel",
"thermal.7": "Schnell",
"thermal.8": "Wandstärke",
"thermal.9": "Dünn",
"thermal.10": "Dick",
"thermal.13": "Seitenansicht eines Bauteils, das Schicht für Schicht gedruckt wird. Die Düse fährt oben auf dem Bauteil hin und her.",
"thermal.14": "Was der Sensor sieht",
"thermal.15": "Wärmebild desselben Bauteils mit 32 mal 24 Pixeln. Warme Bereiche sind hell.",
"thermal.16": "Was der Sensor misst",
"thermal.17": "heißester Pixel",
"thermal.18": "(Beispielwerte)",
"thermal.19": "Ein einfaches Wärmemodell zur Erklärung der Idee, keine gemessenen Daten von uns.",
"projects.1": "Projekte",
"projects.2": "Projekte filtern",
"projects.3": "Alle",
"projects.4": "Simulation",
"projects.5": "Maschinelles Lernen",
"projects.6": "Eingebettet",
"projects.7": "Forschung",
"projects.8": "Simulation",
"projects.9": "Energiemanagement für ein Hybridfahrzeug",
"projects.10": "Ich habe eine Energiemanagement-Strategie auf Basis der dynamischen Programmierung in MATLAB und Simulink entwickelt. In der Simulation hat sie den Kraftstoffverbrauch um 31 % gesenkt. Geprüft habe ich sie mit Software-in-the-Loop-Tests (SiL).",
"projects.11": "MATLAB, Simulink, dynamische Programmierung",
"projects.12": "Zur interaktiven Demo",
"projects.13": "Maschinelles Lernen",
"projects.14": "Vorrichtungskonstruktion mit Reinforcement Learning",
"projects.15": "Ein PPO-Agent lernt, wo er Auflager und Spanner platziert, damit sich ein Bauteil unter Last möglichst wenig bewegt. Am FBK in Python entwickelt.",
"projects.17": "So lernt er",
"projects.18": "Eingebettete Systeme und Sensorik",
"projects.19": "Wärmebildgebung beim 3D-Druck",
"projects.20": "Ein Gruppenprojekt für einen Kurs zu digitalen Zwillingen. Wir haben einen MLX90640-Wärmebildsensor mit einem ESP32 genutzt, um einen 3D-Drucker zu beobachten, und verschiedene Druckgeschwindigkeiten und Wandstärken verglichen. Die Verkabelung habe ich selbst gemacht.",
"projects.22": "Zur Wärmebild-Demo",
"projects.23": "Forschung",
"projects.24": "Digitale Zwillinge in der Nutzfahrzeugtechnik",
"projects.25": "Eine wissenschaftliche Arbeit, die ich für einen Kurs zum wissenschaftlichen Schreiben verfasst habe. Sie untersucht, wie digitale Zwillinge in der Nutzfahrzeugtechnik eingesetzt werden.",
"projects.26": "Wissenschaftliches Schreiben, digitale Zwillinge",
"about.1": "Über mich",
"about.2": "Ich habe meinen B.E. in Maschinenbau an der Anna University in Chennai gemacht und studiere jetzt im Master Nutzfahrzeugtechnik an der RPTU in Kaiserslautern. Ich habe ein Praktikum bei Brakes India Private Limited gemacht, und von Mai bis Juli 2026 habe ich als wissenschaftliche Hilfskraft am Lehrstuhl für Fertigungstechnik und Betriebsorganisation (FBK) an der RPTU gearbeitet.",
"about.3": "Am FBK habe ich ein Reinforcement-Learning-System für die automatisierte Vorrichtungskonstruktion gebaut. Es verbindet Python, Finite-Elemente-Simulation und einen Hochleistungsrechner-Cluster. Dort habe ich meine Python- und Machine-Learning-Kenntnisse aufgebaut.",
"about.4": "Am meisten interessiert mich der Punkt, an dem Maschinenbau auf Software trifft: Simulation, Regelungsstrategien, Sensoren und Daten. Zu meinen Kursen gehören Kamerasysteme und 2D-Bildverarbeitung für Fahrerassistenz sowie digitale Zwillinge.",
"about.5": "Sprachen",
"about.6": "Tamil",
"about.7": "Muttersprache",
"about.8": "Englisch",
"about.9": "Deutsch",
"about.10": "Die Niveaus folgen dem Gemeinsamen Europäischen Referenzrahmen (GER).",
"about.11": "Neben der Arbeit",
"about.12": "Fotografie",
"about.13": "Videobearbeitung",
"about.14": "Musik",
"about.15": "Fitnessstudio",
"about.16": "Badminton",
"path.1": "Mein Werdegang",
"path.2": "Ausbildung",
"path.3": "B.E. Maschinenbau",
"path.4": "Anna University, Chennai",
"path.5": "M.Sc. Nutzfahrzeugtechnik",
"path.6": "RPTU Kaiserslautern-Landau, laufend",
"path.7": "Erfahrung",
"path.8": "Praktikum",
"path.9": "Brakes India Private Limited",
"path.10": "Wissenschaftliche Hilfskraft",
"path.11": "Lehrstuhl FBK, RPTU, Mai bis Juli 2026",
"path.12": "Eine bestehende deutsche Codebasis für Vorrichtungskonstruktion auf Englisch neu aufgebaut und erweitert",
"path.13": "Python-Umgebung, in der ein PPO-Agent Auflager und Spanner auf einem Bauteil platziert",
"path.14": "Finite-Elemente-Prüfungen mit Pynite, Ziel: Verschiebung unter 0,2 mm",
"path.15": "Training auf dem HPC-Cluster der Universität, Code in GitLab verwaltet",
"studies.1": "Studieninhalte",
"studies.2": "Kamerasysteme und Bildverarbeitung",
"studies.3": "2D-Bildverarbeitung für Fahrerassistenz (ADAS).",
"studies.4": "Digitale Zwillinge und Experimente",
"studies.5": "Computerphysik und experimentelle Analyse, mit einem praktischen Sensorprojekt.",
"studies.6": "Datenanalyse und Experimente",
"studies.7": "Versuchsplanung und Datenabgleich.",
"studies.8": "Maschinelles Lernen und Statistik",
"studies.9": "Selbststudium zu Clustering, Bewertungsmetriken und Wahrscheinlichkeitsverteilungen, während ich an Reinforcement Learning gearbeitet habe.",
"studies.10": "Grundlagen zu Software und Test",
"studies.11": "Kenntnisse aus Vorlesungen und Kursen zu CI/CD-Pipelines mit Jenkins, Bluetooth Low Energy und Flashen mit UDS. Das stammt aus Lehrveranstaltungen, nicht aus Arbeitsprojekten.",
"studies.12": "3D Computer Vision",
"studies.13": "Ein Kurs, den ich als Nächstes belegen möchte.",
"skills.1": "Fähigkeiten und Werkzeuge",
"skills.2": "Fähigkeiten filtern",
"skills.3": "Alle",
"skills.4": "Programmierung",
"skills.5": "Maschinelles Lernen",
"skills.6": "Simulation",
"skills.7": "CAD und Fertigung",
"skills.8": "Fahrzeug und Embedded",
"skills.9": "Werkzeuge",
"skills.14": "Reinforcement Learning (PPO)",
"skills.26": "3D-Druck",
"skills.30": "E-Bike-Elektronik",
"skills.35": "Linux-Grundlagen (WSL)",
"skills.36": "HPC mit SLURM",
"code.1": "Code",
"code.4": "Meine Repositories werden von GitHub geladen.",
"code.5": "GitHub-Profil öffnen",
"code.6": "GitLab an der RPTU",
"code.8": "Mein Universitätscode liegt auf dem GitLab der RPTU, auch die Arbeit zur Vorrichtungskonstruktion vom FBK.",
"code.9": "Dieser Server zeigt Projekte nur angemeldeten Universitätsnutzern, deshalb ist ein Uni-Login nötig, um sie zu sehen.",
"code.10": "GitLab-Profil öffnen",
"focus.1": "Wonach ich suche",
"focus.2": "Stellen",
"focus.3": "Ein Pflichtpraktikum von bis zu 6 Monaten. Ich bin auch offen für Werkstudentenstellen, HiWi-Stellen und Themen für Abschlussarbeiten.",
"focus.4": "Wo",
"focus.5": "Deutschland. Ich wohne in Kaiserslautern und bin umzugsbereit.",
"focus.6": "Themen, die mir wichtig sind",
"focus.7": "Automobil und Nutzfahrzeuge",
"focus.8": "ADAS und autonomes Fahren",
"focus.9": "Hybrid- und Elektroantriebe",
"focus.10": "Energiemanagement",
"focus.11": "Eingebettete Systeme",
"focus.12": "Test und Testautomatisierung",
"focus.13": "Maschinelles Lernen für Fahrzeuge",
"focus.14": "Ideen für den Vorrichtungsagenten",
"focus.15": "Ihn besser und schneller trainieren, zum Beispiel durch das Sperren ungültiger Aktionen (MaskablePPO) und seltenere FEM-Prüfungen.",
"contact.1": "Kontakt",
"contact.2": "Ich freue mich über Nachrichten zu Praktika, Werkstudentenstellen, Abschlussarbeiten und Projekten.",
"contact.3": "E-Mail",
"contact.5": "Kopieren",
"contact.6": "LinkedIn",
"contact.10": "GitLab",
"contact.12": "Ort",
"contact.13": "Kaiserslautern, Deutschland",
"contact.14": "Lebenslauf herunterladen (PDF)",
"contact.15": "Nachricht senden",
"contact.16": "Dein Name",
"contact.17": "Worum geht es?",
"contact.18": "Praktikum",
"contact.19": "Werkstudentenstelle",
"contact.20": "HiWi-Stelle",
"contact.21": "Thema für eine Abschlussarbeit",
"contact.22": "Etwas anderes",
"contact.23": "Nachricht",
"contact.24": "In meiner E-Mail-App öffnen",
"contact.25": "Das öffnet deine E-Mail-App mit der vorausgefüllten Nachricht. Von dieser Seite wird nichts gesendet.",
"footer.2": "Reines HTML, CSS und JavaScript. Gehostet auf GitHub Pages. Schrift: Barlow.",
"page.2": "Schnellsuche",
"page.3": "Zu einem Abschnitt springen oder eine Aktion ausführen",
"page.4": "Keine Treffer. Versuche einen Abschnittsnamen wie Fähigkeiten oder Kontakt.",
"page.5": "Nach oben",
"meta.title": "Kiran Prasad Ravi",
"meta.desc": "M.Sc.-Student der Nutzfahrzeugtechnik an der RPTU Kaiserslautern-Landau. Hybridfahrzeuge, eingebettete Systeme und maschinelles Lernen.",
"sec.home": "Start",
"sec.drive": "Hybridantrieb",
"sec.agent": "Agent für Vorrichtungskonstruktion",
"sec.thermal": "Wärmebildgebung",
"sec.projects": "Alle Projekte",
"sec.about": "Über mich",
"sec.path": "Werdegang",
"sec.studies": "Studieninhalte",
"sec.skills": "Fähigkeiten",
"sec.code": "Code",
"sec.focus": "Wonach ich suche",
"sec.contact": "Kontakt",
"js.phrases": [

"Reinforcement Learning für die Vorrichtungskonstruktion.",
"eingebettete Sensorik mit einem ESP32.",
"Simulation, Regelung und Daten."
],
"js.mode.electric.text": "Die Batterie versorgt den Elektromotor. Der Verbrennungsmotor ist aus.",
"js.mode.electric.status": "Die Batterie entlädt sich",
"js.mode.engine.text": "Der Verbrennungsmotor treibt die Räder über die Motorwelle an. Die Batterie wird nicht genutzt.",
"js.mode.engine.status": "Der Ladezustand der Batterie bleibt gleich",
"js.mode.boost.text": "Verbrennungsmotor und Elektromotor treiben die Räder gemeinsam an, zum Beispiel beim Beschleunigen mit Last.",
"js.mode.boost.status": "Die Batterie entlädt sich",
"js.mode.braking.text": "Der Elektromotor arbeitet als Generator und speist Bremsenergie zurück in die Batterie.",
"js.mode.braking.status": "Die Batterie lädt sich",
"js.hint.start": "Nach unten scrollen, um das Fahrzeug zu zeichnen.",
"js.hint.live": "Wähle einen Fahrmodus, um zu sehen, wohin die Energie fließt.",
"js.hint.keep": "Weiter scrollen.",
"js.rl.play": "Episode abspielen",
"js.rl.stop": "Stopp",
"js.th.pause": "Pause",
"js.th.play": "Abspielen",
"js.gh.nofetch": "Öffne mein GitHub-Profil, um meine Repositories zu sehen.",
"js.gh.none": "Noch keine öffentlichen Repositories. Neue Arbeiten erscheinen hier.",
"js.gh.one": " öffentliches Repository, von GitHub geladen.",
"js.gh.many": " öffentliche Repositories, von GitHub geladen.",
"js.gh.updated": "Aktualisiert ",
"js.gh.fail": "Die Repository-Liste konnte gerade nicht geladen werden. Bitte öffne mein GitHub-Profil.",
"js.toast.copied": "E-Mail-Adresse kopiert",
"js.toast.copyfail": "Kopieren hat nicht geklappt. Bitte markiere die Adresse von Hand.",
"js.toast.opening": "Deine E-Mail-App wird geöffnet",
"js.mail.hello": "Hallo Kiran,",
"js.mail.from": "Von: ",
"js.pal.section": "Abschnitt",
"js.pal.action": "Aktion",
"js.pal.link": "Link",
"js.pal.t1": "Farbschema: Blueprint",
"js.pal.t2": "Farbschema: Paper",
"js.pal.t3": "Farbschema: Hi-vis",
"js.pal.gh": "GitHub-Profil öffnen",
"js.pal.gl": "GitLab-Profil öffnen",
"js.pal.li": "LinkedIn-Profil öffnen",
"js.pal.copy": "E-Mail-Adresse kopieren",
"js.pal.mail": "E-Mail schreiben",
"js.pal.top": "Nach oben",
"js.lang.to": "Sprache wechseln"
};
  var root = document.documentElement;
  var lang = "en";

  function safeGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function safeSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  // T(key, english): returns the German text when German is active, otherwise the English fallback.
  window.kprT = function (key, en) {
    if (lang === "de" && Object.prototype.hasOwnProperty.call(DE, key)) return DE[key];
    return en;
  };
  window.kprLang = function () { return lang; };

  function apply(next) {
    lang = next;
    root.setAttribute("lang", next);
    var list = document.querySelectorAll("[data-i18n]");
    for (var i = 0; i < list.length; i++) {
      var el = list[i], key = el.getAttribute("data-i18n"), html = el.hasAttribute("data-i18n-html");
      if (el.__en === undefined) el.__en = html ? el.innerHTML : el.textContent;
      var txt = (next === "de" && DE[key] !== undefined) ? DE[key] : el.__en;
      if (key === "meta.title") { document.title = txt; continue; }
      if (html) el.innerHTML = txt; else el.textContent = txt;
    }
    var al = document.querySelectorAll("[data-i18n-attr]");
    for (var j = 0; j < al.length; j++) {
      var el2 = al[j];
      if (!el2.__enAttr) el2.__enAttr = {};
      el2.getAttribute("data-i18n-attr").split(";").forEach(function (pair) {
        if (!pair) return;
        var p = pair.split(":"), attr = p[0], k = p[1];
        if (el2.__enAttr[attr] === undefined) el2.__enAttr[attr] = el2.getAttribute(attr);
        el2.setAttribute(attr, (next === "de" && DE[k] !== undefined) ? DE[k] : el2.__enAttr[attr]);
      });
    }
    var btns = document.querySelectorAll("[data-lang-set]");
    for (var b = 0; b < btns.length; b++) btns[b].setAttribute("aria-pressed", String(btns[b].getAttribute("data-lang-set") === next));
    document.dispatchEvent(new CustomEvent("kpr:lang", { detail: next }));
  }

  window.kprSetLang = function (next, save) {
    if (next !== "en" && next !== "de") next = "en";
    apply(next);
    if (save) safeSet("kpr-lang", next);
  };

  var saved = safeGet("kpr-lang");
  var start = saved === "de" || saved === "en" ? saved :
    ((navigator.language || "").toLowerCase().indexOf("de") === 0 ? "de" : "en");

  document.addEventListener("click", function (e) {
    var t = e.target.closest && e.target.closest("[data-lang-set]");
    if (t) window.kprSetLang(t.getAttribute("data-lang-set"), true);
  });

  // Run once the page is parsed. The English text in the page is the source, so "en" needs no work.
  if (start === "de") apply("de"); else root.setAttribute("lang", "en");
})();
