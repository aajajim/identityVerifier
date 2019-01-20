import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ArdorProperty } from 'app/shared/models/ardor.model';

@Component({
  selector: 'app-delete-property-popup',
  templateUrl: './delete-property-popup.component.html'
})
export class DeletePropertyPopupComponent implements OnInit {
  public itemForm: FormGroup;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<DeletePropertyPopupComponent>,
    private fb: FormBuilder,
  ) { }

  ngOnInit() {
    this.buildItemForm(this.data.payload);
  }

  buildItemForm(prop: ArdorProperty) {
    this.itemForm = this.fb.group({
        setter: [prop.setter, Validators.required],
        account: [prop.property, Validators.required],
        publicUrl: [prop.verifiedAccUrl, Validators.required],
        value: [prop.value, Validators.required],
        passPhrase: ['', Validators.required],
    });
  }

  submit() {
    this.dialogRef.close(this.itemForm.value);
  }
}
