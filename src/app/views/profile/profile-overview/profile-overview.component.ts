import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ArdorAccountService } from 'app/shared/services/ardor/ardor-account.service';
import { ArdorBalance, ArdorProperty } from 'app/shared/models/ardor.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile-overview',
  templateUrl: './profile-overview.component.html',
  styleUrls: ['./profile-overview.component.css']
})
export class ProfileOverviewComponent implements OnInit {
  activityData = [{
    month: 'January',
    spent: 240,
    opened: 8,
    closed: 30
  }, {
    month: 'February',
    spent: 140,
    opened: 6,
    closed: 20
  }, {
    month: 'March',
    spent: 220,
    opened: 10,
    closed: 20
  }, {
    month: 'April',
    spent: 440,
    opened: 40,
    closed: 60
  }, {
    month: 'May',
    spent: 340,
    opened: 40,
    closed: 60
  }];

  balances: Observable<Array<ArdorBalance>>;
  verifiedAccounts: Observable<Array<ArdorProperty>>;

  constructor(
    private router: Router,
    private ardorAS: ArdorAccountService) { }

  ngOnInit() {
    if (this.ardorAS.account !== undefined ) {
      this.balances = this.ardorAS.accBalances;
      this.verifiedAccounts = this.ardorAS.accProps;
    }
  }

}
