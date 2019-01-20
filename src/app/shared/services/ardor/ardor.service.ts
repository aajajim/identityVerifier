import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders  } from '@angular/common/http';
import { catchError, map, switchMap} from 'rxjs/operators';

import { ArdorConfig } from '../../config/ardor.config';
import { handleErrors } from './generic-methods';


declare var require: any;
const ardorjs = require('ardorjs');

@Injectable()
export class ArdorService {
    public sendMessageBroadcasted: boolean;

    constructor(private http: HttpClient) {}

    sendRequestWithMessage(request: string, msg: string, publicKey: string,  passPhrase: string, amount: number = 0) {
        // Build query params
        const requestType = request;
        const data = new URLSearchParams({
            recipient: ArdorConfig.IdVerifierContractAdress,
            chain: '2',
            amountNQT: amount.toString(),
            message: msg,
            messageIsPrunable: 'true',
            publicKey: publicKey
        });
        const unsignedBytesObs = this.getUnsignedBytes(requestType, data);
        if (unsignedBytesObs !== null){
            unsignedBytesObs.subscribe(
                res => {
                    if (res !== undefined && !res['errorDescription']) {
                        const unsignedTx = res['unsignedTransactionBytes'];
                        const attachment = res['transactionJSON']['attachment'];
                        const signedTx = this.verifyAndSign(unsignedTx, publicKey, passPhrase, requestType, data);
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
    }

    getUnsignedBytes(requestType: string, uri: URLSearchParams): Observable<object> {
        const headers = new HttpHeaders({'Content-Type': 'application/x-www-form-urlencoded'});
        const req = new URLSearchParams(uri);
        req.append('requestType', requestType);
        return this.http.post(
            ArdorConfig.ApiUrl,
            req.toString(),
            {headers: headers}
        ).pipe(
            map( res => res['minimumFeeFQT']),
            switchMap( miniFee => {
                if (miniFee !== null && miniFee !== undefined) {
                    req.append('feeNQT', miniFee);
                    return this.http.post(
                        ArdorConfig.ApiUrl,
                        req.toString(),
                        {headers: headers}
                    );
                }else{
                    return null;
                }
            }),
            catchError(handleErrors('getUnsignedBytes', null))
        );
    }

    verifyAndSign(unsigned: string, publicKey: string, passPhrase: string, request: string, txData: object): string {
        let txObj = {};
        txData.toString().replace(/([^=&]+)=([^&]*)/g, function(m, key, value){
            txObj[decodeURIComponent(key)] = decodeURIComponent(value);
            return '';
        });
        if (ardorjs.verifyTransactionBytes(unsigned, request, txObj, publicKey)) {
            return ardorjs.signTransactionBytes(unsigned, passPhrase);
        }else {
            return 'error!';
        }
    }
    broadcastTransaction(txBytes: string, attachment: object = null): Observable<object> {
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