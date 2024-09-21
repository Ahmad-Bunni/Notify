import { Button } from "@/components/ui/button";
import { Form, FormField, FormInput } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createInsertSchema } from "drizzle-zod";
import { Stack, useRouter } from "expo-router";
import * as React from "react";
import { useForm } from "react-hook-form";
import { ScrollView, View } from "react-native";
import * as z from "zod";

import { Text } from "@/components/ui/text";
import { useDatabase } from "@/db/provider";
import { companiesTable } from "@/db/schema";

const formSchema = createInsertSchema(companiesTable, {
  name: (schema) =>
    schema.name.min(5, {
      message: "Please enter a company name.",
    }),
});

export default function FormScreen() {
  const { db } = useDatabase();
  const router = useRouter();

  const scrollRef = React.useRef<ScrollView>(null);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  async function handleSubmit(values: z.infer<typeof formSchema>) {
    try {
      await db
        ?.insert(companiesTable)
        .values({ ...values })
        .returning();

      router.navigate("/companies");
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <ScrollView
      ref={scrollRef}
      contentContainerClassName="p-6 mx-auto w-full max-w-xl"
      showsVerticalScrollIndicator={false}
      automaticallyAdjustContentInsets={false}
      contentInset={{ top: 12 }}
    >
      <Stack.Screen
        options={{
          title: "New Customer",
        }}
      />

      <Form {...form}>
        <View className="gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormInput
                label="Company"
                placeholder="Company name"
                className="text-foreground"
                autoCapitalize="none"
                {...field}
              />
            )}
          />

          <Button onPress={form.handleSubmit(handleSubmit)}>
            <Text>Submit</Text>
          </Button>
        </View>
      </Form>
    </ScrollView>
  );
}
