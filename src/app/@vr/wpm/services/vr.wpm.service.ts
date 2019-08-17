// @author vpc, vr auth ws
import {Observable} from 'rxjs/Observable';
import {Injectable} from '@angular/core';
import {log} from 'util';
import {Subject} from 'rxjs';
import {delay, share} from 'rxjs/operators';
import { VrSharedState } from '../../core/services/vr.shared-state';
import { VrHttp } from '../../core/services/vr.http';


/**
 * Http REST Client Service Implementation for Vain Ruling WebScript Services.
 * @author vpc (Taha BEN SALAH)
 * @version 1.0
 * @lastModified 2017-12-03
 */
@Injectable()
export class VrWpmService {
  static INSTANCE: VrWpmService;

  public authvalue = false;
  protected layoutSize$ = new Subject();

  constructor(private model: VrSharedState, private vrHttp: VrHttp) {
    VrWpmService.INSTANCE = this;
  }

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


  // public getTest(): Observable<any> {
  //   return this.vrHttp.invokeBeanMethod('wpmCore',  `findDocumentsByAutoFilter('AppBank','')`);
  // }
  public getTest(): Observable<any> {
    return this.vrHttp.invokeBeanMethod('wpmCore',
      `getValues('Select sum(deposit.value) From PrDeposit deposit Where deposit.loan.id=1')`);
  }

  public getDepositById(id: string): Observable<any> {
    // alert(id)
    return this.vrHttp.invokeBeanMethod('wpmCore',
      'getValues(\'Select deposit From PrDeposit deposit Where deposit.loan.employee.id=' +
      id +
      '\')');
  }

  public getDataBulletinSalary(id: string): Observable<any> {
    return this.vrHttp.invokeBeanMethod('wpmCore',
      'getDataBulletinSalary(' + id + ')');
  }

}
