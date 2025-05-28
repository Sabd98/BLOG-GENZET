"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useParams } from "next/navigation";
import { dummyArticles, dummyCategories } from "@/lib/dummyData";
import { toast } from "sonner";

const articleFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  categoryId: z.string().min(1, "Category is required"),
  imageUrl: z
    .union([z.instanceof(File), z.string().url("Invalid URL")])
    .optional(),
});

export default function ArticleForm() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const { user } = useAuth();
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoadingArticle, setIsLoadingArticle] = useState(false);
  const [initialImageUrl, setInitialImageUrl] = useState("");

  const form = useForm({
    resolver: zodResolver(articleFormSchema),
    defaultValues: {
      title: "",
      content: "",
      categoryId: "",
      imageUrl: undefined,
    },
  });
  const [article, setArticle] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [previewContent, setPreviewContent] = useState("");
  const [useDummyData, setUseDummyData] = useState(false);

  useEffect(() => {
    if (article) {
      setPreviewContent(article.content);
      form.reset({
        title: article.title,
        content: article.content,
        categoryId: article.categoryId,
        imageUrl: article.imageUrl,
      });
    }
  }, [article, form]);

  useEffect(() => {
    if (id) {
      setIsEditMode(true);
      const fetchArticle = async () => {
        setIsLoadingArticle(true);
        try {
          const response = await api.get(`/articles/${id}`);
          setArticle(response.data);
          setInitialImageUrl(response.data.imageUrl);
          toast.success("Articles Updated");

        } catch (error) {
          toast.error("Article Update Failed");
          const dummyArticle = dummyArticles.find((a) => a.id === id);
          if (dummyArticle) {
            setArticle(dummyArticle);
            setInitialImageUrl(dummyArticle.imageUrl);
            setUseDummyData(true);
          }
        } finally {
          setIsLoadingArticle(false);
        }
      };

      fetchArticle();
    }
  }, [id]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get("/categories");
        const rawCategories = response.data?.data || response.data;

        const validCategories = Array.isArray(rawCategories)
          ? rawCategories.filter((cat) => cat.id && cat.name)
          : [];

        setCategories(validCategories);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategories(dummyCategories);
        setUseDummyData(true);
      }
    };

    fetchCategories();
  }, []);

  const onSubmit = async (values) => {
    setIsLoading(true);
    setFormErrors({});

    try {
      if (useDummyData) {
        const articleData = {
          id: isEditMode ? id : `dummy-${Date.now()}`,
          title: values.title,
          content: values.content,
          categoryId: values.categoryId,
          imageUrl:
            values.imageUrl instanceof File
              ? URL.createObjectURL(values.imageUrl)
              : values.imageUrl || "/placeholder-article.jpg",
          createdAt: isEditMode ? article.createdAt : new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          categories: [
            categories.find((c) => c.id === values.categoryId)?.name ||
              "General",
          ],
        };

        alert(
          `Article ${
            isEditMode ? "updated" : "created"
          } locally:\n${JSON.stringify(articleData, null, 2)}`
        );
      } else {
        const formData = new FormData();
        formData.append("title", String(values.title));
        formData.append("content", String(values.content));
        formData.append("categoryId", String(values.categoryId));

        if (user?.id) {
          formData.append("userId", user.id);
        }

        if (values.imageUrl instanceof File) {
          formData.append("imageUrl", values.imageUrl);
        }

        if (isEditMode) {
          await api.put(`/articles/${id}`, formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });
        } else {
          await api.post("/articles", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });
        }
      }
      toast.success("Article Submitted");
      router.push("/admin/articles");
    } catch (error) {
      toast.error("Error saving article:", error);
      if (error.response?.data?.errors) {
        setFormErrors(error.response.data.errors);
      } else {
        setFormErrors({ general: "Failed to save article. Using demo mode." });
      }
    } finally {
      setIsLoading(false);
    }
  };

    const handlePreview = () => {
      setPreviewContent(form.getValues().content);
    };

    if (isLoadingArticle) {
      return (
        <div className="p-8 flex justify-center items-center h-64">
          <p>Loading article data...</p>
        </div>
      );
    }

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">
        {isEditMode ? "Edit Article" : "Create New Article"}
      </h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {formErrors.general && (
            <div className="text-red-500 p-3 bg-red-50 rounded-md">
              {formErrors.general}
            </div>
          )}

          <div className=" gap-6">
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Thumbnail</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const previewURL = URL.createObjectURL(file);
                          field.onChange(file);
                        } else {
                          field.onChange(initialImageUrl);
                        }
                      }}
                    />
                  </FormControl>

                  {(field.value || initialImageUrl) && (
                    <div className="mt-2">
                      <img
                        src={
                          field.value instanceof File
                            ? URL.createObjectURL(field.value)
                            : field.value || initialImageUrl
                        }
                        alt="Preview"
                        className="max-w-xs max-h-40 object-contain"
                      />
                    </div>
                  )}

                  <FormMessage />
                  {formErrors.imageUrl && (
                    <p className="text-red-500 text-sm">
                      {formErrors.imageUrl}
                    </p>
                  )}
                </FormItem>
              )}
            />
          </div>
          {/* Title Field */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title *</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
                {formErrors.title && (
                  <p className="text-red-500 text-sm">{formErrors.title}</p>
                )}
              </FormItem>
            )}
          />

          {/* Category Field */}
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
                {formErrors.categoryId && (
                  <p className="text-red-500 text-sm">
                    {formErrors.categoryId}
                  </p>
                )}
              </FormItem>
            )}
          />
          {/* Content Field */}
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Content *</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    rows={10}
                    value={field.value || ""}
                    onChange={(e) => {
                      field.onChange(e);
                      setPreviewContent(e.target.value);
                    }}
                  />
                </FormControl>
                <div className="text-sm text-gray-500">
                  {field.value?.length || 0} characters
                </div>
                <FormMessage />
                {formErrors.content && (
                  <p className="text-red-500 text-sm">{formErrors.content}</p>
                )}
              </FormItem>
            )}
          />

          {/* Submit Button */}
          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={handlePreview}>
              Preview
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading
                ? isEditMode
                  ? "Updating Article..."
                  : "Creating Article..."
                : isEditMode
                ? "Update Article"
                : "Create Article"}
            </Button>
          </div>
        </form>
      </Form>

      {/* Preview Section */}
      {previewContent && (
        <div className="mt-8 p-6 border rounded-lg bg-white shadow-sm">
          <h2 className="text-xl font-bold mb-4">Preview</h2>
          <div className="prose max-w-none">
            <h1>{form.watch("title") || "Untitled Article"}</h1>
            <div dangerouslySetInnerHTML={{ __html: previewContent }} />
          </div>
        </div>
      )}
    </div>
  );
}
