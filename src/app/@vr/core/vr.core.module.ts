import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
//import { SmartTableService } from '../../@core/data/smart-table.service';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { VrPublicComponent } from './components/vr-public/vr-public.component';
//import { RouterModule, Routes } from '@angular/router';
//import { FormEntityComponent } from './pages/form-entity/form-entity.component';
//import { ReportComponent } from '../wpm/pages/report/report.component';

/*const routes: Routes = [{
    path: '',
    component: FormsComponent,
    children: [{
      path: 'report',
      component: ReportComponent,
    }, {
      path: 'entity/:name',
      component: FormEntityComponent,
    }],
  }];
*/

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
//    ThemeModule,
    //Ng2SmartTableModule
//    RouterModule.forChild(routes),
    // routes
  ],
  declarations: [
    //ProfileComponent
VrPublicComponent],
  providers: [
//    SmartTableService
  ]
})
export class VrCoreModule {}
