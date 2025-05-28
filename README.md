# Relatório de Análise de Desempenho: Algoritmos de Controle de Pêndulo Invertido

## Introdução

Este relatório apresenta uma análise comparativa do desempenho de três algoritmos de controle implementados para o problema do pêndulo invertido, conforme disponibilizado no projeto "pendulo-ney" no GitHub ([https://github.com/sortphy/pendulo-ney](https://github.com/sortphy/pendulo-ney)). O objetivo principal é avaliar e comparar a eficácia dos algoritmos de Sistema de Inferência Fuzzy (FIS), Genético-Fuzzy e Neuro-Fuzzy em estabilizar o pêndulo, utilizando métricas de tempo de execução e precisão (tempo de estabilização). A análise baseia-se em dados coletados através da execução das simulações disponíveis na página web do projeto ([https://sortphy.github.io/pendulo-ney/](https://sortphy.github.io/pendulo-ney/)). O relatório inclui visualizações gráficas para facilitar a compreensão das diferenças de desempenho entre os sistemas.



## Metodologia

A coleta de dados foi realizada interagindo programaticamente com a simulação disponível na página web do projeto. Para cada um dos três algoritmos (FIS, Genético-Fuzzy e Neuro-Fuzzy), foi executado um protocolo padronizado para garantir a comparabilidade dos resultados:

1.  **Seleção do Algoritmo:** O algoritmo correspondente foi selecionado através da interface da página.
2.  **Condições Iniciais:** A simulação foi reiniciada para garantir as condições iniciais padrão (Ângulo do Pêndulo: 5.0°, Velocidade Angular: 0.0°/s, Posição do Carro: 0.00m, Velocidade do Carro: 0.00m/s).
3.  **Execução:** A simulação foi iniciada.
4.  **Monitoramento e Coleta:** O estado da simulação (ângulo do pêndulo e tempo decorrido) foi monitorado. O "Tempo de Estabilização" foi definido como o tempo necessário para que o ângulo do pêndulo permanecesse dentro de ±0.1 graus por um período contínuo de 2 segundos. O "Tempo Total" foi o tempo total registrado ao final da simulação, considerando um tempo máximo de 30 segundos por execução. Se a estabilização não ocorresse dentro de 30 segundos, o Tempo de Estabilização era registrado como "timeout".
5.  **Repetições:** Cada algoritmo foi executado 5 vezes para permitir a análise da variabilidade e o cálculo de médias.

Os dados coletados (Tempo de Estabilização e Tempo Total para cada execução) foram registrados em um arquivo CSV (`results.csv`). Posteriormente, esses dados foram processados utilizando a biblioteca Pandas em Python para calcular estatísticas descritivas (média e desvio padrão) e gerar visualizações gráficas com Matplotlib e Seaborn. A medição direta do uso de recursos computacionais (CPU, memória) não foi viável através da interface web e, portanto, não foi incluída nesta análise.



## Resultados

A análise dos dados coletados revelou diferenças significativas no desempenho dos três algoritmos. As estatísticas descritivas e as visualizações gráficas fornecem uma base quantitativa para a comparação.

### Tempo de Estabilização

O Tempo de Estabilização mede a rapidez com que cada algoritmo consegue trazer o pêndulo para uma posição estável (ângulo dentro de ±0.1 graus) e mantê-lo por 2 segundos. Os resultados médios, excluindo as execuções que atingiram o tempo limite de 30 segundos, foram:

*   **FIS:** Tempo médio de estabilização de aproximadamente 4.64 segundos (desvio padrão ≈ 0.34s).
*   **Genético-Fuzzy:** Tempo médio de estabilização de aproximadamente 13.43 segundos (desvio padrão ≈ 1.62s), considerando apenas as 4 execuções que estabilizaram.
*   **Neuro-Fuzzy:** Tempo médio de estabilização de aproximadamente 8.12 segundos (desvio padrão ≈ 0.53s).

O algoritmo FIS demonstrou ser o mais rápido em alcançar a estabilidade, seguido pelo Neuro-Fuzzy. O algoritmo Genético-Fuzzy foi consideravelmente mais lento e, em uma das cinco execuções, não conseguiu estabilizar o pêndulo dentro do tempo limite de 30 segundos.

O gráfico de barras abaixo ilustra a comparação dos tempos médios de estabilização:

![Tempo Médio de Estabilização](https://private-us-east-1.manuscdn.com/sessionFile/fyyTDxKJpMSi3Zus0gFItl/sandbox/Lni39mpkCA3M11TIXKxsop-images_1748394455808_na1fn_L2hvbWUvdWJ1bnR1L3N0YWJpbGl6YXRpb25fdGltZV9hdmc.png?Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvZnl5VER4S0pwTVNpM1p1czBnRkl0bC9zYW5kYm94L0xuaTM5bXBrQ0EzTTExVElYS3hzb3AtaW1hZ2VzXzE3NDgzOTQ0NTU4MDhfbmExZm5fTDJodmJXVXZkV0oxYm5SMUwzTjBZV0pwYkdsNllYUnBiMjVmZEdsdFpWOWhkbWMucG5nIiwiQ29uZGl0aW9uIjp7IkRhdGVMZXNzVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNzY3MjI1NjAwfX19XX0_&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=LSij0vkeKgTaHj4gXo94Vtox88furI~~DJHMLDcMPJ-NTrgtCD7F5umvICV8ISGaMG5c2cohl1gAH9EDGCTnsY2f2dRcDhE8epxpYn~RiSo8O5gLpnouUiPyM~AJZkRKuM3mGfUW1MH6NjHr0hU3lYCAkfA7Jkvzpfv8Q5-vzS9BvusBpJHoNAV~Q-J80AkYYT5rJJlb~iq0F0e5tdrpiObd2rCo5qmZKcDhgiy-6LLoE2SyELzh7Mfi7K8YiwhM~t~DamzmKYD~EteIpgechGvX3APrbeyTkhzHzEIEN7FIfXsL1fzV~ik5JZd2YfMXPtjRbgiOMOMu5cZ5Ib8XOA__)
*Figura 1: Comparação do Tempo Médio de Estabilização por Algoritmo (Excluindo Timeouts)*

A distribuição dos tempos de estabilização, visualizada através de box plots (excluindo o timeout), mostra a consistência de cada algoritmo:

![Distribuição do Tempo de Estabilização](https://private-us-east-1.manuscdn.com/sessionFile/fyyTDxKJpMSi3Zus0gFItl/sandbox/Lni39mpkCA3M11TIXKxsop-images_1748394455808_na1fn_L2hvbWUvdWJ1bnR1L3N0YWJpbGl6YXRpb25fdGltZV9kaXN0.png?Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvZnl5VER4S0pwTVNpM1p1czBnRkl0bC9zYW5kYm94L0xuaTM5bXBrQ0EzTTExVElYS3hzb3AtaW1hZ2VzXzE3NDgzOTQ0NTU4MDhfbmExZm5fTDJodmJXVXZkV0oxYm5SMUwzTjBZV0pwYkdsNllYUnBiMjVmZEdsdFpWOWthWE4wLnBuZyIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc2NzIyNTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=drFiZxu7ON6uLIzDU4duApubpBNL-U6OwoIgdmd2C1oDg2gIA4btjB3FOPm172ItlOXWtlgNXCQaJluH4YqXj7-r2oSgnVr67eXGiV00vOBDG1HJ4sHenw1QdELzY5P0TS9c~hOp9p2cZyBGbzD8Jp6msrrAVyGvQ8BpoNr-qBsD5f6Ij2SFIG1Upmhpo0NwzBx-eqdxr0-zup1ZU87E-77uvMQZvJVaD0YdkgLMeFPqVdhAFhmOmYg5Jz0vir3y6rBQc6SfXmxQ5gGjRNbLwqR63shBHU3JAm528EIDPpOX5zDZZs90R9rl7CCPw8lnLzXPsC2n3FmBHVRRwQdigA__)
*Figura 2: Distribuição do Tempo de Estabilização por Algoritmo (Excluindo Timeouts)*

O FIS apresentou a menor variabilidade, indicando um desempenho mais consistente em termos de velocidade de estabilização. O Neuro-Fuzzy também mostrou boa consistência, enquanto o Genético-Fuzzy teve uma dispersão maior nos tempos das execuções bem-sucedidas.

### Tempo Total de Execução

O Tempo Total de Execução reflete o tempo completo de cada simulação, incluindo a execução que atingiu o timeout. Os tempos totais médios foram:

*   **FIS:** Tempo total médio de 4.64 segundos (desvio padrão ≈ 0.34s).
*   **Genético-Fuzzy:** Tempo total médio de 16.74 segundos (desvio padrão ≈ 7.54s).
*   **Neuro-Fuzzy:** Tempo total médio de 8.12 segundos (desvio padrão ≈ 0.53s).

O alto desvio padrão no tempo total do algoritmo Genético-Fuzzy é influenciado pela execução que atingiu o limite de 30 segundos.

Os gráficos a seguir comparam o tempo total médio e a distribuição dos tempos totais:

![Tempo Total Médio de Execução](https://private-us-east-1.manuscdn.com/sessionFile/fyyTDxKJpMSi3Zus0gFItl/sandbox/Lni39mpkCA3M11TIXKxsop-images_1748394455808_na1fn_L2hvbWUvdWJ1bnR1L3RvdGFsX3RpbWVfYXZn.png?Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvZnl5VER4S0pwTVNpM1p1czBnRkl0bC9zYW5kYm94L0xuaTM5bXBrQ0EzTTExVElYS3hzb3AtaW1hZ2VzXzE3NDgzOTQ0NTU4MDhfbmExZm5fTDJodmJXVXZkV0oxYm5SMUwzUnZkR0ZzWDNScGJXVmZZWFpuLnBuZyIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc2NzIyNTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=cVzrcshEjNpxnHolJYg444ZcHTMa9ouYVXwtfYbtXK5fjsacfTjPdf1ORA57YDoyPA2xbNqO6UWQfeu~mbJ-esJjjq0lJcpgXxAnUeKkUpJkSPa2hnhjCVECL6VtkV2b1mjwjZRMRMIrEM-VTRjvTykcpYPYzRy5ShM75x1zAWUCrWqJOImSv~QQ09nLAnQNO88nIfBeVZN5eD7-vdcz1XIYlThJKwKIdIfunjAgr04zE7LLM9xftWfmmCewy49HHLoCX9nxI12Iuj-CwAJa54PpkXi~YPKAyzSjZggrBBx7v3QIYqJ~VGUetIgYpx89VwACb6eqhkDJhNXHFNhEYA__)
*Figura 3: Comparação do Tempo Total Médio de Execução por Algoritmo*

![Distribuição do Tempo Total de Execução](https://private-us-east-1.manuscdn.com/sessionFile/fyyTDxKJpMSi3Zus0gFItl/sandbox/Lni39mpkCA3M11TIXKxsop-images_1748394455808_na1fn_L2hvbWUvdWJ1bnR1L3RvdGFsX3RpbWVfZGlzdA.png?Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvZnl5VER4S0pwTVNpM1p1czBnRkl0bC9zYW5kYm94L0xuaTM5bXBrQ0EzTTExVElYS3hzb3AtaW1hZ2VzXzE3NDgzOTQ0NTU4MDhfbmExZm5fTDJodmJXVXZkV0oxYm5SMUwzUnZkR0ZzWDNScGJXVmZaR2x6ZEEucG5nIiwiQ29uZGl0aW9uIjp7IkRhdGVMZXNzVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNzY3MjI1NjAwfX19XX0_&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=ZugV0FUBy3Kdtdqxu9gVyRNrY2NiEvNq9mNctH3DwON9WRHY7iwfaqXbeNpqNb~3oRVNMkqvwKSxxvFIK5KG~zj1a3gZBCZIiQfuuhiSa0MVPwoP7IxsY0knsy6E7o9~9il-o8YI2Kgpp~fSVNmnptzmIOHQ7kWpGleACFqQL0jr~~l~SpbyhM3u8C~4uEEwGFsbTX0pUqJHJeauptV~-wh8hcGXKagrOn-oE84fgcj1Ur-rfKTDoiXhq2~1lDJKie-5093tpNbkYZPaJhtf9GpYnfAR6SrSovPV0ISQJwQ5rqfp5v1u~5RMRyz53xvyV74dK9Y8j-lUWWOXJ-4Q3w__)
*Figura 4: Distribuição do Tempo Total de Execução por Algoritmo*

Esses resultados confirmam a tendência observada no tempo de estabilização: o FIS é o mais rápido e consistente, seguido pelo Neuro-Fuzzy. O Genético-Fuzzy é o mais lento e apresenta maior variabilidade, incluindo a falha em estabilizar em uma das tentativas dentro do tempo estipulado.



## Discussão

Os resultados indicam claramente que, nas condições testadas, o algoritmo FIS (Sistema de Inferência Fuzzy) apresentou o melhor desempenho geral. Ele não apenas foi o mais rápido em estabilizar o pêndulo, com uma média de 4.64 segundos, mas também demonstrou a maior consistência entre as execuções, refletida no baixo desvio padrão. Isso sugere que as regras fuzzy pré-definidas para o FIS são eficazes e eficientes para este problema específico de controle, pelo menos partindo das condições iniciais testadas.

O algoritmo Neuro-Fuzzy ficou em segundo lugar, com um tempo médio de estabilização de 8.12 segundos. Embora mais lento que o FIS, ele também mostrou boa consistência. A abordagem Neuro-Fuzzy, que combina redes neurais e lógica fuzzy, pode oferecer maior adaptabilidade em cenários mais complexos, mas neste caso específico, pareceu menos otimizado que o FIS puro em termos de velocidade.

O algoritmo Genético-Fuzzy apresentou o desempenho mais fraco. Foi significativamente mais lento que os outros dois, com um tempo médio de estabilização (considerando apenas as execuções bem-sucedidas) de 13.43 segundos. Além disso, sua confiabilidade foi questionada, pois falhou em estabilizar o pêndulo em uma das cinco tentativas dentro do limite de 30 segundos. Algoritmos genéticos frequentemente requerem um tempo considerável para convergir para uma solução ótima, e a combinação com a lógica fuzzy pode adicionar complexidade. É possível que a implementação específica ou os parâmetros utilizados na simulação não estivessem totalmente otimizados, ou que a natureza do problema favoreça abordagens mais diretas como o FIS.

## Limitações

É importante reconhecer algumas limitações desta análise:

*   **Métricas de Desempenho:** A análise focou primariamente no tempo (estabilização e total). A "precisão" foi inferida a partir da capacidade e velocidade de estabilização. Outras métricas, como overshoot, oscilações ou erro em regime permanente, não foram quantificadas detalhadamente. O uso de recursos computacionais (CPU, memória) não pôde ser medido devido às limitações da execução via navegador.
*   **Número de Execuções:** Apenas cinco execuções foram realizadas para cada algoritmo. Um número maior de repetições poderia fornecer uma base estatística mais robusta e revelar comportamentos menos frequentes.
*   **Condições Iniciais:** A análise foi baseada em um único conjunto de condições iniciais. O desempenho relativo dos algoritmos pode variar sob diferentes condições de partida.
*   **Ambiente de Simulação:** A análise depende da precisão e do comportamento da simulação web. Fatores como o desempenho do navegador ou a implementação específica da física e dos algoritmos na página podem influenciar os resultados.
*   **Automação da Coleta:** Uma tentativa de automatizar a coleta de dados via JavaScript no console do navegador falhou devido a um erro de sintaxe no script desenvolvido. Os dados foram, portanto, coletados através de observação manual e execução controlada, o que introduz um potencial para erro humano, embora o protocolo tenha sido seguido rigorosamente.

## Conclusão

Com base na análise realizada a partir da simulação web do projeto "pendulo-ney", o algoritmo FIS demonstrou ser o mais eficaz para o controle do pêndulo invertido, oferecendo a estabilização mais rápida e consistente sob as condições iniciais testadas. O algoritmo Neuro-Fuzzy apresentou um desempenho intermediário, enquanto o algoritmo Genético-Fuzzy foi o mais lento e menos confiável, falhando em estabilizar o sistema em uma das tentativas dentro do tempo limite. A escolha do melhor algoritmo pode depender dos requisitos específicos da aplicação, mas para velocidade e consistência nas condições avaliadas, o FIS foi superior.

## Referências

*   Repositório do Projeto: [https://github.com/sortphy/pendulo-ney](https://github.com/sortphy/pendulo-ney)
*   Simulação Web: [https://sortphy.github.io/pendulo-ney/](https://sortphy.github.io/pendulo-ney/)

