"use client";

import { useState } from "react"
import FormContainer from "../ui/FormContainer"
import Input from "../ui/Input"
import { SignUpErrors, signUpSchema } from "../lib/validation/signUp";
import { PrimaryButton } from "../ui/PrimaryButton";
import fetchApi from "../lib/api/client";
import { ApiError } from "../lib/api/client";
import {useRouter} from "next/navigation";

export default function SignUp () {
    const [username, setUserName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [errors, setErrors] = useState<SignUpErrors>({});
    const router = useRouter();

    function validate () {
        const result = signUpSchema.safeParse({username, email, password});
        if (!result.success) {
            const fieldErrors: SignUpErrors = {};
            result.error.issues.forEach((issue) => {
                const field = issue.path[0] as keyof SignUpErrors;
                if (!fieldErrors[field]) {
                    fieldErrors[field] = [];
                }
                fieldErrors[field]!.push(issue.message)
            })
            setErrors(fieldErrors);
            return false;
        }
        setErrors({});
        return true;
    }

    async function handleSubmit () {
        if (!validate()) return;
        
        try {
            await fetchApi("register/", {
                method: "POST", 
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({username, email, password})
            });
            setUserName("");
            setEmail("");
            setPassword("");
            router.push("/login");
        } catch (err) {
             if (
                err instanceof ApiError
                && err.data
                && typeof err.data.message === "object"
                && err.data.message !== null
             ) {
                const backendErrors: SignUpErrors = {};
                for (const key in err.data.message) {
                    backendErrors[key as keyof SignUpErrors] = err.data.message[key];
                }
                setErrors((prev) => ({...prev, ...backendErrors}))
             }
        }
    }

    return (
        <div className="flex h-main-content w-full justify-center items-center">
            <FormContainer>
                <h1 className="text-2xl font-bold">Sign Up</h1>
                <div>
                    <Input placeholder="Username" value={username} isButton={false} onChange={(e) => setUserName(e.target.value)} className="rounded-lg" />
                    {errors.username && errors.username.map((err) => {
                        return <p key={err} className="text-sm px-1 text-red-500">{err}</p>
                    })}
                </div>
                <div>
                    <Input placeholder="Email" value={email} isButton={false} onChange={(e) => setEmail(e.target.value)} className="rounded-lg" type="email" />
                    {errors.email && errors.email.map((err) => {
                        return <p key={err} className="text-sm px-1 text-red-500">{err}</p>
                    })}
                </div>
                <div>
                    <Input placeholder="Password" value={password} isButton={false} onChange={(e) => setPassword(e.target.value)} className="rounded-lg" type="password" />
                    {errors.password && errors.password.map((err) => {
                        return <p key={err} className="text-sm px-1 text-red-500">{err}</p>
                    })}
                </div>
                <PrimaryButton onClick={handleSubmit}>Sign Up</PrimaryButton>
            </FormContainer>
        </div>
    )
}
