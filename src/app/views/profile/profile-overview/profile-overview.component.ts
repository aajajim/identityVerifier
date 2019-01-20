import { Component, OnInit } from '@angular/core';
import { MatDialogRef, MatDialog, MatSnackBar } from '@angular/material';
import { Observable } from 'rxjs';
import { ArdorAccountService } from 'app/shared/services/ardor/ardor-account.service';
import { ArdorBalance, ArdorProperty, ArdorTransaction } from 'app/shared/models/ardor.model';
import { Router } from '@angular/router';
import { DeletePropertyPopupComponent } from './delete-property-popup/delete-property-popup.component';

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
    private ardorAS: ArdorAccountService,
    private dialog: MatDialog) { }

  ngOnInit() {
    if (this.ardorAS.account !== undefined ) {
      this.balances = this.ardorAS.accBalances;
      this.verifiedAccounts = this.ardorAS.accProps;
      this.transactions = this.ardorAS.accTransactions;
    }
  }

  openDeletePropertyPopUp(prop: ArdorProperty) {
    const title = 'Delete Validated Account';
    const dialogRef: MatDialogRef<any> = this.dialog.open(DeletePropertyPopupComponent, {
      width: '720px',
      disableClose: true,
      data: { title: title, payload: prop }
    });
    dialogRef.afterClosed()
      .subscribe(
        res => {
          if (!res) {
            // If user press cancel
            return;
          }
          this.ardorAS.deleteAccountProperty(prop, res.passPhrase);
          this.router.navigate(['/profile/overview']);
        },
        err => {}
      );
  }
}
