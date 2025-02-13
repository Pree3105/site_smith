import { useState } from 'react'
import ReactDOM from "react-dom/client";
import {createBrowserRouter, RouterProvider} from "react-router-dom";
import Home from './pages/Home.jsx';
import Builder from './pages/Builder.jsx';
import './App.css'

const router=createBrowserRouter(
  [
    {
      path:'/',
      element:<Home/>
    },
    {
      path: '/builder',
      element:<Builder/>
    }
  ]
)

function App() {
  // const [count, setCount] = useState(0)

  return (
    <div>
      <RouterProvider router={router}/>
    </div>
  )
}

export default App
