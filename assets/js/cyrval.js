/* =============================================================
   CYRVAL — maquette de référence
   Studio Toinon pour SEDICOM — juillet 2026

   Trois comportements seulement :
   1. l'en-tête qui devient blanc au défilement
   2. le menu déplié sous 1180 px
   3. les apparitions au défilement (avec repli si l'observateur
      n'est pas disponible ou si l'animation est refusée)
   ============================================================= */

(function () {
  'use strict';

  var entete = document.querySelector('[data-entete]');
  var burger = document.querySelector('[data-burger]');
  var animationRefusee = window.matchMedia
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. En-tête au défilement ----------
     L'en-tête reste transparent sur toute la première section, puis
     passe en bandeau blanc quand la fin de cette section arrive sous
     lui. Les deux seuils sont volontairement décalés de 12 px : sans
     ça, l'en-tête qui se raccourcit en devenant blanc repasserait
     sous le seuil et clignoterait. */

  var premiere = document.querySelector('main > section');

  function majEntete() {
    if (!entete) return;

    if (!premiere) {
      entete.classList.toggle('est-defilee', window.scrollY > 10);
      return;
    }

    var bas = premiere.getBoundingClientRect().bottom;
    var hauteur = entete.offsetHeight;

    if (entete.classList.contains('est-defilee')) {
      if (bas > hauteur + 12) entete.classList.remove('est-defilee');
    } else if (bas <= hauteur) {
      entete.classList.add('est-defilee');
    }
  }

  window.addEventListener('scroll', majEntete, { passive: true });
  majEntete();

  /* ---------- 2. Menu déplié ---------- */

  function fermerMenu() {
    if (!entete) return;
    entete.classList.remove('menu-ouvert');
    if (burger) burger.setAttribute('aria-expanded', 'false');
  }

  if (burger && entete) {
    burger.addEventListener('click', function () {
      var ouvert = entete.classList.toggle('menu-ouvert');
      burger.setAttribute('aria-expanded', ouvert ? 'true' : 'false');
    });

    document.querySelectorAll('.menu-mobile a').forEach(function (lien) {
      lien.addEventListener('click', fermerMenu);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') fermerMenu();
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 1180) fermerMenu();
    });
  }

  /* ---------- 3. Apparitions au défilement ---------- */

  var blocs = document.querySelectorAll('[data-reveal]');
  var sequences = document.querySelectorAll('[data-sequence]');

  function toutAfficher() {
    blocs.forEach(function (el) { el.classList.add('est-visible'); });
    sequences.forEach(function (conteneur) {
      conteneur.querySelectorAll('[data-etape]').forEach(function (el) {
        el.classList.add('est-visible');
      });
      remplirProgression(conteneur, 1);
    });
  }

  function remplirProgression(conteneur, ratio) {
    var barre = conteneur.querySelector('[data-progression]');
    if (!barre) return;
    var valeur = Math.round(ratio * 100) + '%';
    if (conteneur.getAttribute('data-sequence') === 'verticale') {
      barre.style.height = valeur;
    } else {
      barre.style.width = valeur;
    }
  }

  if (animationRefusee || !('IntersectionObserver' in window)) {
    toutAfficher();
    return;
  }

  var observateur = new IntersectionObserver(function (entrees) {
    entrees.forEach(function (entree) {
      if (!entree.isIntersecting) return;
      entree.target.classList.add('est-visible');
      observateur.unobserve(entree.target);
    });
  }, { threshold: 0.15 });

  blocs.forEach(function (el) { observateur.observe(el); });

  /* Les étapes numérotées apparaissent l'une après l'autre et
     font progresser le filet doré qui les relie. */
  sequences.forEach(function (conteneur) {
    var etapes = Array.prototype.slice.call(conteneur.querySelectorAll('[data-etape]'));
    if (!etapes.length) return;
    var atteintes = 0;

    etapes.forEach(function (etape, i) {
      etape.style.transitionDelay = (i * 0.08) + 's';
    });

    var suivi = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (entree) {
        if (!entree.isIntersecting) return;
        var index = etapes.indexOf(entree.target);
        entree.target.classList.add('est-visible');
        atteintes = Math.max(atteintes, index + 1);
        remplirProgression(conteneur, atteintes / etapes.length);
        suivi.unobserve(entree.target);
      });
    }, { threshold: 0.4 });

    etapes.forEach(function (etape) { suivi.observe(etape); });
  });

  /* Filet de sécurité : si au bout d'une seconde et demie aucun bloc
     n'a été révélé, c'est que l'observateur ne fait pas son travail.
     On affiche tout plutôt que de laisser une page vide. */
  setTimeout(function () {
    if (!document.querySelector('[data-reveal].est-visible')) toutAfficher();
  }, 1500);
})();
