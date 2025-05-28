"use client";
import { api } from "@/lib/api";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Eye } from "lucide-react";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { dummyCategories,dummyArticles } from "@/lib/dummyData";

export default function AdminArticleList() {
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(null);

  const [selectedArticle, setSelectedArticle] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const debouncedSearch = useDebounce(search, 400);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
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
              limit: 10,
              searchFields: "title,content,category.name",
            },
          });
          setTotal(articlesResponse.data?.total);
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
        } catch (error) {
          console.error("Articles fetch failed:", error);
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
        } catch (categoriesError) {
          console.error("Categories Fetch failed:", categoriesError);
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

  const handleDelete = async (id) => {
    try {
      await api.delete(`/articles/${id}`);
      setArticles(articles.filter((article) => article.id !== id));
      toast.success("Delete Article Success");
    } catch (error) {
      toast.error("Delete Article Failed");
    } finally {
      setOpenDeleteDialog(false);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Articles</h1>
        <Link href="/admin/articles/create">
          <Button>+ Add Article</Button>
        </Link>
      </div>
      <h2>Total Article: {total}</h2>
      {/* Search and Filter */}
      <div className="flex gap-4">
        <Select onValueChange={handleCategoryChange} value={selectedCategory}>
          <SelectTrigger className="bg-white backdrop-blur-sm border-blue-300/20 hover:bg-slate-5">
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
          className="max-w-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Thumbnail</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {articles.map((article) => (
            <TableRow key={article.id}>
              <TableCell>
                <Image
                  src={article.imageUrl}
                  alt={article.title}
                  width={80}
                  height={60}
                  className="rounded object-cover"
                />
              </TableCell>
              <TableCell className="font-medium">{article.title}</TableCell>
              <TableCell>
                <Badge variant="outline">{article.category.name}</Badge>
              </TableCell>
              <TableCell>
                {new Date(article.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell className="flex gap-2 ">
                <Link href={`/admin/articles/${article.id}`}>
                  <Button variant="ghost" size="icon">
                    <Eye className="h-4 w-4 cursor-pointer" />
                  </Button>
                </Link>
                <Link href={`/admin/articles/edit/${article.id}`}>
                  <Button variant="ghost" size="icon">
                    <Edit className="h-4 w-4 cursor-pointer" />
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setSelectedArticle(article);
                    setOpenDeleteDialog(true);
                  }}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {articles.length > 0 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink>{currentPage}</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={articles.length < 9}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
      <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Article</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the article and remove it from all
              associated article. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                selectedArticle && handleDelete(selectedArticle.id)
              }
            >
              Confirm Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

