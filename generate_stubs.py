import os

# Dossier racine des classes (à adapter selon ton repo)
BASE = "Classes"

CLASSES = {
    "Barbare": [
        "Voie de l’Arbre-Monde",
        "Voie du Berserker",
        "Voie du Cœur sauvage",
        "Voie du Zélateur"
    ],
    "Barde": [
        "Collège de la Danse",
        "Collège du Savoir",
        "Collège de la Séduction",
        "Collège de la Vaillance"
    ],
    "Clerc": [
        "Domaine de la Guerre",
        "Domaine de la Lumière",
        "Domaine de la Ruse",
        "Domaine de la Vie"
    ],
    "Druide": [
        "Cercle des Astres",
        "Cercle de la Lune",
        "Cercle des Mers",
        "Cercle de la Terre"
    ],
    "Ensorceleur": [
        "Sorcellerie aberrante",
        "Sorcellerie draconique",
        "Sorcellerie mécanique",
        "Sorcellerie sauvage"
    ],
    "Guerrier": [
        "Champion",
        "Chevalier occultiste",
        "Maître de guerre",
        "Soldat psi"
    ],
    "Magicien": [
        "Abjurateur",
        "Devin",
        "Évocation",
        "Illusionniste"
    ],
    "Moine": [
        "Crédo des Éléments",
        "Crédo de la Miséricorde",
        "Crédo de l’Ombre",
        "Crédo de la Paume"
    ],
    "Occultiste": [
        "Protecteur Archifée",
        "Protecteur Céleste",
        "Protecteur Félon",
        "Protecteur Grand Ancien"
    ],
    "Paladin": [
        "Serment de Gloire",
        "Serment des Anciens",
        "Serment de Dévotion",
        "Serment de Vengeance"
    ],
    "Rôdeur": [
        "Belluaire",
        "Chasseur",
        "Traqueur des ténèbres",
        "Vagabond féérique"
    ],
    "Roublard": [
        "Âme acérée",
        "Arnaqueur arcanique",
        "Assassin",
        "Voleur"
    ],
}

def safe_name(name):
    # Nom de fichier/dossier compatible (sans caractères spéciaux)
    return name.replace("’", "'").replace("é", "e").replace("è", "e").replace("ê", "e").replace("à", "a").replace("ô", "o") \
        .replace("ç", "c").replace("œ", "oe").replace("É", "E").replace(" ", "_").replace("-", "_").replace("î", "i").replace("â", "a")

def make_stub(path, title):
    if not os.path.exists(path):
        with open(path, "w", encoding="utf-8") as f:
            f.write(f"# {title}\n\n*Ce contenu est à compléter.*\n")

def main():
    for cls, subs in CLASSES.items():
        cls_dir = os.path.join(BASE, safe_name(cls))
        os.makedirs(cls_dir, exist_ok=True)
        # Fichier principal de classe
        make_stub(os.path.join(cls_dir, f"{safe_name(cls)}.md"), cls)
        # Sous-classes
        sub_dir = os.path.join(cls_dir, "Sous-classes")
        os.makedirs(sub_dir, exist_ok=True)
        for sub in subs:
            fname = f"Sous-classe - {safe_name(sub)}.md"
            make_stub(os.path.join(sub_dir, fname), sub)

if __name__ == "__main__":
    main()
