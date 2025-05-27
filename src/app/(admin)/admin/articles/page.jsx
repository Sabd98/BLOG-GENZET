"use client";

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useDebounce } from '@/hooks/useDebounce'
import { Trash2, Edit, Eye } from 'lucide-react'
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


export default function AdminArticleList() {
  const [articles, setArticles] = useState([])
  const [search, setSearch] = useState('')
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [selectedArticle, setSelectedArticle] = useState<string | null>(null)
  const debouncedSearch = useDebounce(search, 400)

  // Fetch articles from API
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await api.get('/articles', {
          params: {
            search: debouncedSearch,
            page: 1,
            limit: 10
          }
        })
        setArticles(response.data)
      } catch (error) {
        console.error('Error fetching articles:', error)
        // Fallback to dummy data
        setArticles(dummyArticles)
      }
    }
    
    fetchArticles()
  }, [debouncedSearch])

  const handleDelete = async (id) => {
    try {
      await api.delete(`/articles/${id}`)
      setArticles(prev => prev.filter(article => article.id !== id))
    } catch (error) {
      console.error('Error deleting article:', error)
    } finally {
      setOpenDeleteDialog(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Logoipsum</h1>
          <nav className="flex gap-6">
            <Button variant="ghost">Articles</Button>
            <Button variant="ghost">Category</Button>
            <Button variant="ghost">Logout</Button>
          </nav>
        </header>

        {/* Content Header */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-semibold">Articles</h2>
              <p className="text-gray-500">Total Articles : {articles.length}</p>
            </div>
            <Button asChild>
              <Link href="/admin/articles/create">
                + Add Article
              </Link>
            </Button>
          </div>

          <Input
            placeholder="Search by title"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
        </div>

        {/* Articles Table */}
        <div className="bg-white rounded-lg shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Thumbnails</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Created at</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {articles.map((article) => (
                <TableRow key={article.id}>
                  <TableCell>
                    <div className="relative h-16 w-16">
                      <Image
                        src={article.thumbnail || '/placeholder-thumbnail.jpg'}
                        alt={article.title}
                        fill
                        className="rounded object-cover"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{article.title}</TableCell>
                  <TableCell>{article.category}</TableCell>
                  <TableCell>
                    {new Date(article.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedArticle(article.id)
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

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Article</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this article? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => selectedArticle && handleDelete(selectedArticle)}
              >
                Confirm Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}

// Dummy data fallback
const dummyArticles= [
  {
    id: '1',
    title: 'Cybersecurity Essentials Every Developer Should Know',
    category: 'Technology',
    createdAt: '2025-04-13T10:55:12',
    thumbnail: '/cybersecurity-thumb.jpg'
  },
  // Add more dummy articles...
]