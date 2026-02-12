// libreria de angular
import { Routes } from '@angular/router';
// compoenetes de la aplicacion
import { HomeView } from './views/home-view/home-view';
import { ConsoleView } from './views/console-view/console-view';
import { ErrorView } from './views/error-view/error-view';

// Para usar las rutas en la aplicacion
//  path: ruta de la aplicacion
//  component: componente que se va a cargar en esa ruta
export const routes: Routes = [
  {
    path: '',
    component: HomeView,
  },
  {
    path: 'game',
    component: ConsoleView,
  },
  // La ruta de error debe ir al final por que la primera que ve angiular es la que carga :c
  {
    path: '**',
    component: ErrorView,
  },
];
