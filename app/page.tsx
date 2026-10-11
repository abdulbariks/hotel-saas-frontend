import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Hotel SaaS",
};

export default function RootPage() {
  redirect("/login");
}