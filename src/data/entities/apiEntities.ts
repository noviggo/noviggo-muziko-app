export interface ApiRequest<T> {
  data: T;
}

export interface ApiResponse<T> {
  _status?: Status;
  _meta?: Meta;
  data?: T;
}

export interface Params {
  diagnosedAt?: Date;
  instanceId?: string;
  service?: string;
}
export interface Origin {
  instance?: Instance;
}

export interface Meta {
  stats?: Stats;
  origin?: Origin;
}

export interface Stats {
  count?: number;
  limit?: number;
  offset?: number;
}

export interface Status {
  code?: string;
  status?: number;
  message?: string;
  params?: Params;
}

export interface Instance {
  host?: string;
  instanceId?: string;
  ip?: string;
  service?: string;
  startedAt?: Date;
  version?: string;
}

export interface Entity {
  id?: string;
  shortId?: string;
  metadata?: any;
  createdDate?: Date;
  updatedDate?: Date;
  deletedDate?: Date;
  lastActivityDate?: Date;
  createdBy?: string;
  updatedBy?: string;
  deletedBy?: string;
  lastActivityBy?: string;
  isEditing?: boolean;
}

export interface Folder extends Entity {
  lastSyncDate?: Date;
  path: string;
  totalTracks?: number;
  status?: string;
}
