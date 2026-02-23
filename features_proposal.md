# Proposition de Fonctionnalités Solides et 100% Gratuites pour Feelio

Ce document présente un plan détaillé pour améliorer l'application Feelio existante avec de nouvelles fonctionnalités robustes qui ne dépendent d'aucune API payante ou qui utilisent des API avec un niveau gratuit (Free Tier) généreux.

## Objectif

L'objectif est d'enrichir l'expérience de "journal intime et de suivi d'humeur" de l'utilisateur tout en préservant l'aspect "Privacy-first" local et en évitant les coûts récurrents de serveurs ou d'API.

---

## 1. Suivi et Analyse de l'Humeur (Mood Tracking & Analytics)

Cette fonctionnalité enrichit le dashboard existant avec des statistiques utiles basées sur les entrées du journal.

*   **Description :** Permettre à l'utilisateur de lier un "état d'esprit" (Mood) à chaque entrée de journal et visualiser ces données sous forme de graphiques locaux.
*   **Implémentation :**
    *   **Base de données (SQLite) :** Ajouter une colonne `mood` (ex: échelle de 1 à 5, ou émojis: 😭, 😕, 😐, 🙂, 😄) dans la table `diary`.
    *   **Interface Vue Ajout (Add) :** Intégrer un sélecteur d'humeur rapide lors de la création d'une note.
    *   **Dashboard :** Utiliser une bibliothèque de graphiques gratuite comme `react-native-chart-kit` ou `react-native-svg-charts` pour générer :
        *   Un graphique linéaire de l'humeur sur le mois.
        *   Un graphique circulaire de la répartition des humeurs.
        *   Des "Streaks" (série de jours consécutifs avec une entrée).
*   **Pourquoi c'est solide/gratuit :** Tout est calculé localement sur le téléphone. Aucune API externe n'est requise. Les bibliothèques React Native pour les graphiques sont open source.

## 2. Intégration de Photos Locales

Un journal intime est souvent accompagné de souvenirs visuels.

*   **Description :** Permettre d'attacher une ou plusieurs images à une entrée de journal.
*   **Implémentation :**
    *   **Module :** Utiliser `expo-image-picker` (déjà inclus dans l'écosystème Expo, gratuit).
    *   **Stockage :** Enregistrer les chemins des images localement via `expo-file-system`.
    *   **Base de données (SQLite) :** Créer une ou plusieurs colonnes pour les chemins relatifs des images liées à l'entrée (ou une nouvelle table liée).
    *   **Interface (UI) :** Modifier la vue `Diary` et `DiaryList` pour afficher des miniatures d'images si elles existent.
*   **Pourquoi c'est solide/gratuit :** Le fichier image reste complètement sur l'appareil. Aucun besoin de stockage cloud (AWS S3, Firebase, etc.).

## 3. Riche Éditeur de Texte (Rich Text Editor)

Améliorer l'expérience de rédaction plutôt qu'un simple texte brut.

*   **Description :** Permettre de mettre le texte en gras, en italique, de créer des listes à puces ou d'ajouter des titres au sein d'une même entrée.
*   **Implémentation :**
    *   **Bibliothèque :** Remplacer le simple `TextInput` par un éditeur open source sans coûts comme `react-native-pell-rich-editor` (qui génère du HTML).
    *   **Affichage :** Utiliser `react-native-render-html` pour afficher le contenu enrichi dans la vue de lecture du journal.
*   **Pourquoi c'est solide/gratuit :** Un éditeur wysiwyg standard améliore grandement le ressenti "premium" sans aucun coût externe.

## 4. Notifications et Rappels Quotidiens Locaux

Encourager l'utilisation régulière de l'application.

*   **Description :** Permettre à l'utilisateur de définir une heure (ex: 20h00) pour recevoir une notification push lui rappelant d'écrire dans son journal.
*   **Implémentation :**
    *   **Module :** Utiliser `expo-notifications` (inclus, gratuit).
    *   **Logique :** Les notifications sont "locales" et programmées (scheduled) directement sur l'appareil de l'utilisateur. Elles ne nécessitent pas de serveur d'envoi push (comme APNs ou FCM) externe.
    *   **Paramètres :** Ajouter une option dans l'écran de paramètres existant pour choisir l'heure du rappel.
*   **Pourquoi c'est solide/gratuit :** C'est une fonctionnalité essentielle d'engagement sans le coût ou la complexité d'un serveur backend.

## 5. Fonctionnalité de Recherche et de Tags (Étiquettes)

Aider l'utilisateur à retrouver de vieilles entrées facilement.

*   **Description :** Pouvoir chercher un mot spécifique dans tout le contenu des journaux, ou filtrer par tags personnalisés (ex: #travail, #famille).
*   **Implémentation :**
    *   **Recherche textuelle :** Ajouter une barre de recherche sur la page d'accueil qui lance une requête SQLite `LIKE '%terme%'`.
    *   **Tags :** Optionnel mais puissant. Extraire les mots commençant par '#' avec une regex dans le texte et les enregistrer dans la BDD pour un filtrage rapide.
*   **Pourquoi c'est solide/gratuit :** Utilise la puissance locale de SQLite sans appels API.

## 6. Export/Sauvegarde Sécurisée du Journal (Backup)

Pour rassurer l'utilisateur sur la sécurité de ses données par rapport à un changement de téléphone.

*   **Description :** Exporter tout le fichier SQLite `feelio.db` ou générer un document JSON compressé contenant toutes les entrées.
*   **Implémentation :**
    *   **Module :** `expo-sharing` et `expo-file-system`.
    *   **Action :** Le bouton "Exporter mes données" permet à l'utilisateur d'envoyer lui-même le fichier via la fonctionnalité de partage native de son OS (par email, vers Google Drive, iCloud, etc.).
*   **Pourquoi c'est solide/gratuit :** Vous déléguez le coût de stockage à l'utilisateur (son propre compte Google Drive/Apple) sans devoir fournir l'infrastructure.

## 7. Météo Automatique (via API gratuite)

Lier les souvenirs au contexte environnemental.

*   **Description :** Lorsqu'une nouvelle entrée est créée, l'application récupère en arrière-plan la température et la météo du moment.
*   **Implémentation :**
    *   **API :** [OpenWeatherMap API](https://openweathermap.org/api) (Fournit 1000 appels par jour gratuitement, largement suffisant pour un usage individuel via une clé API).
    *   **Module :** `expo-location` (déjà dans les dépendances de `package.json` de Feelio) pour obtenir latitude/longitude.
    *   **Affichage :** Ajouter une petite icône météo (☀️, 🌧️) à côté du timestamp.
*   **Pourquoi c'est solide/gratuit :** L'API OpenWeather est un standard de l'industrie avec un excellent plan gratuit.

---

### Résumé de l'Approche

Cette proposition se concentre sur **l'enrichissement fonctionnel local**, qui tire parti des capacités matérielles du téléphone (GPS, Stockage, Notifications Locales, Puissance de calcul pour SQLite/Graphiques), maximisant la qualité de l'application tout en assurant que Feelio reste :
1. **Zéro coût d'infrastructure**
2. **Totalement privé et sécurisé**
3. **Fonctionnel hors ligne (Offline-first)** (sauf pour la météo)
