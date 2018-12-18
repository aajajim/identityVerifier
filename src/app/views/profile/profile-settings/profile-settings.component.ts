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

  public uploader: FileUploader = new FileUploader({ url: 'upload_url' });
  public hasBaseDropZoneOver = false;
  tokenValue: string;
  signedToken: string;
  isSigned: boolean = false;
  contractAccount: string;
  myAccount: string;

  constructor(
    private fb: FormBuilder,
    private ardorAS: ArdorAccountService) { }

  ngOnInit() {
    this.tokenValue = '';
    this.signedToken = '';
    this.contractAccount = ArdorConfig.IdVerfierContract;
    this.myAccount = this.ardorAS.account.accountRS;
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
  }

  public fileOverBase(e: any): void {
    this.hasBaseDropZoneOver = e;
  }

  getChallengeToken() {
    this.tokenValue = 'Hello World Token';
    this.tokenFormGroup.controls['challengeToken'].setValue(this.tokenValue);
  }

  signToken(){

  }
}
