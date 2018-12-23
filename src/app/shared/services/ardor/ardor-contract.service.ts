import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders, HttpResponse  } from '@angular/common/http';
import { catchError, map, tap, shareReplay } from 'rxjs/operators';

import { ArdorProperty, ArdorAccount, ArdorBalance } from '../../models/ardor.model';

import { ArdorConfig } from '../../config/ardor.config';

@Injectable()
export class ArdorContractService {

    constructor(private http: HttpClient) {

    }


    generateToken(): string {
        // Call the contract to receive a token
        return 'Hello Token';
    }

    verifyAccount(msg: JSON) {
        // Send money with msg
        const res = [];
        res.push('verified', 'true');
        res.push('domain', 'twitter.com');
        return res;
    }
}
