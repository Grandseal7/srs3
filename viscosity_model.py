"""СРС 3. Прогнозирование вязкости лакокрасочного материала.
Данные СИНТЕТИЧЕСКИЕ (модельные): не подтверждают эффективность в реальном производстве."""
import numpy as np, pandas as pd, json
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

rng = np.random.default_rng(42)
N = 400
df = pd.DataFrame({
    "T": rng.uniform(20, 60, N),     # температура, °C
    "n": rng.uniform(300, 1500, N),  # частота вращения, об/мин
    "t": rng.uniform(10, 90, N),     # время смешивания, мин
    "C": rng.uniform(40, 70, N),     # концентрация сухих компонентов, %
})
# «истинная» зависимость: вязкость падает с T и n, растёт с C, снижается по мере диспергирования
df["mu"] = (30 * np.exp(0.075 * df.C) * np.exp(-0.022 * df["T"]) * (df.n / 800) ** -0.25
            * (0.6 + 0.4 * np.exp(-df.t / 35)) + rng.normal(0, 25, N))

print(df.describe().round(2))
print(df.corr().round(2)["mu"])

X, y = df[["T", "n", "t", "C"]], df["mu"]
Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=0.25, random_state=1)
res, pred = {}, {}
for name, m in [("Линейная регрессия", LinearRegression()),
                ("Случайный лес", RandomForestRegressor(200, random_state=1))]:
    m.fit(Xtr, ytr); p = m.predict(Xte); pred[name] = p
    res[name] = dict(MAE=mean_absolute_error(yte, p), RMSE=mean_squared_error(yte, p) ** .5,
                     R2=r2_score(yte, p), MAPE=float(np.mean(np.abs((yte - p) / yte)) * 100))
    print(name, {k: round(v, 3) for k, v in res[name].items()})
rf = m
imp = dict(zip(X.columns, rf.feature_importances_.round(3)))
print("Важность признаков:", imp)
json.dump({"metrics": res, "importance": {k: float(v) for k, v in imp.items()},
           "mu_range": [float(df.mu.min()), float(df.mu.max()), float(df.mu.mean())],
           "pts": [[float(a), float(b), float(c)] for a, b, c in zip(yte[:60], pred["Линейная регрессия"][:60], pred["Случайный лес"][:60])]},
          open("results.json", "w"), ensure_ascii=False)
