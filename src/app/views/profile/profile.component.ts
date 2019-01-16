import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from "@angular/router";

import { ArdorAccountService } from '../../shared/services/ardor/ardor-account.service';
import { ArdorAccount } from '../../shared/models/ardor.model';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit {
  activeView = 'overview';
  profileAccount: ArdorAccount;

  constructor(private router: ActivatedRoute, private ardorAS: ArdorAccountService) { }

  ngOnInit() {
    this.activeView = this.router.snapshot.params['view'];
    this.profileAccount = this.ardorAS.account;
  }

}
