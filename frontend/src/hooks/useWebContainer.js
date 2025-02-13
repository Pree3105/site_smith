// import { useEffect, useState } from "react";
// import { WebContainer } from '@webcontainer/api';

// export function useWebContainer(){
//     //basically created a hook called useWebContainer, creating an instance of it by booting it 
//     const [webcontainer, setWebcontainer]=useState(null)

//     useEffect(() => {
//     let isMounted = true; //  Prevents race conditions

//     const initializeWebContainer = async () => {
//         try {
//           if (!webcontainerInstance) {
//             webcontainerInstance = await WebContainer.boot();
//           }
//           if (isMounted) {
//             setWebcontainer(webcontainerInstance);
//           }
//         } catch (error) {
//           console.error("WebContainer initialization failed:", error);
//         }
//       };
  
//       if (!webcontainer) {
//         initializeWebContainer();
//       }

//         return () => { isMounted = false; }; // Cleanup on unmount
//     }, []); // Runs only once on mount

//     return webcontainer;
// }

import { useEffect, useState } from "react";
import { WebContainer } from '@webcontainer/api';

let webcontainerInstance = null; // Single instance for the entire application

export function useWebContainer() {
  const [webcontainer, setWebcontainer] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const initWebContainer = async () => {
      try {
        if (!webcontainerInstance) {
            console.log("Booting WebContainer...");
          webcontainerInstance = await WebContainer.boot();
        }
        if (isMounted) {
          setWebcontainer(webcontainerInstance);
        }
      } catch (error) {
        console.error("WebContainer initialization error:", error);

      }
    };

    if (!webcontainer && !webcontainerInstance) {
      initWebContainer();
    } else if (!webcontainer && webcontainerInstance) {
      setWebcontainer(webcontainerInstance);
    }

    return () => {
      isMounted = false;
    };
  }, []);

  return webcontainer;
}