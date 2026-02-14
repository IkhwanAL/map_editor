const O = globalThis, I = O.ShadowRoot && (O.ShadyCSS === void 0 || O.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, D = /* @__PURE__ */ Symbol(), j = /* @__PURE__ */ new WeakMap();
let tt = class {
  constructor(t, e, s) {
    if (this._$cssResult$ = !0, s !== D) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = e;
  }
  get styleSheet() {
    let t = this.o;
    const e = this.t;
    if (I && t === void 0) {
      const s = e !== void 0 && e.length === 1;
      s && (t = j.get(e)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), s && j.set(e, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const at = (n) => new tt(typeof n == "string" ? n : n + "", void 0, D), B = (n, ...t) => {
  const e = n.length === 1 ? n[0] : t.reduce((s, i, r) => s + ((o) => {
    if (o._$cssResult$ === !0) return o.cssText;
    if (typeof o == "number") return o;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + o + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(i) + n[r + 1], n[0]);
  return new tt(e, n, D);
}, ht = (n, t) => {
  if (I) n.adoptedStyleSheets = t.map((e) => e instanceof CSSStyleSheet ? e : e.styleSheet);
  else for (const e of t) {
    const s = document.createElement("style"), i = O.litNonce;
    i !== void 0 && s.setAttribute("nonce", i), s.textContent = e.cssText, n.appendChild(s);
  }
}, V = I ? (n) => n : (n) => n instanceof CSSStyleSheet ? ((t) => {
  let e = "";
  for (const s of t.cssRules) e += s.cssText;
  return at(e);
})(n) : n;
const { is: lt, defineProperty: ct, getOwnPropertyDescriptor: pt, getOwnPropertyNames: ut, getOwnPropertySymbols: dt, getPrototypeOf: $t } = Object, N = globalThis, W = N.trustedTypes, ft = W ? W.emptyScript : "", mt = N.reactiveElementPolyfillSupport, x = (n, t) => n, R = { toAttribute(n, t) {
  switch (t) {
    case Boolean:
      n = n ? ft : null;
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
} }, et = (n, t) => !lt(n, t), F = { attribute: !0, type: String, converter: R, reflect: !1, useDefault: !1, hasChanged: et };
Symbol.metadata ??= /* @__PURE__ */ Symbol("metadata"), N.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let y = class extends HTMLElement {
  static addInitializer(t) {
    this._$Ei(), (this.l ??= []).push(t);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t, e = F) {
    if (e.state && (e.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(t) && ((e = Object.create(e)).wrapped = !0), this.elementProperties.set(t, e), !e.noAccessor) {
      const s = /* @__PURE__ */ Symbol(), i = this.getPropertyDescriptor(t, s, e);
      i !== void 0 && ct(this.prototype, t, i);
    }
  }
  static getPropertyDescriptor(t, e, s) {
    const { get: i, set: r } = pt(this.prototype, t) ?? { get() {
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
    return this.elementProperties.get(t) ?? F;
  }
  static _$Ei() {
    if (this.hasOwnProperty(x("elementProperties"))) return;
    const t = $t(this);
    t.finalize(), t.l !== void 0 && (this.l = [...t.l]), this.elementProperties = new Map(t.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(x("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(x("properties"))) {
      const e = this.properties, s = [...ut(e), ...dt(e)];
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
      for (const i of s) e.unshift(V(i));
    } else t !== void 0 && e.push(V(t));
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
    return ht(t, this.constructor.elementStyles), t;
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
      if (i === !1 && (r = this[t]), s ??= o.getPropertyOptions(t), !((s.hasChanged ?? et)(r, e) || s.useDefault && s.reflect && r === this._$Ej?.get(t) && !this.hasAttribute(o._$Eu(t, s)))) return;
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
y.elementStyles = [], y.shadowRootOptions = { mode: "open" }, y[x("elementProperties")] = /* @__PURE__ */ new Map(), y[x("finalized")] = /* @__PURE__ */ new Map(), mt?.({ ReactiveElement: y }), (N.reactiveElementVersions ??= []).push("2.1.2");
const L = globalThis, Z = (n) => n, M = L.trustedTypes, G = M ? M.createPolicy("lit-html", { createHTML: (n) => n }) : void 0, st = "$lit$", f = `lit$${Math.random().toFixed(9).slice(2)}$`, it = "?" + f, _t = `<${it}>`, g = document, w = () => g.createComment(""), C = (n) => n === null || typeof n != "object" && typeof n != "function", q = Array.isArray, gt = (n) => q(n) || typeof n?.[Symbol.iterator] == "function", k = `[ 	
\f\r]`, E = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, J = /-->/g, K = />/g, m = RegExp(`>|${k}(?:([^\\s"'>=/]+)(${k}*=${k}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), X = /'/g, Q = /"/g, nt = /^(?:script|style|textarea|title)$/i, yt = (n) => (t, ...e) => ({ _$litType$: n, strings: t, values: e }), S = yt(1), A = /* @__PURE__ */ Symbol.for("lit-noChange"), p = /* @__PURE__ */ Symbol.for("lit-nothing"), Y = /* @__PURE__ */ new WeakMap(), _ = g.createTreeWalker(g, 129);
function rt(n, t) {
  if (!q(n) || !n.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return G !== void 0 ? G.createHTML(t) : t;
}
const vt = (n, t) => {
  const e = n.length - 1, s = [];
  let i, r = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", o = E;
  for (let l = 0; l < e; l++) {
    const a = n[l];
    let c, u, h = -1, d = 0;
    for (; d < a.length && (o.lastIndex = d, u = o.exec(a), u !== null); ) d = o.lastIndex, o === E ? u[1] === "!--" ? o = J : u[1] !== void 0 ? o = K : u[2] !== void 0 ? (nt.test(u[2]) && (i = RegExp("</" + u[2], "g")), o = m) : u[3] !== void 0 && (o = m) : o === m ? u[0] === ">" ? (o = i ?? E, h = -1) : u[1] === void 0 ? h = -2 : (h = o.lastIndex - u[2].length, c = u[1], o = u[3] === void 0 ? m : u[3] === '"' ? Q : X) : o === Q || o === X ? o = m : o === J || o === K ? o = E : (o = m, i = void 0);
    const $ = o === m && n[l + 1].startsWith("/>") ? " " : "";
    r += o === E ? a + _t : h >= 0 ? (s.push(c), a.slice(0, h) + st + a.slice(h) + f + $) : a + f + (h === -2 ? l : $);
  }
  return [rt(n, r + (n[e] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), s];
};
class P {
  constructor({ strings: t, _$litType$: e }, s) {
    let i;
    this.parts = [];
    let r = 0, o = 0;
    const l = t.length - 1, a = this.parts, [c, u] = vt(t, e);
    if (this.el = P.createElement(c, s), _.currentNode = this.el.content, e === 2 || e === 3) {
      const h = this.el.content.firstChild;
      h.replaceWith(...h.childNodes);
    }
    for (; (i = _.nextNode()) !== null && a.length < l; ) {
      if (i.nodeType === 1) {
        if (i.hasAttributes()) for (const h of i.getAttributeNames()) if (h.endsWith(st)) {
          const d = u[o++], $ = i.getAttribute(h).split(f), U = /([.?@])?(.*)/.exec(d);
          a.push({ type: 1, index: r, name: U[2], strings: $, ctor: U[1] === "." ? bt : U[1] === "?" ? Et : U[1] === "@" ? St : H }), i.removeAttribute(h);
        } else h.startsWith(f) && (a.push({ type: 6, index: r }), i.removeAttribute(h));
        if (nt.test(i.tagName)) {
          const h = i.textContent.split(f), d = h.length - 1;
          if (d > 0) {
            i.textContent = M ? M.emptyScript : "";
            for (let $ = 0; $ < d; $++) i.append(h[$], w()), _.nextNode(), a.push({ type: 2, index: ++r });
            i.append(h[d], w());
          }
        }
      } else if (i.nodeType === 8) if (i.data === it) a.push({ type: 2, index: r });
      else {
        let h = -1;
        for (; (h = i.data.indexOf(f, h + 1)) !== -1; ) a.push({ type: 7, index: r }), h += f.length - 1;
      }
      r++;
    }
  }
  static createElement(t, e) {
    const s = g.createElement("template");
    return s.innerHTML = t, s;
  }
}
function b(n, t, e = n, s) {
  if (t === A) return t;
  let i = s !== void 0 ? e._$Co?.[s] : e._$Cl;
  const r = C(t) ? void 0 : t._$litDirective$;
  return i?.constructor !== r && (i?._$AO?.(!1), r === void 0 ? i = void 0 : (i = new r(n), i._$AT(n, e, s)), s !== void 0 ? (e._$Co ??= [])[s] = i : e._$Cl = i), i !== void 0 && (t = b(n, i._$AS(n, t.values), i, s)), t;
}
class At {
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
    const { el: { content: e }, parts: s } = this._$AD, i = (t?.creationScope ?? g).importNode(e, !0);
    _.currentNode = i;
    let r = _.nextNode(), o = 0, l = 0, a = s[0];
    for (; a !== void 0; ) {
      if (o === a.index) {
        let c;
        a.type === 2 ? c = new T(r, r.nextSibling, this, t) : a.type === 1 ? c = new a.ctor(r, a.name, a.strings, this, t) : a.type === 6 && (c = new xt(r, this, t)), this._$AV.push(c), a = s[++l];
      }
      o !== a?.index && (r = _.nextNode(), o++);
    }
    return _.currentNode = g, i;
  }
  p(t) {
    let e = 0;
    for (const s of this._$AV) s !== void 0 && (s.strings !== void 0 ? (s._$AI(t, s, e), e += s.strings.length - 2) : s._$AI(t[e])), e++;
  }
}
class T {
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
    t = b(this, t, e), C(t) ? t === p || t == null || t === "" ? (this._$AH !== p && this._$AR(), this._$AH = p) : t !== this._$AH && t !== A && this._(t) : t._$litType$ !== void 0 ? this.$(t) : t.nodeType !== void 0 ? this.T(t) : gt(t) ? this.k(t) : this._(t);
  }
  O(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }
  T(t) {
    this._$AH !== t && (this._$AR(), this._$AH = this.O(t));
  }
  _(t) {
    this._$AH !== p && C(this._$AH) ? this._$AA.nextSibling.data = t : this.T(g.createTextNode(t)), this._$AH = t;
  }
  $(t) {
    const { values: e, _$litType$: s } = t, i = typeof s == "number" ? this._$AC(t) : (s.el === void 0 && (s.el = P.createElement(rt(s.h, s.h[0]), this.options)), s);
    if (this._$AH?._$AD === i) this._$AH.p(e);
    else {
      const r = new At(i, this), o = r.u(this.options);
      r.p(e), this.T(o), this._$AH = r;
    }
  }
  _$AC(t) {
    let e = Y.get(t.strings);
    return e === void 0 && Y.set(t.strings, e = new P(t)), e;
  }
  k(t) {
    q(this._$AH) || (this._$AH = [], this._$AR());
    const e = this._$AH;
    let s, i = 0;
    for (const r of t) i === e.length ? e.push(s = new T(this.O(w()), this.O(w()), this, this.options)) : s = e[i], s._$AI(r), i++;
    i < e.length && (this._$AR(s && s._$AB.nextSibling, i), e.length = i);
  }
  _$AR(t = this._$AA.nextSibling, e) {
    for (this._$AP?.(!1, !0, e); t !== this._$AB; ) {
      const s = Z(t).nextSibling;
      Z(t).remove(), t = s;
    }
  }
  setConnected(t) {
    this._$AM === void 0 && (this._$Cv = t, this._$AP?.(t));
  }
}
class H {
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
    if (r === void 0) t = b(this, t, e, 0), o = !C(t) || t !== this._$AH && t !== A, o && (this._$AH = t);
    else {
      const l = t;
      let a, c;
      for (t = r[0], a = 0; a < r.length - 1; a++) c = b(this, l[s + a], e, a), c === A && (c = this._$AH[a]), o ||= !C(c) || c !== this._$AH[a], c === p ? t = p : t !== p && (t += (c ?? "") + r[a + 1]), this._$AH[a] = c;
    }
    o && !i && this.j(t);
  }
  j(t) {
    t === p ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t ?? "");
  }
}
class bt extends H {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t) {
    this.element[this.name] = t === p ? void 0 : t;
  }
}
class Et extends H {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t) {
    this.element.toggleAttribute(this.name, !!t && t !== p);
  }
}
class St extends H {
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
class xt {
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
const wt = L.litHtmlPolyfillSupport;
wt?.(P, T), (L.litHtmlVersions ??= []).push("3.3.2");
const Ct = (n, t, e) => {
  const s = e?.renderBefore ?? t;
  let i = s._$litPart$;
  if (i === void 0) {
    const r = e?.renderBefore ?? null;
    s._$litPart$ = i = new T(t.insertBefore(w(), r), r, void 0, e ?? {});
  }
  return i._$AI(n), i;
};
const z = globalThis;
class v extends y {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const t = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= t.firstChild, t;
  }
  update(t) {
    const e = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = Ct(e, this.renderRoot, this.renderOptions);
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
v._$litElement$ = !0, v.finalized = !0, z.litElementHydrateSupport?.({ LitElement: v });
const Pt = z.litElementPolyfillSupport;
Pt?.({ LitElement: v });
(z.litElementVersions ??= []).push("4.2.2");
function Tt(n, t) {
  let e = null;
  return (...s) => {
    window.clearTimeout(e), e = window.setTimeout(() => {
      n(...s);
    }, t);
  };
}
const ot = B`
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
B`
.switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
}

/* hide the real checkbox */
.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

/* the track */
.slider {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background-color: #ccc;
  transition: 0.3s;
  border-radius: 34px;
}

/* the knob */
.slider::before {
  content: "";
  position: absolute;
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

/* when checked */
.switch input:checked + .slider {
  background-color: #4caf50;
}

.switch input:checked + .slider::before {
  transform: translateX(26px);
}
`;
class Ut extends v {
  static properties = {
    octaves: { type: Number },
    persistence: { type: Number },
    lacunarity: { type: Number },
    frequency: { type: Number }
  };
  constructor() {
    super(), this.octaves = 4, this.persistence = 0.5, this.lacunarity = 2, this.frequency = 0.1, this.dispatachDraw = Tt(() => {
      this.generateMap();
    }, 500);
  }
  static styles = [
    ot,
    B`
      .generator {
        width: max-content;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
    `
  ];
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
    return S`
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
class Ot extends v {
  static properties = {
    radius: { type: Number },
    mode: { type: String },
    texture: { type: String },
    collision: { type: Boolean }
  };
  static styles = [
    ot
  ];
  constructor() {
    super(), this.radius = 20, this.mode = "terrain", this.texture = "grass", this.collision = !1;
  }
  changeInput(t) {
    return (e) => {
      this[t] = parseFloat(e.target.value);
    };
  }
  changeSelectionTarget(t) {
    this.mode = t.target.value;
  }
  changeSelectionTexture(t) {
    this.texture = t.target.value;
  }
  changeCheckBoxOption(t) {
    this.collision = t.target.checked;
  }
  render() {
    let t = S``;
    return this.mode == "terrain" && (t = S`
        <div class="form-input">
          <label>Terrain Option</label>
          <select name="texture" id="texture" @change=${this.changeSelectionTexture}>
            <option value="grass">Grass</option>
            <option value="dirt">Dirt</option>
            <option value="cliff">Cliff</option>
          </select>
        </div>
      `), this.mode == "collision" && (t = S`
        <div class="form-input">
          <label class="switch">
            <span>Add Collision</span>
            <input type="checkbox" .checked=${this.collision} @change=${this.changeCheckBoxOption}>
          </label>
        </div>
      `), S`
      <div class="properties">
        <div class="form-input">
          <label>Radius</label>
          <input type="range" min="2" max="100" step="5" .value=${this.radius} @input=${this.changeInput("radius")}/>
          <input type="number" min="2" max="100" step="5" .value=${this.radius} @input=${this.changeInput("radius")}/>
        </div>

        <div class="form-input">
          <label>Target</label>
          <select name="mode" id="mode" @change=${this.changeSelectionTarget}>
            <option value="terrain">Terrain</option>
            <option value="collision">Collision</option>
          </select>
        </div>

        ${t}
      </div>
    `;
  }
}
customElements.define("brush-tool", Ot);
