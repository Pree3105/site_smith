import { useEffect, useState } from "react";
import { WebContainer } from '@webcontainer/api';

let webcontainerInstance = null; // Single instance for the entire application
let isBooting = false;

export function useWebContainer() {
  const [webcontainer, setWebcontainer] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const initWebContainer = async () => {
      if (isBooting || webcontainerInstance)  return;
      try {
        isBooting = true;
        console.log("Attempting to boot WebContainer...");

        webcontainerInstance = await WebContainer.boot();
        console.log("WebContainer booted successfully");
        
        if (isMounted) {
          setWebcontainer(webcontainerInstance);
          setIsReady(true);
          console.log("WebContainer state updated");
        }
      } catch (error) {
        console.error("WebContainer initialization error:", error);
        if (isMounted) {
          setError(error.message);
        }
        webcontainerInstance = null;
      }finally {
        isBooting = false;
      }
    };

    if (!webcontainerInstance && !isBooting) {
      //Adding a small delay to ensure DOM is fully loaded
      initWebContainer();
    } else if (webcontainerInstance && isMounted) {
      setWebcontainer(webcontainerInstance);
      setIsReady(true);
    }

    return () => {
      isMounted = false;
    };
  }, []);

  return {webcontainer, isReady,error};
}