import NewsList from "@/components/NewsList";
import { notFound } from "next/navigation";

const validCategories = [
  "business",
  "entertainment",
  "general",
  "health",
  "science",
  "sports",
  "technology",
];

export async function generateMetadata({ params }) {
  const { category } = await params;
  const capitalized = category.charAt(0).toUpperCase() + category.slice(1);
  return {
    title: `${capitalized} News - NewsMonkey`,
    description: `Stay updated with the latest ${category} news on NewsMonkey.`,
  };
}

export default async function CategoryPage({ params }) {
  const { category } = await params;

  if (!validCategories.includes(category)) {
    notFound();
  }

  return <NewsList category={category} />;
}
