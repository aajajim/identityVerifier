import { Component, OnInit, Input } from '@angular/core';
import { ArdorAccount } from 'app/shared/models/ardor.model';
import { ArdorAccountService } from 'app/shared/services/ardor/ardor-account.service';

@Component({
  selector: 'app-ardor-account',
  templateUrl: './app-ardor-account.component.html',
  styleUrls: ['./app-ardor-account.component.css']
})
export class AppArdorAccountComponent implements OnInit {
  photoUrl: string; 
  account: ArdorAccount;

  constructor(private ardorAS: ArdorAccountService) {
  }

  ngOnInit() {
    this.account = this.ardorAS.account;
    console.log(this.ardorAS.account);
  }

}
