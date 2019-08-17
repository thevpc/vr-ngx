// @author vpc, vr auth ws
import {Observable} from 'rxjs/Observable';
import {Injectable} from '@angular/core';
import {CurrentUser, VrSharedState} from './vr.shared-state';
import {VrHttp} from './vr.http';
import {log} from 'util';
import {Subject, BehaviorSubject} from 'rxjs';
import {delay, share} from 'rxjs/operators';
import { NbMenuItem } from '@nebular/theme';
import { Router } from '@angular/router';
import { VrService } from './vr.service';
import { MENU_ITEMS } from '../../../pages/pages-menu';


/**
 * Http REST Client Service Implementation for Vain Ruling WebScript Services.
 * @author vpc (Taha BEN SALAH)
 * @version 1.0
 * @lastModified 2017-12-03
 */
@Injectable()
export class VrMenu {
  public menuModel: BehaviorSubject<NbMenuItem[]> = new BehaviorSubject<NbMenuItem[]>(MENU_ITEMS);
  
  constructor(private router:Router,private sharedState:VrSharedState,private vrService:VrService) {
    //router.events.subscribe(x=>console.log("VPC ROUTER EVENT :: "+JSON.stringify(x)));
    this.sharedState.domainModel.subscribe(
      newDomain => this.onNewMenu(this.ui_rebuildMenu(newDomain))
      ,
      err => alert(err)
    );
  }

  private onNewMenu(newMenu){
    this.menuModel.next(newMenu);
  }

  public ui_rebuildMenu(domain: any): NbMenuItem[] {
    let r: NbMenuItem[] = [];
    r.push(
      {
        title: 'Accueil',
        icon: 'monitor-outline',
        link: '/pages/dashboard',
        home: true,
      }
    );
// //***********
//     r.push(
//       {
//         title: 'Mes etudiants',
//       icon: 'nb-home',
//       children : [
//       {
//         title: 'Mon etudiant',
//         icon: 'nb-home',
//         link: '/pages/etudiant',
//       }
//         ]
//       }
//     );
    if (domain.root) {
      // alert(JSON.stringify(domain.root));
      const rootMenu = this.ui_createMenu(domain.root);
      rootMenu.children.forEach((element) => {
        r.push(element);
      });
    }
    // r.push(
    //   {
    //     title: 'Forms',
    //     icon: 'nb-compose',
    //     children: [
    //       {
    //         title: 'Form Inputs',
    //         link: '/pages/forms/inputs',
    //       },
    //       {
    //         title: 'Form Layouts',
    //         link: '/pages/forms/layouts',
    //       },
    //       {
    //         title: 'Form Entity',
    //         link: '/pages/forms/entity',
    //       },
    //     ],
    //   }
    // );
    r.push(
      {
        title: 'Auth',
        icon: 'power-outline',
        children: [
          {
            title: 'Login',
            link: '/auth/login',
          },
          {
            title: 'Register',
            link: '/auth/register',
          },
          {
            title: 'Request Password',
            link: '/auth/request-password',
          },
          {
            title: 'Reset Password',
            link: '/auth/reset-password',
          },
        ],
      }
    );

    r.push({
      title:'test-public',
      link: '/public',
    }
  );
  r.push({
        title:'extra',
        icon:'power-outline',
        children: [...MENU_ITEMS]
      }
    );


    return r;
  }

  public ui_createMenu(item: any): NbMenuItem {
    // log('--------------------------------------------------------');
    // log(JSON.stringify(item));
    // log('--------------------------------------------------------');
    const r: NbMenuItem[] = [];
    if (item.name === 'Payroll') {
      r.push(
        {
          title: 'Rapport',
          link: '/pages/forms/report',
          icon: 'book-open-outline',
        }
      );
    }
    if (item.typeName === 'package') {
      item.children.forEach((element) => {
        const rr = this.ui_createMenu(element);
        if (rr != null) {
          r.push(rr);
        }
      });
      if (r.length > 0) {
        let obj = {
          title: item.title,
          icon: 'folder-outline',
          children: r,
        };
        switch (item.title) {
          case 'Administration':
            obj.icon = 'settings-2-outline';
            break;
          case 'Contacts':
            obj.icon = 'people-outline';
            break;
          case 'Social':
            obj.icon = 'message-circle-outline';
            break;
          case 'Sécurité':
            obj.icon = 'shield-outline';
            break;
        }
        return obj;
      } else {
        return {
          title: item.title,
          icon: 'radio-button-on-outline',
        };
      }
    } else if (item.typeName == 'entity' && item.compositionRelationship === undefined) {
      item.children.forEach((element) => {
        let rr = this.ui_createMenu(element);
        if (rr != null) {
          r.push(rr);
        }
      });
      //***********
      // if(r.length>0) {
      //   return {
      //     title: item.title,
      //     icon: 'nb-keypad',
      //     children:r
      //   };
      //}else{
      return {
        title: item.title,
        icon: 'square-outline',
        link: '/pages/forms/entity/' + item.name,
      };
      //}
    } else if (item.typeName == 'section') {
      item.children.forEach((element) => {
        let rr = this.ui_createMenu(element);
        if (rr != null) {
          r.push(rr);
        }
      });
      if (r.length > 0) {
        return {
          title: item.title,
          icon: 'square-outline',
          children: r
        };
      } else {
        return {
          title: item.title,
          icon: 'square-outline',
        };
      }
    }else{
      // alert('type  unknown ' + JSON.stringify(item) + " :: " + item.typeName);
      // log(JSON.stringify(item));
    }
    return null;
  }
}
