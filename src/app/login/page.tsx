"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { RecaptchaVerifier, signInWithPhoneNumber, Auth, ConfirmationResult } from "firebase/auth";
import { useAuth, useUser } from "@/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";

const phoneSchema = z.object({
  phone: z.string().regex(/^\+[1-9]\d{1,14}$/, "Please enter a valid phone number with country code (e.g., +15551234567)."),
});

const otpSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits."),
});


export default function LoginPage() {
  const auth = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const recaptchaVerifier = useRef<RecaptchaVerifier | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const phoneForm = useForm<z.infer<typeof phoneSchema>>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: "" },
  });

  const otpForm = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: "" },
  });

  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user, router]);

  useEffect(() => {
    if (!auth || recaptchaVerifier.current) return;
    recaptchaVerifier.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': () => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
        }
      });
  }, [auth]);

  const handlePhoneSubmit = async (values: z.infer<typeof phoneSchema>) => {
    if (!recaptchaVerifier.current) {
        toast({
            variant: "destructive",
            title: "reCAPTCHA not initialized.",
            description: "Please wait a moment and try again."
        });
        return;
    };
    setIsSubmitting(true);
    try {
      const result = await signInWithPhoneNumber(auth, values.phone, recaptchaVerifier.current);
      setConfirmationResult(result);
      toast({
        title: "OTP Sent",
        description: "An OTP has been sent to your phone number.",
      });
    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Failed to send OTP",
        description: error.message || "An unexpected error occurred.",
      });
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleOtpSubmit = async (values: z.infer<typeof otpSchema>) => {
    if (!confirmationResult) return;
    setIsSubmitting(true);
    try {
      await confirmationResult.confirm(values.otp);
      toast({
        title: "Login Successful",
        description: "You have been successfully logged in.",
      });
      router.push("/");
    } catch (error: any) {
        console.error(error);
        toast({
            variant: "destructive",
            title: "Invalid OTP",
            description: "The OTP you entered is incorrect. Please try again.",
          });
    } finally {
        setIsSubmitting(false);
    }
  };


  return (
    <div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-150px)] px-4 py-12">
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle className="text-2xl font-bold">Login</CardTitle>
                <CardDescription>
                    {confirmationResult ? "Enter the OTP sent to your phone." : "Enter your phone number to receive an OTP."}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {!confirmationResult ? (
                    <Form {...phoneForm}>
                        <form onSubmit={phoneForm.handleSubmit(handlePhoneSubmit)} className="space-y-6">
                            <FormField
                                control={phoneForm.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Phone Number</FormLabel>
                                        <FormControl>
                                            <Input placeholder="+1 555 123 4567" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full" disabled={isSubmitting}>
                                {isSubmitting ? "Sending..." : "Send OTP"}
                            </Button>
                        </form>
                    </Form>
                ) : (
                    <Form {...otpForm}>
                         <form onSubmit={otpForm.handleSubmit(handleOtpSubmit)} className="space-y-6">
                            <FormField
                                control={otpForm.control}
                                name="otp"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>One-Time Password</FormLabel>
                                        <FormControl>
                                            <Input placeholder="123456" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full" disabled={isSubmitting}>
                                {isSubmitting ? "Verifying..." : "Verify OTP"}
                            </Button>
                        </form>
                    </Form>
                )}
                <div id="recaptcha-container"></div>
            </CardContent>
        </Card>
    </div>
  );
}
