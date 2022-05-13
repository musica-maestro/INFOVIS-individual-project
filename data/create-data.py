import json
import numpy as np
import pandas as pd

n = 10
df = pd.DataFrame(dict(
    x=np.random.randint(0, 150, size=n),
    y=np.random.randint(0, 150, size=n),
    base=np.random.randint(10, 30, size=n),
    height=np.random.randint(10, 30, size=n),
    color=np.random.randint(0, 100, size=n)
))

print(df.to_json('triangles.json', orient='records', lines=False))