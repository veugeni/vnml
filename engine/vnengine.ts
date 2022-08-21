const States = {
  SEEK_PARAGRAPH: "SP",
  WRITING: "WR",
  SWITCH_SUBPAGE: "SB",
  INTERACTION: "IT",
  CHOOSING: "CH",
};

type States = keyof typeof States;

type UIElement = HTMLElement | null;

interface Elements {
  bg: UIElement;
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
  nx: UIElement;
  ms: HTMLAudioElement | null;
  sd: HTMLAudioElement | null;
  vnml: HTMLElement;
}

const elements: Elements = {
  bg: null,
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
  nx: null,
  ms: null,
  sd: null,
  vnml: null,
};

interface Choice {
  text: string;
  next: string;
}

interface Context {
  index: number;
  lines: string[];
  variables: any;
  subPage: number;
  title: string;
  author: string;
  saveToken: string;
  state: States;
  cursor: number;
  typeWriter: number;
  twTextIndex: number;
  isWriting: boolean;
  writingText: string;
  choices: Choice[];
  subPagesEnded: boolean;
  toBeSaved: Slot | null;
  slot: number;
}

const context: Context = {
  index: 0,
  lines: [],
  variables: {},
  subPage: 0,
  title: "untitled",
  author: "who knows?!",
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
};

const Config = {
  typeWriterSpeed: 50,
  paragraphLimit: window.screen.width <= 736 ? 200 : 300,
  hiddenChoices: window.screen.width <= 736,
  version: "1.0",
};

function vnml() {
  console.log(`VNML version ${Config.version}`);
  addFrontend();
  startup();
}

