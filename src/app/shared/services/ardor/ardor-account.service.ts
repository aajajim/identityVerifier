import { Injectable } from '@angular/core';
import { Observable, of, concat } from 'rxjs';
import { HttpClient, HttpHeaders  } from '@angular/common/http';
import { catchError, map, shareReplay, switchMap  } from 'rxjs/operators';
import { timer } from 'rxjs/observable/timer';

import { ArdorProperty, ArdorAccount, ArdorBalance, ArdorTransaction } from '../../models/ardor.model';

import { ArdorConfig } from '../../config/ardor.config';

const BUFFER_ZISE = 1;
const REFRESH_INTERVAL = 10000;

@Injectable()
export class ArdorAccountService {

  //#region  Caches
  public account: ArdorAccount;
  private accPropsCache: Observable<Array<ArdorProperty>>;
  private accBalancesCache: Observable<Array<ArdorBalance>>;
  private accTransactionsCache: Observable<Array<ArdorTransaction>>;
  //#endregion

  //#region Properties
  get accProps(){
    if (!this.accPropsCache) {
      this.accPropsCache = this.getAccountProperties(this.account.accountRS).pipe(shareReplay(BUFFER_ZISE));
    }
    return this.accPropsCache;
  }

  get accBalances(){
    if (!this.accBalancesCache) {
      this.accBalancesCache = this.getAccountBalances(this.account.accountRS).pipe(shareReplay(BUFFER_ZISE));
    }
    return this.accBalancesCache;
  }
  get accTransactions(){
    if (!this.accTransactionsCache) {
      /*const timer$ = timer(0, REFRESH_INTERVAL);
      this.accTransactionsCache = timer$.pipe(
        switchMap(_ => this.getAccountTransactions(this.account.accountRS)),
        shareReplay(BUFFER_ZISE)
      );*/
      this.accTransactionsCache = this.getAccountTransactions(this.account.accountRS).pipe(shareReplay(BUFFER_ZISE));
    }
    return this.accTransactionsCache;
  }
  //#endregion

  constructor(private http: HttpClient) { }

  //#region Ardor account queries
  getAccount(account: string): Observable<ArdorAccount> {
    // Build query params
    const uri = new URLSearchParams({
      requestType: 'getAccount',
      account: account
    });
    const headers = new HttpHeaders({'Content-Type': 'application/x-www-form-urlencoded'});

    // Send request
    return this.http.post<ArdorAccount>(
      ArdorConfig.ApiUrl,
      uri.toString(),
      {headers: headers}
    ).pipe(
      map(res => {
        this.account = <ArdorAccount>res;
        return this.account;
      }),
      catchError(this.handleErrors<ArdorAccount>('getArdorAccount', null))
    );
  }

  getAccountProperties(account: string): Observable<Array<ArdorProperty>> {
    // Build query params
    // setter: ArdorConfig.IdVerfierContract
    const uri = new URLSearchParams({
      requestType: 'getAccountProperties',
      recipient: account
    });
    const headers = new HttpHeaders({'Content-Type': 'application/x-www-form-urlencoded'});

    // Send request
    return this.http.post<Array<ArdorProperty>>(
      ArdorConfig.ApiUrl,
      uri.toString(),
      {headers: headers}
    ).pipe(
      map(res => res['properties'].map(e => new ArdorProperty(e))),
      catchError(this.handleErrors<Array<ArdorProperty>>('getAcccountProperties', []))
    );
  }

  getAccountBalances(account: string): Observable<Array<ArdorBalance>> {
    // Build query params
    const uri = new URLSearchParams({
      requestType: 'getBalances',
      account: account,
      chain: '1'
    });
    uri.append('chain', '2');
    uri.append('chain', '3');
    uri.append('chain', '4');
    uri.append('chain', '5');
    const headers = new HttpHeaders({'Content-Type': 'application/x-www-form-urlencoded'});

    // Send request
    return this.http.post<Array<ArdorBalance>>(
      ArdorConfig.ApiUrl,
      uri.toString(),
      {headers: headers}
    ).pipe(
      map(res => Object.keys(res['balances']).map(key => new ArdorBalance(key, res['balances'][key]))),
      catchError(this.handleErrors<Array<ArdorBalance>>('getAccountBalances', []))
    );
  }

  getAccountTransactions(account: string): Observable<Array<ArdorTransaction>> {
    // Build query params
    // setter: ArdorConfig.IdVerfierContract
    const headers = new HttpHeaders({'Content-Type': 'application/x-www-form-urlencoded'});

    // Send request
    let uri = new URLSearchParams({
      requestType: 'getExecutedTransactions',
      chain: '2',
      recipient: account
    });
    const received = this.http.post<Array<ArdorTransaction>>(
      ArdorConfig.ApiUrl,
      uri.toString(),
      {headers: headers}
    ).pipe(
      map(res => res['transactions'].map(e => new ArdorTransaction(e))),
      catchError(this.handleErrors<Array<ArdorTransaction>>('getAcccountTransactions', []))
    );
    // Received request
    uri = new URLSearchParams({
      requestType: 'getExecutedTransactions',
      chain: '2',
      sender: account
    });
    const sent = this.http.post<Array<ArdorTransaction>>(
      ArdorConfig.ApiUrl,
      uri.toString(),
      {headers: headers}
    ).pipe(
      map(res => res['transactions'].map(e => new ArdorTransaction(e))),
      catchError(this.handleErrors<Array<ArdorTransaction>>('getAcccountTransactions', []))
    );
    return concat(received, sent);
  }
  //#endregion

  //#region Common Methods
  getCommonHeaders() {
    const headers = new HttpHeaders({'Content-Type': 'application/x-www-form-urlencoded'});
    return headers;
  }

  /**
   * Handle Http operation that failed.
   * Let the app continue.
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  private handleErrors<T> (operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // TODO: better job of transforming error for user consumption
      console.log(`${operation} failed: ${error.message}`);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

  clearCaches() {
    this.accBalancesCache = null;
    this.accPropsCache = null;
  }
  //#endregion
}
