/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // local embedding model + ONNX runtime must not be bundled by webpack
    serverComponentsExternalPackages: ['@xenova/transformers', 'onnxruntime-node', 'sharp'],
  },
};
export default nextConfig;
