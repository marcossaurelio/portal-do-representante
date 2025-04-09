import { Routes } from '@angular/router';
import { authGuard } from './auth.guard';
import { OrcamentosComponent } from './components/orcamentos/orcamentos.component';
import { VisaoVendasComponent } from './components/visao-vendas/visao-vendas.component';
import { CategoriasComponent } from './components/categorias/categorias.component';
import { TabelasPrecoComponent } from './components/tabelas-preco/tabelas-preco.component';
import { LoginComponent } from './components/login/login.component';
import { ContasAReceberComponent } from './components/contas-a-receber/contas-a-receber.component';
import { HomeComponent } from './components/home/home.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { FormularioComponent } from './components/orcamentos/formulario/formulario.component';

export const routes: Routes = [
    {path: 'login',                 component: LoginComponent                                   },
    {path: 'home',                  component: HomeComponent,           canActivate: [authGuard]},
    {path: 'orcamentos',            component: OrcamentosComponent,     canActivate: [authGuard]},
    {path: 'orcamentos/formulario', component: FormularioComponent,     canActivate: [authGuard]},
    {path: 'visao-vendas',          component: VisaoVendasComponent,    canActivate: [authGuard]},
    {path: 'categorias',            component: CategoriasComponent,     canActivate: [authGuard]},
    {path: 'contas-a-receber',      component: ContasAReceberComponent, canActivate: [authGuard]},
    {path: 'tabelas-preco',         component: TabelasPrecoComponent,   canActivate: [authGuard]},
    {path: 'page-not-found',        component: PageNotFoundComponent,   canActivate: [authGuard]},
    {path: '',                      redirectTo: 'home',                 pathMatch: 'full'},
    {path: '**',                    redirectTo: 'page-not-found'},
];
