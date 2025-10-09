# VigiaTemp - Monitoramento Inteligente de Temperatura

O VigiaTemp é uma aplicação web para monitoramento de temperatura em tempo real,
ideal para processos críticos como a fermentação de cacau e controle de estufas.
O sistema oferece uma interface moderna e segura para visualizar dados de
sensores (ESP32/ESP8266) em um painel centralizado.

Funcionalidades incluem gerenciamento completo de sensores, um sistema de alertas
visuais para desvios de temperatura e gráficos históricos para análise de tendências.
A aplicação também conta com um módulo de rastreabilidade de lotes, permitindo
registrar informações de produção e gerar QR Codes para garantir a procedência.
O acesso é protegido, isolando os dados de cada usuário por meio de uma chave única,
e a interface é personalizável com temas e suporte a múltiplos idiomas.

---

### **Arquitetura e Tecnologias**

O aplicativo é construído sobre uma base de tecnologias de ponta, garantindo performance, escalabilidade e uma excelente experiência de desenvolvimento.

*   **Framework Principal:** **Next.js 14.2.8** (com App Router) - Utiliza renderização no servidor (SSR) e componentes de servidor (RSC) para otimizar o carregamento e o desempenho, além de fornecer um sistema de roteamento moderno e eficiente.
*   **Linguagem:** **TypeScript** - Garante a segurança de tipos em todo o projeto, reduzindo bugs e melhorando a manutenibilidade do código.
*   **Hardware Compatível:**
    *   **ESP32:** Placa recomendada, com ótimo poder de processamento e conectividade.
    *   **ESP8266 (NodeMCU, Wemos D1 Mini):** Uma alternativa de baixo custo e amplamente disponível, totalmente compatível com o código fornecido.
*   **Interface e Componentes:**
    *   **React 18.3.1**: Biblioteca principal para a construção da interface de usuário.
    *   **ShadCN UI**: Coleção de componentes de UI reutilizáveis, construídos sobre Radix UI e Tailwind CSS, que garantem uma aparência profissional e acessível.
    *   **Tailwind CSS**: Framework de CSS utility-first para estilização rápida e consistente.
*   **Inteligência Artificial:**
    *   **Genkit 1.13.0**: Framework da Google para o desenvolvimento de funcionalidades com IA generativa. Utilizado para o fluxo de otimização de alarmes, que sugere os melhores limiares de temperatura com base em dados históricos.
    *   **Google AI (Gemini)**: Modelo de linguagem acessado através do Genkit para processar as informações e gerar as recomendações.
*   **Armazenamento de Dados:** **Firebase (Firestore)** - Um banco de dados NoSQL, escalável e em tempo real, usado para persistir todos os dados da aplicação de forma segura e organizada por chave de acesso, garantindo o isolamento dos dados de cada usuário.
*   **Tradução (i18n):** O sistema possui suporte a múltiplos idiomas (Português, Inglês, Espanhol) através de arquivos JSON de tradução, gerenciados por um Contexto do React.
*   **Visualização de Dados:** **Recharts** e **Nivo** - Bibliotecas utilizadas para a criação de gráficos interativos e visualizações de dados, como gráficos de linha, barras, pizza e heatmaps de calendário.

---

### **Principais Funcionalidades**

1.  **Painel de Monitoramento em Tempo Real:**
    *   Visualização centralizada de todos os sensores cadastrados através de cartões informativos.
    *   Cada cartão exibe o nome, localização, temperatura atual e os limites configurados.
    *   O status de cada sensor (Normal, Atenção, Crítico) é destacado visualmente com cores e ícones, e a cor do cartão muda dinamicamente para chamar a atenção.

2.  **Gerenciamento Completo de Sensores:**
    *   Adicione, edite e exclua sensores através de uma interface de tabela intuitiva.
    *   Formulário detalhado para configurar nome, localização, modelo e os limiares de temperatura (mínimo e máximo).
    *   **Descoberta de Dispositivos (Simulada):** Permite adicionar sensores simuladamente através de "buscas" na rede WiFi ou via Web Bluetooth, facilitando a configuração inicial.

3.  **Sistema de Alertas:**
    *   Geração automática de alertas quando a temperatura de um sensor excede os limites definidos.
    *   Página dedicada para visualizar todos os alertas (críticos e de atenção), com a possibilidade de filtrar por status.
    *   Funcionalidade de "Confirmar" (Acknowledge) para marcar alertas como vistos, tanto individualmente quanto em massa.

