# VigiaTemp - Monitoramento de Temperatura

Este é um aplicativo de monitoramento de temperatura em tempo real construído com Next.js, TypeScript e ShadCN UI.

## Funcionalidades

*   Painel de Sensores em Tempo Real
*   Gráficos Históricos de Temperatura
*   Gerenciamento de Sensores (Adicionar, Editar, Excluir)
*   Sistema de Alertas (Crítico e Atenção)
*   Descoberta de Sensores via WiFi e Bluetooth (Simulado)
*   Otimização de Alarmes com IA (Genkit)
*   Sistema de Autenticação e Gerenciamento de Usuários
*   Suporte a Múltiplos Idiomas (i18n)

## Como Colocar o Aplicativo no Ar (Deploy)

A maneira mais recomendada e fácil de hospedar este aplicativo é usando a **Vercel**, a mesma empresa que criou o Next.js. Você não precisa de uma VPS ou de configurações complexas de servidor.

### Opções de Hospedagem e Domínio

*   **Hospedagem (Onde o app fica):** A Vercel oferece um **plano gratuito** que é perfeito para este projeto. Ele é robusto e não tem custo para projetos pessoais.
*   **Domínio (O endereço do seu site):**
    *   **Gratuito:** A Vercel fornecerá um domínio automático (ex: `vigiatemp.vercel.app`).
    *   **Customizado (Pago):** Você pode comprar seu próprio domínio (ex: `www.meusensor.com`) em serviços como GoDaddy, Registro.br, etc., e conectá-lo facilmente ao seu projeto na Vercel.

### Passo a Passo para o Deploy na Vercel

1.  **Crie uma Conta:** Acesse [vercel.com](https://vercel.com/) e crie uma conta (você pode usar sua conta do GitHub, GitLab ou Bitbucket para facilitar).

2.  **Envie o Código para o GitHub:** Certifique-se de que todo o código final do projeto esteja em um repositório no GitHub.

3.  **Importe o Projeto na Vercel:**
    *   No seu painel da Vercel, clique em "Add New..." -> "Project".
    *   Selecione o repositório do seu aplicativo.
    *   A Vercel detectará automaticamente que é um projeto Next.js e preencherá as configurações de build. Você não precisa mudar nada.

4.  **Configure as Variáveis de Ambiente (Opcional, se usar Firebase):**
    *   Se você decidiu conectar o app a um projeto Firebase, vá para a aba "Settings" -> "Environment Variables" no seu projeto Vercel.
    *   Adicione as chaves do seu `firebaseConfig` (como `NEXT_PUBLIC_FIREBASE_API_KEY`, etc.) conforme o arquivo `.env` de exemplo.

5.  **Faça o Deploy:** Clique no botão "Deploy". A Vercel irá construir e hospedar seu aplicativo. Em poucos minutos, ele estará no ar com um link `.vercel.app`!
