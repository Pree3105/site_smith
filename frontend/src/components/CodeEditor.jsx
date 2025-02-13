import React from 'react'
import Editor from '@monaco-editor/react';
export function CodeEditor({file}){
  if(!file){
    return(
    <div>
      Select a file to view its contents
    </div>
    );
}

return(
  <Editor
  height="100%"
  defaultLanguage="typescript"
  theme="vs-dark"
  value={file.content || ''}
  options={{
    readOnly: true,
    minimap: { enabled: false },
    fontSize: 14,
    wordWrap: 'on',
    scrollBeyondLastLine: false,
  }}
  />
)
}