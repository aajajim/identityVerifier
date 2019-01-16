import { Component, OnInit, ViewChild } from '@angular/core';
import { MatProgressBar, MatButton } from '@angular/material';
import { FileUploader } from 'ng2-file-upload';
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

  challengeText: string;
  tokenValue: string;
  signedToken: string;
  isSigned = false;
  contractAccount: string;
  myAccount: string;
  publicUrl: string;
  minimalFee: number;
  waitResponse = false;

  constructor(
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
      contractAccount: [{value: this.contractAccount, disabled: true}, Validators.required],
      myPassphrase: ['', Validators.required],
      challengeText: [{value: '', disabled: true}, Validators.required],
      challengeToken: [{value: '', disabled: true}, Validators.required]
    });
    this.signingFormGroup = this.fb.group({
      myAccount: [{value: this.myAccount, disabled: false}, Validators.required],
      challengeText: [{value: this.challengeText, disabled: true}, Validators.required],
      challengeToken: [{value: this.tokenValue, disabled: true}, Validators.required],
      myPassphrase: ['', Validators.required],
      signedToken: ['', Validators.required],
    });
    this.publishingFormGroup = this.fb.group({
      myAccount: [{value: this.myAccount, disabled: true}, Validators.required],
      challengeText: [{value: this.challengeText, disabled: true}, Validators.required],
      challengeToken: [{value: this.tokenValue, disabled: true}, Validators.required],
      signedToken: [{value: this.signedToken, disabled: true}, Validators.required],
      publicUrl: ['', Validators.required],
      propertyFee: [{value: this.minimalFee, disabled: false}, Validators.min(this.minimalFee)]
    });
  }

  getChallengeToken() {
    const errMsg = 'Error occured while requesting challenge, please try again!';
    const passphrase = this.tokenFormGroup.controls['myPassphrase'].value;
    const unsubscribe$ = new Subject<boolean>();
    if (passphrase) {
      this.waitResponse = true;
      this.appLoaderS.open('Please wait for contract response!');
      const now = new Date();
      const broadcastTime = Math.floor(now.getTime() / 1000 - now.getTimezoneOffset() * 60);
      this.ardorCS.generateToken(this.tokenFormGroup.controls['myPassphrase'].value, broadcastTime)
      .pipe(takeUntil(unsubscribe$))
      .subscribe(
        res => {
          if (res !== undefined) {
            this.challengeText = JSON.parse(res.attachedMessage).challenge;
            this.tokenValue = JSON.parse(res.attachedMessage).token;
            this.tokenFormGroup.controls['challengeText'].setValue(this.challengeText);
            this.tokenFormGroup.controls['challengeToken'].setValue(this.tokenValue);
            this.submitButton.disabled = true;
            this.appLoaderS.close();
            unsubscribe$.next(true);
          }
        },
        err => {
          this.tokenFormGroup.controls['challengeText'].setValue(errMsg);
          this.tokenFormGroup.controls['challengeToken'].setValue(errMsg);
          this.appLoaderS.close();
          this.submitButton.disabled = false;
        }
       );
    }
  }

  signToken() {
    if ( this.signingFormGroup.controls['myPassphrase'].value !== undefined ) {
      this.signedToken = ardorjs.signTransactionBytes(
        this.signingFormGroup.controls['challengeToken'].value,
        this.signingFormGroup.controls['myPassphrase'].value);
      this.signingFormGroup.controls['signedToken'].setValue(this.signedToken);
      this.isSigned = true;
      this.submitButton.disabled = true;
    }
  }

  sendToContract() {
    const passphrase = this.signingFormGroup.controls['myPassphrase'].value;
    const unsubscribe$ = new Subject<boolean>();
    if (passphrase) {
      this.appLoaderS.open('Please wait for contract response!');
      const now = new Date();
      const broadcastTime = Math.floor(now.getTime() / 1000 - now.getTimezoneOffset() * 60);
      this.ardorCS.verifyAccount(
        this.publishingFormGroup.controls['challengeText'].value,
        this.publishingFormGroup.controls['signedToken'].value,
        this.publishingFormGroup.controls['publicUrl'].value,
        passphrase,
        broadcastTime)
        .pipe(takeUntil(unsubscribe$))
        .subscribe(
          res => {
            if (res !== undefined) {
              const returnMsg = JSON.parse(res.attachedMessage).value;
              this.appLoaderS.close();
              this.appConfirmS.confirm({title: 'Contract Response', message: 'Congratulations, your account has been verified.' });
              unsubscribe$.next(true);
            }
          },
          err => {
            this.appLoaderS.close();
            this.appConfirmS.confirm({title: 'Contract Response', message: 'Sorry, something wrong went the verification, try again.' });
            this.submitButton.disabled = false;
          }
         );
      }
    }

  submit() {
    console.log('submit button clicked');
  }
}
