import { Button } from "@/components/ui/button";
// import { Card, CardContent } from "@/components/ui/card"
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSeparator } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function LoginScreen({ className, ...props }: React.ComponentProps<"div">) {
    return (
        <div className={cn("wv:flex wv:flex-col wv:gap-6", className)} {...props}>
            <div className="wv:overflow-hidden wv:p-0">
                <div className="wv:grid wv:p-0 md:wv:grid-cols-2">
                    <form className="wv:p-6 md:wv:p-8">
                        <FieldGroup>
                            <div className="wv:flex wv:flex-col wv:items-center wv:gap-2 wv:text-center">
                                <h1 className="wv:text-2xl wv:font-bold">Welcome back</h1>
                                <p className="wv:text-muted-foreground wv:text-balance">
                                    Login to your Acme Inc account
                                </p>
                            </div>

                            <Field>
                                <FieldLabel htmlFor="email">Email</FieldLabel>
                            </Field>

                            <Field>
                                <div className="wv:flex wv:items-center">
                                    <FieldLabel htmlFor="password">Password</FieldLabel>
                                    <a href="#" className="wv:ml-auto wv:text-sm wv:underline-offset-2 hover:wv:underline">
                                        Forgot your password?
                                    </a>
                                </div>
                            </Field>

                            <Field>
                                <Button type="submit">Login</Button>
                            </Field>

                            <FieldSeparator className="*:data-[slot=field-separator-content]:wv:bg-card">
                                Or continue with
                            </FieldSeparator>

                            <Field className="wv:grid wv:grid-cols-3 wv:gap-4">
                                <Button variant="outline" type="button">
                                    <span className="wv:sr-only">Login with Apple</span>
                                </Button>

                                <Button variant="outline" type="button">
                                    <span className="wv:sr-only">Login with Google</span>
                                </Button>

                                <Button variant="outline" type="button">
                                    <span className="wv:sr-only">Login with Meta</span>
                                </Button>
                            </Field>

                            <FieldDescription className="wv:text-center" />
                        </FieldGroup>
                    </form>

                    <div className="wv:bg-muted wv:relative wv:hidden md:wv:block">
                        <img
                            src="/placeholder.svg"
                            alt="Image"
                            className="wv:absolute wv:inset-0 wv:h-full wv:w-full wv:object-cover dark:wv:brightness-[0.2] dark:wv:grayscale"
                        />
                    </div>
                </div>
            </div>

            <FieldDescription className="wv:px-6 wv:text-center">
                By clicking continue, you agree to our{" "}
                <a href="#">Terms of Service</a> and{" "}
                <a href="#">Privacy Policy</a>.
            </FieldDescription>
        </div>
    );
}
