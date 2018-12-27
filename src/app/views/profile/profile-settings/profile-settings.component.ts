import { Component, OnInit } from '@angular/core';
import { FileUploader } from 'ng2-file-upload';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ArdorConfig } from 'app/shared/config/ardor.config';
import { ArdorAccountService } from 'app/shared/services/ardor/ardor-account.service';

@Component({
  selector: 'app-profile-settings',
  templateUrl: './profile-settings.component.html',
  styleUrls: ['./profile-settings.component.css']
})
export class ProfileSettingsComponent implements OnInit {
  tokenFormGroup: FormGroup;
  signingFormGroup: FormGroup;
  publishingFormGroup: FormGroup;

  public uploader: FileUploader = new FileUploader({ url: 'upload_url' });
  public hasBaseDropZoneOver = false;
  tokenValue: string;
  signedToken: string;
  isSigned = false;
  contractAccount: string;
  myAccount: string;
  publicUrl: string;
  minimalFee: number;

  constructor(
    private fb: FormBuilder,
    private ardorAS: ArdorAccountService) { }

  ngOnInit() {
    this.tokenValue = '';
    this.signedToken = '';
    this.contractAccount = ArdorConfig.IdVerifierContractAdress;
    this.myAccount = this.ardorAS.account.accountRS;
    this.publicUrl = '';
    this.minimalFee = ArdorConfig.PropertyFee;

    this.tokenFormGroup = this.fb.group({
      challengeToken: ['', Validators.required],
      contractAccount: [{value: this.contractAccount, disabled: true}, Validators.required]
    });
    this.signingFormGroup = this.fb.group({
      myAccount: [{value: this.myAccount, disabled: false}, Validators.required],
      challengeToken: [{value: this.tokenValue, disabled: true}, Validators.required],
      myPassphrase: ['', Validators.required],
      signedToken: ['', Validators.required],
    });
    this.publishingFormGroup = this.fb.group({
      myAccount: [{value: this.myAccount, disabled: true}, Validators.required],
      challengeToken: [{value: this.tokenValue, disabled: true}, Validators.required],
      signedToken: [{value: this.signedToken, disabled: true}, Validators.required],
      publicUrl: ['', Validators.required],
      propertyFee: [{value: this.minimalFee, disabled: false}, Validators.min(this.minimalFee)]
    });
  }

  public fileOverBase(e: any): void {
    this.hasBaseDropZoneOver = e;
  }

  getChallengeToken() {
    this.tokenValue = 'Hello World Token';
    this.tokenFormGroup.controls['challengeToken'].setValue(this.tokenValue);
  }

  signToken() {
    if ( this.signingFormGroup.controls['myPassphrase'].value !== undefined ) {
      this.signedToken = 'dfsdgfds';
      this.signingFormGroup.controls['signedToken'].setValue('dfsdgfds');
      this.isSigned = true;
    }
  }

  sendToContract() {
    console.log('Send to Contract');
  }

  submit(){
    console.log('submit button clicked');
  }
}
