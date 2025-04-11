declare module 'leaflet-fullscreen' {
  // Exportación por defecto
  const _default: any;
  export default _default;

  // Extend Leaflet namespace
  global {
    namespace L {
      namespace control {
        function fullscreen(options?: FullscreenOptions): Control.Fullscreen;
      }
      
      namespace Control {
        class Fullscreen extends Control {
          constructor(options?: FullscreenOptions);
        }
      }

      interface FullscreenOptions {
        position?: string;
        title?: {
          'false': string;
          'true': string;
        };
      }
    }
  }
}