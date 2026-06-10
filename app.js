/* =========================================================================
   FiliP · Vereinsheim TSV Göllsdorf — Interaktion
   ========================================================================= */
(function () {
  "use strict";

  /* ---- Empfänger-Adresse: hier zentral anpassbar ---- */
  var EMPFAENGER = "info@filip-goellsdorf.de";
  /* Optionaler Webhook-Endpoint (z. B. n8n/Make). Leer lassen für reinen Mailto-Versand. */
  var NOTIFY_ENDPOINT = "";

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $all(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  /* ---------- Topbar Scroll-Status ---------- */
  var topbar = $("#topbar");
  function onScroll() {
    if (!topbar) return;
    topbar.classList.toggle("is-scrolled", window.scrollY > 12);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile Navigation ---------- */
  var burger = $("#burger");
  var mobile = $("#topbarMobile");
  if (burger && mobile) {
    burger.addEventListener("click", function () {
      var open = mobile.classList.toggle("is-open");
      burger.classList.toggle("is-open", open);
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
    $all("a", mobile).forEach(function (a) {
      a.addEventListener("click", function () {
        mobile.classList.remove("is-open");
        burger.classList.remove("is-open");
        burger.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- Speisekarte Tabs ---------- */
  $all(".menu__tab").forEach(function (tab) {
    tab.addEventListener("click", function () {
      var target = tab.getAttribute("data-tab");
      $all(".menu__tab").forEach(function (t) { t.classList.toggle("is-active", t === tab); });
      $all(".menu__panel").forEach(function (p) {
        p.classList.toggle("is-active", p.getAttribute("data-panel") === target);
      });
    });
  });

  /* ---------- Heutigen Öffnungstag hervorheben ---------- */
  var today = new Date().getDay(); // 0 = Sonntag
  var map = { 1: "mo", 2: "di", 3: "mi", 4: "do", 5: "fr", 6: "sa", 0: "so" };
  var row = $('.hours__row[data-day="' + map[today] + '"]');
  if (row) {
    row.classList.add("is-today");
    var day = $(".hours__day", row);
    if (day && !$(".hours__badge", day)) {
      var b = document.createElement("span");
      b.className = "hours__badge";
      b.textContent = "Heute";
      day.appendChild(b);
    }
  }

  /* ---------- Reveal beim Scrollen ---------- */
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    $all(".reveal").forEach(function (el) { io.observe(el); });
  } else {
    $all(".reveal").forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------- Mindestdatum für Reservierung = heute ---------- */
  var dateField = $("#f-datum");
  if (dateField) {
    var t = new Date();
    var iso = t.getFullYear() + "-" +
      String(t.getMonth() + 1).padStart(2, "0") + "-" +
      String(t.getDate()).padStart(2, "0");
    dateField.min = iso;
  }

  /* ---------- Anfrage-Formular ---------- */
  var form = $("#anfrageForm");
  var msg = $("#formMsg");
  if (form) {
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var data = {
        anlass: val("f-anlass"),
        name: val("f-name"),
        email: val("f-email"),
        telefon: val("f-telefon"),
        datum: val("f-datum"),
        uhrzeit: val("f-uhrzeit"),
        personen: val("f-personen"),
        bereich: val("f-bereich"),
        nachricht: val("f-nachricht")
      };

      if (NOTIFY_ENDPOINT) {
        fetch(NOTIFY_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        }).catch(function () {});
      }

      var subject = "Anfrage FiliP – " + data.anlass + " – " + data.name;
      var lines = [
        "Anlass: " + data.anlass,
        "Name: " + data.name,
        "E-Mail: " + data.email,
        "Telefon: " + data.telefon,
        "Wunschdatum: " + data.datum,
        "Uhrzeit: " + data.uhrzeit,
        "Personen: " + data.personen,
        "Bereich: " + data.bereich,
        "",
        "Nachricht:",
        data.nachricht || "—"
      ];
      var mailto = "mailto:" + EMPFAENGER +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(lines.join("\n"));

      if (msg) {
        msg.classList.add("is-show");
        msg.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      var w = window.open(mailto, "_blank");
      if (!w) window.location.href = mailto;
      form.reset();
    });
  }

  function val(id) {
    var el = document.getElementById(id);
    return el ? String(el.value || "").trim() : "";
  }

  /* ---------- Jahr im Footer ---------- */
  var yr = $("#year");
  if (yr) yr.textContent = new Date().getFullYear();
})();
