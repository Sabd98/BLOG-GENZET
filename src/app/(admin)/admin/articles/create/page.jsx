'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import MDEditor from '@uiw/react-md-editor'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'react-hot-toast'
import api from '@/lib/api'

const articleSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters'),
  content: z.string().min(100, 'Content must be at least 100 characters'),
  categoryId: z.string().min(1, 'Category is required'),
  thumbnail: z.instanceof(File).optional()
})

export default function CreateArticlePage() {
  const router = useRouter()
  const [preview, setPreview] = useState(null)
  const [categories, setCategories] = useState([])
  const [tab, setTab] = useState<'write' | 'preview'>('write')
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<z.infer<typeof articleSchema>>({
    resolver: zodResolver(articleSchema)
  })

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories')
        setCategories(response.data)
      } catch (error) {
        setCategories(dummyCategories)
      }
    }
    fetchCategories()
  }, [])

  // Handle image upload
  const handleImageUpload = async (file) => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      const response = await api.post('/upload', formData)
      return response.data.url
    } catch (error) {
      toast.error('Failed to upload image')
      return null
    }
  }

  // Form submission
  const onSubmit = async (values) => {
    setIsLoading(true)
    try {
      let thumbnailUrl = ''
      if (values.thumbnail) {
        thumbnailUrl = await handleImageUpload(values.thumbnail)
      }

      const articleData = {
        title: values.title,
        content: values.content,
        categoryId: values.categoryId,
        thumbnail: thumbnailUrl
      }

      await api.post('/articles', articleData)
      toast.success('Article created successfully!')
      router.push('/admin/articles')
    } catch (error) {
      toast.error('Failed to create article')
    } finally {
      setIsLoading(false)
    }
  }

  // Preview handlers
  const handlePreview = () => setTab('preview')
  const handleContinueEditing = () => setTab('write')

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Create New Article</h1>
          <Button 
            variant="ghost"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Thumbnail Upload */}
            <div className="space-y-2">
              <Label>Thumbnail</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    setValue('thumbnail', file)
                    setPreview(URL.createObjectURL(file))
                  }
                }}
              />
              {preview && (
                <div className="relative w-48 h-32">
                  <img
                    src={preview}
                    alt="Thumbnail preview"
                    className="rounded-lg object-cover"
                  />
                </div>
              )}
              {errors.thumbnail && (
                <p className="text-red-500 text-sm">{errors.thumbnail.message}</p>
              )}
            </div>

            {/* Title Input */}
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                {...register('title')}
                placeholder="Enter article title"
              />
              {errors.title && (
                <p className="text-red-500 text-sm">{errors.title.message}</p>
              )}
            </div>

            {/* Category Select */}
            <div className="space-y-2">
              <Label>Category</Label>
              <select
                {...register('categoryId')}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <p className="text-red-500 text-sm">{errors.categoryId.message}</p>
              )}
            </div>

            {/* Content Editor */}
            <div className="space-y-2">
              <div className="flex gap-4 mb-4">
                <Button
                  type="button"
                  variant={tab === 'write' ? 'default' : 'ghost'}
                  onClick={() => setTab('write')}
                >
                  Write
                </Button>
                <Button
                  type="button"
                  variant={tab === 'preview' ? 'default' : 'ghost'}
                  onClick={handlePreview}
                >
                  Preview
                </Button>
              </div>

              {tab === 'write' ? (
                <MDEditor
                  value={watch('content')}
                  onChange={(value) => setValue('content', value || '')}
                  height={500}
                />
              ) : (
                <div className="prose max-w-none">
                  <MDEditor.Markdown source={watch('content')} />
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-4"
                    onClick={handleContinueEditing}
                  >
                    Continue Editing
                  </Button>
                </div>
              )}
              {errors.content && (
                <p className="text-red-500 text-sm">{errors.content.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Publishing...' : 'Publish Article'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

// // Edit Article Page (src/app/(admin)/articles/[id]/edit/page.tsx)
// export function EditArticlePage({ params }: { params: { id: string } }) {
//   // Similar structure to CreateArticlePage with:
//   // 1. Fetch existing article data
//   // 2. Pre-populate form fields
//   // 3. Handle update with PUT /articles/{id}
//   // 4. Add delete thumbnail functionality
// }

const dummyCategories = [
  { id: '1', name: 'Technology' },
  { id: '2', name: 'Design' },
  { id: '3', name: 'Community' }
]