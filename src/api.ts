const API_BASE_URL = 'http://localhost:8080/api'

export type LearningDocument = {
  id: string
  title: string
  category: string
  level: string
  content: string
  orderIndex?: number
  summary?: string
  prerequisiteDocumentIds: string[]
  conceptTags: string[]
  relatedDocumentIds: string[]
  relatedModuleIds: string[]
  relatedScenarioIds: string[]
  relatedArchitecturePracticeIds: string[]
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
  initialFailureImpact?: FailureImpact
  options: ScenarioOption[]
  recommendedOptionIds: string[]
  relatedModuleIds: string[]
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
  tradeOffSummary: ScoreMap
  finalArchitecture: string[]
  finalArchitectureGraph?: ArchitectureGraph
  failureImpactResult?: FailureImpactResult
  relatedLearningDocuments: RelatedLearningDocument[]
  reflectionQuestions: SimulationReflectionQuestion[]
  remediation: SimulationRemediation
}

export type SimulationReview = {
  reason?: string
  strengths: string[]
  limitations: string[]
  missedTradeOffs: string[]
  nextStep?: string
}

export type SimulationReflectionQuestion = {
  id: string
  question: string
  relatedOptionId: string
  relatedTradeOffPerspective: string
}

export type SimulationRemediation = {
  reviewDocumentIds: string[]
  retryScenarioIds: string[]
  compareOptionIds: string[]
  missedDecisionCriteria: string[]
}

export type RelatedLearningDocument = {
  id: string
  title: string
  category: string
  level: string
  summary?: string
  reviewReason?: string
}

export type LearningPathSummary = {
  id: string
  title: string
  description: string
  targetLevel: string
  learningGoal: string
  recommended: boolean
  orderIndex: number
  moduleIds: string[]
}

export type LearningPathDetail = Omit<LearningPathSummary, 'moduleIds'> & {
  modules: LearningPathModule[]
}

export type LearningPathModule = {
  id: string
  pathId: string
  title: string
  description: string
  learningGoals: string[]
  prerequisites: string[]
  orderIndex: number
  documentIds: string[]
  relatedScenarioIds: string[]
  relatedArchitecturePracticeIds: string[]
}

export type LearningModule = LearningPathModule & {
  practiceActivities: LearningModulePracticeActivity[]
}

export type LearningModulePracticeActivity = {
  id: string
  type: 'READ_DOCUMENT' | 'RUN_SCENARIO' | 'BUILD_ARCHITECTURE' | string
  title: string
  description: string
  targetResourceId: string
  recommendedOrder: number
}

export type LearningDiscoveryFilters = {
  category?: string
  level?: string
  tag?: string
  resourceType?: 'DOCUMENT' | 'SCENARIO' | 'MODULE' | 'ARCHITECTURE_PRACTICE' | string
}

export type LearningDiscoveryItem = {
  resourceType: string
  id: string
  title: string
  summary: string
  category: string
  level: string
  conceptTags: string[]
  relatedDocumentIds: string[]
  relatedScenarioIds: string[]
  relatedModuleIds: string[]
  relatedArchitecturePracticeIds: string[]
  recommendedPathIncluded: boolean
  orderIndex: number
}

export type ArchitecturePracticeSummary = {
  id: string
  title: string
  description: string
  level: string
  learningGoal: string
  requiredResourceTypes: string[]
  requiredConnectionTypes: string[]
  relatedDocumentIds: string[]
  relatedScenarioIds: string[]
  relatedModuleIds: string[]
}

