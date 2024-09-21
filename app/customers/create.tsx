import { Button, buttonTextVariants } from "@/components/ui/button";
import {
  Form,
  FormDatePicker,
  FormField,
  FormInput,
  FormLabel,
  FormSelect,
  FormSwitch,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createInsertSchema } from "drizzle-zod";
import { Stack, useFocusEffect, useRouter } from "expo-router";
import * as React from "react";
import { useForm } from "react-hook-form";
import { ScrollView, View } from "react-native";
import * as z from "zod";

import { Text } from "@/components/ui/text";
import { useDatabase } from "@/db/provider";
import { companiesTable, customersTable } from "@/db/schema";

import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Company } from "@/lib/types";
import { addMonths, formatISO } from "date-fns";
import { CalendarIcon } from "lucide-react-native";
const formSchema = createInsertSchema(customersTable, {
  company: (schema) =>
    schema.company.min(5, {
      message: "Please enter a company name.",
    }),
  subscription: (schema) =>
    schema.subscription.min(1, {
      message: "Please enter the subscription duration.",
    }),
  villa: z.string().optional(),
  subscriptionDate: z.string(),
  renewalDate: z.string().optional(),
  enabled: z.number(),
});

const defaultValues = {
  company: "",
  subscriptionDate: formatISO(new Date(), { representation: "date" }),
  villa: "",
  subscription: 3,
  telephone: "",
  enabled: 1,
};

export default function FormScreen() {
  const { db } = useDatabase();
  const router = useRouter();
  const [selectTriggerWidth, setSelectTriggerWidth] = React.useState(0);
  const [companies, setCompanies] = React.useState<Company[]>([]);
  const [addNew, setAddNew] = React.useState<boolean>(true);
  const [renewal, setRenewal] = React.useState<string>();
  const [subscription, setSubscription] = React.useState<number>(
    defaultValues.subscription
  );
  const [subscriptionDate, setSubscriptionDate] = React.useState<string>(
    defaultValues.subscriptionDate
  );

  useFocusEffect(
    React.useCallback(() => {
      fetchCompanies();
    }, [])
  );

  React.useEffect(() => {
    const renewalDate = addMonths(new Date(subscriptionDate), subscription);
    setRenewal(formatISO(renewalDate, { representation: "date" }));
  }, [subscription, subscriptionDate]);

  const scrollRef = React.useRef<ScrollView>(null);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues,
  });

  const fetchCompanies = async () => {
    const fetchedCompanies = await db?.select().from(companiesTable).execute();
    if (fetchedCompanies) {
      setCompanies(fetchedCompanies);
    }
  };

  async function handleSubmit(values: z.infer<typeof formSchema>) {
    try {
      const subscriptionDate = new Date(values.subscriptionDate);
      const renewalDate = addMonths(subscriptionDate, values.subscription);

      await db
        ?.insert(customersTable)
        .values({
          ...values,
          subscriptionDate: formatISO(subscriptionDate, {
            representation: "date",
          }),
          renewalDate: formatISO(renewalDate, { representation: "date" }),
        })
        .returning();

      form.reset();
      setSubscription(defaultValues.subscription);
      setSubscriptionDate(defaultValues.subscriptionDate);

      if (!addNew) {
        router.navigate("/customers");
      }

      form.setValue("company", values.company);
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
            name="company"
            render={({ field }) => (
              <FormSelect
                label="Company"
                {...field}
                value={
                  field.value
                    ? { label: field.value, value: field.value }
                    : undefined
                }
              >
                <Select onValueChange={(value) => field.onChange(value?.value)}>
                  <SelectTrigger
                    onLayout={(ev) => {
                      setSelectTriggerWidth(ev.nativeEvent.layout.width);
                    }}
                  >
                    <SelectValue
                      className="text-primary"
                      placeholder="Select a company"
                    />
                  </SelectTrigger>
                  <SelectContent style={{ width: selectTriggerWidth }}>
                    <SelectGroup>
                      {companies.map((company) => (
                        <SelectItem
                          key={company.name}
                          label={company.name}
                          value={company.name}
                        >
                          <Text>{company.name}</Text>
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </FormSelect>
            )}
          />

          <FormField
            control={form.control}
            name="villa"
            render={({ field }) => (
              <FormInput
                label="Villa"
                placeholder="Villa name"
                className="text-foreground"
                autoCapitalize="none"
                {...field}
                value={field.value !== undefined ? String(field.value) : ""}
              />
            )}
          />

          <FormField
            control={form.control}
            name="telephone"
            render={({ field }) => (
              <FormInput
                label="Telephone"
                placeholder="Telephone number"
                className="text-foreground"
                autoCapitalize="none"
                {...field}
                value={field.value !== undefined ? String(field.value) : ""}
              />
            )}
          />

          <FormField
            control={form.control}
            name="subscription"
            render={({ field }) => (
              <FormInput
                label="Subscription Duration (months)"
                keyboardType="number-pad"
                placeholder="Number of Months"
                className="text-foreground"
                autoCapitalize="none"
                {...field}
                value={field.value !== undefined ? String(field.value) : ""}
                onChange={(val) => {
                  setSubscription(Number(val));
                  field.onChange(Number(val));
                }}
              />
            )}
          />

          <FormField
            control={form.control}
            name="subscriptionDate"
            render={({ field }) => (
              <FormDatePicker
                label="Subscription Date"
                {...field}
                onChange={(val) => {
                  setSubscriptionDate(val);
                  field.onChange(val);
                }}
              />
            )}
          />

          <View>
            <FormLabel nativeID="">Renewal Date</FormLabel>
            <Button
              variant="outline"
              className="flex-row gap-3 justify-start px-3 relative"
            >
              <CalendarIcon
                className={buttonTextVariants({
                  variant: "outline",
                })}
                size={18}
              />
              <Text
                className={buttonTextVariants({
                  variant: "outline",
                  className: "opacity-70",
                })}
              >
                {renewal}
              </Text>
            </Button>
          </View>

          <FormField
            control={form.control}
            name="enabled"
            render={({ field }) => (
              <FormSwitch
                label="Enable reminder"
                {...field}
                value={field.value !== undefined ? Boolean(field.value) : true}
              />
            )}
          />

          <Separator />

          <View className="flex flex-row gap-2">
            <Checkbox checked={addNew} onCheckedChange={setAddNew} />
            <Text>Add new customer after this</Text>
          </View>

          <View className="flex flex-row gap-4">
            <Button className="w-40" onPress={form.handleSubmit(handleSubmit)}>
              <Text>Submit</Text>
            </Button>

            <Button
              className="w-40"
              variant="outline"
              onPress={() => {
                form.reset();
              }}
            >
              <Text>Clear</Text>
            </Button>
          </View>
        </View>
      </Form>
    </ScrollView>
  );
}
