import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Http, Headers, Response  } from '@angular/http';
import { catchError, map, tap } from 'rxjs/operators';

import { ArdorProperty, ArdorAccount, ArdorBalance } from '../../models/ardor.model';

import { ArdorConfig } from '../../config/ardor.config';

@Injectable()
export class ArdorAccountService {

  public account: ArdorAccount;
  public accProps: Array<ArdorProperty>;
  private _accBalances: Array<ArdorBalance> = null;
  get accBalances(): Array<ArdorBalance>{
    if (this._accBalances === null && this.account !== null) {
      this.getAccountBalances(this.account.accountRS).subscribe(
        (res) => { return; },
        (err) => { console.log(err); }
      );
    }else {
      return this._accBalances;
    }
  }
  set accBalances(value: Array<ArdorBalance>) {
    this._accBalances = value;
  }

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
        let props = [];
        data.forEach(e => {
          props.push(new ArdorProperty(e.setterRS, e.setter, e.property, e.value));
        });
        this.accProps = props;
      }),
      catchError(this.handleErrors)
    );
  }

  getAccountBalances(account: string) {
    // Build query params
    const uri = new URLSearchParams({
      requestType: 'getBalances',
      account: account,
      chain: '1'
    });
    // Send request
    return this.http.post(
      ArdorConfig.ApiUrl,
      uri.toString(),
      {headers: this.getCommonHeaders()}
    ).pipe(
      map(res => {
        return res.json()['balances'];
      }),
      map(data => {
        let props = [];
        Object.keys(data).forEach(key => {
          props.push(new ArdorBalance(key, data[key]['balanceNQT']));
        });
        this._accBalances = props;
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