export type ArchitecturePracticeDetail = ArchitecturePracticeSummary & {
  instructions: string[]
  starterNodes: UserArchitectureNode[]
  starterConnections: UserArchitectureConnection[]
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

export type FailureImpact = {
  failureSourceNodeId?: string
  affectedNodeIds: string[]
  affectedEdges: ArchitectureEdge[]
  userSymptoms: string[]
  remainingRisks: string[]
}

export type FailureImpactResult = {
  recoveredEdges: ArchitectureEdge[]
  remainingImpact?: FailureImpact
  postActionNotes: string[]
}

export type UserArchitectureSummary = {
  architectureId: string
  title: string
  description: string
  createdAt: string
  updatedAt: string
  nodeCount: number
  connectionCount: number
}

export type UserArchitectureDetail = {
  architectureId: string
  title: string
  description: string
  createdAt: string
  updatedAt: string
  nodes: UserArchitectureNode[]
  connections: UserArchitectureConnection[]
}

export type UserArchitectureNode = {
  id: string
  resourceType: string
  displayName: string
}

export type UserArchitectureConnection = {
  id: string
  sourceNodeId: string
  targetNodeId: string
  connectionType: string
}

export type UserArchitectureCatalog = {
  resourceTypes: UserArchitectureResourceType[]
  connectionTypes: UserArchitectureConnectionType[]
}

export type UserArchitectureResourceType = {
  key: string
  displayName: string
  description: string
  visualizationCategory: string
  learningPurpose: string
}

export type UserArchitectureConnectionType = {
  key: string
  displayName: string
  meaning: string
}

export type UserArchitectureSaveRequest = {
  title: string
  description: string
  nodes: UserArchitectureNode[]
  connections: UserArchitectureConnection[]
}

export type UserArchitectureValidationResult = {
  valid: boolean
  errors: UserArchitectureValidationIssue[]
  warnings: UserArchitectureValidationIssue[]
  guidance: UserArchitectureValidationIssue[]
}

export type UserArchitectureValidationIssue = {
  severity: string
  code: string
  targetType: string
  targetId?: string
  message: string
  reason: string
}

export type UserArchitectureComparisonResult = {
  base?: ArchitectureComparisonSummary
  target?: ArchitectureComparisonSummary
  resources: ArchitectureResourceComparison
  connections: ArchitectureConnectionComparison
  scenarioComparison?: ScenarioArchitectureComparison
  tradeOffReferences: TradeOffReference[]
}

export type ArchitectureComparisonSummary = {
  comparisonType: string
  id: string
  title: string
  resourceCount: number
  connectionCount: number
}

export type ArchitectureResourceComparison = {
  added: ArchitectureResourceChange[]
  removed: ArchitectureResourceChange[]
  changed: ArchitectureResourceChange[]
  unchanged: ArchitectureResourceChange[]
}

export type ArchitectureResourceChange = {
  changeType: string
  resourceKey: string
  resourceId: string
  baseResourceType: string
  baseDisplayName: string
  targetResourceType: string
  targetDisplayName: string
  reason: string
}

export type ArchitectureConnectionComparison = {
  added: ArchitectureConnectionChange[]
  removed: ArchitectureConnectionChange[]
  changed: ArchitectureConnectionChange[]
  unchanged: ArchitectureConnectionChange[]
}

export type ArchitectureConnectionChange = {
  changeType: string
  connectionKey: string
  connectionId: string
  baseSourceNodeId: string
  baseTargetNodeId: string
  baseConnectionType: string
  targetSourceNodeId: string
  targetTargetNodeId: string
  targetConnectionType: string
  reason: string
}

export type ScenarioArchitectureComparison = {
  scenarioId: string
  scenarioTitle: string
  learningGoal: string
  missingRecommendedResources: ArchitectureResourceChange[]
  extraResources: ArchitectureResourceChange[]
  learningImpacts: ArchitectureLearningImpact[]
}

export type ArchitectureLearningImpact = {
  code: string
  targetKey: string
  message: string
  reason: string
}

export type TradeOffReference = {
  optionName: string
  reason: string
  effects: ScoreMap
}

export async function fetchLearningPaths() {
  const data = await request<unknown>('/learning-paths')
  return extractList(data).map(toLearningPathSummary)
}

export async function fetchLearningPath(pathId: string) {
  const data = await request<unknown>(`/learning-paths/${encodeURIComponent(pathId)}`)
  return toLearningPathDetail(data)
}

export async function fetchLearningModules() {
  const data = await request<unknown>('/learning-modules')
  return extractList(data).map(toLearningModule)
}

export async function fetchLearningModule(moduleId: string) {
  const data = await request<unknown>(`/learning-modules/${encodeURIComponent(moduleId)}`)
  return toLearningModule(data)
}

export async function fetchLearningDiscovery(filters: LearningDiscoveryFilters = {}) {
  const params = new URLSearchParams()

  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.set(key, value)
  })

  const query = params.toString()
  const data = await request<unknown>(`/learning-discovery${query ? `?${query}` : ''}`)
  return extractList(data).map(toLearningDiscoveryItem)
}

export async function fetchArchitecturePractices() {
  const data = await request<unknown>('/architecture-practices')
  return extractList(data).map(toArchitecturePracticeSummary)
}

