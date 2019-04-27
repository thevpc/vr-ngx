// @author vpc, vr auth ws
import {Observable} from 'rxjs/Observable';
import {Injectable} from '@angular/core';
import {CurrentUser, VrSharedState} from './vr.shared-state';
import {VrHttp} from './vr.http';
import {log} from 'util';
import {Subject} from 'rxjs';
import {delay, share} from 'rxjs/operators';
import { NbMenuItem } from '@nebular/theme';


interface VrNodeFilter {
  acceptNode(n: any): boolean;
}

/**
 * Http REST Client Service Implementation for Vain Ruling WebScript Services.
 * @author vpc (Taha BEN SALAH)
 * @version 1.0
 * @lastModified 2017-12-03
 */
@Injectable()
export class VrService {
  static INSTANCE: VrService;

  public authvalue = false;
  protected layoutSize$ = new Subject();

  constructor(private model: VrSharedState, private vrHttp: VrHttp) {
    VrService.INSTANCE = this;
  }

  public findArticlesByCategory(dispo: string): Observable<any> {
    return this.vrHttp.invokeBeanMethod('core', `findArticlesByCategory('${dispo}')`);
  }

  public findAllContacts(): Observable<any> {
    return this.vrHttp.invokeBeanMethod('core', 'findAllContacts()');
  }

  public getCurrentContacts(): Observable<any> {
    return this.vrHttp.invokeBeanMethod('core', `getContact()`);
  }

  public getPicture(userId): Observable<any> {
    const url = 'getUserPhoto(' + userId + ')';
    // alert('getPicture : user.id = ' + studentId);
    return this.vrHttp.invokeBeanMethod('core', url);
  }

  public getCurrentUser(): Observable<any> {
    return this.vrHttp.invokeBeanMethod('core', 'getCurrentUser()').map(
      r => {
        // alert(JSON.stringify('vr.services -> getCurrentUser: r = ' + JSON.stringify(r)) + '| r.contact: ' + r.contact);
        this.model.currentUser.next(new CurrentUser(r.fullName, '', r, true));
        return r;
      },
    );
  }

  // -------------------------Ramzi---------------------------
  public getEntityData(entityName: string): Observable<any> {
    return this.vrHttp.invokeBeanMethod('core', 'findAll("' + entityName + '")');
  }

  // ---------------------------------------------------------

  public getEntityDataByAutoFilters(entityName: string, autoFilters: any): Observable<any> {
    return this.vrHttp.invokeBeanMethod('core', 'findAllByAutoFilters("' + entityName + '",' + JSON.stringify(autoFilters) + ')');
  }

  public getEntityInfo(entityName: string): Observable<any> {
    return this.getPersistenceUnitInfo().map(v => {
      return this.findEntityInfo(v, entityName);
    });
  }

  // private findSectionInfo(node:any,entityName:string) : any{
  //   if(node.typeName=='persistenceUnit'){
  //     return this.findEntityInfo(node.root,entityName);
  //   }
  //   if(node.typeName=='package'){
  //     for(let i=0;i<node.children.length;i++){
  //       let child = node.children[i];
  //       let found=this.findEntityInfo(child,entityName);
  //       if(found != null){
  //         return found;
  //       }
  //     }
  //     return null;
  //   }
  //   if(node.typeName=='entity'){
  //     if(node.name.equal(node)){
  //       return node;
  //     }
  //     return null;
  //   }
  //   return null;
  // }

  public findEntityInfo(node: any, entityName: string): any {
    if (node.typeName === 'persistenceUnit') {
      return this.findEntityInfo(node.root, entityName);
    }
    if (node.typeName === 'package') {
      for (let i = 0; i < node.children.length; i++) {
        const child = node.children[i];
        const found = this.findEntityInfo(child, entityName);
        if (found != null) {
          return found;
        }
      }
      return null;
    }
    if (node.typeName === 'entity') {
      if (node.name === entityName) {
        return node;
      }
      return null;
    }
    return null;
  }

  public getPersistenceUnitInfo(forceReload: boolean = false): Observable<any> {
    return this.model.domainModel.getOrReload(forceReload, this.vrHttp.invokeBeanMethod('core', 'getPersistenceUnitInfo()'));
  }

  public isValidSession(): boolean {
    return this.model.sessionId != null;
  }

  public findElement(entityTitle: string, id: number): Observable<any> {
    let request: string = 'find("' + entityTitle + '\",' + id + ')';
    request = encodeURI(request);
    return this.vrHttp.invokeBeanMethod('core', request);
  }

  public authenticate(username: any, password: any): Observable<CurrentUser> {
    try {
      const o = this.vrHttp.authenticate(username, password);
      o.subscribe(null, null, () => {
        this.getCurrentUser().subscribe();
        this.getPersistenceUnitInfo(true).subscribe();
      });
      this.authvalue = true;
      return o;
    } catch (err) {

      alert(err.stack);
      throw err;

    }
  }

