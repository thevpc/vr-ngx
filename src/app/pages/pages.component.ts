import { Component, OnInit } from '@angular/core';

import { MENU_ITEMS } from './pages-menu';
import { VrMenu } from '../@vr/core/services/vr.menu';

@Component({
  selector: 'ngx-pages',
  styleUrls: ['pages.component.scss'],
  template: `
    <ngx-one-column-layout>
      <nb-menu [items]="menu"></nb-menu>
      <router-outlet></router-outlet>
    </ngx-one-column-layout>
  `,
})
  // [Vr]
  export class PagesComponent implements OnInit{

  menu = MENU_ITEMS;

  // [Vr]
  constructor(private menuService: VrMenu) {
  }

  // [Vr]
  ngOnInit(): void {
    this.menuService.menuModel.subscribe(x=> this.menu=x);
  }
}
