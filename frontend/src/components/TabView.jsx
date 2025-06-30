import React from 'react'
import {Code2, Eye} from 'lucide-react';
//Code2: Represents the Code tab (used to display code content).
//Eye: Represents the Preview tab.

export function TabView({activeTab, onTabChange}){
  return(
    <div className="flex space-x-2 mb-4">
      <button 
      onClick={()=>onTabChange('code')}
      className={activeTab==='code' 
        ?('flex items-center p-2 gap-2 transition-colors rounded-md bg-gray-700 text-gray-100')
        :('flex items-center p-2 gap-2 transition-colors rounded-md text-gray-100 hover:bg-gray-700')}
      >
        <Code2 className='w-4 h-4'/>
        Code
      </button>
      <button
      onClick={()=>onTabChange('preview')}
      className={activeTab==='preview' 
        ?('flex items-center p-2 gap-2 transition-colors rounded-md bg-gray-700 text-gray-100')
        :('flex items-center p-2 gap-2 transition-colors rounded-md text-gray-100 hover:bg-gray-700')}
      >
        <Eye className='w-4 h-4'/>
        Preview
      </button>
    </div>
  )
}

export default TabView
