"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDebounce } from "@/hooks/useDebounce";
import { Edit, Trash2, Plus } from "lucide-react";
import { api } from "@/lib/api";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { dummyCategories } from "@/lib/dummyData";

const categorySchema = z.object({
  name: z.string().min(2, "Category name must be at least 2 characters"),
});

export default function CategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [total, setTotal] = useState(null);

  const debouncedSearch = useDebounce(search, 400);

  const form = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: selectedCategory?.name || "",
    },
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get("/categories", {
          params: {
            search: debouncedSearch,
            page: 1,
            limit: 10,
            searchFields: "name",
          },
        });
        const rawCategories = response.data?.data || response.data;
        setTotal(response.data?.totalData);
        setCategories(rawCategories);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategories(dummyCategories);
      }
    };
    fetchCategories();
  }, [debouncedSearch]);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/categories/${id}`);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      toast.success("Category is Deleted");
    } catch (error) {
      toast.error("Failed Deleting Category");
    } finally {
      setOpenDeleteDialog(false);
    }
  };

  const onSubmit = async (values) => {
    try {
      const response = await api.post("/categories", values);
      onSuccess(response.data);
      setOpen(false);
      form.reset();
      toast.success("Category is Created");
    } catch (error) {
      toast.error("Create category failed:", error);
    }
  };

  useEffect(() => {
    if (selectedCategory) {
      form.reset({ name: selectedCategory.name });
    }
  }, [selectedCategory, form]);

  const handleOpenEditDialog = (category) => {
    setSelectedCategory(category);
    form.reset({ name: category.name });
    setOpenEditDialog(true);
  };

  const handleEdit = async (values) => {
    if (!selectedCategory) return;

    try {
      const response = await api.put(
        `/categories/${selectedCategory.id}`,
        values
      );
      setCategories((prev) =>
        prev.map((c) => (c.id === selectedCategory.id ? response.data : c))
      );
      toast.success("Edit Success");

      setOpenEditDialog(false);
    } catch (error) {
      toast.error("Error updating category:", error);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Categories</h1>

        <Button
          onClick={() => {
            setOpenCreateDialog(true);
          }}
        >
          + Add Category
        </Button>
      </div>
      <h2>Total Category: {total}</h2>
      {/* Search and Filter */}
      <div className="flex gap-1">
        <Input
          placeholder="Search categories..."
          className="max-w-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-lg shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category Name</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell className="font-medium">{category.name}</TableCell>
                <TableCell>
                  {new Date(category.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenEditDialog(category)}
                    >
                      <Edit className="h-4 w-4 cursor-pointer" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedCategory(category);
                        setOpenDeleteDialog(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4 cursor-pointer text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={openCreateDialog} onOpenChange={setOpenCreateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Create New Category</AlertDialogTitle>
          </AlertDialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Input
              {...form.register("name")}
              placeholder="Enter category name"
            />
            {form.formState.errors.name && (
              <p className="text-red-500 text-sm">
                {form.formState.errors.name.message}
              </p>
            )}
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction type="submit">
                Create Category
              </AlertDialogAction>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Dialog */}
      <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the category and remove it from all
              associated categories. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                selectedCategory && handleDelete(selectedCategory.id)
              }
            >
              Confirm Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Dialog */}
      <AlertDialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Edit Category</AlertDialogTitle>
          </AlertDialogHeader>
          <form onSubmit={form.handleSubmit(handleEdit)} className="space-y-4">
            <Input
              {...form.register("name")}
              defaultValue={selectedCategory?.name}
            />
            {form.formState.errors.name && (
              <p className="text-red-500 text-sm">
                {form.formState.errors.name.message}
              </p>
            )}
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction type="submit">Save Changes</AlertDialogAction>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

