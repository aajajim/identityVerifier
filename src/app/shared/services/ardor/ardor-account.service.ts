import { Injectable } from '@angular/core';
import { Observable, of, concat, combineLatest } from 'rxjs';
import { HttpClient, HttpHeaders  } from '@angular/common/http';
import { catchError, map, shareReplay, switchMap  } from 'rxjs/operators';
import { timer } from 'rxjs/observable/timer';

import { ArdorProperty, ArdorAccount, ArdorBalance, ArdorTransaction } from '../../models/ardor.model';

import { ArdorConfig } from '../../config/ardor.config';
import { handleErrors } from './generic-methods';
import { ArdorService } from './ardor.service';


const BUFFER_ZISE = 1;
const REFRESH_INTERVAL = 30000;

@Injectable()
export class ArdorAccountService {

  //#region  Caches
  public account: ArdorAccount;
  private accPropsCache: Observable<Array<ArdorProperty>>;
  private accBalancesCache: Observable<Array<ArdorBalance>>;
  private accTransactionsCache: Observable<Array<ArdorTransaction>>;
  private accIncomingTransactionsCache: Observable<Array<ArdorTransaction>>;
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
      const timer$ = timer(0, REFRESH_INTERVAL);
      const rec = this.getAccountReceivedTransactions(this.account.accountRS);
      const send = this.getAccountSentTransactions(this.account.accountRS);
      this.accTransactionsCache = timer$.pipe(
        switchMap(_ => concat(rec, send)
            .pipe( map(res => res.sort(function(a, b) { return (b.timestamp - a.timestamp); } )))
        ),
        shareReplay(BUFFER_ZISE)
      );
    }
    return this.accTransactionsCache;
  }

  get accIncomingTransactions(){
    if (!this.accIncomingTransactionsCache) {
      const timer$ = timer(0, REFRESH_INTERVAL);
      this.accIncomingTransactionsCache = timer$.pipe(
        switchMap(_ => this.getAccountUnconfirmedTransactions(this.account.accountRS, true)),
        shareReplay(BUFFER_ZISE)
      );
    }
    return this.accIncomingTransactionsCache;
  }
  //#endregion

  constructor(private http: HttpClient, private ardorS: ArdorService) { }

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
      catchError(handleErrors<ArdorAccount>('getArdorAccount', null))
    );
  }

  getAccountProperties(account: string): Observable<Array<ArdorProperty>> {
    // Build query params
    const uri = new URLSearchParams({
      requestType: 'getAccountProperties',
      recipient: account,
      setter: ArdorConfig.IdVerifierContractAdress
    });
    const headers = new HttpHeaders({'Content-Type': 'application/x-www-form-urlencoded'});

    // Send request
    return this.http.post<Array<ArdorProperty>>(
      ArdorConfig.ApiUrl,
      uri.toString(),
      {headers: headers}
    ).pipe(
      map(res => res['properties'].filter(res => JSON.parse(JSON.stringify(res)).property.includes('verifiedAccount'))
                                  .map(e => new ArdorProperty(account, ArdorConfig.IdVerifierContractAdress, e))),
      catchError(handleErrors<Array<ArdorProperty>>('getAcccountProperties', []))
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
      catchError(handleErrors<Array<ArdorBalance>>('getAccountBalances', []))
    );
  }

  getAccountSentTransactions(account: string): Observable<Array<ArdorTransaction>> {
    // Build query params
    // setter: ArdorConfig.IdVerfierContract
    const headers = new HttpHeaders({'Content-Type': 'application/x-www-form-urlencoded'});

    // Send request
    let uri = new URLSearchParams({
      requestType: 'getExecutedTransactions',
      chain: '2',
      sender: account
    });
    return this.http.post<Array<ArdorTransaction>>(
      ArdorConfig.ApiUrl,
      uri.toString(),
      {headers: headers}
    ).pipe(
      map(res => res['transactions'].map(e => new ArdorTransaction(e))),
      catchError(handleErrors<Array<ArdorTransaction>>('getAcccountTransactions', []))
    );
  }

  getAccountReceivedTransactions(account: string): Observable<Array<ArdorTransaction>> {
    // Build query params
    // setter: ArdorConfig.IdVerfierContract
    const headers = new HttpHeaders({'Content-Type': 'application/x-www-form-urlencoded'});

    // Receive request
    let uri = new URLSearchParams({
      requestType: 'getExecutedTransactions',
      chain: '2',
      recipient: account
    });
    return this.http.post<Array<ArdorTransaction>>(
      ArdorConfig.ApiUrl,
      uri.toString(),
      {headers: headers}
    ).pipe(
      map(res => res['transactions'].map(e => new ArdorTransaction(e))),
      catchError(handleErrors<Array<ArdorTransaction>>('getAcccountTransactions', []))
    );
  }

  getAccountUnconfirmedTransactions(account: string, isIncomingOnly: boolean): Observable<Array<ArdorTransaction>> {
    // Build query params
    // setter: ArdorConfig.IdVerfierContract
    const headers = new HttpHeaders({'Content-Type': 'application/x-www-form-urlencoded'});

    // Receive request
    let uri = new URLSearchParams({
      requestType: 'getUnconfirmedTransactions',
      chain: '2',
      account: account
    });
    return this.http.post<Array<ArdorTransaction>>(
      ArdorConfig.ApiUrl,
      uri.toString(),
      {headers: headers}
    ).pipe(
      map(res => res['unconfirmedTransactions'].map(e => {
        if (isIncomingOnly && e['recipientRS'] === account) { new ArdorTransaction(e); }
        })
      ),
      catchError(handleErrors<Array<ArdorTransaction>>('getAcccountTransactions', []))
    );
  }

  deleteAccountProperty(prop: ArdorProperty, passPhrase: string) {
    const requestType = 'deleteAccountProperty';
    const data = new URLSearchParams({
      chain: '2',
      amountNQT: '0',
      recipient: this.account.accountRS,
      setter: prop.setter,
      property: prop.property,
      publicKey: this.account.publicKey
    });
    this.ardorS.getUnsignedBytes(requestType, data).subscribe(
      res => {
          if (res !== undefined && !res['errorDescription']) {
              const unsignedTx = res['unsignedTransactionBytes'];
              const attachment = res['transactionJSON']['attachment'];
              const signedTx = this.ardorS.verifyAndSign(unsignedTx, this.account.publicKey, passPhrase, requestType, data);
              if (signedTx !== 'error!') {
                  this.ardorS.broadcastTransaction(signedTx, attachment).subscribe(
                      ress => {
                          this.clearCaches();
                          return (ress !== undefined && ress['fullHash']);
                      },
                      errr => { handleErrors('generateToken', null); }
                  );
              }
          }
      },
      err => { handleErrors('getUnsignedBytes', null); }
  );
  }
  //#endregion

  //#region Common Methods
  getCommonHeaders() {
    const headers = new HttpHeaders({'Content-Type': 'application/x-www-form-urlencoded'});
    return headers;
  }
  clearCaches() {
    this.accBalancesCache = null;
    this.accPropsCache = null;
  }
  //#endregion
}
