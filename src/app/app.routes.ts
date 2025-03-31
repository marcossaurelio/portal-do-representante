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
    {path: 'login',                 title: 'Login',                     component: LoginComponent                                   },
    {path: 'home',                  title: 'Home',                      component: HomeComponent,           canActivate: [authGuard]},
    {path: 'orcamentos',            title: 'Orçamentos',                component: OrcamentosComponent,     canActivate: [authGuard]},
    {path: 'orcamentos/formulario', title: 'Orçamentos - Formulário',   component: FormularioComponent,     canActivate: [authGuard]},
    {path: 'visao-vendas',          title: 'Visão Geral das Vendas',    component: VisaoVendasComponent,    canActivate: [authGuard]},
    {path: 'categorias',            title: 'Categorias e Performance',  component: CategoriasComponent,     canActivate: [authGuard]},
    {path: 'contas-a-receber',      title: 'Contas a Receber',          component: ContasAReceberComponent, canActivate: [authGuard]},
    {path: 'tabelas-preco',         title: 'Tabelas de Preço',          component: TabelasPrecoComponent,   canActivate: [authGuard]},
    {path: 'page-not-found',        title: 'Página não encontrada',     component: PageNotFoundComponent,   canActivate: [authGuard]},
    {path: '',                      redirectTo: 'home',                 pathMatch: 'full'},
    {path: '**',                    redirectTo: 'page-not-found'},
];
