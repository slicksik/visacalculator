import { redirect } from "next/navigation";
import { slugs } from "@/lib/i18n";

export default function Home() {
  redirect(`/en/${slugs.en}`);
}
