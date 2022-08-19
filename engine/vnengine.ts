const States = {
  MENU: "MN",
  SEEK_PARAGRAPH: "SP",
  SWITCH_SUBPAGE: "SB",
  FETCH_CHOICES: "FC",
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
  nx: null,
  ms: null,
  sd: null,
  vnml: null,
};

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
  choosing: boolean;
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
  choosing: false,
};

const Config = {
  typeWriterSpeed: 50,
};

const paragraphLimit = 300;
const version = "1.0";

function vnml() {
  console.log(`VNML version ${version}`);
  addFrontend();
  startup();
}

function startup() {
  const vn = document.querySelector<HTMLElement>("vn");

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
    elements.nx = document.querySelector(".VNTextWindowProceed");

    context.index = 0;

    const title = elements.vnd?.querySelector<HTMLElement>("st");
    const author = elements.vnd?.querySelector<HTMLElement>("au");
    context.title = title ? title.innerText : "untitled";
    context.author = author ? author.innerText : "who knows?!";
    context.saveToken = buildToken(context.title);

    console.log("Playing " + context.title + " by " + context.author);
    console.log("SaveToken: " + context.saveToken);

    fetchParagraph();
  } else {
    alert("This is not a VNML page");
  }
}

function buildToken(text: string) {
  const special = /[ `!£@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~\d]/g;
  return text.replace(special, "_").toLowerCase();
}

function nextSubpage() {
  context.subPage++;

  if (context.lines.length > 0 && context.subPage < context.lines.length) {
    console.log("next sub page", context.subPage, context.lines.length);
    typeWriter(context.lines[context.subPage]);

    if (context.subPage === context.lines.length - 1) {
      console.log("Sub pages ended");
      context.lines = [];
      context.subPage = 0;
      return false;
    }

    return true;
  }
}

function parse(e: HTMLElement) {
  if (e) {
    switch (e.tagName) {
      case "BK":
        setBackground(e);
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
    elements.ms.pause();
    elements.ms.currentTime = 0;
    if (e.innerText !== "") {
      elements.ms.src = e.innerText;
      elements.ms.play();
    }
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

function moveTo(label: string) {
  console.log("moving to label", label);

  for (let i = 0; i < elements.vn.children.length; i++) {
    const e = elements.vn.children[i] as HTMLElement;
    if (e.tagName === "LB" && e.innerText === label) {
      setProgramCounter(i + 1);
      clearCharacters();
      context.state = "SEEK_PARAGRAPH";
      fetchParagraph();
      return;
    }
  }
  console.log("Label not found");
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

function fetchParagraph() {
  let fetchNext = true;
  let token = null;

  console.log("fetch: " + context.state);

  if (context.isWriting) {
    console.log("Resetting typewriter");
    showAllText();
    return;
  }

  if (context.state === "SWITCH_SUBPAGE") {
    if (!nextSubpage()) {
      context.state = "FETCH_CHOICES";
      console.log("fetch: " + context.state);
    } else {
      return;
    }
  }

  while (fetchNext && hasMoreTokens()) {
    token = getCurrentToken();
    console.log("found ", token.tagName);

    switch (context.state) {
      case "SEEK_PARAGRAPH":
        const isParagraph = parse(token);

        if (isParagraph) {
          if (context.lines.length > 1) {
            console.log("Multiline paragraph");
            context.state = "SWITCH_SUBPAGE";
            fetchNext = false;
            next();
            setProgramCounter();
          } else {
            console.log("Single paragraph");
            context.state = "FETCH_CHOICES";
            next();
          }
        } else {
          next();
        }
        break;
      case "FETCH_CHOICES":
        if (token.tagName === "CH") {
          console.log("Found choice");
          parse(token);
          next();
        } else {
          console.log("Switch to seek paragraph");
          context.state = "SEEK_PARAGRAPH";
          setProgramCounter();
          fetchNext = false;
        }
        break;
    }
  }
}

function clearCharacters() {
  elements.cl.setAttribute("style", `background-image:none`);
  elements.cm.setAttribute("style", `background-image:none`);
  elements.cr.setAttribute("style", `background-image:none`);
  setLabel("");
}

function setBackground(e: HTMLElement) {
  if (e.children.length === 1) {
    const back = seekTag(e.children[0].tagName);
    if (back) {
      elements.bg.setAttribute(
        "style",
        `background-image:url(${
          back.querySelector<HTMLElement>("bk").innerText
        })`
      );
    }
  } else {
    elements.bg.setAttribute("style", `background-image:url(${e.innerText})`);
  }
}

function setLabel(text: string) {
  console.log("label settata", text);
  elements.lb.innerHTML = text;
}

function setParagraph(text: string) {
  elements.ch.innerHTML = "";
  elements.chf.setAttribute("style", "display:none");
  elements.nx.setAttribute("style", "display:block");

  context.choosing = false;
  context.lines = splitInLines(text);
  context.subPage = 0;

  if (context.lines.length > 0) {
    typeWriter(context.lines[0]);
  } else {
    typeWriter("");
  }
}

function splitInLines(text: string) {
  const result = [];
  let buffer = "";

  for (let i = 0; i < text.length; i++) {
    buffer += text[i];
    if (buffer.length >= paragraphLimit) {
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
      elements[w].setAttribute(
        "style",
        `background-image:url(${
          character.querySelector<HTMLElement>("bk").innerText
        })`
      );

      setLabel(character.querySelector<HTMLElement>("nm").innerText);
    }
  } else {
    elements[w].setAttribute("style", `background-image:url(${e.innerText})`);
  }
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
  elements.chf.setAttribute("style", "display:block");
  elements.nx.setAttribute("style", "display:none");
  context.choosing = true;

  console.log("scelta", e.innerText);

  const text = collectText(e);

  if (text !== "") {
    const show = parseConditionalOperator(e);
    const gt = e.querySelector<HTMLElement>("gt");

    if (show) {
      if (gt) {
        console.log("La scelta ha un goto", gt.innerText);
        appendChoice(text, gt.innerText);
      } else {
        console.log("La scelta prosegue");
        appendChoice(text, "");
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

function appendChoice(text: string, next: string) {
  const choice = document.createElement("div");
  choice.className = "VNChooseItem OptionStyle";
  choice.innerHTML = text;
  choice.addEventListener("click", () => {
    console.log("Cliccato evento");
    if (next === "") fetchParagraph();
    moveTo(next);
  });

  elements.ch.appendChild(choice);
}

function clickArea(origin: string) {
  switch (origin) {
    case "chapter":
    case "proceed":
    case "choose":
      if (!context.choosing) fetchParagraph();
      break;
  }
}

function addFrontend() {
  const template = `
      <div class="VNBackground"></div>
      <div class="VNCharacter VNCAnchorRight"></div>
      <div class="VNCharacter VNCAnchorLeft"></div>
      <div class="VNCharacter VNCAnchorMiddle"></div>
      <div class="VNBottomContainer">
        <div class="VNTextWindow ChapterStyle" onclick="clickArea('chapter')">
          <div class="VNTextWindowLabel LabelStyle"></div>
          <div class="VNTextScroller TextStyle"></div>
        </div>
        <div class="VNChooseWindow ChooseStyle" onclick="clickArea('choose')">
          <div class="VNChooseScroller">            
          </div>
        </div>
        <div class="VNTextWindowProceed ButtonStyle" onclick="clickArea('proceed')"></div>
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

  if (text !== "") {
    context.writingText = text;
    context.typeWriter = window.setInterval(() => {
      if (context.twTextIndex < text.length) {
        elements.p.innerHTML += text[context.twTextIndex];
        context.twTextIndex++;
        context.isWriting = true;
      } else {
        window.clearInterval(context.typeWriter);
        context.isWriting = false;
      }
    }, Config.typeWriterSpeed);
  }
}

function showAllText() {
  window.clearInterval(context.typeWriter);
  context.isWriting = false;
  elements.p.innerHTML = context.writingText;
}
