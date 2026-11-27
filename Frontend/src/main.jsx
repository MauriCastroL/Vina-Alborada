// Sistema de Gestion Viña La Alborada
// Ramo: Base de Datos
// Profesor: Carlos Castro
// Integrantes: Mauricio Castro Secc-3, Emerson Fuenzalida Secc-2, José Cáceres Secc-2, Cristóbal Villalobos Secc-2

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './estilos/estilos.css';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </React.StrictMode>
);
