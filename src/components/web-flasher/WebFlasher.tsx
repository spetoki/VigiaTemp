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
        // This line loads the library that defines the <esp-web-flasher> custom element.
        await import('esp-web-tools');
        
        // After the script is loaded, set the manifest property on the component.
        // This manifest points to the firmware files hosted in the /public folder.
        if (flasherRef.current) {
            // Since 'manifest' is a custom property, we cast the element to `any`
            // to bypass strict TypeScript type checking.
            (flasherRef.current as any).manifest = "/firmware/manifest.json";
        }
      } catch (error) {
        console.error("Failed to load esp-web-tools:", error);
      }
    };
    
    importFlasher();
  }, []);

  return (
    // The web component's initial state might not have visible content until the manifest loads.
    // A wrapper div with a minimum height ensures the area is reserved and visible.
    <div className="min-h-[250px]">
      <esp-web-flasher ref={flasherRef}></esp-web-flasher>
    </div>
  );
}
