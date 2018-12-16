import { Component, OnInit } from '@angular/core';
import { ArdorAccountService } from 'app/shared/services/ardor/ardor-account.service';

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

  tasks = [{
    text: 'Lorem, ipsum dolor sit amet',
    status: 0
  }, {
    text: 'Lorem, ipsum dolor sit amet',
    status: 0
  }, {
    text: 'Lorem, ipsum dolor sit amet',
    status: 1
  }, {
    text: 'Lorem, ipsum dolor sit amet',
    status: 1
  }, {
    text: 'Lorem, ipsum dolor sit amet',
    status: 1
  }]

  /*balances = [{
    logo: 'assets/images/childchains/ardor_logo.jpg',
    name: 'Ardor',
    amount: 12564.23,
    lastTx: new Date('07/12/2017')
  }, {
    logo: 'assets/images/childchains/ignis_logo.jpg',
    name: 'Ignis',
    amount: 12561.25,
    lastTx: new Date('07/7/2017')
  }, {
    logo: 'assets/images/childchains/aeur_logo.jpg',
    name: 'Ardor Gate',
    amount: 6535.12,
    lastTx: new Date('04/10/2017')
  }, {
    logo: 'assets/images/childchains/bits_logo.jpg',
    name: 'Bitswift',
    amount: 1243.12,
    lastTx: new Date('07/7/2017')
  }, {
    logo: 'assets/images/childchains/mpg_logo.jpg',
    name: 'Max Property Group',
    amount: 4236.65,
    lastTx: new Date('04/10/2017')
  }];*/

  photos = [{
    name: 'Photo 1',
    url: 'assets/images/sq-15.jpg'
  }, {
    name: 'Photo 2',
    url: 'assets/images/sq-8.jpg'
  }, {
    name: 'Photo 3',
    url: 'assets/images/sq-9.jpg'
  }, {
    name: 'Photo 4',
    url: 'assets/images/sq-10.jpg'
  }, {
    name: 'Photo 5',
    url: 'assets/images/sq-11.jpg'
  }, {
    name: 'Photo 6',
    url: 'assets/images/sq-12.jpg'
  }]

  balances = [];
  
  constructor(private ardorAS: ArdorAccountService) { }

  ngOnInit() {
    this.balances = this.ardorAS.accBalances;
  }

}
