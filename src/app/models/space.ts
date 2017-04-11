import { Team } from './team';
import { ProcessTemplate } from './process-template';
import { User } from "ngx-login-client";

export interface Space {
    name: string;
    path: String;
    process?: ProcessTemplate;
    privateSpace?: boolean;
    teams: Team[];
    defaultTeam: Team;
    id: string;
    attributes: SpaceAttributes;
    type: string;
    links: SpaceLink;
    relationships: SpaceRelationships;
    relationalData?: RelationalData;
}

export class SpaceLink {
    self: string;
    filters?: string;
    workitemlinktypes?: string;
    workitemtypes?: string;
}

export class SpaceRelationships {
    areas: SpaceRelatedLink;
    iterations: SpaceRelatedLink;
    'owned-by': {
      data: {
        id: string;
        type: string;
      };
    };
}

export class SpaceRelatedLink {
    links: {
        related: string
    };
}

export class SpaceAttributes {
    name: string;
    description: string;
    'updated-at': string;
    'created-at': string;
    version: number;
}

export class RelationalData {
  creator?: User;
}
