!function() {
    "use strict";
    const e = {
        RECEIVED_ANALYTICS: "HS_CTA_PARENT_RECEIVED_ANALYTICS",
        DEVICE_TYPE: "HS_CTA_PARENT_DEVICE_TYPE",
        PROXY_ANALYTICS_FN_CALLBACK: "HS_CTA_PARENT_PROXY_ANALYTICS_FN",
        INIT: "HS_CTA_PARENT_INIT",
        SHOWING_CTA: "HS_CTA_SHOWING_CTA",
        SEND_EXTRACTED_STYLES: "HS_SEND_EXTRACTED_STYLES",
        STARTED: "HS_CTA_STARTED",
        NAVIGATE_PAGE: "HS_CTA_NAVIGATE_PAGE",
        CLICK_EVENT: "HS_CTA_CLICK_EVENT",
        CLOSE_INTERACTIVE: "HS_CTA_CLOSE_INTERACTIVE",
        HAS_CLOSED: "HS_CTA_HAS_CLOSED",
        NEW_HEIGHT: "HS_CTA_NEW_HEIGHT",
        DISPLAY_CALL_TO_ACTION: "HS_DISPLAY_CALL_TO_ACTION",
        PROXY_ANALYTICS: "HS_CTA_PROXY_ANALYTICS",
        PROXY_ANALYTICS_FN: "HS_CTA_PROXY_ANALYTICS_FN",
        SEND_FORM_DEFINITION: "HS_SEND_FORM_DEFINITION",
        SEND_CTA_CONFIG: "HS_SEND_CTA_CONFIG",
        SEND_EMBED_CONTEXT: "HS_SEND_EMBED_CONTEXT",
        RECEIVE_FILTERED_STYLESHEETS: "RECEIVE_FILTERED_STYLESHEETS",
        SEND_STYLESHEETS: "SEND_STYLESHEETS",
        RENDER_RECAPTCHA: "RENDER_RECAPTCHA",
        EXECUTE_RECAPTCHA: "EXECUTE_RECAPTCHA",
        RESET_RECAPTCHA: "RESET_RECAPTCHA",
        RECAPTCHA_SUCCESS: "RECAPTCHA_SUCCESS",
        RECAPTCHA_EXPIRED: "RECAPTCHA_EXPIRED",
        TRIGGER_CTA: "HS_CTA_TRIGGER_CTA",
        CTA_FORM_SUBMITTED: "HS_CTA_FORM_SUBMITTED"
    };
    function t(e, t={}) {
        for (const i in t)
            Object.hasOwnProperty.call(t, i) && (e.style[i] = t[i])
    }
    function i(...e) {
        if (window.location.search.indexOf("hs_debug_interactive") > -1 || window.location.host.includes("local.hsappstatic")) {
            console.log("[web-interactives-embed]", ...e);
            window.location.search.indexOf("hs_is_selenium") > -1 && console.log(...[...e].map((e => JSON.stringify(e))))
        }
    }
    class s {
        constructor() {
            this.listeners = new Map
        }
        on(e, t) {
            if (!this.listeners.has(e)) {
                this.listeners.set(e, [t]);
                return
            }
            const i = this.listeners.get(e);
            this.listeners.set(e, [...i, t])
        }
        off(e) {
            this.listeners.delete(e)
        }
        emit(e, t) {
            const i = this.listeners.get(e);
            i && i.length && i.forEach((e => e(t)))
        }
        reset() {
            this.listeners = new Map
        }
    }
    function n() {
        return new s
    }
    const o = (...e) => {
        i("[GlobalIframeCommunication]", ...e)
    }
    ;
    class r {
        constructor() {
            this.iframeCommunicators = new Map;
            this.eventEmitter = n();
            this.reset = () => {
                this.eventEmitter.reset();
                this.iframeCommunicators = new Map
            }
        }
        registerHandler(e, t) {
            this.eventEmitter.on(e, t)
        }
        registerHandlers(e) {
            o("Registering handlers", e);
            Object.keys(e).forEach((t => {
                const i = t
                  , s = e[i];
                s && this.registerHandler(i, s)
            }
            ))
        }
        registerCommunicator(e, t) {
            o("Registering communicator", t);
            const i = this.iframeCommunicators.get(t) || [];
            this.iframeCommunicators.set(t, [...i, e])
        }
        removeCommunicator(e) {
            o("Removing Iframe Communicator from GlobalCommunication: ", e);
            this.iframeCommunicators.delete(e)
        }
        emit(e, t) {
            o("Emitting event", {
                event: e,
                messagePayload: t
            });
            this.eventEmitter.emit(e, t)
        }
        broadcast(e, t) {
            const i = this.iframeCommunicators.get(e);
            if (i) {
                o("Broadcasting", i);
                i.forEach((e => {
                    e.sendMessage(t)
                }
                ))
            } else
                o("Cannot find communcators array, not broadcasting", e, t)
        }
        broadcastAll(e) {
            o("Broadcasting", e, "to all", this.iframeCommunicators);
            for (const [t,i] of this.iframeCommunicators)
                this.broadcast(t, e)
        }
    }
    var a = new r;
    function c() {
        return new MessageChannel
    }
    const l = (...e) => {
        i("[iframeCommunication]", ...e)
    }
    ;
    class h {
        constructor(t, i) {
            this.queue = [];
            this.initialised = !1;
            this.events = new Map;
            this.eventEmitter = n();
            this.handleMessage = e => {
                if (!e.data || !e.data.type)
                    return;
                const {type: t, payload: i} = e.data;
                l("Handling message", {
                    type: t,
                    payload: i
                });
                this.eventEmitter.emit(t, i);
                a.emit(t, Object.assign({}, i, {
                    id: this.id
                }))
            }
            ;
            this.handleFrameLoaded = () => {
                if (this.iframe.contentWindow) {
                    l("Iframe loaded", this.iframe);
                    this.iframe.contentWindow.postMessage({
                        type: e.INIT
                    }, "*", [this.channel.port2]);
                    this.initialised = !0;
                    this.flushQueue()
                } else
                    l("Content window not there, not loading")
            }
            ;
            this.iframe = t;
            this.id = i;
            this.channel = c();
            this.channel.port1.onmessage = this.handleMessage;
            this.iframe.addEventListener("load", this.handleFrameLoaded);
            l("Iframe communication set up", i, t)
        }
        sendMessage({type: e, payload: t}) {
            if (this.initialised) {
                l("Posting message", {
                    type: e,
                    payload: t
                });
                this.channel.port1.postMessage({
                    type: e,
                    payload: t
                })
            } else {
                l("Queueing message", {
                    type: e,
                    payload: t
                });
                this.queue.push({
                    type: e,
                    payload: t
                })
            }
        }
        registerHandler(e, t) {
            this.eventEmitter.on(e, t)
        }
        registerHandlers(e) {
            l("Registering handlers in IframeCommunication", e);
            Object.keys(e).forEach((t => {
                const i = t
                  , s = e[i];
                s && this.registerHandler(i, s)
            }
            ))
        }
        removeHandler(e) {
            l("Removing handler", e);
            this.eventEmitter.off(e)
        }
        remove() {
            l("Removing frame communicator:", this.id);
            this.channel.port1.close();
            a.removeCommunicator(this.id)
        }
        flushQueue() {
            if (this.initialised) {
                l("Flushing queue", this.queue);
                this.queue.forEach((e => {
                    this.sendMessage(e)
                }
                ))
            } else
                l("Not flushing queue, not initialised")
        }
    }
    function d(e, t) {
        l("Creating iframe communication");
        const i = new h(e,t);
        a.registerCommunicator(i, t);
        return i
    }
    function u(e) {
        const t = window.location.origin.startsWith("http:") ? "http://" : "https://";
        return e.startsWith(t) ? e : `${t}${e.replace(/http(s)?:\/\//, "")}`
    }
    function m(e) {
        e.style.border = "none";
        e.style.height = "100%";
        e.style.width = "100%";
        e.style.visibility = "hidden"
    }
    function g(e, t) {
        const i = document.createElement("iframe");
        i.src = u(e);
        Object.keys(t).forEach((e => {
            i.setAttribute(e, t[e])
        }
        ));
        m(i);
        return i
    }
    function p(e, t, i) {
        e.startsWith("http") || (e = `https://${e}`);
        const s = new URL(e);
        s.searchParams.set(t, i);
        return s.href
    }
    function f(e, t) {
        e.startsWith("http") || (e = `https://${e}`);
        if (0 === Object.keys(t).length)
            return e;
        const i = new URL(e);
        Object.keys(t).forEach((e => i.searchParams.set(e, t[e])));
        return i.href
    }
    function v(e, t) {
        return e.replace(/#.*$/, "") === t.replace(/#.*$/, "")
    }
    const C = (...e) => {
        i("[FrameComponent]", ...e)
    }
      , T = () => {}
    ;
    class y {
        constructor({id: e, container: t, iframeSrc: i, resizeHeight: s, onFrameReady: n, useResponsiveStyling: o, extraAttributes: r={}}) {
            this.onFrameReady = T;
            this.resizeHeight = !0;
            this.handleHeightChange = ({height: e}) => {
                if (!this.resizeHeight)
                    return;
                const t = e + 2 * parseInt(getComputedStyle(this.iframe).borderTopWidth, 10);
                C("Handle height change", this.id, {
                    adjustedHeight: t,
                    height: e
                });
                this.setContainerStyle({
                    height: `${t}px`
                })
            }
            ;
            this.id = e;
            this.resizeHeight = s;
            if (o) {
                C("Responsive styling is enabled", e);
                i = p(i, "enableResponsiveStyles", "true")
            }
            this.iframe = g(i, r);
            this.container = t;
            this.iframeCommunicator = d(this.iframe, e);
            n && (this.onFrameReady = n);
            t.appendChild(this.iframe);
            this.registerHandlers()
        }
        registerHandlers() {
            this.iframeCommunicator.registerHandlers({
                [e.STARTED]: this.onFrameReady,
                [e.NEW_HEIGHT]: this.handleHeightChange
            })
        }
        setStyle(e) {
            C("Set style", this.id, e);
            t(this.iframe, e)
        }
        setShouldResize(e) {
            this.resizeHeight = e
        }
        setContainerStyle(e) {
            t(this.container, e)
        }
    }
    function b(e) {
        return new y(e)
    }
    class E {
        constructor(e, t) {
            this.listeners = new Set;
            this.batching = !1;
            this.queue = [];
            this.subscribe = e => {
                this.listeners.add(e);
                let t = () => {}
                ;
                this.options && this.options.onSubscribe && (t = this.options.onSubscribe(e, this));
                return () => {
                    this.listeners.delete(e);
                    t()
                }
            }
            ;
            this.setState = e => {
                const t = this.state;
                this.options && this.options.updateFn ? this.state = this.options.updateFn(t)(e) : this.state = e(t);
                if (this.state !== t) {
                    this.queue.push(( () => {
                        this.listeners.forEach((e => e(this.state, t)));
                        this.options && this.options.onUpdate && this.options.onUpdate(this.state, t)
                    }
                    ));
                    this._flush()
                }
            }
            ;
            this._flush = () => {
                if (!this.batching) {
                    this.queue.forEach((e => e()));
                    this.queue = []
                }
            }
            ;
            this.batch = e => {
                this.batching = !0;
                e();
                this.batching = !1;
                this._flush()
            }
            ;
            this.state = e;
            this.options = t
        }
    }
    class w {
        constructor() {
            this.storage = []
        }
        enqueue(e) {
            this.storage.push(e)
        }
        dequeue() {
            return this.storage.shift()
        }
        peek() {
            return this.storage[0]
        }
        size() {
            return this.storage.length
        }
    }
    function S() {
        return new w
    }
    function A(e, t=!1) {
        !window.navigator.userAgent.includes("Firefox") && t ? window.open(e, "_blank", "noopener") : window.location.assign(e)
    }
    const I = "hubspotutk"
      , M = "__hstc"
      , O = "__hssc"
      , _ = e => {
        const t = document.cookie.match(`(^|[^;]+)\\s*${e}\\s*=\\s*([^;]+)`);
        return t ? t.pop() : ""
    }
      , P = () => _(I)
      , L = () => _(M)
      , R = () => _(O)
      , F = (...e) => {
        i("[models/Analytics]", ...e)
    }
    ;
    class N {
        constructor() {
            this._handleFetchSucceded = e => {
                this.store.setState((t => {
                    const i = {};
                    i.path = e.path;
                    i.referrerPath = e.referrerPath;
                    i.referrer = "";
                    i.analyticsPageId = e.pageId;
                    i.hsfp = e._getFingerprint();
                    i.canonicalUrl = e.canonicalUrl;
                    i.contentType = e.contentType;
                    i.pageId = N.getPageId() || e.pageId;
                    e.session && (i.hssc = e.session.get());
                    if (e.utk) {
                        i.hstc = e.utk.get();
                        i.hutk = e.utk.visitor
                    }
                    return Object.assign({}, t, i, {
                        isLoaded: !0
                    })
                }
                ))
            }
            ;
            window._hsq = window._hsq || [];
            const e = {
                isLoaded: !1,
                pageUrl: window.location.href,
                pageTitle: window.document.title,
                referrer: window.document.referrer,
                userAgent: window.navigator.userAgent,
                hutk: P(),
                hssc: R(),
                hstc: L(),
                pageId: N.getPageId()
            };
            this.store = new E(e);
            this.fetchAnalytics()
        }
        fetchAnalytics() {
            this._analyticsQueue.push(this._handleFetchSucceded)
        }
        subscribe(e) {
            return this.store.subscribe(e)
        }
        get analytics() {
            return this.store.state
        }
        track(e) {
            F("Tracking analytics", e);
            this._analyticsQueue.push(e)
        }
        get _analyticsQueue() {
            return window._hsq
        }
        static getPageId() {
            const e = window.hsVars;
            return e && e.analytics_page_id ? e.analytics_page_id : e && e.page_id ? e.page_id : null
        }
        static getLanguage() {
            const e = window.hsVars;
            return e && e.language ? e.language : null
        }
    }
    var H = new N;
    const k = (...e) => {
        i("[AnalyticsProxyController]", ...e)
    }
      , D = ["trackFormView", "trackFormVisible", "trackFormInteraction"];
    class B {
        constructor({applicationController: e, analyticsStore: t}) {
            this.viewQueue = new Map;
            this.applicationController = e;
            this.analyticsStore = t;
            this.listenForAnalyticsUpdate();
            this.listenForProxyMessage()
        }
        listenForAnalyticsUpdate() {
            this.analyticsStore.subscribe(( (t, i) => {
                !i.isLoaded && t.isLoaded && a.broadcastAll({
                    type: e.RECEIVED_ANALYTICS,
                    payload: t
                })
            }
            ))
        }
        flushViewQueue(e) {
            const t = this.viewQueue.get(e) || [];
            for (const e of t)
                this.analyticsStore.track(e);
            this.viewQueue.delete(e)
        }
        handleFormView(e, t) {
            const i = this.applicationController.viewedStore;
            if (i && i.hasBeenViewed(e)) {
                this.analyticsStore.track(t);
                return
            }
            const s = this.viewQueue.get(e) || [];
            k("Adding form view to analytics queue", {
                id: e,
                analytics: t
            });
            this.viewQueue.set(e, [...s, t])
        }
        listenForProxyMessage() {
            a.registerHandlers({
                [e.PROXY_ANALYTICS]: ({analytics: e, id: t}) => {
                    B.isFormView(e) ? this.handleFormView(t, e) : this.analyticsStore.track(e)
                }
            })
        }
        static isFormView(e) {
            const [t] = e;
            return D.includes(t)
        }
    }
    class x {
        constructor({applicationController: e}) {
            this.applicationController = e;
            this.listenForNavigation()
        }
        listenForNavigation() {
            a.registerHandlers({
                [e.NAVIGATE_PAGE]: ({url: e, openNewTab: t, id: i}) => {
                    const s = this.applicationController.getNavigationUrl({
                        url: e,
                        openNewTab: t
                    }, i);
                    if (t)
                        return;
                    A(s, this.applicationController.getShouldOpenNewTab({
                        url: e,
                        openNewTab: t
                    }, i))
                }
            })
        }
    }
    class V {
        constructor() {
            this.extractedStyles = {
                rules: {},
                keyframes: {}
            };
            this.crossOriginStyleSheets = new Set
        }
        extractStyles() {
            const e = {
                rules: {},
                keyframes: {}
            };
            for (const t of document.styleSheets)
                if (!this.crossOriginStyleSheets.has(t))
                    try {
                        const i = t.cssRules || t.rules;
                        for (const t of i)
                            t instanceof CSSStyleRule ? e.rules[t.selectorText] = this.extractProperties(t.style) : t instanceof CSSKeyframesRule && (e.keyframes[t.name] = this.extractKeyframes(t))
                    } catch (e) {
                        this.crossOriginStyleSheets.add(t)
                    }
            this.extractedStyles = e
        }
        extractProperties(e) {
            const t = {};
            for (const i of Array.from(e))
                t[i] = e.getPropertyValue(i);
            return t
        }
        extractKeyframes(e) {
            const t = [];
            for (const i of e.cssRules) {
                if (!(i instanceof CSSKeyframeRule))
                    continue;
                const e = this.extractProperties(i.style);
                t.push({
                    keyText: i.keyText,
                    style: e
                })
            }
            return t
        }
    }
    class $ {
        constructor() {
            this.analyticsStore = H;
            this.analyticsProxyController = new B({
                analyticsStore: this.analyticsStore,
                applicationController: this
            });
            this.navigationProxyController = new x({
                applicationController: this
            });
            this.styleExtractorController = new V
        }
        getNavigationUrl(e, t) {
            return e.url
        }
        getShouldOpenNewTab(e, t) {
            return e.openNewTab
        }
    }
    class G {
        constructor() {
            this.handleIntersection = e => {
                e.forEach((e => {
                    if (e.isIntersecting) {
                        const t = e.target;
                        this.onElementAppear(t);
                        this.observedElements.delete(t);
                        this.observer.unobserve(t)
                    }
                }
                ))
            }
            ;
            this.observer = new IntersectionObserver(this.handleIntersection,{
                threshold: .5
            });
            this.observedElements = new Map
        }
        onElementAppear(e) {
            const t = this.observedElements.get(e);
            t && t(e)
        }
        observe(e, t) {
            if (( () => {
                const t = e.getBoundingClientRect()
                  , i = window.innerHeight;
                return t.bottom >= 0 && t.top < i
            }
            )())
                t(e);
            else if (!this.observedElements.has(e)) {
                this.observedElements.set(e, t);
                this.observer.observe(e)
            }
        }
        unobserve(e) {
            if (this.observedElements.has(e)) {
                this.observedElements.delete(e);
                this.observer.unobserve(e)
            }
        }
    }
    function U() {
        return new G
    }
    function j(e, t) {
        const i = [...e].filter(( ([e,i]) => t(i, e)));
        return new Map(i)
    }
    function q(e, t) {
        const i = [...e].sort(( ([e,i], [s,n]) => t(i, n)));
        return new Map(i)
    }
    function W(e, t) {
        const i = new Map(e);
        for (const [e,s] of t)
            i.set(e, s);
        return i
    }
    function z(e) {
        const t = t => {
            "Escape" === t.key && e()
        }
        ;
        document.addEventListener("keydown", t);
        return () => {
            document.removeEventListener("keydown", t)
        }
    }
    function Y(e, t) {
        let i, s = 0;
        return function() {
            const n = this
              , o = arguments
              , r = Date.now();
            if (r - s >= t) {
                i && window.clearTimeout(i);
                e.apply(n, o);
                s = r
            } else
                i || (i = window.setTimeout(( () => {
                    e.apply(n, o);
                    s = Date.now();
                    i = void 0
                }
                ), t))
        }
    }
    const Q = {
        BANNER: "BANNER",
        MODAL: "MODAL",
        SLIDE_IN: "SLIDE_IN",
        EMBEDDED: "EMBEDDED"
    }
      , X = () => document.getElementById("hubspot-web-interactives-loader")
      , K = (e, t) => {
        if (!t)
            return null;
        const i = t.getAttribute(e);
        return i || null
    }
      , J = e => {
        const t = K("data-hsjs-portal", e);
        return t ? parseInt(t, 10) : null
    }
      , Z = e => {
        const t = K("data-hsjs-env", e);
        return t || "prod"
    }
      , ee = e => {
        const t = K("data-hsjs-hublet", e);
        return t || "na1"
    }
      , te = e => {
        const t = K("data-hsjs-local", e);
        return !!t && "true" === t
    }
      , ie = e => K("src", e)
      , se = () => {
        const e = X();
        return e ? {
            portalId: J(e),
            env: Z(e),
            hublet: ee(e),
            isLocal: te(e),
            src: ie(e)
        } : null
    }
      , ne = () => window
      , oe = ["previewInteractiveId", "preview_web_interactive", "preview_key", "_preview", "portalId", "hs_preview"];
    function re() {
        const e = new URLSearchParams(ne().location.search)
          , t = {};
        e.forEach(( (e, i) => {
            oe.includes(i) || (t[i] = e)
        }
        ));
        return t
    }
    function ae({contentId: e, portalId: t, env: i, hublet: s, useSameOrigin: n=!1}) {
        const o = "qa" === i ? "qa" : ""
          , r = "na1" === s ? "" : `-${s}`
          , a = document.location.protocol;
        return n ? `${window.location.origin}/hs-web-interactive-${t}-${e}` : `${a}//${t}.hs-sites${o}${r}.com/hs-web-interactive-${t}-${e}`
    }
    function ce(e, t, i) {
        const s = ne();
        let n = {};
        t.contactPreviewEmail && (n.email = t.contactPreviewEmail);
        const o = i.analytics && i.analytics.hutk;
        o && (n.utk = o);
        s.location.search.includes("hs_debug_interactive") && (n.hs_debug_interactive = "true");
        const r = re();
        n = Object.assign({}, r, n);
        return f(e, n)
    }
    function le(e, t) {
        if (null == e)
            return {};
        var i, s, n = {}, o = Object.keys(e);
        for (s = 0; s < o.length; s++) {
            i = o[s];
            t.indexOf(i) >= 0 || (n[i] = e[i])
        }
        return n
    }
    function he(e, t) {
        t.hutk && e.searchParams.set("utk", `${t.hutk}`);
        t.hstc && e.searchParams.set("__hstc", `${t.hstc}`);
        t.hssc && e.searchParams.set("__hssc", `${t.hssc}`);
        t.referrer && e.searchParams.set("referrer", `${t.referrer}`);
        t.pageId && e.searchParams.set("contentId", t.pageId)
    }
    function de({contentIds: e, currentUrl: t, isPreview: i, portalId: s, env: n, hublet: o="na1", versionId: r, analytics: a, extraParams: c, path: l}) {
        const h = "qa" === n ? "qa" : "";
        let d = "";
        d = window.location.search.includes("useLocalPublicService") ? `https://local.hubspotqa.com/web-interactives/public/v1/${l}` : "na1" === o ? `https://cta-service-cms2.hubspot${h}.com/web-interactives/public/v1/${l}` : `https://cta-${o}.hubspot${h}.com/web-interactives/public/v1/${l}`;
        const u = new URL(d);
        i && u.searchParams.set("isPreview", "true");
        e && e.length && e.forEach((e => u.searchParams.append("contentIds", `${e}`)));
        s && u.searchParams.set("portalId", `${s}`);
        t && !i && u.searchParams.set("currentUrl", t);
        r && u.searchParams.set("versionId", `${r}`);
        a && !i && he(u, a);
        c && Object.keys(c).forEach((e => u.searchParams.set(e, `${c[e]}`)));
        return u.href
    }
    const ue = ["previewScheduled", "templatePath", "isMobile"]
      , me = "embed/combinedConfigs"
      , ge = "embed/templateConfig";
    function pe(e) {
        let {previewScheduled: t, templatePath: i, isMobile: s} = e
          , n = le(e, ue)
          , o = "";
        o = i ? ge : me;
        const r = {};
        t && (r.previewScheduled = "true");
        i && (r.templatePath = i);
        s && (r.isMobile = "true");
        return de(Object.assign({}, n, {
            extraParams: r,
            path: o
        }))
    }
    const fe = {
        TOP: "TOP",
        BOTTOM: "BOTTOM",
        TOP_LEFT: "TOP_LEFT",
        TOP_RIGHT: "TOP_RIGHT",
        BOTTOM_LEFT: "BOTTOM_LEFT",
        BOTTOM_RIGHT: "BOTTOM_RIGHT"
    }
      , ve = -1
      , Ce = (e, t=1) => {
        if (!e)
            return {
                r: null,
                g: null,
                b: null,
                a: t
            };
        if (3 === (e = e.replace("#", "")).length) {
            const t = e.split("").reduce(( (e, t) => e + t + t), "");
            e = t
        }
        return {
            r: parseInt(e.substring(0, 2), 16),
            g: parseInt(e.substring(2, 4), 16),
            b: parseInt(e.substring(4, 6), 16),
            a: t
        }
    }
      , Te = (e, t=1) => {
        const i = Ce(e, t);
        return `rgba(${i.r}, ${i.g}, ${i.b}, ${i.a})`
    }
    ;
    class ye {
        constructor() {
            this.fetchConfigs = () => {
                const e = this.store.state.configRequest;
                if (!e)
                    return Promise.resolve(null);
                const t = pe(e);
                return this.fetch(t)
            }
            ;
            this.handleFetchFailed = () => {
                this.store.setState((e => Object.assign({}, e, {
                    requestError: !0
                })))
            }
            ;
            this.handleFetchSucceded = ({sortedAudienceConfigs: e, requestedConfigs: t}) => {
                const i = structuredClone(this.configs);
                e && e.length && e.forEach((e => i.set(e.contentModelId, e)));
                t && t.length && t.forEach((e => {
                    i.has(e.contentModelId) || i.set(e.contentModelId, e)
                }
                ));
                this.store.setState((e => Object.assign({}, e, {
                    configs: i,
                    isLoaded: !0
                })))
            }
            ;
            this.handleTemplateSucceded = e => {
                const t = Object.assign({}, e, {
                    contentModelId: ve
                });
                this.store.setState((e => Object.assign({}, e, {
                    templateConfig: t,
                    isLoaded: !0
                })))
            }
            ;
            const e = {
                configs: new Map,
                configRequest: null,
                requestError: !1,
                isLoaded: !1
            };
            this.store = new E(e)
        }
        init(e) {
            this.store.setState((t => Object.assign({}, t, {
                configRequest: e
            })));
            return this.fetchConfigs()
        }
        subscribe(e) {
            return this.store.subscribe(e)
        }
        get configs() {
            return this.store.state.configs
        }
        get isLoaded() {
            return this.store.state.isLoaded
        }
        get sortedConfigsWithSpecificty() {
            return q(this.configsWithAudience, ( (e, t) => t.specificity - e.specificity))
        }
        get configsWithAudience() {
            return j(this.configs, (e => e.specificity > 0))
        }
        get overlayedConfigsWithNoAudience() {
            return j(this.overlayedConfigs, (e => !e.specificity))
        }
        get overlayedConfigs() {
            return j(this.configs, (e => e.containerType !== Q.EMBEDDED))
        }
        get embeddedConfigs() {
            const e = j(this.configs, (e => e.containerType === Q.EMBEDDED));
            this.templateConfig && this.templateConfig.containerType === Q.EMBEDDED && e.set(ve, this.templateConfig);
            return e
        }
        get templateConfig() {
            return this.store.state.templateConfig
        }
        get previewConfig() {
            const [e] = this.store.state.configs.values();
            return e
        }
        fetch(e) {
            return fetch(e).then((e => {
                if (!e.ok) {
                    this.handleFetchFailed();
                    return Promise.resolve(null)
                }
                return e.json().then((e => {
                    e.templatePath ? this.handleTemplateSucceded(e) : this.handleFetchSucceded(e);
                    return e
                }
                )).catch(this.handleFetchFailed)
            }
            )).catch(this.handleFetchFailed)
        }
        fetchConfigsWithIds(e) {
            const t = this.store.state.configRequest;
            if (!t)
                return;
            const i = pe(Object.assign({}, t, {
                contentIds: e
            }));
            this.fetch(i)
        }
        static getStylesFromContainerStyles(e) {
            let t = e.width.value || 5
              , i = e.height.value || 5;
            "px" === e.width.units && (t = Math.max(t, 5));
            "px" === e.height.units && (i = Math.max(i, 5));
            return {
                width: `${t}${e.width.units}`,
                height: `${i}${e.height.units}`
            }
        }
        static getStylesForIframe(e) {
            const t = {}
              , {border: i, borderRadius: s, boxShadow: n} = e;
            i && (t.border = `${i.width.value}${i.width.units} ${i.style} ${Te(i.color, i.opacity / 100)}`);
            n && n.css && (t.boxShadow = n.css.split(":")[1]);
            s && (t.borderRadius = `${s.value}${s.units}`);
            return t
        }
        static isFloatingButtonLike(e) {
            return "isDismissable"in e && (e.containerType === Q.SLIDE_IN && !e.isDismissable)
        }
        static isTopBannerLike(e) {
            return e.containerType === Q.BANNER && e.containerStyles.position === fe.TOP
        }
        static buildConfigRequest(e, t=[], i) {
            const {isPreview: s, currentUrl: n, portalId: o, env: r, hublet: a, isMobile: c, templatePath: l, versionId: h} = e;
            return {
                contentIds: t,
                currentUrl: n,
                portalId: o,
                env: r,
                hublet: a,
                analytics: Object.assign({}, i),
                isMobile: c,
                isPreview: s,
                templatePath: l,
                versionId: h
            }
        }
    }
    var be = new ye;
    const Ee = () => /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      , we = ["hs_preview", "preview_key"];
    class Se {
        constructor() {
            this.portalId = 0;
            this.env = "";
            this.hublet = "na1";
            this.isLocal = !1;
            this.isMobile = !1;
            this.isLiveHSPage = !1;
            this.isPreview = !1;
            this.isScreenshot = !1;
            this.isTemplate = !1;
            this.previewScheduled = !1;
            this.enableResponsiveStyles = !1;
            this.isPreviewPage = !1;
            this.gates = [];
            this.win = ne();
            this.currentUrl = this.win.location.href
        }
        init() {
            this._setEnvProps();
            this._setUrlProps()
        }
        _setEnvProps() {
            var e, t, i;
            const s = se();
            this.portalId = s.portalId;
            this.hublet = s.hublet;
            this.env = s.env;
            this.isLocal = s.isLocal;
            this.isMobile = Ee();
            this.isPreviewPage = we.some((e => this.win.location.search.includes(e)));
            this.pageId = (null === (e = this.win.hsVars) || void 0 === e ? void 0 : e.analytics_page_id) || (null === (t = this.win.hsVars) || void 0 === t ? void 0 : t.page_id);
            this.isLiveHSPage = Boolean(this.pageId);
            this.language = null === (i = this.win.hsVars) || void 0 === i ? void 0 : i.language
        }
        isCosPreviewPage() {
            const e = this.win.location.toString();
            return /preview(-[^.]+)?\.hs-sites(qa)?(-[^.]+)?\.com/g.test(e) || /hubspotpreview(qa)?(-[^.]+)?/.test(e) || this.win.location.search.includes("hs_preview") || this.win.location.search.includes("preview_key")
        }
        isCos() {
            if (this.win.hsVars && this.win.hsVars.portal_id)
                return !0;
            return [...document.getElementsByTagName("meta")].some((e => "generator" === e.getAttribute("name") && "HubSpot" === e.getAttribute("content")))
        }
        _setUrlProps() {
            const e = new URLSearchParams(this.win.location.search);
            if (e.has("templatePath")) {
                this.templatePath = e.get("templatePath");
                this.isTemplate = !0
            }
            e.has("previewScheduled") && (this.previewScheduled = "true" === e.get("previewScheduled"));
            e.has("enableResponsiveStyles") && (this.enableResponsiveStyles = "true" === e.get("enableResponsiveStyles"));
            e.has("versionId") && (this.versionId = parseInt(e.get("versionId"), 10));
            if (e.has("screenshotBodyHeight")) {
                this.screenshotBodyHeight = parseInt(e.get("screenshotBodyHeight"), 10);
                this.isScreenshot = !0
            }
            if (e.has("publishedPreview")) {
                this.isPreview = !0;
                this.previewScheduled = !0;
                this.versionId = -1
            }
            if (e.has("previewInteractiveId")) {
                this.previewId = parseInt(e.get("previewInteractiveId"), 10);
                this.isPreview = !0
            }
            this.isPreview && e.has("email") && (this.contactPreviewEmail = e.get("email"));
            this.currentUrl = this.win.location.href
        }
        setGates(e) {
            this.gates = e
        }
        isUngatedFor(e) {
            return this.gates.includes(e)
        }
        refresh() {
            this._setUrlProps()
        }
    }
    var Ae = new Se;
    class Ie {
        constructor() {
            this.markAsViewed = e => {
                this.store.setState((t => Object.assign({}, t, {
                    viewed: new Set([...t.viewed, e])
                })))
            }
            ;
            const e = {
                viewed: new Set
            };
            this.store = new E(e)
        }
        subscribe(e) {
            this.store.subscribe(e)
        }
        hasBeenViewed(e) {
            return this.store.state.viewed.has(e)
        }
        get viewed() {
            return this.store.state.viewed
        }
    }
    function Me() {
        return new Ie
    }
    const Oe = "hs-cta-trigger-button"
      , _e = "hs-cta-embed"
      , Pe = "web-interactives-preview-wrapper";
    var Le = () => Array.from(document.getElementsByClassName(Oe));
    var Re = () => Array.from(document.getElementsByClassName(_e));
    const Fe = () => {
        try {
            return Array.from(document.querySelectorAll("a[href*='HS_DISPLAY_CALL_TO_ACTION'"))
        } catch (e) {
            return []
        }
    }
      , Ne = e => {
        const t = e.getAttribute("href");
        if (!t)
            return null;
        const i = /\(([^)]+)\)/.exec(t);
        if (!i)
            return null;
        const s = i[1];
        return s ? JSON.parse(s.replace(/(['"])?([a-z0-9A-Z_]+)(['"])?:/g, '"$2": ').replaceAll("'", '"')).id : null
    }
    ;
    var He = e => {
        const t = Array.from(e.classList).filter((e => e.startsWith(Oe) && e !== Oe || e.startsWith(_e) && e !== _e)).map((e => e.split("-").pop()));
        let i = Number(t);
        if (Number.isNaN(i)) {
            const t = e.dataset.hubspotWrapperCtaId;
            i = Number(t)
        }
        return i
    }
    ;
    function ke(e) {
        return Number(e.dataset.hubspotWrapperCtaId)
    }
    function De() {
        return Array.from(document.querySelectorAll(".hs-web-interactive-inline[data-hubspot-wrapper-cta-id]"))
    }
    const Be = () => {
        const e = new Map
          , t = new Map
          , i = new Map
          , s = new Set
          , n = new Set
          , o = new Set;
        Le().forEach((t => {
            const i = He(t);
            s.add(i);
            const n = e.get(i);
            n ? e.set(i, [...n, t]) : e.set(i, [t])
        }
        ));
        Re().forEach((e => {
            const i = He(e);
            n.add(i);
            const s = t.get(i);
            s ? t.set(i, [...s, e]) : t.set(i, [e])
        }
        ));
        Fe().forEach((t => {
            const i = Ne(t);
            if (!i)
                return;
            s.add(i);
            const n = e.get(i);
            n ? e.set(i, [...n, t]) : e.set(i, [t])
        }
        ));
        De().forEach(( (e, t) => {
            const s = ke(e);
            if (!s)
                return;
            e.id = `hs-interactive-container-${s}-${t}`;
            o.add(s);
            const n = i.get(s);
            n ? i.set(s, [...n, e]) : i.set(s, [e])
        }
        ));
        const r = [...new Set([...s, ...n, ...o])];
        return {
            clickTriggerButtons: e,
            embedContainers: t,
            nonFramedCTAContainers: i,
            clickTriggerIds: s,
            embedIds: n,
            nonFramedIds: o,
            uniqueIds: r
        }
    }
      , xe = (e, t) => {
        const i = document.createElement("div");
        i.innerHTML = t;
        return i.firstElementChild
    }
    ;
    let Ve = {
        data: ""
    }
      , $e = e => {
        try {
            let t = e ? e.querySelector("#_goober") : self._goober;
            return t || (t = (e || document.head).appendChild(document.createElement("style")),
            t.innerHTML = " ",
            t.id = "_goober"),
            t.firstChild
        } catch (e) {}
        return Ve
    }
      , Ge = /(?:([a-z0-9-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(})/gi
      , Ue = /\/\*.*?\*\/|\s{2,}|\n/gm
      , je = (e, t, i) => {
        let s = ""
          , n = ""
          , o = "";
        for (let r in e) {
            let a = e[r];
            if ("object" == typeof a) {
                let e = t + " " + r;
                /&/g.test(r) && (e = r.replace(/&/g, t)),
                "@" == r[0] && (e = t,
                "f" == r[1] && (e = r)),
                /@k/.test(r) ? n += r + "{" + je(a, "", "") + "}" : n += je(a, e, e == t ? r : i || "")
            } else
                /^@i/.test(r) ? s = r + " " + a + ";" : o += je.p ? je.p(r.replace(/[A-Z]/g, "-$&").toLowerCase(), a) : r.replace(/[A-Z]/g, "-$&").toLowerCase() + ":" + a + ";"
        }
        if (o[0]) {
            let e = t + "{" + o + "}";
            return i ? n + i + "{" + e + "}" : s + e + n
        }
        return s + n
    }
      , qe = {}
      , We = (e, t, i, s) => {
        let n = e.toLowerCase ? e : function e(t) {
            let i = "";
            for (let s in t)
                "object" == typeof val ? i += s + e(t[s]) : i += s + t[s];
            return i
        }(e)
          , o = qe[n] || (qe[n] = ".go" + n.split("").reduce(( (e, t) => 101 * e + t.charCodeAt(0) >>> 0), 11));
        return ( (e, t, i) => {
            t.data.indexOf(e) < 0 && (t.data = i ? e + t.data : t.data + e)
        }
        )(qe[o] || (qe[o] = je(e[0] ? (e => {
            let t, i = [{}];
            for (; t = Ge.exec(e.replace(Ue, "")); )
                t[4] && i.shift(),
                t[3] ? i.unshift(i[0][t[3]] = i[0][t[3]] || {}) : t[4] || (i[0][t[1]] = t[2]);
            return i[0]
        }
        )(e) : e, i ? "" : o)), t, s),
        o.slice(1)
    }
      , ze = (e, t, i) => e.reduce(( (e, s, n) => {
        let o = t[n];
        if (o && o.call) {
            let e = o(i)
              , t = e && e.props && e.props.className || /^go/.test(e) && e;
            o = t ? "." + t : e && e.props ? "" : e
        }
        return e + s + (null == o ? "" : o)
    }
    ), "");
    function Ye(e) {
        let t = this || {}
          , i = e.call ? e(t.p) : e;
        return We(i.map ? ze(i, [].slice.call(arguments, 1), t.p) : i, $e(t.target), t.g, t.o)
    }
    Ye.bind({
        g: 1
    });
    const Qe = Ye(["position:fixed;display:block;width:100%;height:0px;margin:0px;padding:0px;overflow:visible;transform-style:preserve-3d;background:transparent;backface-visibility:hidden;pointer-events:none;left:0px;z-index:9998;"])
      , Xe = Ye(["top:0px;z-index:9999;height:100%;width:100%;"])
      , Ke = Ye(["bottom:0px;"])
      , Je = Ye(["position:fixed;z-index:9989;"])
      , Ze = Ye(["left:0;bottom:0;"])
      , et = Ye(["right:0;bottom:0;"])
      , tt = Ye(["left:0;top:0;"])
      , it = Ye(["right:0;top:0;"])
      , st = Ye(["position:relative;overflow:hidden;display:none;"])
      , nt = Ye(["display:block;"])
      , ot = "hs-web-interactives-banner-style-element"
      , rt = "hs-web-interactives-top-banner-open"
      , at = "hs-web-interactives-top-anchor"
      , ct = "hs-web-interactives-top-push-anchor"
      , lt = "hs-web-interactives-bottom-anchor"
      , ht = "hs-web-interactives-floating-container"
      , dt = "hs-web-interactives-floating-top-left-anchor"
      , ut = "hs-web-interactives-floating-top-right-anchor"
      , mt = "hs-web-interactives-floating-bottom-left-anchor"
      , gt = "hs-web-interactives-floating-bottom-right-anchor"
      , pt = e => `\n  .${rt} .hs-is-fixed-element {\n    translate: 0px ${e}px!important;\n  }\n`
      , ft = () => `\n<div class="${Qe} ${Xe}" id="${at}"></div>\n<div class="${Qe} ${Ke}" id="${lt}"></div>\n<div id="${ht}">\n  <div id="${dt}" class="${Je} ${tt}" >\n  </div>\n  <div id="${ut}" class="${Je} ${it}">\n  </div>\n  <div id="${mt}" class="${Je} ${Ze}">\n  </div>\n  <div id="${gt}" class="${Je} ${et}">\n  </div>\n</div>\n`;
    class vt {
        constructor() {
            this.render();
            this.topPushAnchor = document.getElementById(ct);
            this.topAnchor = document.getElementById(at);
            this.bottomAnchor = document.getElementById(lt);
            this.floatingAnchors = {
                [fe.TOP_LEFT]: document.getElementById(dt),
                [fe.TOP_RIGHT]: document.getElementById(ut),
                [fe.BOTTOM_LEFT]: document.getElementById(mt),
                [fe.BOTTOM_RIGHT]: document.getElementById(gt)
            };
            this.bottomRightFloatingButtonAnchor = this.floatingAnchors.BOTTOM_RIGHT
        }
        attachInteractiveOverlayToAnchor(e) {
            e.containerType !== Q.MODAL ? e.isFloatingButtonLike ? this.attachFloatingButton(e) : e.containerType !== Q.BANNER && e.containerType !== Q.SLIDE_IN || this.attachBanner(e) : this.attachModal(e)
        }
        attachModal(e) {
            this.topAnchor.appendChild(e.container)
        }
        attachBanner(e) {
            e.position === fe.BOTTOM || e.position === fe.BOTTOM_LEFT || e.position === fe.BOTTOM_RIGHT ? this.bottomAnchor.appendChild(e.container) : e.position !== fe.TOP && e.position !== fe.TOP_RIGHT && e.position !== fe.TOP_LEFT || this.topAnchor.appendChild(e.container)
        }
        attachFloatingButton(e) {
            const t = this.floatingAnchors[e.position];
            t && t.appendChild(e.container)
        }
        addMarginForConversations(e) {
            this.bottomRightFloatingButtonAnchor.style.marginBottom = `${e}px`
        }
        removeMarginForConversations() {
            this.bottomRightFloatingButtonAnchor.style.marginBottom = ""
        }
        insertPushBanner() {
            const e = document.createElement("div");
            e.id = ct;
            e.classList.add(st);
            document.body.prepend(e)
        }
        setTopPushHeight(e) {
            this.topPushAnchor.style.height = `${e}px`
        }
        showPushBanner(e) {
            this.setTopPushHeight(e);
            this.topPushAnchor.classList.add(nt);
            document.body.classList.add(rt);
            const t = document.createElement("style");
            t.id = ot;
            t.innerHTML = pt(e);
            document.head.appendChild(t)
        }
        hidePushBanner() {
            this.topPushAnchor.classList.remove(nt);
            document.body.classList.remove(rt);
            const e = document.getElementById(ot);
            e && document.head.removeChild(e)
        }
        render() {
            this.insertPushBanner();
            document.body.insertAdjacentHTML("beforeend", ft())
        }
    }
    const Ct = Ye(["position:absolute;pointer-events:none;width:101vw;height:101vh;background:rgba(0,0,0,0.7);opacity:0;z-index:-1;"])
      , Tt = Ye(["z-index:99998;opacity:0.8;visibility:visible;pointer-events:all;cursor:pointer;"])
      , yt = Ye(["overflow:hidden;"]);
    class bt {
        constructor({parent: e, handleClick: t=( () => {}
        )}) {
            this.disableBodyScroll = !1;
            this.overlay = document.createElement("div");
            this.overlay.id = "hs-interactives-modal-overlay";
            this.overlay.classList.add(Ct);
            this.handleClick = t;
            this.render(e);
            this.listenForClick()
        }
        listenForClick() {
            this.overlay.addEventListener("click", this.handleClick)
        }
        enableDisableBodyScroll() {
            this.disableBodyScroll = !0
        }
        show() {
            this.overlay.classList.add(Tt);
            this.disableBodyScroll && document.body.classList.add(yt)
        }
        hide() {
            this.overlay.classList.remove(Tt);
            document.body.classList.remove(yt)
        }
        render(e) {
            e.appendChild(this.overlay)
        }
    }
    const Et = {
        modalPosition: null,
        bannerPositions: {
            TOP_LEFT: null,
            TOP_RIGHT: null,
            BOTTOM_LEFT: null,
            BOTTOM_RIGHT: null,
            BOTTOM: null,
            TOP: null
        },
        floatingPositions: {
            TOP_LEFT: null,
            TOP_RIGHT: null,
            BOTTOM_LEFT: null,
            BOTTOM_RIGHT: null
        }
    }
      , wt = [fe.TOP, fe.TOP_LEFT, fe.TOP_RIGHT]
      , St = [fe.BOTTOM, fe.BOTTOM_LEFT, fe.BOTTOM_RIGHT];
    class At {
        constructor({isMobile: e=!1}) {
            this.isMobile = !1;
            this.store = new E(Et);
            this.isMobile = e
        }
        setPosistionFromConfig(e) {
            const {contentModelId: t, containerType: i, containerStyles: {position: s}} = e
              , n = ye.isFloatingButtonLike(e);
            i === Q.MODAL ? this.setModalPosition(t) : i !== Q.BANNER && !Q.SLIDE_IN || n ? n && this.setFloatingPosition(s, t) : this.setBannerPosition(s, t)
        }
        get modalPosition() {
            return this.store.state.modalPosition
        }
        get bannerPositions() {
            return this.store.state.bannerPositions
        }
        get floatingPositions() {
            return this.store.state.floatingPositions
        }
        canBeInsertedIntoPosition(e) {
            return this.isMobile ? this.canBeInsertedIntoPositionMobile(e) : this.canBeInsertedIntoPositionDesktop(e)
        }
        canBeInsertedIntoPositionMobile(e) {
            const t = ye.isFloatingButtonLike(e);
            return e.containerType === Q.MODAL ? !this.modalPosition : e.containerType === Q.BANNER || e.containerType === Q.SLIDE_IN && !t ? Object.keys(this.bannerPositions).reduce(( (e, t) => e && !this.bannerPositions[t]), !0) : !!t && Object.keys(this.floatingPositions).reduce(( (e, t) => e && !this.floatingPositions[t]), !0)
        }
        canBeInsertedIntoPositionDesktop(e) {
            const t = ye.isFloatingButtonLike(e);
            return e.containerType === Q.MODAL ? !this.modalPosition : e.containerType === Q.BANNER || e.containerType === Q.SLIDE_IN && !t ? St.includes(e.containerStyles.position) ? !this.bannerPositions[fe.BOTTOM] && !this.bannerPositions[fe.BOTTOM_LEFT] && !this.bannerPositions[fe.BOTTOM_RIGHT] : !!wt.includes(e.containerStyles.position) && (!this.bannerPositions[fe.TOP] && !this.bannerPositions[fe.TOP_LEFT] && !this.bannerPositions[fe.TOP_RIGHT]) : !!t && !this.floatingPositions[e.containerStyles.position]
        }
        setModalPosition(e) {
            this.store.setState((t => Object.assign({}, t, {
                modalPosition: e
            })))
        }
        setBannerPosition(e, t) {
            this.store.setState((i => {
                const s = i.bannerPositions;
                return Object.assign({}, i, {
                    bannerPositions: Object.assign({}, s, {
                        [e]: t
                    })
                })
            }
            ))
        }
        setFloatingPosition(e, t) {
            this.store.setState((i => {
                const s = i.floatingPositions;
                return Object.assign({}, i, {
                    floatingPositions: Object.assign({}, s, {
                        [e]: t
                    })
                })
            }
            ))
        }
        getAllIds() {
            const e = [];
            "number" == typeof this.modalPosition && null !== this.modalPosition && e.push(this.modalPosition);
            for (const [t,i] of Object.entries(this.bannerPositions))
                i && Number.isInteger(i) && e.push(i);
            for (const [t,i] of Object.entries(this.floatingPositions))
                i && Number.isInteger(i) && e.push(i);
            return e
        }
        removeCTA(e) {
            this.modalPosition === e && this.store.setState((e => Object.assign({}, e, {
                modalPosition: null
            })));
            for (const [t,i] of Object.entries(this.bannerPositions))
                i === e && this.store.setState((e => Object.assign({}, e, {
                    bannerPositions: Object.assign({}, e.bannerPositions, {
                        [t]: null
                    })
                })));
            for (const [t,i] of Object.entries(this.floatingPositions))
                i === e && this.store.setState((e => Object.assign({}, e, {
                    floatingPositions: Object.assign({}, e.floatingPositions, {
                        [t]: null
                    })
                })))
        }
    }
    function It(e) {
        return new At({
            isMobile: e
        })
    }
    const Mt = 6e4
      , Ot = 1440 * Mt
      , _t = 7 * Ot
      , Pt = 4 * _t
      , Lt = {
        REPEAT_ONCE: "REPEAT_ONCE",
        REPEAT_FOREVER: "REPEAT_FOREVER",
        ONCE_OFF: "ONCE_OFF"
    }
      , Rt = {
        DAYS: "DAYS",
        MONTHS: "MONTHS",
        WEEKS: "WEEKS",
        MINUTES: "MINUTES"
    }
      , Ft = Object.freeze({
        DAYS: Ot,
        MONTHS: Pt,
        WEEKS: _t,
        MINUTES: Mt
    })
      , Nt = "WI_IGNORED"
      , Ht = "WI_FREQUENCY"
      , kt = {
        frequency: Lt.REPEAT_ONCE,
        backoff: {
            backoffTimeDuration: 2,
            backoffTimeUnit: Rt.WEEKS
        }
    }
      , Dt = e => {
        try {
            if (!localStorage.getItem(`${Ht}_${e}`)) {
                const t = localStorage.getItem(`${Nt}_${e}`);
                if (!t)
                    return !1;
                return parseInt(t, 10) > Date.now() - 2 * Ft.WEEKS
            }
            const t = JSON.parse(localStorage.getItem(`${Ht}_${e}`));
            switch (t.frequency) {
            case Lt.ONCE_OFF:
                return !0;
            case Lt.REPEAT_FOREVER:
                return !1;
            case Lt.REPEAT_ONCE:
                {
                    const {timeSaved: e, backoffTimeDuration: i, backoffTimeUnit: s} = t
                      , n = i * Ft[s];
                    return e > Date.now() - n
                }
            default:
                return !1
            }
        } catch (e) {
            return !1
        }
    }
      , Bt = (e, t) => {
        let i = t;
        i && i.frequency || (i = kt);
        const {frequency: s, backoff: n} = i;
        try {
            let t = {
                frequency: s
            };
            n && (t = Object.assign({}, t, n, {
                timeSaved: Date.now()
            }));
            localStorage.setItem(`${Ht}_${e}`, JSON.stringify(t))
        } catch (e) {
            return
        }
    }
      , xt = (e, {frequency: t, backoff: i}) => {
        try {
            if (!t)
                return;
            const s = `${Ht}_${e}`
              , n = JSON.parse(localStorage.getItem(s));
            if (!n)
                return;
            if (n.frequency !== t) {
                localStorage.removeItem(s);
                return
            }
            if (!i || !n.backoffTimeDuration)
                return;
            i.backoffTimeDuration === n.backoffTimeDuration && i.backoffTimeUnit === n.backoffTimeUnit || localStorage.removeItem(s)
        } catch (e) {
            return
        }
    }
      , Vt = Ye(["display:block !important;position:static !important;box-sizing:border-box !important;background:transparent !important;border:none;min-height:0px !important;max-height:none !important;margin:0px;padding:0px !important;height:100% !important;width:1px !important;max-width:100% !important;min-width:100% !important;"]);
    function $t(e, t={}) {
        i("Setting style on element", t, e);
        for (const i in t)
            Object.hasOwnProperty.call(t, i) && (e.style[i] = t[i])
    }
    const Gt = "hs-cta-embed__loaded"
      , Ut = () => {}
    ;
    class jt {
        constructor({src: e, contentId: t, containerStyle: i, configStyle: s, iframeStyle: n, containerType: o, isFloatingButtonLike: r, isTopBanner: a}) {
            this.onClose = Ut;
            this.setDeferredPromise();
            this.container = document.createElement("div");
            this.contentId = t;
            this.container.id = `hs-overlay-cta-${t}`;
            this.frameComponent = b({
                container: this.container,
                id: t,
                iframeSrc: e,
                onFrameReady: this.resolveFrameload,
                resizeHeight: s.scaleHeightToFitContent || Boolean(s.isSingleModuleOnly),
                useResponsiveStyling: s.useResponsiveStyling,
                extraAttributes: {
                    "aria-label": "Popup CTA",
                    title: "Popup CTA",
                    allow: "autoplay; fullscreen; clipboard-write"
                }
            });
            this.frameComponent.iframe.setAttribute("data-test-id", "interactive-frame");
            this.frameComponent.iframe.classList.add(Vt);
            this.containerStyle = i;
            this.iframeStyle = n;
            this.configStyle = s;
            this.containerType = o;
            this.position = s.position || null;
            this.isFloatingButtonLike = r;
            this.isTopBanner = a;
            this.applyStyleElements();
            this.render()
        }
        applyStyleElements() {
            this.frameComponent.setStyle(this.iframeStyle);
            $t(this.container, this.containerStyle)
        }
        setDeferredPromise() {
            this.frameLoadPromise = new Promise((e => {
                this.resolveFrameload = e
            }
            ))
        }
        open() {
            return this.frameLoadPromise.then(( () => {
                this.frameComponent.setStyle({
                    visibility: ""
                });
                this.container.classList.add(Gt);
                this.internalOpen()
            }
            )).catch(( () => {}
            ))
        }
        close() {}
        render() {}
        skipAnimation() {}
        setAnimationForClickTrigger() {}
        registerResizeHandler(t) {
            this.frameComponent.iframeCommunicator.registerHandlers({
                [e.NEW_HEIGHT]: t
            })
        }
        registerCloseHandler(t) {
            this.frameComponent.iframeCommunicator.registerHandlers({
                [e.CLOSE_INTERACTIVE]: t
            })
        }
        internalOpen() {}
        remove() {
            this.frameComponent.iframeCommunicator.remove();
            this.container.remove()
        }
    }
    const qt = (...e) => {
        i("[overlays/Modal]", ...e)
    }
      , Wt = Ye(["z-index:99999;visibility:hidden;position:absolute;inset:50vh auto auto 50%;transform:translate(-50%,-50%);left:50%;top:150%;pointer-events:none;max-height:95%;max-width:95%;"])
      , zt = Ye(["pointer-events:auto !important;visibility:visible;top:50%;transition:top 0.75s linear(0,0.006,0.023 2.2%,0.096 4.8%,0.532 15.4%,0.72 21%,0.793,0.853 26.7%,0.902,0.941,0.968 36.2%,0.987 39.7%,1 43.7%,1.007 48.3%,1.009 55.3%,1.002 78.2%,1 );"])
      , Yt = Ye(["transition:opacity 0.3s ease-in;"]);
    class Qt extends jt {
        internalOpen() {
            this.container.classList.add(zt);
            this.focusElement()
        }
        focusElement() {
            try {
                this.frameComponent.iframe.focus()
            } catch (e) {
                qt("Frame not defined", e)
            }
        }
        setAnimationForClickTrigger() {
            this.container.classList.add(Yt)
        }
        close() {
            this.container.classList.remove(zt)
        }
        render() {
            this.frameComponent.iframe.setAttribute("role", "dialog");
            this.container.classList.add(Wt)
        }
    }
    const Xt = Ye(["pointer-events:auto !important;visibility:visible !important;max-height:95vh !important;transition:max-height 1s ease-in;"])
      , Kt = Ye(["z-index:9999;width:100%;max-height:0px;position:fixed;max-height:95%;visibility:hidden;"])
      , Jt = Ye(["z-index:9999;width:100%;max-height:0px;position:fixed;max-height:95%;visibility:hidden;bottom:0px;"])
      , Zt = {
        [fe.TOP]: Kt,
        [fe.BOTTOM]: Jt
    };
    class ei extends jt {
        internalOpen() {
            this.container.classList.add(Xt)
        }
        close() {
            this.container.classList.remove(Xt)
        }
        addPositionClass() {
            const {position: e} = this.configStyle;
            this.container.classList.add(Zt[e])
        }
        render() {
            this.addPositionClass();
            this.container.classList.add(Kt)
        }
    }
    const ti = Ye(["visibility:hidden;"])
      , ii = Ye(["visibility:visible !important;"]);
    class si extends jt {
        internalOpen() {
            this.container.classList.add(ii)
        }
        close() {
            this.container.classList.remove(ii)
        }
        render() {
            this.container.classList.add(ti)
        }
    }
    const ni = Ye(["pointer-events:auto !important;visibility:visible !important;max-height:95vh !important;transform:none !important;"])
      , oi = Ye(["z-index:9999;width:100%;max-height:0px;position:fixed;max-height:95%;visibility:hidden;transition:transform 1s linear(0,0.006,0.022 2.3%,0.091 5.1%,0.18 7.6%,0.508 16.3%,0.607,0.691,0.762,0.822 28.4%,0.872,0.912 35.1%,0.944 38.9%,0.968 43%,0.985 47.6%,0.996 53.1%,1.001 58.4%,1.003 65.1%,1 );"])
      , ri = Ye(["z-index:9999;position:fixed;left:10px;top:10px;max-height:95vh !important;max-width:95%;visibility:hidden;"])
      , ai = Ye(["z-index:9999;position:fixed;right:10px;top:10px;max-height:95vh !important;max-width:95%;visibility:hidden;"])
      , ci = Ye(["z-index:9999;position:fixed;left:10px;bottom:10px;max-height:95vh !important;max-width:95%;visibility:hidden;"])
      , li = Ye(["z-index:9999;position:fixed;right:10px;bottom:10px;max-height:95vh !important;max-width:95%;visibility:hidden;"])
      , hi = Ye(["transition:none !important;"])
      , di = {
        [fe.BOTTOM_RIGHT]: li,
        [fe.BOTTOM_LEFT]: ci,
        [fe.TOP_RIGHT]: ai,
        [fe.TOP_LEFT]: ri
    };
    class ui extends jt {
        internalOpen() {
            this.container.classList.add(ni)
        }
        close() {
            this.container.classList.remove(ni)
        }
        skipAnimation() {
            this.container.classList.add(hi)
        }
        addPositionClass() {
            const {position: e} = this.configStyle;
            this.container.classList.add(di[e])
        }
        addOffset() {
            const e = this.containerStyle.width;
            if (!e)
                return;
            switch (this.configStyle.position) {
            case fe.BOTTOM_LEFT:
            case fe.TOP_LEFT:
                this.container.style.transform = `translateX(-${e})`;
                return;
            case fe.BOTTOM_RIGHT:
            case fe.TOP_RIGHT:
                this.container.style.transform = `translateX(calc(100% + ${e}))`;
                return
            }
        }
        render() {
            this.addPositionClass();
            this.addOffset();
            this.frameComponent.iframe.setAttribute("role", "dialog");
            this.container.classList.add(oi)
        }
    }
    function mi(e, t) {
        const i = ye.isFloatingButtonLike(e)
          , s = ye.isTopBannerLike(e)
          , n = {
            src: t,
            configStyle: e.containerStyles,
            contentId: e.contentModelId,
            containerType: e.containerType,
            containerStyle: ye.getStylesFromContainerStyles(e.containerStyles),
            iframeStyle: ye.getStylesForIframe(e.containerStyles),
            isFloatingButtonLike: i,
            isTopBanner: s
        };
        if (i)
            return new si(n);
        switch (e.containerType) {
        case Q.MODAL:
            return new Qt(n);
        case Q.BANNER:
            return new ei(n);
        case Q.SLIDE_IN:
            return new ui(n);
        default:
            return null
        }
    }
    function gi(e) {
        return e.button < 2
    }
    const pi = (...e) => {
        i("[ClickTrigger", ...e)
    }
      , fi = Ye(["cursor:pointer;"]);
    class vi {
        constructor(e, t) {
            this.button = e;
            this.onClick = t;
            this.init();
            this.addA11yAttributes()
        }
        addA11yAttributes() {
            this.button.setAttribute("aria-haspopup", "dialog");
            this.button.setAttribute("tabindex", "0")
        }
        init() {
            pi("Setting up click trigger");
            this.button.removeAttribute("href");
            this.button.removeAttribute("target");
            this.button.classList.add(fi);
            this.button.removeAttribute("href");
            this.button.removeAttribute("target");
            this.button.addEventListener("mouseup", (e => {
                pi("Mouse up on click trigger", e);
                gi(e) && this.onClick()
            }
            ));
            this.button.addEventListener("keypress", (e => {
                if ("Enter" === e.key) {
                    pi("Enter on click trigger", e);
                    this.onClick()
                }
            }
            ))
        }
    }
    class Ci {
        constructor({onTrigger: e}) {
            this.isExitIntent = e => {
                if (!e)
                    return !1;
                return !e.relatedTarget && e.clientY < 100
            }
            ;
            this.handleMouseOut = e => {
                this.isExitIntent(e) && this.onTrigger(this)
            }
            ;
            this.onTrigger = e;
            this.setup()
        }
        setup() {
            document.addEventListener("mouseout", this.handleMouseOut)
        }
        remove() {
            document.removeEventListener("mouseout", this.handleMouseOut)
        }
    }
    const Ti = 1e3
      , yi = ["mousedown", "mousemove", "keypress", "scroll", "touchstart"];
    class bi {
        constructor({onTrigger: e, value: t}) {
            this.resetTimer = () => {
                this.timeout && clearTimeout(this.timeout);
                this.timeout = setTimeout(( () => this.onTrigger(this)), this.seconds)
            }
            ;
            this.onTrigger = e;
            this.seconds = t * Ti;
            this.timeout = null;
            this.setup()
        }
        setup() {
            this.timeout = setTimeout(( () => this.onTrigger(this)), this.seconds);
            yi.forEach((e => {
                document.addEventListener(e, this.resetTimer)
            }
            ))
        }
        remove() {
            yi.forEach((e => {
                document.removeEventListener(e, this.resetTimer)
            }
            ));
            this.timeout && clearTimeout(this.timeout)
        }
    }
    function Ei() {
        let e = !1;
        try {
            const t = {
                get passive() {
                    e = !0
                }
            };
            window.addEventListener("test", t, t);
            window.removeEventListener("test", t, t)
        } catch (t) {
            e = !1
        }
        return e
    }
    function wi() {
        return Math.max(document.body.offsetHeight, document.body.scrollHeight)
    }
    function Si() {
        return Math.max(window.innerHeight || 0, document.documentElement.clientHeight)
    }
    function Ai() {
        return document.body.scrollTop || document.documentElement.scrollTop
    }
    class Ii {
        constructor({onTrigger: e, value: t}) {
            this.handleScroll = () => {
                const e = wi() - Si();
                100 * Ai() / e >= this.scrollPercent && this.onTrigger(this)
            }
            ;
            this.onTrigger = e;
            this.scrollPercent = t;
            this.supportsPassiveScrolling = Ei();
            this.setup()
        }
        setup() {
            this.supportsPassiveScrolling ? window.addEventListener("scroll", this.handleScroll, {
                capture: !0,
                passive: !0
            }) : window.addEventListener("scroll", this.handleScroll, !0)
        }
        remove() {
            this.supportsPassiveScrolling ? window.removeEventListener("scroll", this.handleScroll, {
                capture: !0
            }) : window.removeEventListener("scroll", this.handleScroll, !0)
        }
    }
    const Mi = 1e3;
    function Oi() {
        return document.timeline && document.timeline.currentTime ? document.timeline.currentTime : performance ? performance.now() : 0
    }
    class _i {
        constructor({onTrigger: e, value: t}) {
            this.onTrigger = e;
            const i = Oi();
            this.ms = Math.max(t * Mi - i, 0);
            this.timeout = null;
            this.setup()
        }
        setup() {
            this.timeout = setTimeout(( () => {
                this.onTrigger(this)
            }
            ), this.ms)
        }
        remove() {
            this.timeout && clearTimeout(this.timeout)
        }
    }
    function Pi(e, t) {
        const {showOnPageScroll: i, showOnExitIntent: s, showAfterDelay: n, showAfterInactivity: o, pageScrollPercentageTrigger: r, delayInSeconds: a, inactivityInSeconds: c} = e
          , l = [];
        i && l.push(new Ii({
            onTrigger: t,
            value: r || 0
        }));
        s && l.push(new Ci({
            onTrigger: t
        }));
        n && l.push(new _i({
            onTrigger: t,
            value: a || 0
        }));
        o && l.push(new bi({
            onTrigger: t,
            value: c || 0
        }));
        return l
    }
    function Li(e, t) {
        const i = new ResizeObserver((i => {
            for (const s of i)
                s.target === e && s.contentRect && t(s.contentRect.height, s.contentRect.height)
        }
        ));
        i.observe(e);
        return () => i.disconnect()
    }
    const Ri = "hubspot-messages-iframe-container"
      , Fi = () => {}
      , Ni = 220
      , Hi = 400
      , ki = "userInteractedWithWidget";
    class Di {
        constructor(e) {
            this.disconnectResizeObserver = Fi;
            this.conversationsFrameContainer = null;
            this.handleConversationsReady = () => {
                this.addConversationsEventListeners();
                this.pollForConversationsRendered().then(( () => {
                    this.conversationsFrameContainer = document.getElementById(Ri);
                    this.addConversationsStyleSheet();
                    this.listenForConversationsHeightChange();
                    this.setFloatingButtonOffset()
                }
                )).catch(( () => {}
                ))
            }
            ;
            this.overlayContainer = e;
            this.listenForConversationsReady()
        }
        listenForConversationsReady() {
            window.HubSpotConversations ? this.handleConversationsReady() : window.hsConversationsOnReady && window.hsConversationsOnReady.length ? window.hsConversationsOnReady = [...window.hsConversationsOnReady, this.handleConversationsReady] : window.hsConversationsOnReady = [this.handleConversationsReady]
        }
        listenForConversationsHeightChange() {
            if (!this.conversationsFrameContainer)
                return;
            const e = Li(this.conversationsFrameContainer, (e => {
                this.conversationsFrameContainer && e < Ni && this.setFloatingButtonOffset()
            }
            ));
            this.disconnectResizeObserver = e
        }
        addConversationsEventListeners() {
            window.HubSpotConversations && window.HubSpotConversations.on(ki, ( () => {
                Ee() && this.removeConversationsStyleSheet()
            }
            ))
        }
        pollForConversationsRendered() {
            return new Promise((e => {
                const t = setInterval(( () => {
                    if (document.getElementById(Ri)) {
                        e();
                        clearInterval(t)
                    }
                }
                ), Hi)
            }
            ))
        }
        setFloatingButtonOffset() {
            if (!this.overlayContainer || !this.conversationsFrameContainer)
                return;
            const e = this.conversationsFrameContainer.clientHeight;
            this.overlayContainer.addMarginForConversations(e)
        }
        addConversationsStyleSheet() {
            const e = document.createElement("style");
            e.id = "web-interactives-conversations-override";
            e.innerHTML = "#hubspot-messages-iframe-container { z-index: 9990!important; }";
            document.head.appendChild(e)
        }
        removeConversationsStyleSheet() {
            const e = document.getElementById("web-interactives-conversations-override");
            e && e.remove()
        }
    }
    function Bi(e) {
        return new Di(e)
    }
    class xi {
        constructor() {
            this.eventEmitter = n()
        }
        static getInstance() {
            xi.instance || (xi.instance = new xi);
            return xi.instance
        }
        emit(e, t) {
            this.eventEmitter.emit(e, t)
        }
        on(e, t) {
            this.eventEmitter.on(e, t)
        }
        off(e) {
            this.eventEmitter.off(e)
        }
        reset() {
            this.eventEmitter.reset()
        }
    }
    const Vi = {
        REFRESH: "REFRESH",
        CLOSE: "CLOSE",
        CLOSE_ALL: "CLOSE_ALL",
        TRIGGER_OPEN: "TRIGGER_OPEN",
        REPLACED_INLINE_HTML: "REPLACED_INLINE_HTML"
    }
      , $i = {
        HAS_CLOSED: "HAS_CLOSED"
    }
      , Gi = a;
    class Ui {
        constructor({configModel: t, environmentModel: i, analyticsModel: s, scheduledCTAsModel: n, handleView: o, scheduleCTA: r}) {
            this.triggerMap = new Map;
            this.shownModal = null;
            this.triggeredCTAFromCallback = null;
            this.clickTriggerComponentMap = new Map;
            this.interactiveComponentMap = new Map;
            this.conversationsController = null;
            this.eventManager = xi.getInstance();
            this.listenForKeypress = () => {
                z(( () => {
                    this.shownModal && this.closeOverlay(this.shownModal)
                }
                ))
            }
            ;
            this.sendAnalyticsToCTA = t => {
                Gi.broadcast(t, {
                    type: e.RECEIVED_ANALYTICS,
                    payload: this.analyticsModel.analytics
                })
            }
            ;
            this.handleTrigger = e => {
                if (!Dt(e)) {
                    this.openOverlay(e);
                    for (const [t,i] of this.triggerMap)
                        t === e && i.forEach((e => e.remove()));
                    this.triggerMap.delete(e)
                }
            }
            ;
            this.handleTriggerFromCTA = ({triggerCTA: e, id: t}) => {
                this.interactiveComponentMap.has(t) && (this.interactiveComponentMap.has(e) ? this.shouldCloseCalloutCTA(t) && this.closeOverlay(t) : this.triggeredCTAFromCallback = [e, t]);
                this.interactiveComponentMap.has(e) ? this.handleClickOpen(e) : this.scheduledCTAsModel.scheduledCTAs.has(e) || this.scheduleCTA(e)
            }
            ;
            this.handleClickOpen = e => {
                this.openOverlay(e, !0)
            }
            ;
            this.handleOverlayClick = () => {
                if (!Number.isInteger(this.shownModal))
                    return;
                const e = this.configModel.configs.get(this.shownModal);
                e && e.containerStyles.closeOnOverlayClick && this.closeOverlay(this.shownModal)
            }
            ;
            this.handlePageNavigation = ({id: e, openNewTab: t, url: i}) => {
                t || v(window.location.href, i) || this.shouldCloseCalloutCTA(e) && this.environmentModel.isUngatedFor("WebInteractives:CloseCTAOnNavigation") && this.shouldCloseCalloutCTA(e) && this.closeOverlay(e)
            }
            ;
            this.handleFormSubmission = ({id: e}) => {
                const t = this.configModel.configs.get(e);
                t && t.shouldCloseOnFormSubmission && t.isDismissable && this.closeOverlay(e)
            }
            ;
            this.closeOverlay = e => {
                const t = this.interactiveComponentMap.get(e);
                if (t) {
                    t.isTopBanner && this.overlayedInteractivesContainer.hidePushBanner();
                    t.containerType === Q.MODAL && this.overlay.hide();
                    t.close();
                    e === this.shownModal && (this.shownModal = null);
                    document.activeElement instanceof HTMLElement && document.activeElement.blur();
                    this.messageCTAClosed(e)
                }
            }
            ;
            this.configModel = t;
            this.environmentModel = i;
            this.analyticsModel = s;
            this.scheduledCTAsModel = n;
            this.overlayedInteractivesContainer = null;
            this.overlay = null;
            this.handleView = o;
            this.scheduleCTA = r;
            this.listenToConfigUpdates();
            this.listenForOpenCTAMessage();
            this.listenForKeypress();
            this.registerMessageHandlers();
            this.triggerOpen = this.handleClickOpen
        }
        init({clickTriggerButtons: e}) {
            this.posistionsOccupied = It(this.environmentModel.isMobile);
            this.overlayedInteractivesContainer = new vt;
            this.overlay = new bt({
                parent: this.overlayedInteractivesContainer.topAnchor,
                handleClick: this.handleOverlayClick
            });
            this.conversationsController = Bi(this.overlayedInteractivesContainer);
            this.createClickTriggerComponents(e)
        }
        registerMessageHandlers() {
            Gi.registerHandlers({
                [e.TRIGGER_CTA]: this.handleTriggerFromCTA,
                [e.NAVIGATE_PAGE]: this.handlePageNavigation,
                [e.CTA_FORM_SUBMITTED]: this.handleFormSubmission
            });
            this.eventManager.on(Vi.TRIGGER_OPEN, ( ({ctaToOpen: e}) => this.handleClickOpen(e)))
        }
        createClickTriggerComponents(e) {
            for (const [t,i] of e)
                i.forEach((e => {
                    const i = new vi(e,( () => this.handleClickOpen(t)))
                      , s = this.clickTriggerComponentMap.get(t) || [];
                    this.clickTriggerComponentMap.set(t, [...s, i])
                }
                ))
        }
        createOverlayInteractiveFromAudience(e) {
            if (!this.shouldCreateInteractiveOverlay(e))
                return !1;
            if (!this.createOverlayComponentAndSetOnMap(e))
                return !1;
            this.posistionsOccupied.setPosistionFromConfig(e);
            const t = Pi(e.triggers, ( () => this.handleTrigger(e.contentModelId)));
            this.triggerMap.set(e.contentModelId, t);
            return !0
        }
        createOverlayInteractivesWithAudience() {
            for (const [e,t] of this.configModel.sortedConfigsWithSpecificty)
                this.createOverlayInteractiveFromAudience(t)
        }
        createOverlayInteractivesWithNoAudience() {
            for (const [e,t] of this.configModel.overlayedConfigsWithNoAudience) {
                if (this.interactiveComponentMap.has(e))
                    continue;
                if (!this.createOverlayComponentAndSetOnMap(t))
                    return;
                if (this.scheduledCTAsModel.scheduledCTAs.has(e)) {
                    this.openOverlay(e, !0);
                    this.scheduledCTAsModel.removeCTA(e)
                }
                this.sendAnalyticsToCTA(e)
            }
        }
        createTemplateOverlayInteractive() {
            this.createOverlayComponentAndSetOnMap(this.configModel.templateConfig)
        }
        createPreviewOverlayInteractive() {
            this.createOverlayComponentAndSetOnMap(this.configModel.previewConfig)
        }
        createOverlayComponentAndSetOnMap(e) {
            const t = mi(e, ce(e.iframeSrc, this.environmentModel, this.analyticsModel));
            if (!t)
                return null;
            const i = e.contentModelId;
            if (this.triggeredCTAFromCallback) {
                const [e] = this.triggeredCTAFromCallback;
                i === e && t.skipAnimation()
            }
            this.interactiveComponentMap.set(i, t);
            this.overlayedInteractivesContainer.attachInteractiveOverlayToAnchor(t);
            t.registerResizeHandler(( ({height: e}) => {
                t.isTopBanner && this.overlayedInteractivesContainer.setTopPushHeight(e)
            }
            ));
            t.registerCloseHandler(( () => this.closeOverlay(e.contentModelId)));
            return t
        }
        shouldCreateInteractiveOverlay(e) {
            return !(Dt(e.contentModelId) && !this.clickTriggerComponentMap.has(e.contentModelId)) && !!this.posistionsOccupied.canBeInsertedIntoPosition(e)
        }
        listenToConfigUpdates() {
            this.configModel.store.subscribe(( (e, t) => {
                if (this.environmentModel.isPreview && 1 === e.configs.size) {
                    this.createPreviewOverlayInteractive();
                    requestAnimationFrame(( () => {
                        this.configModel.previewConfig && this.openOverlay(this.configModel.previewConfig.contentModelId)
                    }
                    ))
                } else if (0 === t.configs.size && e.configs.size > 0)
                    setTimeout(( () => {
                        this.createOverlayInteractivesWithAudience();
                        this.createOverlayInteractivesWithNoAudience();
                        this.overlay && this.overlay.enableDisableBodyScroll()
                    }
                    ));
                else if (e.templateConfig) {
                    this.createTemplateOverlayInteractive();
                    requestAnimationFrame(( () => {
                        this.openOverlay(ve)
                    }
                    ))
                } else {
                    e.configs.size > t.configs.size && this.createOverlayInteractivesWithNoAudience();
                    if (this.triggeredCTAFromCallback) {
                        const [t,i] = this.triggeredCTAFromCallback;
                        if (e.configs.has(t)) {
                            this.triggeredCTAFromCallback = null;
                            this.shouldCloseCalloutCTA(i) && this.closeOverlay(i)
                        }
                    }
                }
            }
            ))
        }
        listenForOpenCTAMessage() {
            window.addEventListener("message", (t => {
                t && t.data && t.data.type === e.DISPLAY_CALL_TO_ACTION && this.openOverlay(t.data.id)
            }
            ))
        }
        openOverlay(t, i=!1) {
            const s = this.interactiveComponentMap.get(t);
            if (s) {
                s.isTopBanner && this.overlayedInteractivesContainer.showPushBanner(s.container.clientHeight);
                i && s.setAnimationForClickTrigger();
                s.open().then(( () => {
                    s.isTopBanner && this.overlayedInteractivesContainer.showPushBanner(s.container.clientHeight);
                    if (s.containerType === Q.MODAL) {
                        this.shownModal = t;
                        this.overlay.show()
                    }
                    this.handleView(t);
                    Gi.broadcast(t, {
                        type: e.SHOWING_CTA,
                        payload: {}
                    })
                }
                )).catch(( () => {}
                ))
            }
        }
        messageCTAClosed(t) {
            Gi.broadcast(t, {
                type: e.HAS_CLOSED,
                payload: {}
            });
            this.eventManager.emit($i.HAS_CLOSED, {
                id: t
            })
        }
        shouldCloseCalloutCTA(e) {
            const t = this.configModel.configs.get(e);
            return !!t && t.isDismissable
        }
    }
    function ji(e) {
        return class extends e {
            constructor(e) {
                super(e);
                this.processConfigResponse = e => {
                    if (!e)
                        return;
                    const t = e.sortedAudienceConfigs.map((e => e.contentModelId))
                      , i = this.getShowingCTAIds()
                      , s = [];
                    for (const e of i)
                        t.includes(e) || s.push(e);
                    this.handleRemovingCTAs(s);
                    const n = e.sortedAudienceConfigs.sort(( (e, t) => t.specificity - e.specificity));
                    this.createCTAsFromConfigs(n)
                }
                ;
                this.registerEventManagerEventHandlers()
            }
            registerEventManagerEventHandlers() {
                this.eventManager.on(Vi.REFRESH, ( () => {
                    this.handleRefresh()
                }
                ));
                this.eventManager.on(Vi.CLOSE, ( ({id: e}) => this.closeOverlay(e)));
                this.eventManager.on(Vi.CLOSE_ALL, ( () => this.handleCloseAll()))
            }
            handleCloseAll() {
                this.getShowingCTAIds().forEach((e => this.closeOverlay(e)))
            }
            handleRefresh() {
                this.environmentModel.refresh();
                return this.configModel.init(ye.buildConfigRequest(this.environmentModel, [], this.analyticsModel.store.state)).then(this.processConfigResponse).catch((e => {}
                ))
            }
            getShowingCTAIds() {
                return this.posistionsOccupied ? this.posistionsOccupied.getAllIds() : []
            }
            handleRemovingCTAs(e) {
                for (const t of e) {
                    this.closeOverlay(t);
                    const e = this.interactiveComponentMap.get(t);
                    e && e.remove();
                    this.interactiveComponentMap.delete(t);
                    this.posistionsOccupied && this.posistionsOccupied.removeCTA(t);
                    for (const [e,i] of this.triggerMap) {
                        e === t && i.forEach((e => e.remove()));
                        this.triggerMap.delete(t)
                    }
                }
            }
            createCTAsFromConfigs(e) {
                for (const t of e)
                    this.createOverlayInteractiveFromAudience(t)
            }
        }
    }
    var qi = ji(Ui);
    const Wi = "hs-cta-embed__loaded";
    class zi {
        constructor({contentId: e, embedContainer: t, iframeSrc: i, useResponsiveStyling: s}) {
            this.listenForLoad();
            this.frameComponent = b({
                id: e,
                container: t,
                iframeSrc: i,
                resizeHeight: !0,
                onFrameReady: this.resolveFrameload,
                useResponsiveStyling: s,
                extraAttributes: {
                    "aria-label": "Embedded CTA",
                    title: "Embedded CTA",
                    allow: "autoplay; fullscreen; clipboard-write"
                }
            });
            this.frameComponent.iframe.setAttribute("data-test-id", "interactive-frame");
            this.frameComponent.iframe.classList.add(Vt);
            this.contentId = e;
            this.embedContainer = t
        }
        setStyles(e, i, s) {
            this.frameComponent.setShouldResize(s);
            t(this.embedContainer, e);
            this.frameComponent.setStyle(Object.assign({}, i));
            this.resolveConfig && this.resolveConfig()
        }
        showFrame() {
            this.frameComponent.setStyle({
                visibility: ""
            })
        }
        listenForLoad() {
            const e = new Promise((e => {
                this.resolveFrameload = e
            }
            ))
              , t = new Promise((e => {
                this.resolveConfig = e
            }
            ));
            Promise.all([e, t]).then(( () => {
                Array.from(this.embedContainer.children).forEach((e => {
                    e !== this.frameComponent.iframe && this.embedContainer.removeChild(e)
                }
                ));
                this.embedContainer.classList.add(Wi);
                this.showFrame()
            }
            )).catch(( () => {}
            ))
        }
    }
    class Yi {
        constructor({environmentModel: e, configStore: t, handleView: i, analyticsModel: s, scheduledCTAsModel: n}) {
            this.embeddedInteractives = new Map;
            this.elementObserver = U();
            this.styledComponentSet = new Set;
            this.flushScheduledCTAs = () => {
                for (const e of this.scheduledCTAsModel.scheduledCTAs) {
                    const t = this.configStore.embeddedConfigs.get(e);
                    if (!t || t.isHTMLVersionOnly)
                        continue;
                    if (!this.scheduledCTAsModel.elementsForEmbeddedCTAs.has(e))
                        continue;
                    this.scheduledCTAsModel.elementsForEmbeddedCTAs.get(e).forEach((t => {
                        this.createView(e, t)
                    }
                    ));
                    this.handleView(e);
                    this.scheduledCTAsModel.removeCTA(e)
                }
            }
            ;
            this.environmentModel = e;
            this.configStore = t;
            this.scheduledCTAsModel = n;
            this.handleView = i;
            this.analyticsModel = s
        }
        init({embedContainers: e}) {
            this.embedContainers = e;
            this.environmentModel.isPreview || this.environmentModel.isTemplate || this.createViews();
            this.listenForConfigs();
            this.listenForElementViews();
            this.listenForScheduledCTAs()
        }
        listenForScheduledCTAs() {
            this.scheduledCTAsModel.subscribe(this.flushScheduledCTAs)
        }
        listenForElementViews() {
            if (this.embedContainers)
                for (const [e,t] of this.embedContainers)
                    for (const i of t)
                        this.elementObserver.observe(i, ( () => this.handleView(e)))
        }
        listenForConfigs() {
            this.configStore.configs.size > 0 ? this.setStylesOnContainer() : this.configStore.subscribe(( () => {
                this.scheduledCTAsModel.scheduledCTAs.size > 0 && this.flushScheduledCTAs();
                if (this.configStore.embeddedConfigs.size > 0) {
                    (this.environmentModel.isPreview || this.environmentModel.isTemplate) && this.configStore.embeddedConfigs.size > 0 && this.createViews();
                    this.setStylesOnContainer()
                }
            }
            ))
        }
        setStylesOnContainer() {
            for (const [e,t] of this.configStore.embeddedConfigs) {
                const i = this.embeddedInteractives.get(e);
                i && i.length && i.forEach((e => {
                    if (!this.styledComponentSet.has(e)) {
                        this.styledComponentSet.add(e);
                        e.setStyles(ye.getStylesFromContainerStyles(t.containerStyles), ye.getStylesForIframe(t.containerStyles), t.containerStyles.scaleHeightToFitContent || Boolean(t.containerStyles.isSingleModuleOnly))
                    }
                }
                ))
            }
        }
        createViews() {
            for (const [e,t] of this.embedContainers) {
                let i = "";
                const s = this.configStore.embeddedConfigs.get(e);
                i = s ? s.iframeSrc : ae({
                    contentId: e,
                    portalId: this.environmentModel.portalId,
                    env: this.environmentModel.env,
                    hublet: this.environmentModel.hublet
                });
                i = ce(i, this.environmentModel, this.analyticsModel);
                const n = [];
                t.forEach((t => {
                    const o = new zi({
                        contentId: e,
                        embedContainer: t,
                        iframeSrc: i,
                        useResponsiveStyling: !!s && s.containerStyles.useResponsiveStyling
                    });
                    n.push(o)
                }
                ));
                this.embeddedInteractives.set(e, n)
            }
        }
        createView(e, t) {
            const i = this.configStore.embeddedConfigs.get(e);
            if (!i)
                return;
            const s = ce(i.iframeSrc, this.environmentModel, this.analyticsModel)
              , n = new zi({
                contentId: e,
                embedContainer: t,
                iframeSrc: s,
                useResponsiveStyling: i.containerStyles.useResponsiveStyling
            })
              , o = this.embeddedInteractives.get(e) || [];
            this.embeddedInteractives.set(e, [...o, n]);
            this.setStylesOnContainer()
        }
    }
    const Qi = "POP_OVER"
      , Xi = "hsCta";
    class Ki {
        constructor({configStore: e, environmentModel: t}) {
            this.eventManager = xi.getInstance();
            this.ignoreCta = ({id: e}) => {
                if (this.environmentModel.isPreview)
                    return;
                const t = this.configStore.configs.get(e);
                t && t.containerType !== Q.EMBEDDED && Bt(e, t.displayFrequency)
            }
            ;
            this.registerPopupPolice = ({id: e}) => {
                const t = this.configStore.configs.get(e);
                t && t.containerType === Q.MODAL && window._registerAvailablePopup && window._registerAvailablePopup(Xi, Qi)
            }
            ;
            this.configStore = e;
            this.environmentModel = t;
            this.registerHandlers();
            this.listenForConfigs()
        }
        registerHandlers() {
            Gi.registerHandlers({
                [e.NAVIGATE_PAGE]: this.ignoreCta,
                [e.STARTED]: this.registerPopupPolice
            });
            this.eventManager.on($i.HAS_CLOSED, this.ignoreCta)
        }
        listenForConfigs() {
            this.configStore.subscribe(( (e, t) => {
                if (e.configs.size !== t.configs.size)
                    for (const [t,i] of e.configs)
                        i.displayFrequency && xt(t, i.displayFrequency)
            }
            ))
        }
    }
    function Ji(e) {
        return new Ki(e)
    }
    const Zi = Ye(["display:flex;justify-content:center;align-items:center;"])
      , es = "interactive-ready";
    class ts {
        constructor({environmentModel: e}) {
            this.environmentModel = e
        }
        init() {
            if (this.environmentModel.isPreview || this.environmentModel.isScreenshot || this.environmentModel.templatePath) {
                this.bodyWrapper = document.getElementsByClassName(Pe)[0];
                if (this.bodyWrapper) {
                    this.setupEmbedContainer();
                    this.setHeightForPreview();
                    this.listenForInteractiveLoaded()
                }
            }
        }
        setupEmbedContainer() {
            this.bodyWrapper.classList.add(Zi);
            const e = this.environmentModel.previewId || 1;
            this.environmentModel.isTemplate ? this.bodyWrapper.innerHTML = `\n        <div class="${_e} ${_e}-NaN" data-hubspot-wrapper-cta-id="-1"></div>\n      ` : this.bodyWrapper.innerHTML = `\n        <div class="${_e} ${_e}-${e}">\n      `
        }
        setHeightForPreview() {
            this.bodyWrapper.style.height = "100vh"
        }
        listenForInteractiveLoaded() {
            Gi.registerHandlers({
                [e.STARTED]: () => document.body.classList.add(es)
            })
        }
    }
    function is({environmentModel: e}) {
        return new ts({
            environmentModel: e
        })
    }
    const ss = e => {
        let t = 1
          , i = 0;
        for (; t > 0 && i !== e.length; ) {
            const s = e[i];
            "{" === s ? t++ : "}" === s && t--;
            i++;
            if (i > e.length)
                return e.length
        }
        return i
    }
      , ns = e => window.matchMedia(e).matches
      , os = e => e.includes("width") ? "@media (min-width: 0px)" : e
      , rs = (e, t=ns) => {
        let i = ""
          , s = e
          , n = s.indexOf("@media");
        if (-1 === n)
            return !1;
        for (; n > 0; ) {
            i = `${i}${s.substring(0, n - 1)}`;
            s = s.substring(n);
            const e = s.indexOf("{")
              , o = s.substring(0, e);
            s = s.substring(e + 1);
            const r = ss(s);
            if (t(o.replace("@media ", ""))) {
                const e = s.substring(0, r - 1);
                i = `${i}${os(o)} { ${e} }`
            }
            s = s.substring(r + 1);
            n = s.indexOf("@media")
        }
        return `${i}${s}`.trim()
    }
      , as = e => Object.keys(e).reduce(( (t, i) => {
        const s = rs(e[i]);
        return s ? Object.assign({}, t, {
            [i]: s
        }) : t
    }
    ), {});
    var cs = (e, t) => {
        let i = 0;
        return (...s) => {
            i && clearTimeout(i);
            i = setTimeout(( () => {
                e(...s);
                i = 0
            }
            ), t)
        }
    }
    ;
    const ls = (...e) => {
        i("[ResponsiveController]", ...e)
    }
    ;
    class hs {
        constructor() {
            this.initialStylesheets = {}
        }
        init() {
            this.listenForStylesheetsHtml();
            const e = cs(( () => Object.keys(this.initialStylesheets).forEach((e => this.handleProcessStylesheets(Number(e))))), 100);
            window.addEventListener("resize", ( () => {
                ls("Resizing, reprocessing stylesheets");
                e()
            }
            ))
        }
        listenForStylesheetsHtml() {
            Gi.registerHandlers({
                [e.SEND_STYLESHEETS]: e => {
                    this.initialStylesheets[e.id] = e.stylesheetsHtml;
                    this.handleProcessStylesheets(e.id)
                }
            })
        }
        handleProcessStylesheets(t) {
            if (!this.initialStylesheets[t])
                return;
            const i = as(this.initialStylesheets[t]);
            Gi.broadcast(t || 1, {
                type: e.RECEIVE_FILTERED_STYLESHEETS,
                payload: {
                    stylesheets: i
                }
            })
        }
    }
    function ds() {
        return new hs
    }
    function us(e, t) {
        return "https://perf{region}.hsforms{env}.com/embed/v3/counters.gif".replace("{region}", `-${e}`).replace("{env}", "qa" === t ? "qa" : "")
    }
    const ms = {
        CONFIG_LOADED_SUCCESS: "config-loaded-success",
        CONFIG_LOADED_FAILURE: "config-loaded-failure",
        INTERACTIVE_SHOWN: "interactive-shown",
        INTERACTIVE_CLOSED: "interactive-closed",
        INTERACTIVE_NAVIGATED: "interactive-navigated",
        INLINE_INTERACTIVE_RENDER_SUCCESS: "inline-interactive-render-success",
        INLINE_INTERACTIVE_RENDER_FAIL: "inline-interactive-render-fail"
    };
    class gs {
        constructor({environmentModel: e, configStore: t}) {
            this.perfUrl = "";
            this.environmentModel = e;
            this.configStore = t;
            this.registerHandlers();
            this.listenToConfigStore()
        }
        init() {
            this.perfUrl = us(this.environmentModel.hublet, this.environmentModel.env)
        }
        trackRender(e) {
            this.trackMetric(e ? ms.INLINE_INTERACTIVE_RENDER_SUCCESS : ms.INLINE_INTERACTIVE_RENDER_FAIL)
        }
        registerHandlers() {
            Gi.registerHandlers({
                [e.STARTED]: () => this.trackMetric(ms.INTERACTIVE_SHOWN),
                [e.CLOSE_INTERACTIVE]: () => this.trackMetric(ms.INTERACTIVE_CLOSED),
                [e.NAVIGATE_PAGE]: () => this.trackMetric(ms.INTERACTIVE_NAVIGATED)
            })
        }
        listenToConfigStore() {
            this.configStore.subscribe((e => {
                e.requestError ? this.trackMetric(ms.CONFIG_LOADED_FAILURE) : e.isLoaded && this.trackMetric(ms.CONFIG_LOADED_SUCCESS)
            }
            ))
        }
        trackMetric(e) {
            if (!this.perfUrl.length)
                return;
            const t = `${this.perfUrl}?key=${e}&value=1`;
            (new Image).src = t
        }
    }
    function ps(e) {
        return new gs(e)
    }
    const fs = (...e) => {
        i("[CTAAnalyticsController]", ...e)
    }
    ;
    function vs({env: e, hublet: t}) {
        const i = "prod" === e ? "" : e;
        let s = "";
        s = "na1" !== t && t ? `https://cta-${t}.hubspot${i}.com/web-interactives/public/v1/track` : `https://cta-service-cms2.hubspot${i}.com/web-interactives/public/v1/track`;
        return s
    }
    class Cs {
        constructor({analyticsStore: e, configsStore: t, environmentModel: i, ctaViewedStore: s}) {
            this.timingMap = new Map;
            this.viewQueue = S();
            this.hasViewed = new Set;
            this.eventManager = xi.getInstance();
            this.baseUrl = "";
            this.trackView = ({id: e}) => {
                if (this.configStore.isLoaded) {
                    this.trackWithImage(e, "view");
                    this.timingMap.set(e, Date.now())
                } else
                    this.viewQueue.enqueue(e)
            }
            ;
            this.trackClose = ({id: e}) => {
                this.trackWithImage(e, "close")
            }
            ;
            this.trackTriggerClick = ({id: e}) => {
                this.trackNavigation({
                    id: e
                }, !0)
            }
            ;
            this.trackNavigation = ({id: e}, t=!1) => {
                const i = this.configStore.configs.get(e);
                if (!i)
                    return;
                const s = new URL(this.attachTrackingParamsToUrl(`${this.baseUrl}/click`, e));
                (t || i.shouldUseJsTracking) && s.searchParams.set("beaconTrack", "true");
                s.searchParams.has("beaconTrack") && ("sendBeacon"in navigator ? navigator.sendBeacon(s) : fetch(s, {
                    method: "POST",
                    keepalive: !0
                }))
            }
            ;
            this.analyticsStore = e;
            this.configStore = t;
            this.environmentModel = i;
            this.ctaViewedStore = s
        }
        init() {
            this.baseUrl = vs({
                env: this.environmentModel.env,
                hublet: this.environmentModel.hublet
            });
            if (!this.environmentModel.isPreview && !this.environmentModel.isTemplate) {
                this.registerHandlers();
                this.listenForStoreLoad();
                this.listenForViewChange();
                this.handleViews()
            }
        }
        registerHandlers() {
            Gi.registerHandlers({
                [e.CLOSE_INTERACTIVE]: this.trackClose,
                [e.NAVIGATE_PAGE]: this.trackNavigation,
                [e.TRIGGER_CTA]: this.trackTriggerClick
            });
            this.eventManager.on(Vi.TRIGGER_OPEN, ( ({ctaTrigger: e}) => this.trackTriggerClick({
                id: e
            })))
        }
        listenForStoreLoad() {
            this.configStore.subscribe(( (e, t) => {
                e.isLoaded && !t.isLoaded && this.flushViewQueue()
            }
            ))
        }
        listenForViewChange() {
            this.ctaViewedStore.subscribe(( () => {
                this.handleViews()
            }
            ))
        }
        handleViews() {
            for (const e of this.ctaViewedStore.viewed)
                if (!this.hasViewed.has(e)) {
                    this.trackView({
                        id: e
                    });
                    this.hasViewed.add(e)
                }
        }
        flushViewQueue() {
            do {
                const e = this.viewQueue.dequeue();
                e && this.trackView({
                    id: e
                })
            } while (this.viewQueue.peek())
        }
        trackWithImage(e, t) {
            fs("Tracking:", t, e);
            let i = `${this.baseUrl}/${t}`;
            i = this.attachTrackingParamsToUrl(i, e);
            (new Image).src = i
        }
        logTooLargeAnalytics() {
            fs("Logging url that will be truncated");
            const e = this.analyticsStore.analytics;
            if (!e)
                return;
            const t = JSON.stringify(Object.assign({}, e, {
                portalId: this.environmentModel.portalId
            }));
            fetch(`${this.baseUrl}/log`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: t
            })
        }
        attachTrackingParamsToUrl(e, t) {
            const i = new URL(e)
              , s = this.configStore.configs.get(t);
            if (!s)
                return i.href;
            i.searchParams.set("webInteractiveId", String(s.webInteractiveId));
            i.searchParams.set("containerType", s.containerType);
            i.searchParams.set("portalId", String(this.environmentModel.portalId));
            i.searchParams.set("audienceId", String(s.audienceId));
            s.campaignGuid && i.searchParams.set("campaignId", s.campaignGuid);
            const n = this.analyticsStore.analytics;
            n && Object.entries(n).forEach(( ([e,t]) => {
                t && i.searchParams.set(e, String(t))
            }
            ));
            const o = this.timingMap.get(t);
            if (o) {
                i.searchParams.set("timeStarted", String(o));
                i.searchParams.set("timeFinished", String(Date.now()))
            }
            i.href.length;
            return i.href
        }
    }
    function Ts(e) {
        return new Cs(e)
    }
    const ys = ["elementToEmbed"];
    class bs {
        constructor({configModel: e, customerCtaOptions: t, scheduleCTA: i}) {
            this.defferedPromiseMap = new Map;
            this.handleCtaLoad = ({id: e}) => {
                if (!this.defferedPromiseMap.has(e))
                    return;
                this.defferedPromiseMap.get(e)(null);
                this.defferedPromiseMap.delete(e)
            }
            ;
            this.handleNavigate = ({id: e}) => {
                const t = this.customerCtaOptions.options.get(e);
                t && "function" == typeof t.onNavigate && t.onNavigate()
            }
            ;
            this.loadCta = e => new Promise(( (t, i) => {
                e || i(new Error("Invalid options"));
                const {contentId: s, options: n} = e
                  , {elementToEmbed: o} = n
                  , r = le(n, ys);
                s || i(new Error("Invalid options"));
                this.scheduleCTA(s, Array.isArray(o) ? o : [o]);
                Object.keys(r).length && this.customerCtaOptions.setOption(s, r);
                this.defferedPromiseMap.set(s, t)
            }
            ));
            this.configModel = e;
            this.customerCtaOptions = t;
            this.scheduleCTA = i;
            window.hsCtasOnReady = window.hsCtasOnReady || [];
            this.attachToWindow();
            this.registerHandlers()
        }
        init() {
            this.flushOnReadyQueue()
        }
        registerHandlers() {
            Gi.registerHandlers({
                [e.STARTED]: this.handleCtaLoad,
                [e.NAVIGATE_PAGE]: this.handleNavigate
            })
        }
        attachToWindow() {
            window.__PRIVATE__HubspotCtaClient = {
                loadCta: this.loadCta
            }
        }
        flushOnReadyQueue() {
            const e = window.hsCtasOnReady;
            for (; e.length; ) {
                const t = e.shift();
                "function" == typeof t && t()
            }
            Object.defineProperty(window.hsCtasOnReady, "push", {
                value: e => {
                    "function" == typeof e && e()
                }
                ,
                writable: !0
            })
        }
    }
    function Es(e) {
        return new bs(e)
    }
    const ws = (...e) => {
        i("[NonFramedCTA]", ...e)
    }
    ;
    class Ss {
        constructor({cta: e, onNavigate: t, onView: i}) {
            this.removeEventListenerCallbacks = [];
            this.elementObserver = U();
            this.hasView = !1;
            this.id = "";
            this.cta = e;
            this.id = this.cta.id;
            this.onNavigate = t;
            this.onView = i;
            this.listenForAnchorClicks();
            this.listenForView()
        }
        getCtaInstance() {
            this.cta && this.cta.parentNode || (this.cta = document.getElementById(this.id));
            return this.cta
        }
        replaceCtaInstance(e) {
            ws("Replacing html", e, this.id);
            const t = this.getCtaInstance();
            if (!t)
                return;
            const i = xe(t, e);
            this.removeExistingEventListeners();
            t.innerHTML = i.innerHTML;
            t.dataset.rendered = "true";
            this.reapplyEventListeners(t)
        }
        removeExistingEventListeners() {
            this.hasView || this.elementObserver.unobserve(this.cta);
            this.removeEventListenerCallbacks.forEach((e => e()));
            this.removeEventListenerCallbacks = []
        }
        reapplyEventListeners(e) {
            this.id = e.id;
            this.cta = e;
            this.listenForAnchorClicks();
            this.hasView || this.listenForView()
        }
        listenForAnchorClicks() {
            const e = [...this.cta.querySelectorAll("a")];
            "A" === this.cta.tagName && e.push(this.cta);
            for (const t of e) {
                const e = "_blank" === t.target
                  , i = e => {
                    e.preventDefault()
                }
                ;
                let s;
                t.classList.contains("hs-cta-trigger-button") && (s = He(t));
                const n = i => {
                    i.preventDefault();
                    gi(i) && this.onNavigate(t.href, e, s)
                }
                  , o = i => {
                    if ("Enter" === i.key) {
                        i.preventDefault();
                        this.onNavigate(t.href, e, s)
                    }
                }
                ;
                t.addEventListener("click", i);
                t.addEventListener("mouseup", n);
                t.addEventListener("keydown", o);
                this.removeEventListenerCallbacks.push(( () => {
                    t.removeEventListener("click", i);
                    t.removeEventListener("mouseup", n);
                    t.removeEventListener("keypress", o)
                }
                ))
            }
        }
        listenForView() {
            this.elementObserver.observe(this.cta, ( () => {
                this.onView();
                this.hasView = !0;
                this.elementObserver.unobserve(this.cta)
            }
            ))
        }
    }
    function As(e) {
        return new Ss(e)
    }
    const Is = (...e) => {
        i("[populateLinksWithTrackingParams]", ...e)
    }
      , Ms = ["currentUrl", "referrer", "canon", "canonicalUrl", "pageUrl", "contentType", "encryptedPayload", "pageId", "analyticsPageId", "hutk", "hstc", "hssc", "hsfp", "utk", "containerType", "webInteractiveId", "webInteractiveContentId", "audienceId", "campaignGuid", "campaignId", "userAgent", "timeStarted", "timeFinished", "redirectUrl", "skip", "includeInitial", "pageTitle", "contentGroupId", "portalId"]
      , Os = `https://${(new Date).getTime()}-dummy.com`
      , _s = (e, t) => {
        let i, s = !1;
        try {
            i = new URL(e)
        } catch (t) {
            Is("[populateLinksWithTrackingParams]", "Checking for relative URL", e);
            s = !0
        }
        if (s)
            try {
                i = new URL(`${Os}${e.startsWith("/"),
                ""}${e}`)
            } catch (t) {
                Is("Could not parse url for link", t);
                return e
            }
        Object.entries(t).forEach(( ([e,t]) => {
            Ms.includes(e) ? null != t && i.searchParams.set(e, String(t)) : Is("Invalid analytics parameter passed", e)
        }
        ));
        const n = i.href;
        return s ? n.replace(Os, "") : n
    }
    ;
    var Ps = (e, t=[...document.querySelectorAll(".hs-web-interactive a")]) => {
        t.length && t.forEach((t => {
            const i = t.getAttribute("href");
            i && !i.startsWith("javascript") && t.setAttribute("href", _s(i, e))
        }
        ))
    }
    ;
    const Ls = ["isHubspotPage"]
      , Rs = "render/html";
    function Fs(e) {
        let {isHubspotPage: t} = e
          , i = le(e, Ls);
        const s = {};
        t && (s.isHubspotPage = "true");
        return de(Object.assign({}, i, {
            extraParams: s,
            path: Rs
        }))
    }
    class Ns {
        constructor() {
            this.handleFetchFailed = () => {
                this.store.setState((e => Object.assign({}, e, {
                    requestError: !0
                })))
            }
            ;
            this.handleFetchSucceded = e => {
                this.store.setState((t => Object.assign({}, t, {
                    renderedHtmlMap: Object.assign({}, t.renderedHtmlMap, {
                        htmlMap: e
                    }),
                    isLoaded: !0
                })))
            }
            ;
            const e = {
                renderedHtmlMap: {},
                request: null,
                requestError: !1,
                isLoaded: !1
            };
            this.store = new E(e)
        }
        init(e) {
            this.store.setState((t => Object.assign({}, t, {
                request: e
            })));
            return this.fetchEmbeddedHtml()
        }
        subscribe(e) {
            this.store.subscribe(e)
        }
        get renderedHtmlMap() {
            return this.store.state.renderedHtmlMap
        }
        get isLoaded() {
            return this.store.state.isLoaded
        }
        fetch(e) {
            return fetch(e).then((e => {
                if (!e.ok) {
                    this.handleFetchFailed();
                    return Promise.resolve(null)
                }
                return e.json().then((e => {
                    this.handleFetchSucceded(e);
                    return e
                }
                )).catch(this.handleFetchFailed)
            }
            )).catch(this.handleFetchFailed)
        }
        fetchEmbeddedHtml() {
            const e = this.store.state.request;
            if (!e)
                return Promise.resolve(null);
            const t = Fs(e);
            return this.fetch(t)
        }
    }
    var Hs = new Ns;
    const ks = (...e) => {
        i("[NonFramedCTAController", ...e)
    }
    ;
    class Ds {
        constructor({handleView: e, configStore: t, handleNavigation: i, analyticsStore: s, environmentModel: n, metricsController: o, scheduledCTAsModel: r}) {
            this.componentMap = new Map;
            this.eventManager = xi.getInstance();
            this.cleanupFuncs = [];
            this.flushScheduledCTAs = () => {
                for (const e of this.scheduledCTAsModel.scheduledCTAs) {
                    const t = this.configStore.embeddedConfigs.get(e);
                    if (!t || !t.isHTMLVersionOnly)
                        return;
                    if (!this.scheduledCTAsModel.elementsForEmbeddedCTAs.has(e))
                        return;
                    const i = this.scheduledCTAsModel.elementsForEmbeddedCTAs.get(e);
                    let s = this.nonFramedCTAContainers.get(e);
                    s || (s = []);
                    this.nonFramedCTAContainers.set(e, [...s, ...i]);
                    this.createViewsForElements(e, i);
                    this.requestHTML();
                    this.scheduledCTAsModel.removeCTA(e)
                }
            }
            ;
            this.getAnchorsFromElements = e => {
                let t = [];
                e.forEach((e => {
                    "A" === e.tagName && (t = [...t, e]);
                    t = [...t, ...e.querySelectorAll("a")]
                }
                ));
                return t
            }
            ;
            this.handleView = e;
            this.handleNavigation = i;
            this.configStore = t;
            this.analyticsStore = s;
            this.environmentModel = n;
            this.renderedHtmlStore = Hs;
            this.metricsController = o;
            this.scheduledCTAsModel = r
        }
        init({nonFramedCTAContainers: e}) {
            this.nonFramedCTAContainers = e;
            e.size && this.requestHTML();
            this.listenForConfigs();
            this.listenForScheduledCTAs();
            this.environmentModel.isPreview || this.environmentModel.isPreviewPage || this.listenForAnalyticsUpdate()
        }
        listenForScheduledCTAs() {
            this.scheduledCTAsModel.subscribe(this.flushScheduledCTAs)
        }
        cleanup() {
            this.cleanupFuncs.forEach((e => e()))
        }
        requestHTML() {
            const e = e => {
                if (!e)
                    return;
                this.metricsController.trackRender(!0);
                Object.keys(e).forEach((t => {
                    const i = Number(t)
                      , s = e[i]
                      , n = this.componentMap.get(i);
                    if (n)
                        n.forEach((e => {
                            e.replaceCtaInstance(s)
                        }
                        ));
                    else {
                        ks("Views not created yet, just replacing existing elements");
                        const e = this.nonFramedCTAContainers.get(i);
                        e && e.length && e.forEach((e => {
                            const t = xe(e, s);
                            e.innerHTML = t.innerHTML;
                            e.dataset.rendered = "true"
                        }
                        ))
                    }
                    this.hydrateLinksWithAllData(i)
                }
                ));
                const t = Object.keys(e).map(Number);
                this.eventManager.emit(Vi.REPLACED_INLINE_HTML, {
                    ids: t
                })
            }
              , {isPreview: t, currentUrl: i, portalId: s, env: n, hublet: o, versionId: r} = this.environmentModel
              , a = [...this.nonFramedCTAContainers.keys()].filter((e => !this.renderedHtmlStore.renderedHtmlMap[e]));
            if (!a.length)
                return;
            const c = {
                contentIds: a,
                currentUrl: i,
                portalId: s,
                env: n,
                hublet: o,
                analytics: this.analyticsStore.analytics,
                isPreview: t,
                versionId: r,
                isHubspotPage: this.environmentModel.isCos()
            };
            ks("Requesting HTML", c);
            this.renderedHtmlStore.init(c).then(e).catch((e => {
                ks("Failed getting HTML", e);
                this.metricsController.trackRender(!1)
            }
            ))
        }
        createViewsForElements(e, t) {
            const i = [];
            let s = 0;
            for (const n of t) {
                n.id = `hs-cta-${e}-${s++}`;
                const o = As({
                    cta: n,
                    onNavigate: (t, i, s) => {
                        s ? this.eventManager.emit(Vi.TRIGGER_OPEN, {
                            ctaToOpen: s,
                            ctaTrigger: e
                        }) : this.handleNavigation(t, e, i)
                    }
                    ,
                    onView: () => {
                        this.handleView(e)
                    }
                });
                i.push(o);
                const r = this.configStore.configs.get(e);
                if (r) {
                    const e = this.getAnchorsFromElements(t);
                    Ps({
                        webInteractiveId: r.webInteractiveId,
                        audienceId: r.audienceId,
                        containerType: r.containerType,
                        campaignId: r.campaignGuid,
                        pageUrl: this.environmentModel.currentUrl,
                        portalId: this.environmentModel.portalId
                    }, e)
                }
            }
            const n = this.componentMap.get(e) || [];
            this.componentMap.set(e, [...n, ...i])
        }
        createViews() {
            for (const [e,t] of this.nonFramedCTAContainers)
                this.createViewsForElements(e, t)
        }
        hydrateLinksWithAllData(e) {
            let t = {};
            const i = this.configStore.configs.get(e);
            i && (t = {
                webInteractiveId: i.webInteractiveId,
                audienceId: i.audienceId,
                containerType: i.containerType,
                campaignId: i.campaignGuid,
                pageUrl: this.environmentModel.currentUrl,
                portalId: this.environmentModel.portalId
            });
            const s = this.analyticsStore.analytics;
            t = Object.assign({}, t, s);
            let n = [];
            for (const [,e] of this.nonFramedCTAContainers)
                n = [...n, ...this.getAnchorsFromElements(e)];
            Ps(t, n)
        }
        listenForConfigs() {
            this.cleanupFuncs.push(this.configStore.subscribe(( () => {
                this.scheduledCTAsModel.scheduledCTAs.size > 0 && this.flushScheduledCTAs();
                this.createViews()
            }
            )))
        }
        listenForAnalyticsUpdate() {
            const e = () => {
                let e = [];
                for (const [,t] of this.nonFramedCTAContainers)
                    e = [...e, ...this.getAnchorsFromElements(t)];
                Ps(this.analyticsStore.analytics, e)
            }
            ;
            this.analyticsStore.analytics.isLoaded ? e() : this.cleanupFuncs.push(this.analyticsStore.subscribe(( (t, i) => {
                !i.isLoaded && t.isLoaded && e()
            }
            )))
        }
    }
    function Bs(e) {
        return new Ds(e)
    }
    const xs = ["openInNewTab", "onNavigate"];
    class Vs {
        constructor() {
            const e = {
                options: new Map
            };
            this.store = new E(e)
        }
        subscribe(e) {
            this.store.subscribe(e)
        }
        setOption(e, t) {
            const {openInNewTab: i, onNavigate: s} = t;
            le(t, xs);
            this.store.setState((t => {
                const n = structuredClone(t.options);
                n.set(e, {
                    openInNewTab: i,
                    onNavigate: s
                });
                return Object.assign({}, t, {
                    options: n
                })
            }
            ))
        }
        get options() {
            return this.store.state.options
        }
    }
    function $s() {
        return new Vs
    }
    class Gs {
        constructor() {
            const e = {
                scheduledCTAs: new Set,
                elementsForEmbeddedCTAs: new Map
            };
            this.store = new E(e)
        }
        subscribe(e) {
            this.store.subscribe(e)
        }
        scheduleCTA(e) {
            this.store.setState((t => Object.assign({}, t, {
                scheduledCTAs: new Set([...t.scheduledCTAs, e])
            })))
        }
        scheduleEmbeddedCTA(e, t) {
            this.store.setState((i => Object.assign({}, i, {
                scheduledCTAs: new Set([...i.scheduledCTAs, e]),
                elementsForEmbeddedCTAs: W(i.elementsForEmbeddedCTAs, new Map([[e, t]]))
            })))
        }
        removeCTA(e) {
            this.store.setState((t => {
                const i = structuredClone(t.scheduledCTAs);
                i.delete(e);
                return Object.assign({}, t, {
                    scheduledCTAs: i,
                    elementsForEmbeddedCTAs: j(t.elementsForEmbeddedCTAs, ( (t, i) => i !== e))
                })
            }
            ))
        }
        get scheduledCTAs() {
            return this.store.state.scheduledCTAs
        }
        get elementsForEmbeddedCTAs() {
            return this.store.state.elementsForEmbeddedCTAs
        }
    }
    function Us() {
        return new Gs
    }
    const js = {
        onCallToActionReady: "onCallToActionReady",
        onCallToActionViewed: "onCallToActionViewed",
        onCallToActionNavigated: "onCallToActionNavigated",
        onCallToActionFormSubmitted: "onCallToActionFormSubmitted",
        onCallToActionReplacedInlineHTML: "onCallToActionReplacedInlineHTML"
    }
      , qs = "hsCallsToActionCallback"
      , Ws = 1e3;
    class zs {
        constructor({configModel: e}) {
            this.eventEmitter = n();
            this.eventManager = xi.getInstance();
            this.refresh = Y(( () => {
                this.eventManager.emit(Vi.REFRESH, {})
            }
            ), Ws);
            this.configModel = e;
            window.hsCallsToActionsReady = window.hsCallsToActionsReady || [];
            this.registerHandlers()
        }
        init() {
            this.attachToWindow();
            this.flushOnReadyQueue()
        }
        handleView(e) {
            this.handleEventCall({
                id: e
            }, js.onCallToActionViewed)
        }
        closeAll() {
            this.eventManager.emit(Vi.CLOSE_ALL, {})
        }
        close(e) {
            this.eventManager.emit(Vi.CLOSE, {
                id: e
            })
        }
        attachToWindow() {
            window.HubSpotCallsToActions = {
                on: this.eventEmitter.on.bind(this.eventEmitter),
                off: this.eventEmitter.off.bind(this.eventEmitter),
                refresh: this.refresh,
                closeAll: this.closeAll.bind(this),
                close: this.close.bind(this)
            }
        }
        flushOnReadyQueue() {
            const e = window.hsCallsToActionsReady;
            for (; e.length; ) {
                const t = e.shift();
                "function" == typeof t && t()
            }
            Object.defineProperty(window.hsCallsToActionsReady, "push", {
                value: e => {
                    "function" == typeof e && e()
                }
                ,
                writable: !0
            })
        }
        handleEventCall(e, t) {
            this.eventEmitter.emit(t, e);
            window.postMessage({
                type: qs,
                id: e.id,
                eventName: t,
                data: e
            })
        }
        registerHandlers() {
            Gi.registerHandlers({
                [e.STARTED]: e => this.handleEventCall(e, js.onCallToActionReady),
                [e.NAVIGATE_PAGE]: e => this.handleEventCall(e, js.onCallToActionNavigated),
                [e.CTA_FORM_SUBMITTED]: e => this.handleEventCall(e, js.onCallToActionFormSubmitted)
            });
            this.eventManager.on(Vi.REPLACED_INLINE_HTML, (e => this.handleEventCall(e, js.onCallToActionReplacedInlineHTML)))
        }
    }
    function Ys(e) {
        return new zs(e)
    }
    class Qs {
        constructor(e) {
            this.environmentModel = e.environmentModel;
            this.configStore = e.configsStore
        }
        init() {
            window.addEventListener("pageshow", (e => {
                e.persisted && this.shouldReloadPage() && window.location.reload()
            }
            ))
        }
        shouldReloadPage() {
            return this.environmentModel.isUngatedFor("WebInteractives:BFCacheReload") && this.configStore.configs.size > 0
        }
    }
    function Xs(e) {
        return new Qs(e)
    }
    const Ks = (...e) => {
        i("[WebInteractiveApplicationContainer]", ...e)
    }
    ;
    function Js(e) {
        const [t,i] = e.split("?");
        if (!i)
            return {
                location: t,
                queryParams: {}
            };
        return i.split("&").reduce(( (e, t) => {
            const [i,s] = t.split("=");
            return Object.assign({
                [i]: s
            }, e)
        }
        ), {})
    }
    class Zs extends $ {
        constructor({configStore: e, environmentModel: t}) {
            super();
            this.scheduleCTA = (e, t) => {
                t ? this.scheduledCTAs.scheduleEmbeddedCTA(e, t) : this.scheduledCTAs.scheduleCTA(e);
                this.configStore.fetchConfigsWithIds([e])
            }
            ;
            this.handleView = e => {
                this.viewedStore.markAsViewed(e);
                this.analyticsProxyController.flushViewQueue(e);
                this.thirdPartyApiController.handleView(e)
            }
            ;
            this.handleNavigation = (e, t, i=!1) => {
                A(this.getNavigationUrl({
                    url: e,
                    openNewTab: i
                }, t), i)
            }
            ;
            this.configStore = e;
            this.environmentModel = t;
            this.viewedStore = Me();
            this.customerCTAOptions = $s();
            this.scheduledCTAs = Us();
            this.overlayedInteractivesController = new qi({
                configModel: this.configStore,
                environmentModel: t,
                analyticsModel: this.analyticsStore,
                scheduledCTAsModel: this.scheduledCTAs,
                handleView: this.handleView,
                scheduleCTA: this.scheduleCTA
            });
            this.embeddedInteractivesController = new Yi({
                environmentModel: t,
                configStore: e,
                scheduledCTAsModel: this.scheduledCTAs,
                analyticsModel: this.analyticsStore,
                handleView: this.handleView
            });
            this.ignorerController = Ji({
                configStore: e,
                environmentModel: t
            });
            this.previewController = is({
                environmentModel: this.environmentModel
            });
            this.responsiveController = ds();
            this.metricsController = ps({
                environmentModel: this.environmentModel,
                configStore: e
            });
            this.ctaAnalyticsController = Ts({
                configsStore: this.configStore,
                analyticsStore: this.analyticsStore,
                environmentModel: this.environmentModel,
                ctaViewedStore: this.viewedStore
            });
            this.apiClientController = Es({
                configModel: this.configStore,
                customerCtaOptions: this.customerCTAOptions,
                scheduleCTA: this.scheduleCTA
            });
            this.thirdPartyApiController = Ys({
                configModel: this.configStore
            });
            this.nonFramedCTAController = Bs({
                configStore: this.configStore,
                handleView: this.handleView,
                analyticsStore: this.analyticsStore,
                handleNavigation: this.handleNavigation,
                environmentModel: this.environmentModel,
                metricsController: this.metricsController,
                scheduledCTAsModel: this.scheduledCTAs
            });
            this.bfCacheController = Xs({
                environmentModel: this.environmentModel,
                configsStore: this.configStore
            });
            this.listenForConfigs()
        }
        init() {
            this.environmentModel.init();
            this.metricsController.init();
            this.previewController.init();
            this.responsiveController.init();
            this.parsedDomResults = Be();
            this.configStore.init(this._buildConfigRequest()).then((e => {
                this.processConfigResponse(e)
            }
            )).catch((e => {
                Ks("Error fetching configs", e)
            }
            ));
            this.embeddedInteractivesController.init({
                embedContainers: this.parsedDomResults.embedContainers
            });
            this.nonFramedCTAController.init({
                nonFramedCTAContainers: this.parsedDomResults.nonFramedCTAContainers
            });
            this.overlayedInteractivesController.init({
                clickTriggerButtons: this.parsedDomResults.clickTriggerButtons
            });
            this.ctaAnalyticsController.init();
            this.apiClientController.init();
            this.thirdPartyApiController.init();
            this.bfCacheController.init()
        }
        _buildConfigRequest() {
            let e = [];
            const {isPreview: t, previewId: i} = this.environmentModel;
            e = t && i ? [i] : [...this.parsedDomResults.uniqueIds];
            return ye.buildConfigRequest(this.environmentModel, e, this.analyticsStore.store.state)
        }
        getNavigationUrl({url: e}, t) {
            const i = new URL(e);
            if (!i.searchParams.has("encryptedPayload"))
                return e;
            const s = Js(e)
              , n = this.configStore.configs.get(t);
            if (!n)
                return e;
            i.searchParams.set("webInteractiveId", String(n.webInteractiveId));
            i.searchParams.set("containerType", n.containerType);
            n.campaignGuid && i.searchParams.set("campaignId", n.campaignGuid);
            n.contentModelId && i.searchParams.set("webInteractiveContentId", String(n.contentModelId));
            n.audienceId && i.searchParams.set("audienceId", String(n.audienceId));
            this.analyticsStore.analytics.hutk && i.searchParams.set("hutk", this.analyticsStore.analytics.hutk);
            this.environmentModel.language && i.searchParams.set("hsLang", this.environmentModel.language);
            i.searchParams.delete("encryptedPayload");
            return decodeURIComponent(s.encryptedPayload) === s.encryptedPayload ? `${i.href}&encryptedPayload=${encodeURIComponent(s.encryptedPayload)}` : `${i.href}&encryptedPayload=${s.encryptedPayload}`
        }
        getShouldOpenNewTab(e, t) {
            if (!this.customerCTAOptions.options.has(t))
                return e.openNewTab;
            return this.customerCTAOptions.options.get(t).openInNewTab || !1
        }
        listenForConfigs() {
            this.configStore.subscribe(( (t, i) => {
                setTimeout(( () => {
                    if (t.configs.size !== i.configs.size)
                        for (const [t,i] of this.configStore.configs)
                            Gi.broadcast(t, {
                                type: e.SEND_CTA_CONFIG,
                                payload: Object.assign({
                                    portalId: this.environmentModel.portalId,
                                    pageUrl: this.environmentModel.currentUrl,
                                    pageTitle: document.title,
                                    gates: this.environmentModel.gates,
                                    pageId: this.environmentModel.pageId
                                }, i)
                            })
                }
                ))
            }
            ))
        }
        processConfigResponse(e) {
            if (e && Array.isArray(e.gates)) {
                Ks("Retrieved Gates from config response", e.gates);
                this.environmentModel.setGates(e.gates)
            }
        }
    }
    const en = new Zs({
        configStore: be,
        environmentModel: Ae
    });
    window.__hsWebInteractiveInstance = en;
    var tn = en;
    const sn = () => !(!window.disabledHsPopups || !(window.disabledHsPopups.indexOf("LEADFLOW") > -1 || window.disabledHsPopups.indexOf("CTAS") > -1)) || !!window.hsInEditor;
    function nn() {
        document.querySelectorAll(".hs-cta-embed").forEach((e => {
            e.classList.add("hs-cta-embed__loaded");
            const t = e.querySelector(".hs-cta-loading-dot__container");
            t && t.remove();
            const i = e.querySelector(".hs-cta-embed__skeleton");
            i && i.remove()
        }
        ))
    }
    function on() {
        nn();
        new MutationObserver((e => {
            for (const t of e)
                "childList" === t.type && t.addedNodes.forEach((e => {
                    1 === e.nodeType && e instanceof HTMLElement && e.querySelector(".hs-cta-embed") && nn()
                }
                ))
        }
        )).observe(document.body, {
            childList: !0,
            subtree: !0
        })
    }
    const rn = () => {
        if (sn()) {
            if (window.hsInEditor)
                try {
                    on()
                } catch (e) {
                    console.error("Error marking cta embed preview as loaded", e)
                }
        } else if (window.hubspot_web_interactives_running)
            console.error("duplicate instance of web interactives app exists");
        else {
            tn.init();
            window.hubspot_web_interactives_running = !0
        }
    }
      , an = () => {
        rn();
        document.removeEventListener("DOMContentLoaded", an)
    }
    ;
    "loading" === document.readyState ? document.addEventListener("DOMContentLoaded", an) : rn()
}();