export async function fetchArchitecturePractice(practiceId: string) {
  const data = await request<unknown>(`/architecture-practices/${encodeURIComponent(practiceId)}`)
  return toArchitecturePracticeDetail(data)
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

export async function fetchUserArchitectureCatalog() {
  const data = await request<unknown>('/user-architectures/catalog')
  return toUserArchitectureCatalog(data)
}

export async function fetchUserArchitectures() {
  const data = await request<unknown>('/user-architectures')
  return extractList(data).map(toUserArchitectureSummary)
}

export async function fetchUserArchitecture(architectureId: string) {
  const data = await request<unknown>(
    `/user-architectures/${encodeURIComponent(architectureId)}`,
  )
  return toUserArchitectureDetail(data)
}

export async function createUserArchitecture(payload: UserArchitectureSaveRequest) {
  const data = await request<unknown>('/user-architectures', jsonRequest('POST', payload))
  return toUserArchitectureDetail(data)
}

export async function updateUserArchitecture(
  architectureId: string,
  payload: UserArchitectureSaveRequest,
) {
  const data = await request<unknown>(
    `/user-architectures/${encodeURIComponent(architectureId)}`,
    jsonRequest('PUT', payload),
  )
  return toUserArchitectureDetail(data)
}

export async function deleteUserArchitecture(architectureId: string) {
  await requestVoid(`/user-architectures/${encodeURIComponent(architectureId)}`, {
    method: 'DELETE',
  })
}

export async function validateUserArchitecture(
  payload: Pick<UserArchitectureSaveRequest, 'nodes' | 'connections'>,
) {
  const data = await request<unknown>(
    '/user-architectures/validate',
    jsonRequest('POST', payload),
  )
  return toUserArchitectureValidationResult(data)
}

export async function compareUserArchitectures(
  baseArchitectureId: string,
  targetArchitectureId: string,
) {
  const data = await request<unknown>(
    '/user-architectures/compare',
    jsonRequest('POST', { baseArchitectureId, targetArchitectureId }),
  )
  return toUserArchitectureComparisonResult(data)
}

export async function compareUserArchitectureWithScenario(
  architectureId: string,
  scenarioId: string,
) {
  const data = await request<unknown>(
    `/user-architectures/${encodeURIComponent(architectureId)}/comparison/scenarios/${encodeURIComponent(scenarioId)}`,
  )
  return toUserArchitectureComparisonResult(data)
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, init)

  if (!response.ok) {
    throw new Error(await readErrorMessage(response))
  }

  return response.json() as Promise<T>
}

async function requestVoid(path: string, init?: RequestInit) {
  const response = await fetch(`${API_BASE_URL}${path}`, init)

  if (!response.ok) {
    throw new Error(await readErrorMessage(response))
  }
}

function jsonRequest(method: 'POST' | 'PUT', payload: unknown): RequestInit {
  return {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  }
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
    prerequisiteDocumentIds: toTextList(item.prerequisiteDocumentIds),
    conceptTags: toTextList(item.conceptTags),
    relatedDocumentIds: toTextList(item.relatedDocumentIds ?? item.prerequisiteDocumentIds),
    relatedModuleIds: toTextList(item.relatedModuleIds),
    relatedScenarioIds: toTextList(item.relatedScenarioIds),
    relatedArchitecturePracticeIds: toTextList(item.relatedArchitecturePracticeIds),
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
    initialFailureImpact: toFailureImpact(item.initialFailureImpact),
    options: extractList(item.options).map(toScenarioOption),
    recommendedOptionIds: toTextList(item.recommendedOptionIds),
    relatedModuleIds: toTextList(item.relatedModuleIds),
    relatedLearningDocuments: toRelatedLearningDocuments(
      item.relatedLearningDocuments ?? item.relatedDocumentIds,
    ),
  }
}

function toLearningPathSummary(data: unknown): LearningPathSummary {
  const item = asRecord(data)

  return {
    id: toText(item.id),
    title: toText(item.title),
    description: toText(item.description),
    targetLevel: toText(item.targetLevel),
    learningGoal: toText(item.learningGoal),
    recommended: item.recommended === true,
    orderIndex: toNumber(item.orderIndex),
    moduleIds: toTextList(item.moduleIds),
  }
}

function toLearningPathDetail(data: unknown): LearningPathDetail {
  const summary = toLearningPathSummary(data)
  const item = asRecord(data)

  return {
    ...summary,
    modules: extractList(item.modules).map(toLearningPathModule),
  }
}

