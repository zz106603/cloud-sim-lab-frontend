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
  effects: ScoreMap
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

export type SimulationResult = {
  scenarioId: string
  selectedOptionIds: string[]
  resultType: 'GOOD' | 'PARTIAL' | 'RISKY' | 'WRONG' | string
  summary: string
  detailFeedback: string[]
  effects: ScoreMap
  finalArchitecture: string[]
  relatedDocumentIds: string[]
}

export type ScoreMap = Record<string, number>

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
    effects: toScoreMap(item.effects),
    feedback: toOptionalText(item.feedback),
  }
}

function toSimulationResult(data: unknown): SimulationResult {
  const item = asRecord(data)

  return {
    scenarioId: toText(item.scenarioId) || toText(item.id),
    selectedOptionIds: toTextList(item.selectedOptionIds),
    resultType: toText(item.resultType),
    summary: toText(item.summary),
    detailFeedback: toFeedbackList(item.detailFeedback),
    effects: toScoreMap(item.effects ?? item.scores ?? item.scoreEffects),
    finalArchitecture: toTextList(item.finalArchitecture),
    relatedDocumentIds: toTextList(item.relatedDocumentIds),
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
