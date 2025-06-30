import React, { useEffect, useState, useCallback, useRef } from "react";

export function PreviewFrame({ files, webContainer }) {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState("waiting");
  const [errorMsg, setErrorMsg] = useState("");
  const hasStartedRef = useRef(false);
  const devProcessRef = useRef(null);
  const webContainerRef = useRef(webContainer); // Add this ref

  // Update the ref when webContainer changes
  useEffect(() => {
    webContainerRef.current = webContainer;
  }, [webContainer]);

  const installDependencies = useCallback(async () => {
    const wc = webContainerRef.current; // Use the ref
    if (!wc || !files || files.length === 0) return;

    try {
      setStatus("installing");
      const installProcess = await wc.spawn("npm", ["install"]);
      installProcess.output.pipeTo(new WritableStream({ write() {} }));
      const exitCode = await installProcess.exit;
      if (exitCode !== 0) throw new Error(`Install failed with code ${exitCode}`);
    } catch (error) {
      console.error("Install error:", error);
      setStatus("error");
      setErrorMsg(error.message);
    }
  }, [files]);

  const startDevServer = useCallback(async () => {
    const wc = webContainerRef.current; // Use the ref
    if (!wc || !files || files.length === 0) return;

    try {
      // Kill previous server if exists
      if (devProcessRef.current) {
        try {
          await devProcessRef.current.kill();
        } catch (e) {
          console.debug("Kill error:", e);
        }
      }

      // Write files
      const writeFiles = async (fileList, basePath = "") => {
        for (const file of fileList) {
          const path = basePath + file.name;
          if (file.type === "file") {
            await wc.fs.writeFile(path, file.content || "");
          } else if (file.type === "folder" && file.children) {
            await writeFiles(file.children, `${path}/`);
          }
        }
      };
      await writeFiles(files);

      // Start server
      setStatus("running");
      devProcessRef.current = await wc.spawn("npm", ["run", "dev"]);
      devProcessRef.current.output.pipeTo(
        new WritableStream({ write(data) { console.log(data); } })
      );

      // Handle server-ready event
      const handleServerReady = (port, url) => {
        console.log(`Server ready at ${url}`);
        setUrl(url);
      };
      wc.on("server-ready", handleServerReady);

      return () => wc.off("server-ready", handleServerReady);
    } catch (error) {
      console.error("Server error:", error);
      setStatus("error");
      setErrorMsg(error.message);
    }
  }, [files]);

  // Initial setup
  useEffect(() => {
    if (hasStartedRef.current || !webContainerRef.current) return;
    
    hasStartedRef.current = true;
    const init = async () => {
      await installDependencies();
      await startDevServer();
    };
    init().catch(console.error);
  }, [installDependencies, startDevServer]);

  // Restart server when files change
  useEffect(() => {
    if (hasStartedRef.current) {
      startDevServer();
    }
  }, [files, startDevServer]);

  // useEffect(() => {
  //   if (!webContainer|| !files || files.length === 0) return;

  //   const handleServerReady = (port, url) => {
  //     console.log(`Server ready at ${url} (port ${port})`);
  //     setUrl(url);
  //   };

  //   // Listen for `server-ready` event
  //   webContainer.on("server-ready", handleServerReady);
  //   const timer = setTimeout(() => {
  //     main();
  //   }, 500);

  //   return () => {
  //     clearTimeout(timer);
  //     webContainer.removeListener("server-ready", handleServerReady); // Cleanup to prevent memory leaks
  //   };
  // }, [webContainer, files, main]); // Run only when webContainer is available

  return (
    <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-white">
      {status === "waiting" && (
        <div className="text-center">
          <p className="mb-2">Waiting for WebContainer...</p>
        </div>
      )}
      {status === "installing" && (
        <div className="text-center">
          <p className="mb-2">Installing dependencies...</p>
        </div>
      )}
      {status === "error" && (
        <div className="text-center text-red-400">
          <p className="mb-2">Error: {errorMsg || "Something went wrong"}</p>
        </div>
      )}
      {url ? (
        <iframe
          title="Preview"
          className="w-full h-full border-0"
          src={url}
          sandbox="allow-scripts allow-same-origin"
        />
      ) : (
        status === "running" && (
          <div className="text-center">
            <p className="mb-2">Starting development server...</p>
          </div>
        )
      )}
    </div>
  );
}