function toLearningPathModule(data: unknown): LearningPathModule {
  const item = asRecord(data)

  return {
    id: toText(item.id),
    pathId: toText(item.pathId),
    title: toText(item.title),
    description: toText(item.description),
    learningGoals: toTextList(item.learningGoals),
    prerequisites: toTextList(item.prerequisites),
    orderIndex: toNumber(item.orderIndex),
    documentIds: toTextList(item.documentIds),
    relatedScenarioIds: toTextList(item.relatedScenarioIds),
    relatedArchitecturePracticeIds: toTextList(item.relatedArchitecturePracticeIds),
  }
}

function toLearningModule(data: unknown): LearningModule {
  const item = asRecord(data)

  return {
    ...toLearningPathModule(data),
    practiceActivities: extractList(item.practiceActivities).map(toLearningModulePracticeActivity),
  }
}

function toLearningModulePracticeActivity(data: unknown): LearningModulePracticeActivity {
  const item = asRecord(data)

  return {
    id: toText(item.id),
    type: toText(item.type),
    title: toText(item.title),
    description: toText(item.description),
    targetResourceId: toText(item.targetResourceId),
    recommendedOrder: toNumber(item.recommendedOrder),
  }
}

function toLearningDiscoveryItem(data: unknown): LearningDiscoveryItem {
  const item = asRecord(data)

  return {
    resourceType: toText(item.resourceType),
    id: toText(item.id),
    title: toText(item.title),
    summary: toText(item.summary),
    category: toText(item.category),
    level: toText(item.level),
    conceptTags: toTextList(item.conceptTags),
    relatedDocumentIds: toTextList(item.relatedDocumentIds),
    relatedScenarioIds: toTextList(item.relatedScenarioIds),
    relatedModuleIds: toTextList(item.relatedModuleIds),
    relatedArchitecturePracticeIds: toTextList(item.relatedArchitecturePracticeIds),
    recommendedPathIncluded: item.recommendedPathIncluded === true,
    orderIndex: toNumber(item.orderIndex),
  }
}

function toArchitecturePracticeSummary(data: unknown): ArchitecturePracticeSummary {
  const item = asRecord(data)

  return {
    id: toText(item.id),
    title: toText(item.title),
    description: toText(item.description),
    level: toText(item.level),
    learningGoal: toText(item.learningGoal),
    requiredResourceTypes: toTextList(item.requiredResourceTypes),
    requiredConnectionTypes: toTextList(item.requiredConnectionTypes),
    relatedDocumentIds: toTextList(item.relatedDocumentIds),
    relatedScenarioIds: toTextList(item.relatedScenarioIds),
    relatedModuleIds: toTextList(item.relatedModuleIds),
  }
}

function toArchitecturePracticeDetail(data: unknown): ArchitecturePracticeDetail {
  const item = asRecord(data)

  return {
    ...toArchitecturePracticeSummary(data),
    instructions: toTextList(item.instructions),
    starterNodes: extractList(item.starterNodes).map(toUserArchitectureNode).filter((node) => node.id),
    starterConnections: extractList(item.starterConnections)
      .map(toUserArchitectureConnection)
      .filter((connection) => connection.id),
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
    tradeOffSummary: toScoreMap(item.tradeOffSummary),
    finalArchitecture: toTextList(item.finalArchitecture),
    finalArchitectureGraph: toArchitectureGraph(item.finalArchitectureGraph),
    failureImpactResult: toFailureImpactResult(item.failureImpactResult),
    relatedLearningDocuments: toRelatedLearningDocuments(
      item.relatedLearningDocuments ?? item.relatedDocumentIds,
    ),
    reflectionQuestions: extractList(item.reflectionQuestions).map(toSimulationReflectionQuestion),
    remediation: toSimulationRemediation(item.remediation),
  }
}

function toUserArchitectureSummary(data: unknown): UserArchitectureSummary {
  const item = asRecord(data)

  return {
    architectureId: toText(item.architectureId),
    title: toText(item.title),
    description: toText(item.description),
    createdAt: toText(item.createdAt),
    updatedAt: toText(item.updatedAt),
    nodeCount: toNumber(item.nodeCount),
    connectionCount: toNumber(item.connectionCount),
  }
}

function toUserArchitectureDetail(data: unknown): UserArchitectureDetail {
  const item = asRecord(data)

  return {
    architectureId: toText(item.architectureId),
    title: toText(item.title),
    description: toText(item.description),
    createdAt: toText(item.createdAt),
    updatedAt: toText(item.updatedAt),
    nodes: extractList(item.nodes).map(toUserArchitectureNode).filter((node) => node.id),
    connections: extractList(item.connections)
      .map(toUserArchitectureConnection)
      .filter((connection) => connection.id),
  }
}

