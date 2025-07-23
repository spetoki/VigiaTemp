# VigiaTemp - Monitoramento de Temperatura

Este é um aplicativo de monitoramento de temperatura em tempo real construído com Next.js, TypeScript e ShadCN UI. A aplicação é projetada para ser simples, eficiente e focada nas funcionalidades essenciais de monitoramento.

## Funcionalidades Principais

*   **Painel de Sensores em Tempo Real:** Visualize todos os seus sensores e seus status (Normal, Atenção, Crítico) em uma única tela.
*   **Gráficos Históricos:** Analise a tendência de temperatura de um ou mais sensores ao longo do tempo.
*   **Gerenciamento de Sensores:** Adicione, edite e exclua sensores facilmente.
*   **Sistema de Alertas:** Receba alertas visuais e sonoros quando a temperatura atinge níveis críticos.
*   **Descoberta de Dispositivos:** Adicione sensores simuladamente via WiFi ou diretamente via Web Bluetooth.
*   **Otimização de Alarmes com IA:** Use Genkit para receber sugestões de limites de temperatura ideais com base em dados históricos.
*   **Acesso Seguro por Chave:** O aplicativo é protegido por um sistema de chaves de acesso de 4 dígitos, sem a complexidade de logins e senhas.
*   **Suporte a Múltiplos Idiomas:** Interface disponível em Português, Inglês e Espanhol.

## Como Colocar o Aplicativo no Ar (Deploy)

A maneira mais fácil e recomendada de hospedar este aplicativo é usando a **Vercel**, a mesma empresa que criou o Next.js. Você não precisa de uma VPS ou de configurações complexas de servidor.

### Passo a Passo para o Deploy na Vercel

1.  **Crie uma Conta:** Acesse [vercel.com](https://vercel.com/) e crie uma conta (você pode usar sua conta do GitHub, GitLab ou Bitbucket para facilitar).

2.  **Envie o Código para o GitHub:** Certifique-se de que todo o código final do projeto esteja em um repositório no GitHub.

3.  **Importe o Projeto na Vercel:**
    *   No seu painel da Vercel, clique em "Add New..." -> "Project".
    *   Selecione o repositório do seu aplicativo.
    *   A Vercel detectará automaticamente que é um projeto Next.js e preencherá as configurações de build. Você não precisa mudar nada.

4.  **Configure as Variáveis de Ambiente (Opcional, para IA):**
    *   Se você for usar as funcionalidades de IA (Otimização de Alarmes), precisará de uma chave da API do Google AI.
    *   Vá para "Settings" -> "Environment Variables" no seu projeto Vercel.
    *   Adicione uma nova variável chamada `GOOGLE_API_KEY` com a sua chave.

5.  **Faça o Deploy:** Clique no botão "Deploy". A Vercel irá construir e hospedar seu aplicativo. Em poucos minutos, ele estará no ar!

## Como Usar o Aplicativo

*   **Acesso:** Na tela inicial, insira uma das chaves de acesso de 4 dígitos. As chaves de teste estão no arquivo `chaves-de-desbloqueio.txt`.
*   **Navegação:** Use o menu lateral para navegar entre as diferentes seções do aplicativo.
*   **Adicionar Sensores:** Vá para a página "Sensores" e use o botão "Adicionar Sensor" para configurar novos dispositivos. Você pode adicionar manualmente ou usar as opções de descoberta.
