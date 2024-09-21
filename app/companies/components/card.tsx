import { Text } from "@/components/ui";
import { Card } from "@/components/ui/card";
import type { Company } from "@/lib/types";
import { Link } from "expo-router";
import type React from "react";
import { Pressable, View } from "react-native";

type CompanyProps = Company;

export const CompanyCard: React.FC<CompanyProps> = ({
  id,
  name,
}: CompanyProps) => {
  return (
    <Link href={`/companies/${id}`} asChild>
      <Pressable>
        <Card className="rounded-2xl p-4 flex flex-row items-center">
          <View>
            <Text className="text-lg">{name}</Text>
          </View>
        </Card>
      </Pressable>
    </Link>
  );
};
