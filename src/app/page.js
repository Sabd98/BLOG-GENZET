// app/page.tsx
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ResponsiveNav } from "@/components/ResponsiveNav";

export default async function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* <ResponsiveNav /> */}

      <main className="max-w-7xl mx-auto px-4 py-16">
        {/* Hero Section */}
        <section className="text-center py-20">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Welcome to The Journal
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Your daily dose of design insights, technology updates, and industry
            news. Join our community of creators and innovators.
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/register">Get Started</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </section>

        {/* Featured Articles Preview */}
        <section className="py-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Featured Articles
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="h-48 bg-gray-100 rounded-lg mb-4 animate-pulse" />
                <h3 className="text-xl font-semibold mb-2">
                  Loading Article...
                </h3>
                <p className="text-gray-600 line-clamp-3 mb-4">
                  Article content preview loading...
                </p>
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-gray-100 rounded-full text-sm w-20 animate-pulse" />
                  <span className="px-3 py-1 bg-gray-100 rounded-full text-sm w-20 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Why Join The Journal?
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: "Expert Insights",
                  desc: "Learn from industry professionals",
                },
                {
                  title: "Community",
                  desc: "Connect with like-minded creators",
                },
                { title: "Resources", desc: "Access valuable design assets" },
              ].map((feature) => (
                <div key={feature.title} className="p-6">
                  <div className="h-12 w-12 bg-primary/10 rounded-lg mb-4 mx-auto" />
                  <h3 className="text-xl font-semibold mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
