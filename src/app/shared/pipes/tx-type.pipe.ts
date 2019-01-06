import {Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'txType'})
export class TransactionTypePipe implements PipeTransform{
    transform(value: number) {
        switch (value) {
            case 0:
                return 'Payment';
            case 1:
                return 'Message';
            case 2:
                return 'Asset Exchange';
            case 3:
                return 'Digital Good';
            case 4:
                return 'Account Control';
            case 5:
                return 'Monetary System';
            case 6:
                return 'Data';
            case 7:
                return 'Shuffling';
            case 8:
                return 'Alias';
            case 9:
                return 'Voting';
            case 10:
                return 'Account Property';
            case 11:
                return 'Coin Exchange';
            case 11:
                return 'Light Contract';
            default:
                return value;
        }
    }

}