import { useCallback, useEffect, useState } from 'react'
import {
  Link,
  NavLink,
  Route,
  Routes,
  useParams,
} from 'react-router-dom'
import {
  fetchDocument,
  fetchDocuments,
  fetchScenario,
  fetchScenarios,
} from './api'
import './App.css'

function App() {
  return (
    <div className="app-shell">
      <header className="site-header">
        <Link className="brand" to="/">
          Cloud Sim Lab
        </Link>
        <nav className="nav-links" aria-label="주요 메뉴">
          <NavLink to="/docs">학습 문서</NavLink>
          <NavLink to="/scenarios">시나리오</NavLink>
        </nav>
      </header>

      <main className="page">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/docs" element={<DocumentListPage />} />
          <Route path="/docs/:documentId" element={<DocumentDetailPage />} />
          <Route path="/scenarios" element={<ScenarioListPage />} />
          <Route path="/scenarios/:scenarioId" element={<ScenarioDetailPage />} />
        </Routes>
      </main>
    </div>
  )
}

function HomePage() {
  return (
    <section className="hero-section">
      <p className="eyebrow">실무형 클라우드 아키텍처 학습</p>
      <h1>AWS 운영 상황을 문서와 시나리오로 학습합니다.</h1>
      <p className="lead">
        Step 6 범위에서는 학습 문서와 시나리오를 탐색하는 기본 화면만 제공합니다.
      </p>
      <div className="actions">
        <Link className="button primary" to="/docs">
          학습 문서 보기
        </Link>
        <Link className="button" to="/scenarios">
          시나리오 보기
        </Link>
      </div>
    </section>
  )
}

function DocumentListPage() {
  const { data, loading, error } = useApiResource(fetchDocuments)
  const documents = data ?? []

  if (loading) return <StatusMessage message="학습 문서를 불러오는 중입니다." />
  if (error) return <StatusMessage message={error} isError />

  return (
    <section>
      <PageHeader
        title="학습 문서"
        description="AWS 개념과 운영 관점의 학습 문서를 확인합니다."
      />
      <div className="card-list">
        {documents.map((document) => (
          <Link className="card" key={document.id} to={`/docs/${document.id}`}>
            <div className="meta-row">
              <span>{document.category}</span>
              <span>{document.level}</span>
            </div>
            <h2>{document.title}</h2>
            <p>{document.summary ?? '문서 상세에서 전체 내용을 확인하세요.'}</p>
          </Link>
        ))}
      </div>
      {documents.length === 0 && <StatusMessage message="등록된 학습 문서가 없습니다." />}
    </section>
  )
}

function DocumentDetailPage() {
  const { documentId } = useParams()
  const loadDocument = useCallback(() => {
    if (!documentId) throw new Error('문서 ID가 없습니다.')
    return fetchDocument(documentId)
  }, [documentId])
  const { data, loading, error } = useApiResource(loadDocument)

  if (loading) return <StatusMessage message="학습 문서를 불러오는 중입니다." />
  if (error) return <StatusMessage message={error} isError />
  if (!data) return <StatusMessage message="학습 문서를 찾을 수 없습니다." isError />

  return (
    <article>
      <Link className="back-link" to="/docs">
        ← 학습 문서 목록
      </Link>
      <PageHeader title={data.title} description={`${data.category} · ${data.level}`} />
      <pre className="markdown-body">{data.content}</pre>
      <RelatedLinks ids={data.relatedDocumentIds} basePath="/docs" title="관련 문서" />
    </article>
  )
}

function ScenarioListPage() {
  const { data, loading, error } = useApiResource(fetchScenarios)
  const scenarios = data ?? []

  if (loading) return <StatusMessage message="시나리오를 불러오는 중입니다." />
  if (error) return <StatusMessage message={error} isError />

  return (
    <section>
      <PageHeader
        title="시나리오"
        description="운영 상황별 아키텍처 선택 문제를 확인합니다."
      />
      <div className="card-list">
        {scenarios.map((scenario) => (
          <Link className="card" key={scenario.id} to={`/scenarios/${scenario.id}`}>
            <div className="meta-row">
              <span>{scenario.category}</span>
              <span>{scenario.level}</span>
            </div>
            <h2>{scenario.title}</h2>
            <p>{scenario.problem}</p>
          </Link>
        ))}
      </div>
      {scenarios.length === 0 && <StatusMessage message="등록된 시나리오가 없습니다." />}
    </section>
  )
}

function ScenarioDetailPage() {
  const { scenarioId } = useParams()
  const loadScenario = useCallback(() => {
    if (!scenarioId) throw new Error('시나리오 ID가 없습니다.')
    return fetchScenario(scenarioId)
  }, [scenarioId])
  const { data, loading, error } = useApiResource(loadScenario)

  if (loading) return <StatusMessage message="시나리오를 불러오는 중입니다." />
  if (error) return <StatusMessage message={error} isError />
  if (!data) return <StatusMessage message="시나리오를 찾을 수 없습니다." isError />

  return (
    <article>
      <Link className="back-link" to="/scenarios">
        ← 시나리오 목록
      </Link>
      <PageHeader title={data.title} description={`${data.category} · ${data.level}`} />

      <section className="detail-section">
        <h2>문제 상황</h2>
        <p>{data.problem}</p>
      </section>

      <section className="detail-section">
        <h2>현재 아키텍처</h2>
        <ol className="architecture-list">
          {data.initialArchitecture.map((node) => (
            <li key={node}>{node}</li>
          ))}
        </ol>
      </section>

      <section className="detail-section">
        <h2>선택지</h2>
        <div className="option-list">
          {data.options.map((option) => (
            <div className="option-card" key={option.id}>
              <h3>{option.label}</h3>
              <p>{option.description}</p>
              {option.feedback && <p className="muted">{option.feedback}</p>}
            </div>
          ))}
        </div>
      </section>

      <RelatedLinks ids={data.relatedDocumentIds} basePath="/docs" title="관련 문서" />
    </article>
  )
}

function PageHeader({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="page-header">
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  )
}

function RelatedLinks({
  ids,
  basePath,
  title,
}: {
  ids: string[]
  basePath: string
  title: string
}) {
  if (ids.length === 0) return null

  return (
    <section className="detail-section">
      <h2>{title}</h2>
      <div className="chip-list">
        {ids.map((id) => (
          <Link className="chip" key={id} to={`${basePath}/${id}`}>
            {id}
          </Link>
        ))}
      </div>
    </section>
  )
}

function StatusMessage({
  message,
  isError = false,
}: {
  message: string
  isError?: boolean
}) {
  return <p className={isError ? 'status error' : 'status'}>{message}</p>
}

function useApiResource<T>(loader: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        setLoading(true)
        setError(null)
        const result = await loader()
        if (!cancelled) setData(result)
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : '요청 처리 중 오류가 발생했습니다.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [loader])

  return { data, loading, error }
}

export default App
