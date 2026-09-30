export type Admin = {
  id: string;
  email: string;
  name: string;
};

export type LoginResponse = {
  token: string;
  expires_at: string;
  admin: Admin;
};
