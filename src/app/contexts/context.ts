import { User } from 'ngx-login-client';
import { ContextType } from './context-type';
import { Space } from './../models/space';
import { Team } from './../models/team';

export interface Context {
    // The entity that this context is for
    user: User;
    space?: Space;
    team?: Team;
    type: ContextType;
    path: string;
    name: string;
}
