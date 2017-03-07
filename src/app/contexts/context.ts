import { Team } from './../models/team';
import { Space } from './../models/space';
import { User } from 'ngx-login-client';
import { ContextType } from './context-type';

export interface Context {
    // The entity that this context is for
    user: User;
    space?: Space;
    team?: Team;
    type: ContextType;
    path: string;
    name: string;
}
