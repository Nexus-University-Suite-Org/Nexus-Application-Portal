/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  /** Public origin of the Nexus Identity provider. */
  readonly VITE_IDENTITY_ISSUER?: string;
  readonly VITE_NAD_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
