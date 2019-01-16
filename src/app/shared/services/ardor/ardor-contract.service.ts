import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse  } from '@angular/common/http';
import { catchError, map, takeUntil, switchMap } from 'rxjs/operators';

import { handleErrors } from './generic-methods';

import { ArdorConfig } from '../../config/ardor.config';
import { Observable, Subject, timer } from 'rxjs';
import { ArdorAccountService } from './ardor-account.service';
import { ArdorTransaction } from 'app/shared/models/ardor.model';

declare var require: any;
const ardorjs = require('ardorjs');

@Injectable()
export class ArdorContractService {
    public sendMessageBroadcasted: boolean;

    constructor(private http: HttpClient, private ardrAS: ArdorAccountService) {

    }


    generateToken(passPhrase: string, broadcastTime: number): Observable<ArdorTransaction> {
        // Message details to contract
        const msg = JSON.stringify({
            contract: ArdorConfig.IdVerifierContractName,
            params: {
                verificationType: 'publicAccount',
                requestType: 'getChallenge',
            }
        });
        this.sendRequestWithMessage('sendMessage', msg, passPhrase);
        return this.waitForContractResponse(broadcastTime);
    }

    verifyAccount(challengeText: string, signedToken: string, publicUrl: string,
        passPhrase: string, broadcastTime: number): Observable<ArdorTransaction> {
        // Send money with msg
        const msg = JSON.stringify({
            contract: ArdorConfig.IdVerifierContractName,
            params: {
                verificationType: 'publicAccount',
                requestType: 'verifyAccount',
                challenge: challengeText,
                signedToken: signedToken,
                externalSource: {
                    publicUrl: publicUrl
                }
            }
        });
        this.sendRequestWithMessage('sendMoney', msg, passPhrase, 10 ** 8);
        return this.waitForContractResponse(broadcastTime);
    }

    private sendRequestWithMessage(request: string, msg: string, passPhrase: string, amount: number = 0) {
        // Build query params
        const requestType = request;
        const data = new URLSearchParams({
            recipient: ArdorConfig.IdVerifierContractAdress,
            chain: '2',
            amountNQT: amount.toString(),
            message: msg,
            messageIsPrunable: 'true',
            publicKey: this.ardrAS.account.publicKey
        });
        this.getUnsignedBytes(requestType, data).subscribe(
            res => {
                if (res !== undefined && !res['errorDescription']) {
                    const unsignedTx = res['unsignedTransactionBytes'];
                    const attachment = res['transactionJSON']['attachment'];
                    const signedTx = this.verifyAndSign(unsignedTx, passPhrase, requestType, data);
                    if (signedTx !== 'error!') {
                        this.broadcastTransaction(signedTx, attachment).subscribe(
                            ress => {
                                if (ress !== undefined && ress['fullHash']) {
                                    this.sendMessageBroadcasted = true;
                                }else {
                                    this.sendMessageBroadcasted = false;
                                }
                            },
                            errr => { handleErrors('generateToken', null); }
                        );
                    } else {
                        this.sendMessageBroadcasted = false;
                    }
                } else {
                    this.sendMessageBroadcasted = false;
                }
            },
            err => { handleErrors('getUnsignedBytes', null); }
        );
    }
    private getUnsignedBytes(requestType: string, uri: URLSearchParams): Observable<object> {
        const headers = new HttpHeaders({'Content-Type': 'application/x-www-form-urlencoded'});
        const req = new URLSearchParams(uri);
        req.append('requestType', requestType);
        this.http.post(
            ArdorConfig.ApiUrl,
            req.toString(),
            {headers: headers}
        ).subscribe(
            res => {
                if (res !== undefined && !res['errorDescription']) {
                    req.append('feeNQT', res['minimumFeeFQT']);
                }else {
                    req.append('feeNQT', '100000000');
                }
            },
            err => { handleErrors('getUnsignedBytes', null); }
        );

        return this.http.post(
            ArdorConfig.ApiUrl,
            req.toString(),
            {headers: headers}
        );
    }
    private verifyAndSign(unsigned: string, passPhrase: string, request: string, txData: object): string {
        let txObj = {};
        txData.toString().replace(/([^=&]+)=([^&]*)/g, function(m, key, value){
            txObj[decodeURIComponent(key)] = decodeURIComponent(value);
            return '';
        });
        if (ardorjs.verifyTransactionBytes(unsigned, request, txObj, this.ardrAS.account.publicKey)) {
            return ardorjs.signTransactionBytes(unsigned, passPhrase);
        }else {
            return 'error!';
        }
    }
    private broadcastTransaction(txBytes: string, attachment: object = null): Observable<object> {
        const headers = new HttpHeaders({'Content-Type': 'application/x-www-form-urlencoded'});
        const uri = new URLSearchParams({
            requestType: 'broadcastTransaction',
            transactionBytes: txBytes
        });
        if (attachment !== null) {
            uri.append('prunableAttachmentJSON', JSON.stringify(attachment));
        }
        return this.http.post(
            ArdorConfig.ApiUrl,
            uri.toString(),
            {headers: headers}
        ).pipe(
            map(res => res),
            catchError(handleErrors('broadcastTransaction', null))
        );
    }
    private waitForContractResponse(broadcastTime): Observable<ArdorTransaction>{
        const received = this.ardrAS.getAccountReceivedTransactions(this.ardrAS.account.accountRS);
        const timer$ = timer(0, 4000);
        return timer$.pipe(
            switchMap(_ => received),
            map(
                res => {
                    const lastTx = res.sort(function(a, b){ return (b.timestamp - a.timestamp); })[0];
                    if (lastTx !== undefined
                        && lastTx.senderRS === ArdorConfig.IdVerifierContractAdress
                        && lastTx.timestamp >= broadcastTime
                        && lastTx.attachedMessage !== undefined) {
                            return lastTx;
                    }
                }
            )
        );
    }
}
