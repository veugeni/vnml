const States = {
  SEEK_PARAGRAPH: "SP",
  WRITING: "WR",
  SWITCH_SUBPAGE: "SB",
  INTERACTION: "IT",
  CHOOSING: "CH",
  WAIT_FOR_KEY: "KY",
  WAIT_FOR_TIME: "TM",
};

const StyledAttributes = {
  flip: () => " -webkit-transform: scaleX(-1);transform: scaleX(-1);",
  blur: () => "blur(10px)",
  gray: () => "grayscale(1)",
  shadow: () => "drop-shadow(30px 10px 4px #000000);",
  shatter: () => {
    const angle = Math.random() * 6 - 3;
    return ` -webkit-transform: rotateZ(${angle}deg);transform: rotateZ(${angle}deg);`;
  },
  immediate: () => " transition-duration: 0s !important",
  shake: () => " animation: shake1 1s infinite",
  translucent: () => " opacity: 0.5",
  transparent: () => " opacity: 0.8",
  wobble: () => " animation: wobble1 30s ease-in-out 0s infinite both",
};

const EffectAttributes = {
  flash: "animation: flash1 1s",
  thunder: "animation: thunder1 3s ease-out 0.5s",
};

type States = keyof typeof States;

type UIElement = HTMLElement | null;

interface Elements {
  bg: UIElement;
  bgf: UIElement;
  bgo: UIElement;
  cl: UIElement;
  cm: UIElement;
  cr: UIElement;
  vn: UIElement;
  p: UIElement;
  vnd: UIElement;
  lb: UIElement;
  ch: UIElement;
  chf: UIElement;
  chfc: UIElement;
  tw: UIElement;
  bc: UIElement;
  nx: UIElement;
  ms: HTMLAudioElement | null;
  sd: HTMLAudioElement | null;
  vnml: HTMLElement;
}

const elements: Elements = {
  bg: null,
  bgf: null,
  bgo: null,
  cl: null,
  cm: null,
  cr: null,
  vn: null,
  p: null,
  vnd: null,
  lb: null,
  ch: null,
  chf: null,
  chfc: null,
  tw: null,
  bc: null,
  nx: null,
  ms: null,
  sd: null,
  vnml: null,
};

interface Choice {
  text: string;
  next: string;
}

const context = {
  index: 0,
  lines: [],
  variables: {},
  subPage: 0,
  title: "untitled",
  author: "who knows?!",
  language: "en",
  saveToken: "",
  state: "SEEK_PARAGRAPH",
  cursor: 0,
  typeWriter: 0,
  twTextIndex: 0,
  isWriting: false,
  writingText: "",
  choices: [],
  subPagesEnded: false,
  toBeSaved: null,
  slot: 0,
  muted: false,
  fullscreen: false,
  hasMusic: "",
  hasSound: "",
  wait: 0,
  waitTimeout: 0,
  gameOver: false,
  finalScore: 0,
  isMobile: window.screen.width <= 736,
  jumpTo: "",
};

const Config = {
  typeWriterSpeed: 50,
  paragraphLimit: window.screen.width <= 736 ? 200 : 300,
  hiddenChoices: true,
  version: "1.0.3",
  disableSave: false,
  showTokenDebug: true,
  showDebug: true,
};

function vnml() {
  console.log(`VNML version ${Config.version}`);
  addFrontend();
  startup();
}

