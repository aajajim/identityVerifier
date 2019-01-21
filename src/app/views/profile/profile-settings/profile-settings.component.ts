import { Component, OnInit, ViewChild } from '@angular/core';
import { MatButton } from '@angular/material';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ArdorConfig } from 'app/shared/config/ardor.config';
import { ArdorAccountService } from 'app/shared/services/ardor/ardor-account.service';
import { ArdorContractService } from 'app/shared/services/ardor/ardor-contract.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import { AppConfirmService } from 'app/shared/services/app-confirm/app-confirm.service';

declare var require: any;
const ardorjs = require('ardorjs');

@Component({
  selector: 'app-profile-settings',
  templateUrl: './profile-settings.component.html',
  styleUrls: ['./profile-settings.component.css']
})
export class ProfileSettingsComponent implements OnInit {
  tokenFormGroup: FormGroup;
  signingFormGroup: FormGroup;
  publishingFormGroup: FormGroup;
  @ViewChild(MatButton) submitButton: MatButton;

  contractAccount: string;
  myAccount: string;
  passPhrase: string;
  challengeText: string;
  tokenValue: string;
  signedToken: string;
  isSigned = false;
  publicUrl: string;
  minimalFee: number;
  waitResponse = false;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private ardorAS: ArdorAccountService,
    private ardorCS: ArdorContractService,
    private appLoaderS: AppLoaderService,
    private appConfirmS: AppConfirmService) { }

  ngOnInit() {
    this.challengeText = '';
    this.tokenValue = '';
    this.signedToken = '';
    this.contractAccount = ArdorConfig.IdVerifierContractAdress;
    this.myAccount = this.ardorAS.account.accountRS;
    this.publicUrl = '';
    this.minimalFee = ArdorConfig.PropertyFee;

    this.tokenFormGroup = this.fb.group({
      contractAccount: Validators.required,
      myPassphrase: Validators.required,
      challengeText: Validators.required,
      challengeToken: Validators.required,
    });
    this.signingFormGroup = this.fb.group({
      myAccount: Validators.required,
      challengeText: Validators.required,
      challengeToken: Validators.required,
      myPassphrase: Validators.required,
      signedToken: Validators.required,
    });
    this.publishingFormGroup = this.fb.group({
      myAccount: Validators.required,
      challengeText: Validators.required,
      challengeToken: Validators.required,
      signedToken: Validators.required,
      publicUrl: Validators.required,
      propertyFee: Validators.min(this.minimalFee)
    });
  }

  getChallengeToken() {
    const errMsg = 'Error occured while requesting challenge, please try again!';
    this.passPhrase = this.tokenFormGroup.controls['myPassphrase'].value;
    const unsubscribe$ = new Subject<boolean>();
    if (this.passPhrase) {
      this.waitResponse = true;
      this.appLoaderS.open('Please wait for contract response!');
      const now = new Date();
      const broadcastTime = Math.floor(now.getTime() / 1000 - now.getTimezoneOffset() * 59);
      this.ardorCS.generateToken(this.passPhrase, broadcastTime)
      .pipe(takeUntil(unsubscribe$))
      .subscribe(
        res => {
          if (res !== undefined) {
            this.challengeText = JSON.parse(res.attachedMessage).challenge;
            this.tokenValue = JSON.parse(res.attachedMessage).token;
            this.submitButton.disabled = true;
            this.appLoaderS.close();
            unsubscribe$.next(true);
          }
        },
        err => {
          this.challengeText = errMsg;
          this.tokenValue = errMsg;
          this.appLoaderS.close();
          this.submitButton.disabled = false;
        }
       );
    }
  }

  signToken() {
    if ( this.passPhrase !== undefined ) {
      this.signedToken = ardorjs.signToken( this.tokenValue, this.passPhrase);
      this.signingFormGroup.controls['signedToken'].setValue(this.signedToken);
      this.isSigned = true;
      this.submitButton.disabled = true;
    }
  }

  sendToContract() {
    const unsubscribe$ = new Subject<boolean>();
    if (this.passPhrase) {
      this.appLoaderS.open('Please wait for contract response!');
      const now = new Date();
      const broadcastTime = Math.floor(now.getTime() / 1000 - now.getTimezoneOffset() * 59);
      this.submitButton.disabled = true;
      this.ardorCS.verifyAccount(
        this.challengeText,
        this.signedToken,
        this.publicUrl,
        this.passPhrase,
        broadcastTime)
        .pipe(takeUntil(unsubscribe$))
        .subscribe(
          res => {
            if (res !== undefined) {
              const returnMsg = JSON.parse(res.attachedMessage);
              this.appLoaderS.close();
              if (returnMsg['errorDescription']) {
                this.appConfirmS.confirm({title: 'Contract Response', message: returnMsg['errorDescription'] });
                this.router.navigate(['/profile/overview']);
              } else {
                this.ardorAS.clearCaches();
                this.appConfirmS.confirm({title: 'Contract Response', message: 'Congratulations, your account has been verified.' });
                this.router.navigate(['/profile/overview']);
              }
              unsubscribe$.next(true);
            }
          },
          err => {
            this.appLoaderS.close();
            this.appConfirmS.confirm({title: 'Contract Response', message: 'Sorry, something wrong went with the verification, try again.' });
            this.router.navigate(['/profile/overview']);
            this.submitButton.disabled = false;
          }
         );
      }
  }

  submit() {
    console.log('submit button clicked');
  }
}
