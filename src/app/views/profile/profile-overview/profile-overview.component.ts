import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ArdorAccountService } from 'app/shared/services/ardor/ardor-account.service';
import { ArdorBalance, ArdorProperty, ArdorTransaction } from 'app/shared/models/ardor.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile-overview',
  templateUrl: './profile-overview.component.html',
  styleUrls: ['./profile-overview.component.css']
})
export class ProfileOverviewComponent implements OnInit {
  transactions: Observable<Array<ArdorTransaction>>;
  balances: Observable<Array<ArdorBalance>>;
  verifiedAccounts: Observable<Array<ArdorProperty>>;

  constructor(
    private router: Router,
    private ardorAS: ArdorAccountService) { }

  ngOnInit() {
    if (this.ardorAS.account !== undefined ) {
      this.balances = this.ardorAS.accBalances;
      this.verifiedAccounts = this.ardorAS.accProps;
      this.transactions = this.ardorAS.accTransactions;
    }
  }

  deleteProperty(prop: ArdorProperty) {
    this.ardorAS.deleteProperty(prop);
  }

}
