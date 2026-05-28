import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import {
  Link,
  NavLink,
  Route,
  Routes,
  useParams,
} from 'react-router-dom'
import mermaid from 'mermaid'
import {
  fetchDocument,
  fetchDocuments,
  fetchScenario,
  fetchScenarios,
  simulateScenario,
  type Scenario,
  type ScenarioOption,
  type SimulationResult,
} from './api'
import './App.css'

mermaid.initialize({
  startOnLoad: false,
  securityLevel: 'strict',
  theme: 'base',
  themeVariables: {
    primaryColor: '#eff6ff',
    primaryBorderColor: '#93c5fd',
    primaryTextColor: '#0f172a',
    lineColor: '#64748b',
    fontFamily: 'inherit',
  },
})

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
        {scenarios.map((scenario, index) =>
          scenario.id ? (
            <Link className="card" key={scenario.id} to={`/scenarios/${scenario.id}`}>
              <ScenarioCardContent scenario={scenario} />
            </Link>
          ) : (
            <div className="card disabled" key={`missing-scenario-id-${index}`}>
              <ScenarioCardContent scenario={scenario} />
              <p className="error-text">시나리오 ID가 없어 상세 페이지로 이동할 수 없습니다.</p>
            </div>
          ),
        )}
      </div>
      {scenarios.length === 0 && <StatusMessage message="등록된 시나리오가 없습니다." />}
    </section>
  )
}

function ScenarioCardContent({ scenario }: { scenario: Scenario }) {
  return (
    <>
      <div className="meta-row">
        <span>{scenario.category}</span>
        <span>{scenario.level}</span>
      </div>
      <h2>{scenario.title}</h2>
      <p>{scenario.problem}</p>
    </>
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
        <ArchitectureDiagram nodes={data.initialArchitecture} />
      </section>

      <ScenarioSimulationPanel
        key={data.id}
        options={data.options}
        scenarioId={data.id}
      />

      <RelatedLinks ids={data.relatedDocumentIds} basePath="/docs" title="관련 문서" />
    </article>
  )
}

function ScenarioSimulationPanel({
  scenarioId,
  options,
}: {
  scenarioId: string
  options: ScenarioOption[]
}) {
  const [selectedOptionIds, setSelectedOptionIds] = useState<string[]>([])
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null)
  const [simulationLoading, setSimulationLoading] = useState(false)
  const [simulationError, setSimulationError] = useState<string | null>(null)

  function toggleOption(optionId: string) {
    setSelectedOptionIds((current) =>
      current.includes(optionId)
        ? current.filter((id) => id !== optionId)
        : [...current, optionId],
    )
  }

  async function handleSimulationSubmit() {
    if (selectedOptionIds.length === 0) return

    try {
      setSimulationLoading(true)
      setSimulationError(null)
      setSimulationResult(await simulateScenario(scenarioId, selectedOptionIds))
    } catch (err) {
      setSimulationError(
        err instanceof Error ? err.message : '시뮬레이션 실행 중 오류가 발생했습니다.',
      )
    } finally {
      setSimulationLoading(false)
    }
  }

  return (
    <>
      <section className="detail-section">
        <h2>선택지</h2>
        <div className="option-list">
          {options.map((option) => (
            <label className="option-card selectable" key={option.id}>
              <input
                checked={selectedOptionIds.includes(option.id)}
                disabled={simulationLoading}
                onChange={() => toggleOption(option.id)}
                type="checkbox"
              />
              <h3>{option.label}</h3>
              <p>{option.description}</p>
              <ScoreList scores={option.effects} />
              {option.feedback && <p className="muted">{option.feedback}</p>}
            </label>
          ))}
        </div>
        <button
          className="button primary simulate-button"
          disabled={selectedOptionIds.length === 0 || simulationLoading}
          onClick={handleSimulationSubmit}
          type="button"
        >
          {simulationLoading ? '시뮬레이션 실행 중...' : '시뮬레이션 실행'}
        </button>
        {simulationError && <StatusMessage message={simulationError} isError />}
      </section>

      {simulationResult && (
        <SimulationResultSection
          result={simulationResult}
          selectedOptions={options.filter((option) =>
            simulationResult.selectedOptionIds.includes(option.id),
          )}
        />
      )}
    </>
  )
}

