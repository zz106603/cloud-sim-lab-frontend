const API_BASE_URL = 'http://localhost:8080/api'

export type LearningDocument = {
  id: string
  title: string
  category: string
  level: string
  content: string
  orderIndex?: number
  summary?: string
  relatedDocumentIds: string[]
  relatedScenarios: RelatedScenario[]
}

export type RelatedScenario = {
  id: string
  title: string
  category: string
  level: string
  summary?: string
  reason?: string
}

export type ScenarioOption = {
  id: string
  name: string
  description: string
  effects: ScoreMap
  feedback?: string
}

export type Scenario = {
  id: string
  title: string
  category: string
  level: string
  problem: string
  summary: string
  initialArchitecture: string[]
  initialArchitectureGraph?: ArchitectureGraph
  options: ScenarioOption[]
  recommendedOptionIds: string[]
  relatedLearningDocuments: RelatedLearningDocument[]
}

export type SimulationResult = {
  scenarioId: string
  selectedOptions: string[]
  resultType: 'GOOD' | 'PARTIAL' | 'RISKY' | 'WRONG' | string
  summary: string
  detail: string[]
  review: SimulationReview
  effects: ScoreMap
  finalArchitecture: string[]
  finalArchitectureGraph?: ArchitectureGraph
  relatedLearningDocuments: RelatedLearningDocument[]
}

export type SimulationReview = {
  reason?: string
  strengths: string[]
  limitations: string[]
  missedTradeOffs: string[]
  nextStep?: string
}

export type RelatedLearningDocument = {
  id: string
  title: string
  category: string
  level: string
  summary?: string
  reviewReason?: string
}

export type ScoreMap = Record<string, number>

export type ArchitectureGraph = {
  nodes: ArchitectureNode[]
  edges: ArchitectureEdge[]
}

export type ArchitectureNode = {
  id: string
  label: string
  type: string
  description?: string
}

export type ArchitectureEdge = {
  source: string
  target: string
  label?: string
}

export async function fetchDocuments() {
  const data = await request<unknown>('/docs')
  return extractList(data).map(toLearningDocument)
}

export async function fetchDocument(documentId: string) {
  const data = await request<unknown>(`/docs/${encodeURIComponent(documentId)}`)
  return toLearningDocument(data)
}

export async function fetchScenarios() {
  const data = await request<unknown>('/scenarios')
  return extractList(data).map(toScenario)
}

export async function fetchScenario(scenarioId: string) {
  const data = await request<unknown>(`/scenarios/${encodeURIComponent(scenarioId)}`)
  return toScenario(data)
}

export async function simulateScenario(
  scenarioId: string,
  selectedOptionIds: string[],
) {
  const data = await request<unknown>(
    `/scenarios/${encodeURIComponent(scenarioId)}/simulate`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ selectedOptionIds }),
    },
  )

  return toSimulationResult(data)
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, init)

  if (!response.ok) {
    throw new Error(await readErrorMessage(response))
  }

  return response.json() as Promise<T>
}

function extractList(data: unknown): unknown[] {
  if (Array.isArray(data)) return data

  if (isRecord(data)) {
    const candidates = [data.content, data.items, data.scenarios, data.documents, data.results]
    const list = candidates.find(Array.isArray)
    if (list) return list

    if (isRecord(data.data)) return extractList(data.data)
    if (Array.isArray(data.data)) return data.data
  }

  return []
}

function toLearningDocument(data: unknown): LearningDocument {
  const item = asRecord(data)

  return {
    id: toText(item.id),
    title: toText(item.title),
    category: toText(item.category),
    level: toText(item.level),
    content: toText(item.content),
    orderIndex: typeof item.orderIndex === 'number' ? item.orderIndex : undefined,
    summary: toOptionalText(item.summary),
    relatedDocumentIds: toTextList(item.relatedDocumentIds),
    relatedScenarios: extractList(item.relatedScenarios).map(toRelatedScenario),
  }
}

function toScenario(data: unknown): Scenario {
  const item = asRecord(data)
  const id = toText(item.id)

  return {
    id,
    title: toText(item.title),
    category: toText(item.category),
    level: toText(item.level),
    problem: toText(item.problem),
    summary: toText(item.summary) || toText(item.problem),
    initialArchitecture: toTextList(item.initialArchitecture),
    initialArchitectureGraph: toArchitectureGraph(item.initialArchitectureGraph),
    options: extractList(item.options).map(toScenarioOption),
    recommendedOptionIds: toTextList(item.recommendedOptionIds),
    relatedLearningDocuments: toRelatedLearningDocuments(
      item.relatedLearningDocuments ?? item.relatedDocumentIds,
    ),
  }
}

function toRelatedScenario(data: unknown): RelatedScenario {
  const item = asRecord(data)

  return {
    id: toText(item.id),
    title: toText(item.title),
    category: toText(item.category),
    level: toText(item.level),
    summary: toOptionalText(item.summary),
    reason: toOptionalText(item.reason),
  }
}

