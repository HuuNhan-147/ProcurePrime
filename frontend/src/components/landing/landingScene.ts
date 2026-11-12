import { preload } from "react-dom";
import small from "../../assets/landing/prime-device-studio-480.webp";
import medium from "../../assets/landing/prime-device-studio-960.webp";
import large from "../../assets/landing/prime-device-studio-1600.webp";

export const landingScene = {
  src: medium,
  srcSet: `${small} 480w, ${medium} 960w, ${large} 1600w`,
  sizes: "(min-width: 1440px) 600px, (min-width: 1024px) 46vw, (min-width: 768px) 90vw, calc(100vw - 40px)",
};
export function preloadLandingScene() {
  preload(landingScene.src, { as: "image", type: "image/webp", fetchPriority: "high", imageSrcSet: landingScene.srcSet, imageSizes: landingScene.sizes });
}