  public getSelectList(entityName: string, fieldName: string, constraints: any, currentInstance: any): Observable<any> {
    return this.vrHttp.invokeBeanMethod('core', `getFieldValues('${entityName}', '${fieldName}',${constraints}, ${currentInstance} )`);
  }

  public logout(): Observable<any> {
    return this.vrHttp.logout();
  }

  public saveDataToBase(opj: string, entityTitle: string): Observable<any> {
    let request: string = 'save("' + entityTitle + '\",' + opj + ')';
    request = encodeURI(request);
    return this.vrHttp.invokeBeanMethod('core', request);
    // this.vrHttp.invokeWScript(request);
    // console.log("hello World");

  }

  public removeFromDataBase(id: number, entityName: string) {
    let request: string = 'remove("' + entityName + '\",' + id + ')';
    request = encodeURI(request);
    this.vrHttp.invokeBeanMethod('core', request).subscribe(val => log(val));
  }

  changeLayoutSize() {
    this.layoutSize$.next();
  }

  onChangeLayoutSize(): Observable<any> {
    return this.layoutSize$.pipe(
      share(),
      delay(1),
    );
  }

  public findEntity(name: string, domain: any): any {
    return this.findNode({
      acceptNode: (n) => {
        return n.typeName === 'entity' && n.name === name;
      },
    }, domain.root);
  }

  public findField(entityName: string, fieldName: string, domain: any): any {
    const entity = this.findEntity(entityName, domain);
    if (entity != null) {
      return this.findNode({
        acceptNode: (n) => {
          return n.typeName === 'field' && n.name === fieldName;
        },
      }, entity);
    }
    return null;
  }

  public findNode(filter: VrNodeFilter, node: any): any {
    const all: any[] = this.findNodes(filter, node);
    if (all.length > 0) {
      return all[0];
    }
    return null;
  }

  public findNodes(filter: VrNodeFilter, node: any): any[] {
    const r: any[] = [];
    if (filter.acceptNode(node)) {
      log('accept findNodes ' + node.name + ' / ' + node.typeName);
      r.push(node);
    } else {
      log('fail to accept findNodes ' + node.name + ' / ' + node.typeName);
      if (node.children) {
        node.children.forEach((element) => {
          const rr = this.findNodes(filter, element);
          if (rr) {
            log('adding sub array ' + rr);
            log('\t ' + JSON.stringify(rr));
            rr.forEach((i) => {
              r.push(i);
            });
          }
        });
      }
    }
    return r;
  }

  public isCompositionEntity(name: string, domain: any): boolean {
    const entity: any = this.findEntity(name, domain);
    if (entity) {
      if (entity.compositionRelationship && entity.compositionRelationship === true) {
        return true;
      }
    } else {
      log('Entity Not found ' + name);
    }
    return false;
  }

  isAuthenticated(): Observable<boolean> {
    return Observable.of(this.authvalue);
  }

  public getEntityAutoFilters(entityName: string): Observable<any> {
    return this.vrHttp.invokeBeanMethod('core', `getEntityAutoFilters('${entityName}')`);
  }

  public getEntityAutoFilterValues(entityName: string, filterName: string): Observable<any> {
    return this.vrHttp.invokeBeanMethod('core', `getEntityAutoFilterValues('${entityName}', '${filterName}')`);
  }

  public findDocumentsByAutoFilter(entityName: string, filterName: any): Observable<any> {
    // return this.vrHttp.invokeBeanMethod('core', `findDocumentsByAutoFilter('${entityName}', '${filterName}', null, null)`);
    return this.vrHttp.invokeBeanMethod('core', 'findDocumentsByAutoFilter(\'' + entityName + '\','
      + JSON.stringify(filterName).split('"').join('\'').replace('{', '%7B').replace('}', '%7D') + ',' + null + ',' + null + ')');

  }

  public ui_rebuildMenu(domain: any): NbMenuItem[] {
    let r: NbMenuItem[] = [];
    r.push(
      {
        title: 'Accueil',
        icon: 'nb-home',
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
        icon: 'nb-locked',
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
          icon: 'nb-flame-circled',
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
          icon: 'nb-e-commerce',
          children: r,
        };
        switch (item.title) {
          case 'Administration':
            obj.icon = 'nb-gear';
            break;
          case 'Contacts':
            obj.icon = 'nb-person';
            break;
          case 'Social':
            obj.icon = 'nb-phone';
            break;
          case 'Sécurité':
            obj.icon = 'ion-key';
            break;
        }
        return obj;
      } else {
        return {
          title: item.title,
          icon: 'nb-locked',
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
        icon: 'nb-keypad',
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
          icon: 'nb-location',
          children: r
        };
      } else {
        return {
          title: item.title,
          icon: 'nb-location',
        };
      }
    }else{
      // alert('type  unknown ' + JSON.stringify(item) + " :: " + item.typeName);
      // log(JSON.stringify(item));
    }
    return null;
  }
}
