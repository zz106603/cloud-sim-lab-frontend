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
}

export type ScenarioOption = {
  id: string
  label: string
  description: string
  feedback?: string
}

export type Scenario = {
  id: string
  title: string
  category: string
  level: string
  problem: string
  initialArchitecture: string[]
  options: ScenarioOption[]
  recommendedOptionIds: string[]
  relatedDocumentIds: string[]
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

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`)

  if (!response.ok) {
    throw new Error(`API 요청 실패: ${response.status}`)
  }

  return response.json() as Promise<T>
}

function extractList(data: unknown): unknown[] {
  if (Array.isArray(data)) return data

  if (isRecord(data)) {
    const candidates = [data.content, data.items, data.data, data.results]
    const list = candidates.find(Array.isArray)
    if (list) return list
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
  }
}

function toScenario(data: unknown): Scenario {
  const item = asRecord(data)

  return {
    id: toText(item.id),
    title: toText(item.title),
    category: toText(item.category),
    level: toText(item.level),
    problem: toText(item.problem),
    initialArchitecture: toTextList(item.initialArchitecture),
    options: extractList(item.options).map(toScenarioOption),
    recommendedOptionIds: toTextList(item.recommendedOptionIds),
    relatedDocumentIds: toTextList(item.relatedDocumentIds),
  }
}

function toScenarioOption(data: unknown): ScenarioOption {
  const item = asRecord(data)

  return {
    id: toText(item.id),
    label: toText(item.label),
    description: toText(item.description),
    feedback: toOptionalText(item.feedback),
  }
}

function toText(value: unknown) {
  return typeof value === 'string' ? value : ''
}

function toOptionalText(value: unknown) {
  return typeof value === 'string' && value.length > 0 ? value : undefined
}

function toTextList(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []
}

function asRecord(value: unknown) {
  return isRecord(value) ? value : {}
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
