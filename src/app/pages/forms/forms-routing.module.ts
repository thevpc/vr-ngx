import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { FormsComponent } from './forms.component';
import { FormInputsComponent } from './form-inputs/form-inputs.component';
import { FormLayoutsComponent } from './form-layouts/form-layouts.component';
import { DatepickerComponent } from './datepicker/datepicker.component';
import { ButtonsComponent } from './buttons/buttons.component';
import { FormEntityComponent } from '../../@vr/core/pages/form-entity/form-entity.component';
import { ReportComponent } from '../../@vr/wpm/pages/report/Test';

const routes: Routes = [{
  path: '',
  component: FormsComponent,
  children: [
    {
      path: 'inputs',
      component: FormInputsComponent,
    },
    {
      path: 'layouts',
      component: FormLayoutsComponent,
    },
    {
      path: 'layouts',
      component: FormLayoutsComponent,
    },
    {
      path: 'buttons',
      component: ButtonsComponent,
    },
    {
      path: 'datepicker',
      component: DatepickerComponent,
    }, 
    // [Vr]
    {
      path: 'report',
      component: ReportComponent,
    }
    , {
      path: 'entity/:name',
      component: FormEntityComponent,
    }
  ],
}];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
  ],
  exports: [
    RouterModule,
  ],
})
export class FormsRoutingModule {
}

