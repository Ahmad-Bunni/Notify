export type Customer = {
  id: string;
  company: string;
  villa: string | null;
  subscription: number;
  telephone: string | null;
  subscriptionDate: string;
  renewalDate: string;
  enabled: number;
};

export type Company = {
  id: string;
  name: string;
};
