export enum Role {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export interface User {
  userId: string;
  role: Role;
}
