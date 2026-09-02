/* =========================================================================
   Couche de relecture, maquette uniquement.

   Lit les attributs data-note de la page, numérote chaque texte annoté
   dans l'ordre de lecture et pose une pastille cliquable après lui.

   Format attendu : data-note="Étiquette | Commentaire".
   Sans barre verticale, tout le contenu sert de commentaire.

   ⚠️ Ne doit jamais partir dans le thème WordPress. Voir annotations.css.
   ========================================================================= */
(function () {
  'use strict';

  var cibles = document.querySelectorAll('[data-note]');
  if (!cibles.length) {
    return;
  }

  var ouverte = null;

  function fermer() {
    if (ouverte) {
      ouverte.classList.remove('est-ouverte', 'note--dessus');
      ouverte.querySelector('.note__puce').setAttribute('aria-expanded', 'false');
      ouverte = null;
    }
  }

  function ouvrir(note) {
    if (ouverte === note) {
      return;
    }
    fermer();
    note.classList.add('est-ouverte');
    note.querySelector('.note__puce').setAttribute('aria-expanded', 'true');
    ouverte = note;
    caler(note);
  }

  /* La bulle est centrée sous la pastille par défaut. On la décale
     horizontalement si elle sort de l'écran, et on la bascule au-dessus
     s'il n'y a pas la place en dessous. */
  function caler(note) {
    var bulle = note.querySelector('.note__bulle');
    bulle.style.marginLeft = '0px';

    var boite = bulle.getBoundingClientRect();
    var marge = 12;
    var debord = 0;

    if (boite.left < marge) {
      debord = marge - boite.left;
    } else if (boite.right > window.innerWidth - marge) {
      debord = window.innerWidth - marge - boite.right;
    }

    if (debord) {
      bulle.style.marginLeft = Math.round(debord) + 'px';
    }

    if (boite.bottom > window.innerHeight - marge && boite.height + marge < note.getBoundingClientRect().top) {
      note.classList.add('note--dessus');
    }
  }

  Array.prototype.forEach.call(cibles, function (cible, index) {
    var brut = cible.getAttribute('data-note') || '';
    var coupe = brut.indexOf('|');
    var etiquette = coupe > -1 ? brut.slice(0, coupe).trim() : '';
    var texte = coupe > -1 ? brut.slice(coupe + 1).trim() : brut.trim();
    var numero = index + 1;

    var note = document.createElement('span');
    note.className = 'note';

    var puce = document.createElement('button');
    puce.className = 'note__puce';
    puce.type = 'button';
    puce.textContent = numero;
    puce.setAttribute('aria-expanded', 'false');
    puce.setAttribute(
      'aria-label',
      'Commentaire ' + numero + (etiquette ? ', ' + etiquette : '') + ' : ' + texte
    );

    var bulle = document.createElement('span');
    bulle.className = 'note__bulle';
    bulle.setAttribute('role', 'tooltip');
    if (etiquette) {
      var titre = document.createElement('span');
      titre.className = 'note__etiquette';
      titre.textContent = etiquette;
      bulle.appendChild(titre);
    }
    bulle.appendChild(document.createTextNode(texte));

    note.appendChild(puce);
    note.appendChild(bulle);
    cible.appendChild(note);

    note.addEventListener('mouseenter', function () {
      ouvrir(note);
    });
    note.addEventListener('mouseleave', function () {
      fermer();
    });
    puce.addEventListener('focus', function () {
      ouvrir(note);
    });
    puce.addEventListener('blur', function () {
      fermer();
    });
    /* L'appui sert au tactile, où le survol n'existe pas. */
    puce.addEventListener('click', function (evenement) {
      evenement.preventDefault();
      evenement.stopPropagation();
      if (ouverte === note) {
        fermer();
      } else {
        ouvrir(note);
      }
    });
  });

  document.addEventListener('click', fermer);
  document.addEventListener('keydown', function (evenement) {
    if (evenement.key === 'Escape') {
      fermer();
    }
  });
  window.addEventListener('resize', fermer);

  /* Bouton d'affichage général. L'état est retenu d'une page à l'autre
     quand le navigateur l'autorise, sinon la couche s'affiche. */
  var racine = document.documentElement;
  var CLE = 'cyrval-notes-masquees';
  var masquees = false;

  try {
    masquees = window.localStorage.getItem(CLE) === '1';
  } catch (e) {
    masquees = false;
  }

  var bascule = document.createElement('button');
  bascule.className = 'notes-bascule';
  bascule.type = 'button';

  var libelle = document.createElement('span');
  var compteur = document.createElement('span');
  compteur.className = 'notes-bascule__pastille';
  compteur.textContent = cibles.length;
  bascule.appendChild(libelle);
  bascule.appendChild(compteur);

  function peindre() {
    racine.classList.toggle('notes-masquees', masquees);
    libelle.textContent = masquees ? 'Afficher les commentaires' : 'Masquer les commentaires';
    bascule.setAttribute('aria-pressed', masquees ? 'false' : 'true');
  }

  bascule.addEventListener('click', function (evenement) {
    evenement.stopPropagation();
    masquees = !masquees;
    fermer();
    peindre();
    try {
      window.localStorage.setItem(CLE, masquees ? '1' : '0');
    } catch (e) {
      /* Navigation privée ou stockage refusé : l'état vaut pour la page. */
    }
  });

  peindre();
  document.body.appendChild(bascule);
})();
