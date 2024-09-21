import { Plus } from "@/components/Icons";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui";
import { Separator } from "@/components/ui/separator";
import { Text } from "@/components/ui/text";
import { useMigrationHelper } from "@/db/drizzle";
import { useDatabase } from "@/db/provider";
import { customersTable } from "@/db/schema";
import { Customer } from "@/lib/types";
import { useScrollToTop } from "@react-navigation/native";
import FlashList from "@shopify/flash-list/dist/FlashList";
import { formatISO } from "date-fns";
import { eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { Link, router, Stack } from "expo-router";
import * as React from "react";
import { Pressable, View } from "react-native";
import { CustomerCard } from "./customers/components";

export default function Screen() {
  const { success, error } = useMigrationHelper();

  if (error) {
    return (
      <View className="flex-1 gap-5 p-6 bg-secondary/30">
        <Text>Migration error: {error.message}</Text>
      </View>
    );
  }
  if (!success) {
    return (
      <View className="flex-1 gap-5 p-6 bg-secondary/30">
        <Text>Migration is in progress...</Text>
      </View>
    );
  }

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

  const today = formatISO(new Date(), { representation: "date" });

  const { data: customers, error } = useLiveQuery(
    db
      ?.select()
      .from(customersTable)
      .where(eq(customersTable.renewalDate, today))
  );

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-secondary/30">
        <Text className="text-destructive pb-2 ">Error Loading data</Text>
      </View>
    );
  }

  const renderItem = React.useCallback(
    ({ item }: { item: Customer }) => <CustomerCard {...item} />,
    []
  );

  const ref = React.useRef(null);
  useScrollToTop(ref);

  return (
    <View className="flex-1 gap-5 p-6 bg-secondary/30">
      <Stack.Screen
        options={{
          title: "Home",
          headerRight: () => <ThemeToggle />,
        }}
      />

      <View className="gap-2">
        <Button variant="default" onPress={() => router.navigate("/companies")}>
          <Text>Companies</Text>
        </Button>
        <Button variant="default" onPress={() => router.navigate("/customers")}>
          <Text>Customers</Text>
        </Button>
        <Button variant="default" onPress={() => router.navigate("/settings")}>
          <Text>Settings</Text>
        </Button>
      </View>

      <View className="flex-1 gap-4">
        <Separator />

        <FlashList
          ref={ref}
          className="native:overflow-hidden rounded-t-lg px-4"
          estimatedItemSize={49}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View>
              <Text className="text-lg">No Renewals Today</Text>
            </View>
          )}
          ItemSeparatorComponent={() => <View className="p-2" />}
          data={customers}
          renderItem={renderItem}
          keyExtractor={(_, index) => `item-${index}`}
          ListFooterComponent={<View className="py-4" />}
        />
      </View>

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
