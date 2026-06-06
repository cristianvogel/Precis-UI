/// <reference types="vite/client" />
/// <reference types="svelte" />

declare module '*.svelte' {
  const component: any;
  export default component;
}

declare module '*.css';
