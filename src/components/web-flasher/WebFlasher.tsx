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
    const importAndInitializeFlasher = async () => {
      try {
        // 1. Dynamically import the library.
        await import('esp-web-tools');
        
        // 2. Wait for the custom element to be defined in the browser.
        // This is the crucial step to fix the race condition.
        await customElements.whenDefined('esp-web-flasher');
        
        // 3. Now that we are sure the element is ready, we can set its properties.
        if (flasherRef.current) {
            // Since 'manifest' is a custom property, we cast the element to `any`
            // to bypass strict TypeScript type checking for this specific case.
            (flasherRef.current as any).manifest = "/firmware/manifest.json";
        }
      } catch (error) {
        console.error("Failed to load or initialize esp-web-tools:", error);
      }
    };
    
    importAndInitializeFlasher();
  }, []);

  return (
    // The web component's initial state might not have visible content until the manifest loads.
    // A wrapper div with a minimum height ensures the area is reserved and visible.
    // Adding some text to indicate loading state.
    <div className="min-h-[250px]">
      <esp-web-flasher ref={flasherRef}>
        <div slot="activate"></div>
        <div slot="unsupported"></div>
        <div slot="not-allowed"></div>
      </esp-web-flasher>
    </div>
  );
}
