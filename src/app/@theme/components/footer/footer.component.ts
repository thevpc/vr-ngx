import { Component } from '@angular/core';

@Component({
  selector: 'ngx-footer',
  styleUrls: ['./footer.component.scss'],
  template: `
  <span class="created-by">Copyright (c) 2015-2019 Taha Ben Salah, ENISo. Version <b>1.2.5</b>. All rights reserved, based on <i>vain-ruling</i> an <i>ngx-admin</i> open-source projects.</span>
    <div class="socials">
      <a href="https://github.com/thevpc/vr" target="_blank" class="ion ion-social-github"></a>
      <a href="https://github.com/thevpc/vr/issues" target="_blank" class="ion ion-bug"></a>
      <a href="#" target="_blank" class="ion ion-social-facebook"></a>
      <a href="#" target="_blank" class="ion ion-social-twitter"></a>
      <a href="#" target="_blank" class="ion ion-social-linkedin"></a>
    </div>
  `,
})
export class FooterComponent {
}
