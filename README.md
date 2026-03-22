# 🎓 Système de Gestion des Assignments

Bienvenue dans l'application de gestion des devoirs (Assignments). Ce projet complet permet aux élèves de soumettre leurs devoirs et aux professeurs/administrateurs de les gérer, de les noter et de configurer l'environnement pédagogique (matières).

---

## 🚀 Déploiement Live

*   **Frontend (Angular)** : [https://frontend-exdq.onrender.com](https://frontend-exdq.onrender.com)
*   **Backend (API Node.js)** : `https://assignments-api-5dov.onrender.com/api`

---

## 👥 Équipe du Projet

Ce projet a été réalisé par :
*   **FODJO KOUABENAN ARNAUD JUNIOR**
*   **SOUAGA AMENAN MAURELLE PRISCA**

---

## 🛠️ Installation et Configuration

### 1. Configuration du Backend
Le backend est une API REST construite avec Express et MongoDB Atlas.

1.  Ouvrez un terminal dans le dossier `backend` :
    ```bash
    cd backend
    ```
2.  Installez les dépendances :
    ```bash
    npm install
    ```
3.  Configurez vos variables d'environnement dans un fichier `.env` :
    ```env
    MONGO_URI=votre_url_mongodb
    PORT=3000
    JWT_SECRET=votre_secret
    ```
4.  Lancez le serveur :
    ```bash
    npm start
    ```

---

### 2. Configuration du Frontend
L'application Angular utilise des composants Standalone pour une architecture moderne.

1.  Ouvrez un terminal dans le dossier `frontend` :
    ```bash
    cd frontend
    ```
2.  Installez les dépendances :
    ```bash
    npm install
    ```
3.  Lancez l'application :
    ```bash
    npm start
    ```
    *L'application sera disponible sur `http://localhost:4200`.*

---

## 🔐 Comptes de Test

| Rôle | Identifiant | Mot de passe | Droits |
| :--- | :--- | :--- | :--- |
| **Administrateur** | `admin` | `1234` | Gestion complète (Devoirs, Matières, Notes) |
| **Élève** | `user` | `1234` | Soumission et consultation de ses devoirs |

---

## ✨ Nouvelles Fonctionnalités Clés

### 📚 Gestion Dynamique des Matières (Admin)
*   **CRUD complet** : Ajoutez, modifiez ou supprimez des matières directement depuis l'interface.
*   **Personnalisation** : Associez un professeur, une image et une couleur à chaque matière.
*   **Synchronisation** : Les nouvelles matières sont immédiatement disponibles dans le formulaire de création de devoirs.

### 👥 Vue Détaillée par Étudiant
*   Cliquez sur le nom d'un étudiant pour voir l'intégralité de ses devoirs dans une fenêtre modale dédiée.
*   Filtrage automatique pour une consultation rapide des performances individuelles.

### 📝 Formulaire Intelligent (Stepper)
*   Processus de création en **3 étapes fluides**.
*   Sélection visuelle par cartes avec retour d'expérience immédiat.
*   Auto-remplissage des informations professeurs basées sur la matière choisie.

### 📊 Tableau de Bord et Statistiques
*   Statistiques globales en temps réel (Total, Terminés, À faire).
*   Recherche textuelle performante et filtres par statut.
*   Pagination optimisée pour la navigation.

---

## 💻 Stack Technique
*   **Frontend** : Angular 17+, Material Design Icons, RxJS.
*   **Backend** : Node.js, Express, JWT Authentication.
*   **Base de données** : MongoDB Atlas (Cloud).
*   **Hébergement** : Render (API & Frontend).

---
© 2024 - Projet Assignments - Amélioré avec ❤️
