import React,{useState} from 'react';
import {ChevronDown, ChevronRight, FolderTree, File, Folder} from 'lucide-react';


//FileNode handles individual files and folders, if folder clicked- drop down files , if file is clicked-Recursively renders child items.
function FileNode({item, depth, onFileClick,path = ''}){
  const [isExpanded, setIsExpanded]=useState(false);
  // Building the current path
  // const currentPath = path ? `${path}/${item.name}` : item.name;
  const currentPath = [path, item.name].filter(Boolean).join('/');
  const handleClick=()=>{
    if(item.type==="folder"){
      setIsExpanded(prev => !prev); 
    }
    else{
      // console.log('Clicked file:', item);
       const fileToSelect = { 
          ...item,
          path: currentPath 
        };
        onFileClick(fileToSelect);
    }
  };

  return(
    <div className='select-none'>
      <div className='flex items-center gap-2 p-2 hover:bg-gray-800 rounded-md ' onClick={handleClick}>
        {item.type==='folder' &&(     //for drop down menu
          <span className='text-gray-400'>
            {isExpanded? (<ChevronDown className='w-4 h-4'/>):(<ChevronRight className='w-4 h-4'/>)}
          </span>
        )}
        {item.type==='folder'?(<Folder className='w-4 h-4 text-yellow-400'/>):(<File className='w-4 h-4 text-blue-400'/>)}
        <span className='text-sm text-white'>{item.name}</span>
      </div>
      {item.type==='folder' && isExpanded && item.children && (
        <div >
          {item.children.map((child, index)=>(
            <FileNode key={`${currentPath}/${child.name}-${index}`}   item={child}  depth={depth+1}  onFileClick={onFileClick} path={currentPath}/>
          ))}
          </div>
      ) }
    </div>
  )
}
//FileExplorer displays list of all files & folders,handles root files (depth=0), passes down props(files, onSelect) to FileNode, it loops through all files and uses FileNode to
//render each file
export function FileExplorer({files, onFileSelect}){
  return(
    <div className='bg-gray-900 rounded-lg shadow-lg p-4 h-full overflow-auto text-white'>
      <h2 className='text-lg font-semibold mb-4 flex items-center gap-2 text-white'>
        <FolderTree className='w-4 h-4'/>
        File Explorer
      </h2>
      <div className='space-y-1'>
      {files.map((file, index)=>(
        <FileNode key={`${file.name}-${index}`}  item={file} depth={0} onFileClick={onFileSelect}/>
      ))}
    </div>
    </div>
  )
}

export default FileExplorer
