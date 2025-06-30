import React,{useEffect, useState} from 'react'
const Editor = React.lazy(() => import('@monaco-editor/react'));

if (typeof window !== 'undefined') {
  window.MonacoEnvironment = {
    getWorker: () => ({
      postMessage: () => {},
      onmessage: null,
      terminate: () => {},
      getProxy: () => null,
      dispose: () => {}
    }),
    createTrustedTypesPolicy: null
  };
}

export function CodeEditor({file}){
   const [shouldRender, setShouldRender] = useState(false);

useEffect(() => {
    const timer = setTimeout(() => {
      setShouldRender(true);
    }, 300); //delay

    return () => clearTimeout(timer);
  }, [])



  if (!file || file.type !== 'file' || typeof file.content !== 'string') {
    return <div>Select a valid file to view its contents</div>;
  }
  // to detect language from file extension
  const getLanguage = (filename) => {
    const extensionMap = {
      '.js': 'javascript',
      '.jsx': 'javascript',
      '.ts': 'typescript',
      '.tsx': 'typescript',
      '.html': 'html',
      '.css': 'css',
      '.json': 'json',
    };
    const extension = filename.slice(filename.lastIndexOf('.'));
    return extensionMap[extension] || 'javascript';
  };

    if (!shouldRender) {
    return <div className="text-gray-400">Preparing editor...</div>;
  }

return(
      <React.Suspense fallback={<div>Loading editor...</div>}>
  <Editor
  key={file.name}
  height="100vh"
  language={getLanguage(file.name)}
  theme="vs-dark"
  value={file.content}
  options={{
    readOnly: false,
    minimap: { enabled: false },
    fontSize: 14,
    wordWrap: 'on',
    scrollBeyondLastLine: false,
    automaticLayout: true,
    suggest: { showWords: false },
    quickSuggestions: false,
    parameterHints: { enabled: false },
    hover: { enabled: false }
  }}
  onMount={(editor) => {
      setTimeout(() => {
        try {
         editor.getAction('editor.action.formatDocument')?.run().catch(() => {});
    } catch (error) {
      console.debug('Error formatting document:'  );
    }
 }, 500);
}}
  />
  </React.Suspense>
)}