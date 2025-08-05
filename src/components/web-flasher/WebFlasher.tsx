"use client";

import React, { useEffect, useRef } from 'react';

// This component uses the <esp-web-flasher> web component.
// We need to declare its type for TypeScript to recognize it in JSX.
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'esp-web-flasher': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}

export default function WebFlasher() {
  const flasherRef = useRef<HTMLElement>(null);
  
  useEffect(() => {
    // Dynamically import the web component script only on the client side.
    // This prevents Next.js from trying to render it on the server.
    const importFlasher = async () => {
      try {
        await import('esp-web-tools');
        
        // After the script is loaded, set the manifest for the component.
        // This manifest points to the firmware files hosted online.
        if (flasherRef.current) {
            // Since we are setting a property on a DOM element, we need to cast it to `any`
            // to bypass strict TypeScript type checking for custom element properties.
            (flasherRef.current as any).manifest = "/firmware/manifest.json";
        }
      } catch (error) {
        console.error("Failed to load esp-web-tools:", error);
      }
    };
    
    importFlasher();
  }, []);

  return (
    <div>
      <esp-web-flasher ref={flasherRef}></esp-web-flasher>
    </div>
  );
}
