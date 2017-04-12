import { ContextType } from './context-type';
export class ContextTypes {

  static readonly BUILTIN: Map<string, ContextType> = new Map<string, ContextType>([
    [
      'user',
      {
        name: 'User',
        icon: 'pficon pficon-user',
      } as ContextType
    ],
    [
      'space',
      {
        name: 'Space',
        icon: 'fa fa-th-large',
      } as ContextType
    ],
    [
      'team',
      {
        name: 'Team',
        icon: 'fa fa-users'
      } as ContextType
    ],
    [
      'organization',
      {
        name: 'Organization',
        icon: 'fa fa-cubes'
      } as ContextType
    ]
  ]);

}
