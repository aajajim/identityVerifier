import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse  } from '@angular/common/http';
import { catchError, map, tap, shareReplay } from 'rxjs/operators';

import { handleErrors } from './generic-methods';

import { ArdorConfig } from '../../config/ardor.config';
import { Observable } from 'rxjs';
import { ArdorAccountService } from './ardor-account.service';
import { ArdorTransaction } from 'app/shared/models/ardor.model';

declare var require: any;
const ardorjs = require('ardorjs');

@Injectable()
export class ArdorContractService {

    constructor(private http: HttpClient, private ardrAS: ArdorAccountService) {

    }


    generateToken(passPhrase: string): Observable<Array<ArdorTransaction>> {
        // Message details to contract
        const msg = JSON.stringify({
            contract: ArdorConfig.IdVerifierContractName,
            params: {
                verificationType: 'publicAccount',
                requestType: 'getChallenge',
            }
        });
        // Build query params
        const requestType = 'sendMessage';
        const data = new URLSearchParams({
            recipient: ArdorConfig.IdVerifierContractAdress,
            chain: '2',
            message: msg,
            messageIsPrunable: 'true',
            publicKey: this.ardrAS.account.publicKey,
            amountNQT: '0'
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
                                if (ress === undefined || !ress['fullHash']) {
                                    return 'Error occured while broadcasting transaction, please try again!';
                                }else {
                                    return this.ardrAS.accIncomingTransactions;
                                }
                            },
                            errr => { handleErrors('generateToken', null); }
                        );
                    }
                }
                return null;
            },
            err => { handleErrors('getUnsignedBytes', null); }
        );
        return null;
    }

    verifyAccount(msg: JSON) {
        // Send money with msg
        const res = [];
        res.push('verified', 'true');
        res.push('domain', 'twitter.com');
        return res;
    }

    private getUnsignedBytes(requestType: string, uri: URLSearchParams): Observable<object> {
        const headers = new HttpHeaders({'Content-Type': 'application/x-www-form-urlencoded'});
        const req = new URLSearchParams(uri);
        req.append('requestType', requestType);
        req.append('broadcast', 'false');
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
        ).unsubscribe();

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
}
