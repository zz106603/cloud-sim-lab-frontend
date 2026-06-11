import {
  memo,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  Link,
  NavLink,
  Route,
  Routes,
  useNavigate,
  useParams,
} from 'react-router-dom'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  Controls,
  Handle,
  MarkerType,
  Position,
  ReactFlow,
  type Connection,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
  type NodeProps,
} from '@xyflow/react'
import mermaid from 'mermaid'
import {
  type ArchitectureGraph,
  createUserArchitecture,
  deleteUserArchitecture,
  fetchDocument,
  fetchDocuments,
  fetchScenario,
  fetchScenarios,
  fetchUserArchitecture,
  fetchUserArchitectureCatalog,
  fetchUserArchitectures,
  simulateScenario,
  updateUserArchitecture,
  validateUserArchitecture,
  type RelatedLearningDocument,
  type RelatedScenario,
  type Scenario,
  type ScenarioOption,
  type SimulationResult,
  type UserArchitectureCatalog,
  type UserArchitectureConnection,
  type UserArchitectureDetail,
  type UserArchitectureNode,
  type UserArchitectureResourceType,
  type UserArchitectureSaveRequest,
  type UserArchitectureValidationIssue,
  type UserArchitectureValidationResult,
} from './api'
import '@xyflow/react/dist/style.css'
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
          <NavLink to="/architectures">내 아키텍처</NavLink>
        </nav>
      </header>

      <main className="page">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/docs" element={<DocumentListPage />} />
          <Route path="/docs/:documentId" element={<DocumentDetailPage />} />
          <Route path="/scenarios" element={<ScenarioListPage />} />
          <Route path="/scenarios/:scenarioId" element={<ScenarioDetailPage />} />
          <Route path="/architectures" element={<UserArchitectureListPage />} />
          <Route path="/architectures/new" element={<UserArchitectureBuilderPage />} />
          <Route path="/architectures/:architectureId" element={<UserArchitectureBuilderPage />} />
        </Routes>
      </main>
    </div>
  )
}

