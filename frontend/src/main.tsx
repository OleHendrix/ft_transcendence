import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './css/index.css'
import App from './App.tsx'
import SignUpModal from './signup/SignUpModal.tsx';
import LoginModal from './login/LoginModal.tsx';

const router = createBrowserRouter([
	{
		path: '/',
		element: <App />,
		children: [
		{ index: true, element: <App /> },
		{ path: '/signup', element: <SignUpModal />},
		{ path: '/login', element: <LoginModal />},
		]
	}
]);

createRoot(document.getElementById('root')!).render(
//   <StrictMode>
	<RouterProvider router={router} />
    // <App />
//   </StrictMode>
)