function startup() {
  const vnml = document.querySelector<HTMLElement>("vnml");
  const vn = document.querySelector<HTMLElement>("vn");

  console.log("Building empty save bundle");
  context.toBeSaved = {
    bgm: "",
    bk: "",
    cl: "",
    cm: "",
    cr: "",
    date: "",
    label: "",
    index: 0,
    variables: {},
  };

  Config.showDebug && console.log("vn", vn?.children.length);

  if (vn && vnml) {
    elements.vn = vn;
    elements.vnd = document.querySelector("vnd");
    elements.bg = document.querySelector(".VNBackground");
    elements.bgf = document.querySelector(".VNBackgroundEffects");
    elements.bgo = document.querySelector(".VNBackgroundOverlay");
    elements.cl = document.querySelector(".VNCAnchorLeft");
    elements.cm = document.querySelector(".VNCAnchorMiddle");
    elements.cr = document.querySelector(".VNCAnchorRight");
    elements.p = document.querySelector(".VNTextScroller");
    elements.lb = document.querySelector(".VNTextWindowLabel");
    elements.ch = document.querySelector(".VNChooseScroller");
    elements.chf = document.querySelector(".VNChooseScroller");
    elements.chfc = document.querySelector(".VNChooseWindow");
    elements.bc = document.querySelector(".VNBottomContainer");
    elements.tw = document.querySelector(".VNTextWindow");
    elements.nx = document.querySelector(".VNTextWindowProceed");

    context.index = 0;

    const title = elements.vnd?.querySelector<HTMLElement>("st");
    const author = elements.vnd?.querySelector<HTMLElement>("au");
    const language = elements.vnd?.querySelector<HTMLElement>("ln");

    context.title = title ? title.innerText : "untitled";
    context.author = author ? author.innerText : "who knows?!";
    context.language = language ? language.innerText : "en";
    context.saveToken = buildToken(context.title);

    console.log("Playing " + context.title + " by " + context.author);
    console.log("SaveToken: " + context.saveToken);

    const params = new URLSearchParams(window.location.search);
    if (params.has("s")) {
      context.slot = parseInt(params.get("s"));
      console.log("Load from slot " + context.slot);
      load(context.slot);
    } else if (params.has("c")) {
      context.slot = parseInt(params.get("c"));
      console.log("Clearing slot " + context.slot);
      localStorage.removeItem(context.saveToken);
      window.location.href = window.location.href.replace(
        `c=${context.slot}`,
        `s=${context.slot}`
      );
    }

    window.addEventListener(
      "resize",
      () => (context.isMobile = window.screen.width <= 736)
    );

    step();

    if (params.has("g")) {
      console.log("Forced jump to label", params.get("g"));
      // This is a debug feature.
      context.gameOver = false;
      moveTo(params.get("g"));
    }
  } else {
    alert("This is not a VNML page");
  }
}

