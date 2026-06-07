export const TEMPLATES = [
  {
    title: 'E-Commerce Platform',
    code: `users [icon: user, color: #3b82f6] {
  id string pk
  email string
  passwordHash string
  firstName string
  lastName string
  phone string
  createdAt timestamp
  updatedAt timestamp
}

products [icon: package, color: #8b5cf6] {
  id string pk
  categoryId string
  sku string
  name string
  description text
  price decimal
  stock integer
  isActive boolean
}

categories [icon: folder, color: #10b981] {
  id string pk
  parentId string
  name string
  slug string
}

orders [icon: shopping-cart, color: #f59e0b] {
  id string pk
  userId string
  status string
  totalAmount decimal
  shippingAddress text
  paymentMethod string
  createdAt timestamp
}

order_items [icon: list, color: #ef4444] {
  id string pk
  orderId string
  productId string
  quantity integer
  unitPrice decimal
  subtotal decimal
}

reviews [icon: star, color: #06b6d4] {
  id string pk
  userId string
  productId string
  rating integer
  comment text
  createdAt timestamp
}

users.id < orders.userId
categories.id < categories.parentId
categories.id < products.categoryId
orders.id < order_items.orderId
products.id < order_items.productId
users.id < reviews.userId
products.id < reviews.productId`
  },
  {
    title: 'Social Media Engine',
    code: `users [icon: user, color: #3b82f6] {
  id string pk
  username string
  email string
  bio text
  avatarUrl string
  isVerified boolean
  joinedAt timestamp
}

posts [icon: file-text, color: #8b5cf6] {
  id string pk
  authorId string
  content text
  mediaUrl string
  likesCount integer
  commentsCount integer
  createdAt timestamp
}

comments [icon: message-circle, color: #10b981] {
  id string pk
  postId string
  authorId string
  content text
  createdAt timestamp
}

likes [icon: heart, color: #ef4444] {
  userId string
  postId string
  createdAt timestamp
}

follows [icon: users, color: #f59e0b] {
  followerId string
  followingId string
  createdAt timestamp
}

messages [icon: mail, color: #06b6d4] {
  id string pk
  senderId string
  receiverId string
  content text
  readAt timestamp
  createdAt timestamp
}

users.id < posts.authorId
posts.id < comments.postId
users.id < comments.authorId
users.id <> likes.userId
posts.id <> likes.postId
users.id <> follows.followerId
users.id <> follows.followingId
users.id < messages.senderId
users.id < messages.receiverId`
  },
  {
    title: "very complex example",
    code: `
    users [icon: users, color: blue] {
  id string pk
  username string
  email string
  passwordHash string
  salt string
  firstName string
  lastName string
  dateOfBirth date
  gender string
  country string
  timezone string
  avatarUrl string
  rating number
  volatility number
  isVerified boolean
  twoFactorEnabled boolean
  lastLoginAt timestamp
  createdAt timestamp
  updatedAt timestamp
  deletedAt timestamp
}

user_profiles [icon: user, color: cyan] {
  userId string pk
  bio text
  githubUrl string
  linkedinUrl string
  websiteUrl string
  institution string
  graduationYear number
  major string
  jobTitle string
  company string
  favoriteLanguage string
  tshirtSize string
}

organizations [icon: building, color: orange] {
  id string pk
  name string
  type string
  domain string
  address text
  contactEmail string
  contactPhone string
  logoUrl string
  isVerified boolean
  createdAt timestamp
}

organization_members [icon: users, color: orange] {
  orgId string
  userId string
  role string
  joinedAt timestamp
}

contests [icon: trophy, color: yellow] {
  id string pk
  creatorId string
  title string
  description text
  rules text
  startTime timestamp
  endTime timestamp
  durationMinutes number
  isRated boolean
  isPublic boolean
  visibility string
  password string
  participantCount number
  status string
  createdAt timestamp
  updatedAt timestamp
}

contest_participants [icon: user-check, color: yellow] {
  id string pk
  contestId string
  userId string
  teamName string
  registeredAt timestamp
  isBanned boolean
  score number
  penalty number
  globalRank number
}

problems [icon: file-code, color: red] {
  id string pk
  authorId string
  title string
  difficulty string
  timeLimitMs number
  memoryLimitMb number
  outputLimitKb number
  isInteractive boolean
  tags string
  acceptedCount number
  submissionCount number
  status string
  createdAt timestamp
  updatedAt timestamp
}

problem_statements [icon: file-text, color: red] {
  problemId string pk
  language string
  legend text
  inputFormat text
  outputFormat text
  notes text
  tutorial text
}

test_cases [icon: check-square, color: green] {
  id string pk
  problemId string
  isSample boolean
  inputData text
  outputData text
  scoreWeight number
  orderIndex number
  isHidden boolean
}

languages [icon: terminal, color: gray] {
  id string pk
  name string
  version string
  compilerPath string
  compileCommand string
  executeCommand string
  timeMultiplier number
  memoryMultiplier number
  isActive boolean
}

submissions [icon: upload-cloud, color: blue] {
  id string pk
  userId string
  problemId string
  contestId string
  languageId string
  sourceCode text
  codeSize number
  status string
  verdict string
  executionTimeMs number
  memoryUsedKb number
  score number
  submittedAt timestamp
}

execution_logs [icon: server, color: gray] {
  id string pk
  submissionId string
  nodeId string
  compileOutput text
  runtimeError text
  systemLogs text
  sandboxStatus string
  startedAt timestamp
  finishedAt timestamp
}

server_nodes [icon: hard-drive, color: purple] {
  id string pk
  hostname string
  ipAddress string
  region string
  totalRamGb number
  cpuCores number
  activeContainers number
  status string
  lastHeartbeat timestamp
}

clarifications [icon: message-square, color: pink] {
  id string pk
  contestId string
  problemId string
  userId string
  question text
  answer text
  answeredById string
  isGeneral boolean
  createdAt timestamp
  answeredAt timestamp
}

badges [icon: award, color: yellow] {
  id string pk
  name string
  description text
  iconUrl string
  criteria string
  rarity string
  createdAt timestamp
}

user_badges [icon: star, color: yellow] {
  id string pk
  userId string
  badgeId string
  awardedAt timestamp
  reason string
}

subscriptions [icon: credit-card, color: green] {
  id string pk
  userId string
  planId string
  status string
  billingCycle string
  startDate timestamp
  endDate timestamp
  autoRenew boolean
  createdAt timestamp
}

payment_transactions [icon: dollar-sign, color: green] {
  id string pk
  userId string
  subscriptionId string
  amount number
  currency string
  paymentMethod string
  gatewayTxnId string
  status string
  invoiceUrl string
  processedAt timestamp
}

audit_logs [icon: shield-alert, color: red] {
  id string pk
  userId string
  action string
  entityType string
  entityId string
  oldValues text
  newValues text
  ipAddress string
  userAgent string
  createdAt timestamp
}

notifications [icon: bell, color: purple] {
  id string pk
  userId string
  type string
  title string
  content text
  actionUrl string
  isRead boolean
  createdAt timestamp
}

system_settings [icon: settings, color: gray] {
  key string pk
  value text
  dataType string
  description string
  lastModifiedBy string
  updatedAt timestamp
}

users.id <> user_profiles.userId

organizations.id - organization_members.orgId
users.id - organization_members.userId

users.id < contests.creatorId

contests.id - contest_participants.contestId
users.id - contest_participants.userId

users.id < problems.authorId
problems.id <> problem_statements.problemId

problems.id < test_cases.problemId

users.id < submissions.userId
problems.id < submissions.problemId
contests.id < submissions.contestId
languages.id < submissions.languageId

submissions.id <> execution_logs.submissionId
server_nodes.id < execution_logs.nodeId

contests.id < clarifications.contestId
problems.id < clarifications.problemId
users.id < clarifications.userId
users.id < clarifications.answeredById

users.id < user_badges.userId
badges.id < user_badges.badgeId

users.id < subscriptions.userId
users.id < payment_transactions.userId
subscriptions.id < payment_transactions.subscriptionId

users.id < audit_logs.userId
users.id < notifications.userId
    `
  },
  {
    title: 'Enterprise ERP',
    code: `employees [icon: user, color: #3b82f6] {
  id string pk
  departmentId string
  managerId string
  firstName string
  lastName string
  email string
  position string
  salary decimal
  hireDate date
}

departments [icon: building, color: #8b5cf6] {
  id string pk
  name string
  location string
  budget decimal
}

projects [icon: brief-case, color: #10b981] {
  id string pk
  departmentId string
  name string
  status string
  startDate date
  endDate date
  budget decimal
}

employee_projects [icon: users, color: #f59e0b] {
  employeeId string
  projectId string
  role string
  hoursAllocated integer
}

inventory [icon: package, color: #ef4444] {
  id string pk
  supplierId string
  itemName string
  quantity integer
  unitPrice decimal
  reorderLevel integer
}

suppliers [icon: truck, color: #06b6d4] {
  id string pk
  name string
  contactName string
  phone string
  email string
}

invoices [icon: file-text, color: #64748b] {
  id string pk
  supplierId string
  amount decimal
  status string
  dueDate date
  paidDate date
}

departments.id < employees.departmentId
employees.id < employees.managerId
departments.id < projects.departmentId
employees.id <> employee_projects.employeeId
projects.id <> employee_projects.projectId
suppliers.id < inventory.supplierId
suppliers.id < invoices.supplierId`
  }
];
