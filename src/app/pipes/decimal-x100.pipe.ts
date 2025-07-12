import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'decimalX100'
})
export class DecimalX100Pipe implements PipeTransform {
  transform(value: any, ...args: unknown[]): number {
    if (!value) return 0;
    return Number(Number(value * 100).toFixed(6))
  }
}
