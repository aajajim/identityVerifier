import { Component, OnInit } from '@angular/core';
import { FileUploader } from 'ng2-file-upload';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ArdorConfig } from 'app/shared/config/ardor.config';
import { ArdorAccountService } from 'app/shared/services/ardor/ardor-account.service';
import { ArdorContractService } from 'app/shared/services/ardor/ardor-contract.service';

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
  waitResponse = false;

  constructor(
    private fb: FormBuilder,
    private ardorAS: ArdorAccountService,
    private ardorCS: ArdorContractService) { }

  ngOnInit() {
    this.tokenValue = '';
    this.signedToken = '';
    this.contractAccount = ArdorConfig.IdVerifierContractAdress;
    this.myAccount = this.ardorAS.account.accountRS;
    this.publicUrl = '';
    this.minimalFee = ArdorConfig.PropertyFee;

    this.tokenFormGroup = this.fb.group({
      contractAccount: [{value: this.contractAccount, disabled: true}, Validators.required],
      challengeToken: [{value: '', disabled: true}, Validators.required],
      myPassphrase: ['', Validators.required]
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
    const errMsg = 'Error occured while requesting challenge, please try again!';
    let responeJson: JSON;
    const passphrase = this.tokenFormGroup.controls['myPassphrase'].value;
    if (passphrase) {
      this.waitResponse = true;
      this.ardorCS.generateToken(this.tokenFormGroup.controls['myPassphrase'].value).subscribe(
        r => {
            console.log(r);
            if (r.length > 0 && r[0].senderRS === ArdorConfig.IdVerifierContractAdress && r[0].attachment !== null) {
              responeJson = r[0].attachedMessage;
              this.waitResponse = false;
            }
        },
        e => { responeJson = undefined; }
      );
      this.tokenValue = (responeJson !== undefined) ? responeJson[ArdorConfig.ApiChallengeToken] : errMsg;
      this.tokenFormGroup.controls['challengeToken'].setValue(this.tokenValue);
    }
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
