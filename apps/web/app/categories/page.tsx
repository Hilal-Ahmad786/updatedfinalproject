//apps/web/app/categories/page.tsx
import { getAllCategories } from '@/lib/hybrid-api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

export default async function CategoriesPage() {
  const categories = await getAllCategories()

  return (
    <div className="container py-12">
      <div className="mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
            Categories
          </h1>
          <p className="text-lg text-muted-foreground">
            Explore posts by category
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Link key={category.slug} href={`/category/${category.slug}`}>
              <Card className="h-full transition-all duration-300 hover:shadow-lg card-hover">
                <CardHeader>
                  <CardTitle className="line-clamp-2">{category.name}</CardTitle>
                  <CardDescription className="line-clamp-3">
                    {category.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge variant="secondary">
                    {category.postCount} posts
                  </Badge>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {categories.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No categories available.</p>
          </div>
        )}
      </div>
    </div>
  )
}