function HomePage() {
  const docsState = useApiResource(fetchDocuments)
  const scenariosState = useApiResource(fetchScenarios)
  const documents = docsState.data ?? []
  const scenarios = scenariosState.data ?? []
  const learningStats = [
    { label: '문서', value: documents.length },
    { label: '시나리오', value: scenarios.length },
    { label: '직접 구성', value: 'Builder' },
  ]

  return (
    <>
      <section className="hero-section learning-hero">
        <p className="eyebrow">실무형 클라우드 아키텍처 학습</p>
        <h1>AWS 구조를 읽고, 판단하고, 직접 실험합니다.</h1>
        <p className="lead">
          문서, 시나리오, 아키텍처 빌더 중 필요한 지점에서 시작하세요. 각 화면은
          개념 암기보다 운영 상황에서의 판단 근거를 남기도록 구성되어 있습니다.
        </p>
        <div className="actions">
          <Link className="button primary" to="/docs">
            개념 찾아보기
          </Link>
          <Link className="button" to="/scenarios">
            상황으로 연습
          </Link>
          <Link className="button" to="/architectures/new">
            구조 직접 만들기
          </Link>
        </div>
        <dl className="learning-stats">
          {learningStats.map((stat) => (
            <div key={stat.label}>
              <dt>{stat.label}</dt>
              <dd>{stat.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="learning-path" aria-label="학습 진입점">
        <LearningPathStep
          actionLabel="관련 구조와 시나리오 확인"
          description="서비스 구성 요소가 왜 필요한지, 어떤 장애와 운영 이슈로 이어지는지 정리합니다."
          marker="Docs"
          title="개념에서 시작"
          to="/docs"
        />
        <LearningPathStep
          actionLabel="선택지와 trade-off 비교"
          description="문제 원인을 읽고 선택 조합이 성능, 비용, 안정성에 미치는 영향을 확인합니다."
          marker="Case"
          title="상황에서 시작"
          to="/scenarios"
        />
        <LearningPathStep
          actionLabel="검증 피드백으로 점검"
          description="리소스와 연결 의미를 직접 배치하면서 네트워크, 보안, 장애 관점을 확인합니다."
          marker="Build"
          title="구성에서 시작"
          to="/architectures/new"
        />
      </section>

      <div className="home-next-grid">
        <section className="next-panel">
          <div className="section-title-row">
            <h2>다음 학습</h2>
            <Link to="/docs">전체 보기</Link>
          </div>
          {docsState.loading && <p className="helper-text">학습 문서를 불러오는 중입니다.</p>}
          {docsState.error && <p className="error-text">{docsState.error}</p>}
          {documents.slice(0, 3).map((document) => (
            <Link className="next-item" key={document.id} to={`/docs/${document.id}`}>
              <span>{document.category} · {document.level}</span>
              <strong>{document.title}</strong>
              {document.summary && <p>{document.summary}</p>}
            </Link>
          ))}
        </section>

        <section className="next-panel">
          <div className="section-title-row">
            <h2>연습 시작</h2>
            <Link to="/scenarios">전체 보기</Link>
          </div>
          {scenariosState.loading && <p className="helper-text">시나리오를 불러오는 중입니다.</p>}
          {scenariosState.error && <p className="error-text">{scenariosState.error}</p>}
          {scenarios.slice(0, 3).map((scenario) => (
            <Link className="next-item" key={scenario.id} to={`/scenarios/${scenario.id}`}>
              <span>{scenario.category} · {scenario.level}</span>
              <strong>{scenario.title}</strong>
              <p>{scenario.summary}</p>
            </Link>
          ))}
        </section>
      </div>
    </>
  )
}

function LearningPathStep({
  actionLabel,
  description,
  marker,
  title,
  to,
}: {
  actionLabel: string
  description: string
  marker: string
  title: string
  to: string
}) {
  return (
    <Link className="path-step" to={to}>
      <span className="path-index">{marker}</span>
      <strong>{title}</strong>
      <p>{description}</p>
      <span className="path-action">{actionLabel}</span>
    </Link>
  )
}

function DocumentListPage() {
  const { data, loading, error } = useApiResource(fetchDocuments)
  const documents = useMemo(() => data ?? [], [data])
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [levelFilter, setLevelFilter] = useState('all')
  const categories = useMemo(() => uniqueValues(documents.map((document) => document.category)), [documents])
  const levels = useMemo(() => uniqueValues(documents.map((document) => document.level)), [documents])
  const filteredDocuments = useMemo(
    () =>
      documents.filter(
        (document) =>
          matchesFilter(document.category, categoryFilter) &&
          matchesFilter(document.level, levelFilter),
      ),
    [categoryFilter, documents, levelFilter],
  )

  if (loading) return <StatusMessage message="학습 문서를 불러오는 중입니다." />
  if (error) return <StatusMessage message={error} isError />

  return (
    <section>
      <PageHeader
        title="학습 문서"
        description="문서를 열기 전에 주제, 난이도, 연결된 연습 맥락을 먼저 확인합니다."
      />
      <FilterBar
        categoryFilter={categoryFilter}
        categoryOptions={categories}
        levelFilter={levelFilter}
        levelOptions={levels}
        onCategoryChange={setCategoryFilter}
        onLevelChange={setLevelFilter}
        resultCount={filteredDocuments.length}
      />
      <div className="card-list">
        {filteredDocuments.map((document) => (
          <Link className="card" key={document.id} to={`/docs/${document.id}`}>
            <div className="meta-row">
              <span>{document.category}</span>
              <span>{document.level}</span>
              {document.relatedScenarios.length > 0 && (
                <span>시나리오 {document.relatedScenarios.length}</span>
              )}
            </div>
            <h2>{document.title}</h2>
            <p>{document.summary ?? '문서 상세에서 전체 내용을 확인하세요.'}</p>
            <LearningCueList
              cues={[
                `핵심 주제: ${document.category || '클라우드 구조'}`,
                document.relatedScenarios.length > 0
                  ? '관련 운영 상황으로 바로 확장 가능'
                  : '개념 정리용 문서',
              ]}
            />
            <span className="card-action">읽기 전 맥락 확인하기</span>
          </Link>
        ))}
      </div>
      {documents.length === 0 && <StatusMessage message="등록된 학습 문서가 없습니다." />}
      {documents.length > 0 && filteredDocuments.length === 0 && (
        <StatusMessage message="선택한 조건에 맞는 학습 문서가 없습니다." />
      )}
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
      <LearningContextBar
        items={[
          '왜 필요한지 찾기',
          '요청 흐름과 장애 지점 표시',
          '실무 주의점만 따로 기억',
        ]}
      />
      <StudyPromptPanel
        prompts={[
          '이 리소스가 없으면 어떤 병목이나 장애가 생기는가?',
          '요청은 어떤 순서로 이동하고 어느 지점에서 실패할 수 있는가?',
          '성능, 비용, 운영 복잡도 중 무엇을 더 부담하는가?',
        ]}
        title="읽으면서 확인할 질문"
      />
      <div className="markdown-body">
        <Markdown remarkPlugins={[remarkGfm]} skipHtml>
          {data.content}
        </Markdown>
      </div>
      <RelatedScenarioCards scenarios={data.relatedScenarios} />
      <RelatedLinks ids={data.relatedDocumentIds} basePath="/docs" title="관련 문서" />
    </article>
  )
}

function ScenarioListPage() {
  const { data, loading, error } = useApiResource(fetchScenarios)
  const scenarios = useMemo(() => data ?? [], [data])
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [levelFilter, setLevelFilter] = useState('all')
  const categories = useMemo(() => uniqueValues(scenarios.map((scenario) => scenario.category)), [scenarios])
  const levels = useMemo(() => uniqueValues(scenarios.map((scenario) => scenario.level)), [scenarios])
  const filteredScenarios = useMemo(
    () =>
      scenarios.filter(
        (scenario) =>
          matchesFilter(scenario.category, categoryFilter) &&
          matchesFilter(scenario.level, levelFilter),
      ),
    [categoryFilter, levelFilter, scenarios],
  )

  if (loading) return <StatusMessage message="시나리오를 불러오는 중입니다." />
  if (error) return <StatusMessage message={error} isError />

  return (
    <section>
      <PageHeader
        title="시나리오"
        description="상황을 열기 전에 문제 유형, 현재 구조, 선택 규모를 훑어보고 고릅니다."
      />
      <FilterBar
        categoryFilter={categoryFilter}
        categoryOptions={categories}
        levelFilter={levelFilter}
        levelOptions={levels}
        onCategoryChange={setCategoryFilter}
        onLevelChange={setLevelFilter}
        resultCount={filteredScenarios.length}
      />
      <div className="card-list">
        {filteredScenarios.map((scenario, index) =>
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
      {scenarios.length > 0 && filteredScenarios.length === 0 && (
        <StatusMessage message="선택한 조건에 맞는 시나리오가 없습니다." />
      )}
    </section>
  )
}

function ScenarioCardContent({ scenario }: { scenario: Scenario }) {
  return (
    <>
      <div className="meta-row">
        <span>{scenario.category}</span>
        <span>{scenario.level}</span>
        <span>선택지 {scenario.options.length}</span>
        {scenario.relatedLearningDocuments.length > 0 && (
          <span>복습 {scenario.relatedLearningDocuments.length}</span>
        )}
      </div>
      <h2>{scenario.title}</h2>
      <p>{scenario.summary}</p>
      <LearningCueList
        cues={[
          `현재 구조: ${architecturePreview(scenario.initialArchitecture)}`,
          `판단 관점: ${scenario.category || '운영 trade-off'}`,
        ]}
      />
      <span className="card-action">문제 맥락 살펴보기</span>
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
      <LearningContextBar
        items={[
          '증상과 원인 구분',
          '현재 구조의 병목 추정',
          '선택지의 부작용 비교',
        ]}
      />

      <section className="scenario-brief">
        <div className="problem-panel">
          <span className="section-kicker">상황</span>
          <h2>무엇이 문제인가요?</h2>
          <p>{data.problem}</p>
        </div>
        <div className="architecture-panel">
          <span className="section-kicker">현재 구조</span>
          <ArchitectureDiagram
            graph={data.initialArchitectureGraph}
            nodes={data.initialArchitecture}
          />
        </div>
      </section>

      <StudyPromptPanel
        prompts={[
          '지금 보이는 증상은 compute, data, network 중 어디에 가까운가?',
          '선택지가 문제 원인을 직접 줄이는가, 아니면 증상만 완화하는가?',
          '선택 후 비용, 정합성, 운영 복잡도 중 새로 생기는 부담은 무엇인가?',
        ]}
        title="풀기 전 판단 질문"
      />

      <RelatedLearningDocumentCards
        documents={data.relatedLearningDocuments}
        title="관련 학습 문서"
      />

      <ScenarioSimulationPanel
        initialGraph={data.initialArchitectureGraph}
        initialNodes={data.initialArchitecture}
        key={data.id}
        options={data.options}
        scenarioId={data.id}
      />
    </article>
  )
}

function ScenarioSimulationPanel({
  initialGraph,
  initialNodes,
  scenarioId,
  options,
}: {
  initialGraph?: ArchitectureGraph
  initialNodes: string[]
  scenarioId: string
  options: ScenarioOption[]
}) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null)
  const [simulationLoading, setSimulationLoading] = useState(false)
  const [simulationError, setSimulationError] = useState<string | null>(null)
  const selectedOptionSet = useMemo(() => new Set(selectedOptions), [selectedOptions])
  const selectedOptionDetails = useMemo(
    () => options.filter((option) => selectedOptionSet.has(option.id)),
    [options, selectedOptionSet],
  )
  const previewScores = useMemo(
    () => mergeOptionEffects(selectedOptionDetails),
    [selectedOptionDetails],
  )

  function toggleOption(optionId: string) {
    setSelectedOptions((current) =>
      current.includes(optionId)
        ? current.filter((id) => id !== optionId)
        : [...current, optionId],
    )
  }

  async function handleSimulationSubmit() {
    if (selectedOptions.length === 0) return

    try {
      setSimulationLoading(true)
      setSimulationError(null)
      setSimulationResult(await simulateScenario(scenarioId, selectedOptions))
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
      <section className="detail-section solve-section" id="scenario-options">
        <div className="section-title-row">
          <div>
            <span className="section-kicker">선택</span>
            <h2>어떤 변경이 원인을 해결하나요?</h2>
          </div>
          <span className="selection-count">{selectedOptions.length}개 선택</span>
        </div>
        <div className="solve-layout">
          <div className="option-list">
            {options.map((option) => (
              <label
                className={`option-card selectable${
                  selectedOptions.includes(option.id) ? ' selected' : ''
                }`}
                key={option.id}
              >
                <input
                  checked={selectedOptions.includes(option.id)}
                  disabled={simulationLoading}
                  onChange={() => toggleOption(option.id)}
                  type="checkbox"
                />
                <h3>{option.name}</h3>
                <p>{option.description}</p>
                <ScoreList scores={option.effects} />
                {option.feedback && <p className="muted">검토 포인트: {option.feedback}</p>}
              </label>
            ))}
          </div>

          <aside className="solve-summary">
            <h3>선택 요약</h3>
            {selectedOptionDetails.length === 0 ? (
              <p className="helper-text">현재 문제 원인에 직접 대응하는 변경을 선택하세요.</p>
            ) : (
              <>
                <ul className="selected-option-list">
                  {selectedOptionDetails.map((option) => (
                    <li key={option.id}>{option.name}</li>
                  ))}
                </ul>
                <ScoreList scores={previewScores} />
                <p className="helper-text">
                  점수는 선택의 방향을 보는 보조 자료입니다. 최종 평가는 문제 원인과
                  부작용을 함께 비교합니다.
                </p>
              </>
            )}
            <button
              className="button primary simulate-button"
              disabled={selectedOptions.length === 0 || simulationLoading}
              onClick={handleSimulationSubmit}
              type="button"
            >
              {simulationLoading ? '시뮬레이션 실행 중...' : '결과 확인'}
            </button>
          </aside>
        </div>
        {simulationError && <StatusMessage message={simulationError} isError />}
      </section>

      {simulationResult && (
        <SimulationResultSection
          initialGraph={initialGraph}
          initialNodes={initialNodes}
          result={simulationResult}
          selectedOptions={options.filter((option) =>
            simulationResult.selectedOptions.includes(option.id),
          )}
        />
      )}
    </>
  )
}

function SimulationResultSection({
  initialGraph,
  initialNodes,
  result,
  selectedOptions,
}: {
  initialGraph?: ArchitectureGraph
  initialNodes: string[]
  result: SimulationResult
  selectedOptions: ScenarioOption[]
}) {
  const resultScores =
    Object.keys(result.effects).length > 0 ? result.effects : mergeOptionEffects(selectedOptions)
  const highlightedNodeIds = useMemo(
    () => findAddedNodeIds(initialGraph, result.finalArchitectureGraph),
    [initialGraph, result.finalArchitectureGraph],
  )

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

      <ResultReview result={result} />

      <div className="result-actions">
        <a className="button" href="#scenario-options">
          선택 다시 보기
        </a>
        <Link className="button primary" to="/architectures/new">
          내 구조로 직접 구성
        </Link>
      </div>

      <div className="architecture-comparison">
        <div>
          <h3>초기 아키텍처</h3>
          <ArchitectureDiagram graph={initialGraph} nodes={initialNodes} />
        </div>
        <div>
          <h3>최종 아키텍처</h3>
          <ArchitectureDiagram
            graph={result.finalArchitectureGraph}
            highlightedNodeIds={highlightedNodeIds}
            nodes={result.finalArchitecture}
          />
        </div>
      </div>

      <RelatedLearningDocumentCards
        documents={result.relatedLearningDocuments}
        title="복습 학습 문서"
      />
    </section>
  )
}

function UserArchitectureListPage() {
  const { data, loading, error } = useApiResource(fetchUserArchitectures)
  const architectures = data ?? []

  if (loading) return <StatusMessage message="사용자 아키텍처를 불러오는 중입니다." />
  if (error) return <StatusMessage message={error} isError />

  return (
    <section>
      <div className="list-header">
      <PageHeader
          title="내 아키텍처"
          description="저장된 구조를 다시 열어 리소스 구성, 연결 수, 변경 이유를 빠르게 비교합니다."
        />
        <Link className="button primary" to="/architectures/new">
          새 아키텍처 작성
        </Link>
      </div>
      <div className="card-list">
        {architectures.map((architecture) => (
          <Link
            className="card"
            key={architecture.architectureId}
            to={`/architectures/${architecture.architectureId}`}
          >
            <div className="meta-row">
              <span>리소스 {architecture.nodeCount}</span>
              <span>연결 {architecture.connectionCount}</span>
              {architecture.updatedAt && <span>수정 {formatDateTime(architecture.updatedAt)}</span>}
            </div>
            <h2>{architecture.title}</h2>
            <p>{architecture.description || '설명 없이 저장된 아키텍처입니다.'}</p>
            <LearningCueList
              cues={[
                architecture.connectionCount > 0
                  ? '연결 관계가 포함된 구조'
                  : '리소스 배치부터 검토 필요',
                architecture.description ? '설계 의도 기록됨' : '설계 의도 추가 권장',
              ]}
            />
            <span className="card-action">구조 다시 살펴보기</span>
          </Link>
        ))}
      </div>
      {architectures.length === 0 && (
        <EmptyLearningState
          actionLabel="빈 캔버스에서 시작"
          description="처음부터 완성된 정답을 만들 필요는 없습니다. 알고 있는 리소스 두세 개를 놓고 검증 피드백으로 빠진 관점을 확인하세요."
          title="아직 저장된 실험 구조가 없습니다."
          to="/architectures/new"
        />
      )}
    </section>
  )
}

function UserArchitectureBuilderPage() {
  const { architectureId } = useParams()
  const navigate = useNavigate()
  const isNew = !architectureId
  const loadCatalog = useCallback(() => fetchUserArchitectureCatalog(), [])
  const loadArchitecture = useCallback(async () => {
    if (!architectureId) return null
    return fetchUserArchitecture(architectureId)
  }, [architectureId])
  const catalogState = useApiResource(loadCatalog)
  const architectureState = useApiResource(loadArchitecture)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [nodes, setNodes] = useState<Node<BuilderNodeData>[]>([])
  const [edges, setEdges] = useState<Edge<BuilderEdgeData>[]>([])
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [validationResult, setValidationResult] =
    useState<UserArchitectureValidationResult | null>(null)
  const [selectedConnectionType, setSelectedConnectionType] = useState('REQUEST_FLOW')
  const [resourceCategoryFilter, setResourceCategoryFilter] = useState('all')
  const [actionError, setActionError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [validating, setValidating] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const idCounter = useRef(0)
  const catalog = catalogState.data
  const architecture = architectureState.data

  useEffect(() => {
    if (!catalog) return

    if (architecture) {
      const nextNodes = toBuilderNodes(architecture, catalog)
      const nextEdges = toBuilderEdges(architecture, catalog)
      queueMicrotask(() => {
        setTitle(architecture.title)
        setDescription(architecture.description)
        setNodes(nextNodes)
        setEdges(nextEdges)
        setValidationResult(null)
        setActionError(null)
      })
      return
    }

    if (isNew) {
      queueMicrotask(() => {
        setTitle('')
        setDescription('')
        setNodes([])
        setEdges([])
        setValidationResult(null)
        setActionError(null)
      })
    }
  }, [architecture, catalog, isNew])

  const issueSeverityByTarget = useMemo(() => {
    const map = new Map<string, string>()
    if (validationResult) {
      [
        ...validationResult.errors,
        ...validationResult.warnings,
        ...validationResult.guidance,
      ].forEach((issue) => {
        if (!issue.targetId) return
        const key = `${issue.targetType}:${issue.targetId}`
        if (!map.has(key) || issue.severity === 'ERROR') map.set(key, issue.severity)
      })
    }
    return map
  }, [validationResult])
  const decoratedNodes = useMemo(
    () => toDisplayBuilderNodes(nodes, issueSeverityByTarget),
    [issueSeverityByTarget, nodes],
  )
  const decoratedEdges = useMemo(
    () => toDisplayBuilderEdges(edges, issueSeverityByTarget),
    [edges, issueSeverityByTarget],
  )
  const selectedResource = selectedNodeId
    ? nodes.find((node) => node.id === selectedNodeId) ?? null
    : null
  const selectedConnection = catalog?.connectionTypes.find(
    (connectionType) => connectionType.key === selectedConnectionType,
  )
  const resourceCategories = useMemo(
    () =>
      catalog
        ? uniqueValues(catalog.resourceTypes.map((resource) => resource.visualizationCategory))
        : [],
    [catalog],
  )
  const filteredResourceTypes = useMemo(
    () =>
      catalog
        ? catalog.resourceTypes.filter((resource) =>
            matchesFilter(resource.visualizationCategory, resourceCategoryFilter),
          )
        : [],
    [catalog, resourceCategoryFilter],
  )
  const architectureFocus = useMemo(
    () => summarizeBuilderComposition(nodes, edges),
    [edges, nodes],
  )

  const onNodesChange = useCallback((changes: NodeChange<Node<BuilderNodeData>>[]) => {
    setNodes((current) => applyNodeChanges<Node<BuilderNodeData>>(changes, current))
  }, [])

  const onEdgesChange = useCallback((changes: EdgeChange<Edge<BuilderEdgeData>>[]) => {
    setEdges((current) => applyEdgeChanges<Edge<BuilderEdgeData>>(changes, current))
  }, [])

  const onConnect = useCallback((connection: Connection) => {
    if (!connection.source || !connection.target) return

    const sourceHandle = validHandleId(connection.sourceHandle)
    const targetHandle = validHandleId(connection.targetHandle)
    const id = `edge-${connection.source}-${connection.target}-${Date.now()}`
    const connectionType = selectedConnectionType
    const displayName = selectedConnection?.displayName ?? formatResourceType(connectionType)
    const edge: Edge<BuilderEdgeData> = {
      ...(sourceHandle ? { sourceHandle } : {}),
      ...(targetHandle ? { targetHandle } : {}),
      data: {
        connectionType,
        displayName,
      },
      id,
      label: displayName,
      markerEnd: {
        color: connectionColor(connectionType),
        type: MarkerType.ArrowClosed,
      },
      source: connection.source,
      style: {
        stroke: connectionColor(connectionType),
        strokeWidth: 1.9,
      },
      target: connection.target,
      type: 'smoothstep',
    }

    setEdges((current) => addEdge(edge, current))
    setValidationResult(null)
  }, [selectedConnection?.displayName, selectedConnectionType])

  function addResource(resource: UserArchitectureResourceType) {
    const id = nextBuilderId(idCounter, resource.key.toLowerCase())
    setNodes((current) => [
      ...current,
      {
        data: {
          category: resource.visualizationCategory,
          description: resource.description,
          displayName: resource.displayName,
          icon: resourceVisualMeta(resource.key, resource.visualizationCategory).icon,
          resourceType: resource.key,
        },
        id,
        position: nextResourcePosition(current),
        type: 'builder',
      },
    ])
    setSelectedNodeId(id)
    setValidationResult(null)
  }

  function updateSelectedNodeName(displayName: string) {
    if (!selectedNodeId) return
    setNodes((current) =>
      current.map((node) =>
        node.id === selectedNodeId
          ? { ...node, data: { ...node.data, displayName } }
          : node,
      ),
    )
    setValidationResult(null)
  }

  function deleteSelected() {
    if (selectedNodeId) {
      setNodes((current) => current.filter((node) => node.id !== selectedNodeId))
      setEdges((current) =>
        current.filter(
          (edge) => edge.source !== selectedNodeId && edge.target !== selectedNodeId,
        ),
      )
      setSelectedNodeId(null)
      setValidationResult(null)
    }
  }

  async function handleValidate() {
    try {
      setValidating(true)
      setActionError(null)
      setValidationResult(await validateUserArchitecture(toSavePayload(title, description, nodes, edges)))
    } catch (err) {
      setActionError(err instanceof Error ? err.message : '검증 중 오류가 발생했습니다.')
    } finally {
      setValidating(false)
    }
  }

  async function handleSave() {
    try {
      setSaving(true)
      setActionError(null)
      const payload = toSavePayload(title, description, nodes, edges)
      const saved = isNew
        ? await createUserArchitecture(payload)
        : await updateUserArchitecture(architectureId, payload)
      setValidationResult(null)
      navigate(`/architectures/${saved.architectureId}`, { replace: true })
    } catch (err) {
      setActionError(err instanceof Error ? err.message : '저장 중 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!architectureId) return

    try {
      setDeleting(true)
      setActionError(null)
      await deleteUserArchitecture(architectureId)
      navigate('/architectures')
    } catch (err) {
      setActionError(err instanceof Error ? err.message : '삭제 중 오류가 발생했습니다.')
    } finally {
      setDeleting(false)
    }
  }

  if (catalogState.loading || architectureState.loading) {
    return <StatusMessage message="아키텍처 빌더를 불러오는 중입니다." />
  }
  if (catalogState.error) return <StatusMessage message={catalogState.error} isError />
  if (architectureState.error) return <StatusMessage message={architectureState.error} isError />
  if (!catalog) return <StatusMessage message="지원 리소스 카탈로그가 없습니다." isError />

  return (
    <section>
      <Link className="back-link" to="/architectures">
        ← 내 아키텍처 목록
      </Link>
      <div className="builder-header">
        <PageHeader
          title={isNew ? '아키텍처 실험하기' : '아키텍처 다시 살펴보기'}
          description="정답을 관리하는 화면이 아니라, 구조를 만들며 빠진 운영 관점을 발견하는 학습 공간입니다."
        />
        <div className="builder-actions">
          <button className="button" disabled={validating} onClick={handleValidate} type="button">
            {validating ? '검증 중...' : '검증'}
          </button>
          <button
            className="button primary"
            disabled={saving || title.trim().length === 0}
            onClick={handleSave}
            type="button"
          >
            {saving ? '저장 중...' : '저장'}
          </button>
          {!isNew && (
            <button className="button danger" disabled={deleting} onClick={handleDelete} type="button">
              {deleting ? '삭제 중...' : '삭제'}
            </button>
          )}
        </div>
      </div>

      <div className="builder-form">
        <label>
          제목
          <input
            onChange={(event) => setTitle(event.target.value)}
            placeholder="예: 조회 부하 분산 구조"
            value={title}
          />
        </label>
        <label>
          설명
          <textarea
            onChange={(event) => setDescription(event.target.value)}
            placeholder="구조를 만든 이유나 검토할 운영 상황을 적습니다."
            value={description}
          />
        </label>
      </div>

      <LearningContextBar
        items={[
          '아는 리소스부터 배치',
          '연결 의미를 골라 관계 표현',
          '검증 결과로 빈 관점 찾기',
        ]}
      />

      <div className="builder-layout">
        <aside className="builder-sidebar">
          <section className="builder-guide">
            <h2>실험 질문</h2>
            <ul className="question-list">
              <li>요청은 어디에서 들어와 어디까지 이동하나요?</li>
              <li>외부에 노출되면 안 되는 리소스는 무엇인가요?</li>
              <li>장애가 나면 대체 경로나 복제 구성이 있나요?</li>
            </ul>
          </section>

          <section className="builder-guide">
            <h2>현재 구조 관찰</h2>
            <dl className="builder-insight-list">
              {architectureFocus.map((item) => (
                <div key={item.label}>
                  <dt>{item.label}</dt>
                  <dd>{item.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section>
            <h2>연결 타입</h2>
            <label className="field-label">
              새 연결 의미
              <select
                onChange={(event) => setSelectedConnectionType(event.target.value)}
                value={selectedConnectionType}
              >
                {catalog.connectionTypes.map((connectionType) => (
                  <option key={connectionType.key} value={connectionType.key}>
                    {connectionType.displayName}
                  </option>
                ))}
              </select>
            </label>
            {selectedConnection?.meaning && (
              <p className="helper-text">{selectedConnection.meaning}</p>
            )}
          </section>

          <section>
            <h2>리소스 추가</h2>
            <label className="field-label">
              리소스 범주
              <select
                onChange={(event) => setResourceCategoryFilter(event.target.value)}
                value={resourceCategoryFilter}
              >
                <option value="all">전체</option>
                {resourceCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>
            <div className="resource-catalog">
              {filteredResourceTypes.map((resource) => {
                const meta = resourceVisualMeta(resource.key, resource.visualizationCategory)

                return (
                  <button
                    className={`resource-button tone-${meta.tone}`}
                    key={resource.key}
                    onClick={() => addResource(resource)}
                    type="button"
                  >
                    <span className="resource-badge" aria-hidden="true">
                      {meta.icon}
                    </span>
                    <span className="resource-copy">
                      <strong>{resource.displayName}</strong>
                      <em>{resource.visualizationCategory}</em>
                      <span>{resource.learningPurpose}</span>
                    </span>
                  </button>
                )
              })}
            </div>
          </section>

          <BuilderSelectionPanel
            onDelete={deleteSelected}
            onRename={updateSelectedNodeName}
            selectedResource={selectedResource}
          />
        </aside>

        <div className="builder-workspace">
          <div className="builder-toolbar" aria-label="아키텍처 작성 상태">
            <span>리소스 {nodes.length}</span>
            <span>연결 {edges.length}</span>
            <span>새 연결: {selectedConnection?.displayName ?? formatResourceType(selectedConnectionType)}</span>
          </div>
          <div className="builder-canvas" aria-label="사용자 아키텍처 빌더">
          {nodes.length === 0 && (
            <div className="canvas-empty-hint">
              <strong>캔버스가 비어 있습니다.</strong>
              <p>왼쪽에서 Client, ALB, EC2, RDS처럼 알고 있는 리소스부터 추가하세요.</p>
            </div>
          )}
          <ReactFlow
            colorMode="light"
            edges={decoratedEdges}
            fitView
            fitViewOptions={{ padding: 0.08 }}
            maxZoom={1.25}
            minZoom={0.2}
            nodes={decoratedNodes}
            nodeTypes={builderNodeTypes}
            onConnect={onConnect}
            onEdgesChange={onEdgesChange}
            nodesDraggable
            onNodeClick={(_, node) => {
              setSelectedNodeId(node.id)
            }}
            onNodesChange={onNodesChange}
            onPaneClick={() => {
              setSelectedNodeId(null)
            }}
            panOnScroll
            preventScrolling={false}
            proOptions={{ hideAttribution: true }}
          >
            <Background color="#cbd5e1" gap={24} />
            <Controls />
          </ReactFlow>
          </div>
        </div>
      </div>

      {actionError && <StatusMessage message={actionError} isError />}
      <ValidationResultPanel result={validationResult} />
    </section>
  )
}

function BuilderSelectionPanel({
  onDelete,
  onRename,
  selectedResource,
}: {
  onDelete: () => void
  onRename: (displayName: string) => void
  selectedResource: Node<BuilderNodeData> | null
}) {
  if (!selectedResource) {
    return (
      <section>
        <h2>선택 항목</h2>
        <p className="helper-text">리소스를 선택하면 이름 변경과 삭제를 할 수 있습니다.</p>
      </section>
    )
  }

  if (selectedResource) {
    return (
      <section>
        <h2>선택 리소스</h2>
        <label className="field-label">
          표시 이름
          <input
            onChange={(event) => onRename(event.target.value)}
            value={selectedResource.data.displayName}
          />
        </label>
        <p className="helper-text">{selectedResource.data.resourceType}</p>
        {selectedResource.data.description && (
          <p className="helper-text">{selectedResource.data.description}</p>
        )}
        <button className="button danger" onClick={onDelete} type="button">
          선택 삭제
        </button>
      </section>
    )
  }
}

function LearningContextBar({ items }: { items: string[] }) {
  return (
    <ol className="context-steps" aria-label="현재 학습 단계">
      {items.map((item, index) => (
        <li key={item}>
          <span>{index + 1}</span>
          {item}
        </li>
      ))}
    </ol>
  )
}

function LearningCueList({ cues }: { cues: string[] }) {
  const visibleCues = cues.filter(Boolean)
  if (visibleCues.length === 0) return null

  return (
    <ul className="learning-cue-list">
      {visibleCues.map((cue) => (
        <li key={cue}>{cue}</li>
      ))}
    </ul>
  )
}

function StudyPromptPanel({
  prompts,
  title,
}: {
  prompts: string[]
  title: string
}) {
  return (
    <section className="study-prompt-panel">
      <h2>{title}</h2>
      <ul>
        {prompts.map((prompt) => (
          <li key={prompt}>{prompt}</li>
        ))}
      </ul>
    </section>
  )
}

function EmptyLearningState({
  actionLabel,
  description,
  title,
  to,
}: {
  actionLabel: string
  description: string
  title: string
  to: string
}) {
  return (
    <section className="empty-learning-state">
      <h2>{title}</h2>
      <p>{description}</p>
      <Link className="button primary" to={to}>
        {actionLabel}
      </Link>
    </section>
  )
}

function FilterBar({
  categoryFilter,
  categoryOptions,
  levelFilter,
  levelOptions,
  onCategoryChange,
  onLevelChange,
  resultCount,
}: {
  categoryFilter: string
  categoryOptions: string[]
  levelFilter: string
  levelOptions: string[]
  onCategoryChange: (value: string) => void
  onLevelChange: (value: string) => void
  resultCount: number
}) {
  return (
    <div className="filter-bar" aria-label="목록 필터">
      <label>
        카테고리
        <select
          onChange={(event) => onCategoryChange(event.target.value)}
          value={categoryFilter}
        >
          <option value="all">전체</option>
          {categoryOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
      <label>
        난이도
        <select onChange={(event) => onLevelChange(event.target.value)} value={levelFilter}>
          <option value="all">전체</option>
          {levelOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
      <span>{resultCount}개 항목</span>
    </div>
  )
}

function ValidationResultPanel({ result }: { result: UserArchitectureValidationResult | null }) {
  if (!result) return null

  return (
    <section className="validation-panel">
      <div className="result-header">
        <h2>검증 결과</h2>
        <span className={`result-badge ${result.valid ? 'good' : 'wrong'}`}>
          {result.valid ? 'VALID' : 'CHECK'}
        </span>
      </div>
      <ValidationIssueList issues={result.errors} title="오류" />
      <ValidationIssueList issues={result.warnings} title="경고" />
      <ValidationIssueList issues={result.guidance} title="학습 가이드" />
    </section>
  )
}

function ValidationIssueList({
  issues,
  title,
}: {
  issues: UserArchitectureValidationIssue[]
  title: string
}) {
  if (issues.length === 0) return null

  return (
    <div className="validation-group">
      <h3>{title}</h3>
      <ul>
        {issues.map((issue) => (
          <li key={`${issue.code}-${issue.targetId ?? 'architecture'}`}>
            <strong>{issue.message}</strong>
            <span>{issue.reason}</span>
            {issue.targetId && <em>{issue.targetType}: {issue.targetId}</em>}
          </li>
        ))}
      </ul>
    </div>
  )
}

function ResultReview({ result }: { result: SimulationResult }) {
  const { review } = result
  const hasReview =
    review.reason ||
    review.strengths.length > 0 ||
    review.limitations.length > 0 ||
    review.missedTradeOffs.length > 0 ||
    review.nextStep

  if (!hasReview && result.detail.length === 0) return null

  return (
    <div className="review-grid">
      {review.reason && (
        <ReviewBlock title="판단 이유">
          <p>{review.reason}</p>
        </ReviewBlock>
      )}
      <ReviewListBlock items={review.strengths} title="장점" />
      <ReviewListBlock items={review.limitations} title="한계" />
      <ReviewListBlock items={review.missedTradeOffs} title="놓친 trade-off" />
      {review.nextStep && (
        <ReviewBlock title="다음 학습">
          <p>{review.nextStep}</p>
        </ReviewBlock>
      )}
      {!hasReview && result.detail.length > 0 && (
        <ReviewListBlock items={result.detail} title="피드백" />
      )}
    </div>
  )
}

function ReviewListBlock({ items, title }: { items: string[]; title: string }) {
  if (items.length === 0) return null

  return (
    <ReviewBlock title={title}>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </ReviewBlock>
  )
}

function ReviewBlock({ children, title }: { children: ReactNode; title: string }) {
  return (
    <section className="review-block">
      <h3>{title}</h3>
      {children}
    </section>
  )
}

function RelatedScenarioCards({ scenarios }: { scenarios: RelatedScenario[] }) {
  if (scenarios.length === 0) return null

  return (
    <section className="detail-section">
      <h2>관련 시나리오</h2>
      <div className="card-list">
        {scenarios.map((scenario) => (
          <Link className="card compact-card" key={scenario.id} to={`/scenarios/${scenario.id}`}>
            <div className="meta-row">
              <span>{scenario.category}</span>
              <span>{scenario.level}</span>
            </div>
            <h3>{scenario.title}</h3>
            {scenario.summary && <p>{scenario.summary}</p>}
            {scenario.reason && <p className="reason-text">{scenario.reason}</p>}
          </Link>
        ))}
      </div>
    </section>
  )
}

function RelatedLearningDocumentCards({
  documents,
  title,
}: {
  documents: RelatedLearningDocument[]
  title: string
}) {
  if (documents.length === 0) return null

  return (
    <section className="detail-section">
      <h2>{title}</h2>
      <div className="card-list">
        {documents.map((document) => (
          <Link className="card compact-card" key={document.id} to={`/docs/${document.id}`}>
            <div className="meta-row">
              {document.category && <span>{document.category}</span>}
              {document.level && <span>{document.level}</span>}
            </div>
            <h3>{document.title}</h3>
            {document.summary && <p>{document.summary}</p>}
            {document.reviewReason && <p className="reason-text">{document.reviewReason}</p>}
          </Link>
        ))}
      </div>
    </section>
  )
}

function ArchitectureDiagram({
  graph,
  highlightedNodeIds = [],
  nodes,
}: {
  graph?: ArchitectureGraph
  highlightedNodeIds?: string[]
  nodes: string[]
}) {
  if (graph) {
    return <ArchitectureFlow graph={graph} highlightedNodeIds={highlightedNodeIds} />
  }

  return <MermaidArchitectureDiagram nodes={nodes} />
}

function ArchitectureFlow({
  graph,
  highlightedNodeIds,
}: {
  graph: ArchitectureGraph
  highlightedNodeIds: string[]
}) {
  const highlightedNodeSet = useMemo(() => new Set(highlightedNodeIds), [highlightedNodeIds])
  const flowNodes = useMemo(
    () => toFlowNodes(graph, highlightedNodeSet),
    [graph, highlightedNodeSet],
  )
  const flowEdges = useMemo(() => toFlowEdges(graph), [graph])

  if (graph.nodes.length === 0) {
    return <StatusMessage message="아키텍처 정보가 없습니다." />
  }

  return (
    <div aria-label="아키텍처 다이어그램" className="architecture-diagram architecture-flow">
      <ReactFlow
        colorMode="light"
        edges={flowEdges}
        fitView
        fitViewOptions={{ padding: 0.18 }}
        maxZoom={1.4}
        minZoom={0.45}
        nodes={flowNodes}
        nodeTypes={architectureNodeTypes}
        nodesDraggable={false}
        nodesConnectable={false}
        panOnScroll
        preventScrolling={false}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#cbd5e1" gap={24} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  )
}

function MermaidArchitectureDiagram({ nodes }: { nodes: string[] }) {
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

type ArchitectureNodeData = {
  description?: string
  highlighted: boolean
  label: string
  resourceType: string
}

const ArchitectureFlowNode = memo(function ArchitectureFlowNode({
  data,
}: NodeProps<Node<ArchitectureNodeData>>) {
  return (
    <div
      className={`architecture-flow-node type-${normalizeTypeClass(data.resourceType)}${
        data.highlighted ? ' highlighted' : ''
      }`}
    >
      <Handle className="architecture-handle" position={Position.Left} type="target" />
      <div className="architecture-node-type">{formatResourceType(data.resourceType)}</div>
      <div className="architecture-node-label">{data.label}</div>
      {data.description && <p>{data.description}</p>}
      <Handle className="architecture-handle" position={Position.Right} type="source" />
    </div>
  )
})

const architectureNodeTypes = {
  architecture: ArchitectureFlowNode,
}

type BuilderNodeData = {
  category: string
  count?: number
  description: string
  displayName: string
  icon: string
  issueSeverity?: string
  resourceType: string
}

type BuilderEdgeData = {
  connectionType: string
  displayName: string
  issueSeverity?: string
}

const BuilderFlowNode = memo(function BuilderFlowNode({
  data,
}: NodeProps<Node<BuilderNodeData>>) {
  const meta = resourceVisualMeta(data.resourceType, data.category)

  return (
    <div
      className={`builder-flow-node tone-${meta.tone} type-${normalizeTypeClass(data.resourceType)} ${toBuilderIssueClass(data.issueSeverity)}`}
    >
      <Handle className="builder-hidden-handle" position={Position.Left} type="target" />
      <div className="builder-node-heading">
        <span className="builder-node-icon" aria-hidden="true">
          {data.icon || meta.icon}
        </span>
        <span>
          <span className="architecture-node-type">
            {data.category || formatResourceType(data.resourceType)}
          </span>
          <span className="architecture-node-label">{data.displayName}</span>
          {data.count && data.count > 1 && (
            <span className="builder-node-count">x {data.count}</span>
          )}
        </span>
      </div>
      <Handle className="builder-hidden-handle" position={Position.Right} type="source" />
    </div>
  )
})

const builderNodeTypes = {
  builder: BuilderFlowNode,
}

function toFlowNodes(
  graph: ArchitectureGraph,
  highlightedNodeIds: Set<string>,
): Node<ArchitectureNodeData>[] {
  const levels = getNodeLevels(graph)
  const rowsByLevel = new Map<number, number>()

  return graph.nodes.map((graphNode) => {
    const level = levels.get(graphNode.id) ?? 0
    const row = rowsByLevel.get(level) ?? 0
    rowsByLevel.set(level, row + 1)

    return {
      id: graphNode.id,
      data: {
        description: graphNode.description,
        highlighted: highlightedNodeIds.has(graphNode.id),
        label: graphNode.label,
        resourceType: graphNode.type,
      },
      position: {
        x: level * 260,
        y: row * 150,
      },
      type: 'architecture',
    }
  })
}

function toFlowEdges(graph: ArchitectureGraph): Edge[] {
  return graph.edges.map((edge, index) => ({
    id: `${edge.source}-${edge.target}-${index}`,
    label: edge.label,
    markerEnd: {
      color: '#64748b',
      type: MarkerType.ArrowClosed,
    },
    source: edge.source,
    style: {
      stroke: '#64748b',
      strokeWidth: 1.8,
    },
    target: edge.target,
    type: 'smoothstep',
  }))
}

function getNodeLevels(graph: ArchitectureGraph) {
  const levels = new Map<string, number>()
  const incomingCount = new Map(graph.nodes.map((node) => [node.id, 0]))
  const outgoingEdges = new Map<string, string[]>()

  graph.edges.forEach((edge) => {
    incomingCount.set(edge.target, (incomingCount.get(edge.target) ?? 0) + 1)
    outgoingEdges.set(edge.source, [...(outgoingEdges.get(edge.source) ?? []), edge.target])
  })

  const queue = graph.nodes
    .filter((node) => (incomingCount.get(node.id) ?? 0) === 0)
    .map((node) => node.id)

  graph.nodes.forEach((node) => levels.set(node.id, 0))

  for (let cursor = 0; cursor < queue.length; cursor += 1) {
    const nodeId = queue[cursor]
    const nextLevel = (levels.get(nodeId) ?? 0) + 1

    outgoingEdges.get(nodeId)?.forEach((targetId) => {
      if (nextLevel > (levels.get(targetId) ?? 0)) {
        levels.set(targetId, nextLevel)
      }

      incomingCount.set(targetId, (incomingCount.get(targetId) ?? 1) - 1)
      if (incomingCount.get(targetId) === 0) queue.push(targetId)
    })
  }

  return levels
}

function findAddedNodeIds(
  initialGraph: ArchitectureGraph | undefined,
  finalGraph: ArchitectureGraph | undefined,
) {
  if (!initialGraph || !finalGraph) return []

  const initialNodeIds = new Set(initialGraph.nodes.map((node) => node.id))
  return finalGraph.nodes
    .filter((node) => !initialNodeIds.has(node.id))
    .map((node) => node.id)
}

function normalizeTypeClass(type: string) {
  return type.toLowerCase().replace(/[^a-z0-9]+/g, '-')
}

function formatResourceType(type: string) {
  return type.replace(/_/g, ' ')
}

function resourceVisualMeta(resourceType: string, category: string) {
  const byType: Record<string, { icon: string; tone: string }> = {
    AVAILABILITY_ZONE: { icon: 'AZ', tone: 'network' },
    CLIENT: { icon: 'U', tone: 'actor' },
    VPC: { icon: 'VPC', tone: 'network' },
    SUBNET: { icon: 'SUB', tone: 'network' },
    EC2: { icon: 'EC2', tone: 'compute' },
    ALB: { icon: 'ALB', tone: 'traffic' },
    TARGET_GROUP: { icon: 'TG', tone: 'traffic' },
    AUTO_SCALING_GROUP: { icon: 'ASG', tone: 'compute' },
    RDS: { icon: 'DB', tone: 'data' },
    RDS_STANDBY: { icon: 'DB', tone: 'data' },
    READ_REPLICA: { icon: 'RR', tone: 'data' },
    REDIS: { icon: 'RD', tone: 'cache' },
    CONNECTION_POOL: { icon: 'CP', tone: 'application' },
    HEALTH_CHECK: { icon: 'HC', tone: 'operations' },
    NAT_GATEWAY: { icon: 'NAT', tone: 'network' },
    INTERNET_GATEWAY: { icon: 'IGW', tone: 'network' },
    SECURITY_GROUP: { icon: 'SG', tone: 'security' },
    EXTERNAL_SERVICE: { icon: 'EXT', tone: 'external' },
  }
  const byCategory: Record<string, string> = {
    ACTOR: 'actor',
    APPLICATION: 'application',
    CACHE: 'cache',
    COMPUTE: 'compute',
    DATA: 'data',
    EXTERNAL: 'external',
    NETWORK: 'network',
    OPERATIONS: 'operations',
    SECURITY: 'security',
    TRAFFIC: 'traffic',
  }

  return byType[resourceType] ?? { icon: formatResourceType(resourceType).slice(0, 3), tone: byCategory[category] ?? 'default' }
}

function uniqueValues(values: string[]) {
  return [...new Set(values.filter(Boolean))].sort((left, right) => left.localeCompare(right))
}

function matchesFilter(value: string, filter: string) {
  return filter === 'all' || value === filter
}

function architecturePreview(nodes: string[]) {
  const visibleNodes = nodes.map((node) => node.trim()).filter(Boolean)
  if (visibleNodes.length === 0) return '구조 정보 없음'
  if (visibleNodes.length <= 3) return visibleNodes.join(' -> ')
  return `${visibleNodes.slice(0, 3).join(' -> ')} 외 ${visibleNodes.length - 3}개`
}

function summarizeBuilderComposition(
  nodes: Node<BuilderNodeData>[],
  edges: Edge<BuilderEdgeData>[],
) {
  const categories = new Set(nodes.map((node) => node.data.category).filter(Boolean))
  const hasTrafficEntry = nodes.some((node) =>
    ['ALB', 'CLIENT', 'INTERNET_GATEWAY'].includes(node.data.resourceType),
  )
  const hasData = nodes.some((node) =>
    ['RDS', 'READ_REPLICA', 'REDIS'].includes(node.data.resourceType),
  )

  return [
    {
      label: '표현 범위',
      value: categories.size > 0 ? `${categories.size}개 범주` : '리소스 없음',
    },
    {
      label: '요청 흐름',
      value: edges.length > 0 ? `${edges.length}개 연결` : '연결 필요',
    },
    {
      label: '진입 지점',
      value: hasTrafficEntry ? '표현됨' : '검토 필요',
    },
    {
      label: '데이터 계층',
      value: hasData ? '표현됨' : '필요 시 추가',
    },
  ]
}

function connectionColor(connectionType: string) {
  const colors: Record<string, string> = {
    DEPENDS_ON: '#64748b',
    NETWORK_ROUTE: '#059669',
    REPLICATION: '#7c3aed',
    REQUEST_FLOW: '#2563eb',
    SECURITY_RULE: '#dc2626',
  }

  return colors[connectionType] ?? '#64748b'
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

function toBuilderNodes(
  architecture: UserArchitectureDetail,
  catalog: UserArchitectureCatalog,
): Node<BuilderNodeData>[] {
  const resourceTypesByKey = new Map(catalog.resourceTypes.map((resource) => [resource.key, resource]))
  const builderNodes: Node<BuilderNodeData>[] = []

  architecture.nodes.forEach((node) => {
    const resource = resourceTypesByKey.get(node.resourceType)
    builderNodes.push({
      data: {
        category: resource?.visualizationCategory ?? '',
        description: resource?.description ?? '',
        displayName: node.displayName,
        icon: resourceVisualMeta(node.resourceType, resource?.visualizationCategory ?? '').icon,
        resourceType: node.resourceType,
      },
      id: node.id,
      position: nextResourcePosition(builderNodes),
      type: 'builder',
    })
  })

  return builderNodes
}

function toBuilderEdges(
  architecture: UserArchitectureDetail,
  catalog: UserArchitectureCatalog,
): Edge<BuilderEdgeData>[] {
  const nodeIds = new Set(architecture.nodes.map((node) => node.id))
  const connectionTypesByKey = new Map(
    catalog.connectionTypes.map((connectionType) => [connectionType.key, connectionType]),
  )

  return architecture.connections
    .filter(
      (connection) =>
        nodeIds.has(connection.sourceNodeId) && nodeIds.has(connection.targetNodeId),
    )
    .map((connection) => {
      const displayName =
        connectionTypesByKey.get(connection.connectionType)?.displayName ??
        formatResourceType(connection.connectionType)
      const color = connectionColor(connection.connectionType)

      return {
        data: {
          connectionType: connection.connectionType,
          displayName,
        },
        id: connection.id,
        label: displayName,
        markerEnd: {
          color,
          type: MarkerType.ArrowClosed,
        },
        source: connection.sourceNodeId,
        style: {
          stroke: color,
          strokeWidth: 1.9,
        },
        target: connection.targetNodeId,
        type: 'smoothstep',
      }
    })
}

function toDisplayBuilderNodes(
  nodes: Node<BuilderNodeData>[],
  issueSeverityByTarget: Map<string, string>,
): Node<BuilderNodeData>[] {
  return nodes.map((node) => ({
    ...node,
    data: {
      ...node.data,
      issueSeverity: issueSeverityByTarget.get(`NODE:${node.id}`),
    },
  }))
}

function toDisplayBuilderEdges(
  edges: Edge<BuilderEdgeData>[],
  issueSeverityByTarget: Map<string, string>,
): Edge<BuilderEdgeData>[] {
  return edges.map((edge) => ({
    ...edge,
    className: toBuilderIssueClass(issueSeverityByTarget.get(`CONNECTION:${edge.id}`)),
    data: {
      connectionType: edge.data?.connectionType ?? 'REQUEST_FLOW',
      displayName: edge.data?.displayName ?? 'Request Flow',
      issueSeverity: issueSeverityByTarget.get(`CONNECTION:${edge.id}`),
    },
  }))
}

function toSavePayload(
  title: string,
  description: string,
  nodes: Node<BuilderNodeData>[],
  edges: Edge<BuilderEdgeData>[],
): UserArchitectureSaveRequest {
  return {
    title: title.trim(),
    description: description.trim(),
    nodes: nodes.map(toSaveNode),
    connections: edges.map(toSaveConnection),
  }
}

function toSaveNode(node: Node<BuilderNodeData>): UserArchitectureNode {
  return {
    id: node.id,
    resourceType: node.data.resourceType,
    displayName: node.data.displayName.trim() || node.data.resourceType,
  }
}

function toSaveConnection(edge: Edge<BuilderEdgeData>): UserArchitectureConnection {
  return {
    connectionType: edge.data?.connectionType ?? 'REQUEST_FLOW',
    id: edge.id,
    sourceNodeId: edge.source,
    targetNodeId: edge.target,
  }
}

function nextResourcePosition(currentNodes: Node<BuilderNodeData>[]) {
  const base = { x: 360, y: 240 }
  const columnWidth = 220
  const rowHeight = 140
  const columns = 4

  for (let index = 0; index <= currentNodes.length + columns; index += 1) {
    const candidate = {
      x: base.x + (index % columns) * columnWidth,
      y: base.y + Math.floor(index / columns) * rowHeight,
    }

    if (!isPositionOccupied(candidate, currentNodes)) return candidate
  }

  return {
    x: base.x,
    y: base.y + currentNodes.length * rowHeight,
  }
}

function isPositionOccupied(
  candidate: { x: number; y: number },
  nodes: Node<BuilderNodeData>[],
) {
  return nodes.some(
    (node) =>
      Math.abs(node.position.x - candidate.x) < 180 &&
      Math.abs(node.position.y - candidate.y) < 110,
  )
}

function validHandleId(value: string | null | undefined) {
  if (!value || value === 'null' || value === 'undefined') return undefined
  return value
}

function nextBuilderId(counter: React.MutableRefObject<number>, prefix: string) {
  counter.current += 1
  return `${prefix}-${Date.now()}-${counter.current}`
}

function toBuilderIssueClass(severity: string | undefined) {
  if (severity === 'ERROR') return 'issue-error'
  if (severity === 'WARNING') return 'issue-warning'
  if (severity === 'GUIDANCE') return 'issue-guidance'
  return ''
}

function formatDateTime(value: string) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date)
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
