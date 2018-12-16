import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from "@angular/router";

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit {
  activeView : string = 'overview';

  constructor(private router: ActivatedRoute) { }

  ngOnInit() {
    this.activeView = this.router.snapshot.params['view'];
  }

}
