import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  generateEncryptionKeys,
  generateSignatureKeys,
} from "@shinkai_network/shinkai-message-ts/utils";
import { z } from "zod";

import { queryClient } from "../api/constants";
import { useSubmitRegistrationNoCode } from "../api/mutations/submitRegistation/useSubmitRegistrationNoCode";
import { Button } from "../components/ui/button";
import ErrorMessage from "../components/ui/error-message";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../components/ui/form";
import { Input } from "../components/ui/input";
import { HOME_PATH } from "../routes/name";
import { useAuth } from "../store/auth";

const formSchema = z.object({
  registration_code: z.string(),
  profile: z.string(),
  registration_name: z.string(),
  identity_type: z.string(),
  permission_type: z.string(),
  node_address: z.string().url({
    message: "Node Address must be a valid URL",
  }),
  shinkai_identity: z.string(),
  node_encryption_pk: z.string(),
  node_signature_pk: z.string(),
  profile_encryption_sk: z.string(),
  profile_encryption_pk: z.string(),
  profile_identity_sk: z.string(),
  profile_identity_pk: z.string(),
  my_device_encryption_sk: z.string(),
  my_device_encryption_pk: z.string(),
  my_device_identity_sk: z.string(),
  my_device_identity_pk: z.string(),
});

const OnboardingPage = () => {
  const navigate = useNavigate();
  const setAuth = useAuth((state) => state.setAuth);
  const setLogout = useAuth((state) => state.setLogout);

  const setupDataForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      node_address: "http://localhost:9550",
      registration_code: "",
      profile: "main",
      registration_name: "main_device",
      identity_type: "device",
      permission_type: "admin",
      shinkai_identity: "@@localhost.shinkai", // this should actually be read from ENV
      node_encryption_pk: "",
      node_signature_pk: "",
      profile_encryption_sk: "",
      profile_encryption_pk: "",
      profile_identity_sk: "",
      profile_identity_pk: "",
      my_device_encryption_sk: "",
      my_device_encryption_pk: "",
      my_device_identity_sk: "",
      my_device_identity_pk: "",
    },
  });

  const {
    isPending,
    isError,
    error,
    mutateAsync: submitRegistration,
  } = useSubmitRegistrationNoCode({
    onSuccess: (response) => {
      if (response.success) {
        const responseData = response.data;
        const updatedSetupData = {
          ...setupDataForm.getValues(),
          node_encryption_pk: responseData?.encryption_public_key ?? "",
          node_signature_pk: responseData?.identity_public_key ?? "",
        };
        setAuth(updatedSetupData);
        navigate(HOME_PATH);
      } else {
        throw new Error("Failed to submit registration");
      }
    },
  });

  useEffect(() => {
    // clean up
    setLogout();
    queryClient.clear();

    fetch("http://127.0.0.1:9550/v1/shinkai_health")
      .then((response) => response.json())
      .then((data) => {
        if (data.status === "ok") {
          setupDataForm.setValue("node_address", "http://127.0.0.1:9550");
        }
      })
      .catch((error) => console.error("Error:", error));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Generate keys when the component mounts
  useEffect(() => {
    // Assuming the seed is a random 32 bytes array.
    // Device Keys
    let seed = crypto.getRandomValues(new Uint8Array(32));
    generateEncryptionKeys(seed).then(
      ({ my_encryption_sk_string, my_encryption_pk_string }) => {
        setupDataForm.setValue("my_device_encryption_pk", my_encryption_pk_string);
        setupDataForm.setValue("my_device_encryption_sk", my_encryption_sk_string);
      }
    );
    generateSignatureKeys().then(({ my_identity_pk_string, my_identity_sk_string }) => {
      setupDataForm.setValue("my_device_identity_pk", my_identity_pk_string);
      setupDataForm.setValue("my_device_identity_sk", my_identity_sk_string);
    });

    // Profile Keys
    seed = crypto.getRandomValues(new Uint8Array(32));
    generateEncryptionKeys(seed).then(
      ({ my_encryption_sk_string, my_encryption_pk_string }) => {
        setupDataForm.setValue("profile_encryption_pk", my_encryption_pk_string);
        setupDataForm.setValue("profile_encryption_sk", my_encryption_sk_string);
      }
    );
    generateSignatureKeys().then(({ my_identity_pk_string, my_identity_sk_string }) => {
      setupDataForm.setValue("profile_identity_pk", my_identity_pk_string);
      setupDataForm.setValue("profile_identity_sk", my_identity_sk_string);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onSubmit(currentValues: z.infer<typeof formSchema>) {
    submitRegistration(currentValues);
  }

  return (
    <div className="mx-auto max-w-lg p-10">
      <h1 className="mb-4 text-center text-3xl font-semibold">Register</h1>
      <Form {...setupDataForm}>
        <form className="space-y-8" onSubmit={setupDataForm.handleSubmit(onSubmit)}>
          <FormField
            render={({ field }) => (
              <FormItem>
                <FormLabel>Node Address</FormLabel>
                <FormControl>
                  <Input placeholder="Eg: http://localhost:9550" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
            control={setupDataForm.control}
            name="node_address"
          />
          {isError && <ErrorMessage message={error.message} />}
          <Button
            className="w-full"
            disabled={isPending}
            isLoading={isPending}
            type="submit"
            variant="default"
          >
            Submit
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default OnboardingPage;
