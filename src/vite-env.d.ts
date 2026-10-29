/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
<<<<<<< HEAD
  /** Public origin of the Nexus Identity provider. */
  readonly VITE_IDENTITY_ISSUER?: string;
=======
  readonly VITE_NAD_API_BASE_URL?: string;
>>>>>>> 2c9811f3bd3db583d5fc06dc3c41fc3d91caa31e
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
