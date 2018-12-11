import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Http, Headers, Response  } from '@angular/http';
import { catchError, map, tap } from 'rxjs/operators';

import { ArdorConfig } from '../../config/ardor.config';

@Injectable()
export class ArdorAccountService {

  constructor(private http: Http) { }


  //#region Ardor account queries
  getAccountProperties(account: string, setBy: string= '') {
    return this.http.post(
      ArdorConfig.ApiUrl,
      JSON.stringify({
        requestType: 'getAccountProperties',
        recipient: account
      }),
      {headers: this.getCommonHeaders()}
    ).pipe(
      catchError(this.handleErrors)
    );
  }

  //#endregion

  //#region Common Methods
  getCommonHeaders() {
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return headers;
  }

  handleErrors(error: Response) {
    console.log(JSON.stringify(error.json()));
    return Observable.throw(error);
  }
  //#endregion
}