function SimulationResultSection({
  result,
  selectedOptions,
}: {
  result: SimulationResult
  selectedOptions: ScenarioOption[]
}) {
  const resultScores =
    Object.keys(result.effects).length > 0 ? result.effects : mergeOptionEffects(selectedOptions)

  return (
    <section className="result-section">
      <div className="result-header">
        <h2>시뮬레이션 결과</h2>
        <span className={`result-badge ${result.resultType.toLowerCase()}`}>
          {result.resultType}
        </span>
      </div>

      {result.summary && <p>{result.summary}</p>}
      <ScoreList scores={resultScores} />

      {result.detailFeedback.length > 0 && (
        <div className="feedback-list">
          <h3>피드백</h3>
          <ul>
            {result.detailFeedback.map((feedback) => (
              <li key={feedback}>{feedback}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="feedback-list">
        <h3>최종 아키텍처</h3>
        <ArchitectureDiagram nodes={result.finalArchitecture} />
      </div>

      <RelatedLinks
        ids={result.relatedDocumentIds}
        basePath="/docs"
        title="추천 학습 문서"
      />
    </section>
  )
}

function ArchitectureDiagram({ nodes }: { nodes: string[] }) {
  const [svg, setSvg] = useState('')
  const [error, setError] = useState<string | null>(null)
  const reactId = useId()
  const diagramId = useMemo(
    () => `architecture-${reactId.replace(/[^a-zA-Z0-9_-]/g, '')}`,
    [reactId],
  )
  const renderCount = useRef(0)
  const chart = useMemo(() => architectureToMermaid(nodes), [nodes])

  useEffect(() => {
    let cancelled = false

    async function renderDiagram() {
      if (!chart) {
        setSvg('')
        setError(null)
        return
      }

      try {
        setError(null)
        renderCount.current += 1
        const { svg: renderedSvg } = await mermaid.render(
          `${diagramId}-${renderCount.current}`,
          chart,
        )
        if (!cancelled) setSvg(renderedSvg)
      } catch {
        if (!cancelled) {
          setSvg('')
          setError('아키텍처 다이어그램을 렌더링할 수 없습니다.')
        }
      }
    }

    renderDiagram()

    return () => {
      cancelled = true
    }
  }, [chart, diagramId])

  if (nodes.length === 0) {
    return <StatusMessage message="아키텍처 정보가 없습니다." />
  }

  if (error) {
    return <StatusMessage message={error} isError />
  }

  return (
    <div
      aria-label="아키텍처 다이어그램"
      className="architecture-diagram"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}

function architectureToMermaid(nodes: string[]) {
  const visibleNodes = nodes.map((node) => node.trim()).filter(Boolean)
  if (visibleNodes.length === 0) return ''

  const definitions = visibleNodes.map(
    (node, index) => `  node${index}["${escapeMermaidLabel(node)}"]`,
  )
  const edges = visibleNodes.slice(1).map((_, index) => `  node${index} --> node${index + 1}`)

  return ['flowchart LR', ...definitions, ...edges].join('\n')
}

function escapeMermaidLabel(label: string) {
  return label.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
}

function ScoreList({ scores }: { scores: Record<string, number> }) {
  const entries = Object.entries(scores)
  if (entries.length === 0) return null

  return (
    <dl className="score-list">
      {entries.map(([name, value]) => (
        <div key={name}>
          <dt>{name}</dt>
          <dd>{value > 0 ? `+${value}` : value}</dd>
        </div>
      ))}
    </dl>
  )
}

function mergeOptionEffects(options: ScenarioOption[]) {
  return options.reduce<Record<string, number>>((scores, option) => {
    Object.entries(option.effects).forEach(([name, value]) => {
      scores[name] = (scores[name] ?? 0) + value
    })
    return scores
  }, {})
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
