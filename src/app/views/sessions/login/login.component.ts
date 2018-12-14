import { Component, OnInit, ViewChild } from '@angular/core';
import { MatProgressBar, MatButton } from '@angular/material';
import { Validators, FormGroup, FormControl } from '@angular/forms';
import { Router } from '@angular/router';

import { ArdorAccountService } from '../../../shared/services/ardor/ardor-account.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  @ViewChild(MatProgressBar) progressBar: MatProgressBar;
  @ViewChild(MatButton) submitButton: MatButton;

  errorOnAccount: boolean;
  loginForm: FormGroup;

  constructor(
    private ardrAS: ArdorAccountService,
    private router: Router) { }

  ngOnInit() {
    this.errorOnAccount = false;
    this.loginForm = new FormGroup({
      ardrAccount: new FormControl('', Validators.required),
      rememberMe: new FormControl(false)
    });
  }

  login() {
    // Visual effect
    this.errorOnAccount = false;
    this.submitButton.disabled = true;
    this.progressBar.mode = 'indeterminate';

    // Get account details from ardor server
    const loginData = this.loginForm.value;
    const acc = loginData['ardrAccount'];
    this.ardrAS.getAccount(acc).subscribe(
      (res) => {
        if (res.publicKey !== 'undefined') {
          this.router.navigate(['/others']);
        }else {
          this.loginForm.reset();
          this.errorOnAccount = true;
          this.submitButton.disabled = false;
          this.progressBar.mode = 'determinate';
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }


  //TODO: add ardor account validator
}
