import { useScrollToTop } from "@react-navigation/native";
import { FlashList } from "@shopify/flash-list";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { Link, Stack } from "expo-router";
import * as React from "react";
import { Pressable, View } from "react-native";

import { Plus } from "@/components/Icons";
import { Text } from "@/components/ui/text";
import { useDatabase } from "@/db/provider";
import { customersTable } from "@/db/schema";

import type { Customer } from "@/lib/types";
import { CustomerCard } from "./components";

export default function Screen() {
  return <ScreenContent />;
}

function ScreenContent() {
  const { db } = useDatabase();

  if (!db) {
    return (
      <View className="flex-1 items-center justify-center bg-secondary/30">
        <Text className="text-destructive pb-2 ">Error Loading database</Text>
      </View>
    );
  }

  const { data: customers, error } = useLiveQuery(
    db?.select().from(customersTable)
  );

  const ref = React.useRef(null);
  useScrollToTop(ref);

  const renderItem = React.useCallback(
    ({ item }: { item: Customer }) => <CustomerCard {...item} />,
    []
  );

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-secondary/30">
        <Text className="text-destructive pb-2 ">Error Loading data</Text>
      </View>
    );
  }
  return (
    <View className="flex-1 gap-5 p-6 bg-secondary/30">
      <Stack.Screen
        options={{
          title: "Customers",
        }}
      />

      <FlashList
        ref={ref}
        className="native:overflow-hidden rounded-t-lg"
        estimatedItemSize={49}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View>
            <Text className="text-lg">No Customers</Text>
          </View>
        )}
        ItemSeparatorComponent={() => <View className="p-2" />}
        data={customers}
        renderItem={renderItem}
        keyExtractor={(_, index) => `item-${index}`}
        ListFooterComponent={<View className="py-4" />}
      />

      <View className="absolute bottom-10 right-8">
        <Link href="/customers/create" asChild>
          <Pressable>
            <View className="bg-primary justify-center rounded-full h-[45px] w-[45px]">
              <Plus className="text-background self-center" />
            </View>
          </Pressable>
        </Link>
      </View>
    </View>
  );
}
