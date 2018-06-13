import pandas as pd

df = pd.read_csv('d3-reddit.csv')
print(df.parent.value_counts().values[:100])
print(df.parent.value_counts().index[:100])