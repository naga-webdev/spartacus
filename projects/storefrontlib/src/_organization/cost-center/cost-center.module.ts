import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import {
  AuthGuard,
  CmsConfig,
  ConfigModule,
  RoutingConfig,
} from '@spartacus/core';
import { OrganizationOutletComponent } from '../shared/organization-outlet/organization-outlet.component';
import { OrganizationOutletModule } from '../shared/organization-outlet/organization-outlet.module';
import { CostCenterBudgetComponent } from './cost-center-budget/cost-center-budget.component';
import { CostCenterBudgetModule } from './cost-center-budget/cost-center-budget.module';
import { CostCenterCreateComponent } from './cost-center-create/cost-center-create.component';
import { CostCenterCreateModule } from './cost-center-create/cost-center-create.module';
import { CostCenterDetailsComponent } from './cost-center-details/cost-center-details.component';
import { CostCenterDetailsModule } from './cost-center-details/cost-center-details.module';
import { CostCenterEditComponent } from './cost-center-edit/cost-center-edit.component';
import { CostCenterEditModule } from './cost-center-edit/cost-center-edit.module';
import { CostCenterListComponent } from './cost-center-list/cost-center-list.component';
import { CostCenterListModule } from './cost-center-list/cost-center-list.module';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,

    ConfigModule.withConfig({
      routing: {
        routes: {
          costCenter: {
            paths: ['organization/cost-centers'],
          },
          costCenterDetails: {
            paths: ['organization/cost-centers/:code'],
          },
          costCenterBudget: {
            paths: ['organization/cost-centers/:code/budget/:budgetCode'],
          },
        },
      },
    } as RoutingConfig),

    ConfigModule.withConfig(<CmsConfig>{
      cmsComponents: {
        ManageCostCentersListComponent: {
          component: OrganizationOutletComponent,
          childRoutes: [
            {
              path: '',
              component: CostCenterListComponent,
              children: [
                {
                  path: 'create',
                  component: CostCenterCreateComponent,
                },
                {
                  path: ':code',
                  component: CostCenterDetailsComponent,
                  // children: [
                  // ],
                },
                {
                  path: ':code/edit',
                  component: CostCenterEditComponent,
                },
                {
                  path: ':code/budget/:budgetCode',
                  component: CostCenterBudgetComponent,
                },
              ],
            },
          ],
          guards: [AuthGuard],
        },
      },
    }),

    OrganizationOutletModule,
    CostCenterListModule,
    CostCenterCreateModule,
    CostCenterDetailsModule,
    CostCenterEditModule,
    CostCenterBudgetModule,
  ],
})
export class CostCenterModule {}