"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useDebounce } from "@/hooks/useDebounce";
import { api } from "@/lib/api";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import Image from "next/image";
import { dummyArticles, dummyCategories } from "@/lib/dummyData";

export default function ArticleList() {
  const [articles, setArticles] = useState([]);
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const debouncedSearch = useDebounce(search, 400);

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
    setCurrentPage(1);
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const getCategoryValue = (category) => {
    return typeof category === "string" ? category : category.id;
  };

  const getCategoryName = (category) => {
    return typeof category === "string" ? category : category.name;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        let articlesData = [];
        try {
          const articlesResponse = await api.get("/articles", {
            params: {
              search: debouncedSearch,
              category:
                selectedCategory === "all" ? undefined : selectedCategory,
              page: currentPage,
              limit: 9,
              searchFields: "title,content,category.name",
            },
          });
          articlesData = articlesResponse.data?.data || [];
          if (debouncedSearch) {
            articlesData = articlesData.filter(
              (article) =>
                article.title
                  .toLowerCase()
                  .includes(debouncedSearch.toLowerCase()) ||
                article.content
                  .toLowerCase()
                  .includes(debouncedSearch.toLowerCase()) ||
                article.category.name
                  .toLowerCase()
                  .includes(debouncedSearch.toLowerCase())
            );
          }
        } catch (articlesError) {
          console.error("Articles fetch failed:", articlesError);
          articlesData = dummyArticles; 
        }

        let categoriesData = [];
        try {
          const categoriesResponse = await api.get("/categories");
          const rawCategories =
            categoriesResponse.data?.data || categoriesResponse.data;

          categoriesData = Array.isArray(rawCategories)
            ? rawCategories
                .map((item) => {
                  if (typeof item === "string") {
                    return item.trim(); 
                  } else {
                    const id = String(item.id || "").trim();
                    const name = String(item.name || "Unnamed Category").trim();
                    return id ? { id, name } : null; 
                  }
                })
                .filter(Boolean)
            : dummyCategories;
          // categoriesData = Array.isArray(rawCategories)
          //   ? rawCategories.map((item) =>
          //       typeof item === "string"
          //         ? item
          //         : { id: String(item.id), name: String(item.name) }
          //     )
          //   : dummyCategories;
        } catch (categoriesError) {
          console.error("Categories fetch failed:", categoriesError);
          categoriesData = dummyCategories;
        }

        setArticles(articlesData);
        setCategories(categoriesData);
      } catch (globalError) {
        console.error("Unexpected error:", globalError);
        setArticles(dummyArticles);
        setCategories(dummyCategories);
      }
    };

    fetchData();
  }, [debouncedSearch, selectedCategory, currentPage]);

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

              <div className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto placeholder-white">
                <Select
                  onValueChange={handleCategoryChange}
                  value={selectedCategory}
                >
                  <SelectTrigger className="bg-white backdrop-blur-sm border-blue-300/20 hover:bg-blue-50">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/95 backdrop-blur-sm border-gray-200">
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => {
                      const value = getCategoryValue(category);
                      const name = getCategoryName(category);
                      return (
                        <SelectItem key={value} value={value}>
                          {name}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>

                <Input
                  placeholder="Search articles..."
                  value={search}
                  onChange={handleSearch}
                  className="bg-white backdrop-blur-sm border-blue-300/20  placeholder-slate-50 focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>
          </section>

          <div className="flex-1 m-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {articles.map((article) => (
                <Card
                  key={article.id}
                  className="hover:shadow-lg transition-shadow "
                >
                  <CardContent className="overflow-hidden p-0 m-0">
                    <Image
                      src={article.imageUrl}
                      alt="Article Images"
                      className="object-cover inset-0 mb-4"
                      width={0}
                      height={0}
                      sizes="100vw"
                      style={{ width: "auto", height: "440px" }}
                    />
                    <article className="px-4">
                      <p className="text-sm text-gray-500 my-2">
                        {new Date(article.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          }
                        )}
                      </p>
                      <h2 className="text-xl font-semibold mb-2">
                        <Link
                          href={`/user/articles/${article.id}`}
                          className="font-medium hover:text-primary"
                        >
                          {article.title}
                        </Link>
                      </h2>
                      <p className="text-gray-600 line-clamp-3 mb-4">
                        {article.content}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 text-blue-700 bg-blue-300 rounded-full text-sm">
                          {article.category.name}
                        </span>
                      </div>
                    </article>
                  </CardContent>
                </Card>
              ))}
            </div>

            {articles.length > 0 && (
              <div className="mt-8 flex justify-center gap-2">
                <Button
                  variant="outline"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <span className="px-4 py-2">Page {currentPage}</span>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((p) => p + 1)}
                  disabled={articles.length < 9}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
