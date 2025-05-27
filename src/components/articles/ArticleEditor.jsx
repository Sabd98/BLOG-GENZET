"use client";
import MDEditor from "@uiw/react-md-editor";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";

const formSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  category: z.string().min(1),
  thumbnail: z.any().optional(),
});

export function ArticleEditor({ initialValues, onSubmit }) {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues || {
      title: "",
      content: "",
      category: "",
      thumbnail: null,
    },
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Form fields */}
          <div className="space-y-4">
            <FormField
              name="title"
              render={({ field }) => (
                <Input {...field} placeholder="Article Title" />
              )}
            />
            <FormField
              name="category"
              render={({ field }) => (
                <Select {...field}>{/* Category options */}</Select>
              )}
            />
            <FormField
              name="thumbnail"
              render={({ field }) => <FileUpload {...field} />}
            />
          </div>
          <Button type="submit">Save Article</Button>
        </form>
      </Form>

      {/* Preview Section */}
      <div className="hidden lg:block">
        <h3 className="text-lg font-semibold mb-4">Preview</h3>
        <div className="prose max-w-none">
          <MDEditor.Markdown source={form.watch("content")} />
        </div>
      </div>
    </div>
  );
}
