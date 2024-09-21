import AsyncStorage from "@react-native-async-storage/async-storage";
import { Customer } from "./types";

const CUSTOMER_KEY = "customers";

export async function getCustomers(): Promise<Customer[]> {
  const customersString = await AsyncStorage.getItem(CUSTOMER_KEY);
  if (!customersString) {
    return [];
  }
  return JSON.parse(customersString) as Customer[];
}

export async function setCustomers(customers: Customer[]): Promise<void> {
  await AsyncStorage.setItem(CUSTOMER_KEY, JSON.stringify(customers));
}

export async function deleteCustomer(id: string): Promise<void> {
  const customers = await getCustomers();
  const updatedCustomers = customers.filter((customer) => customer.id !== id);
  await setCustomers(updatedCustomers);
}
