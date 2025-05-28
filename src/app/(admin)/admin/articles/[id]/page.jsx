import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import Image from "next/image";

export const ArticleService = {
  async getArticle(id) {
    const response = await api.get(`/articles/${id}`);
    return response.data;
  },

  async getRelatedArticles(currentArticleId, categoryId) {
    const response = await api.get("/articles", {
      params: {
        categoryId,
        limit: 4,
      },
    });

    return response.data.data
      .filter(
        (article) =>
          article.id !== currentArticleId && article.category?.id === categoryId
      )
      .slice(0, 3);
  },
};

export default async function AdminArticleDetail({ params }) {
  const { id } = params;
  try {
    const article = await ArticleService.getArticle(id);
    const relatedArticles = await ArticleService.getRelatedArticles(
      params.id,
      article.category.id
    );

    return (
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex justify-between items-start mb-8">
            <h1 className="text-3xl font-bold text-gray-900">The Journal</h1>
            <Button asChild variant="ghost">
              <Link href="/articles">Back to Articles</Link>
            </Button>
          </div>

          <div className="gap-8">
            <div className="lg:col-span-2 space-y-6">
              <article className="bg-white p-8 rounded-xl shadow-sm">
                <div className="mb-6 flex items-center justify-center gap-2 text-sm text-gray-500">
                  <span>
                    {new Date(article.createdAt).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  <span>•</span>
                  <span className="text-primary">{article.category.name}</span>
                </div>
                <h1 className="text-4xl font-bold text-center mb-6">
                  {article.title}
                </h1>
                <Image
                  src={article.imageUrl}
                  alt="Article Images"
                  className="w-full inset-0 mb-6"
                  width={400}
                  height={340}
                />
                <div className="prose max-w-none inset-12 text-justify">
                  {article.content}
                </div>
              </article>
            </div>

          </div>
          <h2 className="text-2xl font-semibold my-6">Other Articles</h2>

          <div className="space-x-6 grid lg:grid-cols-3 ">
            {relatedArticles.length > 0 ? (
              relatedArticles.map((article) => (
                <Card key={article.id} className=" hover:shadow-lg">
                  <CardContent className="p-0 m-0">
                    <Image
                      src={article.imageUrl}
                      alt="Article Images"
                      className="object-cover inset-0 "
                      width={0}
                      height={0}
                      sizes="100vw"
                      style={{ width: "auto", height: "440px" }}
                    />
                    <article className="px-4">
                      <p className="text-sm text-gray-500 mb-2">
                        {new Date(article.createdAt).toLocaleDateString()}
                      </p>
                      <h3 className="font-semibold mb-2">
                        <Link
                          href={`/user/articles/${article.id}`}
                          className="hover:text-primary line-clamp-2"
                        >
                          {article.title}
                        </Link>
                      </h3>
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
              ))
            ) : (
              <p className="text-gray-500">No related articles found</p>
            )}
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Article detail error:", error);
    notFound();
  }
}
