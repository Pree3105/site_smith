import { WebContainer } from "@webcontainer/api";
import React, { useEffect, useState ,useCallback} from "react";

export function PreviewFrame({ files, webContainer }) {
  const [url, setUrl] = useState("");

  const main = useCallback(async () => {
    if (!webContainer) return; // Ensure webContainer is available

    const installProcess = await webContainer.spawn("npm", ["install"]);

    installProcess.output.pipeTo(
      new WritableStream({
        write(data) {
          console.log(data);
        },
      })
    );
    

    await webContainer.spawn("npm", ["run", "dev"]);

    // Wait for `server-ready` event
    // webContainer.on("server-ready", (port, url) => {
    //   console.log(url);
    //   console.log(port);
    //   setUrl(url);
    // });
  },[webContainer]);

  useEffect(() => {
    if (!webContainer) return;

    main(); // Start WebContainer setup

    const handleServerReady = (port, url) => {
      console.log(`Server ready at ${url} (port ${port})`);
      setUrl(url);
    };

    // Listen for `server-ready` event
    webContainer.on("server-ready", handleServerReady);

    return () => {
      webContainer.removeListener("server-ready", handleServerReady); // Cleanup to prevent memory leaks
    };
  }, [main, webContainer]); // Run only when webContainer is available

  return (
    <div className="h-full flex items-center justify-center text-gray-400">
      {!url && (
        <div className="text-center">
          <p className="mb-2">Loading...</p>
        </div>
      )}
      {url && <iframe width="100%" height="100%" src={url} />}
    </div>
  );
}
