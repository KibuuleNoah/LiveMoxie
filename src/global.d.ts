export { };

declare global {
  interface Window {
    __RUNTIME_CONFIG__?: {
      VIDEOSDK_AUTH_TOKEN?: string;
      [key: string]: string | undefined;
    };
  }
}