function buildToken(text: string) {
  const special = /[ `!£@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~\d]/g;
  return text.replace(special, "_").toLowerCase();
}

function nextSubpage() {
  if (context.lines.length === 1) {
    Config.showTokenDebug && console.log("No sub pages");
    return false;
  }

  context.subPage++;

  if (context.lines.length > 0 && context.subPage < context.lines.length) {
    Config.showTokenDebug &&
      console.log("next sub page", context.subPage, context.lines.length);
    typeWriter(context.lines[context.subPage]);

    if (context.subPage === context.lines.length - 1) {
      Config.showTokenDebug && console.log("Sub pages ended");
      return false;
    }

    return true;
  }
}

function parse(e: HTMLElement) {
  if (e) {
    switch (e.tagName) {
      case "BK":
        parseBackground(e);
        return false;
      case "BGM":
      case "SFX":
        parseSound(e);
        return false;
      case "CL":
        parseCharacter(e, "cl");
        return false;
      case "CM":
        parseCharacter(e, "cm");
        return false;
      case "CR":
        parseCharacter(e, "cr");
        return false;
      case "CH":
        parseChoice(e);
        return false;
      case "INC":
      case "DEC":
      case "CLR":
        return parseOperators(e);
      case "LB":
      case "GT":
      case "HIDEIFZERO":
      case "SHOWIFZERO":
      case "HIDEIFNONZERO":
      case "SHOWIFNONZERO":
        Config.showTokenDebug &&
          console.log("Labels & gotos & stuff to be ignored");
        return false;
      case "JMP":
        parseJump(e);
        return true;
      case "WAIT":
        parseWait(e);
        return true;
      case "END":
        parseEnd(e);
        return false;
      default:
        if (e.tagName !== "P") {
          const model = seekTag(e.tagName);
          if (model) {
            setLabel(model.querySelector<HTMLElement>("nm").innerText);
          } else {
            setLabel("");
          }
        }

        setParagraph(e.innerText);

        return true;
    }
  }

  return false;
}

function parseSound(e: HTMLElement) {
  if (e.tagName === "BGM") {
    Config.showTokenDebug && console.log("Cambio musica di fondo", e.innerText);
    setBackgroundMusic(e.innerText);
  } else {
    Config.showTokenDebug && console.log("Cambio effetto", e.innerText);
    elements.sd.pause();
    elements.sd.currentTime = 0;
    context.hasSound = "";
    if (e.innerText !== "") {
      elements.sd.src = assetsUrl(e.innerText);
      if (context.muted === false) elements.sd.play();
      context.hasSound = e.innerText;
    }
  }
}

function setBackgroundMusic(url: string) {
  elements.ms.pause();
  elements.ms.currentTime = 0;
  context.hasMusic = "";
  if (url !== "") {
    elements.ms.src = assetsUrl(url);
    if (context.muted === false) elements.ms.play();
    context.toBeSaved.bgm = url;
    context.hasMusic = url;
  }
}

function moveTo(label: string) {
  if (label !== "") {
    console.log("Seeking label ", label);
    context.jumpTo = "";

    for (let i = 0; i < elements.vn.children.length; i++) {
      const e = elements.vn.children[i] as HTMLElement;
      if (e.tagName === "LB" && e.innerText === label) {
        console.log("Found label " + label + " at " + i);
        setProgramCounter(i + 1);
        clearCharacters();
        break;
      }
    }
  }

  console.log("Moving to next step");

  context.state = "SEEK_PARAGRAPH";
  step();
}

function getCurrentToken() {
  if (hasMoreTokens()) {
    const i = context.index + context.cursor;

    console.log("Fetched element", elements.vn.children[i]);

    return elements.vn.children[i];
  }
}

function hasMoreTokens() {
  return context.index + context.cursor < elements.vn.children.length;
}

function next() {
  context.cursor++;
}

function setProgramCounter(position?: number) {
  if (position) {
    context.index = position;
  } else {
    context.index += context.cursor;
  }
  context.cursor = 0;
}

function hideNextButton() {
  elements.nx.setAttribute("style", "display:none");
}

function showNextButton() {
  if (context.gameOver === false) {
    elements.nx.setAttribute("style", "display:block");
  }
}

function hideChoices() {
  showNextButton();

  elements.chf.setAttribute("style", "display:none");
  if (Config.hiddenChoices) {
    elements.chfc.setAttribute("style", "display:none");
  }

  context.choices = [];
}

function showChoices() {
  hideNextButton();
  elements.chf.setAttribute("style", "display:block");

  if (Config.hiddenChoices) {
    elements.chfc.setAttribute("style", "display:block");
  }
}

function render() {
  elements.ch.innerHTML = "";
  elements.p.innerHTML = "";
  context.subPagesEnded = false;

  context.choices.forEach((e) => {
    renderChoice(e.text, e.next);
  });

  if (context.lines.length > 0) {
    typeWriter(context.lines[0]);
  } else {
    typeWriter("");
  }
}

function step() {
  if (context.gameOver === true) {
    Config.showTokenDebug && console.log("Game is over");
    return;
  }

  Config.showTokenDebug && console.log("Stepping", context);

  if (context.state === "WAIT_FOR_TIME" || context.state === "WAIT_FOR_KEY") {
    showTextWindow(true);
    context.state = "SEEK_PARAGRAPH";
  }

  if (context.state === "WRITING") {
    if (context.isWriting) {
      Config.showTokenDebug && console.log("Skipping typewriter");
      showAllText();

      if (
        context.choices.length > 0 &&
        (context.subPagesEnded || context.lines.length <= 1)
      ) {
        Config.showTokenDebug && console.log("has choices");
        showChoices();
        context.state = "CHOOSING";
      } else {
        Config.showTokenDebug && console.log("waiting user");
        context.state = "INTERACTION";
      }

      return;
    }
  }

  if (context.state === "INTERACTION") {
    nextSubpage();

    if (context.lines.length <= 1) {
      Config.showTokenDebug && console.log("Single paragraph, seeking next");
      context.state = "SEEK_PARAGRAPH";
      context.subPagesEnded = true;
    } else if (context.subPage === context.lines.length - 1) {
      Config.showTokenDebug && console.log("Last sub page");
      context.subPagesEnded = true;
      context.state = "WRITING";
    } else if (context.subPage >= context.lines.length) {
      Config.showTokenDebug && console.log("Last sub page clicked");
      context.state = "SEEK_PARAGRAPH";
    } else {
      Config.showTokenDebug && console.log("has next subpage");
      context.state = "WRITING";
    }

    if (context.subPagesEnded && context.jumpTo !== "") {
      Config.showTokenDebug && console.log("Has jump to", context.jumpTo);

      moveTo(context.jumpTo);
      return;
    }
  }

  if (context.state === "SEEK_PARAGRAPH") {
    resetWait();
    hideChoices();
    fetchParagraph();
    render();
    save(context.slot);

    if (!setWait() && context.jumpTo === "") {
      Config.showTokenDebug && console.log("Nothing to wait");
      context.state = "WRITING";
    }
  }

  if (context.state === "CHOOSING") {
    Config.showTokenDebug && console.log("Choosing");
    // NOP
  }
}

function fetchParagraph() {
  let token = null;

  Config.showTokenDebug && console.log("fetch paragraph: ", context);

  context.toBeSaved.date = new Date().toISOString();
  context.toBeSaved.index = context.index;
  context.toBeSaved.variables = { ...context.variables };

  let paragraphFound = false;

  while (hasMoreTokens()) {
    token = getCurrentToken();
    Config.showTokenDebug && console.log("found token", token.tagName);

    if (paragraphFound) {
      if (token.tagName === "END") {
        Config.showTokenDebug && console.log("ending game", token.tagName);
        parse(token);
        setProgramCounter();
        return;
      }

      if (token.tagName !== "CH" && token.tagName !== "JMP") {
        Config.showTokenDebug && console.log("closing chapter", token.tagName);
        setProgramCounter();
        return;
      }
    }

    if (token.tagName === "JMP") {
      Config.showTokenDebug && console.log("jumping");
      parse(token);
      return;
    }

    const isParagraph = parse(token);
    if (isParagraph) paragraphFound = true;

    next();
  }
}

function clearCharacters() {
  elements.cl.setAttribute("style", `background-image:none`);
  elements.cm.setAttribute("style", `background-image:none`);
  elements.cr.setAttribute("style", `background-image:none`);
  setLabel("");
  context.toBeSaved.cr = "";
  context.toBeSaved.cm = "";
  context.toBeSaved.cl = "";
  context.toBeSaved.label = "";
}

function assetsUrl(resource: string) {
  return resource
    ? resource.indexOf("/") >= 0
      ? resource
      : `res/${resource}`
    : "";
}

function parseBackground(e: HTMLElement) {
  const style = getCharacterStyle(parseStyleAttributes(e));
  setBackgroundEffect("");

  const backTag = seekTag(e.innerText);

  if (backTag) {
    const bk =
      context.isMobile && backTag.querySelector<HTMLElement>("bkm")
        ? backTag.querySelector<HTMLElement>("bkm").innerText
        : backTag.querySelector<HTMLElement>("bk").innerText;

    setBackground(bk, style);
  } else {
    setBackground(e.innerText, style);
  }

  const effects = parseEffectAttributes(e).join(";");
  setBackgroundEffect(effects);
}

function setBackgroundEffect(effect: string) {
  elements.bgf.setAttribute("style", effect);
}

function setBackground(url: string, style?: string) {
  context.toBeSaved.bk = url;

  elements.bg.setAttribute(
    "style",
    url === ""
      ? "background-image:none;"
      : `background-image:url(${assetsUrl(url)});${style};`
  );
}

function setLabel(text: string) {
  Config.showTokenDebug && console.log("label settata", text);
  elements.lb.innerHTML = text;
  context.toBeSaved.label = text;
  elements.lb.setAttribute(
    "style",
    `display:${text === "" ? "none" : "block"}`
  );
}

function showTextWindow(show: boolean) {
  elements.bc.setAttribute(
    "class",
    `VNBottomContainer BottomStyle ${show ? "" : "TextWindowHidden"}`
  );
  elements.bgo.setAttribute(
    "class",
    `VNBackground VNBackgroundOverlay ${show ? "" : "TextWindowHidden"}`
  );
  elements.bgf.setAttribute(
    "class",
    `VNBackground VNBackgroundEffects ${show ? "" : "VNBackgroundFull"}`
  );
  elements.bg.setAttribute(
    "class",
    `VNBackground ${show ? "" : "VNBackgroundFull"}`
  );
}

function setParagraph(text: string) {
  context.lines = splitInLines(text);
  context.subPage = 0;
}

function splitInLines(sourceText: string) {
  const text = sanitize(sourceText);

  const result = [];
  let buffer = "";

  for (let i = 0; i < text.length; i++) {
    buffer += text[i];
    if (buffer.length >= Config.paragraphLimit) {
      const rest = splitToPunctuation(buffer);
      result.push(rest);

      const diff = buffer.length - rest.length;
      if (diff > 0) {
        buffer = buffer.substring(buffer.length - diff);
      } else {
        buffer = "";
      }
    }
  }

  if (buffer.length > 0) {
    result.push(buffer);
  }

  return result;
}

function splitToPunctuation(text: string) {
  const puncts = ",.;!?";
  if (text.length > 0) {
    for (let i = text.length - 1; i >= 0; i--) {
      if (puncts.indexOf(text[i]) >= 0) {
        return text.substring(0, i + 1);
      }
    }
  }

  return "";
}

function parseOperators(e: HTMLElement) {
  const variable = e.innerText;

  Config.showTokenDebug && console.log("Operator", e.tagName);
  Config.showTokenDebug && console.log("Variable", variable);

  if (!context.variables[variable]) {
    context.variables[variable] = 0;
  }

  switch (e.tagName) {
    case "INC":
      context.variables[variable]++;
      break;
    case "DEC":
      context.variables[variable]--;
      break;
    case "CLR":
      context.variables[variable] = 0;
      break;
  }

  Config.showTokenDebug && console.log("Variables", context.variables);
}

function parseStyleAttributes(e: HTMLElement) {
  Config.showTokenDebug && console.log("parse style attributes", e, context);
  const result = [];

  for (let i = 0; i < e.attributes.length; i++) {
    const attr = e.attributes.item(i);
    if (attr && StyledAttributes[attr.name]) {
      result.push(StyledAttributes[attr.name]());
    }
  }

  return result;
}

function parseEffectAttributes(e: HTMLElement) {
  Config.showTokenDebug && console.log("parse effect attributes", e, context);
  const result = [];

  for (let i = 0; i < e.attributes.length; i++) {
    const attr = e.attributes.item(i);
    if (attr && EffectAttributes[attr.name]) {
      result.push(EffectAttributes[attr.name]);
    }
  }

  return result;
}

function parseCharacter(e: HTMLElement, w: "cl" | "cm" | "cr") {
  Config.showTokenDebug && console.log("parse char", e, w, context);

  const characterTag = seekTag(e.innerText);

  if (characterTag) {
    const bk =
      context.isMobile && characterTag.querySelector<HTMLElement>("bkm")
        ? characterTag.querySelector<HTMLElement>("bkm").innerText
        : characterTag.querySelector<HTMLElement>("bk").innerText;

    setCharacter(bk, w, parseStyleAttributes(e));
    setLabel(characterTag.querySelector<HTMLElement>("nm").innerText);
  } else {
    setCharacter(e.innerText, w, parseStyleAttributes(e));
  }
}

function getCharacterStyle(styles: string[]) {
  const filters = styles.filter((e) => !e.startsWith(" "));
  const mods = styles.filter((e) => e.startsWith(" "));

  return (
    (filters.length > 0 ? "filter: " + filters.join(" ") + ";" : "") +
    mods.join(";")
  );
}

function setCharacter(url: string, w: "cl" | "cm" | "cr", styles: string[]) {
  context.toBeSaved[w] = url;

  elements[w].setAttribute(
    "style",
    (url === ""
      ? "background-image:none; opacity: 0;"
      : `background-image:url(${assetsUrl(url)}); opacity:1;`) +
      getCharacterStyle(styles)
  );
}

function collectText(e: HTMLElement) {
  let buffer = "";

  for (let i = 0; i < e.childNodes.length; i++) {
    if (e.childNodes[i].nodeType === 3) {
      buffer += e.childNodes[i].textContent;
    }
  }

  return buffer;
}

function evaluateCondition(c: HTMLElement) {
  const variable = c.innerText;

  if (variable) {
    const value = context.variables[variable] || 0;
    switch (c.tagName) {
      case "HIDEIFZERO":
      case "SHOWIFNONZERO":
        if (value === 0) {
          return false;
        }
        break;
      case "SHOWIFZERO":
      case "HIDEIFNONZERO":
        if (value !== 0) {
          return false;
        }
        break;
    }
  }

  return true;
}

function parseConditionalOperator(e: HTMLElement) {
  let result = true;

  if (e && e.children.length > 0) {
    const ops = ["HIDEIFZERO", "SHOWIFZERO", "HIDEIFNONZERO", "SHOWIFNONZERO"];

    ops.forEach((o) => {
      const c = e.querySelector<HTMLElement>(o);
      if (c) {
        result = evaluateCondition(c);
      }
    });
  }

  return result;
}

function parseChoice(e: HTMLElement) {
  Config.showTokenDebug && console.log("scelta", e.innerText);

  const text = collectText(e);

  if (text !== "") {
    const show = parseConditionalOperator(e);
    const gt = e.querySelector<HTMLElement>("gt");

    if (show) {
      if (gt) {
        Config.showTokenDebug &&
          console.log("La scelta ha un goto", gt.innerText);
        context.choices.push({ text, next: gt.innerText });
      } else {
        Config.showTokenDebug && console.log("La scelta prosegue");
        context.choices.push({ text, next: "" });
      }
    } else {
      Config.showTokenDebug && console.log("La scelta viene nascosta");
    }
  }
}

function parseJump(e: HTMLElement) {
  Config.showTokenDebug && console.log("Jump to", e.innerText);
  context.jumpTo = e.innerText;
}

function parseWait(e: HTMLElement) {
  Config.showTokenDebug && console.log("parsing wait");
  const waitWhat = e.innerText;
  let secs = parseInt(waitWhat);

  if (waitWhat === "key" || secs <= 0 || secs > 60) {
    secs = -1;
  }

  showTextWindow(false);
  setParagraph("");
  Config.showTokenDebug && console.log("Setting wait", secs);
  context.wait = secs;
}

function parseEnd(e: HTMLElement) {
  Config.showTokenDebug && console.log("parsing end!");
  context.gameOver = true;

  if (e.innerText && context.variables[e.innerText]) {
    Config.showTokenDebug &&
      console.log(
        "found score variable " + e.innerText,
        context.variables[e.innerText]
      );

    context.finalScore = context.variables[e.innerText];
  }
}

function seekTag(tag: string) {
  if (elements.vnd && tag && tag !== "") {
    for (var i = 0; i < elements.vnd.children.length; i++) {
      const e = elements.vnd.children[i];

      if (e.tagName === tag.toUpperCase()) {
        Config.showTokenDebug && console.log("Trovato modello");
        return e;
      }
    }
  }

  return undefined;
}

function renderChoice(text: string, next: string) {
  const choice = document.createElement("div");
  choice.className = "VNChooseItem OptionStyle";
  choice.innerHTML = text;
  choice.addEventListener("click", () => {
    Config.showTokenDebug &&
      console.log(
        "Event clicked " + next === "" ? "goto next paragraph" : "goto " + next
      );
    moveTo(next);
  });

  elements.ch.appendChild(choice);
}

function toggleFullscreen() {
  context.fullscreen = !context.fullscreen;
  document.getElementById("fullscreen").className = `VNMenuItem ${
    context.fullscreen ? "FullscreenOff" : "FullscreenOn"
  }`;

  if (context.fullscreen) {
    if (elements.vnml.requestFullscreen) {
      elements.vnml.requestFullscreen();
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }
}

function toggleAudio() {
  context.muted = !context.muted;
  document.getElementById("audio").className = `VNMenuItem ${
    context.muted ? "AudioOn" : "AudioOff"
  }`;

  if (context.muted) {
    elements.ms.pause();
    elements.sd.pause();
  } else {
    if (context.hasMusic !== "") elements.ms.play();
    if (context.hasSound !== "") elements.sd.play();
  }
}

function addFrontend() {
  const template = `
      <div class="VNBackground VNBackgroundFull">
        <div class="VNBackground VNBackgroundEffects VNBackgroundFull"></div>
        <div class="VNBackground VNBackgroundOverlay TextWindowHidden"></div>
      </div>
      <div class="VNCharacter VNCAnchorRight"></div>
      <div class="VNCharacter VNCAnchorLeft"></div>
      <div class="VNCharacter VNCAnchorMiddle"></div>
      <div class="VNBottomContainer BottomStyle TextWindowHidden">
        <div class="VNTextWindow disable-select ChapterStyle" onclick="step()">
          <div class="VNTextWindowLabel disable-select LabelStyle"></div>
          <div class="VNTextScroller disable-select TextStyle"></div>
        </div>
        <div class="VNMenu">
          <div class="VNMenuItem AudioOff" onclick="toggleAudio()" id="audio">           
          </div>
          <div class="VNMenuItem FullscreenOn" onclick="toggleFullscreen()" id="fullscreen">
          </div>
          <div class="VNMenuItem Exit" id="exit" onclick="exit()">
          </div>
        </div>
      </div>
      <div class="VNChooseWindow disable-select ChooseStyle" onclick="step()">
        <div class="VNChooseScroller">            
        </div>
      </div>
      <div class="VNTextWindowProceed ButtonStyle" onclick="step()"></div>
    `;

  const p = document.createElement("div");
  p.className = "VNApp";
  p.innerHTML = template;

  elements.ms = document.createElement("audio");
  elements.ms.setAttribute("loop", "true");
  elements.sd = document.createElement("audio");

  elements.vnml = p;

  p.appendChild(elements.ms);

  document.addEventListener("keypress", () => {
    if (context.wait === -1) step();
  });

  document.addEventListener("click", () => {
    if (context.wait === -1) step();
  });

  document.querySelector("body").appendChild(p);
}

const LF = `\u{000a}`; // Line Feed (\n)
const VT = `\u{000b}`; // Vertical Tab
const FF = `\u{000c}`; // Form Feed
const CR = `\u{000d}`; // Carriage Return (\r)
const CRLF = `${CR}${LF}`; // (\r\n)
const NEL = `\u{0085}`; // Next Line
const LS = `\u{2028}`; // Line Separator
const PS = `\u{2029}`; // Paragraph Separator
const lineTerminators = new RegExp(
  [LF, VT, FF, CR, CRLF, NEL, LS, PS].join("|")
);

function sanitize(sourceText: string) {
  return sourceText
    .trim()
    .replace(/\n|\r/g, " ")
    .replace(lineTerminators, " ")
    .replace(/\s\s+/g, " ");
}

function typeWriter(sourceText: string) {
  context.twTextIndex = 0;
  context.isWriting = false;
  elements.p.innerHTML = "";
  context.writingText = "";

  hideNextButton();

  window.clearInterval(context.typeWriter);

  const endTypewriter = () => {
    Config.showTokenDebug && console.log("Typewriter ended");
    window.clearInterval(context.typeWriter);
    context.isWriting = false;
    if (
      context.choices.length > 0 &&
      context.subPage === context.lines.length - 1
    ) {
      Config.showTokenDebug && console.log("Enabling choices", context);
      showChoices();
      context.state = "CHOOSING";
    } else {
      Config.showTokenDebug && console.log("Enabling interaction", context);
      context.state = "INTERACTION";
      showNextButton();
    }
  };

  if (sourceText !== "") {
    context.writingText = sourceText;
    context.typeWriter = window.setInterval(() => {
      if (context.twTextIndex < context.writingText.length) {
        elements.p.innerHTML += context.writingText[context.twTextIndex];
        context.twTextIndex++;
        context.isWriting = true;
      } else {
        endTypewriter();
      }
    }, Config.typeWriterSpeed);
  }
}

function showAllText() {
  window.clearInterval(context.typeWriter);
  context.isWriting = false;
  elements.p.innerHTML = context.writingText;
  showNextButton();
}

interface Slot {
  bk: string;
  cr: string;
  cm: string;
  cl: string;
  bgm: string;
  date: string;
  label: string;
  variables: any;
  index: number;
}

interface Serialized {
  title: string;
  slots: Slot[];
}

function save(slot: number) {
  if (context.toBeSaved && Config.disableSave === false) {
    try {
      const raw = localStorage.getItem(context.saveToken);
      const read: Serialized = JSON.parse(raw);
      const updated: Serialized = read
        ? { ...read }
        : { title: context.title, slots: [] };

      updated.slots[slot] = { ...context.toBeSaved };

      localStorage.setItem(context.saveToken, JSON.stringify(updated));
      Config.showTokenDebug && console.log("In game save ", updated);
    } catch (err) {
      console.log("Error in saving: ", err);
    }
  } else {
    console.log("Nothing to save");
  }
}

function setWait() {
  if (context.wait > 0) {
    Config.showTokenDebug && console.log("Set wait for time ", context);

    context.state = "WAIT_FOR_TIME";
    window.clearTimeout(context.waitTimeout);
    context.waitTimeout = window.setTimeout(() => {
      console.log("Triggering timeout");
      step();
    }, context.wait * 1000);

    return true;
  }
  if (context.wait === -1) {
    Config.showTokenDebug && console.log("Set wait for key ", context);
    context.state = "WAIT_FOR_KEY";
    showNextButton();
    return true;
  }

  return false;
}

function resetWait() {
  Config.showTokenDebug && console.log("Reset wait for key ", context);
  window.clearTimeout(context.waitTimeout);
  context.wait = 0;
}

function load(slot: number) {
  try {
    const raw = localStorage.getItem(context.saveToken);
    const read: Serialized = JSON.parse(raw);

    if (read && slot >= 0 && slot < read.slots.length) {
      const data = read.slots[slot];
      console.log("Slot loaded", data);
      showTextWindow(true);
      setBackgroundMusic(data.bgm);
      setBackground(data.bk);
      setCharacter(data.cr, "cr", []);
      setCharacter(data.cm, "cm", []);
      setCharacter(data.cl, "cl", []);
      setLabel(data.label);
      context.hasSound = "";
      context.variables = { ...data.variables };
      context.index = data.index;
    } else {
      console.log("Nothing to load");
    }
  } catch (err) {
    console.log("Error in loading: ", err);
  }
}

function slots(token: string) {
  try {
    const raw = localStorage.getItem(token);
    const read: Serialized = JSON.parse(raw);

    if (read) {
      console.log("Slots loaded", read);
      return read;
    } else {
      console.log("Slots empty");
      return { title: token, slots: [] };
    }
  } catch (err) {
    console.log("Error in loading: ", err);
    return null;
  }
}

function menu(
  title: string,
  background: string,
  mobileBackground: string,
  slotText: string,
  newGameText: string,
  clearText: string
) {
  console.log("Building menu");
  const token = buildToken(title);
  console.log("Token", token);
  const saved = slots(token);
  console.log("Saved", saved);

  const menuContainer = document.querySelector(".VNMBackground");

  menuContainer.setAttribute(
    "style",
    `background-image: url(${context.isMobile ? mobileBackground : background})`
  );

  for (var i = 0; i < 3; i++) {
    const b = document.createElement("div");
    b.className = "VNMButton disable-select";

    const text = saved && saved.slots[i] ? `${slotText}` : `${newGameText}`;
    const date =
      saved && saved.slots[i]
        ? new Date(saved.slots[i].date).toLocaleString()
        : "";
    const clear = saved && saved.slots[i] ? clearText : "";

    b.innerHTML = `<div class='VNMButtonLabel'><span class='VNMText' onclick='go(${i}, false)'>${text}</span><span class='VNMDate'>${date}
    </span></div><div class='VNMClearButton' onclick='go(${i}, true)'>${clear}</div>`;

    menuContainer.appendChild(b);
  }
}
