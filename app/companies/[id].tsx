import { Button } from "@/components/ui/button";
import {
  Form,
  FormElement,
  FormField,
  FormInput
} from "@/components/ui/form";
import { Text } from "@/components/ui/text";
import { useDatabase } from "@/db/provider";
import { companiesTable } from "@/db/schema";
import { Company } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { eq } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import {
  Stack,
  useFocusEffect,
  useLocalSearchParams,
  useRouter,
} from "expo-router";
import * as React from "react";
import { useForm } from "react-hook-form";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as z from "zod";

const formSchema = createInsertSchema(companiesTable, {
  name: (schema) =>
    schema.name.min(5, {
      message: "Please enter a company name.",
    })
});

export default function FormScreen() {
  const { db } = useDatabase();
  const router = useRouter();
  const scrollRef = React.useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();
  const [company, setCompany] = React.useState<Company>();
  const { id } = useLocalSearchParams<{ id: string }>();

  useFocusEffect(
    React.useCallback(() => {
      fetchCompanyById();
    }, [])
  );
  const defaultValues = React.useMemo(() => {
    if (company) {
      return {
        name: company.name,
      };
    }
    return {
      name: "",
    };
  }, [company]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues,
    values: defaultValues,
  });

  const fetchCompanyById = async () => {
    const fetchedCompany = await db
      ?.select()
      .from(companiesTable)
      .where(eq(companiesTable.id, id as string))
      .execute();
    if (fetchedCompany) {
      setCompany(fetchedCompany[0]);
    }
  };

  async function handleSubmit(values: z.infer<typeof formSchema>) {
    try {
      await db
        ?.update(companiesTable)
        .set({
          name: values.name,

        })
        .where(eq(companiesTable.id, id as string))
        .execute();

      router.navigate("/companies");
    } catch (error) {
      console.error("error", error);
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
          title: "Company",
        }}
      />
      <FormElement onSubmit={handleSubmit}>
        <Form {...form}>
          <View className="gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormInput
                  label="Company"
                  className="text-foreground"
                  placeholder="Company name"
                  autoCapitalize="none"
                  {...field}
                />
              )}
            />

            <Button
              disabled={!form.formState.isDirty}
              onPress={form.handleSubmit(handleSubmit)}
            >
              <Text>Update</Text>
            </Button>
          </View>
        </Form>
      </FormElement>

    </ScrollView>
  );
}
