import {
  Card,
  CardTitle
} from "@/components/ui/card";
import type { Customer } from "@/lib/types";
import { Link } from "expo-router";
import type React from "react";
import { Pressable, View } from "react-native";

type CustomerProps = Customer;

export const CustomerCard: React.FC<CustomerProps> = ({
  id,
  company,
}: CustomerProps) => {
  return (
    <Link href={`/customers/${id}`} asChild>
      <Pressable>
        <Card className="rounded-2xl p-4 flex flex-row justify-between items-center">
          <View >
            <CardTitle>{company}</CardTitle>
          </View>
        </Card>
      </Pressable>
    </Link>
  );
};
