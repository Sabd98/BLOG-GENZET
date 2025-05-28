// app/page.tsx
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function Home() {
  return (
    <div className="min-h-screen">
      <div className=" mx-auto ">
        <div className="gap-8">
          <section className="relative min-h-[400px] flex items-center justify-center bg-blue-600/90">
            <div className="absolute inset-0 -z-10">
              <img
                src="/3db22360cc9442cb78dec9c16d45821461792f80.jpg"
                alt="Background"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="container max-w-4xl px-4 text-center">
              <span className="text-sm font-medium text-gray-300 mb-2 block">
                Blog Genzet
              </span>
              <h1 className="text-4xl font-bold text-white mb-4">
                The Journal : Design Resources, Interviews, and Industry News
              </h1>
              <p className="text-lg text-white mb-8">
                Your daily dose of design insights!
              </p>

              <div className="flex justify-center gap-4">
                <Button asChild size="lg" className="hover:bg-blue-400">
                  <Link href="/register">Get Started</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="hover:bg-slate-300"
                >
                  <Link href="/login">Sign In</Link>
                </Button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