function startup() {
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

  console.log("vn", vn?.children.length);

  if (vn) {
    elements.vn = vn;
    elements.vnd = document.querySelector("vnd");
    elements.bg = document.querySelector(".VNBackground");
    elements.cl = document.querySelector(".VNCAnchorLeft");
    elements.cm = document.querySelector(".VNCAnchorMiddle");
    elements.cr = document.querySelector(".VNCAnchorRight");
    elements.p = document.querySelector(".VNTextScroller");
    elements.lb = document.querySelector(".VNTextWindowLabel");
    elements.ch = document.querySelector(".VNChooseScroller");
    elements.chf = document.querySelector(".VNChooseScroller");
    elements.chfc = document.querySelector(".VNChooseWindow");
    elements.nx = document.querySelector(".VNTextWindowProceed");

    context.index = 0;

    const title = elements.vnd?.querySelector<HTMLElement>("st");
    const author = elements.vnd?.querySelector<HTMLElement>("au");
    context.title = title ? title.innerText : "untitled";
    context.author = author ? author.innerText : "who knows?!";
    context.saveToken = buildToken(context.title);

    console.log("Playing " + context.title + " by " + context.author);
    console.log("SaveToken: " + context.saveToken);

    const params = new URLSearchParams(window.location.search);
    if (params.has("s")) {
      context.slot = parseInt(params.get("s"));
      console.log("Load from slot " + context.slot);
      load(context.slot);
    }

    step();
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
    console.log("No sub pages");
    return false;
  }

  context.subPage++;

  if (context.lines.length > 0 && context.subPage < context.lines.length) {
    console.log("next sub page", context.subPage, context.lines.length);
    typeWriter(context.lines[context.subPage]);

    if (context.subPage === context.lines.length - 1) {
      console.log("Sub pages ended");
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
        console.log("Labels & gotos & stuff to be ignored");
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
    console.log("Cambio musica di fondo", e.innerText);
    setBackgroundMusic(e.innerText);
  } else {
    console.log("Cambio effetto", e.innerText);
    elements.sd.pause();
    elements.sd.currentTime = 0;
    if (e.innerText !== "") {
      elements.sd.src = e.innerText;
      elements.sd.play();
    }
  }
}

function setBackgroundMusic(url: string) {
  elements.ms.pause();
  elements.ms.currentTime = 0;
  if (url !== "") {
    elements.ms.src = url;
    elements.ms.play();
    context.toBeSaved.bgm = url;
  }
}

function moveTo(label: string) {
  if (label !== "") {
    for (let i = 0; i < elements.vn.children.length; i++) {
      const e = elements.vn.children[i] as HTMLElement;
      if (e.tagName === "LB" && e.innerText === label) {
        setProgramCounter(i + 1);
        clearCharacters();
        break;
      }
    }
  }

  context.state = "SEEK_PARAGRAPH";
  step();
}

function getCurrentToken() {
  if (hasMoreTokens()) {
    const i = context.index + context.cursor;
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

function hideChoices() {
  elements.chf.setAttribute("style", "display:none");
  elements.nx.setAttribute("style", "display:block");
  if (Config.hiddenChoices) {
    elements.chfc.setAttribute("style", "display:none");
  }

  context.choices = [];
}

function showChoices() {
  elements.chf.setAttribute("style", "display:block");
  elements.nx.setAttribute("style", "display:none");

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
  console.log("Stepping", context);

  if (context.state === "WRITING") {
    if (context.isWriting) {
      console.log("Skipping typewriter");
      showAllText();

      if (
        context.choices.length > 0 &&
        (context.subPagesEnded || context.lines.length <= 1)
      ) {
        console.log("has choices");
        showChoices();
        context.state = "CHOOSING";
      } else {
        console.log("waiting user");
        context.state = "INTERACTION";
      }

      return;
    }
  }

  if (context.state === "INTERACTION") {
    nextSubpage();

    if (context.lines.length <= 1) {
      console.log("Single paragraph, seeking next");
      context.state = "SEEK_PARAGRAPH";
      context.subPagesEnded = true;
    } else if (context.subPage === context.lines.length - 1) {
      console.log("Last sub page");
      context.subPagesEnded = true;
      context.state = "WRITING";
    } else if (context.subPage >= context.lines.length) {
      console.log("Last sub page clicked");
      context.state = "SEEK_PARAGRAPH";
    } else {
      console.log("has next subpage");
      context.state = "WRITING";
    }
  }

  if (context.state === "SEEK_PARAGRAPH") {
    hideChoices();
    fetchParagraph();
    render();
    save(0);

    context.state = "WRITING";
  }

  if (context.state === "CHOOSING") {
    console.log("Choosing");
    // NOP
  }
}

function fetchParagraph() {
  let fetchNext = true;
  let token = null;

  console.log("fetch paragraph: ", context);

  context.toBeSaved.date = new Date().toISOString();
  context.toBeSaved.index = context.index;
  context.toBeSaved.variables = { ...context.variables };

  let paragraphFound = false;

  while (fetchNext && hasMoreTokens()) {
    token = getCurrentToken();
    console.log("found token", token.tagName);

    if (paragraphFound) {
      if (token.tagName !== "CH") {
        setProgramCounter();
        fetchNext = false;
        return;
      }
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

function parseBackground(e: HTMLElement) {
  if (e.children.length === 1) {
    const back = seekTag(e.children[0].tagName);
    if (back) {
      setBackground(back.querySelector<HTMLElement>("bk").innerText);
    }
  } else {
    setBackground(e.innerText);
  }
}

function setBackground(url: string) {
  elements.bg.setAttribute(
    "style",
    url === "" ? "none" : `background-image:url(${url})`
  );
  context.toBeSaved.bk = url;
}

function setLabel(text: string) {
  console.log("label settata", text);
  elements.lb.innerHTML = text;
  context.toBeSaved.label = text;
  elements.lb.setAttribute(
    "style",
    `display:${text === "" ? "none" : "block"}`
  );
}

function setParagraph(text: string) {
  context.lines = splitInLines(text);
  context.subPage = 0;
}

function splitInLines(text: string) {
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

  console.log("Operator", e.tagName);
  console.log("Variable", variable);

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

  console.log("Variables", context.variables);
}

function parseCharacter(e: HTMLElement, w: "cl" | "cm" | "cr") {
  console.log("parse char", e, w, context);

  if (e.children.length === 1) {
    const character = seekTag(e.children[0].tagName);
    if (character) {
      setCharacter(character.querySelector<HTMLElement>("bk").innerText, w);
      setLabel(character.querySelector<HTMLElement>("nm").innerText);
    }
  } else {
    setCharacter(e.innerText, w);
  }
}

function setCharacter(url: string, w: "cl" | "cm" | "cr") {
  elements[w].setAttribute(
    "style",
    url === "" ? "none" : `background-image:url(${url})`
  );
  context.toBeSaved[w] = url;
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
        if (value === 0) return false;
      case "SHOWIFZERO":
      case "HIDEIFNONZERO":
        if (value !== 0) return false;
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
  console.log("scelta", e.innerText);

  const text = collectText(e);

  if (text !== "") {
    const show = parseConditionalOperator(e);
    const gt = e.querySelector<HTMLElement>("gt");

    if (show) {
      if (gt) {
        console.log("La scelta ha un goto", gt.innerText);
        context.choices.push({ text, next: gt.innerText });
      } else {
        console.log("La scelta prosegue");
        context.choices.push({ text, next: "" });
      }
    } else {
      console.log("La scelta viene nascosta");
    }
  }
}

function seekTag(tag: string) {
  if (elements.vnd) {
    for (var i = 0; i < elements.vnd.children.length; i++) {
      const e = elements.vnd.children[i];

      if (e.tagName === tag.toUpperCase()) {
        console.log("Trovato modello");
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
    console.log(
      "Event clicked " + next === "" ? "goto next paragraph" : "goto " + next
    );
    moveTo(next);
  });

  elements.ch.appendChild(choice);
}

function addFrontend() {
  const template = `
      <div class="VNBackground"></div>
      <div class="VNCharacter VNCAnchorRight"></div>
      <div class="VNCharacter VNCAnchorLeft"></div>
      <div class="VNCharacter VNCAnchorMiddle"></div>
      <div class="VNBottomContainer">
        <div class="VNTextWindow disable-select ChapterStyle" onclick="step()">
          <div class="VNTextWindowLabel disable-select LabelStyle"></div>
          <div class="VNTextScroller disable-select TextStyle"></div>
        </div>
        <div class="VNChooseWindow disable-select ChooseStyle" onclick="step()">
          <div class="VNChooseScroller">            
          </div>
        </div>
        <div class="VNTextWindowProceed ButtonStyle" onclick="step()"></div>
      </div>
    `;

  const p = document.createElement("div");
  p.className = "VNApp";
  p.innerHTML = template;

  elements.ms = document.createElement("audio");
  elements.ms.setAttribute("loop", "true");
  elements.sd = document.createElement("audio");

  p.appendChild(elements.ms);

  document.querySelector("body").appendChild(p);
}

function typeWriter(text: string) {
  context.twTextIndex = 0;
  context.isWriting = false;
  elements.p.innerHTML = "";
  context.writingText = "";

  window.clearInterval(context.typeWriter);

  if (text !== "") {
    context.writingText = text;
    context.typeWriter = window.setInterval(() => {
      if (context.twTextIndex < text.length) {
        elements.p.innerHTML += text[context.twTextIndex];
        context.twTextIndex++;
        context.isWriting = true;
      } else {
        console.log("Typewriter ended");
        window.clearInterval(context.typeWriter);
        context.isWriting = false;
        if (
          context.choices.length > 0 &&
          context.subPage === context.lines.length - 1
        ) {
          console.log("Enabling choices", context);
          showChoices();
          context.state = "CHOOSING";
        } else {
          console.log("Enabling interaction", context);
          context.state = "INTERACTION";
        }
      }
    }, Config.typeWriterSpeed);
  }
}

function showAllText() {
  window.clearInterval(context.typeWriter);
  context.isWriting = false;
  elements.p.innerHTML = context.writingText;
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
  if (context.toBeSaved) {
    try {
      const raw = localStorage.getItem(context.saveToken);
      const read: Serialized = JSON.parse(raw);
      const updated: Serialized = read
        ? { ...read }
        : { title: context.title, slots: [] };

      updated.slots[slot] = { ...context.toBeSaved };

      localStorage.setItem(context.saveToken, JSON.stringify(updated));
      console.log("In game save ", updated);
    } catch (err) {
      console.log("Error in saving: ", err);
    }
  } else {
    console.log("Nothing to save");
  }
}

function load(slot: number) {
  try {
    const raw = localStorage.getItem(context.saveToken);
    const read: Serialized = JSON.parse(raw);

    if (read && slot >= 0 && slot < read.slots.length) {
      const data = read.slots[slot];
      console.log("Slot loaded", data);
      setBackgroundMusic(data.bgm);
      setBackground(data.bk);
      setCharacter(data.cr, "cr");
      setCharacter(data.cm, "cm");
      setCharacter(data.cl, "cl");
      setLabel(data.label);
      context.variables = { ...data.variables };
      context.index = data.index;
    } else {
      console.log("Nothing to load");
    }
  } catch (err) {
    console.log("Error in saving: ", err);
  }
}
