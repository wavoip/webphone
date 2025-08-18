var Yt = Object.defineProperty;
var Qt = (s, e, t) => e in s ? Yt(s, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : s[e] = t;
var g = (s, e, t) => Qt(s, typeof e != "symbol" ? e + "" : e, t);
class Gt {
  constructor({ sampleRate: e, latencyHint: t = 0, workletOptions: n = {} }) {
    g(this, "audio_worklet");
    g(this, "audio_context");
    g(this, "media_stream_track");
    this.audio_worklet = null, this.audio_context = null, this.media_stream_track = this.startMediaStreamTrack({
      sampleRate: e,
      latencyHint: t,
      workletOptions: n
    });
  }
  async startMediaStreamTrack({
    sampleRate: e,
    latencyHint: t = 0,
    workletOptions: n = {}
  }) {
    const r = new AudioContext({
      sampleRate: e,
      latencyHint: t
    });
    await r.suspend(), await r.audioWorklet.addModule(
      "/worklets/audio/AudioWorklet.js"
    );
    const i = new AudioWorkletNode(
      r,
      "audio-data-worklet-stream",
      n
    );
    i.connect(r.destination), r.resume(), this.audio_worklet = i, this.audio_context = r;
  }
}
class Zt {
  constructor(e, t) {
    g(this, "id", "audio");
    g(this, "SAMPLE_RATE", 16e3);
    g(this, "worklet_stream", null);
    g(this, "is_running", !1);
    this.wavoip_socket = e, this.audio_socket = t, this.wavoip_socket.bindListener("audio_transport:create", {
      id: this.id,
      fn: () => {
        this.start(this.SAMPLE_RATE), this.checkError();
      }
    }), this.wavoip_socket.bindListener("audio_transport:terminate", {
      id: this.id,
      fn: () => this.stop()
    });
  }
  start(e) {
    const t = new Gt({
      sampleRate: e,
      latencyHint: 0,
      workletOptions: {
        numberOfInputs: 1,
        numberOfOutputs: 1,
        channelCount: 1,
        processorOptions: {
          offset: 0
        }
      }
    });
    this.audio_socket.bindListener({
      id: this.id,
      fn: (n) => {
        var r;
        (r = t.audio_worklet) == null || r.port.postMessage({
          buffer: new Uint8Array(n)
        });
      }
    }), this.worklet_stream = t, this.is_running = !0, this.checkPermission();
  }
  stop() {
    this.worklet_stream = null, this.audio_socket && this.audio_socket.removeListener(this.id), this.is_running = !1;
  }
  checkPermission() {
    var e, t, n;
    if (this.is_running) {
      if (navigator.userActivation.hasBeenActive && ((e = this.worklet_stream) != null && e.audio_context)) {
        (n = (t = this.worklet_stream) == null ? void 0 : t.audio_context) == null || n.resume().catch((r) => {
          console.error(
            "[AUDIO] - Permission error to access audio device",
            r
          ), setTimeout(() => {
            this.checkPermission();
          }, 250);
        });
        return;
      }
      setTimeout(() => {
        this.checkPermission();
      }, 250);
    }
  }
  checkError() {
    var e;
    if (navigator.userActivation.hasBeenActive) {
      if (!((e = this.worklet_stream) != null && e.audio_context))
        return {
          type: "audio_context",
          message: "Você precisa interagir com a página para liberar a permissão de áudio"
        };
      if (this.worklet_stream.audio_context.state !== "running")
        return {
          type: "audio_context",
          message: "Não foi possível obter acesso ao díspositivo de audio"
        };
    }
    return null;
  }
}
function $(s) {
  return typeof s != "object" ? !1 : s.type === "success";
}
class es {
  constructor(e) {
    g(this, "id", "call");
    g(this, "calls", []);
    g(this, "is_call_happening", !1);
    this.wavoip_socket = e;
  }
  start(e) {
    return new Promise((t, n) => {
      const r = () => {
        this.wavoip_socket.removeListener(
          "calls:error",
          `${this.id}-start`
        ), this.wavoip_socket.removeListener(
          "calls:error",
          `${this.id}-start`
        ), this.wavoip_socket.removeListener(
          "peer:accepted_elsewhere",
          `${this.id}-start`
        );
      };
      this.wavoip_socket.bindListener("signaling", {
        id: `${this.id}-start`,
        fn: (i, o) => {
          if (i.tag === "accept") {
            this.is_call_happening = !0;
            const a = {
              id: o,
              end: () => this.end().then(() => {
                this.is_call_happening = !1, e.onEnd();
              }),
              mute: () => this.mute().then(() => e.onMute()),
              unmute: () => this.unMute().then(() => e.onUnmute())
            };
            return this.calls.push(a), e.onAccept(a);
          }
          if (i.tag === "reject")
            return r(), e.onReject();
          if (i.tag === "terminate")
            return this.is_call_happening = !1, r(), e.onEnd();
        }
      }), this.wavoip_socket.bindListener("calls:error", {
        id: `${this.id}-error`,
        fn: (i) => e.onError(i)
      }), this.wavoip_socket.emit(
        "calls:start",
        e.whatsappid,
        (i) => {
          $(i) ? t() : n(i);
        }
      );
    });
  }
  onCallReceive(e) {
    const t = () => {
      this.wavoip_socket.removeListener(
        "calls:error",
        `${this.id}-receive`
      ), this.wavoip_socket.removeListener(
        "signaling",
        `${this.id}-receive`
      ), this.wavoip_socket.removeListener(
        "peer:accepted_elsewhere",
        `${this.id}-receive`
      );
    };
    this.wavoip_socket.bindListener("signaling", {
      id: `${this.id}-receive`,
      fn: (n, r) => {
        if (n.tag === "offer") {
          const i = {
            id: r,
            end: () => this.end().then(() => {
              this.is_call_happening = !1, e.onEnd();
            }),
            mute: () => this.mute().then(() => e.onMute()),
            unmute: () => this.unMute().then(() => e.onUnmute())
          };
          return e.onReceive({
            caller: n.attrs["call-creator"].split("@")[0],
            accept: () => this.accept(r).then(() => (this.is_call_happening = !0, i)),
            reject: () => this.reject(r)
          });
        }
        if (n.tag === "terminate")
          return this.calls = this.calls.filter(
            (i) => i.id !== r
          ), t(), this.is_call_happening ? e.onEnd() : e.onUnanswered();
      }
    }), this.wavoip_socket.bindListener("peer:accepted_elsewhere", {
      id: `${this.id}-start`,
      fn: (n) => (this.calls = this.calls.filter((r) => r.id !== n), e.onAcceptedElsewhere())
    }), this.wavoip_socket.bindListener("calls:error", {
      id: `${this.id}-receive`,
      fn: (n) => e.onError(n)
    });
  }
  end() {
    return new Promise((e, t) => {
      this.wavoip_socket.emit("calls:end", (n) => {
        $(n) ? e() : t();
      });
    });
  }
  accept(e) {
    return new Promise((t, n) => {
      this.wavoip_socket.emit("calls:accept", e, (r) => {
        $(r) ? t() : n();
      });
    });
  }
  reject(e) {
    return new Promise((t, n) => {
      this.wavoip_socket.emit("calls:reject", e, (r) => {
        $(r) ? t() : n();
      });
    });
  }
  mute() {
    return new Promise((e, t) => {
      this.wavoip_socket.emit("calls:mute", (n) => {
        $(n) ? e() : t();
      });
    });
  }
  unMute() {
    return new Promise((e, t) => {
      this.wavoip_socket.emit("calls:unmute", (n) => {
        $(n) ? e() : t();
      });
    });
  }
}
function ft(s, e) {
  return function() {
    return s.apply(e, arguments);
  };
}
const { toString: ts } = Object.prototype, { getPrototypeOf: Me } = Object, { iterator: fe, toStringTag: dt } = Symbol, de = /* @__PURE__ */ ((s) => (e) => {
  const t = ts.call(e);
  return s[t] || (s[t] = t.slice(8, -1).toLowerCase());
})(/* @__PURE__ */ Object.create(null)), L = (s) => (s = s.toLowerCase(), (e) => de(e) === s), pe = (s) => (e) => typeof e === s, { isArray: V } = Array, Y = pe("undefined");
function ss(s) {
  return s !== null && !Y(s) && s.constructor !== null && !Y(s.constructor) && O(s.constructor.isBuffer) && s.constructor.isBuffer(s);
}
const pt = L("ArrayBuffer");
function ns(s) {
  let e;
  return typeof ArrayBuffer < "u" && ArrayBuffer.isView ? e = ArrayBuffer.isView(s) : e = s && s.buffer && pt(s.buffer), e;
}
const rs = pe("string"), O = pe("function"), mt = pe("number"), me = (s) => s !== null && typeof s == "object", is = (s) => s === !0 || s === !1, se = (s) => {
  if (de(s) !== "object")
    return !1;
  const e = Me(s);
  return (e === null || e === Object.prototype || Object.getPrototypeOf(e) === null) && !(dt in s) && !(fe in s);
}, os = L("Date"), as = L("File"), cs = L("Blob"), us = L("FileList"), ls = (s) => me(s) && O(s.pipe), hs = (s) => {
  let e;
  return s && (typeof FormData == "function" && s instanceof FormData || O(s.append) && ((e = de(s)) === "formdata" || // detect form-data instance
  e === "object" && O(s.toString) && s.toString() === "[object FormData]"));
}, fs = L("URLSearchParams"), [ds, ps, ms, ys] = ["ReadableStream", "Request", "Response", "Headers"].map(L), gs = (s) => s.trim ? s.trim() : s.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
function Q(s, e, { allOwnKeys: t = !1 } = {}) {
  if (s === null || typeof s > "u")
    return;
  let n, r;
  if (typeof s != "object" && (s = [s]), V(s))
    for (n = 0, r = s.length; n < r; n++)
      e.call(null, s[n], n, s);
  else {
    const i = t ? Object.getOwnPropertyNames(s) : Object.keys(s), o = i.length;
    let a;
    for (n = 0; n < o; n++)
      a = i[n], e.call(null, s[a], a, s);
  }
}
function yt(s, e) {
  e = e.toLowerCase();
  const t = Object.keys(s);
  let n = t.length, r;
  for (; n-- > 0; )
    if (r = t[n], e === r.toLowerCase())
      return r;
  return null;
}
const M = typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : global, gt = (s) => !Y(s) && s !== M;
function Te() {
  const { caseless: s } = gt(this) && this || {}, e = {}, t = (n, r) => {
    const i = s && yt(e, r) || r;
    se(e[i]) && se(n) ? e[i] = Te(e[i], n) : se(n) ? e[i] = Te({}, n) : V(n) ? e[i] = n.slice() : e[i] = n;
  };
  for (let n = 0, r = arguments.length; n < r; n++)
    arguments[n] && Q(arguments[n], t);
  return e;
}
const _s = (s, e, t, { allOwnKeys: n } = {}) => (Q(e, (r, i) => {
  t && O(r) ? s[i] = ft(r, t) : s[i] = r;
}, { allOwnKeys: n }), s), ws = (s) => (s.charCodeAt(0) === 65279 && (s = s.slice(1)), s), bs = (s, e, t, n) => {
  s.prototype = Object.create(e.prototype, n), s.prototype.constructor = s, Object.defineProperty(s, "super", {
    value: e.prototype
  }), t && Object.assign(s.prototype, t);
}, Es = (s, e, t, n) => {
  let r, i, o;
  const a = {};
  if (e = e || {}, s == null) return e;
  do {
    for (r = Object.getOwnPropertyNames(s), i = r.length; i-- > 0; )
      o = r[i], (!n || n(o, s, e)) && !a[o] && (e[o] = s[o], a[o] = !0);
    s = t !== !1 && Me(s);
  } while (s && (!t || t(s, e)) && s !== Object.prototype);
  return e;
}, ks = (s, e, t) => {
  s = String(s), (t === void 0 || t > s.length) && (t = s.length), t -= e.length;
  const n = s.indexOf(e, t);
  return n !== -1 && n === t;
}, Rs = (s) => {
  if (!s) return null;
  if (V(s)) return s;
  let e = s.length;
  if (!mt(e)) return null;
  const t = new Array(e);
  for (; e-- > 0; )
    t[e] = s[e];
  return t;
}, vs = /* @__PURE__ */ ((s) => (e) => s && e instanceof s)(typeof Uint8Array < "u" && Me(Uint8Array)), Ss = (s, e) => {
  const n = (s && s[fe]).call(s);
  let r;
  for (; (r = n.next()) && !r.done; ) {
    const i = r.value;
    e.call(s, i[0], i[1]);
  }
}, As = (s, e) => {
  let t;
  const n = [];
  for (; (t = s.exec(e)) !== null; )
    n.push(t);
  return n;
}, Ts = L("HTMLFormElement"), Os = (s) => s.toLowerCase().replace(
  /[-_\s]([a-z\d])(\w*)/g,
  function(t, n, r) {
    return n.toUpperCase() + r;
  }
), Ke = (({ hasOwnProperty: s }) => (e, t) => s.call(e, t))(Object.prototype), Cs = L("RegExp"), _t = (s, e) => {
  const t = Object.getOwnPropertyDescriptors(s), n = {};
  Q(t, (r, i) => {
    let o;
    (o = e(r, i, s)) !== !1 && (n[i] = o || r);
  }), Object.defineProperties(s, n);
}, xs = (s) => {
  _t(s, (e, t) => {
    if (O(s) && ["arguments", "caller", "callee"].indexOf(t) !== -1)
      return !1;
    const n = s[t];
    if (O(n)) {
      if (e.enumerable = !1, "writable" in e) {
        e.writable = !1;
        return;
      }
      e.set || (e.set = () => {
        throw Error("Can not rewrite read-only method '" + t + "'");
      });
    }
  });
}, Ns = (s, e) => {
  const t = {}, n = (r) => {
    r.forEach((i) => {
      t[i] = !0;
    });
  };
  return V(s) ? n(s) : n(String(s).split(e)), t;
}, Ls = () => {
}, Bs = (s, e) => s != null && Number.isFinite(s = +s) ? s : e;
function Ps(s) {
  return !!(s && O(s.append) && s[dt] === "FormData" && s[fe]);
}
const Us = (s) => {
  const e = new Array(10), t = (n, r) => {
    if (me(n)) {
      if (e.indexOf(n) >= 0)
        return;
      if (!("toJSON" in n)) {
        e[r] = n;
        const i = V(n) ? [] : {};
        return Q(n, (o, a) => {
          const h = t(o, r + 1);
          !Y(h) && (i[a] = h);
        }), e[r] = void 0, i;
      }
    }
    return n;
  };
  return t(s, 0);
}, Ds = L("AsyncFunction"), qs = (s) => s && (me(s) || O(s)) && O(s.then) && O(s.catch), wt = ((s, e) => s ? setImmediate : e ? ((t, n) => (M.addEventListener("message", ({ source: r, data: i }) => {
  r === M && i === t && n.length && n.shift()();
}, !1), (r) => {
  n.push(r), M.postMessage(t, "*");
}))(`axios@${Math.random()}`, []) : (t) => setTimeout(t))(
  typeof setImmediate == "function",
  O(M.postMessage)
), Fs = typeof queueMicrotask < "u" ? queueMicrotask.bind(M) : typeof process < "u" && process.nextTick || wt, Ms = (s) => s != null && O(s[fe]), c = {
  isArray: V,
  isArrayBuffer: pt,
  isBuffer: ss,
  isFormData: hs,
  isArrayBufferView: ns,
  isString: rs,
  isNumber: mt,
  isBoolean: is,
  isObject: me,
  isPlainObject: se,
  isReadableStream: ds,
  isRequest: ps,
  isResponse: ms,
  isHeaders: ys,
  isUndefined: Y,
  isDate: os,
  isFile: as,
  isBlob: cs,
  isRegExp: Cs,
  isFunction: O,
  isStream: ls,
  isURLSearchParams: fs,
  isTypedArray: vs,
  isFileList: us,
  forEach: Q,
  merge: Te,
  extend: _s,
  trim: gs,
  stripBOM: ws,
  inherits: bs,
  toFlatObject: Es,
  kindOf: de,
  kindOfTest: L,
  endsWith: ks,
  toArray: Rs,
  forEachEntry: Ss,
  matchAll: As,
  isHTMLForm: Ts,
  hasOwnProperty: Ke,
  hasOwnProp: Ke,
  // an alias to avoid ESLint no-prototype-builtins detection
  reduceDescriptors: _t,
  freezeMethods: xs,
  toObjectSet: Ns,
  toCamelCase: Os,
  noop: Ls,
  toFiniteNumber: Bs,
  findKey: yt,
  global: M,
  isContextDefined: gt,
  isSpecCompliantForm: Ps,
  toJSONObject: Us,
  isAsyncFn: Ds,
  isThenable: qs,
  setImmediate: wt,
  asap: Fs,
  isIterable: Ms
};
function m(s, e, t, n, r) {
  Error.call(this), Error.captureStackTrace ? Error.captureStackTrace(this, this.constructor) : this.stack = new Error().stack, this.message = s, this.name = "AxiosError", e && (this.code = e), t && (this.config = t), n && (this.request = n), r && (this.response = r, this.status = r.status ? r.status : null);
}
c.inherits(m, Error, {
  toJSON: function() {
    return {
      // Standard
      message: this.message,
      name: this.name,
      // Microsoft
      description: this.description,
      number: this.number,
      // Mozilla
      fileName: this.fileName,
      lineNumber: this.lineNumber,
      columnNumber: this.columnNumber,
      stack: this.stack,
      // Axios
      config: c.toJSONObject(this.config),
      code: this.code,
      status: this.status
    };
  }
});
const bt = m.prototype, Et = {};
[
  "ERR_BAD_OPTION_VALUE",
  "ERR_BAD_OPTION",
  "ECONNABORTED",
  "ETIMEDOUT",
  "ERR_NETWORK",
  "ERR_FR_TOO_MANY_REDIRECTS",
  "ERR_DEPRECATED",
  "ERR_BAD_RESPONSE",
  "ERR_BAD_REQUEST",
  "ERR_CANCELED",
  "ERR_NOT_SUPPORT",
  "ERR_INVALID_URL"
  // eslint-disable-next-line func-names
].forEach((s) => {
  Et[s] = { value: s };
});
Object.defineProperties(m, Et);
Object.defineProperty(bt, "isAxiosError", { value: !0 });
m.from = (s, e, t, n, r, i) => {
  const o = Object.create(bt);
  return c.toFlatObject(s, o, function(h) {
    return h !== Error.prototype;
  }, (a) => a !== "isAxiosError"), m.call(o, s.message, e, t, n, r), o.cause = s, o.name = s.name, i && Object.assign(o, i), o;
};
const Is = null;
function Oe(s) {
  return c.isPlainObject(s) || c.isArray(s);
}
function kt(s) {
  return c.endsWith(s, "[]") ? s.slice(0, -2) : s;
}
function Xe(s, e, t) {
  return s ? s.concat(e).map(function(r, i) {
    return r = kt(r), !t && i ? "[" + r + "]" : r;
  }).join(t ? "." : "") : e;
}
function js(s) {
  return c.isArray(s) && !s.some(Oe);
}
const $s = c.toFlatObject(c, {}, null, function(e) {
  return /^is[A-Z]/.test(e);
});
function ye(s, e, t) {
  if (!c.isObject(s))
    throw new TypeError("target must be an object");
  e = e || new FormData(), t = c.toFlatObject(t, {
    metaTokens: !0,
    dots: !1,
    indexes: !1
  }, !1, function(y, p) {
    return !c.isUndefined(p[y]);
  });
  const n = t.metaTokens, r = t.visitor || u, i = t.dots, o = t.indexes, h = (t.Blob || typeof Blob < "u" && Blob) && c.isSpecCompliantForm(e);
  if (!c.isFunction(r))
    throw new TypeError("visitor must be a function");
  function l(d) {
    if (d === null) return "";
    if (c.isDate(d))
      return d.toISOString();
    if (!h && c.isBlob(d))
      throw new m("Blob is not supported. Use a Buffer instead.");
    return c.isArrayBuffer(d) || c.isTypedArray(d) ? h && typeof Blob == "function" ? new Blob([d]) : Buffer.from(d) : d;
  }
  function u(d, y, p) {
    let b = d;
    if (d && !p && typeof d == "object") {
      if (c.endsWith(y, "{}"))
        y = n ? y : y.slice(0, -2), d = JSON.stringify(d);
      else if (c.isArray(d) && js(d) || (c.isFileList(d) || c.endsWith(y, "[]")) && (b = c.toArray(d)))
        return y = kt(y), b.forEach(function(S, U) {
          !(c.isUndefined(S) || S === null) && e.append(
            // eslint-disable-next-line no-nested-ternary
            o === !0 ? Xe([y], U, i) : o === null ? y : y + "[]",
            l(S)
          );
        }), !1;
    }
    return Oe(d) ? !0 : (e.append(Xe(p, y, i), l(d)), !1);
  }
  const f = [], w = Object.assign($s, {
    defaultVisitor: u,
    convertValue: l,
    isVisitable: Oe
  });
  function R(d, y) {
    if (!c.isUndefined(d)) {
      if (f.indexOf(d) !== -1)
        throw Error("Circular reference detected in " + y.join("."));
      f.push(d), c.forEach(d, function(b, v) {
        (!(c.isUndefined(b) || b === null) && r.call(
          e,
          b,
          c.isString(v) ? v.trim() : v,
          y,
          w
        )) === !0 && R(b, y ? y.concat(v) : [v]);
      }), f.pop();
    }
  }
  if (!c.isObject(s))
    throw new TypeError("data must be an object");
  return R(s), e;
}
function Ye(s) {
  const e = {
    "!": "%21",
    "'": "%27",
    "(": "%28",
    ")": "%29",
    "~": "%7E",
    "%20": "+",
    "%00": "\0"
  };
  return encodeURIComponent(s).replace(/[!'()~]|%20|%00/g, function(n) {
    return e[n];
  });
}
function Ie(s, e) {
  this._pairs = [], s && ye(s, this, e);
}
const Rt = Ie.prototype;
Rt.append = function(e, t) {
  this._pairs.push([e, t]);
};
Rt.toString = function(e) {
  const t = e ? function(n) {
    return e.call(this, n, Ye);
  } : Ye;
  return this._pairs.map(function(r) {
    return t(r[0]) + "=" + t(r[1]);
  }, "").join("&");
};
function Hs(s) {
  return encodeURIComponent(s).replace(/%3A/gi, ":").replace(/%24/g, "$").replace(/%2C/gi, ",").replace(/%20/g, "+").replace(/%5B/gi, "[").replace(/%5D/gi, "]");
}
function vt(s, e, t) {
  if (!e)
    return s;
  const n = t && t.encode || Hs;
  c.isFunction(t) && (t = {
    serialize: t
  });
  const r = t && t.serialize;
  let i;
  if (r ? i = r(e, t) : i = c.isURLSearchParams(e) ? e.toString() : new Ie(e, t).toString(n), i) {
    const o = s.indexOf("#");
    o !== -1 && (s = s.slice(0, o)), s += (s.indexOf("?") === -1 ? "?" : "&") + i;
  }
  return s;
}
class Qe {
  constructor() {
    this.handlers = [];
  }
  /**
   * Add a new interceptor to the stack
   *
   * @param {Function} fulfilled The function to handle `then` for a `Promise`
   * @param {Function} rejected The function to handle `reject` for a `Promise`
   *
   * @return {Number} An ID used to remove interceptor later
   */
  use(e, t, n) {
    return this.handlers.push({
      fulfilled: e,
      rejected: t,
      synchronous: n ? n.synchronous : !1,
      runWhen: n ? n.runWhen : null
    }), this.handlers.length - 1;
  }
  /**
   * Remove an interceptor from the stack
   *
   * @param {Number} id The ID that was returned by `use`
   *
   * @returns {Boolean} `true` if the interceptor was removed, `false` otherwise
   */
  eject(e) {
    this.handlers[e] && (this.handlers[e] = null);
  }
  /**
   * Clear all interceptors from the stack
   *
   * @returns {void}
   */
  clear() {
    this.handlers && (this.handlers = []);
  }
  /**
   * Iterate over all the registered interceptors
   *
   * This method is particularly useful for skipping over any
   * interceptors that may have become `null` calling `eject`.
   *
   * @param {Function} fn The function to call for each interceptor
   *
   * @returns {void}
   */
  forEach(e) {
    c.forEach(this.handlers, function(n) {
      n !== null && e(n);
    });
  }
}
const St = {
  silentJSONParsing: !0,
  forcedJSONParsing: !0,
  clarifyTimeoutError: !1
}, Vs = typeof URLSearchParams < "u" ? URLSearchParams : Ie, Ws = typeof FormData < "u" ? FormData : null, zs = typeof Blob < "u" ? Blob : null, Js = {
  isBrowser: !0,
  classes: {
    URLSearchParams: Vs,
    FormData: Ws,
    Blob: zs
  },
  protocols: ["http", "https", "file", "blob", "url", "data"]
}, je = typeof window < "u" && typeof document < "u", Ce = typeof navigator == "object" && navigator || void 0, Ks = je && (!Ce || ["ReactNative", "NativeScript", "NS"].indexOf(Ce.product) < 0), Xs = typeof WorkerGlobalScope < "u" && // eslint-disable-next-line no-undef
self instanceof WorkerGlobalScope && typeof self.importScripts == "function", Ys = je && window.location.href || "http://localhost", Qs = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  hasBrowserEnv: je,
  hasStandardBrowserEnv: Ks,
  hasStandardBrowserWebWorkerEnv: Xs,
  navigator: Ce,
  origin: Ys
}, Symbol.toStringTag, { value: "Module" })), A = {
  ...Qs,
  ...Js
};
function Gs(s, e) {
  return ye(s, new A.classes.URLSearchParams(), Object.assign({
    visitor: function(t, n, r, i) {
      return A.isNode && c.isBuffer(t) ? (this.append(n, t.toString("base64")), !1) : i.defaultVisitor.apply(this, arguments);
    }
  }, e));
}
function Zs(s) {
  return c.matchAll(/\w+|\[(\w*)]/g, s).map((e) => e[0] === "[]" ? "" : e[1] || e[0]);
}
function en(s) {
  const e = {}, t = Object.keys(s);
  let n;
  const r = t.length;
  let i;
  for (n = 0; n < r; n++)
    i = t[n], e[i] = s[i];
  return e;
}
function At(s) {
  function e(t, n, r, i) {
    let o = t[i++];
    if (o === "__proto__") return !0;
    const a = Number.isFinite(+o), h = i >= t.length;
    return o = !o && c.isArray(r) ? r.length : o, h ? (c.hasOwnProp(r, o) ? r[o] = [r[o], n] : r[o] = n, !a) : ((!r[o] || !c.isObject(r[o])) && (r[o] = []), e(t, n, r[o], i) && c.isArray(r[o]) && (r[o] = en(r[o])), !a);
  }
  if (c.isFormData(s) && c.isFunction(s.entries)) {
    const t = {};
    return c.forEachEntry(s, (n, r) => {
      e(Zs(n), r, t, 0);
    }), t;
  }
  return null;
}
function tn(s, e, t) {
  if (c.isString(s))
    try {
      return (e || JSON.parse)(s), c.trim(s);
    } catch (n) {
      if (n.name !== "SyntaxError")
        throw n;
    }
  return (t || JSON.stringify)(s);
}
const G = {
  transitional: St,
  adapter: ["xhr", "http", "fetch"],
  transformRequest: [function(e, t) {
    const n = t.getContentType() || "", r = n.indexOf("application/json") > -1, i = c.isObject(e);
    if (i && c.isHTMLForm(e) && (e = new FormData(e)), c.isFormData(e))
      return r ? JSON.stringify(At(e)) : e;
    if (c.isArrayBuffer(e) || c.isBuffer(e) || c.isStream(e) || c.isFile(e) || c.isBlob(e) || c.isReadableStream(e))
      return e;
    if (c.isArrayBufferView(e))
      return e.buffer;
    if (c.isURLSearchParams(e))
      return t.setContentType("application/x-www-form-urlencoded;charset=utf-8", !1), e.toString();
    let a;
    if (i) {
      if (n.indexOf("application/x-www-form-urlencoded") > -1)
        return Gs(e, this.formSerializer).toString();
      if ((a = c.isFileList(e)) || n.indexOf("multipart/form-data") > -1) {
        const h = this.env && this.env.FormData;
        return ye(
          a ? { "files[]": e } : e,
          h && new h(),
          this.formSerializer
        );
      }
    }
    return i || r ? (t.setContentType("application/json", !1), tn(e)) : e;
  }],
  transformResponse: [function(e) {
    const t = this.transitional || G.transitional, n = t && t.forcedJSONParsing, r = this.responseType === "json";
    if (c.isResponse(e) || c.isReadableStream(e))
      return e;
    if (e && c.isString(e) && (n && !this.responseType || r)) {
      const o = !(t && t.silentJSONParsing) && r;
      try {
        return JSON.parse(e);
      } catch (a) {
        if (o)
          throw a.name === "SyntaxError" ? m.from(a, m.ERR_BAD_RESPONSE, this, null, this.response) : a;
      }
    }
    return e;
  }],
  /**
   * A timeout in milliseconds to abort a request. If set to 0 (default) a
   * timeout is not created.
   */
  timeout: 0,
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
  maxContentLength: -1,
  maxBodyLength: -1,
  env: {
    FormData: A.classes.FormData,
    Blob: A.classes.Blob
  },
  validateStatus: function(e) {
    return e >= 200 && e < 300;
  },
  headers: {
    common: {
      Accept: "application/json, text/plain, */*",
      "Content-Type": void 0
    }
  }
};
c.forEach(["delete", "get", "head", "post", "put", "patch"], (s) => {
  G.headers[s] = {};
});
const sn = c.toObjectSet([
  "age",
  "authorization",
  "content-length",
  "content-type",
  "etag",
  "expires",
  "from",
  "host",
  "if-modified-since",
  "if-unmodified-since",
  "last-modified",
  "location",
  "max-forwards",
  "proxy-authorization",
  "referer",
  "retry-after",
  "user-agent"
]), nn = (s) => {
  const e = {};
  let t, n, r;
  return s && s.split(`
`).forEach(function(o) {
    r = o.indexOf(":"), t = o.substring(0, r).trim().toLowerCase(), n = o.substring(r + 1).trim(), !(!t || e[t] && sn[t]) && (t === "set-cookie" ? e[t] ? e[t].push(n) : e[t] = [n] : e[t] = e[t] ? e[t] + ", " + n : n);
  }), e;
}, Ge = Symbol("internals");
function J(s) {
  return s && String(s).trim().toLowerCase();
}
function ne(s) {
  return s === !1 || s == null ? s : c.isArray(s) ? s.map(ne) : String(s);
}
function rn(s) {
  const e = /* @__PURE__ */ Object.create(null), t = /([^\s,;=]+)\s*(?:=\s*([^,;]+))?/g;
  let n;
  for (; n = t.exec(s); )
    e[n[1]] = n[2];
  return e;
}
const on = (s) => /^[-_a-zA-Z0-9^`|~,!#$%&'*+.]+$/.test(s.trim());
function Ee(s, e, t, n, r) {
  if (c.isFunction(n))
    return n.call(this, e, t);
  if (r && (e = t), !!c.isString(e)) {
    if (c.isString(n))
      return e.indexOf(n) !== -1;
    if (c.isRegExp(n))
      return n.test(e);
  }
}
function an(s) {
  return s.trim().toLowerCase().replace(/([a-z\d])(\w*)/g, (e, t, n) => t.toUpperCase() + n);
}
function cn(s, e) {
  const t = c.toCamelCase(" " + e);
  ["get", "set", "has"].forEach((n) => {
    Object.defineProperty(s, n + t, {
      value: function(r, i, o) {
        return this[n].call(this, e, r, i, o);
      },
      configurable: !0
    });
  });
}
let C = class {
  constructor(e) {
    e && this.set(e);
  }
  set(e, t, n) {
    const r = this;
    function i(a, h, l) {
      const u = J(h);
      if (!u)
        throw new Error("header name must be a non-empty string");
      const f = c.findKey(r, u);
      (!f || r[f] === void 0 || l === !0 || l === void 0 && r[f] !== !1) && (r[f || h] = ne(a));
    }
    const o = (a, h) => c.forEach(a, (l, u) => i(l, u, h));
    if (c.isPlainObject(e) || e instanceof this.constructor)
      o(e, t);
    else if (c.isString(e) && (e = e.trim()) && !on(e))
      o(nn(e), t);
    else if (c.isObject(e) && c.isIterable(e)) {
      let a = {}, h, l;
      for (const u of e) {
        if (!c.isArray(u))
          throw TypeError("Object iterator must return a key-value pair");
        a[l = u[0]] = (h = a[l]) ? c.isArray(h) ? [...h, u[1]] : [h, u[1]] : u[1];
      }
      o(a, t);
    } else
      e != null && i(t, e, n);
    return this;
  }
  get(e, t) {
    if (e = J(e), e) {
      const n = c.findKey(this, e);
      if (n) {
        const r = this[n];
        if (!t)
          return r;
        if (t === !0)
          return rn(r);
        if (c.isFunction(t))
          return t.call(this, r, n);
        if (c.isRegExp(t))
          return t.exec(r);
        throw new TypeError("parser must be boolean|regexp|function");
      }
    }
  }
  has(e, t) {
    if (e = J(e), e) {
      const n = c.findKey(this, e);
      return !!(n && this[n] !== void 0 && (!t || Ee(this, this[n], n, t)));
    }
    return !1;
  }
  delete(e, t) {
    const n = this;
    let r = !1;
    function i(o) {
      if (o = J(o), o) {
        const a = c.findKey(n, o);
        a && (!t || Ee(n, n[a], a, t)) && (delete n[a], r = !0);
      }
    }
    return c.isArray(e) ? e.forEach(i) : i(e), r;
  }
  clear(e) {
    const t = Object.keys(this);
    let n = t.length, r = !1;
    for (; n--; ) {
      const i = t[n];
      (!e || Ee(this, this[i], i, e, !0)) && (delete this[i], r = !0);
    }
    return r;
  }
  normalize(e) {
    const t = this, n = {};
    return c.forEach(this, (r, i) => {
      const o = c.findKey(n, i);
      if (o) {
        t[o] = ne(r), delete t[i];
        return;
      }
      const a = e ? an(i) : String(i).trim();
      a !== i && delete t[i], t[a] = ne(r), n[a] = !0;
    }), this;
  }
  concat(...e) {
    return this.constructor.concat(this, ...e);
  }
  toJSON(e) {
    const t = /* @__PURE__ */ Object.create(null);
    return c.forEach(this, (n, r) => {
      n != null && n !== !1 && (t[r] = e && c.isArray(n) ? n.join(", ") : n);
    }), t;
  }
  [Symbol.iterator]() {
    return Object.entries(this.toJSON())[Symbol.iterator]();
  }
  toString() {
    return Object.entries(this.toJSON()).map(([e, t]) => e + ": " + t).join(`
`);
  }
  getSetCookie() {
    return this.get("set-cookie") || [];
  }
  get [Symbol.toStringTag]() {
    return "AxiosHeaders";
  }
  static from(e) {
    return e instanceof this ? e : new this(e);
  }
  static concat(e, ...t) {
    const n = new this(e);
    return t.forEach((r) => n.set(r)), n;
  }
  static accessor(e) {
    const n = (this[Ge] = this[Ge] = {
      accessors: {}
    }).accessors, r = this.prototype;
    function i(o) {
      const a = J(o);
      n[a] || (cn(r, o), n[a] = !0);
    }
    return c.isArray(e) ? e.forEach(i) : i(e), this;
  }
};
C.accessor(["Content-Type", "Content-Length", "Accept", "Accept-Encoding", "User-Agent", "Authorization"]);
c.reduceDescriptors(C.prototype, ({ value: s }, e) => {
  let t = e[0].toUpperCase() + e.slice(1);
  return {
    get: () => s,
    set(n) {
      this[t] = n;
    }
  };
});
c.freezeMethods(C);
function ke(s, e) {
  const t = this || G, n = e || t, r = C.from(n.headers);
  let i = n.data;
  return c.forEach(s, function(a) {
    i = a.call(t, i, r.normalize(), e ? e.status : void 0);
  }), r.normalize(), i;
}
function Tt(s) {
  return !!(s && s.__CANCEL__);
}
function W(s, e, t) {
  m.call(this, s ?? "canceled", m.ERR_CANCELED, e, t), this.name = "CanceledError";
}
c.inherits(W, m, {
  __CANCEL__: !0
});
function Ot(s, e, t) {
  const n = t.config.validateStatus;
  !t.status || !n || n(t.status) ? s(t) : e(new m(
    "Request failed with status code " + t.status,
    [m.ERR_BAD_REQUEST, m.ERR_BAD_RESPONSE][Math.floor(t.status / 100) - 4],
    t.config,
    t.request,
    t
  ));
}
function un(s) {
  const e = /^([-+\w]{1,25})(:?\/\/|:)/.exec(s);
  return e && e[1] || "";
}
function ln(s, e) {
  s = s || 10;
  const t = new Array(s), n = new Array(s);
  let r = 0, i = 0, o;
  return e = e !== void 0 ? e : 1e3, function(h) {
    const l = Date.now(), u = n[i];
    o || (o = l), t[r] = h, n[r] = l;
    let f = i, w = 0;
    for (; f !== r; )
      w += t[f++], f = f % s;
    if (r = (r + 1) % s, r === i && (i = (i + 1) % s), l - o < e)
      return;
    const R = u && l - u;
    return R ? Math.round(w * 1e3 / R) : void 0;
  };
}
function hn(s, e) {
  let t = 0, n = 1e3 / e, r, i;
  const o = (l, u = Date.now()) => {
    t = u, r = null, i && (clearTimeout(i), i = null), s.apply(null, l);
  };
  return [(...l) => {
    const u = Date.now(), f = u - t;
    f >= n ? o(l, u) : (r = l, i || (i = setTimeout(() => {
      i = null, o(r);
    }, n - f)));
  }, () => r && o(r)];
}
const le = (s, e, t = 3) => {
  let n = 0;
  const r = ln(50, 250);
  return hn((i) => {
    const o = i.loaded, a = i.lengthComputable ? i.total : void 0, h = o - n, l = r(h), u = o <= a;
    n = o;
    const f = {
      loaded: o,
      total: a,
      progress: a ? o / a : void 0,
      bytes: h,
      rate: l || void 0,
      estimated: l && a && u ? (a - o) / l : void 0,
      event: i,
      lengthComputable: a != null,
      [e ? "download" : "upload"]: !0
    };
    s(f);
  }, t);
}, Ze = (s, e) => {
  const t = s != null;
  return [(n) => e[0]({
    lengthComputable: t,
    total: s,
    loaded: n
  }), e[1]];
}, et = (s) => (...e) => c.asap(() => s(...e)), fn = A.hasStandardBrowserEnv ? /* @__PURE__ */ ((s, e) => (t) => (t = new URL(t, A.origin), s.protocol === t.protocol && s.host === t.host && (e || s.port === t.port)))(
  new URL(A.origin),
  A.navigator && /(msie|trident)/i.test(A.navigator.userAgent)
) : () => !0, dn = A.hasStandardBrowserEnv ? (
  // Standard browser envs support document.cookie
  {
    write(s, e, t, n, r, i) {
      const o = [s + "=" + encodeURIComponent(e)];
      c.isNumber(t) && o.push("expires=" + new Date(t).toGMTString()), c.isString(n) && o.push("path=" + n), c.isString(r) && o.push("domain=" + r), i === !0 && o.push("secure"), document.cookie = o.join("; ");
    },
    read(s) {
      const e = document.cookie.match(new RegExp("(^|;\\s*)(" + s + ")=([^;]*)"));
      return e ? decodeURIComponent(e[3]) : null;
    },
    remove(s) {
      this.write(s, "", Date.now() - 864e5);
    }
  }
) : (
  // Non-standard browser env (web workers, react-native) lack needed support.
  {
    write() {
    },
    read() {
      return null;
    },
    remove() {
    }
  }
);
function pn(s) {
  return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(s);
}
function mn(s, e) {
  return e ? s.replace(/\/?\/$/, "") + "/" + e.replace(/^\/+/, "") : s;
}
function Ct(s, e, t) {
  let n = !pn(e);
  return s && (n || t == !1) ? mn(s, e) : e;
}
const tt = (s) => s instanceof C ? { ...s } : s;
function j(s, e) {
  e = e || {};
  const t = {};
  function n(l, u, f, w) {
    return c.isPlainObject(l) && c.isPlainObject(u) ? c.merge.call({ caseless: w }, l, u) : c.isPlainObject(u) ? c.merge({}, u) : c.isArray(u) ? u.slice() : u;
  }
  function r(l, u, f, w) {
    if (c.isUndefined(u)) {
      if (!c.isUndefined(l))
        return n(void 0, l, f, w);
    } else return n(l, u, f, w);
  }
  function i(l, u) {
    if (!c.isUndefined(u))
      return n(void 0, u);
  }
  function o(l, u) {
    if (c.isUndefined(u)) {
      if (!c.isUndefined(l))
        return n(void 0, l);
    } else return n(void 0, u);
  }
  function a(l, u, f) {
    if (f in e)
      return n(l, u);
    if (f in s)
      return n(void 0, l);
  }
  const h = {
    url: i,
    method: i,
    data: i,
    baseURL: o,
    transformRequest: o,
    transformResponse: o,
    paramsSerializer: o,
    timeout: o,
    timeoutMessage: o,
    withCredentials: o,
    withXSRFToken: o,
    adapter: o,
    responseType: o,
    xsrfCookieName: o,
    xsrfHeaderName: o,
    onUploadProgress: o,
    onDownloadProgress: o,
    decompress: o,
    maxContentLength: o,
    maxBodyLength: o,
    beforeRedirect: o,
    transport: o,
    httpAgent: o,
    httpsAgent: o,
    cancelToken: o,
    socketPath: o,
    responseEncoding: o,
    validateStatus: a,
    headers: (l, u, f) => r(tt(l), tt(u), f, !0)
  };
  return c.forEach(Object.keys(Object.assign({}, s, e)), function(u) {
    const f = h[u] || r, w = f(s[u], e[u], u);
    c.isUndefined(w) && f !== a || (t[u] = w);
  }), t;
}
const xt = (s) => {
  const e = j({}, s);
  let { data: t, withXSRFToken: n, xsrfHeaderName: r, xsrfCookieName: i, headers: o, auth: a } = e;
  e.headers = o = C.from(o), e.url = vt(Ct(e.baseURL, e.url, e.allowAbsoluteUrls), s.params, s.paramsSerializer), a && o.set(
    "Authorization",
    "Basic " + btoa((a.username || "") + ":" + (a.password ? unescape(encodeURIComponent(a.password)) : ""))
  );
  let h;
  if (c.isFormData(t)) {
    if (A.hasStandardBrowserEnv || A.hasStandardBrowserWebWorkerEnv)
      o.setContentType(void 0);
    else if ((h = o.getContentType()) !== !1) {
      const [l, ...u] = h ? h.split(";").map((f) => f.trim()).filter(Boolean) : [];
      o.setContentType([l || "multipart/form-data", ...u].join("; "));
    }
  }
  if (A.hasStandardBrowserEnv && (n && c.isFunction(n) && (n = n(e)), n || n !== !1 && fn(e.url))) {
    const l = r && i && dn.read(i);
    l && o.set(r, l);
  }
  return e;
}, yn = typeof XMLHttpRequest < "u", gn = yn && function(s) {
  return new Promise(function(t, n) {
    const r = xt(s);
    let i = r.data;
    const o = C.from(r.headers).normalize();
    let { responseType: a, onUploadProgress: h, onDownloadProgress: l } = r, u, f, w, R, d;
    function y() {
      R && R(), d && d(), r.cancelToken && r.cancelToken.unsubscribe(u), r.signal && r.signal.removeEventListener("abort", u);
    }
    let p = new XMLHttpRequest();
    p.open(r.method.toUpperCase(), r.url, !0), p.timeout = r.timeout;
    function b() {
      if (!p)
        return;
      const S = C.from(
        "getAllResponseHeaders" in p && p.getAllResponseHeaders()
      ), T = {
        data: !a || a === "text" || a === "json" ? p.responseText : p.response,
        status: p.status,
        statusText: p.statusText,
        headers: S,
        config: s,
        request: p
      };
      Ot(function(F) {
        t(F), y();
      }, function(F) {
        n(F), y();
      }, T), p = null;
    }
    "onloadend" in p ? p.onloadend = b : p.onreadystatechange = function() {
      !p || p.readyState !== 4 || p.status === 0 && !(p.responseURL && p.responseURL.indexOf("file:") === 0) || setTimeout(b);
    }, p.onabort = function() {
      p && (n(new m("Request aborted", m.ECONNABORTED, s, p)), p = null);
    }, p.onerror = function() {
      n(new m("Network Error", m.ERR_NETWORK, s, p)), p = null;
    }, p.ontimeout = function() {
      let U = r.timeout ? "timeout of " + r.timeout + "ms exceeded" : "timeout exceeded";
      const T = r.transitional || St;
      r.timeoutErrorMessage && (U = r.timeoutErrorMessage), n(new m(
        U,
        T.clarifyTimeoutError ? m.ETIMEDOUT : m.ECONNABORTED,
        s,
        p
      )), p = null;
    }, i === void 0 && o.setContentType(null), "setRequestHeader" in p && c.forEach(o.toJSON(), function(U, T) {
      p.setRequestHeader(T, U);
    }), c.isUndefined(r.withCredentials) || (p.withCredentials = !!r.withCredentials), a && a !== "json" && (p.responseType = r.responseType), l && ([w, d] = le(l, !0), p.addEventListener("progress", w)), h && p.upload && ([f, R] = le(h), p.upload.addEventListener("progress", f), p.upload.addEventListener("loadend", R)), (r.cancelToken || r.signal) && (u = (S) => {
      p && (n(!S || S.type ? new W(null, s, p) : S), p.abort(), p = null);
    }, r.cancelToken && r.cancelToken.subscribe(u), r.signal && (r.signal.aborted ? u() : r.signal.addEventListener("abort", u)));
    const v = un(r.url);
    if (v && A.protocols.indexOf(v) === -1) {
      n(new m("Unsupported protocol " + v + ":", m.ERR_BAD_REQUEST, s));
      return;
    }
    p.send(i || null);
  });
}, _n = (s, e) => {
  const { length: t } = s = s ? s.filter(Boolean) : [];
  if (e || t) {
    let n = new AbortController(), r;
    const i = function(l) {
      if (!r) {
        r = !0, a();
        const u = l instanceof Error ? l : this.reason;
        n.abort(u instanceof m ? u : new W(u instanceof Error ? u.message : u));
      }
    };
    let o = e && setTimeout(() => {
      o = null, i(new m(`timeout ${e} of ms exceeded`, m.ETIMEDOUT));
    }, e);
    const a = () => {
      s && (o && clearTimeout(o), o = null, s.forEach((l) => {
        l.unsubscribe ? l.unsubscribe(i) : l.removeEventListener("abort", i);
      }), s = null);
    };
    s.forEach((l) => l.addEventListener("abort", i));
    const { signal: h } = n;
    return h.unsubscribe = () => c.asap(a), h;
  }
}, wn = function* (s, e) {
  let t = s.byteLength;
  if (t < e) {
    yield s;
    return;
  }
  let n = 0, r;
  for (; n < t; )
    r = n + e, yield s.slice(n, r), n = r;
}, bn = async function* (s, e) {
  for await (const t of En(s))
    yield* wn(t, e);
}, En = async function* (s) {
  if (s[Symbol.asyncIterator]) {
    yield* s;
    return;
  }
  const e = s.getReader();
  try {
    for (; ; ) {
      const { done: t, value: n } = await e.read();
      if (t)
        break;
      yield n;
    }
  } finally {
    await e.cancel();
  }
}, st = (s, e, t, n) => {
  const r = bn(s, e);
  let i = 0, o, a = (h) => {
    o || (o = !0, n && n(h));
  };
  return new ReadableStream({
    async pull(h) {
      try {
        const { done: l, value: u } = await r.next();
        if (l) {
          a(), h.close();
          return;
        }
        let f = u.byteLength;
        if (t) {
          let w = i += f;
          t(w);
        }
        h.enqueue(new Uint8Array(u));
      } catch (l) {
        throw a(l), l;
      }
    },
    cancel(h) {
      return a(h), r.return();
    }
  }, {
    highWaterMark: 2
  });
}, ge = typeof fetch == "function" && typeof Request == "function" && typeof Response == "function", Nt = ge && typeof ReadableStream == "function", kn = ge && (typeof TextEncoder == "function" ? /* @__PURE__ */ ((s) => (e) => s.encode(e))(new TextEncoder()) : async (s) => new Uint8Array(await new Response(s).arrayBuffer())), Lt = (s, ...e) => {
  try {
    return !!s(...e);
  } catch {
    return !1;
  }
}, Rn = Nt && Lt(() => {
  let s = !1;
  const e = new Request(A.origin, {
    body: new ReadableStream(),
    method: "POST",
    get duplex() {
      return s = !0, "half";
    }
  }).headers.has("Content-Type");
  return s && !e;
}), nt = 64 * 1024, xe = Nt && Lt(() => c.isReadableStream(new Response("").body)), he = {
  stream: xe && ((s) => s.body)
};
ge && ((s) => {
  ["text", "arrayBuffer", "blob", "formData", "stream"].forEach((e) => {
    !he[e] && (he[e] = c.isFunction(s[e]) ? (t) => t[e]() : (t, n) => {
      throw new m(`Response type '${e}' is not supported`, m.ERR_NOT_SUPPORT, n);
    });
  });
})(new Response());
const vn = async (s) => {
  if (s == null)
    return 0;
  if (c.isBlob(s))
    return s.size;
  if (c.isSpecCompliantForm(s))
    return (await new Request(A.origin, {
      method: "POST",
      body: s
    }).arrayBuffer()).byteLength;
  if (c.isArrayBufferView(s) || c.isArrayBuffer(s))
    return s.byteLength;
  if (c.isURLSearchParams(s) && (s = s + ""), c.isString(s))
    return (await kn(s)).byteLength;
}, Sn = async (s, e) => {
  const t = c.toFiniteNumber(s.getContentLength());
  return t ?? vn(e);
}, An = ge && (async (s) => {
  let {
    url: e,
    method: t,
    data: n,
    signal: r,
    cancelToken: i,
    timeout: o,
    onDownloadProgress: a,
    onUploadProgress: h,
    responseType: l,
    headers: u,
    withCredentials: f = "same-origin",
    fetchOptions: w
  } = xt(s);
  l = l ? (l + "").toLowerCase() : "text";
  let R = _n([r, i && i.toAbortSignal()], o), d;
  const y = R && R.unsubscribe && (() => {
    R.unsubscribe();
  });
  let p;
  try {
    if (h && Rn && t !== "get" && t !== "head" && (p = await Sn(u, n)) !== 0) {
      let T = new Request(e, {
        method: "POST",
        body: n,
        duplex: "half"
      }), D;
      if (c.isFormData(n) && (D = T.headers.get("content-type")) && u.setContentType(D), T.body) {
        const [F, Z] = Ze(
          p,
          le(et(h))
        );
        n = st(T.body, nt, F, Z);
      }
    }
    c.isString(f) || (f = f ? "include" : "omit");
    const b = "credentials" in Request.prototype;
    d = new Request(e, {
      ...w,
      signal: R,
      method: t.toUpperCase(),
      headers: u.normalize().toJSON(),
      body: n,
      duplex: "half",
      credentials: b ? f : void 0
    });
    let v = await fetch(d);
    const S = xe && (l === "stream" || l === "response");
    if (xe && (a || S && y)) {
      const T = {};
      ["status", "statusText", "headers"].forEach((Je) => {
        T[Je] = v[Je];
      });
      const D = c.toFiniteNumber(v.headers.get("content-length")), [F, Z] = a && Ze(
        D,
        le(et(a), !0)
      ) || [];
      v = new Response(
        st(v.body, nt, F, () => {
          Z && Z(), y && y();
        }),
        T
      );
    }
    l = l || "text";
    let U = await he[c.findKey(he, l) || "text"](v, s);
    return !S && y && y(), await new Promise((T, D) => {
      Ot(T, D, {
        data: U,
        headers: C.from(v.headers),
        status: v.status,
        statusText: v.statusText,
        config: s,
        request: d
      });
    });
  } catch (b) {
    throw y && y(), b && b.name === "TypeError" && /Load failed|fetch/i.test(b.message) ? Object.assign(
      new m("Network Error", m.ERR_NETWORK, s, d),
      {
        cause: b.cause || b
      }
    ) : m.from(b, b && b.code, s, d);
  }
}), Ne = {
  http: Is,
  xhr: gn,
  fetch: An
};
c.forEach(Ne, (s, e) => {
  if (s) {
    try {
      Object.defineProperty(s, "name", { value: e });
    } catch {
    }
    Object.defineProperty(s, "adapterName", { value: e });
  }
});
const rt = (s) => `- ${s}`, Tn = (s) => c.isFunction(s) || s === null || s === !1, Bt = {
  getAdapter: (s) => {
    s = c.isArray(s) ? s : [s];
    const { length: e } = s;
    let t, n;
    const r = {};
    for (let i = 0; i < e; i++) {
      t = s[i];
      let o;
      if (n = t, !Tn(t) && (n = Ne[(o = String(t)).toLowerCase()], n === void 0))
        throw new m(`Unknown adapter '${o}'`);
      if (n)
        break;
      r[o || "#" + i] = n;
    }
    if (!n) {
      const i = Object.entries(r).map(
        ([a, h]) => `adapter ${a} ` + (h === !1 ? "is not supported by the environment" : "is not available in the build")
      );
      let o = e ? i.length > 1 ? `since :
` + i.map(rt).join(`
`) : " " + rt(i[0]) : "as no adapter specified";
      throw new m(
        "There is no suitable adapter to dispatch the request " + o,
        "ERR_NOT_SUPPORT"
      );
    }
    return n;
  },
  adapters: Ne
};
function Re(s) {
  if (s.cancelToken && s.cancelToken.throwIfRequested(), s.signal && s.signal.aborted)
    throw new W(null, s);
}
function it(s) {
  return Re(s), s.headers = C.from(s.headers), s.data = ke.call(
    s,
    s.transformRequest
  ), ["post", "put", "patch"].indexOf(s.method) !== -1 && s.headers.setContentType("application/x-www-form-urlencoded", !1), Bt.getAdapter(s.adapter || G.adapter)(s).then(function(n) {
    return Re(s), n.data = ke.call(
      s,
      s.transformResponse,
      n
    ), n.headers = C.from(n.headers), n;
  }, function(n) {
    return Tt(n) || (Re(s), n && n.response && (n.response.data = ke.call(
      s,
      s.transformResponse,
      n.response
    ), n.response.headers = C.from(n.response.headers))), Promise.reject(n);
  });
}
const Pt = "1.9.0", _e = {};
["object", "boolean", "number", "function", "string", "symbol"].forEach((s, e) => {
  _e[s] = function(n) {
    return typeof n === s || "a" + (e < 1 ? "n " : " ") + s;
  };
});
const ot = {};
_e.transitional = function(e, t, n) {
  function r(i, o) {
    return "[Axios v" + Pt + "] Transitional option '" + i + "'" + o + (n ? ". " + n : "");
  }
  return (i, o, a) => {
    if (e === !1)
      throw new m(
        r(o, " has been removed" + (t ? " in " + t : "")),
        m.ERR_DEPRECATED
      );
    return t && !ot[o] && (ot[o] = !0, console.warn(
      r(
        o,
        " has been deprecated since v" + t + " and will be removed in the near future"
      )
    )), e ? e(i, o, a) : !0;
  };
};
_e.spelling = function(e) {
  return (t, n) => (console.warn(`${n} is likely a misspelling of ${e}`), !0);
};
function On(s, e, t) {
  if (typeof s != "object")
    throw new m("options must be an object", m.ERR_BAD_OPTION_VALUE);
  const n = Object.keys(s);
  let r = n.length;
  for (; r-- > 0; ) {
    const i = n[r], o = e[i];
    if (o) {
      const a = s[i], h = a === void 0 || o(a, i, s);
      if (h !== !0)
        throw new m("option " + i + " must be " + h, m.ERR_BAD_OPTION_VALUE);
      continue;
    }
    if (t !== !0)
      throw new m("Unknown option " + i, m.ERR_BAD_OPTION);
  }
}
const re = {
  assertOptions: On,
  validators: _e
}, B = re.validators;
let I = class {
  constructor(e) {
    this.defaults = e || {}, this.interceptors = {
      request: new Qe(),
      response: new Qe()
    };
  }
  /**
   * Dispatch a request
   *
   * @param {String|Object} configOrUrl The config specific for this request (merged with this.defaults)
   * @param {?Object} config
   *
   * @returns {Promise} The Promise to be fulfilled
   */
  async request(e, t) {
    try {
      return await this._request(e, t);
    } catch (n) {
      if (n instanceof Error) {
        let r = {};
        Error.captureStackTrace ? Error.captureStackTrace(r) : r = new Error();
        const i = r.stack ? r.stack.replace(/^.+\n/, "") : "";
        try {
          n.stack ? i && !String(n.stack).endsWith(i.replace(/^.+\n.+\n/, "")) && (n.stack += `
` + i) : n.stack = i;
        } catch {
        }
      }
      throw n;
    }
  }
  _request(e, t) {
    typeof e == "string" ? (t = t || {}, t.url = e) : t = e || {}, t = j(this.defaults, t);
    const { transitional: n, paramsSerializer: r, headers: i } = t;
    n !== void 0 && re.assertOptions(n, {
      silentJSONParsing: B.transitional(B.boolean),
      forcedJSONParsing: B.transitional(B.boolean),
      clarifyTimeoutError: B.transitional(B.boolean)
    }, !1), r != null && (c.isFunction(r) ? t.paramsSerializer = {
      serialize: r
    } : re.assertOptions(r, {
      encode: B.function,
      serialize: B.function
    }, !0)), t.allowAbsoluteUrls !== void 0 || (this.defaults.allowAbsoluteUrls !== void 0 ? t.allowAbsoluteUrls = this.defaults.allowAbsoluteUrls : t.allowAbsoluteUrls = !0), re.assertOptions(t, {
      baseUrl: B.spelling("baseURL"),
      withXsrfToken: B.spelling("withXSRFToken")
    }, !0), t.method = (t.method || this.defaults.method || "get").toLowerCase();
    let o = i && c.merge(
      i.common,
      i[t.method]
    );
    i && c.forEach(
      ["delete", "get", "head", "post", "put", "patch", "common"],
      (d) => {
        delete i[d];
      }
    ), t.headers = C.concat(o, i);
    const a = [];
    let h = !0;
    this.interceptors.request.forEach(function(y) {
      typeof y.runWhen == "function" && y.runWhen(t) === !1 || (h = h && y.synchronous, a.unshift(y.fulfilled, y.rejected));
    });
    const l = [];
    this.interceptors.response.forEach(function(y) {
      l.push(y.fulfilled, y.rejected);
    });
    let u, f = 0, w;
    if (!h) {
      const d = [it.bind(this), void 0];
      for (d.unshift.apply(d, a), d.push.apply(d, l), w = d.length, u = Promise.resolve(t); f < w; )
        u = u.then(d[f++], d[f++]);
      return u;
    }
    w = a.length;
    let R = t;
    for (f = 0; f < w; ) {
      const d = a[f++], y = a[f++];
      try {
        R = d(R);
      } catch (p) {
        y.call(this, p);
        break;
      }
    }
    try {
      u = it.call(this, R);
    } catch (d) {
      return Promise.reject(d);
    }
    for (f = 0, w = l.length; f < w; )
      u = u.then(l[f++], l[f++]);
    return u;
  }
  getUri(e) {
    e = j(this.defaults, e);
    const t = Ct(e.baseURL, e.url, e.allowAbsoluteUrls);
    return vt(t, e.params, e.paramsSerializer);
  }
};
c.forEach(["delete", "get", "head", "options"], function(e) {
  I.prototype[e] = function(t, n) {
    return this.request(j(n || {}, {
      method: e,
      url: t,
      data: (n || {}).data
    }));
  };
});
c.forEach(["post", "put", "patch"], function(e) {
  function t(n) {
    return function(i, o, a) {
      return this.request(j(a || {}, {
        method: e,
        headers: n ? {
          "Content-Type": "multipart/form-data"
        } : {},
        url: i,
        data: o
      }));
    };
  }
  I.prototype[e] = t(), I.prototype[e + "Form"] = t(!0);
});
let Cn = class Ut {
  constructor(e) {
    if (typeof e != "function")
      throw new TypeError("executor must be a function.");
    let t;
    this.promise = new Promise(function(i) {
      t = i;
    });
    const n = this;
    this.promise.then((r) => {
      if (!n._listeners) return;
      let i = n._listeners.length;
      for (; i-- > 0; )
        n._listeners[i](r);
      n._listeners = null;
    }), this.promise.then = (r) => {
      let i;
      const o = new Promise((a) => {
        n.subscribe(a), i = a;
      }).then(r);
      return o.cancel = function() {
        n.unsubscribe(i);
      }, o;
    }, e(function(i, o, a) {
      n.reason || (n.reason = new W(i, o, a), t(n.reason));
    });
  }
  /**
   * Throws a `CanceledError` if cancellation has been requested.
   */
  throwIfRequested() {
    if (this.reason)
      throw this.reason;
  }
  /**
   * Subscribe to the cancel signal
   */
  subscribe(e) {
    if (this.reason) {
      e(this.reason);
      return;
    }
    this._listeners ? this._listeners.push(e) : this._listeners = [e];
  }
  /**
   * Unsubscribe from the cancel signal
   */
  unsubscribe(e) {
    if (!this._listeners)
      return;
    const t = this._listeners.indexOf(e);
    t !== -1 && this._listeners.splice(t, 1);
  }
  toAbortSignal() {
    const e = new AbortController(), t = (n) => {
      e.abort(n);
    };
    return this.subscribe(t), e.signal.unsubscribe = () => this.unsubscribe(t), e.signal;
  }
  /**
   * Returns an object that contains a new `CancelToken` and a function that, when called,
   * cancels the `CancelToken`.
   */
  static source() {
    let e;
    return {
      token: new Ut(function(r) {
        e = r;
      }),
      cancel: e
    };
  }
};
function xn(s) {
  return function(t) {
    return s.apply(null, t);
  };
}
function Nn(s) {
  return c.isObject(s) && s.isAxiosError === !0;
}
const Le = {
  Continue: 100,
  SwitchingProtocols: 101,
  Processing: 102,
  EarlyHints: 103,
  Ok: 200,
  Created: 201,
  Accepted: 202,
  NonAuthoritativeInformation: 203,
  NoContent: 204,
  ResetContent: 205,
  PartialContent: 206,
  MultiStatus: 207,
  AlreadyReported: 208,
  ImUsed: 226,
  MultipleChoices: 300,
  MovedPermanently: 301,
  Found: 302,
  SeeOther: 303,
  NotModified: 304,
  UseProxy: 305,
  Unused: 306,
  TemporaryRedirect: 307,
  PermanentRedirect: 308,
  BadRequest: 400,
  Unauthorized: 401,
  PaymentRequired: 402,
  Forbidden: 403,
  NotFound: 404,
  MethodNotAllowed: 405,
  NotAcceptable: 406,
  ProxyAuthenticationRequired: 407,
  RequestTimeout: 408,
  Conflict: 409,
  Gone: 410,
  LengthRequired: 411,
  PreconditionFailed: 412,
  PayloadTooLarge: 413,
  UriTooLong: 414,
  UnsupportedMediaType: 415,
  RangeNotSatisfiable: 416,
  ExpectationFailed: 417,
  ImATeapot: 418,
  MisdirectedRequest: 421,
  UnprocessableEntity: 422,
  Locked: 423,
  FailedDependency: 424,
  TooEarly: 425,
  UpgradeRequired: 426,
  PreconditionRequired: 428,
  TooManyRequests: 429,
  RequestHeaderFieldsTooLarge: 431,
  UnavailableForLegalReasons: 451,
  InternalServerError: 500,
  NotImplemented: 501,
  BadGateway: 502,
  ServiceUnavailable: 503,
  GatewayTimeout: 504,
  HttpVersionNotSupported: 505,
  VariantAlsoNegotiates: 506,
  InsufficientStorage: 507,
  LoopDetected: 508,
  NotExtended: 510,
  NetworkAuthenticationRequired: 511
};
Object.entries(Le).forEach(([s, e]) => {
  Le[e] = s;
});
function Dt(s) {
  const e = new I(s), t = ft(I.prototype.request, e);
  return c.extend(t, I.prototype, e, { allOwnKeys: !0 }), c.extend(t, e, null, { allOwnKeys: !0 }), t.create = function(r) {
    return Dt(j(s, r));
  }, t;
}
const E = Dt(G);
E.Axios = I;
E.CanceledError = W;
E.CancelToken = Cn;
E.isCancel = Tt;
E.VERSION = Pt;
E.toFormData = ye;
E.AxiosError = m;
E.Cancel = E.CanceledError;
E.all = function(e) {
  return Promise.all(e);
};
E.spread = xn;
E.isAxiosError = Nn;
E.mergeConfig = j;
E.AxiosHeaders = C;
E.formToJSON = (s) => At(c.isHTMLForm(s) ? new FormData(s) : s);
E.getAdapter = Bt.getAdapter;
E.HttpStatusCode = Le;
E.default = E;
const {
  Axios: Lr,
  AxiosError: Br,
  CanceledError: Pr,
  isCancel: Ur,
  CancelToken: Dr,
  VERSION: qr,
  all: Fr,
  Cancel: Mr,
  isAxiosError: Ir,
  spread: jr,
  toFormData: $r,
  AxiosHeaders: Hr,
  HttpStatusCode: Vr,
  formToJSON: Wr,
  getAdapter: zr,
  mergeConfig: Jr
} = E;
class Ln {
  constructor(e, t) {
    g(this, "id", "device");
    g(this, "qrcode", null);
    g(this, "device_status", null);
    g(this, "all_info", null);
    this.wavoip_socket = e, this.device_token = t, this.wavoip_socket.bindListener("qrcode", {
      id: this.id,
      fn: (n) => {
        this.qrcode = n;
      }
    }), this.wavoip_socket.bindListener("device_status", {
      id: this.id,
      fn: (n) => {
        this.device_status = n;
      }
    }), this.wakeUp(), this.getCurrentQRCode(), this.getCurrentDeviceStatus();
  }
  checkCanCall() {
    if (this.device_status === "error")
      throw new Error("Erro no dispositivo");
    if (this.device_status === "connecting")
      throw new Error("É preciso vincular um número ao dispositivo");
    if (!this.device_status)
      throw new Error("Dispositivo não está pronto para ligar");
  }
  getCurrentQRCode() {
    new Promise((e, t) => {
      try {
        this.wavoip_socket.emit("whatsapp:qrcode", (n) => {
          this.qrcode = n, e(n);
        });
      } catch (n) {
        t(n);
      }
    });
  }
  getCurrentDeviceStatus() {
    return new Promise((e, t) => {
      try {
        this.wavoip_socket.emit(
          "whatsapp:device_status",
          (n) => {
            this.device_status = n, e(n);
          }
        );
      } catch (n) {
        t(n);
      }
    });
  }
  async wakeUp() {
    return E.get(
      `https://devices.wavoip.com/${this.device_token}/whatsapp/all_info`
    );
  }
}
class Bn {
  constructor(e, t) {
    g(this, "id", "microphone");
    g(this, "audio_context", new (window.AudioContext || window.webkitAudioContext)());
    g(this, "mic_stream", null);
    g(this, "mic_source", null);
    g(this, "microphones_devices_list", []);
    this.wavoip_socket = e, this.audio_socket = t, this.wavoip_socket.bindListener("audio_transport:create", {
      id: this.id,
      fn: () => {
        this.start(), this.checkError();
      }
    }), this.wavoip_socket.bindListener("audio_transport:terminate", {
      id: this.id,
      fn: () => this.stop()
    }), document.addEventListener("click", () => {
      var n;
      (n = this.audio_context) == null || n.resume().catch(() => {
        console.error("[*] - Error to get microphone access");
      });
    }), this.fetchMicrophones(), navigator.mediaDevices.addEventListener(
      "devicechange",
      this.fetchMicrophones
    );
  }
  async start() {
    if (!this.audio_context) return;
    await this.audio_context.audioWorklet.addModule(
      "/worklets/microphone/AudioWorkletMic.js"
    ), this.mic_stream = await navigator.mediaDevices.getUserMedia({
      audio: !0
    }), this.mic_source = this.audio_context.createMediaStreamSource(
      this.mic_stream
    );
    const e = new AudioWorkletNode(
      this.audio_context,
      "resample-processor",
      {
        processorOptions: {
          sampleRate: this.audio_context.sampleRate
        }
      }
    );
    e.port.onmessage = (t) => {
      this.audio_socket.socket_is_ready && this.audio_socket.emit(t.data);
    }, this.mic_source.connect(e);
  }
  async stop() {
    if (this.mic_source && (this.mic_source.disconnect(), this.mic_source = null), this.mic_stream) {
      for (const e of this.mic_stream.getTracks())
        e.stop();
      this.mic_stream = null;
    }
    this.audio_context && (this.audio_context.close(), this.audio_context = null);
  }
  async fetchMicrophones() {
    try {
      this.microphones_devices_list = await navigator.mediaDevices.enumerateDevices().then(
        (e) => e.filter((t) => t.kind === "audioinput").map((t) => ({
          label: t.label || "Unnamed Microphone",
          deviceId: t.deviceId
        }))
      );
    } catch (e) {
      console.error("Error fetching microphones:", e);
    }
  }
  async requestMicrophonePermission() {
    try {
      const e = await navigator.mediaDevices.getUserMedia({
        audio: !0
      });
      for (const t of e.getTracks())
        t.stop();
    } catch (e) {
      if (e instanceof Error)
        throw e.name === "NotAllowedError" ? new Error("Permissão para o microfone foi negada.") : e.name === "NotFoundError" ? new Error(
          "Nenhum microfone disponível no dispositivo."
        ) : e;
    }
  }
  async checkMicrophonePermission() {
    const e = await navigator.permissions.query({
      name: "microphone"
    });
    return e.state === "prompt" && await this.requestMicrophonePermission(), e.state;
  }
  async checkError() {
    var t;
    const e = await this.checkMicrophonePermission();
    return this.microphones_devices_list.length === 0 ? {
      type: "no_microphone_available",
      message: "Não há microfone disponivel para uso"
    } : e !== "granted" ? {
      type: "no_microphone_permission",
      message: "Sem permissão para acessar o microfone"
    } : this.audio_context && this.audio_context.state !== "running" ? {
      type: "audio_context",
      message: "Não foi possível obter acesso ao microfone"
    } : navigator.userActivation.hasBeenActive && ((t = this.audio_context) == null ? void 0 : t.state) !== "running" ? {
      type: "audio_context",
      message: "Você precisa interagir com a página para liberar a permissão do microfone"
    } : null;
  }
}
class Pn {
  constructor(e, t) {
    g(this, "id", "audio_socket");
    g(this, "socket", null);
    g(this, "listeners", []);
    g(this, "RECONNECT_CODES", [1001, 1006, 1011, 1015]);
    g(this, "socket_is_ready", !1);
    this.device_token = e, this.wavoip_socket = t, this.wavoip_socket.bindListener("audio_transport:create", {
      id: this.id,
      fn: (n) => {
        const r = `wss://${n.ip}:${n.port}?token=${this.device_token}`;
        this.start(r);
      }
    }), this.wavoip_socket.bindListener("audio_transport:terminate", {
      id: this.id,
      fn: () => {
        this.stop();
      }
    }), this.wavoip_socket.bindListener("calls:error", {
      id: this.id,
      fn: () => {
        this.stop();
      }
    });
  }
  callListeners(e) {
    for (const t of this.listeners)
      t.fn(e);
  }
  bindListener(e) {
    for (const { id: t } of this.listeners)
      if (t === e.id) return !1;
    this.listeners.push(e);
  }
  checkListenerExists(e) {
    return !!this.listeners.find((t) => t.id === e);
  }
  emit(e) {
    var t;
    (t = this.socket) == null || t.send(e);
  }
  start(e) {
    console.log("Connecting audio"), this.socket = new WebSocket(e), this.socket.binaryType = "arraybuffer", this.socket.addEventListener("open", () => {
      this.socket_is_ready = !0;
    }), this.socket.addEventListener("message", (t) => {
      this.callListeners(t.data);
    }), this.socket.addEventListener("error", () => {
      this.socket_is_ready = !1;
    }), this.socket.addEventListener("close", (t) => {
      this.socket_is_ready = !1, this.RECONNECT_CODES.includes(t.code) && setTimeout(() => {
        this.start(e);
      }, 1e3);
    });
  }
  stop() {
    var e;
    (e = this.socket) == null || e.close(), this.socket = null;
  }
  removeListener(e) {
    this.listeners = this.listeners.filter(
      (t) => t.id !== e
    );
  }
}
const P = /* @__PURE__ */ Object.create(null);
P.open = "0";
P.close = "1";
P.ping = "2";
P.pong = "3";
P.message = "4";
P.upgrade = "5";
P.noop = "6";
const ie = /* @__PURE__ */ Object.create(null);
Object.keys(P).forEach((s) => {
  ie[P[s]] = s;
});
const Be = { type: "error", data: "parser error" }, qt = typeof Blob == "function" || typeof Blob < "u" && Object.prototype.toString.call(Blob) === "[object BlobConstructor]", Ft = typeof ArrayBuffer == "function", Mt = (s) => typeof ArrayBuffer.isView == "function" ? ArrayBuffer.isView(s) : s && s.buffer instanceof ArrayBuffer, $e = ({ type: s, data: e }, t, n) => qt && e instanceof Blob ? t ? n(e) : at(e, n) : Ft && (e instanceof ArrayBuffer || Mt(e)) ? t ? n(e) : at(new Blob([e]), n) : n(P[s] + (e || "")), at = (s, e) => {
  const t = new FileReader();
  return t.onload = function() {
    const n = t.result.split(",")[1];
    e("b" + (n || ""));
  }, t.readAsDataURL(s);
};
function ct(s) {
  return s instanceof Uint8Array ? s : s instanceof ArrayBuffer ? new Uint8Array(s) : new Uint8Array(s.buffer, s.byteOffset, s.byteLength);
}
let ve;
function Un(s, e) {
  if (qt && s.data instanceof Blob)
    return s.data.arrayBuffer().then(ct).then(e);
  if (Ft && (s.data instanceof ArrayBuffer || Mt(s.data)))
    return e(ct(s.data));
  $e(s, !1, (t) => {
    ve || (ve = new TextEncoder()), e(ve.encode(t));
  });
}
const ut = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", X = typeof Uint8Array > "u" ? [] : new Uint8Array(256);
for (let s = 0; s < ut.length; s++)
  X[ut.charCodeAt(s)] = s;
