import { Routes } from '@angular/router';
import { DocumentViewerPageComponent } from './document-viewer-page/document-viewer-page.component';
import { InvalidPageComponent } from './invalid-page/invalid-page.component';
import { TokenGuard } from './guards/token.guard';

export const routes: Routes = [
  {
    path: 'invalid',
    component: InvalidPageComponent
  },
  {
    path: ':documentToken',
    component: DocumentViewerPageComponent,
    canActivate: [TokenGuard]
  },
  {
    path: '',
    redirectTo: 'invalid',
    pathMatch: 'full'
  },
  {
    path: '',
    redirectTo: 'invalid',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'invalid'
  }
];
