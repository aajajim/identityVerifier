import { Component, OnInit, ViewChild } from '@angular/core';
import { MatProgressBar, MatButton } from '@angular/material';
import { Validators, FormGroup, FormControl } from '@angular/forms';

import { ArdorAccountService } from '../../../shared/services/ardor/ardor-account.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  providers: [ArdorAccountService]
})
export class LoginComponent implements OnInit {
  @ViewChild(MatProgressBar) progressBar: MatProgressBar;
  @ViewChild(MatButton) submitButton: MatButton;

  loginForm: FormGroup;

  constructor(private ardrAS: ArdorAccountService) { }

  ngOnInit() {
    this.loginForm = new FormGroup({
      ardrAccount: new FormControl('', Validators.required),
      rememberMe: new FormControl(false)
    });
  }

  login() {
    let props: any;
    const loginData = this.loginForm.value;
    console.log(loginData);

    const acc = loginData['ardrAccount'];
    this.ardrAS.getAccountProperties(acc).subscribe(
      (res) => {
        props = res;
        console.log(props);
      },
      (err) => {
        console.log(err);
      }
    );
    this.submitButton.disabled = true;
    this.progressBar.mode = 'indeterminate';
  }


  //TODO: add ardor account validator
}
