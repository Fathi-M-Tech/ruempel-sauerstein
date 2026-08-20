/* ==========================================================================
   Rümpel Sauerstein – script.js
   Vanilla JS, keine Abhängigkeiten, keine Drittanbieter-Requests.
   ========================================================================== */

(function () {
  "use strict";

  /* ---------- Konfiguration ---------------------------------------------- */
  /* TODO: Echte Kontaktdaten des Kunden eintragen, bevor die Seite live geht. */
  var WA_NUMMER = "49XXXXXXXXXX";        // TODO: WhatsApp im Format 49 + Nummer ohne führende 0
  var MAIL      = "info@example.de";      // TODO: echte E-Mail-Adresse
  // Platzhalter: Rüsselsheim Zentrum (Marktplatz). TODO: nach Klärung auf echte Firmenadresse umstellen.
  var MAPS_EMBED = "https://www.google.com/maps?q=Marktplatz+R%C3%BCsselsheim+am+Main&output=embed";
  var IG_URL    = "https://instagram.com/"; // TODO: echte Instagram-URL

  /* ---------- 1 · Burger-Menü -------------------------------------------- */

  var burger = document.getElementById("burger");
  var nav = document.getElementById("main-nav");

  function closeNav() {
    if (!burger || !nav) return;
    nav.classList.remove("is-open");
    burger.setAttribute("aria-expanded", "false");
    burger.setAttribute("aria-label", "Menü öffnen");
    document.body.classList.remove("nav-open");
  }

  if (burger && nav) {
    burger.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      burger.setAttribute("aria-label", open ? "Menü schließen" : "Menü öffnen");
      document.body.classList.toggle("nav-open", open);
    });

    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) closeNav();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) {
        closeNav();
        burger.focus();
      }
    });

    // Beim Wechsel auf Desktop das Overlay sauber zurücksetzen
    window.addEventListener("resize", function () {
      if (window.innerWidth > 1024 && nav.classList.contains("is-open")) closeNav();
    });
  }

  /* ---------- 2 · Header-Zustand beim Scrollen ---------------------------- */

  var header = document.getElementById("header");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 12);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- 3 · Scroll-Reveal ------------------------------------------ */

  var reveals = document.querySelectorAll(".reveal");

  if (!("IntersectionObserver" in window)) {
    // Ohne Observer alles sofort sichtbar machen, nichts darf unsichtbar bleiben
    Array.prototype.forEach.call(reveals, function (el) { el.classList.add("is-visible"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });

    Array.prototype.forEach.call(reveals, function (el) { io.observe(el); });

    // Sicherheitsnetz: sollte der Observer aus irgendeinem Grund nicht feuern,
    // wird nach 2,5 s alles sichtbar. Inhalt darf nie dauerhaft unsichtbar bleiben.
    window.setTimeout(function () {
      Array.prototype.forEach.call(reveals, function (el) { el.classList.add("is-visible"); });
    }, 2500);
  }

  /* ---------- 4 · FAQ-Accordion ------------------------------------------ */

  Array.prototype.forEach.call(document.querySelectorAll(".faq__q"), function (btn) {
    btn.addEventListener("click", function () {
      var panel = document.getElementById(btn.getAttribute("aria-controls"));
      var open = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", open ? "false" : "true");
      if (panel) panel.setAttribute("data-open", open ? "false" : "true");
    });
  });

  /* ---------- 5 · Anfrage-Formular --------------------------------------- */

  var form = document.getElementById("anfrage-form");

  if (form) {
    var steps = form.querySelectorAll(".form-step");
    var bars = form.querySelectorAll(".form-progress__item");
    var preview = document.getElementById("form-preview");
    var sendWa = document.getElementById("send-wa");
    var sendMail = document.getElementById("send-mail");

    function showStep(n) {
      Array.prototype.forEach.call(steps, function (s) {
        s.classList.toggle("is-active", s.getAttribute("data-step") === String(n));
      });
      Array.prototype.forEach.call(bars, function (b) {
        b.classList.toggle("is-active", Number(b.getAttribute("data-progress")) <= n);
      });
      if (n === 3) buildText();
    }

    function val(id) {
      var el = document.getElementById(id);
      return el && el.value ? el.value.trim() : "";
    }

    // Baut den Nachrichtentext. Die Daten verlassen den Browser erst,
    // wenn der Nutzer selbst auf einen der Senden-Buttons tippt.
    function buildText() {
      var leistung = form.querySelector('input[name="leistung"]:checked');
      var zeilen = [
        "Anfrage über die Website",
        "",
        "Leistung: " + (leistung ? leistung.value : "-"),
        "Objekt: " + (val("objekt") || "-"),
        "Größe: " + (val("groesse") || "-")
      ];

      if (val("etage")) zeilen.push("Etage/Zugang: " + val("etage"));
      if (val("ort")) zeilen.push("Ort: " + val("ort"));
      if (val("name")) zeilen.push("Name: " + val("name"));
      if (val("wunsch")) zeilen.push("", "Anmerkung: " + val("wunsch"));

      var text = zeilen.join("\n");

      if (preview) preview.textContent = text;

      if (sendWa) {
        sendWa.setAttribute("href", "https://wa.me/" + WA_NUMMER + "?text=" + encodeURIComponent(text));
      }
      if (sendMail) {
        sendMail.setAttribute("href", "mailto:" + MAIL +
          "?subject=" + encodeURIComponent("Anfrage Entrümpelung") +
          "&body=" + encodeURIComponent(text));
      }

      return text;
    }

    form.addEventListener("click", function (e) {
      var next = e.target.closest("[data-next]");
      var prev = e.target.closest("[data-prev]");
      if (next) showStep(Number(next.getAttribute("data-next")));
      if (prev) showStep(Number(prev.getAttribute("data-prev")));
    });

    // Vorschau aktuell halten, während im letzten Schritt getippt wird
    form.addEventListener("input", function () {
      var active = form.querySelector(".form-step.is-active");
      if (active && active.getAttribute("data-step") === "3") buildText();
    });

    form.addEventListener("submit", function (e) { e.preventDefault(); });
  }

  /* ---------- 6 · Google Maps, Zwei-Klick-Consent ------------------------- */
  /* Vor dem Klick geht kein einziger Request an Google raus. */

  var mapBtn = document.getElementById("map-load");
  var mapBox = document.getElementById("map-consent");

  if (mapBtn && mapBox) {
    mapBtn.addEventListener("click", function () {
      var frame = document.createElement("iframe");
      frame.setAttribute("src", MAPS_EMBED);
      frame.setAttribute("title", "Karte des Einzugsgebiets");
      frame.setAttribute("loading", "lazy");
      frame.setAttribute("referrerpolicy", "no-referrer-when-downgrade");
      frame.setAttribute("allowfullscreen", "");
      mapBox.innerHTML = "";
      mapBox.appendChild(frame);
    });
  }

  /* ---------- 7 · Instagram-Consent-Modal --------------------------------- */

  var igModal = document.getElementById("ig-modal");
  var igGo = document.getElementById("ig-go");
  var igCancel = document.getElementById("ig-cancel");
  var igOpener = null;

  function closeIg() {
    if (!igModal) return;
    igModal.classList.remove("is-open");
    if (igOpener) igOpener.focus();
  }

  if (igModal) {
    if (igGo) igGo.setAttribute("href", IG_URL);

    Array.prototype.forEach.call(document.querySelectorAll("[data-instagram-consent]"), function (el) {
      el.addEventListener("click", function () {
        igOpener = el;
        igModal.classList.add("is-open");
        if (igGo) igGo.focus();
      });
    });

    if (igCancel) igCancel.addEventListener("click", closeIg);
    if (igGo) igGo.addEventListener("click", closeIg);

    igModal.addEventListener("click", function (e) {
      if (e.target === igModal) closeIg();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && igModal.classList.contains("is-open")) closeIg();
    });
  }

  /* ---------- 8 · Hero-Szene: Maus-Spotlight (Variante 2) ------------------ */
  /* Warmer Licht-Glow folgt dem Cursor über der Szene.
     Nur bei echtem Zeiger (Desktop), gedrosselt per rAF. Muster: Taxi Dawit. */

  var scene = document.querySelector(".hero-scene");

  if (scene && window.matchMedia("(pointer: fine)").matches) {
    var rafPending = false;
    var lastEvent = null;

    scene.addEventListener("pointermove", function (event) {
      lastEvent = event;
      if (rafPending) return;
      rafPending = true;
      window.requestAnimationFrame(function () {
        rafPending = false;
        var rect = scene.getBoundingClientRect();
        var x = ((lastEvent.clientX - rect.left) / rect.width) * 100;
        var y = ((lastEvent.clientY - rect.top) / rect.height) * 100;
        scene.style.setProperty("--spot-x", x + "%");
        scene.style.setProperty("--spot-y", y + "%");
      });
    }, { passive: true });
  }

  /* ---------- 9 · Google-Ads-Modul (deaktiviert) --------------------------- */
  /*
     Bewusst NICHT aktiv. Sobald Conversion-Tracking läuft, setzt die Seite
     Cookies und braucht einen Consent-Banner nach § 28 TDDDG.
     Schrittfolge zur Aktivierung steht in ADS-AKTIVIERUNG.md.
     Solange dieser Block auskommentiert ist, geht kein Request an Google raus.

     window.dataLayer = window.dataLayer || [];
     function gtag(){ dataLayer.push(arguments); }
     gtag("consent", "default", {
       ad_storage: "denied",
       ad_user_data: "denied",
       ad_personalization: "denied",
       analytics_storage: "denied"
     });
  */

})();