function toUserArchitectureNode(data: unknown): UserArchitectureNode {
  const item = asRecord(data)
  const id = toText(item.id)

  return {
    id,
    resourceType: toText(item.resourceType),
    displayName: toText(item.displayName) || id,
  }
}

function toUserArchitectureConnection(data: unknown): UserArchitectureConnection {
  const item = asRecord(data)

  return {
    id: toText(item.id),
    sourceNodeId: toText(item.sourceNodeId),
    targetNodeId: toText(item.targetNodeId),
    connectionType: toText(item.connectionType),
  }
}

function toUserArchitectureCatalog(data: unknown): UserArchitectureCatalog {
  const item = asRecord(data)

  return {
    resourceTypes: extractList(item.resourceTypes).map(toUserArchitectureResourceType),
    connectionTypes: extractList(item.connectionTypes).map(toUserArchitectureConnectionType),
  }
}

function toUserArchitectureResourceType(data: unknown): UserArchitectureResourceType {
  const item = asRecord(data)
  const key = toText(item.key)

  return {
    key,
    displayName: toText(item.displayName) || key,
    description: toText(item.description),
    visualizationCategory: toText(item.visualizationCategory),
    learningPurpose: toText(item.learningPurpose),
  }
}

function toUserArchitectureConnectionType(data: unknown): UserArchitectureConnectionType {
  const item = asRecord(data)
  const key = toText(item.key)

  return {
    key,
    displayName: toText(item.displayName) || key,
    meaning: toText(item.meaning),
  }
}

function toUserArchitectureValidationResult(data: unknown): UserArchitectureValidationResult {
  const item = asRecord(data)

  return {
    valid: item.valid === true,
    errors: extractList(item.errors).map(toUserArchitectureValidationIssue),
    warnings: extractList(item.warnings).map(toUserArchitectureValidationIssue),
    guidance: extractList(item.guidance).map(toUserArchitectureValidationIssue),
  }
}

function toUserArchitectureValidationIssue(data: unknown): UserArchitectureValidationIssue {
  const item = asRecord(data)

  return {
    severity: toText(item.severity),
    code: toText(item.code),
    targetType: toText(item.targetType),
    targetId: toOptionalText(item.targetId),
    message: toText(item.message),
    reason: toText(item.reason),
  }
}

function toUserArchitectureComparisonResult(data: unknown): UserArchitectureComparisonResult {
  const item = asRecord(data)

  return {
    base: toArchitectureComparisonSummary(item.base),
    target: toArchitectureComparisonSummary(item.target),
    resources: toArchitectureResourceComparison(item.resources),
    connections: toArchitectureConnectionComparison(item.connections),
    scenarioComparison: toScenarioArchitectureComparison(item.scenarioComparison),
    tradeOffReferences: extractList(item.tradeOffReferences).map(toTradeOffReference),
  }
}

function toArchitectureComparisonSummary(value: unknown): ArchitectureComparisonSummary | undefined {
  if (!isRecord(value)) return undefined

  return {
    comparisonType: toText(value.comparisonType),
    id: toText(value.id),
    title: toText(value.title),
    resourceCount: toNumber(value.resourceCount),
    connectionCount: toNumber(value.connectionCount),
  }
}

function toArchitectureResourceComparison(value: unknown): ArchitectureResourceComparison {
  const item = asRecord(value)

  return {
    added: extractList(item.added).map(toArchitectureResourceChange),
    removed: extractList(item.removed).map(toArchitectureResourceChange),
    changed: extractList(item.changed).map(toArchitectureResourceChange),
    unchanged: extractList(item.unchanged).map(toArchitectureResourceChange),
  }
}

function toArchitectureResourceChange(value: unknown): ArchitectureResourceChange {
  const item = asRecord(value)

  return {
    changeType: toText(item.changeType),
    resourceKey: toText(item.resourceKey),
    resourceId: toText(item.resourceId),
    baseResourceType: toText(item.baseResourceType),
    baseDisplayName: toText(item.baseDisplayName),
    targetResourceType: toText(item.targetResourceType),
    targetDisplayName: toText(item.targetDisplayName),
    reason: toText(item.reason),
  }
}

