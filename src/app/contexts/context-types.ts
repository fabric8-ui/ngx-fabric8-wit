import { ContextType } from './context-type';
export class ContextTypes {

  static readonly BUILTIN: Map<string, ContextType> = new Map<string, ContextType>([
    [
      'user',
      {
        name: 'User',
        icon: 'fa fa-user',
      } as ContextType
    ],
    [
      'space',
      {
        name: 'Space',
        icon: 'fa fa-space-shuttle',
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
