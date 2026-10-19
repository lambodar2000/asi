/* Autism Society of India — progressive enhancement. Every page works without this file. */
(function () {
  "use strict";
  var root = document.documentElement;
  root.classList.add("js");
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var live = function (msg) {
    var r = $("#live-region");
    if (!r) return;
    r.textContent = "";
    setTimeout(function () { r.textContent = msg; }, 50);
  };
  var calm = function () {
    return root.getAttribute("data-calm") === "on" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  };

  /* ---------- Accessibility preferences ---------- */
  var KEY = "asi-a11y";
  var prefs = {};
  try { prefs = JSON.parse(localStorage.getItem(KEY) || "{}"); } catch (e) {}

  function applyPrefs() {
    ["size", "theme", "calm", "font", "spacing", "links"].forEach(function (k) {
      if (prefs[k]) root.setAttribute("data-" + k, prefs[k]);
      else root.removeAttribute("data-" + k);
    });
    $$("[data-pref]").forEach(function (el) {
      var k = el.getAttribute("data-pref");
      if (el.type === "checkbox") el.checked = !!prefs[k];
      else el.setAttribute("aria-pressed", String((prefs[k] || "") === el.getAttribute("data-value")));
    });
    try { localStorage.setItem(KEY, JSON.stringify(prefs)); } catch (e) {}
  }

  $$("[data-pref]").forEach(function (el) {
    var k = el.getAttribute("data-pref");
    if (el.type === "checkbox") {
      el.addEventListener("change", function () {
        prefs[k] = el.checked ? el.value : "";
        applyPrefs();
        live(el.parentElement.querySelector("span").firstChild.textContent.trim() + (el.checked ? " on" : " off"));
      });
    } else {
      el.addEventListener("click", function () {
        prefs[k] = el.getAttribute("data-value");
        applyPrefs();
        live(el.closest("fieldset").querySelector("legend").textContent + ": " + el.textContent);
      });
    }
  });

  var panel = $("#a11y-panel");
  var panelBtn = $("[data-a11y-toggle]");
  function setPanel(open) {
    if (!panel) return;
    panel.hidden = !open;
    panelBtn.setAttribute("aria-expanded", String(open));
    if (open) panel.querySelector("button, input").focus();
    else panelBtn.focus();
  }
  if (panelBtn) {
    panelBtn.addEventListener("click", function () { setPanel(panel.hidden); });
    $("[data-a11y-close]").addEventListener("click", function () { setPanel(false); });
    $("[data-a11y-reset]").addEventListener("click", function () { prefs = {}; applyPrefs(); live("Settings reset"); });
    panel.addEventListener("keydown", function (e) { if (e.key === "Escape") setPanel(false); });
  }
  applyPrefs();

  /* ---------- Navigation ---------- */
  var menuBtn = $("[data-menu-toggle]");
  var nav = $("#site-nav");
  if (menuBtn) {
    menuBtn.addEventListener("click", function () {
      var open = menuBtn.getAttribute("aria-expanded") !== "true";
      menuBtn.setAttribute("aria-expanded", String(open));
      nav.classList.toggle("is-open", open);
    });
  }
  var subs = $$(".sub-toggle");
  function closeSubs(except) {
    subs.forEach(function (b) { if (b !== except) b.setAttribute("aria-expanded", "false"); });
  }
  subs.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var open = btn.getAttribute("aria-expanded") !== "true";
      closeSubs(btn);
      btn.setAttribute("aria-expanded", String(open));
    });
    btn.parentElement.addEventListener("focusout", function (e) {
      if (!btn.parentElement.contains(e.relatedTarget) && window.innerWidth > 1080) btn.setAttribute("aria-expanded", "false");
    });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    var openSub = subs.filter(function (b) { return b.getAttribute("aria-expanded") === "true"; })[0];
    if (openSub) { closeSubs(); openSub.focus(); return; }
    if (menuBtn && menuBtn.getAttribute("aria-expanded") === "true") { menuBtn.click(); menuBtn.focus(); }
  });
  document.addEventListener("click", function (e) { if (!e.target.closest(".has-sub")) closeSubs(); });

  /* ---------- Tabs (WAI-ARIA tabs pattern, automatic activation) ---------- */
  $$("[data-tabs]").forEach(function (wrap) {
    var tabs = $$("[role=tab]", wrap);
    function select(tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
        document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
      });
      if (focus) tab.focus();
    }
    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { select(t); });
      t.addEventListener("keydown", function (e) {
        var n = { ArrowRight: i + 1, ArrowDown: i + 1, ArrowLeft: i - 1, ArrowUp: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
        if (n === undefined) return;
        e.preventDefault();
        select(tabs[(n + tabs.length) % tabs.length], true);
      });
    });
    select(tabs[0]);
  });

  /* ---------- Count-up stats ---------- */
  var counters = $$("[data-count]");
  if (counters.length && "IntersectionObserver" in window && !calm()) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target, target = +el.getAttribute("data-count"), suffix = el.getAttribute("data-suffix") || "";
        var start = performance.now(), dur = 1200;
        (function tick(now) {
          var p = Math.min(1, (now - start) / dur), eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(target * eased) + suffix;
          if (p < 1) requestAnimationFrame(tick);
        })(start);
        cio.unobserve(el);
      });
    }, { threshold: .6 });
    counters.forEach(function (el) {
      el.setAttribute("aria-label", el.textContent);
      cio.observe(el);
    });
  }

  /* ---------- Reveal on scroll ---------- */
  var reveals = $$(".reveal");
  if (reveals.length && "IntersectionObserver" in window && !calm()) {
    var rio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("is-in"); rio.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { rio.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------- Table of contents scroll-spy ---------- */
  var tocLinks = $$(".toc a[href^='#']");
  if (tocLinks.length && "IntersectionObserver" in window) {
    var map = {};
    tocLinks.forEach(function (a) { map[a.getAttribute("href").slice(1)] = a; });
    var tio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        tocLinks.forEach(function (a) { a.removeAttribute("aria-current"); });
        var a = map[en.target.id];
        if (a) a.setAttribute("aria-current", "true");
      });
    }, { rootMargin: "-20% 0px -70% 0px" });
    Object.keys(map).forEach(function (id) { var s = document.getElementById(id); if (s) tio.observe(s); });
    var tocDetails = $(".toc details");
    if (tocDetails && window.innerWidth >= 980) tocDetails.open = true;
  }

  /* ---------- Early signs checklist ---------- */
  var signs = $("[data-signs]");
  if (signs) {
    var out = $("[data-signs-result]");
    signs.addEventListener("change", function () {
      var n = $$("input:checked", signs).length;
      out.textContent = n === 0
        ? "Tick any signs you have noticed."
        : n + (n === 1 ? " sign" : " signs") + " noticed. This is not a diagnosis — please talk to your paediatrician about developmental screening, and reach out to ASI for support.";
    });
  }

  /* ---------- Filter chips + search (activities, resources) ---------- */
  $$("[data-filter-group]").forEach(function (group) {
    var target = document.getElementById(group.getAttribute("data-filter-group"));
    var items = $$("[data-tags]", target);
    var chips = $$("[data-filter]", group);
    var search = $("input[type=search]", group);
    var count = $("[data-filter-count]", group);
    var empty = $("[data-filter-empty]", target.parentElement);
    var active = "all";
    function run() {
      var q = search ? search.value.trim().toLowerCase() : "";
      var shown = 0;
      items.forEach(function (it) {
        var okTag = active === "all" || it.getAttribute("data-tags").split(" ").indexOf(active) > -1;
        var okText = !q || it.textContent.toLowerCase().indexOf(q) > -1;
        it.hidden = !(okTag && okText);
        if (!it.hidden) shown++;
      });
      if (count) count.textContent = "Showing " + shown + " of " + items.length;
      if (empty) empty.hidden = shown > 0;
    }
    chips.forEach(function (c) {
      c.addEventListener("click", function () {
        active = c.getAttribute("data-filter");
        chips.forEach(function (x) { x.setAttribute("aria-pressed", String(x === c)); });
        run();
      });
    });
    if (search) search.addEventListener("input", run);
    run();
  });

  /* ---------- Copy to clipboard ---------- */
  $$("[data-copy]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var text = btn.getAttribute("data-copy");
      var done = function () {
        var old = btn.textContent;
        btn.textContent = "Copied";
        btn.classList.add("is-done");
        live(btn.getAttribute("aria-label").replace("Copy ", "") + " copied");
        setTimeout(function () { btn.textContent = old; btn.classList.remove("is-done"); }, 2000);
      };
      if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, function () { live("Copy failed. Please select the text instead."); });
    });
  });

  /* ---------- Gallery lightbox ---------- */
  var lb = $("#lightbox");
  if (lb && typeof lb.showModal === "function") {
    var all = $$("[data-lightbox]"), shots = all;
    var img = $("img", lb), cap = $("figcaption", lb), pos = $("[data-lb-pos]", lb), idx = 0, opener;
    function show(i) {
      idx = (i + shots.length) % shots.length;
      var b = shots[idx];
      img.src = b.getAttribute("data-full");
      img.alt = $("img", b).alt;
      cap.textContent = b.getAttribute("data-caption") || $("img", b).alt;
      pos.textContent = "Photo " + (idx + 1) + " of " + shots.length;
    }
    all.forEach(function (b) {
      b.addEventListener("click", function () {
        // Only step through photos the current filter shows.
        shots = all.filter(function (x) { return !x.closest("[hidden]"); });
        opener = b;
        show(shots.indexOf(b));
        lb.showModal();
        $("[data-lb-close]", lb).focus();
      });
    });
    $("[data-lb-prev]", lb).addEventListener("click", function () { show(idx - 1); live(pos.textContent); });
    $("[data-lb-next]", lb).addEventListener("click", function () { show(idx + 1); live(pos.textContent); });
    $("[data-lb-close]", lb).addEventListener("click", function () { lb.close(); });
    lb.addEventListener("close", function () { setTimeout(function () { if (opener) opener.focus(); }, 0); });
    lb.addEventListener("click", function (e) { if (e.target === lb) lb.close(); });
    lb.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") { show(idx - 1); live(pos.textContent); }
      if (e.key === "ArrowRight") { show(idx + 1); live(pos.textContent); }
    });
  }

  /* ---------- Contact form: validation + mailto hand-off ---------- */
  var form = $("[data-contact-form]");
  if (form) {
    form.setAttribute("novalidate", "");
    var summary = $("[data-error-summary]");
    var topicKey = new URLSearchParams(location.search).get("topic");
    var topicOpt = topicKey && $("#c-topic option[data-key='" + topicKey + "']");
    if (topicOpt) topicOpt.selected = true;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var errors = [];
      $$("[data-error-for]", form).forEach(function (p) { p.hidden = true; });
      $$("[required]", form).forEach(function (f) {
        var bad = f.type === "checkbox" ? !f.checked : !f.value.trim() || (f.type === "email" && !/^\S+@\S+\.\S+$/.test(f.value));
        f.setAttribute("aria-invalid", String(bad));
        if (bad) {
          var msg = $("[data-error-for='" + f.id + "']", form);
          msg.hidden = false;
          errors.push({ id: f.id, text: msg.textContent });
        }
      });
      if (errors.length) {
        summary.hidden = false;
        $("ul", summary).innerHTML = errors.map(function (x) { return '<li><a href="#' + x.id + '">' + x.text + "</a></li>"; }).join("");
        summary.focus();
        return;
      }
      summary.hidden = true;
      var v = function (id) { var el = document.getElementById(id); return el ? el.value.trim() : ""; };
      var body = "Name: " + v("c-name") + "\nI am a: " + v("c-role") + "\nEmail: " + v("c-email") +
        "\nPhone: " + v("c-phone") + "\nCity: " + v("c-city") + "\n\n" + v("c-message");
      window.location.href = "mailto:autismsocietyofindia2006@gmail.com?subject=" +
        encodeURIComponent("[Website] " + v("c-topic")) + "&body=" + encodeURIComponent(body);
      var ok = $("[data-form-success]");
      ok.hidden = false;
      ok.focus();
    });
  }

  /* ---------- Reading progress (blog posts) ---------- */
  var bar = $(".reading-progress");
  if (bar) {
    var art = $(".post");
    var upd = function () {
      var r = art.getBoundingClientRect();
      var p = Math.min(1, Math.max(0, -r.top / (r.height - window.innerHeight)));
      bar.style.transform = "scaleX(" + p + ")";
    };
    window.addEventListener("scroll", upd, { passive: true });
    upd();
  }

  /* ---------- Read aloud (Web Speech API) ---------- */
  var readBtn = $("[data-read-aloud]");
  if (readBtn) {
    if (!("speechSynthesis" in window)) { readBtn.hidden = true; return; }
    var label = $("[data-read-label]", readBtn);
    var queue = [], current = null, reading = false;
    function stop() {
      speechSynthesis.cancel();
      reading = false;
      if (current) current.classList.remove("is-reading");
      readBtn.setAttribute("aria-pressed", "false");
      label.textContent = "Read aloud";
    }
    function next() {
      if (current) current.classList.remove("is-reading");
      current = queue.shift();
      if (!current || !reading) { stop(); return; }
      current.classList.add("is-reading");
      current.scrollIntoView({ block: "center", behavior: calm() ? "auto" : "smooth" });
      var u = new SpeechSynthesisUtterance(current.innerText);
      u.lang = "en-IN";
      u.rate = .95;
      u.onend = next;
      u.onerror = next;
      speechSynthesis.speak(u);
    }
    readBtn.addEventListener("click", function () {
      if (reading) { stop(); return; }
      queue = $$("main h1, main h2, main h3, main p, main li, main dt, main dd").filter(function (el) {
        return el.offsetParent !== null && el.innerText.trim() && !el.closest("li li, nav, .filters, form");
      });
      reading = true;
      readBtn.setAttribute("aria-pressed", "true");
      label.textContent = "Stop reading";
      next();
    });
    window.addEventListener("pagehide", stop);
  }
})();
