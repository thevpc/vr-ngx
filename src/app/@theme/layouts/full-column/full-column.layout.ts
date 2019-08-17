import { Component } from '@angular/core';

@Component({
  selector: 'ngx-full-column-layout',
  styleUrls: ['./full-column.layout.scss'],
  template: `
    <nb-layout windowMode>
      <nb-layout-header fixed>
        <ngx-public-header></ngx-public-header>
      </nb-layout-header>
      <nb-layout-column>
        <ng-content select="router-outlet"></ng-content>
      </nb-layout-column>

      <nb-layout-footer fixed>
        <ngx-footer></ngx-footer>
      </nb-layout-footer>
    </nb-layout>
  `,
})
export class FullColumnLayoutComponent {}
