import { Outlet } from 'react-router-dom'
import './App.css'


//Components
import NavHeader from './components/Nav_Header/NavHeader'


function App() {

  return (
    <>
      <NavHeader />

      <Outlet />
    </>
  )
}

export default App
