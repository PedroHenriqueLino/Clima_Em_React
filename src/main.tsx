import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

//routes
import Location from './routes/Location.tsx'
import Home from './routes/Home.tsx'
//React router dom
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <Location />
      },
      {
        path: "/clima",
        element: <Home />
      }
    ]
  }
])

//Context
import { LocationProvider } from './context/LocationContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>

    <LocationProvider>
      <RouterProvider router={router} />
    </LocationProvider>

  </StrictMode>,
)
