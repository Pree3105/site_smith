
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { BACKEND_URL } from '../config';
import { StepsList } from "../components/StepsList";
import { FileExplorer } from "../components/FileExplorer";
import { TabView } from "../components/TabView";
import { CodeEditor } from "../components/CodeEditor";
import { PreviewFrame } from "../components/PreviewFrame";
import { Loader } from "../components/Loader";

import { useWebContainer } from '../hooks/useWebContainer';
import { parseXml } from '../steps';

export function Builder() {
  const location = useLocation();
  const { prompt } = location.state || {}; // Default prompt
  const [userPrompt, setUserPrompt] = useState('');
  const [llmMessages, setLlmMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [templateSet, setTemplateSet] = useState(false);

  const [currentStep, setCurrentStep] = useState(1);
  const [activeTab, setActiveTab] = useState('code');
  const [selectedFile, setSelectedFile] = useState(null);
  const [steps, setSteps] = useState([]);
  const [files, setFiles] = useState([]);
  const webcontainer = useWebContainer();

  // Initialize and fetch initial data
//   useEffect(() => {
//     const initialize = async () => {   //async function returns a promise, perform multiple operations (API calls, parsing data) sequentially
//       setLoading(true);
//       try {
//         const safePrompt = prompt ? prompt.trim() : "";
//         const { data } = await axios.post(`${BACKEND_URL}/template`, { prompt: safePrompt });  //sends a POST request to ${BACKEND_URL}/template with the trimmed prompt.. returns a template(node/react)
//       setTemplateSet(true);     // template data has been fetched successfully

//         const parsedSteps = parseXml(data.uiPrompts[0]).map((step) => ({   ...step, 
//   status: 'pending',}));      // Parses the first UI prompt (xml format) in the API response(steps) 

//         setSteps(parsedSteps);

// // request body contains a messages array, which is created by mapping over data.prompts from the first API response (template received)
//         const chatResponse = await axios.post(`${BACKEND_URL}/chat`, {
//           messages: data.prompts.map((content) => ({ role: 'user', content })),
//         });

//         setSteps((prevSteps) => [    //appending the parsed steps
//           ...prevSteps,
//           ...parseXml(chatResponse.data.response).map((step) => ({ ...step, status: 'pending' })),  //.map() - each parsed step to include status: 'pending'
//         ]);
//         setLlmMessages(data.prompts);    //prompts- from 1st API call
//       } finally {
//         setLoading(false);
//       }
//     };
//     initialize();
//   }, [prompt]);


useEffect(() => {
  const makeRequest = async (url, payload, retries = 3) => {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await axios.post(url, payload);
        return response.data;
      } catch (error) {
        if (i === retries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Exponential backoff
      }
    }
  };

  const initialize = async () => {
    if (!prompt) return; // Don't initialize without a prompt
    
    setLoading(true);
    try {
      const safePrompt = prompt.trim();
      
      // First request with retry
      const templateData = await makeRequest(
        `${BACKEND_URL}/template`, 
        { prompt: safePrompt }
      );
      
      setTemplateSet(true);
      
      const parsedSteps = parseXml(templateData.uiPrompts[0]).map(step => ({
        ...step,
        status: 'pending'
      }));
      setSteps(parsedSteps);

      // Second request with retry
      const chatData = await makeRequest(
        `${BACKEND_URL}/chat`,
        {
          messages: templateData.prompts.map(content => ({
            role: 'user',
            content
          }))
        }
      );

      if (chatData.response) {
        setSteps(prevSteps => [
          ...prevSteps,
          ...parseXml(chatData.response).map(step => ({
            ...step,
            status: 'pending'
          }))
        ]);
      }
      
      setLlmMessages(templateData.prompts);
    } catch (error) {
      console.error('Initialization failed:', error);
      // Add user-friendly error handling
    } finally {
      setLoading(false);
    }
  };

  initialize();
}, [prompt]);


  // Process pending steps and update file structure
  useEffect(() => {
    const updatedFiles = [...files];    //shallow copy of files
    let hasChanges = false;

    steps.forEach((step) => {   //for loop
      if (step.status === 'pending') {     //only pending steps need processsing
        hasChanges = true;

        if (step.type === 'CreateFile') {
          const pathSegments = step.path.split('/');
          let currentLevel = updatedFiles;    // points to top level of the files array.

          pathSegments.forEach((segment, index) => {   //for loop
            const isFile = index === pathSegments.length - 1; //Checks if the current segment represents a file (last segment in the path)
            let existing = currentLevel.find((item) => item.name === segment);   
//Looks for an item in the current level of file structure with same name as current segment. Check if folder/file already exists

            if (!existing) {
              existing = isFile   
                ? { name: segment, type: 'file', content: step.code }   //if isFile create file
                : { name: segment, type: 'folder', children: [] };        //if not isFile then folder
              currentLevel.push(existing);
            }

            if (!isFile) currentLevel = existing.children;    // updates currentLevel to point to its children array for further traversal.
            else existing.content = step.code;  // If it's a file, updates its content with the step.code
          });
        }
      }
    });

    if (hasChanges) {  //If any changes were made
      setFiles(updatedFiles);   // updates the files
      setSteps((prevSteps) => prevSteps.map((s) => ({ ...s, status: 'completed' })));   //mark steps as completed
    }
  }, [steps, files]);

  // any time files change Sync file structure with WebContainer
  useEffect(() => {
    if (!webcontainer) {
      console.warn("WebContainer is not ready yet. Skipping mount.");
      return; // Exit early if WebContainer is not initialized
    }
  
    if (!files || files.length === 0) {
      console.warn("No files available to mount.");
      return; // Exit early if there are no files
    }
    


    const prepareMountStructure = (files) => {
      const structure = {};     //empty object
      files.forEach((file) => {  //for loop
        if (file.type === 'file') {
          structure[file.name] = { file: { contents: file.content || '' } };
        } else if (file.type === 'folder') {     //recursive call
          structure[file.name] = { directory: prepareMountStructure(file.children) };
        }
      });
      return structure;
    };

    console.log("Mounting file structure to WebContainer...");
  const mountStructure = prepareMountStructure(files);
  webcontainer.mount(mountStructure);
  }, [files, webcontainer]);

  const handleUserPrompt = async () => {
    setLoading(true);
    try {
      const newMessage = { role: 'user', content: userPrompt };
      const { data } = await axios.post(`${BACKEND_URL}/chat`, {
        messages: [...llmMessages, newMessage],
      });

      setLlmMessages((prev) => [...prev, newMessage, { role: 'assistant', content: data.response }]);
      setSteps((prevSteps) => [
        ...prevSteps,
        ...parseXml(data.response).map((step) => ({ ...step, status: 'pending' })),
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <h1 className="text-xl font-semibold text-gray-100">Website Builder</h1>
        <p className="text-sm text-gray-400 mt-1">Prompt: {prompt}</p>
      </header>

      <div className="flex-1 overflow-hidden">
        <div className="grid grid-cols-4 gap-6 p-6">
          {/* Steps Panel */}
          <div className="col-span-1 space-y-6">
            <StepsList steps={steps} currentStep={currentStep} onStepClick={setCurrentStep} />
            <div>
              <textarea
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                className="p-2 w-full"
              />
              <button onClick={handleUserPrompt} className="bg-purple-400 px-4">
                {loading ? 'Loading...' : 'Send'}
              </button>
            </div>
          </div>

          {/* File Explorer */}
          <div className="col-span-1">
            <FileExplorer files={files} onFileSelect={setSelectedFile} />
          </div>

          {/* Main Editor/Preview */}
          <div className="col-span-2">
            <TabView activeTab={activeTab} onTabChange={setActiveTab} />
            {activeTab === 'code' ? (
              <CodeEditor file={selectedFile} />
            ) : (
              <PreviewFrame webContainer={webcontainer} files={files} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}



export default Builder
