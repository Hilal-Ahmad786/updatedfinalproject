// apps/web/app/category/[slug]/page.tsx - CREATE THIS FILE
import { getAllPosts, getAllCategories, getPostsByCategory } from '@/lib/hybrid-api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface CategoryPageProps {
  params: {
    slug: string
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = params
  
  // Get all categories to find the current one
  const categories = await getAllCategories()
  const currentCategory = categories.find(cat => cat.slug === slug)
  
  if (!currentCategory) {
    notFound()
  }
  
  // Get posts for this category
  const posts = await getPostsByCategory(slug)

  return (
    <div className="container py-12">
      <div className="mx-auto max-w-4xl">
        {/* Category Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
            {currentCategory.name}
          </h1>
          <p className="text-lg text-muted-foreground mb-4">
            {currentCategory.description}
          </p>
          <Badge variant="secondary" className="text-base">
            {currentCategory.postCount} posts
          </Badge>
        </div>

        {/* Posts Grid */}
        {posts.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`}>
                <Card className="h-full transition-all duration-300 hover:shadow-lg card-hover">
                  {post.coverImage && (
                    <div className="aspect-video overflow-hidden rounded-t-lg">
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary">{post.category}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {post.readingTime} dk okuma
                      </span>
                    </div>
                    <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                    <CardDescription className="line-clamp-3">
                      {post.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {formatDate(post.date)}
                      </span>
                      <span className="text-sm font-medium text-primary">
                        Devamını oku →
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              Bu kategoride henüz yazı yok.
            </p>
            <Link 
              href="/blog" 
              className="text-primary hover:underline mt-4 inline-block"
            >
              ← Tüm yazılara dön
            </Link>
          </div>
        )}

        {/* Back to Categories */}
        <div className="text-center mt-12">
          <Link 
            href="/categories" 
            className="text-primary hover:underline"
          >
            ← Tüm kategorilere dön
          </Link>
        </div>
      </div>
    </div>
  )
}

// Generate static params for all categories
export async function generateStaticParams() {
  const categories = await getAllCategories()
  
  return categories.map((category) => ({
    slug: category.slug,
  }))
}

// Generate metadata for SEO
export async function generateMetadata({ params }: CategoryPageProps) {
  const categories = await getAllCategories()
  const category = categories.find(cat => cat.slug === params.slug)
  
  if (!category) {
    return {
      title: 'Category Not Found',
    }
  }

  return {
    title: `${category.name} | 100lesme Blog`,
    description: category.description,
  }
}