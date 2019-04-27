import { Component, OnInit } from '@angular/core';

import { MENU_ITEMS } from './pages-menu';
import { VrService } from '../@vr/core/service/vr.service';
import { VrSharedState } from '../@vr/core/service/vr.shared-state';

@Component({
  selector: 'ngx-pages',
  styleUrls: ['pages.component.scss'],
  template: `
    <ngx-sample-layout>
      <nb-menu [items]="menu"></nb-menu>
      <router-outlet></router-outlet>
    </ngx-sample-layout>
  `,
})
export class PagesComponent implements OnInit{

  menu = MENU_ITEMS;

  constructor(private vrService: VrService, private vrModemState: VrSharedState) {
  }

  ngOnInit(): void {
    this.vrModemState.domainModel.subscribe(
      newDomain => this.menu = this.vrService.ui_rebuildMenu(newDomain)
      ,
      err => alert(err)
    );
  }
}