function toArchitectureConnectionComparison(value: unknown): ArchitectureConnectionComparison {
  const item = asRecord(value)

  return {
    added: extractList(item.added).map(toArchitectureConnectionChange),
    removed: extractList(item.removed).map(toArchitectureConnectionChange),
    changed: extractList(item.changed).map(toArchitectureConnectionChange),
    unchanged: extractList(item.unchanged).map(toArchitectureConnectionChange),
  }
}

function toArchitectureConnectionChange(value: unknown): ArchitectureConnectionChange {
  const item = asRecord(value)

  return {
    changeType: toText(item.changeType),
    connectionKey: toText(item.connectionKey),
    connectionId: toText(item.connectionId),
    baseSourceNodeId: toText(item.baseSourceNodeId),
    baseTargetNodeId: toText(item.baseTargetNodeId),
    baseConnectionType: toText(item.baseConnectionType),
    targetSourceNodeId: toText(item.targetSourceNodeId),
    targetTargetNodeId: toText(item.targetTargetNodeId),
    targetConnectionType: toText(item.targetConnectionType),
    reason: toText(item.reason),
  }
}

function toScenarioArchitectureComparison(value: unknown): ScenarioArchitectureComparison | undefined {
  if (!isRecord(value)) return undefined

  return {
    scenarioId: toText(value.scenarioId),
    scenarioTitle: toText(value.scenarioTitle),
    learningGoal: toText(value.learningGoal),
    missingRecommendedResources: extractList(value.missingRecommendedResources).map(toArchitectureResourceChange),
    extraResources: extractList(value.extraResources).map(toArchitectureResourceChange),
    learningImpacts: extractList(value.learningImpacts).map(toArchitectureLearningImpact),
  }
}

function toArchitectureLearningImpact(value: unknown): ArchitectureLearningImpact {
  const item = asRecord(value)

  return {
    code: toText(item.code),
    targetKey: toText(item.targetKey),
    message: toText(item.message),
    reason: toText(item.reason),
  }
}

function toTradeOffReference(value: unknown): TradeOffReference {
  const item = asRecord(value)

  return {
    optionName: toText(item.optionName),
    reason: toText(item.reason),
    effects: toScoreMap(item.effects),
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

function toNumber(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0
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

function toSimulationReflectionQuestion(value: unknown): SimulationReflectionQuestion {
  const item = asRecord(value)

  return {
    id: toText(item.id),
    question: toText(item.question),
    relatedOptionId: toText(item.relatedOptionId),
    relatedTradeOffPerspective: toText(item.relatedTradeOffPerspective),
  }
}

function toSimulationRemediation(value: unknown): SimulationRemediation {
  const item = asRecord(value)

  return {
    reviewDocumentIds: toIdList(item.reviewDocumentIds),
    retryScenarioIds: toIdList(item.retryScenarioIds),
    compareOptionIds: toIdList(item.compareOptionIds),
    missedDecisionCriteria: toTextList(item.missedDecisionCriteria),
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

function toArchitectureEdges(value: unknown) {
  return extractList(value)
    .map(toArchitectureEdge)
    .filter((edge) => edge.source.length > 0 && edge.target.length > 0)
}

function toFailureImpact(value: unknown): FailureImpact | undefined {
  if (!isRecord(value)) return undefined

  const impact = {
    failureSourceNodeId: toOptionalText(value.failureSourceNodeId),
    affectedNodeIds: toTextList(value.affectedNodeIds),
    affectedEdges: toArchitectureEdges(value.affectedEdges),
    userSymptoms: toTextList(value.userSymptoms),
    remainingRisks: toTextList(value.remainingRisks),
  }
  const hasImpact =
    impact.failureSourceNodeId ||
    impact.affectedNodeIds.length > 0 ||
    impact.affectedEdges.length > 0 ||
    impact.userSymptoms.length > 0 ||
    impact.remainingRisks.length > 0

  return hasImpact ? impact : undefined
}

function toFailureImpactResult(value: unknown): FailureImpactResult | undefined {
  if (!isRecord(value)) return undefined

  const result = {
    recoveredEdges: toArchitectureEdges(value.recoveredEdges),
    remainingImpact: toFailureImpact(value.remainingImpact),
    postActionNotes: toTextList(value.postActionNotes),
  }
  const hasResult =
    result.recoveredEdges.length > 0 ||
    result.remainingImpact ||
    result.postActionNotes.length > 0

  return hasResult ? result : undefined
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
