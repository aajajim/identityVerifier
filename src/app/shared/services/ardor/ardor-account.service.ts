import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Http, Headers, Response  } from '@angular/http';
import { catchError, map, tap } from 'rxjs/operators';

import { ArdorProperty, ArdorAccount } from '../../models/ardor.model';

import { ArdorConfig } from '../../config/ardor.config';

@Injectable()
export class ArdorAccountService {

  public account: ArdorAccount;
  public accProps: Array<ArdorProperty>;

  constructor(private http: Http) { }


  //#region Ardor account queries
  getAccount(account: string) {
    // Build query params
    const uri = new URLSearchParams({
      requestType: 'getAccount',
      account: account
    });

    // Send request
    return this.http.post(
      ArdorConfig.ApiUrl,
      uri.toString(),
      {headers: this.getCommonHeaders()}
    ).pipe(
      map(res => res.json()),
      map(data => {
        this.account = new ArdorAccount(
          data.accountRS,
          data.account,
          data.publicKey,
          data.name,
          data.description,
          data.forgedBalanceFQT
        );
        return this.account;
      }),
      catchError(this.handleErrors)
    );
  }

  getAccountProperties(account: string, setBy: string= '') {
    // Build query params
    const uri = new URLSearchParams({
      requestType: 'getAccountProperties',
      recipient: account
    });

    // Send request
    return this.http.post(
      ArdorConfig.ApiUrl,
      uri.toString(),
      {headers: this.getCommonHeaders()}
    ).pipe(
      map(res => res.json()['properties']),
      map(data => {
        let props = new Array<ArdorProperty>();
        data.forEach(e => {
          props.push(new ArdorProperty(e.setterRS, e.setter, e.property, e.value));
        });
        this.accProps = props;
      }),
      catchError(this.handleErrors)
    );
  }

  //#endregion

  //#region Common Methods
  getCommonHeaders() {
    const headers = new Headers();
    headers.append('Content-Type', 'application/x-www-form-urlencoded');
    return headers;
  }

  handleErrors(error: Response) {
    console.log(JSON.stringify(error.json()));
    return Observable.throw(error);
  }
  //#endregion
}