function toScenarioOption(data: unknown): ScenarioOption {
  const item = asRecord(data)

  return {
    id: toText(item.id),
    name: toText(item.name) || toText(item.label),
    description: toText(item.description),
    effects: toScoreMap(item.effects),
    feedback: toOptionalText(item.feedback),
  }
}

function toSimulationResult(data: unknown): SimulationResult {
  const item = asRecord(data)

  return {
    scenarioId: toText(item.scenarioId) || toText(item.id),
    selectedOptions: toIdList(item.selectedOptions ?? item.selectedOptionIds),
    resultType: toText(item.resultType),
    summary: toText(item.summary),
    detail: toFeedbackList(item.detail ?? item.detailFeedback),
    review: toSimulationReview(item.review ?? item),
    effects: toScoreMap(item.effects ?? item.scores ?? item.scoreEffects),
    finalArchitecture: toTextList(item.finalArchitecture),
    finalArchitectureGraph: toArchitectureGraph(item.finalArchitectureGraph),
    relatedLearningDocuments: toRelatedLearningDocuments(
      item.relatedLearningDocuments ?? item.relatedDocumentIds,
    ),
  }
}

async function readErrorMessage(response: Response) {
  const fallback = `API 요청 실패: ${response.status}`

  try {
    const data = (await response.json()) as unknown
    if (isRecord(data)) {
      return toOptionalText(data.message) ?? toOptionalText(data.error) ?? fallback
    }
  } catch {
    return fallback
  }

  return fallback
}

function toText(value: unknown) {
  if (typeof value === 'string') return value.trim()
  if (typeof value === 'number') return String(value)
  return ''
}

function toOptionalText(value: unknown) {
  return typeof value === 'string' && value.length > 0 ? value : undefined
}

function toTextList(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []
}

function toIdList(value: unknown) {
  if (!Array.isArray(value)) return []

  return value
    .map((item) => (typeof item === 'string' || typeof item === 'number' ? toText(item) : toText(asRecord(item).id)))
    .filter(Boolean)
}

function toRelatedLearningDocuments(value: unknown): RelatedLearningDocument[] {
  if (!Array.isArray(value)) return []

  return value
    .map(toRelatedLearningDocument)
    .filter((document) => document.id.length > 0)
}

function toRelatedLearningDocument(value: unknown): RelatedLearningDocument {
  if (typeof value === 'string' || typeof value === 'number') {
    const id = toText(value)
    return {
      id,
      title: id,
      category: '',
      level: '',
    }
  }

  const item = asRecord(value)
  const id = toText(item.id)

  return {
    id,
    title: toText(item.title) || id,
    category: toText(item.category),
    level: toText(item.level),
    summary: toOptionalText(item.summary),
    reviewReason: toOptionalText(item.reviewReason),
  }
}

function toSimulationReview(value: unknown): SimulationReview {
  const item = asRecord(value)

  return {
    reason: toOptionalText(item.reason),
    strengths: toTextList(item.strengths),
    limitations: toTextList(item.limitations),
    missedTradeOffs: toTextList(item.missedTradeOffs),
    nextStep: toOptionalText(item.nextStep),
  }
}

function toArchitectureGraph(value: unknown): ArchitectureGraph | undefined {
  if (!isRecord(value)) return undefined

  const nodes = extractList(value.nodes).map(toArchitectureNode).filter(isValidArchitectureNode)
  const nodeIds = new Set(nodes.map((node) => node.id))
  const edges = extractList(value.edges)
    .map(toArchitectureEdge)
    .filter((edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target))

  return nodes.length > 0 ? { nodes, edges } : undefined
}

function toArchitectureNode(value: unknown): ArchitectureNode {
  const item = asRecord(value)
  const id = toText(item.id)

  return {
    id,
    label: toText(item.label) || id,
    type: toText(item.type) || 'UNKNOWN',
    description: toOptionalText(item.description),
  }
}

function toArchitectureEdge(value: unknown): ArchitectureEdge {
  const item = asRecord(value)

  return {
    source: toText(item.source),
    target: toText(item.target),
    label: toOptionalText(item.label),
  }
}

function isValidArchitectureNode(node: ArchitectureNode) {
  return node.id.length > 0 && node.label.length > 0
}

function toFeedbackList(value: unknown) {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string')
  }

  const text = toOptionalText(value)
  return text ? [text] : []
}

function toScoreMap(value: unknown): ScoreMap {
  if (!isRecord(value)) return {}

  return Object.fromEntries(
    Object.entries(value).filter((entry): entry is [string, number] => typeof entry[1] === 'number'),
  )
}

function asRecord(value: unknown) {
  return isRecord(value) ? value : {}
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
