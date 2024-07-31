import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { persistor, store } from './redux/store.js'
import { Provider } from 'react-redux'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { PersistGate } from 'redux-persist/integration/react'
import ThemeProvider from './redux/theme/ThemeProvider.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(   
    
<PersistGate persistor={persistor}>
    <Provider store={store}>  
    <ThemeProvider>
        <GoogleOAuthProvider clientId={import.meta.env.VITE_OAUTH_CLIENT_ID}> 
        <App />
         </GoogleOAuthProvider>
    </ThemeProvider>
  </Provider>
</PersistGate>
)
