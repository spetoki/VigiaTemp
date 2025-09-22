# Exemplo de Sistema de Acesso por Chave

Este diretório contém os arquivos essenciais para implementar o sistema de autenticação por chave de acesso em um novo projeto React/Next.js.

### Arquivos

1.  **`auth-context.tsx`**: O coração do sistema. Gerencia o estado de bloqueio, a validação da chave e a chave ativa.
2.  **`lock-screen.tsx`**: O componente de UI para a tela de bloqueio.
3.  **`main-layout.tsx`**: O componente de layout que decide se mostra a tela de bloqueio ou o conteúdo do aplicativo.

### Como Integrar em seu Projeto

1.  **Copie os Arquivos**: Copie os três arquivos deste diretório para a estrutura do seu novo projeto (por exemplo, dentro de `src/components/auth/`).

2.  **Instale as Dependências**: Certifique-se de ter as dependências necessárias instaladas. Os principais pacotes são `react`, `lucide-react`, e os componentes `ui` do ShadCN (Card, Input, Button, Alert, useToast).

3.  **Personalize as Chaves**: Abra `auth-context.tsx` e modifique a lista `ACCESS_KEYS` com as chaves que você deseja permitir no seu aplicativo.

4.  **Envolva sua Aplicação**: No seu `layout.tsx` principal (ou `_app.tsx` em projetos mais antigos), envolva o conteúdo principal com o `AuthProvider` e o `MainLayout`, assim:

    ```tsx
    import { AuthProvider } from './path/to/auth-context';
    import { MainLayout } from './path/to/main-layout';

    export default function RootLayout({ children }: { children: React.ReactNode }) {
      return (
        <html lang="en">
          <body>
            <AuthProvider>
              <MainLayout>
                {children}
              </MainLayout>
            </AuthProvider>
          </body>
        </html>
      );
    }
    ```

5.  **Ajuste os Caminhos de Dados**: Em `auth-context.tsx`, modifique o objeto `storageKeys` para refletir as coleções que você usará no seu banco de dados (ex: `products`, `orders`, etc.), usando o `activeKey` para separar os dados de cada usuário.
