import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np

# Load the data
df = pd.read_csv('/home/ubuntu/results.csv')

# Convert times to numeric, coercing errors (like 'timeout') to NaN
df['StabilizationTime_numeric'] = pd.to_numeric(df['StabilizationTime'], errors='coerce')
df['TotalTime'] = pd.to_numeric(df['TotalTime'], errors='coerce') # Assuming TotalTime is always numeric

# Calculate summary statistics (excluding NaNs for stabilization time)
summary_stats_stab = df.groupby('Algorithm')['StabilizationTime_numeric'].agg(['mean', 'std']).reset_index()
summary_stats_total = df.groupby('Algorithm')['TotalTime'].agg(['mean', 'std']).reset_index()

# --- Generate Plots ---
sns.set_theme(style="whitegrid")

# 1. Bar Chart: Average Stabilization Time
plt.figure(figsize=(8, 6))
sns.barplot(x='Algorithm', y='mean', data=summary_stats_stab, palette='viridis', hue='Algorithm', dodge=False, legend=False)
plt.title('Tempo Médio de Estabilização por Algoritmo (Excluindo Timeouts)')
plt.ylabel('Tempo Médio (s)')
plt.xlabel('Algoritmo')
plt.tight_layout()
plt.savefig('/home/ubuntu/stabilization_time_avg.png')
plt.close()

# 2. Bar Chart: Average Total Time
plt.figure(figsize=(8, 6))
sns.barplot(x='Algorithm', y='mean', data=summary_stats_total, palette='viridis', hue='Algorithm', dodge=False, legend=False)
plt.title('Tempo Total Médio de Execução por Algoritmo')
plt.ylabel('Tempo Médio (s)')
plt.xlabel('Algoritmo')
plt.tight_layout()
plt.savefig('/home/ubuntu/total_time_avg.png')
plt.close()

# 3. Box Plot: Distribution of Stabilization Times (excluding NaNs)
plt.figure(figsize=(8, 6))
sns.boxplot(x='Algorithm', y='StabilizationTime_numeric', data=df.dropna(subset=['StabilizationTime_numeric']), palette='viridis', hue='Algorithm', dodge=False, legend=False)
plt.title('Distribuição do Tempo de Estabilização por Algoritmo (Excluindo Timeouts)')
plt.ylabel('Tempo de Estabilização (s)')
plt.xlabel('Algoritmo')
plt.tight_layout()
plt.savefig('/home/ubuntu/stabilization_time_dist.png')
plt.close()

# 4. Box Plot: Distribution of Total Times
plt.figure(figsize=(8, 6))
sns.boxplot(x='Algorithm', y='TotalTime', data=df, palette='viridis', hue='Algorithm', dodge=False, legend=False)
plt.title('Distribuição do Tempo Total de Execução por Algoritmo')
plt.ylabel('Tempo Total (s)')
plt.xlabel('Algoritmo')
plt.tight_layout()
plt.savefig('/home/ubuntu/total_time_dist.png')
plt.close()

print("Graphs generated and saved:")
print("- /home/ubuntu/stabilization_time_avg.png")
print("- /home/ubuntu/total_time_avg.png")
print("- /home/ubuntu/stabilization_time_dist.png")
print("- /home/ubuntu/total_time_dist.png")

# Also save the summary stats for the report
summary_stats_stab.to_csv('/home/ubuntu/summary_stabilization.csv', index=False)
summary_stats_total.to_csv('/home/ubuntu/summary_total.csv', index=False)
print("Summary statistics saved:")
print("- /home/ubuntu/summary_stabilization.csv")
print("- /home/ubuntu/summary_total.csv")