const Dn = (s) => {
  let e = s.length * 0.75, t = s.length, n, r = 0, i, o, a, h;
  s[s.length - 1] === "=" && (e--, s[s.length - 2] === "=" && e--);
  const l = new ArrayBuffer(e), u = new Uint8Array(l);
  for (n = 0; n < t; n += 4)
    i = X[s.charCodeAt(n)], o = X[s.charCodeAt(n + 1)], a = X[s.charCodeAt(n + 2)], h = X[s.charCodeAt(n + 3)], u[r++] = i << 2 | o >> 4, u[r++] = (o & 15) << 4 | a >> 2, u[r++] = (a & 3) << 6 | h & 63;
  return l;
}, qn = typeof ArrayBuffer == "function", He = (s, e) => {
  if (typeof s != "string")
    return {
      type: "message",
      data: It(s, e)
    };
  const t = s.charAt(0);
  return t === "b" ? {
    type: "message",
    data: Fn(s.substring(1), e)
  } : ie[t] ? s.length > 1 ? {
    type: ie[t],
    data: s.substring(1)
  } : {
    type: ie[t]
  } : Be;
}, Fn = (s, e) => {
  if (qn) {
    const t = Dn(s);
    return It(t, e);
  } else
    return { base64: !0, data: s };
}, It = (s, e) => {
  switch (e) {
    case "blob":
      return s instanceof Blob ? s : new Blob([s]);
    case "arraybuffer":
    default:
      return s instanceof ArrayBuffer ? s : s.buffer;
  }
}, jt = "", Mn = (s, e) => {
  const t = s.length, n = new Array(t);
  let r = 0;
  s.forEach((i, o) => {
    $e(i, !1, (a) => {
      n[o] = a, ++r === t && e(n.join(jt));
    });
  });
}, In = (s, e) => {
  const t = s.split(jt), n = [];
  for (let r = 0; r < t.length; r++) {
    const i = He(t[r], e);
    if (n.push(i), i.type === "error")
      break;
  }
  return n;
};
function jn() {
  return new TransformStream({
    transform(s, e) {
      Un(s, (t) => {
        const n = t.length;
        let r;
        if (n < 126)
          r = new Uint8Array(1), new DataView(r.buffer).setUint8(0, n);
        else if (n < 65536) {
          r = new Uint8Array(3);
          const i = new DataView(r.buffer);
          i.setUint8(0, 126), i.setUint16(1, n);
        } else {
          r = new Uint8Array(9);
          const i = new DataView(r.buffer);
          i.setUint8(0, 127), i.setBigUint64(1, BigInt(n));
        }
        s.data && typeof s.data != "string" && (r[0] |= 128), e.enqueue(r), e.enqueue(t);
      });
    }
  });
}
let Se;
function ee(s) {
  return s.reduce((e, t) => e + t.length, 0);
}
function te(s, e) {
  if (s[0].length === e)
    return s.shift();
  const t = new Uint8Array(e);
  let n = 0;
  for (let r = 0; r < e; r++)
    t[r] = s[0][n++], n === s[0].length && (s.shift(), n = 0);
  return s.length && n < s[0].length && (s[0] = s[0].slice(n)), t;
}
function $n(s, e) {
  Se || (Se = new TextDecoder());
  const t = [];
  let n = 0, r = -1, i = !1;
  return new TransformStream({
    transform(o, a) {
      for (t.push(o); ; ) {
        if (n === 0) {
          if (ee(t) < 1)
            break;
          const h = te(t, 1);
          i = (h[0] & 128) === 128, r = h[0] & 127, r < 126 ? n = 3 : r === 126 ? n = 1 : n = 2;
        } else if (n === 1) {
          if (ee(t) < 2)
            break;
          const h = te(t, 2);
          r = new DataView(h.buffer, h.byteOffset, h.length).getUint16(0), n = 3;
        } else if (n === 2) {
          if (ee(t) < 8)
            break;
          const h = te(t, 8), l = new DataView(h.buffer, h.byteOffset, h.length), u = l.getUint32(0);
          if (u > Math.pow(2, 21) - 1) {
            a.enqueue(Be);
            break;
          }
          r = u * Math.pow(2, 32) + l.getUint32(4), n = 3;
        } else {
          if (ee(t) < r)
            break;
          const h = te(t, r);
          a.enqueue(He(i ? h : Se.decode(h), e)), n = 0;
        }
        if (r === 0 || r > s) {
          a.enqueue(Be);
          break;
        }
      }
    }
  });
}
const $t = 4;
function k(s) {
  if (s) return Hn(s);
}
function Hn(s) {
  for (var e in k.prototype)
    s[e] = k.prototype[e];
  return s;
}
k.prototype.on = k.prototype.addEventListener = function(s, e) {
  return this._callbacks = this._callbacks || {}, (this._callbacks["$" + s] = this._callbacks["$" + s] || []).push(e), this;
};
k.prototype.once = function(s, e) {
  function t() {
    this.off(s, t), e.apply(this, arguments);
  }
  return t.fn = e, this.on(s, t), this;
};
k.prototype.off = k.prototype.removeListener = k.prototype.removeAllListeners = k.prototype.removeEventListener = function(s, e) {
  if (this._callbacks = this._callbacks || {}, arguments.length == 0)
    return this._callbacks = {}, this;
  var t = this._callbacks["$" + s];
  if (!t) return this;
  if (arguments.length == 1)
    return delete this._callbacks["$" + s], this;
  for (var n, r = 0; r < t.length; r++)
    if (n = t[r], n === e || n.fn === e) {
      t.splice(r, 1);
      break;
    }
  return t.length === 0 && delete this._callbacks["$" + s], this;
};
k.prototype.emit = function(s) {
  this._callbacks = this._callbacks || {};
  for (var e = new Array(arguments.length - 1), t = this._callbacks["$" + s], n = 1; n < arguments.length; n++)
    e[n - 1] = arguments[n];
  if (t) {
    t = t.slice(0);
    for (var n = 0, r = t.length; n < r; ++n)
      t[n].apply(this, e);
  }
  return this;
};
k.prototype.emitReserved = k.prototype.emit;
k.prototype.listeners = function(s) {
  return this._callbacks = this._callbacks || {}, this._callbacks["$" + s] || [];
};
k.prototype.hasListeners = function(s) {
  return !!this.listeners(s).length;
};
const we = typeof Promise == "function" && typeof Promise.resolve == "function" ? (e) => Promise.resolve().then(e) : (e, t) => t(e, 0), x = typeof self < "u" ? self : typeof window < "u" ? window : Function("return this")(), Vn = "arraybuffer";
function Ht(s, ...e) {
  return e.reduce((t, n) => (s.hasOwnProperty(n) && (t[n] = s[n]), t), {});
}
const Wn = x.setTimeout, zn = x.clearTimeout;
function be(s, e) {
  e.useNativeTimers ? (s.setTimeoutFn = Wn.bind(x), s.clearTimeoutFn = zn.bind(x)) : (s.setTimeoutFn = x.setTimeout.bind(x), s.clearTimeoutFn = x.clearTimeout.bind(x));
}
const Jn = 1.33;
function Kn(s) {
  return typeof s == "string" ? Xn(s) : Math.ceil((s.byteLength || s.size) * Jn);
}
function Xn(s) {
  let e = 0, t = 0;
  for (let n = 0, r = s.length; n < r; n++)
    e = s.charCodeAt(n), e < 128 ? t += 1 : e < 2048 ? t += 2 : e < 55296 || e >= 57344 ? t += 3 : (n++, t += 4);
  return t;
}
function Vt() {
  return Date.now().toString(36).substring(3) + Math.random().toString(36).substring(2, 5);
}
function Yn(s) {
  let e = "";
  for (let t in s)
    s.hasOwnProperty(t) && (e.length && (e += "&"), e += encodeURIComponent(t) + "=" + encodeURIComponent(s[t]));
  return e;
}
function Qn(s) {
  let e = {}, t = s.split("&");
  for (let n = 0, r = t.length; n < r; n++) {
    let i = t[n].split("=");
    e[decodeURIComponent(i[0])] = decodeURIComponent(i[1]);
  }
  return e;
}
class Gn extends Error {
  constructor(e, t, n) {
    super(e), this.description = t, this.context = n, this.type = "TransportError";
  }
}
class Ve extends k {
  /**
   * Transport abstract constructor.
   *
   * @param {Object} opts - options
   * @protected
   */
  constructor(e) {
    super(), this.writable = !1, be(this, e), this.opts = e, this.query = e.query, this.socket = e.socket, this.supportsBinary = !e.forceBase64;
  }
  /**
   * Emits an error.
   *
   * @param {String} reason
   * @param description
   * @param context - the error context
   * @return {Transport} for chaining
   * @protected
   */
  onError(e, t, n) {
    return super.emitReserved("error", new Gn(e, t, n)), this;
  }
  /**
   * Opens the transport.
   */
  open() {
    return this.readyState = "opening", this.doOpen(), this;
  }
  /**
   * Closes the transport.
   */
  close() {
    return (this.readyState === "opening" || this.readyState === "open") && (this.doClose(), this.onClose()), this;
  }
  /**
   * Sends multiple packets.
   *
   * @param {Array} packets
   */
  send(e) {
    this.readyState === "open" && this.write(e);
  }
  /**
   * Called upon open
   *
   * @protected
   */
  onOpen() {
    this.readyState = "open", this.writable = !0, super.emitReserved("open");
  }
  /**
   * Called with data.
   *
   * @param {String} data
   * @protected
   */
  onData(e) {
    const t = He(e, this.socket.binaryType);
    this.onPacket(t);
  }
  /**
   * Called with a decoded packet.
   *
   * @protected
   */
  onPacket(e) {
    super.emitReserved("packet", e);
  }
  /**
   * Called upon close.
   *
   * @protected
   */
  onClose(e) {
    this.readyState = "closed", super.emitReserved("close", e);
  }
  /**
   * Pauses the transport, in order not to lose packets during an upgrade.
   *
   * @param onPause
   */
  pause(e) {
  }
  createUri(e, t = {}) {
    return e + "://" + this._hostname() + this._port() + this.opts.path + this._query(t);
  }
  _hostname() {
    const e = this.opts.hostname;
    return e.indexOf(":") === -1 ? e : "[" + e + "]";
  }
  _port() {
    return this.opts.port && (this.opts.secure && +(this.opts.port !== 443) || !this.opts.secure && Number(this.opts.port) !== 80) ? ":" + this.opts.port : "";
  }
  _query(e) {
    const t = Yn(e);
    return t.length ? "?" + t : "";
  }
}
class Zn extends Ve {
  constructor() {
    super(...arguments), this._polling = !1;
  }
  get name() {
    return "polling";
  }
  /**
   * Opens the socket (triggers polling). We write a PING message to determine
   * when the transport is open.
   *
   * @protected
   */
  doOpen() {
    this._poll();
  }
  /**
   * Pauses polling.
   *
   * @param {Function} onPause - callback upon buffers are flushed and transport is paused
   * @package
   */
  pause(e) {
    this.readyState = "pausing";
    const t = () => {
      this.readyState = "paused", e();
    };
    if (this._polling || !this.writable) {
      let n = 0;
      this._polling && (n++, this.once("pollComplete", function() {
        --n || t();
      })), this.writable || (n++, this.once("drain", function() {
        --n || t();
      }));
    } else
      t();
  }
  /**
   * Starts polling cycle.
   *
   * @private
   */
  _poll() {
    this._polling = !0, this.doPoll(), this.emitReserved("poll");
  }
  /**
   * Overloads onData to detect payloads.
   *
   * @protected
   */
  onData(e) {
    const t = (n) => {
      if (this.readyState === "opening" && n.type === "open" && this.onOpen(), n.type === "close")
        return this.onClose({ description: "transport closed by the server" }), !1;
      this.onPacket(n);
    };
    In(e, this.socket.binaryType).forEach(t), this.readyState !== "closed" && (this._polling = !1, this.emitReserved("pollComplete"), this.readyState === "open" && this._poll());
  }
  /**
   * For polling, send a close packet.
   *
   * @protected
   */
  doClose() {
    const e = () => {
      this.write([{ type: "close" }]);
    };
    this.readyState === "open" ? e() : this.once("open", e);
  }
  /**
   * Writes a packets payload.
   *
   * @param {Array} packets - data packets
   * @protected
   */
  write(e) {
    this.writable = !1, Mn(e, (t) => {
      this.doWrite(t, () => {
        this.writable = !0, this.emitReserved("drain");
      });
    });
  }
  /**
   * Generates uri for connection.
   *
   * @private
   */
  uri() {
    const e = this.opts.secure ? "https" : "http", t = this.query || {};
    return this.opts.timestampRequests !== !1 && (t[this.opts.timestampParam] = Vt()), !this.supportsBinary && !t.sid && (t.b64 = 1), this.createUri(e, t);
  }
}
let Wt = !1;
try {
  Wt = typeof XMLHttpRequest < "u" && "withCredentials" in new XMLHttpRequest();
} catch {
}
const er = Wt;
function tr() {
}
class sr extends Zn {
  /**
   * XHR Polling constructor.
   *
   * @param {Object} opts
   * @package
   */
  constructor(e) {
    if (super(e), typeof location < "u") {
      const t = location.protocol === "https:";
      let n = location.port;
      n || (n = t ? "443" : "80"), this.xd = typeof location < "u" && e.hostname !== location.hostname || n !== e.port;
    }
  }
  /**
   * Sends data.
   *
   * @param {String} data to send.
   * @param {Function} called upon flush.
   * @private
   */
  doWrite(e, t) {
    const n = this.request({
      method: "POST",
      data: e
    });
    n.on("success", t), n.on("error", (r, i) => {
      this.onError("xhr post error", r, i);
    });
  }
  /**
   * Starts a poll cycle.
   *
   * @private
   */
  doPoll() {
    const e = this.request();
    e.on("data", this.onData.bind(this)), e.on("error", (t, n) => {
      this.onError("xhr poll error", t, n);
    }), this.pollXhr = e;
  }
}
let H = class oe extends k {
  /**
   * Request constructor
   *
   * @param {Object} options
   * @package
   */
  constructor(e, t, n) {
    super(), this.createRequest = e, be(this, n), this._opts = n, this._method = n.method || "GET", this._uri = t, this._data = n.data !== void 0 ? n.data : null, this._create();
  }
  /**
   * Creates the XHR object and sends the request.
   *
   * @private
   */
  _create() {
    var e;
    const t = Ht(this._opts, "agent", "pfx", "key", "passphrase", "cert", "ca", "ciphers", "rejectUnauthorized", "autoUnref");
    t.xdomain = !!this._opts.xd;
    const n = this._xhr = this.createRequest(t);
    try {
      n.open(this._method, this._uri, !0);
      try {
        if (this._opts.extraHeaders) {
          n.setDisableHeaderCheck && n.setDisableHeaderCheck(!0);
          for (let r in this._opts.extraHeaders)
            this._opts.extraHeaders.hasOwnProperty(r) && n.setRequestHeader(r, this._opts.extraHeaders[r]);
        }
      } catch {
      }
      if (this._method === "POST")
        try {
          n.setRequestHeader("Content-type", "text/plain;charset=UTF-8");
        } catch {
        }
      try {
        n.setRequestHeader("Accept", "*/*");
      } catch {
      }
      (e = this._opts.cookieJar) === null || e === void 0 || e.addCookies(n), "withCredentials" in n && (n.withCredentials = this._opts.withCredentials), this._opts.requestTimeout && (n.timeout = this._opts.requestTimeout), n.onreadystatechange = () => {
        var r;
        n.readyState === 3 && ((r = this._opts.cookieJar) === null || r === void 0 || r.parseCookies(
          // @ts-ignore
          n.getResponseHeader("set-cookie")
        )), n.readyState === 4 && (n.status === 200 || n.status === 1223 ? this._onLoad() : this.setTimeoutFn(() => {
          this._onError(typeof n.status == "number" ? n.status : 0);
        }, 0));
      }, n.send(this._data);
    } catch (r) {
      this.setTimeoutFn(() => {
        this._onError(r);
      }, 0);
      return;
    }
    typeof document < "u" && (this._index = oe.requestsCount++, oe.requests[this._index] = this);
  }
  /**
   * Called upon error.
   *
   * @private
   */
  _onError(e) {
    this.emitReserved("error", e, this._xhr), this._cleanup(!0);
  }
  /**
   * Cleans up house.
   *
   * @private
   */
  _cleanup(e) {
    if (!(typeof this._xhr > "u" || this._xhr === null)) {
      if (this._xhr.onreadystatechange = tr, e)
        try {
          this._xhr.abort();
        } catch {
        }
      typeof document < "u" && delete oe.requests[this._index], this._xhr = null;
    }
  }
  /**
   * Called upon load.
   *
   * @private
   */
  _onLoad() {
    const e = this._xhr.responseText;
    e !== null && (this.emitReserved("data", e), this.emitReserved("success"), this._cleanup());
  }
  /**
   * Aborts the request.
   *
   * @package
   */
  abort() {
    this._cleanup();
  }
};
H.requestsCount = 0;
H.requests = {};
if (typeof document < "u") {
  if (typeof attachEvent == "function")
    attachEvent("onunload", lt);
  else if (typeof addEventListener == "function") {
    const s = "onpagehide" in x ? "pagehide" : "unload";
    addEventListener(s, lt, !1);
  }
}
function lt() {
  for (let s in H.requests)
    H.requests.hasOwnProperty(s) && H.requests[s].abort();
}
const nr = function() {
  const s = zt({
    xdomain: !1
  });
  return s && s.responseType !== null;
}();
class rr extends sr {
  constructor(e) {
    super(e);
    const t = e && e.forceBase64;
    this.supportsBinary = nr && !t;
  }
  request(e = {}) {
    return Object.assign(e, { xd: this.xd }, this.opts), new H(zt, this.uri(), e);
  }
}
function zt(s) {
  const e = s.xdomain;
  try {
    if (typeof XMLHttpRequest < "u" && (!e || er))
      return new XMLHttpRequest();
  } catch {
  }
  if (!e)
    try {
      return new x[["Active"].concat("Object").join("X")]("Microsoft.XMLHTTP");
    } catch {
    }
}
const Jt = typeof navigator < "u" && typeof navigator.product == "string" && navigator.product.toLowerCase() === "reactnative";
class ir extends Ve {
  get name() {
    return "websocket";
  }
  doOpen() {
    const e = this.uri(), t = this.opts.protocols, n = Jt ? {} : Ht(this.opts, "agent", "perMessageDeflate", "pfx", "key", "passphrase", "cert", "ca", "ciphers", "rejectUnauthorized", "localAddress", "protocolVersion", "origin", "maxPayload", "family", "checkServerIdentity");
    this.opts.extraHeaders && (n.headers = this.opts.extraHeaders);
    try {
      this.ws = this.createSocket(e, t, n);
    } catch (r) {
      return this.emitReserved("error", r);
    }
    this.ws.binaryType = this.socket.binaryType, this.addEventListeners();
  }
  /**
   * Adds event listeners to the socket
   *
   * @private
   */
  addEventListeners() {
    this.ws.onopen = () => {
      this.opts.autoUnref && this.ws._socket.unref(), this.onOpen();
    }, this.ws.onclose = (e) => this.onClose({
      description: "websocket connection closed",
      context: e
    }), this.ws.onmessage = (e) => this.onData(e.data), this.ws.onerror = (e) => this.onError("websocket error", e);
  }
  write(e) {
    this.writable = !1;
    for (let t = 0; t < e.length; t++) {
      const n = e[t], r = t === e.length - 1;
      $e(n, this.supportsBinary, (i) => {
        try {
          this.doWrite(n, i);
        } catch {
        }
        r && we(() => {
          this.writable = !0, this.emitReserved("drain");
        }, this.setTimeoutFn);
      });
    }
  }
  doClose() {
    typeof this.ws < "u" && (this.ws.onerror = () => {
    }, this.ws.close(), this.ws = null);
  }
  /**
   * Generates uri for connection.
   *
   * @private
   */
  uri() {
    const e = this.opts.secure ? "wss" : "ws", t = this.query || {};
    return this.opts.timestampRequests && (t[this.opts.timestampParam] = Vt()), this.supportsBinary || (t.b64 = 1), this.createUri(e, t);
  }
}
const Ae = x.WebSocket || x.MozWebSocket;
class or extends ir {
  createSocket(e, t, n) {
    return Jt ? new Ae(e, t, n) : t ? new Ae(e, t) : new Ae(e);
  }
  doWrite(e, t) {
    this.ws.send(t);
  }
}
class ar extends Ve {
  get name() {
    return "webtransport";
  }
  doOpen() {
    try {
      this._transport = new WebTransport(this.createUri("https"), this.opts.transportOptions[this.name]);
    } catch (e) {
      return this.emitReserved("error", e);
    }
    this._transport.closed.then(() => {
      this.onClose();
    }).catch((e) => {
      this.onError("webtransport error", e);
    }), this._transport.ready.then(() => {
      this._transport.createBidirectionalStream().then((e) => {
        const t = $n(Number.MAX_SAFE_INTEGER, this.socket.binaryType), n = e.readable.pipeThrough(t).getReader(), r = jn();
        r.readable.pipeTo(e.writable), this._writer = r.writable.getWriter();
        const i = () => {
          n.read().then(({ done: a, value: h }) => {
            a || (this.onPacket(h), i());
          }).catch((a) => {
          });
        };
        i();
        const o = { type: "open" };
        this.query.sid && (o.data = `{"sid":"${this.query.sid}"}`), this._writer.write(o).then(() => this.onOpen());
      });
    });
  }
  write(e) {
    this.writable = !1;
    for (let t = 0; t < e.length; t++) {
      const n = e[t], r = t === e.length - 1;
      this._writer.write(n).then(() => {
        r && we(() => {
          this.writable = !0, this.emitReserved("drain");
        }, this.setTimeoutFn);
      });
    }
  }
  doClose() {
    var e;
    (e = this._transport) === null || e === void 0 || e.close();
  }
}
const cr = {
  websocket: or,
  webtransport: ar,
  polling: rr
}, ur = /^(?:(?![^:@\/?#]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@\/?#]*)(?::([^:@\/?#]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/, lr = [
  "source",
  "protocol",
  "authority",
  "userInfo",
  "user",
  "password",
  "host",
  "port",
  "relative",
  "path",
  "directory",
  "file",
  "query",
  "anchor"
];
function Pe(s) {
  if (s.length > 8e3)
    throw "URI too long";
  const e = s, t = s.indexOf("["), n = s.indexOf("]");
  t != -1 && n != -1 && (s = s.substring(0, t) + s.substring(t, n).replace(/:/g, ";") + s.substring(n, s.length));
  let r = ur.exec(s || ""), i = {}, o = 14;
  for (; o--; )
    i[lr[o]] = r[o] || "";
  return t != -1 && n != -1 && (i.source = e, i.host = i.host.substring(1, i.host.length - 1).replace(/;/g, ":"), i.authority = i.authority.replace("[", "").replace("]", "").replace(/;/g, ":"), i.ipv6uri = !0), i.pathNames = hr(i, i.path), i.queryKey = fr(i, i.query), i;
}
function hr(s, e) {
  const t = /\/{2,9}/g, n = e.replace(t, "/").split("/");
  return (e.slice(0, 1) == "/" || e.length === 0) && n.splice(0, 1), e.slice(-1) == "/" && n.splice(n.length - 1, 1), n;
}
function fr(s, e) {
  const t = {};
  return e.replace(/(?:^|&)([^&=]*)=?([^&]*)/g, function(n, r, i) {
    r && (t[r] = i);
  }), t;
}
const Ue = typeof addEventListener == "function" && typeof removeEventListener == "function", ae = [];
Ue && addEventListener("offline", () => {
  ae.forEach((s) => s());
}, !1);
class q extends k {
  /**
   * Socket constructor.
   *
   * @param {String|Object} uri - uri or options
   * @param {Object} opts - options
   */
  constructor(e, t) {
    if (super(), this.binaryType = Vn, this.writeBuffer = [], this._prevBufferLen = 0, this._pingInterval = -1, this._pingTimeout = -1, this._maxPayload = -1, this._pingTimeoutTime = 1 / 0, e && typeof e == "object" && (t = e, e = null), e) {
      const n = Pe(e);
      t.hostname = n.host, t.secure = n.protocol === "https" || n.protocol === "wss", t.port = n.port, n.query && (t.query = n.query);
    } else t.host && (t.hostname = Pe(t.host).host);
    be(this, t), this.secure = t.secure != null ? t.secure : typeof location < "u" && location.protocol === "https:", t.hostname && !t.port && (t.port = this.secure ? "443" : "80"), this.hostname = t.hostname || (typeof location < "u" ? location.hostname : "localhost"), this.port = t.port || (typeof location < "u" && location.port ? location.port : this.secure ? "443" : "80"), this.transports = [], this._transportsByName = {}, t.transports.forEach((n) => {
      const r = n.prototype.name;
      this.transports.push(r), this._transportsByName[r] = n;
    }), this.opts = Object.assign({
      path: "/engine.io",
      agent: !1,
      withCredentials: !1,
      upgrade: !0,
      timestampParam: "t",
      rememberUpgrade: !1,
      addTrailingSlash: !0,
      rejectUnauthorized: !0,
      perMessageDeflate: {
        threshold: 1024
      },
      transportOptions: {},
      closeOnBeforeunload: !1
    }, t), this.opts.path = this.opts.path.replace(/\/$/, "") + (this.opts.addTrailingSlash ? "/" : ""), typeof this.opts.query == "string" && (this.opts.query = Qn(this.opts.query)), Ue && (this.opts.closeOnBeforeunload && (this._beforeunloadEventListener = () => {
      this.transport && (this.transport.removeAllListeners(), this.transport.close());
    }, addEventListener("beforeunload", this._beforeunloadEventListener, !1)), this.hostname !== "localhost" && (this._offlineEventListener = () => {
      this._onClose("transport close", {
        description: "network connection lost"
      });
    }, ae.push(this._offlineEventListener))), this.opts.withCredentials && (this._cookieJar = void 0), this._open();
  }
  /**
   * Creates transport of the given type.
   *
   * @param {String} name - transport name
   * @return {Transport}
   * @private
   */
  createTransport(e) {
    const t = Object.assign({}, this.opts.query);
    t.EIO = $t, t.transport = e, this.id && (t.sid = this.id);
    const n = Object.assign({}, this.opts, {
      query: t,
      socket: this,
      hostname: this.hostname,
      secure: this.secure,
      port: this.port
    }, this.opts.transportOptions[e]);
    return new this._transportsByName[e](n);
  }
  /**
   * Initializes transport to use and starts probe.
   *
   * @private
   */
  _open() {
    if (this.transports.length === 0) {
      this.setTimeoutFn(() => {
        this.emitReserved("error", "No transports available");
      }, 0);
      return;
    }
    const e = this.opts.rememberUpgrade && q.priorWebsocketSuccess && this.transports.indexOf("websocket") !== -1 ? "websocket" : this.transports[0];
    this.readyState = "opening";
    const t = this.createTransport(e);
    t.open(), this.setTransport(t);
  }
  /**
   * Sets the current transport. Disables the existing one (if any).
   *
   * @private
   */
  setTransport(e) {
    this.transport && this.transport.removeAllListeners(), this.transport = e, e.on("drain", this._onDrain.bind(this)).on("packet", this._onPacket.bind(this)).on("error", this._onError.bind(this)).on("close", (t) => this._onClose("transport close", t));
  }
  /**
   * Called when connection is deemed open.
   *
   * @private
   */
  onOpen() {
    this.readyState = "open", q.priorWebsocketSuccess = this.transport.name === "websocket", this.emitReserved("open"), this.flush();
  }
  /**
   * Handles a packet.
   *
   * @private
   */
  _onPacket(e) {
    if (this.readyState === "opening" || this.readyState === "open" || this.readyState === "closing")
      switch (this.emitReserved("packet", e), this.emitReserved("heartbeat"), e.type) {
        case "open":
          this.onHandshake(JSON.parse(e.data));
          break;
        case "ping":
          this._sendPacket("pong"), this.emitReserved("ping"), this.emitReserved("pong"), this._resetPingTimeout();
          break;
        case "error":
          const t = new Error("server error");
          t.code = e.data, this._onError(t);
          break;
        case "message":
          this.emitReserved("data", e.data), this.emitReserved("message", e.data);
          break;
      }
  }
  /**
   * Called upon handshake completion.
   *
   * @param {Object} data - handshake obj
   * @private
   */
  onHandshake(e) {
    this.emitReserved("handshake", e), this.id = e.sid, this.transport.query.sid = e.sid, this._pingInterval = e.pingInterval, this._pingTimeout = e.pingTimeout, this._maxPayload = e.maxPayload, this.onOpen(), this.readyState !== "closed" && this._resetPingTimeout();
  }
  /**
   * Sets and resets ping timeout timer based on server pings.
   *
   * @private
   */
  _resetPingTimeout() {
    this.clearTimeoutFn(this._pingTimeoutTimer);
    const e = this._pingInterval + this._pingTimeout;
    this._pingTimeoutTime = Date.now() + e, this._pingTimeoutTimer = this.setTimeoutFn(() => {
      this._onClose("ping timeout");
    }, e), this.opts.autoUnref && this._pingTimeoutTimer.unref();
  }
  /**
   * Called on `drain` event
   *
   * @private
   */
  _onDrain() {
    this.writeBuffer.splice(0, this._prevBufferLen), this._prevBufferLen = 0, this.writeBuffer.length === 0 ? this.emitReserved("drain") : this.flush();
  }
  /**
   * Flush write buffers.
   *
   * @private
   */
  flush() {
    if (this.readyState !== "closed" && this.transport.writable && !this.upgrading && this.writeBuffer.length) {
      const e = this._getWritablePackets();
      this.transport.send(e), this._prevBufferLen = e.length, this.emitReserved("flush");
    }
  }
  /**
   * Ensure the encoded size of the writeBuffer is below the maxPayload value sent by the server (only for HTTP
   * long-polling)
   *
   * @private
   */
  _getWritablePackets() {
    if (!(this._maxPayload && this.transport.name === "polling" && this.writeBuffer.length > 1))
      return this.writeBuffer;
    let t = 1;
    for (let n = 0; n < this.writeBuffer.length; n++) {
      const r = this.writeBuffer[n].data;
      if (r && (t += Kn(r)), n > 0 && t > this._maxPayload)
        return this.writeBuffer.slice(0, n);
      t += 2;
    }
    return this.writeBuffer;
  }
  /**
   * Checks whether the heartbeat timer has expired but the socket has not yet been notified.
   *
   * Note: this method is private for now because it does not really fit the WebSocket API, but if we put it in the
   * `write()` method then the message would not be buffered by the Socket.IO client.
   *
   * @return {boolean}
   * @private
   */
  /* private */
  _hasPingExpired() {
    if (!this._pingTimeoutTime)
      return !0;
    const e = Date.now() > this._pingTimeoutTime;
    return e && (this._pingTimeoutTime = 0, we(() => {
      this._onClose("ping timeout");
    }, this.setTimeoutFn)), e;
  }
  /**
   * Sends a message.
   *
   * @param {String} msg - message.
   * @param {Object} options.
   * @param {Function} fn - callback function.
   * @return {Socket} for chaining.
   */
  write(e, t, n) {
    return this._sendPacket("message", e, t, n), this;
  }
  /**
   * Sends a message. Alias of {@link Socket#write}.
   *
   * @param {String} msg - message.
   * @param {Object} options.
   * @param {Function} fn - callback function.
   * @return {Socket} for chaining.
   */
  send(e, t, n) {
    return this._sendPacket("message", e, t, n), this;
  }
  /**
   * Sends a packet.
   *
   * @param {String} type: packet type.
   * @param {String} data.
   * @param {Object} options.
   * @param {Function} fn - callback function.
   * @private
   */
  _sendPacket(e, t, n, r) {
    if (typeof t == "function" && (r = t, t = void 0), typeof n == "function" && (r = n, n = null), this.readyState === "closing" || this.readyState === "closed")
      return;
    n = n || {}, n.compress = n.compress !== !1;
    const i = {
      type: e,
      data: t,
      options: n
    };
    this.emitReserved("packetCreate", i), this.writeBuffer.push(i), r && this.once("flush", r), this.flush();
  }
  /**
   * Closes the connection.
   */
  close() {
    const e = () => {
      this._onClose("forced close"), this.transport.close();
    }, t = () => {
      this.off("upgrade", t), this.off("upgradeError", t), e();
    }, n = () => {
      this.once("upgrade", t), this.once("upgradeError", t);
    };
    return (this.readyState === "opening" || this.readyState === "open") && (this.readyState = "closing", this.writeBuffer.length ? this.once("drain", () => {
      this.upgrading ? n() : e();
    }) : this.upgrading ? n() : e()), this;
  }
  /**
   * Called upon transport error
   *
   * @private
   */
  _onError(e) {
    if (q.priorWebsocketSuccess = !1, this.opts.tryAllTransports && this.transports.length > 1 && this.readyState === "opening")
      return this.transports.shift(), this._open();
    this.emitReserved("error", e), this._onClose("transport error", e);
  }
  /**
   * Called upon transport close.
   *
   * @private
   */
  _onClose(e, t) {
    if (this.readyState === "opening" || this.readyState === "open" || this.readyState === "closing") {
      if (this.clearTimeoutFn(this._pingTimeoutTimer), this.transport.removeAllListeners("close"), this.transport.close(), this.transport.removeAllListeners(), Ue && (this._beforeunloadEventListener && removeEventListener("beforeunload", this._beforeunloadEventListener, !1), this._offlineEventListener)) {
        const n = ae.indexOf(this._offlineEventListener);
        n !== -1 && ae.splice(n, 1);
      }
      this.readyState = "closed", this.id = null, this.emitReserved("close", e, t), this.writeBuffer = [], this._prevBufferLen = 0;
    }
  }
}
q.protocol = $t;
class dr extends q {
  constructor() {
    super(...arguments), this._upgrades = [];
  }
  onOpen() {
    if (super.onOpen(), this.readyState === "open" && this.opts.upgrade)
      for (let e = 0; e < this._upgrades.length; e++)
        this._probe(this._upgrades[e]);
  }
  /**
   * Probes a transport.
   *
   * @param {String} name - transport name
   * @private
   */
  _probe(e) {
    let t = this.createTransport(e), n = !1;
    q.priorWebsocketSuccess = !1;
    const r = () => {
      n || (t.send([{ type: "ping", data: "probe" }]), t.once("packet", (f) => {
        if (!n)
          if (f.type === "pong" && f.data === "probe") {
            if (this.upgrading = !0, this.emitReserved("upgrading", t), !t)
              return;
            q.priorWebsocketSuccess = t.name === "websocket", this.transport.pause(() => {
              n || this.readyState !== "closed" && (u(), this.setTransport(t), t.send([{ type: "upgrade" }]), this.emitReserved("upgrade", t), t = null, this.upgrading = !1, this.flush());
            });
          } else {
            const w = new Error("probe error");
            w.transport = t.name, this.emitReserved("upgradeError", w);
          }
      }));
    };
    function i() {
      n || (n = !0, u(), t.close(), t = null);
    }
    const o = (f) => {
      const w = new Error("probe error: " + f);
      w.transport = t.name, i(), this.emitReserved("upgradeError", w);
    };
    function a() {
      o("transport closed");
    }
    function h() {
      o("socket closed");
    }
    function l(f) {
      t && f.name !== t.name && i();
    }
    const u = () => {
      t.removeListener("open", r), t.removeListener("error", o), t.removeListener("close", a), this.off("close", h), this.off("upgrading", l);
    };
    t.once("open", r), t.once("error", o), t.once("close", a), this.once("close", h), this.once("upgrading", l), this._upgrades.indexOf("webtransport") !== -1 && e !== "webtransport" ? this.setTimeoutFn(() => {
      n || t.open();
    }, 200) : t.open();
  }
  onHandshake(e) {
    this._upgrades = this._filterUpgrades(e.upgrades), super.onHandshake(e);
  }
  /**
   * Filters upgrades, returning only those matching client transports.
   *
   * @param {Array} upgrades - server upgrades
   * @private
   */
  _filterUpgrades(e) {
    const t = [];
    for (let n = 0; n < e.length; n++)
      ~this.transports.indexOf(e[n]) && t.push(e[n]);
    return t;
  }
}
let pr = class extends dr {
  constructor(e, t = {}) {
    const n = typeof e == "object" ? e : t;
    (!n.transports || n.transports && typeof n.transports[0] == "string") && (n.transports = (n.transports || ["polling", "websocket", "webtransport"]).map((r) => cr[r]).filter((r) => !!r)), super(e, n);
  }
};
function mr(s, e = "", t) {
  let n = s;
  t = t || typeof location < "u" && location, s == null && (s = t.protocol + "//" + t.host), typeof s == "string" && (s.charAt(0) === "/" && (s.charAt(1) === "/" ? s = t.protocol + s : s = t.host + s), /^(https?|wss?):\/\//.test(s) || (typeof t < "u" ? s = t.protocol + "//" + s : s = "https://" + s), n = Pe(s)), n.port || (/^(http|ws)$/.test(n.protocol) ? n.port = "80" : /^(http|ws)s$/.test(n.protocol) && (n.port = "443")), n.path = n.path || "/";
  const i = n.host.indexOf(":") !== -1 ? "[" + n.host + "]" : n.host;
  return n.id = n.protocol + "://" + i + ":" + n.port + e, n.href = n.protocol + "://" + i + (t && t.port === n.port ? "" : ":" + n.port), n;
}
const yr = typeof ArrayBuffer == "function", gr = (s) => typeof ArrayBuffer.isView == "function" ? ArrayBuffer.isView(s) : s.buffer instanceof ArrayBuffer, Kt = Object.prototype.toString, _r = typeof Blob == "function" || typeof Blob < "u" && Kt.call(Blob) === "[object BlobConstructor]", wr = typeof File == "function" || typeof File < "u" && Kt.call(File) === "[object FileConstructor]";
function We(s) {
  return yr && (s instanceof ArrayBuffer || gr(s)) || _r && s instanceof Blob || wr && s instanceof File;
}
function ce(s, e) {
  if (!s || typeof s != "object")
    return !1;
  if (Array.isArray(s)) {
    for (let t = 0, n = s.length; t < n; t++)
      if (ce(s[t]))
        return !0;
    return !1;
  }
  if (We(s))
    return !0;
  if (s.toJSON && typeof s.toJSON == "function" && arguments.length === 1)
    return ce(s.toJSON(), !0);
  for (const t in s)
    if (Object.prototype.hasOwnProperty.call(s, t) && ce(s[t]))
      return !0;
  return !1;
}
function br(s) {
  const e = [], t = s.data, n = s;
  return n.data = De(t, e), n.attachments = e.length, { packet: n, buffers: e };
}
function De(s, e) {
  if (!s)
    return s;
  if (We(s)) {
    const t = { _placeholder: !0, num: e.length };
    return e.push(s), t;
  } else if (Array.isArray(s)) {
    const t = new Array(s.length);
    for (let n = 0; n < s.length; n++)
      t[n] = De(s[n], e);
    return t;
  } else if (typeof s == "object" && !(s instanceof Date)) {
    const t = {};
    for (const n in s)
      Object.prototype.hasOwnProperty.call(s, n) && (t[n] = De(s[n], e));
    return t;
  }
  return s;
}
function Er(s, e) {
  return s.data = qe(s.data, e), delete s.attachments, s;
}
function qe(s, e) {
  if (!s)
    return s;
  if (s && s._placeholder === !0) {
    if (typeof s.num == "number" && s.num >= 0 && s.num < e.length)
      return e[s.num];
    throw new Error("illegal attachments");
  } else if (Array.isArray(s))
    for (let t = 0; t < s.length; t++)
      s[t] = qe(s[t], e);
  else if (typeof s == "object")
    for (const t in s)
      Object.prototype.hasOwnProperty.call(s, t) && (s[t] = qe(s[t], e));
  return s;
}
const kr = [
  "connect",
  "connect_error",
  "disconnect",
  "disconnecting",
  "newListener",
  "removeListener"
  // used by the Node.js EventEmitter
], Rr = 5;
var _;
(function(s) {
  s[s.CONNECT = 0] = "CONNECT", s[s.DISCONNECT = 1] = "DISCONNECT", s[s.EVENT = 2] = "EVENT", s[s.ACK = 3] = "ACK", s[s.CONNECT_ERROR = 4] = "CONNECT_ERROR", s[s.BINARY_EVENT = 5] = "BINARY_EVENT", s[s.BINARY_ACK = 6] = "BINARY_ACK";
})(_ || (_ = {}));
class vr {
  /**
   * Encoder constructor
   *
   * @param {function} replacer - custom replacer to pass down to JSON.parse
   */
  constructor(e) {
    this.replacer = e;
  }
  /**
   * Encode a packet as a single string if non-binary, or as a
   * buffer sequence, depending on packet type.
   *
   * @param {Object} obj - packet object
   */
  encode(e) {
    return (e.type === _.EVENT || e.type === _.ACK) && ce(e) ? this.encodeAsBinary({
      type: e.type === _.EVENT ? _.BINARY_EVENT : _.BINARY_ACK,
      nsp: e.nsp,
      data: e.data,
      id: e.id
    }) : [this.encodeAsString(e)];
  }
  /**
   * Encode packet as string.
   */
  encodeAsString(e) {
    let t = "" + e.type;
    return (e.type === _.BINARY_EVENT || e.type === _.BINARY_ACK) && (t += e.attachments + "-"), e.nsp && e.nsp !== "/" && (t += e.nsp + ","), e.id != null && (t += e.id), e.data != null && (t += JSON.stringify(e.data, this.replacer)), t;
  }
  /**
   * Encode packet as 'buffer sequence' by removing blobs, and
   * deconstructing packet into object with placeholders and
   * a list of buffers.
   */
  encodeAsBinary(e) {
    const t = br(e), n = this.encodeAsString(t.packet), r = t.buffers;
    return r.unshift(n), r;
  }
}
function ht(s) {
  return Object.prototype.toString.call(s) === "[object Object]";
}
class ze extends k {
  /**
   * Decoder constructor
   *
   * @param {function} reviver - custom reviver to pass down to JSON.stringify
   */
  constructor(e) {
    super(), this.reviver = e;
  }
  /**
   * Decodes an encoded packet string into packet JSON.
   *
   * @param {String} obj - encoded packet
   */
  add(e) {
    let t;
    if (typeof e == "string") {
      if (this.reconstructor)
        throw new Error("got plaintext data when reconstructing a packet");
      t = this.decodeString(e);
      const n = t.type === _.BINARY_EVENT;
      n || t.type === _.BINARY_ACK ? (t.type = n ? _.EVENT : _.ACK, this.reconstructor = new Sr(t), t.attachments === 0 && super.emitReserved("decoded", t)) : super.emitReserved("decoded", t);
    } else if (We(e) || e.base64)
      if (this.reconstructor)
        t = this.reconstructor.takeBinaryData(e), t && (this.reconstructor = null, super.emitReserved("decoded", t));
      else
        throw new Error("got binary data when not reconstructing a packet");
    else
      throw new Error("Unknown type: " + e);
  }
  /**
   * Decode a packet String (JSON data)
   *
   * @param {String} str
   * @return {Object} packet
   */
  decodeString(e) {
    let t = 0;
    const n = {
      type: Number(e.charAt(0))
    };
    if (_[n.type] === void 0)
      throw new Error("unknown packet type " + n.type);
    if (n.type === _.BINARY_EVENT || n.type === _.BINARY_ACK) {
      const i = t + 1;
      for (; e.charAt(++t) !== "-" && t != e.length; )
        ;
      const o = e.substring(i, t);
      if (o != Number(o) || e.charAt(t) !== "-")
        throw new Error("Illegal attachments");
      n.attachments = Number(o);
    }
    if (e.charAt(t + 1) === "/") {
      const i = t + 1;
      for (; ++t && !(e.charAt(t) === "," || t === e.length); )
        ;
      n.nsp = e.substring(i, t);
    } else
      n.nsp = "/";
    const r = e.charAt(t + 1);
    if (r !== "" && Number(r) == r) {
      const i = t + 1;
      for (; ++t; ) {
        const o = e.charAt(t);
        if (o == null || Number(o) != o) {
          --t;
          break;
        }
        if (t === e.length)
          break;
      }
      n.id = Number(e.substring(i, t + 1));
    }
    if (e.charAt(++t)) {
      const i = this.tryParse(e.substr(t));
      if (ze.isPayloadValid(n.type, i))
        n.data = i;
      else
        throw new Error("invalid payload");
    }
    return n;
  }
  tryParse(e) {
    try {
      return JSON.parse(e, this.reviver);
    } catch {
      return !1;
    }
  }
  static isPayloadValid(e, t) {
    switch (e) {
      case _.CONNECT:
        return ht(t);
      case _.DISCONNECT:
        return t === void 0;
      case _.CONNECT_ERROR:
        return typeof t == "string" || ht(t);
      case _.EVENT:
      case _.BINARY_EVENT:
        return Array.isArray(t) && (typeof t[0] == "number" || typeof t[0] == "string" && kr.indexOf(t[0]) === -1);
      case _.ACK:
      case _.BINARY_ACK:
        return Array.isArray(t);
    }
  }
  /**
   * Deallocates a parser's resources
   */
  destroy() {
    this.reconstructor && (this.reconstructor.finishedReconstruction(), this.reconstructor = null);
  }
}
class Sr {
  constructor(e) {
    this.packet = e, this.buffers = [], this.reconPack = e;
  }
  /**
   * Method to be called when binary data received from connection
   * after a BINARY_EVENT packet.
   *
   * @param {Buffer | ArrayBuffer} binData - the raw binary data received
   * @return {null | Object} returns null if more binary data is expected or
   *   a reconstructed packet object if all buffers have been received.
   */
  takeBinaryData(e) {
    if (this.buffers.push(e), this.buffers.length === this.reconPack.attachments) {
      const t = Er(this.reconPack, this.buffers);
      return this.finishedReconstruction(), t;
    }
    return null;
  }
  /**
   * Cleans up binary packet reconstruction variables.
   */
  finishedReconstruction() {
    this.reconPack = null, this.buffers = [];
  }
}
const Ar = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Decoder: ze,
  Encoder: vr,
  get PacketType() {
    return _;
  },
  protocol: Rr
}, Symbol.toStringTag, { value: "Module" }));
function N(s, e, t) {
  return s.on(e, t), function() {
    s.off(e, t);
  };
}
const Tr = Object.freeze({
  connect: 1,
  connect_error: 1,
  disconnect: 1,
  disconnecting: 1,
  // EventEmitter reserved events: https://nodejs.org/api/events.html#events_event_newlistener
  newListener: 1,
  removeListener: 1
});
class Xt extends k {
  /**
   * `Socket` constructor.
   */
  constructor(e, t, n) {
    super(), this.connected = !1, this.recovered = !1, this.receiveBuffer = [], this.sendBuffer = [], this._queue = [], this._queueSeq = 0, this.ids = 0, this.acks = {}, this.flags = {}, this.io = e, this.nsp = t, n && n.auth && (this.auth = n.auth), this._opts = Object.assign({}, n), this.io._autoConnect && this.open();
  }
  /**
   * Whether the socket is currently disconnected
   *
   * @example
   * const socket = io();
   *
   * socket.on("connect", () => {
   *   console.log(socket.disconnected); // false
   * });
   *
   * socket.on("disconnect", () => {
   *   console.log(socket.disconnected); // true
   * });
   */
  get disconnected() {
    return !this.connected;
  }
  /**
   * Subscribe to open, close and packet events
   *
   * @private
   */
  subEvents() {
    if (this.subs)
      return;
    const e = this.io;
    this.subs = [
      N(e, "open", this.onopen.bind(this)),
      N(e, "packet", this.onpacket.bind(this)),
      N(e, "error", this.onerror.bind(this)),
      N(e, "close", this.onclose.bind(this))
    ];
  }
  /**
   * Whether the Socket will try to reconnect when its Manager connects or reconnects.
   *
   * @example
   * const socket = io();
   *
   * console.log(socket.active); // true
   *
   * socket.on("disconnect", (reason) => {
   *   if (reason === "io server disconnect") {
   *     // the disconnection was initiated by the server, you need to manually reconnect
   *     console.log(socket.active); // false
   *   }
   *   // else the socket will automatically try to reconnect
   *   console.log(socket.active); // true
   * });
   */
  get active() {
    return !!this.subs;
  }
  /**
   * "Opens" the socket.
   *
   * @example
   * const socket = io({
   *   autoConnect: false
   * });
   *
   * socket.connect();
   */
  connect() {
    return this.connected ? this : (this.subEvents(), this.io._reconnecting || this.io.open(), this.io._readyState === "open" && this.onopen(), this);
  }
  /**
   * Alias for {@link connect()}.
   */
  open() {
    return this.connect();
  }
  /**
   * Sends a `message` event.
   *
   * This method mimics the WebSocket.send() method.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/send
   *
   * @example
   * socket.send("hello");
   *
   * // this is equivalent to
   * socket.emit("message", "hello");
   *
   * @return self
   */
  send(...e) {
    return e.unshift("message"), this.emit.apply(this, e), this;
  }
  /**
   * Override `emit`.
   * If the event is in `events`, it's emitted normally.
   *
   * @example
   * socket.emit("hello", "world");
   *
   * // all serializable datastructures are supported (no need to call JSON.stringify)
   * socket.emit("hello", 1, "2", { 3: ["4"], 5: Uint8Array.from([6]) });
   *
   * // with an acknowledgement from the server
   * socket.emit("hello", "world", (val) => {
   *   // ...
   * });
   *
   * @return self
   */
  emit(e, ...t) {
    var n, r, i;
    if (Tr.hasOwnProperty(e))
      throw new Error('"' + e.toString() + '" is a reserved event name');
    if (t.unshift(e), this._opts.retries && !this.flags.fromQueue && !this.flags.volatile)
      return this._addToQueue(t), this;
    const o = {
      type: _.EVENT,
      data: t
    };
    if (o.options = {}, o.options.compress = this.flags.compress !== !1, typeof t[t.length - 1] == "function") {
      const u = this.ids++, f = t.pop();
      this._registerAckCallback(u, f), o.id = u;
    }
    const a = (r = (n = this.io.engine) === null || n === void 0 ? void 0 : n.transport) === null || r === void 0 ? void 0 : r.writable, h = this.connected && !(!((i = this.io.engine) === null || i === void 0) && i._hasPingExpired());
    return this.flags.volatile && !a || (h ? (this.notifyOutgoingListeners(o), this.packet(o)) : this.sendBuffer.push(o)), this.flags = {}, this;
  }
  /**
   * @private
   */
  _registerAckCallback(e, t) {
    var n;
    const r = (n = this.flags.timeout) !== null && n !== void 0 ? n : this._opts.ackTimeout;
    if (r === void 0) {
      this.acks[e] = t;
      return;
    }
    const i = this.io.setTimeoutFn(() => {
      delete this.acks[e];
      for (let a = 0; a < this.sendBuffer.length; a++)
        this.sendBuffer[a].id === e && this.sendBuffer.splice(a, 1);
      t.call(this, new Error("operation has timed out"));
    }, r), o = (...a) => {
      this.io.clearTimeoutFn(i), t.apply(this, a);
    };
    o.withError = !0, this.acks[e] = o;
  }
  /**
   * Emits an event and waits for an acknowledgement
   *
   * @example
   * // without timeout
   * const response = await socket.emitWithAck("hello", "world");
   *
   * // with a specific timeout
   * try {
   *   const response = await socket.timeout(1000).emitWithAck("hello", "world");
   * } catch (err) {
   *   // the server did not acknowledge the event in the given delay
   * }
   *
   * @return a Promise that will be fulfilled when the server acknowledges the event
   */
  emitWithAck(e, ...t) {
    return new Promise((n, r) => {
      const i = (o, a) => o ? r(o) : n(a);
      i.withError = !0, t.push(i), this.emit(e, ...t);
    });
  }
  /**
   * Add the packet to the queue.
   * @param args
   * @private
   */
  _addToQueue(e) {
    let t;
    typeof e[e.length - 1] == "function" && (t = e.pop());
    const n = {
      id: this._queueSeq++,
      tryCount: 0,
      pending: !1,
      args: e,
      flags: Object.assign({ fromQueue: !0 }, this.flags)
    };
    e.push((r, ...i) => n !== this._queue[0] ? void 0 : (r !== null ? n.tryCount > this._opts.retries && (this._queue.shift(), t && t(r)) : (this._queue.shift(), t && t(null, ...i)), n.pending = !1, this._drainQueue())), this._queue.push(n), this._drainQueue();
  }
  /**
   * Send the first packet of the queue, and wait for an acknowledgement from the server.
   * @param force - whether to resend a packet that has not been acknowledged yet
   *
   * @private
   */
  _drainQueue(e = !1) {
    if (!this.connected || this._queue.length === 0)
      return;
    const t = this._queue[0];
    t.pending && !e || (t.pending = !0, t.tryCount++, this.flags = t.flags, this.emit.apply(this, t.args));
  }
  /**
   * Sends a packet.
   *
   * @param packet
   * @private
   */
  packet(e) {
    e.nsp = this.nsp, this.io._packet(e);
  }
  /**
   * Called upon engine `open`.
   *
   * @private
   */
  onopen() {
    typeof this.auth == "function" ? this.auth((e) => {
      this._sendConnectPacket(e);
    }) : this._sendConnectPacket(this.auth);
  }
  /**
   * Sends a CONNECT packet to initiate the Socket.IO session.
   *
   * @param data
   * @private
   */
  _sendConnectPacket(e) {
    this.packet({
      type: _.CONNECT,
      data: this._pid ? Object.assign({ pid: this._pid, offset: this._lastOffset }, e) : e
    });
  }
  /**
   * Called upon engine or manager `error`.
   *
   * @param err
   * @private
   */
  onerror(e) {
    this.connected || this.emitReserved("connect_error", e);
  }
  /**
   * Called upon engine `close`.
   *
   * @param reason
   * @param description
   * @private
   */
  onclose(e, t) {
    this.connected = !1, delete this.id, this.emitReserved("disconnect", e, t), this._clearAcks();
  }
  /**
   * Clears the acknowledgement handlers upon disconnection, since the client will never receive an acknowledgement from
   * the server.
   *
   * @private
   */
  _clearAcks() {
    Object.keys(this.acks).forEach((e) => {
      if (!this.sendBuffer.some((n) => String(n.id) === e)) {
        const n = this.acks[e];
        delete this.acks[e], n.withError && n.call(this, new Error("socket has been disconnected"));
      }
    });
  }
  /**
   * Called with socket packet.
   *
   * @param packet
   * @private
   */
  onpacket(e) {
    if (e.nsp === this.nsp)
      switch (e.type) {
        case _.CONNECT:
          e.data && e.data.sid ? this.onconnect(e.data.sid, e.data.pid) : this.emitReserved("connect_error", new Error("It seems you are trying to reach a Socket.IO server in v2.x with a v3.x client, but they are not compatible (more information here: https://socket.io/docs/v3/migrating-from-2-x-to-3-0/)"));
          break;
        case _.EVENT:
        case _.BINARY_EVENT:
          this.onevent(e);
          break;
        case _.ACK:
        case _.BINARY_ACK:
          this.onack(e);
          break;
        case _.DISCONNECT:
          this.ondisconnect();
          break;
        case _.CONNECT_ERROR:
          this.destroy();
          const n = new Error(e.data.message);
          n.data = e.data.data, this.emitReserved("connect_error", n);
          break;
      }
  }
  /**
   * Called upon a server event.
   *
   * @param packet
   * @private
   */
  onevent(e) {
    const t = e.data || [];
    e.id != null && t.push(this.ack(e.id)), this.connected ? this.emitEvent(t) : this.receiveBuffer.push(Object.freeze(t));
  }
  emitEvent(e) {
    if (this._anyListeners && this._anyListeners.length) {
      const t = this._anyListeners.slice();
      for (const n of t)
        n.apply(this, e);
    }
    super.emit.apply(this, e), this._pid && e.length && typeof e[e.length - 1] == "string" && (this._lastOffset = e[e.length - 1]);
  }
  /**
   * Produces an ack callback to emit with an event.
   *
   * @private
   */
  ack(e) {
    const t = this;
    let n = !1;
    return function(...r) {
      n || (n = !0, t.packet({
        type: _.ACK,
        id: e,
        data: r
      }));
    };
  }
  /**
   * Called upon a server acknowledgement.
   *
   * @param packet
   * @private
   */
  onack(e) {
    const t = this.acks[e.id];
    typeof t == "function" && (delete this.acks[e.id], t.withError && e.data.unshift(null), t.apply(this, e.data));
  }
  /**
   * Called upon server connect.
   *
   * @private
   */
  onconnect(e, t) {
    this.id = e, this.recovered = t && this._pid === t, this._pid = t, this.connected = !0, this.emitBuffered(), this.emitReserved("connect"), this._drainQueue(!0);
  }
  /**
   * Emit buffered events (received and emitted).
   *
   * @private
   */
  emitBuffered() {
    this.receiveBuffer.forEach((e) => this.emitEvent(e)), this.receiveBuffer = [], this.sendBuffer.forEach((e) => {
      this.notifyOutgoingListeners(e), this.packet(e);
    }), this.sendBuffer = [];
  }
  /**
   * Called upon server disconnect.
   *
   * @private
   */
  ondisconnect() {
    this.destroy(), this.onclose("io server disconnect");
  }
  /**
   * Called upon forced client/server side disconnections,
   * this method ensures the manager stops tracking us and
   * that reconnections don't get triggered for this.
   *
   * @private
   */
  destroy() {
    this.subs && (this.subs.forEach((e) => e()), this.subs = void 0), this.io._destroy(this);
  }
  /**
   * Disconnects the socket manually. In that case, the socket will not try to reconnect.
   *
   * If this is the last active Socket instance of the {@link Manager}, the low-level connection will be closed.
   *
   * @example
   * const socket = io();
   *
   * socket.on("disconnect", (reason) => {
   *   // console.log(reason); prints "io client disconnect"
   * });
   *
   * socket.disconnect();
   *
   * @return self
   */
  disconnect() {
    return this.connected && this.packet({ type: _.DISCONNECT }), this.destroy(), this.connected && this.onclose("io client disconnect"), this;
  }
  /**
   * Alias for {@link disconnect()}.
   *
   * @return self
   */
  close() {
    return this.disconnect();
  }
  /**
   * Sets the compress flag.
   *
   * @example
   * socket.compress(false).emit("hello");
   *
   * @param compress - if `true`, compresses the sending data
   * @return self
   */
  compress(e) {
    return this.flags.compress = e, this;
  }
  /**
   * Sets a modifier for a subsequent event emission that the event message will be dropped when this socket is not
   * ready to send messages.
   *
   * @example
   * socket.volatile.emit("hello"); // the server may or may not receive it
   *
   * @returns self
   */
  get volatile() {
    return this.flags.volatile = !0, this;
  }
  /**
   * Sets a modifier for a subsequent event emission that the callback will be called with an error when the
   * given number of milliseconds have elapsed without an acknowledgement from the server:
   *
   * @example
   * socket.timeout(5000).emit("my-event", (err) => {
   *   if (err) {
   *     // the server did not acknowledge the event in the given delay
   *   }
   * });
   *
   * @returns self
   */
  timeout(e) {
    return this.flags.timeout = e, this;
  }
  /**
   * Adds a listener that will be fired when any event is emitted. The event name is passed as the first argument to the
   * callback.
   *
   * @example
   * socket.onAny((event, ...args) => {
   *   console.log(`got ${event}`);
   * });
   *
   * @param listener
   */
  onAny(e) {
    return this._anyListeners = this._anyListeners || [], this._anyListeners.push(e), this;
  }
  /**
   * Adds a listener that will be fired when any event is emitted. The event name is passed as the first argument to the
   * callback. The listener is added to the beginning of the listeners array.
   *
   * @example
   * socket.prependAny((event, ...args) => {
   *   console.log(`got event ${event}`);
   * });
   *
   * @param listener
   */
  prependAny(e) {
    return this._anyListeners = this._anyListeners || [], this._anyListeners.unshift(e), this;
  }
  /**
   * Removes the listener that will be fired when any event is emitted.
   *
   * @example
   * const catchAllListener = (event, ...args) => {
   *   console.log(`got event ${event}`);
   * }
   *
   * socket.onAny(catchAllListener);
   *
   * // remove a specific listener
   * socket.offAny(catchAllListener);
   *
   * // or remove all listeners
   * socket.offAny();
   *
   * @param listener
   */
  offAny(e) {
    if (!this._anyListeners)
      return this;
    if (e) {
      const t = this._anyListeners;
      for (let n = 0; n < t.length; n++)
        if (e === t[n])
          return t.splice(n, 1), this;
    } else
      this._anyListeners = [];
    return this;
  }
  /**
   * Returns an array of listeners that are listening for any event that is specified. This array can be manipulated,
   * e.g. to remove listeners.
   */
  listenersAny() {
    return this._anyListeners || [];
  }
  /**
   * Adds a listener that will be fired when any event is emitted. The event name is passed as the first argument to the
   * callback.
   *
   * Note: acknowledgements sent to the server are not included.
   *
   * @example
   * socket.onAnyOutgoing((event, ...args) => {
   *   console.log(`sent event ${event}`);
   * });
   *
   * @param listener
   */
  onAnyOutgoing(e) {
    return this._anyOutgoingListeners = this._anyOutgoingListeners || [], this._anyOutgoingListeners.push(e), this;
  }
  /**
   * Adds a listener that will be fired when any event is emitted. The event name is passed as the first argument to the
   * callback. The listener is added to the beginning of the listeners array.
   *
   * Note: acknowledgements sent to the server are not included.
   *
   * @example
   * socket.prependAnyOutgoing((event, ...args) => {
   *   console.log(`sent event ${event}`);
   * });
   *
   * @param listener
   */
  prependAnyOutgoing(e) {
    return this._anyOutgoingListeners = this._anyOutgoingListeners || [], this._anyOutgoingListeners.unshift(e), this;
  }
  /**
   * Removes the listener that will be fired when any event is emitted.
   *
   * @example
   * const catchAllListener = (event, ...args) => {
   *   console.log(`sent event ${event}`);
   * }
   *
   * socket.onAnyOutgoing(catchAllListener);
   *
   * // remove a specific listener
   * socket.offAnyOutgoing(catchAllListener);
   *
   * // or remove all listeners
   * socket.offAnyOutgoing();
   *
   * @param [listener] - the catch-all listener (optional)
   */
  offAnyOutgoing(e) {
    if (!this._anyOutgoingListeners)
      return this;
    if (e) {
      const t = this._anyOutgoingListeners;
      for (let n = 0; n < t.length; n++)
        if (e === t[n])
          return t.splice(n, 1), this;
    } else
      this._anyOutgoingListeners = [];
    return this;
  }
  /**
   * Returns an array of listeners that are listening for any event that is specified. This array can be manipulated,
   * e.g. to remove listeners.
   */
  listenersAnyOutgoing() {
    return this._anyOutgoingListeners || [];
  }
  /**
   * Notify the listeners for each packet sent
   *
   * @param packet
   *
   * @private
   */
  notifyOutgoingListeners(e) {
    if (this._anyOutgoingListeners && this._anyOutgoingListeners.length) {
      const t = this._anyOutgoingListeners.slice();
      for (const n of t)
        n.apply(this, e.data);
    }
  }
}
function z(s) {
  s = s || {}, this.ms = s.min || 100, this.max = s.max || 1e4, this.factor = s.factor || 2, this.jitter = s.jitter > 0 && s.jitter <= 1 ? s.jitter : 0, this.attempts = 0;
}
z.prototype.duration = function() {
  var s = this.ms * Math.pow(this.factor, this.attempts++);
  if (this.jitter) {
    var e = Math.random(), t = Math.floor(e * this.jitter * s);
    s = (Math.floor(e * 10) & 1) == 0 ? s - t : s + t;
  }
  return Math.min(s, this.max) | 0;
};
z.prototype.reset = function() {
  this.attempts = 0;
};
z.prototype.setMin = function(s) {
  this.ms = s;
};
z.prototype.setMax = function(s) {
  this.max = s;
};
z.prototype.setJitter = function(s) {
  this.jitter = s;
};
class Fe extends k {
  constructor(e, t) {
    var n;
    super(), this.nsps = {}, this.subs = [], e && typeof e == "object" && (t = e, e = void 0), t = t || {}, t.path = t.path || "/socket.io", this.opts = t, be(this, t), this.reconnection(t.reconnection !== !1), this.reconnectionAttempts(t.reconnectionAttempts || 1 / 0), this.reconnectionDelay(t.reconnectionDelay || 1e3), this.reconnectionDelayMax(t.reconnectionDelayMax || 5e3), this.randomizationFactor((n = t.randomizationFactor) !== null && n !== void 0 ? n : 0.5), this.backoff = new z({
      min: this.reconnectionDelay(),
      max: this.reconnectionDelayMax(),
      jitter: this.randomizationFactor()
    }), this.timeout(t.timeout == null ? 2e4 : t.timeout), this._readyState = "closed", this.uri = e;
    const r = t.parser || Ar;
    this.encoder = new r.Encoder(), this.decoder = new r.Decoder(), this._autoConnect = t.autoConnect !== !1, this._autoConnect && this.open();
  }
  reconnection(e) {
    return arguments.length ? (this._reconnection = !!e, e || (this.skipReconnect = !0), this) : this._reconnection;
  }
  reconnectionAttempts(e) {
    return e === void 0 ? this._reconnectionAttempts : (this._reconnectionAttempts = e, this);
  }
  reconnectionDelay(e) {
    var t;
    return e === void 0 ? this._reconnectionDelay : (this._reconnectionDelay = e, (t = this.backoff) === null || t === void 0 || t.setMin(e), this);
  }
  randomizationFactor(e) {
    var t;
    return e === void 0 ? this._randomizationFactor : (this._randomizationFactor = e, (t = this.backoff) === null || t === void 0 || t.setJitter(e), this);
  }
  reconnectionDelayMax(e) {
    var t;
    return e === void 0 ? this._reconnectionDelayMax : (this._reconnectionDelayMax = e, (t = this.backoff) === null || t === void 0 || t.setMax(e), this);
  }
  timeout(e) {
    return arguments.length ? (this._timeout = e, this) : this._timeout;
  }
  /**
   * Starts trying to reconnect if reconnection is enabled and we have not
   * started reconnecting yet
   *
   * @private
   */
  maybeReconnectOnOpen() {
    !this._reconnecting && this._reconnection && this.backoff.attempts === 0 && this.reconnect();
  }
  /**
   * Sets the current transport `socket`.
   *
   * @param {Function} fn - optional, callback
   * @return self
   * @public
   */
  open(e) {
    if (~this._readyState.indexOf("open"))
      return this;
    this.engine = new pr(this.uri, this.opts);
    const t = this.engine, n = this;
    this._readyState = "opening", this.skipReconnect = !1;
    const r = N(t, "open", function() {
      n.onopen(), e && e();
    }), i = (a) => {
      this.cleanup(), this._readyState = "closed", this.emitReserved("error", a), e ? e(a) : this.maybeReconnectOnOpen();
    }, o = N(t, "error", i);
    if (this._timeout !== !1) {
      const a = this._timeout, h = this.setTimeoutFn(() => {
        r(), i(new Error("timeout")), t.close();
      }, a);
      this.opts.autoUnref && h.unref(), this.subs.push(() => {
        this.clearTimeoutFn(h);
      });
    }
    return this.subs.push(r), this.subs.push(o), this;
  }
  /**
   * Alias for open()
   *
   * @return self
   * @public
   */
  connect(e) {
    return this.open(e);
  }
  /**
   * Called upon transport open.
   *
   * @private
   */
  onopen() {
    this.cleanup(), this._readyState = "open", this.emitReserved("open");
    const e = this.engine;
    this.subs.push(
      N(e, "ping", this.onping.bind(this)),
      N(e, "data", this.ondata.bind(this)),
      N(e, "error", this.onerror.bind(this)),
      N(e, "close", this.onclose.bind(this)),
      // @ts-ignore
      N(this.decoder, "decoded", this.ondecoded.bind(this))
    );
  }
  /**
   * Called upon a ping.
   *
   * @private
   */
  onping() {
    this.emitReserved("ping");
  }
  /**
   * Called with data.
   *
   * @private
   */
  ondata(e) {
    try {
      this.decoder.add(e);
    } catch (t) {
      this.onclose("parse error", t);
    }
  }
  /**
   * Called when parser fully decodes a packet.
   *
   * @private
   */
  ondecoded(e) {
    we(() => {
      this.emitReserved("packet", e);
    }, this.setTimeoutFn);
  }
  /**
   * Called upon socket error.
   *
   * @private
   */
  onerror(e) {
    this.emitReserved("error", e);
  }
  /**
   * Creates a new socket for the given `nsp`.
   *
   * @return {Socket}
   * @public
   */
  socket(e, t) {
    let n = this.nsps[e];
    return n ? this._autoConnect && !n.active && n.connect() : (n = new Xt(this, e, t), this.nsps[e] = n), n;
  }
  /**
   * Called upon a socket close.
   *
   * @param socket
   * @private
   */
  _destroy(e) {
    const t = Object.keys(this.nsps);
    for (const n of t)
      if (this.nsps[n].active)
        return;
    this._close();
  }
  /**
   * Writes a packet.
   *
   * @param packet
   * @private
   */
  _packet(e) {
    const t = this.encoder.encode(e);
    for (let n = 0; n < t.length; n++)
      this.engine.write(t[n], e.options);
  }
  /**
   * Clean up transport subscriptions and packet buffer.
   *
   * @private
   */
  cleanup() {
    this.subs.forEach((e) => e()), this.subs.length = 0, this.decoder.destroy();
  }
  /**
   * Close the current socket.
   *
   * @private
   */
  _close() {
    this.skipReconnect = !0, this._reconnecting = !1, this.onclose("forced close");
  }
  /**
   * Alias for close()
   *
   * @private
   */
  disconnect() {
    return this._close();
  }
  /**
   * Called when:
   *
   * - the low-level engine is closed
   * - the parser encountered a badly formatted packet
   * - all sockets are disconnected
   *
   * @private
   */
  onclose(e, t) {
    var n;
    this.cleanup(), (n = this.engine) === null || n === void 0 || n.close(), this.backoff.reset(), this._readyState = "closed", this.emitReserved("close", e, t), this._reconnection && !this.skipReconnect && this.reconnect();
  }
  /**
   * Attempt a reconnection.
   *
   * @private
   */
  reconnect() {
    if (this._reconnecting || this.skipReconnect)
      return this;
    const e = this;
    if (this.backoff.attempts >= this._reconnectionAttempts)
      this.backoff.reset(), this.emitReserved("reconnect_failed"), this._reconnecting = !1;
    else {
      const t = this.backoff.duration();
      this._reconnecting = !0;
      const n = this.setTimeoutFn(() => {
        e.skipReconnect || (this.emitReserved("reconnect_attempt", e.backoff.attempts), !e.skipReconnect && e.open((r) => {
          r ? (e._reconnecting = !1, e.reconnect(), this.emitReserved("reconnect_error", r)) : e.onreconnect();
        }));
      }, t);
      this.opts.autoUnref && n.unref(), this.subs.push(() => {
        this.clearTimeoutFn(n);
      });
    }
  }
  /**
   * Called upon successful reconnect.
   *
   * @private
   */
  onreconnect() {
    const e = this.backoff.attempts;
    this._reconnecting = !1, this.backoff.reset(), this.emitReserved("reconnect", e);
  }
}
const K = {};
function ue(s, e) {
  typeof s == "object" && (e = s, s = void 0), e = e || {};
  const t = mr(s, e.path || "/socket.io"), n = t.source, r = t.id, i = t.path, o = K[r] && i in K[r].nsps, a = e.forceNew || e["force new connection"] || e.multiplex === !1 || o;
  let h;
  return a ? h = new Fe(n, e) : (K[r] || (K[r] = new Fe(n, e)), h = K[r]), t.query && !e.query && (e.query = t.queryKey), h.socket(t.path, e);
}
Object.assign(ue, {
  Manager: Fe,
  Socket: Xt,
  io: ue,
  connect: ue
});
class Or {
  constructor(e) {
    g(this, "base_url", "https://devices.wavoip.com");
    g(this, "socket");
    g(this, "listeners", {
      "audio_transport:create": [],
      "audio_transport:terminate": [],
      device_status: [],
      qrcode: [],
      signaling: [],
      "calls:error": [],
      "peer:accepted_elsewhere": []
    });
    g(this, "call_id", null);
    this.device_token = e, this.socket = ue(this.base_url, {
      transports: ["websocket"],
      path: `/${this.device_token}/websocket`
    }), this.socket.on("connect", () => {
    }), this.socket.on("disconnect", () => {
      this.socket.auth = { call_id: this.call_id }, this.socket.connect();
    }), this.socket.onAny((t, ...n) => {
      this.callListeners(t, ...n);
    }), this.bindListener("signaling", {
      id: "root",
      fn: (t, n) => {
        this.call_id = n;
      }
    }), this.bindListener("audio_transport:terminate", {
      id: "root",
      fn: () => {
        this.call_id = null;
      }
    });
  }
  callListeners(e, ...t) {
    for (const n of this.listeners[e])
      n.fn(...t);
  }
  bindListener(e, t) {
    for (const { id: n } of this.listeners[e])
      if (n === t.id)
        throw new Error(
          `There is already a listener for ${e} with id ${t.id} `
        );
    this.listeners[e].push(t);
  }
  checkListenerExists(e, t) {
    return !!this.listeners[e].find((n) => n.id === t);
  }
  emit(e, ...t) {
    this.socket.emit(e, ...t);
  }
  removeListener(e, t) {
    const n = this.listeners[e].filter(
      (r) => r.id !== t
    );
    this.listeners[e] = n;
  }
}
class Xr {
  constructor(e) {
    g(this, "wavoip_socket");
    g(this, "audio_socket");
    g(this, "device");
    g(this, "audio");
    g(this, "microphone");
    g(this, "call");
    this.wavoip_socket = new Or(e), this.audio_socket = new Pn(e, this.wavoip_socket), this.call = new es(this.wavoip_socket), this.device = new Ln(this.wavoip_socket, e), this.audio = new Zt(this.wavoip_socket, this.audio_socket), this.microphone = new Bn(this.wavoip_socket, this.audio_socket);
  }
  get deviceStatus() {
    return this.device.device_status;
  }
  get QRCode() {
    return this.device.qrcode;
  }
  async wakeDeviceUp() {
    this.device.wakeUp();
  }
  async startCall(e) {
    return this.device.checkCanCall(), this.call.start({ ...e, whatsappid: e.to });
  }
  async onCall(e) {
    this.call.onCallReceive(e);
  }
}
export {
  Xr as Wavoip
};
