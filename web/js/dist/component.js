const M = globalThis, I = M.ShadowRoot && (M.ShadyCSS === void 0 || M.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, k = /* @__PURE__ */ Symbol(), z = /* @__PURE__ */ new WeakMap();
let X = class {
  constructor(t, e, s) {
    if (this._$cssResult$ = !0, s !== k) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = e;
  }
  get styleSheet() {
    let t = this.o;
    const e = this.t;
    if (I && t === void 0) {
      const s = e !== void 0 && e.length === 1;
      s && (t = z.get(e)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), s && z.set(e, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const rt = (n) => new X(typeof n == "string" ? n : n + "", void 0, k), ot = (n, ...t) => {
  const e = n.length === 1 ? n[0] : t.reduce((s, i, r) => s + ((o) => {
    if (o._$cssResult$ === !0) return o.cssText;
    if (typeof o == "number") return o;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + o + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(i) + n[r + 1], n[0]);
  return new X(e, n, k);
}, at = (n, t) => {
  if (I) n.adoptedStyleSheets = t.map((e) => e instanceof CSSStyleSheet ? e : e.styleSheet);
  else for (const e of t) {
    const s = document.createElement("style"), i = M.litNonce;
    i !== void 0 && s.setAttribute("nonce", i), s.textContent = e.cssText, n.appendChild(s);
  }
}, j = I ? (n) => n : (n) => n instanceof CSSStyleSheet ? ((t) => {
  let e = "";
  for (const s of t.cssRules) e += s.cssText;
  return rt(e);
})(n) : n;
const { is: ht, defineProperty: lt, getOwnPropertyDescriptor: ct, getOwnPropertyNames: pt, getOwnPropertySymbols: ut, getPrototypeOf: dt } = Object, O = globalThis, B = O.trustedTypes, $t = B ? B.emptyScript : "", ft = O.reactiveElementPolyfillSupport, S = (n, t) => n, R = { toAttribute(n, t) {
  switch (t) {
    case Boolean:
      n = n ? $t : null;
      break;
    case Object:
    case Array:
      n = n == null ? n : JSON.stringify(n);
  }
  return n;
}, fromAttribute(n, t) {
  let e = n;
  switch (t) {
    case Boolean:
      e = n !== null;
      break;
    case Number:
      e = n === null ? null : Number(n);
      break;
    case Object:
    case Array:
      try {
        e = JSON.parse(n);
      } catch {
        e = null;
      }
  }
  return e;
} }, Y = (n, t) => !ht(n, t), V = { attribute: !0, type: String, converter: R, reflect: !1, useDefault: !1, hasChanged: Y };
Symbol.metadata ??= /* @__PURE__ */ Symbol("metadata"), O.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let g = class extends HTMLElement {
  static addInitializer(t) {
    this._$Ei(), (this.l ??= []).push(t);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t, e = V) {
    if (e.state && (e.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(t) && ((e = Object.create(e)).wrapped = !0), this.elementProperties.set(t, e), !e.noAccessor) {
      const s = /* @__PURE__ */ Symbol(), i = this.getPropertyDescriptor(t, s, e);
      i !== void 0 && lt(this.prototype, t, i);
    }
  }
  static getPropertyDescriptor(t, e, s) {
    const { get: i, set: r } = ct(this.prototype, t) ?? { get() {
      return this[e];
    }, set(o) {
      this[e] = o;
    } };
    return { get: i, set(o) {
      const l = i?.call(this);
      r?.call(this, o), this.requestUpdate(t, l, s);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(t) {
    return this.elementProperties.get(t) ?? V;
  }
  static _$Ei() {
    if (this.hasOwnProperty(S("elementProperties"))) return;
    const t = dt(this);
    t.finalize(), t.l !== void 0 && (this.l = [...t.l]), this.elementProperties = new Map(t.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(S("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(S("properties"))) {
      const e = this.properties, s = [...pt(e), ...ut(e)];
      for (const i of s) this.createProperty(i, e[i]);
    }
    const t = this[Symbol.metadata];
    if (t !== null) {
      const e = litPropertyMetadata.get(t);
      if (e !== void 0) for (const [s, i] of e) this.elementProperties.set(s, i);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [e, s] of this.elementProperties) {
      const i = this._$Eu(e, s);
      i !== void 0 && this._$Eh.set(i, e);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(t) {
    const e = [];
    if (Array.isArray(t)) {
      const s = new Set(t.flat(1 / 0).reverse());
      for (const i of s) e.unshift(j(i));
    } else t !== void 0 && e.push(j(t));
    return e;
  }
  static _$Eu(t, e) {
    const s = e.attribute;
    return s === !1 ? void 0 : typeof s == "string" ? s : typeof t == "string" ? t.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    this._$ES = new Promise((t) => this.enableUpdating = t), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((t) => t(this));
  }
  addController(t) {
    (this._$EO ??= /* @__PURE__ */ new Set()).add(t), this.renderRoot !== void 0 && this.isConnected && t.hostConnected?.();
  }
  removeController(t) {
    this._$EO?.delete(t);
  }
  _$E_() {
    const t = /* @__PURE__ */ new Map(), e = this.constructor.elementProperties;
    for (const s of e.keys()) this.hasOwnProperty(s) && (t.set(s, this[s]), delete this[s]);
    t.size > 0 && (this._$Ep = t);
  }
  createRenderRoot() {
    const t = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return at(t, this.constructor.elementStyles), t;
  }
  connectedCallback() {
    this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(!0), this._$EO?.forEach((t) => t.hostConnected?.());
  }
  enableUpdating(t) {
  }
  disconnectedCallback() {
    this._$EO?.forEach((t) => t.hostDisconnected?.());
  }
  attributeChangedCallback(t, e, s) {
    this._$AK(t, s);
  }
  _$ET(t, e) {
    const s = this.constructor.elementProperties.get(t), i = this.constructor._$Eu(t, s);
    if (i !== void 0 && s.reflect === !0) {
      const r = (s.converter?.toAttribute !== void 0 ? s.converter : R).toAttribute(e, s.type);
      this._$Em = t, r == null ? this.removeAttribute(i) : this.setAttribute(i, r), this._$Em = null;
    }
  }
  _$AK(t, e) {
    const s = this.constructor, i = s._$Eh.get(t);
    if (i !== void 0 && this._$Em !== i) {
      const r = s.getPropertyOptions(i), o = typeof r.converter == "function" ? { fromAttribute: r.converter } : r.converter?.fromAttribute !== void 0 ? r.converter : R;
      this._$Em = i;
      const l = o.fromAttribute(e, r.type);
      this[i] = l ?? this._$Ej?.get(i) ?? l, this._$Em = null;
    }
  }
  requestUpdate(t, e, s, i = !1, r) {
    if (t !== void 0) {
      const o = this.constructor;
      if (i === !1 && (r = this[t]), s ??= o.getPropertyOptions(t), !((s.hasChanged ?? Y)(r, e) || s.useDefault && s.reflect && r === this._$Ej?.get(t) && !this.hasAttribute(o._$Eu(t, s)))) return;
      this.C(t, e, s);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(t, e, { useDefault: s, reflect: i, wrapped: r }, o) {
    s && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(t) && (this._$Ej.set(t, o ?? e ?? this[t]), r !== !0 || o !== void 0) || (this._$AL.has(t) || (this.hasUpdated || s || (e = void 0), this._$AL.set(t, e)), i === !0 && this._$Em !== t && (this._$Eq ??= /* @__PURE__ */ new Set()).add(t));
  }
  async _$EP() {
    this.isUpdatePending = !0;
    try {
      await this._$ES;
    } catch (e) {
      Promise.reject(e);
    }
    const t = this.scheduleUpdate();
    return t != null && await t, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ??= this.createRenderRoot(), this._$Ep) {
        for (const [i, r] of this._$Ep) this[i] = r;
        this._$Ep = void 0;
      }
      const s = this.constructor.elementProperties;
      if (s.size > 0) for (const [i, r] of s) {
        const { wrapped: o } = r, l = this[i];
        o !== !0 || this._$AL.has(i) || l === void 0 || this.C(i, void 0, r, l);
      }
    }
    let t = !1;
    const e = this._$AL;
    try {
      t = this.shouldUpdate(e), t ? (this.willUpdate(e), this._$EO?.forEach((s) => s.hostUpdate?.()), this.update(e)) : this._$EM();
    } catch (s) {
      throw t = !1, this._$EM(), s;
    }
    t && this._$AE(e);
  }
  willUpdate(t) {
  }
  _$AE(t) {
    this._$EO?.forEach((e) => e.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(t)), this.updated(t);
  }
  _$EM() {
    this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = !1;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$ES;
  }
  shouldUpdate(t) {
    return !0;
  }
  update(t) {
    this._$Eq &&= this._$Eq.forEach((e) => this._$ET(e, this[e])), this._$EM();
  }
  updated(t) {
  }
  firstUpdated(t) {
  }
};
g.elementStyles = [], g.shadowRootOptions = { mode: "open" }, g[S("elementProperties")] = /* @__PURE__ */ new Map(), g[S("finalized")] = /* @__PURE__ */ new Map(), ft?.({ ReactiveElement: g }), (O.reactiveElementVersions ??= []).push("2.1.2");
const D = globalThis, W = (n) => n, N = D.trustedTypes, F = N ? N.createPolicy("lit-html", { createHTML: (n) => n }) : void 0, tt = "$lit$", f = `lit$${Math.random().toFixed(9).slice(2)}$`, et = "?" + f, _t = `<${et}>`, y = document, w = () => y.createComment(""), x = (n) => n === null || typeof n != "object" && typeof n != "function", L = Array.isArray, mt = (n) => L(n) || typeof n?.[Symbol.iterator] == "function", H = `[ 	
\f\r]`, E = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, Z = /-->/g, J = />/g, _ = RegExp(`>|${H}(?:([^\\s"'>=/]+)(${H}*=${H}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), K = /'/g, G = /"/g, st = /^(?:script|style|textarea|title)$/i, yt = (n) => (t, ...e) => ({ _$litType$: n, strings: t, values: e }), it = yt(1), A = /* @__PURE__ */ Symbol.for("lit-noChange"), p = /* @__PURE__ */ Symbol.for("lit-nothing"), Q = /* @__PURE__ */ new WeakMap(), m = y.createTreeWalker(y, 129);
function nt(n, t) {
  if (!L(n) || !n.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return F !== void 0 ? F.createHTML(t) : t;
}
const gt = (n, t) => {
  const e = n.length - 1, s = [];
  let i, r = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", o = E;
  for (let l = 0; l < e; l++) {
    const a = n[l];
    let c, u, h = -1, d = 0;
    for (; d < a.length && (o.lastIndex = d, u = o.exec(a), u !== null); ) d = o.lastIndex, o === E ? u[1] === "!--" ? o = Z : u[1] !== void 0 ? o = J : u[2] !== void 0 ? (st.test(u[2]) && (i = RegExp("</" + u[2], "g")), o = _) : u[3] !== void 0 && (o = _) : o === _ ? u[0] === ">" ? (o = i ?? E, h = -1) : u[1] === void 0 ? h = -2 : (h = o.lastIndex - u[2].length, c = u[1], o = u[3] === void 0 ? _ : u[3] === '"' ? G : K) : o === G || o === K ? o = _ : o === Z || o === J ? o = E : (o = _, i = void 0);
    const $ = o === _ && n[l + 1].startsWith("/>") ? " " : "";
    r += o === E ? a + _t : h >= 0 ? (s.push(c), a.slice(0, h) + tt + a.slice(h) + f + $) : a + f + (h === -2 ? l : $);
  }
  return [nt(n, r + (n[e] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), s];
};
class C {
  constructor({ strings: t, _$litType$: e }, s) {
    let i;
    this.parts = [];
    let r = 0, o = 0;
    const l = t.length - 1, a = this.parts, [c, u] = gt(t, e);
    if (this.el = C.createElement(c, s), m.currentNode = this.el.content, e === 2 || e === 3) {
      const h = this.el.content.firstChild;
      h.replaceWith(...h.childNodes);
    }
    for (; (i = m.nextNode()) !== null && a.length < l; ) {
      if (i.nodeType === 1) {
        if (i.hasAttributes()) for (const h of i.getAttributeNames()) if (h.endsWith(tt)) {
          const d = u[o++], $ = i.getAttribute(h).split(f), U = /([.?@])?(.*)/.exec(d);
          a.push({ type: 1, index: r, name: U[2], strings: $, ctor: U[1] === "." ? At : U[1] === "?" ? bt : U[1] === "@" ? Et : T }), i.removeAttribute(h);
        } else h.startsWith(f) && (a.push({ type: 6, index: r }), i.removeAttribute(h));
        if (st.test(i.tagName)) {
          const h = i.textContent.split(f), d = h.length - 1;
          if (d > 0) {
            i.textContent = N ? N.emptyScript : "";
            for (let $ = 0; $ < d; $++) i.append(h[$], w()), m.nextNode(), a.push({ type: 2, index: ++r });
            i.append(h[d], w());
          }
        }
      } else if (i.nodeType === 8) if (i.data === et) a.push({ type: 2, index: r });
      else {
        let h = -1;
        for (; (h = i.data.indexOf(f, h + 1)) !== -1; ) a.push({ type: 7, index: r }), h += f.length - 1;
      }
      r++;
    }
  }
  static createElement(t, e) {
    const s = y.createElement("template");
    return s.innerHTML = t, s;
  }
}
function b(n, t, e = n, s) {
  if (t === A) return t;
  let i = s !== void 0 ? e._$Co?.[s] : e._$Cl;
  const r = x(t) ? void 0 : t._$litDirective$;
  return i?.constructor !== r && (i?._$AO?.(!1), r === void 0 ? i = void 0 : (i = new r(n), i._$AT(n, e, s)), s !== void 0 ? (e._$Co ??= [])[s] = i : e._$Cl = i), i !== void 0 && (t = b(n, i._$AS(n, t.values), i, s)), t;
}
class vt {
  constructor(t, e) {
    this._$AV = [], this._$AN = void 0, this._$AD = t, this._$AM = e;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(t) {
    const { el: { content: e }, parts: s } = this._$AD, i = (t?.creationScope ?? y).importNode(e, !0);
    m.currentNode = i;
    let r = m.nextNode(), o = 0, l = 0, a = s[0];
    for (; a !== void 0; ) {
      if (o === a.index) {
        let c;
        a.type === 2 ? c = new P(r, r.nextSibling, this, t) : a.type === 1 ? c = new a.ctor(r, a.name, a.strings, this, t) : a.type === 6 && (c = new St(r, this, t)), this._$AV.push(c), a = s[++l];
      }
      o !== a?.index && (r = m.nextNode(), o++);
    }
    return m.currentNode = y, i;
  }
  p(t) {
    let e = 0;
    for (const s of this._$AV) s !== void 0 && (s.strings !== void 0 ? (s._$AI(t, s, e), e += s.strings.length - 2) : s._$AI(t[e])), e++;
  }
}
class P {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(t, e, s, i) {
    this.type = 2, this._$AH = p, this._$AN = void 0, this._$AA = t, this._$AB = e, this._$AM = s, this.options = i, this._$Cv = i?.isConnected ?? !0;
  }
  get parentNode() {
    let t = this._$AA.parentNode;
    const e = this._$AM;
    return e !== void 0 && t?.nodeType === 11 && (t = e.parentNode), t;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t, e = this) {
    t = b(this, t, e), x(t) ? t === p || t == null || t === "" ? (this._$AH !== p && this._$AR(), this._$AH = p) : t !== this._$AH && t !== A && this._(t) : t._$litType$ !== void 0 ? this.$(t) : t.nodeType !== void 0 ? this.T(t) : mt(t) ? this.k(t) : this._(t);
  }
  O(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }
  T(t) {
    this._$AH !== t && (this._$AR(), this._$AH = this.O(t));
  }
  _(t) {
    this._$AH !== p && x(this._$AH) ? this._$AA.nextSibling.data = t : this.T(y.createTextNode(t)), this._$AH = t;
  }
  $(t) {
    const { values: e, _$litType$: s } = t, i = typeof s == "number" ? this._$AC(t) : (s.el === void 0 && (s.el = C.createElement(nt(s.h, s.h[0]), this.options)), s);
    if (this._$AH?._$AD === i) this._$AH.p(e);
    else {
      const r = new vt(i, this), o = r.u(this.options);
      r.p(e), this.T(o), this._$AH = r;
    }
  }
  _$AC(t) {
    let e = Q.get(t.strings);
    return e === void 0 && Q.set(t.strings, e = new C(t)), e;
  }
  k(t) {
    L(this._$AH) || (this._$AH = [], this._$AR());
    const e = this._$AH;
    let s, i = 0;
    for (const r of t) i === e.length ? e.push(s = new P(this.O(w()), this.O(w()), this, this.options)) : s = e[i], s._$AI(r), i++;
    i < e.length && (this._$AR(s && s._$AB.nextSibling, i), e.length = i);
  }
  _$AR(t = this._$AA.nextSibling, e) {
    for (this._$AP?.(!1, !0, e); t !== this._$AB; ) {
      const s = W(t).nextSibling;
      W(t).remove(), t = s;
    }
  }
  setConnected(t) {
    this._$AM === void 0 && (this._$Cv = t, this._$AP?.(t));
  }
}
class T {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t, e, s, i, r) {
    this.type = 1, this._$AH = p, this._$AN = void 0, this.element = t, this.name = e, this._$AM = i, this.options = r, s.length > 2 || s[0] !== "" || s[1] !== "" ? (this._$AH = Array(s.length - 1).fill(new String()), this.strings = s) : this._$AH = p;
  }
  _$AI(t, e = this, s, i) {
    const r = this.strings;
    let o = !1;
    if (r === void 0) t = b(this, t, e, 0), o = !x(t) || t !== this._$AH && t !== A, o && (this._$AH = t);
    else {
      const l = t;
      let a, c;
      for (t = r[0], a = 0; a < r.length - 1; a++) c = b(this, l[s + a], e, a), c === A && (c = this._$AH[a]), o ||= !x(c) || c !== this._$AH[a], c === p ? t = p : t !== p && (t += (c ?? "") + r[a + 1]), this._$AH[a] = c;
    }
    o && !i && this.j(t);
  }
  j(t) {
    t === p ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t ?? "");
  }
}
class At extends T {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t) {
    this.element[this.name] = t === p ? void 0 : t;
  }
}
class bt extends T {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t) {
    this.element.toggleAttribute(this.name, !!t && t !== p);
  }
}
class Et extends T {
  constructor(t, e, s, i, r) {
    super(t, e, s, i, r), this.type = 5;
  }
  _$AI(t, e = this) {
    if ((t = b(this, t, e, 0) ?? p) === A) return;
    const s = this._$AH, i = t === p && s !== p || t.capture !== s.capture || t.once !== s.once || t.passive !== s.passive, r = t !== p && (s === p || i);
    i && this.element.removeEventListener(this.name, this, s), r && this.element.addEventListener(this.name, this, t), this._$AH = t;
  }
  handleEvent(t) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, t) : this._$AH.handleEvent(t);
  }
}
class St {
  constructor(t, e, s) {
    this.element = t, this.type = 6, this._$AN = void 0, this._$AM = e, this.options = s;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t) {
    b(this, t);
  }
}
const wt = D.litHtmlPolyfillSupport;
wt?.(C, P), (D.litHtmlVersions ??= []).push("3.3.2");
const xt = (n, t, e) => {
  const s = e?.renderBefore ?? t;
  let i = s._$litPart$;
  if (i === void 0) {
    const r = e?.renderBefore ?? null;
    s._$litPart$ = i = new P(t.insertBefore(w(), r), r, void 0, e ?? {});
  }
  return i._$AI(n), i;
};
const q = globalThis;
class v extends g {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const t = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= t.firstChild, t;
  }
  update(t) {
    const e = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = xt(e, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(!0);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(!1);
  }
  render() {
    return A;
  }
}
v._$litElement$ = !0, v.finalized = !0, q.litElementHydrateSupport?.({ LitElement: v });
const Ct = q.litElementPolyfillSupport;
Ct?.({ LitElement: v });
(q.litElementVersions ??= []).push("4.2.2");
function Pt(n, t) {
  let e = null;
  return (...s) => {
    window.clearTimeout(e), e = window.setTimeout(() => {
      n(...s);
    }, t);
  };
}
class Ut extends v {
  static properties = {
    octaves: { type: Number },
    persistence: { type: Number },
    lacunarity: { type: Number },
    frequency: { type: Number }
  };
  constructor() {
    super(), this.octaves = 4, this.persistence = 0.5, this.lacunarity = 2, this.frequency = 0.1, this.dispatachDraw = Pt(() => {
      this.generateMap();
    }, 500);
  }
  static styles = ot`
    .generator {
      width: max-content;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .form-input input[type="range"] {
      flex: 1;
    }

    .form-input {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 2px;
    }
  `;
  generateMap() {
    const t = {
      octaves: this.octaves,
      persistence: this.persistence,
      lacunarity: this.lacunarity,
      frequency: this.frequency
    }, e = new CustomEvent("drawMap", { detail: t, composed: !0, bubbles: !0 });
    this.dispatchEvent(e);
  }
  changeInput(t) {
    return (e) => {
      this[t] = parseFloat(e.target.value), this.dispatachDraw();
    };
  }
  render() {
    return it`
    <div class="generator">
      <!-- <button @click=${this.generateMap}>Generate Map</button> -->
      <div class="form-input">
        <label>Octaves</label>
        <input type="range" min="1" max="10" step="1" .value=${this.octaves} @input=${this.changeInput("octaves")}/>
        <input type="number" id="field" min="1" max="10" step="1" .value=${this.octaves} @input=${this.changeInput("octaves")}/>
      </div >
      <div class="form-input">
        <label>Persistence</label>
        <input type="range" min="0.1" max="1" id="persistence" step="0.05" .value=${this.persistence} @input=${this.changeInput("persistence")}/>
        <input type="number" id="field" min="1" max="3" step="0.05" .value=${this.persistence} @input=${this.changeInput("persistence")}/>
      </div>
      <div class="form-input">
        <label>Lacunarity</label>
        <input type="range" min="1" max="3" id="lacunarity" step="0.1" .value=${this.lacunarity} @input=${this.changeInput("lacunarity")}/>
        <input type="number" id="field" min="1" max="3" step="0.1" .value=${this.lacunarity} @input=${this.changeInput("lacunarity")}/>
      </div>
      <div class="form-input">
        <label>Frequency</label>
        <input type="range" min="0.005" max="0.2" id="frequency" step="0.005" .value=${this.frequency} @input=${this.changeInput("frequency")}/>
        <input type="number" id="field" min="0.005" max="0.2" step="0.005" .value=${this.frequency} @input=${this.changeInput("frequency")}/>
      </div >
    </div >
  `;
  }
}
customElements.define("draw-map-tool", Ut);
class Mt extends v {
  static properties = {
    radius: { type: Number }
  };
  constructor() {
    super(), this.radius = 20;
  }
  changeInput(t) {
    return (e) => {
      this[t] = parseFloat(e.target.value);
    };
  }
  render() {
    return it`
      <div class="properties">
        <div class="form-input">
          <label>Radius</label>
          <input type="range" min="10" max="100" step="5" .value=${this.radius} @input=${this.changeInput("radius")}/>
          <input type="number" min="10" max="100" step="5" .value=${this.radius} @input=${this.changeInput("radius")}/>
        </div>
      </div>
    `;
  }
}
customElements.define("brush-tool", Mt);
