import { Injectable } from '@angular/core';
import {  map, switchMap } from 'rxjs/operators';

import { ArdorConfig } from '../../config/ardor.config';
import { Observable, timer } from 'rxjs';
import { ArdorAccountService } from './ardor-account.service';
import { ArdorTransaction } from 'app/shared/models/ardor.model';
import { ArdorService } from './ardor.service';

@Injectable()
export class ArdorContractService {
    public sendMessageBroadcasted: boolean;

    constructor(
        private ardorS: ArdorService,
        private ardrAS: ArdorAccountService) {

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
        this.ardorS.sendRequestWithMessage('sendMessage', msg, this.ardrAS.account.publicKey, passPhrase);
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
        this.ardorS.sendRequestWithMessage('sendMoney', msg, this.ardrAS.account.publicKey, passPhrase, 10 ** 8);
        return this.waitForContractResponse(broadcastTime);
    }

    private waitForContractResponse(broadcastTime): Observable<ArdorTransaction> {
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