4.  **Análise Avançada de Dados:**
    *   **Gráficos Históricos:** Página dedicada para comparar a tendência de temperatura de múltiplos sensores ao longo do tempo (hora, dia, semana, mês).
    *   **Análise Visual:** Página com gráficos de pizza sobre a distribuição de status de cada sensor, um gráfico de barras sobre a frequência de alertas e um heatmap de calendário para visualizar a atividade de alertas ao longo do ano.

5.  **Rastreabilidade de Lotes:**
    *   Funcionalidade crucial para o agronegócio, permitindo registrar informações detalhadas de lotes de cacau (ou qualquer outro produto).
    *   Campos para peso, tempo de fermentação/secagem, classificação e nome do produtor.
    *   **Geração de QR Code:** Ao salvar um lote, um QR Code único é gerado contendo todas as informações, pronto para ser impresso e anexado ao lote físico, garantindo a rastreabilidade.

6.  **Otimização de Alarmes com IA (Genkit):**
    *   Uma página dedicada onde o usuário pode fornecer dados históricos, a variedade do cacau e informações do microclima.
    *   A IA do Google (Gemini) analisa os dados e sugere os limiares de temperatura (mínimo e máximo) ideais para otimizar o processo, junto com uma explicação detalhada da recomendação.

7.  **Sistema de Acesso Seguro por Chave:**
    *   Em vez de um sistema complexo de login com email e senha, o aplicativo é protegido por uma tela de bloqueio que exige uma chave de acesso de 4 dígitos.
    *   Cada chave de acesso cria um "espaço de trabalho" isolado no Firestore, garantindo que os dados de um usuário não se misturem com os de outro.
    *   Inclui um sistema de bloqueio progressivo por tempo após múltiplas tentativas de acesso falhas para evitar ataques de força bruta.

8.  **Configurações e Personalização:**
    *   O usuário pode alterar o idioma da interface (PT, EN, ES).
    *   Pode alternar entre os temas Claro (Light) e Escuro (Dark).
    *   Pode escolher a unidade de temperatura preferida (°C ou °F), e toda a aplicação se ajusta automaticamente.

9.  **Guia de Montagem e Código para Hardware:**
    *   **Guia de Montagem:** Uma página com instruções passo a passo e diagramas para montar um protótipo físico do sensor usando um ESP32 e um sensor DS18B20.
    *   **Configurador de Dispositivo:** Uma ferramenta que gera o código C++ para o ESP32, permitindo que o usuário apenas insira a URL da aplicação para que o dispositivo possa enviar dados corretamente.


### Como Colocar o Aplicativo no Ar (Deploy)

A maneira mais fácil e recomendada de hospedar este aplicativo é usando a **Vercel**, a mesma empresa que criou o Next.js. Você não precisa de uma VPS ou de configurações complexas de servidor.

### Passo a Passo para o Deploy na Vercel

1.  **Crie uma Conta:** Acesse [vercel.com](https://vercel.com/) e crie uma conta (você pode usar sua conta do GitHub, GitLab ou Bitbucket para facilitar).

2.  **Envie o Código para o GitHub:** Certifique-se de que todo o código final do projeto esteja em um repositório no GitHub.

3.  **Importe o Projeto na Vercel:**
    *   No seu painel da Vercel, clique em "Add New..." -> "Project".
    *   Selecione o repositório do seu aplicativo.
    *   A Vercel detectará automaticamente que é um projeto Next.js e preencherá as configurações de build. Você não precisa mudar nada.

4.  **Configure as Variáveis de Ambiente (Opcional, para IA e Firebase):**
    *   Se você for usar as funcionalidades de IA ou persistência de dados, precisará configurar variáveis de ambiente.
    *   Vá para "Settings" -> "Environment Variables" no seu projeto Vercel.
    *   Adicione as chaves da sua API do Google AI (`GOOGLE_API_KEY`) e as credenciais do seu projeto Firebase (`NEXT_PUBLIC_FIREBASE_*`).

5.  **Faça o Deploy:** Clique no botão "Deploy". A Vercel irá construir e hospedar seu aplicativo. Em poucos minutos, ele estará no ar!

---
_Aplicativo desenvolvido por Irineu Marcos Bartnik_
