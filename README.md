# Maquette CYRVAL

Maquette HTML de la refonte du site vitrine CYRVAL, cabinet de conseil en
gestion de patrimoine à Nîmes.

Deux pages statiques, sans dépendance externe : ouvrir `index.html` dans un
navigateur suffit, le rendu est identique hors ligne.

## Contenu

```
index.html          Accueil
pole-conseil.html   Pôle Conseil
assets/
  css/cyrval.css    feuille unique, partagée par les 2 pages
  js/cyrval.js      en-tête au défilement, menu, apparitions
  fonts/            Inter (variable, latin), embarquée
  img/              photographies de mise en page
```

## Nature du document

Support de présentation destiné à la validation du parti pris graphique. Les
photographies sont des images de mise en page issues d'Unsplash, sans lien avec
le cabinet, et seront remplacées par les visuels du client. Les textes affichés
servent au calibrage des blocs et ne constituent pas le contenu éditorial
définitif.

## Reprise technique

La maquette est écrite pour être reprise en thème WordPress sur mesure :
variables de couleur, classes nommées, composants réutilisables, et responsive
géré en media queries plutôt qu'en JavaScript.

Deux réglages du dessin sont volontaires et se cassent au premier nettoyage :

- **Les congés du décroché** suivent une règle de tangence, congé 0,42 et
  arrondi 0,58 de la hauteur du bloc. La somme fait 1, ce qui rend le flanc
  continu. Toute autre répartition laisse un segment droit qui se lit comme un
  défaut. Les rayons se déduisent de `--h-bloc`, il n'y a aucune valeur en dur.
- **Les débords d'1 px** des étiquettes et des congés sont là pour absorber
  l'anticrénelage aux raccords. Les supprimer fait réapparaître un liseré clair.

## Couche de relecture

`assets/css/annotations.css` et `assets/js/annotations.js` posent une pastille
numérotée après chaque texte qui ne vient pas du client : soit un arbitrage à
rendre, soit un contenu encore attendu. Un survol, un focus clavier ou un appui
affiche le commentaire. Un bouton en bas à droite masque toute la couche pour
relire la page nette, et l'état est retenu d'une page à l'autre.

Les commentaires se déclarent dans le HTML, en un seul attribut :

```html
<h2 class="titre-section" data-note="ÉTIQUETTE | Le commentaire.">Titre</h2>
```

La numérotation est automatique et suit l'ordre de lecture de la page.

**Cette couche est propre à la maquette et ne doit jamais partir dans le thème
WordPress.** Pour la retirer : supprimer les deux fichiers, les deux lignes qui
les appellent dans chaque page, et les attributs `data-note`. Rien d'autre n'en
dépend.

## Crédits

Conception et intégration : Clarisse Cellier, Studio Toinon.
Photographies de mise en page : Unsplash.
Caractère : Inter, SIL Open Font License 1.1.
