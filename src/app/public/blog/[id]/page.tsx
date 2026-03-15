import BlogPostPage from '@/components/public/blog/BlogPostPage'

type Props = { params: Promise<{ id: string }> }

export default async function Page({ params }: Props) {
  const { id } = await params
  return <BlogPostPage id={Number(id)} />
}
