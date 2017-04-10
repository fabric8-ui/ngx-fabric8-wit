import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'spaceName', pure: true })
export class SpaceNamePipe implements PipeTransform {
  transform(name: string): any {
    return name ? name.replace('_', ' ') : name;
  }
}
