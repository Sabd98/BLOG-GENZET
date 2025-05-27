"use client";

import { useState } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useDebounce } from '@/hooks/useDebounce'
import { Edit, Trash2, Plus } from 'lucide-react'
import {api} from '@/lib/api'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

const categorySchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters')
})

export default function CategoryManagement() {
  const [categories, setCategories] = useState([])
  const [search, setSearch] = useState('')
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [openEditDialog, setOpenEditDialog] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const debouncedSearch = useDebounce(search, 400)

  const form = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: selectedCategory?.name || ''
    }
  })

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories', {
          params: {
            search: debouncedSearch,
            page: 1,
            limit: 10
          }
        })
        setCategories(response.data)
      } catch (error) {
        console.error('Error fetching categories:', error)
        setCategories(dummyCategories)
      }
    }
    fetchCategories()
  }, [debouncedSearch])

  const handleDelete = async (id) => {
    try {
      await api.delete(`/categories/${id}`)
      setCategories(prev => prev.filter(c => c.id !== id))
    } catch (error) {
      console.error('Error deleting category:', error)
    } finally {
      setOpenDeleteDialog(false)
    }
  }

  const handleEdit = async (values) => {
    if (!selectedCategory) return
    
    try {
      const response = await api.put(`/categories/${selectedCategory.id}`, values)
      setCategories(prev => prev.map(c => 
        c.id === selectedCategory.id ? response.data : c
      ))
      setOpenEditDialog(false)
    } catch (error) {
      console.error('Error updating category:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Logoipsum</h1>
          <nav className="flex gap-6">
            <Button variant="ghost" asChild>
              <Link href="/admin/articles">Articles</Link>
            </Button>
            <Button variant="default">Categories</Button>
            <Button variant="ghost">Logout</Button>
          </nav>
        </header>

        {/* Content Header */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Categories</h2>
            <CategoryForm 
              trigger={
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Category
                </Button>
              }
              onSuccess={(newCategory) => 
                setCategories(prev => [newCategory, ...prev])
              }
            />
          </div>

          <Input
            placeholder="Search categories"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
        </div>

        {/* Categories Table */}
        <div className="bg-white rounded-lg shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category Name</TableHead>
                <TableHead>Articles</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>{category.articleCount}</TableCell>
                  <TableCell>
                    {new Date(category.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedCategory(category)
                          setOpenEditDialog(true)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedCategory(category)
                          setOpenDeleteDialog(true)
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Delete Dialog */}
        <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Category</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the category and remove it from all
                associated articles. This action cannot be undone.
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
                {...form.register('name')}
                defaultValue={selectedCategory?.name}
                placeholder="Category name"
              />
              {form.formState.errors.name && (
                <p className="text-red-500 text-sm">
                  {form.formState.errors.name.message}
                </p>
              )}
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction type="submit">
                  Save Changes
                </AlertDialogAction>
              </AlertDialogFooter>
            </form>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}

// Category Form Component
export function CategoryForm({
  trigger,
  onSuccess
}) {
  const [open, setOpen] = useState(false)
  const form = useForm({
    resolver: zodResolver(categorySchema)
  })

  const onSubmit = async (values) => {
    try {
      const response = await api.post('/categories', values)
      onSuccess(response.data)
      setOpen(false)
      form.reset()
    } catch (error) {
      console.error('Error creating category:', error)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {trigger}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Create New Category</AlertDialogTitle>
        </AlertDialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <Input
            {...form.register('name')}
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
  )
}

const dummyCategories = [
  {
    id: '1',
    name: 'Technology',
    articleCount: 15,
    createdAt: '2025-01-01'
  },
  // ...other dummy categories
]