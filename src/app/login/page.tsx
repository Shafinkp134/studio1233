
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { RecaptchaVerifier, signInWithPhoneNumber, Auth, ConfirmationResult } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useAuth, useFirestore, useUser } from "@/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { FirestorePermissionError } from "@/firebase/errors";
import { errorEmitter } from "@/firebase/error-emitter";

const phoneSchema = z.object({
  phone: z.string().regex(/^\+[1-9]\d{1,14}$/, "Please enter a valid phone number with country code (e.g., +919876543210)."),
});

const otpSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits."),
});


export default function LoginPage() {
  const auth = useAuth();
  const firestore = useFirestore();
  const { user } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const recaptchaVerifier = useRef<RecaptchaVerifier | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const phoneForm = useForm<z.infer<typeof phoneSchema>>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: "+91" },
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
    if (!auth || !recaptchaVerifier.current) {
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
      toast({
        variant: "destructive",
        title: "Failed to send OTP",
        description: error.message || "An unexpected error occurred.",
      });
      setConfirmationResult(null);
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleOtpSubmit = async (values: z.infer<typeof otpSchema>) => {
    if (!confirmationResult) return;
    setIsSubmitting(true);
    try {
      const userCredential = await confirmationResult.confirm(values.otp);
      const user = userCredential.user;

      // Save user to Firestore
      const userRef = doc(firestore, "users", user.uid);
      const userData = {
        uid: user.uid,
        phoneNumber: user.phoneNumber,
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
      };

      setDoc(userRef, userData, { merge: true }).catch(async (serverError) => {
          const permissionError = new FirestorePermissionError({
            path: userRef.path,
            operation: 'create',
            requestResourceData: userData,
          });
          errorEmitter.emit('permission-error', permissionError);
      });

      toast({
        title: "Login Successful",
        description: "You have been successfully logged in.",
      });
      router.push("/");
    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Invalid OTP",
            description: "The OTP you entered is incorrect. Please try again.",
        });
        setConfirmationResult(null);
        otpForm.reset();
        phoneForm.reset({ phone: "+91" });
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
                                            <Input placeholder="+91 987 654 3210" {...field} />
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
                                            <Input 
                                                placeholder="123456" 
                                                {...field}
                                                className="text-center text-2xl tracking-[0.5em] font-mono"
                                                maxLength={6}
                                            />
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
