/** @type {import('next').NextConfig} */
const nextConfig = {
  // Aquí puedes dejarlo vacío o con otras opciones, 
  // pero BORRA 'reactCompiler' si te da error.
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Esto permite cargar imágenes de cualquier lado
      },
    ],
  },
};

export default nextConfig;