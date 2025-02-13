import React,{useState} from 'react';
import {ChevronDown, ChevronRight, FolderTree, File, Folder} from 'lucide-react';
//ChevronRight	A collapsed folder (clicking expands it).
//ChevronDown	An expanded folder (clicking collapses it).


//FileNode handles individual files and folders, if folder clicked- drop down files , if file is clicked-Recursively renders child items.
function FileNode({item, depth, onFileClick}){
  const [isExpanded, setIsExpanded]=useState(false);
  const handleClick=()=>{
    if(item.type==="folder"){
      setIsExpanded(isExpanded);
    }
    else{
      onFileClick(item);
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
        {item.type==='folder'?(<FolderTree className='w-4 h-4 text-blue-400'/>):(<File className='w-4 h-4 text-blue-400'/>)}
        <span>{item.name}</span>
      </div>
      {item.type==='folder' && isExpanded && item.children && (
        <div>
          {item.children.map((child, index)=>(
            <FileNode key={`${child.path}-${index}`}   item={child}  depth={depth+1}  onFileClick={onFileClick}/>
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
    <div className='bg-gray-900 rounded-lg shadow-lg p-4 h-full overflow-auto'>
      <h2 className='text-lg font-semibold mb-4 flex items-center gap-2 text-gray-100'>
        <FolderTree className='w-4 h-4'/>
        File Explorer
      </h2>
      {files.map((file, index)=>(
        <FileNode key={`${file.path}-${index}`}  item={file} depth={0} onFileClick={onFileSelect}/>
      ))}
    </div>
  )
}

export default FileExplorer
