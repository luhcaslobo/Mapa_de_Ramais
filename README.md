# Mapa de Ramais 📄

**Funcionalidades:**

* Listagem automática de plantas de andares (PDFs) disponíveis em `src/assets/andares`.
* Seleção de andar via dropdown, com renderização em alta qualidade usando **pdfjs-dist**.
* Extração de palavras e coordenadas de uma layer específica (ARQ-NUM / ARK-NUM) no backend **FastAPI + PyMuPDF**, retornando JSON.
* Posicionamento de pop-overs sobre a planta, mostrando ramais associados a cada coordenada.
* Filtro de ramais por status: **Todos**, **Operando** ou **Fora de serviço**.
* Barra de pesquisa por ramal, com autocomplete; ao selecionar, o PDF é aberto e o pop-over correspondente é destacado.
* Botão **Mostrar todos** para exibir simultaneamente todos os pop-overs.
* Monitoramento em tempo real de ramais DOWN, coletando via Telnet e exibindo em tabela lateral.
* Design responsivo, otimizado para desktop e uso básico em dispositivos móveis.
* Sidebar fixa com filtros, pesquisa, controle de pop-overs e tabela de monitoramento.
