from __future__ import annotations

import argparse
from pathlib import Path

import joblib
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, IsolationForest
from sklearn.cluster import DBSCAN


def train_models(csv_path: Path, out_dir: Path) -> None:
    df = pd.read_csv(csv_path)

    # Attendu: colonnes minimales (à adapter avec les données réelles)
    # - zone (catégorie) -> encodée par l'appelant ou one-hot
    # - features_* numériques
    # - label_risque (0/1)
    feature_cols = [c for c in df.columns if c.startswith("feature_")]
    if "label_risque" not in df.columns or not feature_cols:
        raise ValueError("CSV invalide: colonnes attendues: feature_* et label_risque")

    X = df[feature_cols].values
    y = df["label_risque"].values

    rf = RandomForestClassifier(n_estimators=300, random_state=42, class_weight="balanced")
    rf.fit(X, y)

    iso = IsolationForest(random_state=42)
    iso.fit(X)

    dbscan = DBSCAN(eps=0.5, min_samples=5)
    dbscan.fit(X)

    out_dir.mkdir(parents=True, exist_ok=True)
    joblib.dump(rf, out_dir / "rf.joblib")
    joblib.dump(iso, out_dir / "isoforest.joblib")
    joblib.dump(dbscan, out_dir / "dbscan.joblib")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--csv", required=True, type=Path)
    parser.add_argument("--out", required=True, type=Path)
    args = parser.parse_args()
    train_models(args.csv, args.out)


if __name__ == "__main__":
    main()

