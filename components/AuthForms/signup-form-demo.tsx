"use client";
import React from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { cn } from "@/lib/utils";
import {
  IconBrandGithub,
  IconBrandGoogle,
  IconBrandOnlyfans,
} from "@tabler/icons-react";

export function SignupFormDemo() {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Form submitted");
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="max-w-md w-full mx-auto rounded-2xl p-4 md:p-8 shadow-lg bg-zinc-900">
        <h2 className="font-bold text-xl text-white">
          Welcome to Aceternity
        </h2>
        <p className="text-zinc-400 text-sm max-w-sm mt-2">
          Login to aceternity if you can because we don&apos;t have a login flow
          yet
        </p>

        <form className="my-8" onSubmit={handleSubmit}>
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mb-4">
            <LabelInputContainer>
              <Label htmlFor="firstname" className="text-zinc-300">First name</Label>
              <Input id="firstname" placeholder="Tyler" type="text" className="bg-zinc-800 text-white border-zinc-700" />
            </LabelInputContainer>
            <LabelInputContainer>
              <Label htmlFor="lastname" className="text-zinc-300">Last name</Label>
              <Input id="lastname" placeholder="Durden" type="text" className="bg-zinc-800 text-white border-zinc-700" />
            </LabelInputContainer>
          </div>
          <LabelInputContainer className="mb-4">
            <Label htmlFor="email" className="text-zinc-300">Email Address</Label>
            <Input id="email" placeholder="projectmayhem@fc.com" type="email" className="bg-zinc-800 text-white border-zinc-700" />
          </LabelInputContainer>
          <LabelInputContainer className="mb-4">
            <Label htmlFor="password" className="text-zinc-300">Password</Label>
            <Input id="password" placeholder="••••••••" type="password" className="bg-zinc-800 text-white border-zinc-700" />
          </LabelInputContainer>
          <LabelInputContainer className="mb-8">
            <Label htmlFor="twitterpassword" className="text-zinc-300">Your twitter password</Label>
            <Input
              id="twitterpassword"
              placeholder="••••••••"
              type="password"
              className="bg-zinc-800 text-white border-zinc-700"
            />
          </LabelInputContainer>

          <button
            className="bg-gradient-to-br relative group/btn from-zinc-900 to-zinc-800 block w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset]"
            type="submit"
          >
            Sign up &rarr;
            <BottomGradient />
          </button>

          <div className="bg-gradient-to-r from-transparent via-zinc-700 to-transparent my-8 h-[1px] w-full" />

          <div className="flex flex-col space-y-4">
            <button
              className="relative group/btn flex space-x-2 items-center justify-start px-4 w-full text-white rounded-md h-10 font-medium shadow-[0px_0px_1px_1px_var(--zinc-800)]"
              type="submit"
            >
              <IconBrandGithub className="h-4 w-4 text-zinc-300" />
              <span className="text-zinc-300 text-sm">
                GitHub
              </span>
              <BottomGradient />
            </button>
            <button
              className="relative group/btn flex space-x-2 items-center justify-start px-4 w-full text-white rounded-md h-10 font-medium shadow-[0px_0px_1px_1px_var(--zinc-800)]"
              type="submit"
            >
              <IconBrandGoogle className="h-4 w-4 text-zinc-300" />
              <span className="text-zinc-300 text-sm">
                Google
              </span>
              <BottomGradient />
            </button>
            <button
              className="relative group/btn flex space-x-2 items-center justify-start px-4 w-full text-white rounded-md h-10 font-medium shadow-[0px_0px_1px_1px_var(--zinc-800)]"
              type="submit"
            >
              <IconBrandOnlyfans className="h-4 w-4 text-zinc-300" />
              <span className="text-zinc-300 text-sm">
                OnlyFans
              </span>
              <BottomGradient />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const BottomGradient = () => {
  return (
    <>
      <span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
      <span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
    </>
  );
};

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex flex-col space-y-2 w-full", className)}>
      {children}
    </div>
  );
};
