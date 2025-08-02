/** @type {import('next').NextConfig} */
const nextConfig = {
  // A biblioteca lucide-react (usada para ícones) pode causar erros de renderização
  // em algumas configurações do Next.js. Adicionar 'lucide-react' a
  // transpilePackages força o Next.js a processar a biblioteca de uma maneira mais
  // compatível, garantindo que os componentes de ícone sejam importados corretamente
  // e não cheguem como 'undefined' no momento da renderização.
  // Isso resolve o erro "Element type is invalid" que ocorria no menu de navegação.
  transpilePackages: ['lucide-react'],
};

export default nextConfig;
