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

---

## 1. Configurando as Chaves do Firebase (Passo Obrigatório)

Para que o login, o cadastro e o gerenciamento de usuários funcionem, o aplicativo precisa se conectar ao Firebase. Para isso, você deve fornecer suas chaves de API.

### Passo 1: Encontre suas Chaves no Firebase

1.  Acesse o **[Console do Firebase](https://console.firebase.google.com/)**.
2.  Crie um novo projeto ou selecione um projeto existente.
3.  No painel do projeto, clique no ícone de engrenagem (⚙️) e vá para **"Configurações do projeto"**.
4.  Na aba "Geral", role para baixo até a seção **"Seus apps"**.
5.  Se não tiver um aplicativo da Web, clique no ícone **`</>`** para criar um.
6.  O Firebase exibirá um objeto `firebaseConfig`. São esses valores que você usará.

    ```javascript
    // Exemplo do que você verá no Firebase
    const firebaseConfig = {
      apiKey: "AIzaSy...SUA_CHAVE...", // <- Este valor
      authDomain: "seu-projeto.firebaseapp.com", // <- Este valor
      projectId: "seu-projeto", // <- Este valor
      storageBucket: "seu-projeto.appspot.com", // <- Este valor
      messagingSenderId: "1234567890", // <- Este valor
      appId: "1:1234567890:web:abcdef123456" // <- Este valor
    };
    ```

### Passo 2: Adicione as Chaves ao seu Projeto na Vercel

Agora, você precisa inserir esses valores no painel do seu projeto na Vercel.

1.  No painel do seu projeto na **Vercel**, vá para a aba **"Settings"** -> **"Environment Variables"**.
2.  Use a tabela abaixo para saber exatamente qual nome de variável usar no "slot" **Name** e qual valor colar no "slot" **Value**.

| Nome da Variável no Vercel (Copie daqui e cole no campo "Name") | Valor (Copie o valor correspondente do seu `firebaseConfig` e cole no campo "Value") |
| --- | --- |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | O valor da sua `apiKey` |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | O valor do seu `authDomain` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | O valor do seu `projectId` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | O valor do seu `storageBucket` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | O valor do seu `messagingSenderId` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | O valor do seu `appId` |

3.  Salve cada variável. Após configurar, faça um **Redeploy** para que as alterações tenham efeito.

---

## 2. Como Colocar o Aplicativo no Ar (Deploy)

A maneira mais recomendada e fácil de hospedar este aplicativo é usando a **Vercel**.

### Passo a Passo para o Deploy na Vercel

1.  **Crie uma Conta:** Acesse [vercel.com](https://vercel.com/) e crie uma conta (você pode usar sua conta do GitHub, GitLab ou Bitbucket para facilitar).

2.  **Envie o Código para o GitHub:** Certifique-se de que todo o código final do projeto esteja em um repositório no GitHub.

3.  **Importe o Projeto na Vercel:**
    *   No seu painel da Vercel, clique em "Add New..." -> "Project".
    *   Selecione o repositório do seu aplicativo.
    *   A Vercel detectará automaticamente que é um projeto Next.js e preencherá as configurações de build.

4.  **Configure as Variáveis de Ambiente:** Siga as instruções da **Seção 1** acima para adicionar suas chaves do Firebase nas configurações do projeto na Vercel.

5.  **Faça o Deploy:** Clique no botão "Deploy". A Vercel irá construir e hospedar seu aplicativo. Em poucos minutos, ele estará no ar!
