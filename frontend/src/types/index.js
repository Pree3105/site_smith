//index.js is defining data structures and types used in your application. It's essentially setting up the models for the steps, projects, files, and file viewer.
// Enum for step types
const StepType = {
    CreateFile: 0,
    CreateFolder: 1,
    EditFile: 2,
    DeleteFile: 3,
    RunScript: 4
  };
  
//Step interface definition (no types in JavaScript)
  function Step(id, title, description, type, status, code, path) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.type = type;
    this.status = status;
    this.code = code || undefined;
    this.path = path || undefined;
  }
  
// Project interface (holds project data including steps)
  function Project(prompt, steps) {
    this.prompt = prompt;
    this.steps = steps;
  }
  
  // FileItem interface (holds file or folder data)
  function FileItem(name, type, children, content, path) {
    this.name = name;
    this.type = type; // 'file' or 'folder'
    this.children = children || [];
    this.content = content || undefined;
    this.path = path;
  }
  
  // FileViewerProps interface (props for file viewer)
  function FileViewerProps(file, onClose) {
    this.file = file || null;
    this.onClose = onClose;
  }
  
// Exporting the objects/functions for usage in other parts of the application
  module.exports = {
    StepType,
    Step,
    Project,
    FileItem,
    FileViewerProps
  };
  