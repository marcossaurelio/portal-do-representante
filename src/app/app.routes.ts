import { Routes } from '@angular/router';
import { OrcamentosComponent } from './components/orcamentos/orcamentos.component';
import { VisaoVendasComponent } from './components/visao-vendas/visao-vendas.component';
import { CategoriasComponent } from './components/categorias/categorias.component';

export const routes: Routes = [
    {path: 'orcamentos',        title: 'Orçamentos',                component: OrcamentosComponent},
    {path: 'visao-vendas',      title: 'Visão Geral das Vendas',    component: VisaoVendasComponent},
    {path: 'categorias',        title: 'Categorias e Performance',  component: CategoriasComponent},
    {path: 'contas-a-receber',  title: 'Contas a Receber',          component: CategoriasComponent}
];
