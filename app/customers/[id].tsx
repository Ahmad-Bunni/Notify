import { Button, buttonTextVariants } from "@/components/ui/button";
import {
  Form,
  FormDatePicker,
  FormElement,
  FormField,
  FormInput,
  FormLabel,
  FormSelect,
  FormSwitch,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Text } from "@/components/ui/text";
import { useDatabase } from "@/db/provider";
import { companiesTable, customersTable } from "@/db/schema";
import type { Company, Customer } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { addMonths, formatISO } from "date-fns";
import { eq } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import {
  Stack,
  useFocusEffect,
  useLocalSearchParams,
  useRouter,
} from "expo-router";
import { CalendarIcon } from "lucide-react-native";
import * as React from "react";
import { useForm } from "react-hook-form";
import { ScrollView, View } from "react-native";
import * as z from "zod";

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

export default function FormScreen() {
  const { db } = useDatabase();
  const router = useRouter();
  const scrollRef = React.useRef<ScrollView>(null);
  const [selectTriggerWidth, setSelectTriggerWidth] = React.useState(0);

  const [customer, setCustomer] = React.useState<Customer>();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [companies, setCompanies] = React.useState<Company[]>([]);
  const [renewal, setRenewal] = React.useState<string>();
  const [subscription, setSubscription] = React.useState<number>();
  const [subscriptionDate, setSubscriptionDate] = React.useState<string>();

  useFocusEffect(
    React.useCallback(() => {
      fetchCompanies();
      fetchCustomerById();
    }, [])
  );

  React.useEffect(() => {
    if (subscription && subscriptionDate) {
      const renewalDate = addMonths(new Date(subscriptionDate), subscription);
      setRenewal(formatISO(renewalDate, { representation: "date" }));
    }
  }, [subscription, subscriptionDate]);

  const defaultValues = React.useMemo(() => {
    if (customer) {
      return {
        company: customer.company,
        villa: customer?.villa,
        subscriptionDate: customer.subscriptionDate,
        subscription: customer.subscription,
        telephone: customer?.telephone,
        enabled: customer?.enabled,
      };
    }
    return {
      company: "",
      subscriptionDate: formatISO(new Date(), { representation: "date" }),
      villa: "",
      subscription: 3,
      telephone: "",
      enabled: 1,
    };
  }, [customer]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues,
    values: defaultValues,
  });

  const fetchCompanies = async () => {
    const fetchedCompanies = await db?.select().from(companiesTable).execute();
    if (fetchedCompanies) {
      setCompanies(fetchedCompanies);
    }
  };

  const fetchCustomerById = async () => {
    const fetchedCustomer = await db
      ?.select()
      .from(customersTable)
      .where(eq(customersTable.id, id as string))
      .execute();
    if (fetchedCustomer) {
      const c = fetchedCustomer[0];
      setSubscription(c.subscription);
      setSubscriptionDate(c.subscriptionDate);
      setCustomer(c);
    }
  };

  async function handleSubmit(values: z.infer<typeof formSchema>) {
    try {
      const subscriptionDate = new Date(values.subscriptionDate);
      const renewalDate = addMonths(subscriptionDate, values.subscription);

      await db
        ?.update(customersTable)
        .set({
          ...values,
          subscriptionDate: formatISO(subscriptionDate, {
            representation: "date",
          }),
          renewalDate: formatISO(renewalDate, { representation: "date" }),
        })
        .where(eq(customersTable.id, id as string))
        .execute();

      router.navigate("/customers");
    } catch (error) {
      console.error("error", error);
    }
  }

  if (!customer) {
    return (
      <Stack.Screen
        options={{
          title: "Customer",
        }}
      />
    );
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
          title: `${customer.company} ${customer.villa}`,
        }}
      />
      <FormElement onSubmit={handleSubmit}>
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
                  <Select
                    onValueChange={(value) => field.onChange(value?.value)}
                    defaultValue={{
                      label: customer?.company,
                      value: customer?.company,
                    }}
                  >
                    <SelectTrigger
                      onLayout={(ev) => {
                        setSelectTriggerWidth(ev.nativeEvent.layout.width);
                      }}
                    >
                      <SelectValue placeholder="Select a company" />
                    </SelectTrigger>
                    <SelectContent style={{ width: selectTriggerWidth }}>
                      <SelectGroup>
                        {companies.map((company) => (
                          <SelectItem
                            key={company.name}
                            label={company.name}
                            value={company.name}
                          ></SelectItem>
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
                  value={
                    field.value !== undefined ? Boolean(field.value) : true
                  }
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
