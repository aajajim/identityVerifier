import { Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'txConfirmations'})
export class TransactionConfirmationsPipe implements PipeTransform{
    transform(value: number) {
        if (value > 1440) {
            return '1440+';
        }
        return value;
    }

}