// @author vpc, vr auth ws
import {Observable} from 'rxjs/Observable';
import {Injectable} from '@angular/core';
import {log} from 'util';
import {Subject} from 'rxjs';
import {delay, share} from 'rxjs/operators';
import { VrHttp } from '../../core/service/vr.http';
import { VrSharedState } from '../../core/service/vr.shared-state';


/**
 * Http REST Client Service Implementation for Vain Ruling WebScript Services.
 * @author vpc (Taha BEN SALAH)
 * @version 1.0
 * @lastModified 2017-12-03
 */
@Injectable()
export class VrEduService {
  static INSTANCE: VrEduService;

  constructor(private model: VrSharedState, private vrHttp: VrHttp) {
    VrEduService.INSTANCE = this;
  }


  public getCurrentStudent(): Observable<any> {

    return this.vrHttp.invokeBeanMethod('academicPlugin', 'getCurrentStudent()');
  }

  public getAcademicStudentCv(studentId): Observable<any> {
    const url = 'findOrCreateAcademicStudentCV(' + studentId + ')';
    return this.vrHttp.invokeBeanMethod('academicProfile', url);
  }

  public getCurrentStudentContacts(studentId): Observable<any> {
    return this.vrHttp.invokeBeanMethod('core', `getContact()`);
  }

}
