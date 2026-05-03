import SearchView from '../view'

interface PageProps {
  params: Promise<{ keyword: string }>
}

export default async function SearchKeywordPage({ params }: PageProps) {
  const { keyword } = await params
  return <SearchView initialKeyword={decodeURIComponent(keyword)} />
}
