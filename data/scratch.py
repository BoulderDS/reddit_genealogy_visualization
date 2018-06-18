import pandas as pd
df = pd.read_csv('ex.csv')
print(len(df))
df_1 = df.drop_duplicates('name')
print(len(df_1))
df_1.columns = ['id','parent']
df.columns = ['id','parent']
df_val = []
for i in df_1.values:
    df_val.append((str(i[0]), str(i[1])))
print(df_val[:10])
df_2 = []
for i in df.values:
    if (str(i[0]), str(i[1])) not in df_val:
        df_2.append([str(i[1]),str(i[0])])
df_2 = pd.DataFrame(df_2,columns=['id','parent'])
df_1.to_csv('tree.csv',index=False)
df_2.to_csv('multinodes.csv',index=False)
print(len(df_2),len(df_1))