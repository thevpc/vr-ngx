// @author vpc, vr auth ws
import {Observable} from 'rxjs/Observable';

import {Injectable} from '@angular/core';
import {VrService} from './vr.service';
import {NbAuthResult, NbPasswordAuthStrategy} from '@nebular/auth';
import {HttpClient} from '@angular/common/http';
import {ActivatedRoute} from '@angular/router';
import {NbAuthStrategyClass} from '@nebular/auth/auth.options';
import {NbAuthStrategy} from '@nebular/auth/strategies';
import {NbAuthStrategyOptions} from '@nebular/auth/strategies/auth-strategy-options';
import {NbPasswordAuthStrategyOptions} from '@nebular/auth/strategies/password/password-strategy-options';


// export declare class VrAuthStrategyOptions extends NbAuthStrategyOptions {
// }
@Injectable()
export class VrAuthProvider extends NbAuthStrategy {

  static setup(): [ NbAuthStrategyClass, NbPasswordAuthStrategyOptions] {
    return [
      VrAuthProvider,
      {name: 'email'} ,
    ];
  }

  constructor(private vrService: VrService, http: HttpClient, route: ActivatedRoute) {
    super();
  }

  refreshToken(data?: any): Observable<NbAuthResult> {
    return Observable.of(new NbAuthResult(false, undefined, undefined, undefined));
  }


  authenticate(data?: any): Observable<NbAuthResult> {
    return this.vrService.authenticate(data.email, data.password)
      .map(currentUser => {
        if (currentUser && currentUser.connected) {
          return new NbAuthResult(true, this.createSuccessResponse(currentUser), '/', ['Successfully logged in.']);
        } else {
          return new NbAuthResult(false, this.createFailResponse(data), null, ['Something went wrong.']);
        }
      });

    // , err => {
    //     alert('ERR : ' + JSON.stringify(err.json()));
    //   }
  }

  register(data?: any): Observable<NbAuthResult> {
    const nbAuthResultOk = new NbAuthResult(true, this.createSuccessResponse(data), '/', ['Successfully logged in.']);
    return Observable.of(nbAuthResultOk);
  }

  requestPassword(data?: any): Observable<NbAuthResult> {
    const nbAuthResultOk = new NbAuthResult(true, this.createSuccessResponse(data), '/', ['Successfully logged in.']);
    return Observable.of(nbAuthResultOk);
  }

  resetPassword(data?: any): Observable<NbAuthResult> {
    const nbAuthResultOk = new NbAuthResult(true, this.createSuccessResponse(data), '/', ['Successfully logged in.']);
    return Observable.of(nbAuthResultOk);
  }

  logout(data?: any): Observable<NbAuthResult> {
    return this.vrService.logout().map(res => new NbAuthResult(true, this.createSuccessResponse(data), '/', ['Successfully logged out.']));
  }

  protected createDummyResult(data?: any): NbAuthResult {
    const nbAuthResultOk = new NbAuthResult(true, this.createSuccessResponse(data), '/', ['Successfully logged in.']);
    return (nbAuthResultOk);
  }

}
