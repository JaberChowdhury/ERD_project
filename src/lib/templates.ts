export const TEMPLATES = [
  {
    title: "E-Commerce Platform",
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
products.id < reviews.productId`,
  },
  {
    title: "Social Media Engine",
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
users.id < messages.receiverId`,
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
    `,
  },
  {
    title: "Enterprise ERP",
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
suppliers.id < invoices.supplierId`,
  },
];

export const SQL_TEMPLATES = [
  {
    title: "E-Commerce SQL",
    code: `CREATE TABLE users (
  id INT PRIMARY KEY,
  email VARCHAR(255),
  password_hash VARCHAR(255),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  created_at TIMESTAMP
);

CREATE TABLE products (
  id INT PRIMARY KEY,
  category_id INT,
  name VARCHAR(255),
  price DECIMAL(10, 2),
  stock INT
);

CREATE TABLE categories (
  id INT PRIMARY KEY,
  parent_id INT,
  name VARCHAR(100)
);

CREATE TABLE orders (
  id INT PRIMARY KEY,
  user_id INT,
  status VARCHAR(50),
  total_amount DECIMAL(10, 2),
  created_at TIMESTAMP
);

CREATE TABLE order_items (
  id INT PRIMARY KEY,
  order_id INT,
  product_id INT,
  quantity INT,
  unit_price DECIMAL(10, 2)
);

ALTER TABLE products ADD CONSTRAINT fk_product_category FOREIGN KEY (category_id) REFERENCES categories(id);
ALTER TABLE orders ADD CONSTRAINT fk_order_user FOREIGN KEY (user_id) REFERENCES users(id);
ALTER TABLE order_items ADD CONSTRAINT fk_item_order FOREIGN KEY (order_id) REFERENCES orders(id);
ALTER TABLE order_items ADD CONSTRAINT fk_item_product FOREIGN KEY (product_id) REFERENCES products(id);
`,
  },
  {
    title: "Blog / Social Media SQL",
    code: `CREATE TABLE users (
  id INT PRIMARY KEY,
  username VARCHAR(50),
  email VARCHAR(100),
  bio TEXT,
  created_at TIMESTAMP
);

CREATE TABLE posts (
  id INT PRIMARY KEY,
  author_id INT,
  title VARCHAR(255),
  content TEXT,
  created_at TIMESTAMP
);

CREATE TABLE comments (
  id INT PRIMARY KEY,
  post_id INT,
  author_id INT,
  content TEXT,
  created_at TIMESTAMP
);

ALTER TABLE posts ADD CONSTRAINT fk_post_author FOREIGN KEY (author_id) REFERENCES users(id);
ALTER TABLE comments ADD CONSTRAINT fk_comment_post FOREIGN KEY (post_id) REFERENCES posts(id);
ALTER TABLE comments ADD CONSTRAINT fk_comment_author FOREIGN KEY (author_id) REFERENCES users(id);
`,
  },
  {
    title: "QR Thikana",
    code: `
    -- WARNING: This schema is for context only and is not meant to be run.
    -- Table order and constraints may not be valid for execution.

    CREATE TABLE public.matches (
      id uuid NOT NULL DEFAULT gen_random_uuid(),
      user1_id uuid NOT NULL,
      user2_id uuid NOT NULL,
      duration_seconds integer NOT NULL DEFAULT 0,
      created_at timestamp without time zone NOT NULL DEFAULT now(),
      CONSTRAINT matches_pkey PRIMARY KEY (id),
      CONSTRAINT matches_user1_id_users_id_fk FOREIGN KEY (user1_id) REFERENCES public.users(id),
      CONSTRAINT matches_user2_id_users_id_fk FOREIGN KEY (user2_id) REFERENCES public.users(id)
    );
    CREATE TABLE public.transactions (
      id uuid NOT NULL DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL,
      amount integer NOT NULL,
      reason text NOT NULL,
      created_at timestamp without time zone NOT NULL DEFAULT now(),
      CONSTRAINT transactions_pkey PRIMARY KEY (id),
      CONSTRAINT transactions_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id)
    );
    CREATE TABLE public.users (
      id uuid NOT NULL DEFAULT gen_random_uuid(),
      username text NOT NULL,
      avatar_url text,
      coins integer NOT NULL DEFAULT 100,
      created_at timestamp without time zone NOT NULL DEFAULT now(),
      email text UNIQUE,
      supabase_id uuid UNIQUE,
      bio text,
      selected_avatar text DEFAULT 'ghost'::text,
      cover_image text,
      mood text DEFAULT 'Chillin'' in the shadows 😎'::text,
      theme_preference text DEFAULT 'system'::text,
      accent_color text DEFAULT 'bg-purple-500'::text,
      show_online_status boolean NOT NULL DEFAULT true,
      hide_from_search boolean NOT NULL DEFAULT false,
      pinned_badges jsonb DEFAULT '[]'::jsonb,
      equipped_avatar_decoration text,
      equipped_name_animation text,
      profile_visibility text NOT NULL DEFAULT 'public'::text,
      CONSTRAINT users_pkey PRIMARY KEY (id)
    );
    CREATE TABLE public.blocked_users (
      id uuid NOT NULL DEFAULT gen_random_uuid(),
      blocker_device_id text NOT NULL,
      blocked_device_id text NOT NULL,
      created_at timestamp without time zone NOT NULL DEFAULT now(),
      CONSTRAINT blocked_users_pkey PRIMARY KEY (id)
    );
    CREATE TABLE public.reports (
      id uuid NOT NULL DEFAULT gen_random_uuid(),
      reporter_device_id text NOT NULL,
      reported_device_id text NOT NULL,
      reported_ip text,
      reason text NOT NULL,
      notes text,
      status text NOT NULL DEFAULT 'pending'::text,
      created_at timestamp without time zone NOT NULL DEFAULT now(),
      CONSTRAINT reports_pkey PRIMARY KEY (id)
    );
    CREATE TABLE public.chat_messages (
      id uuid NOT NULL DEFAULT gen_random_uuid(),
      session_id uuid NOT NULL,
      sender_type text NOT NULL,
      text text NOT NULL,
      created_at timestamp without time zone NOT NULL DEFAULT now(),
      CONSTRAINT chat_messages_pkey PRIMARY KEY (id),
      CONSTRAINT chat_messages_session_id_chat_sessions_id_fk FOREIGN KEY (session_id) REFERENCES public.chat_sessions(id)
    );
    CREATE TABLE public.chat_sessions (
      id uuid NOT NULL DEFAULT gen_random_uuid(),
      user_supabase_id uuid NOT NULL,
      partner_alias text NOT NULL,
      partner_avatar text DEFAULT 'ghost'::text,
      last_message text,
      message_count integer NOT NULL DEFAULT 0,
      created_at timestamp without time zone NOT NULL DEFAULT now(),
      CONSTRAINT chat_sessions_pkey PRIMARY KEY (id)
    );
    CREATE TABLE public.banned_ips (
      ip text NOT NULL,
      reason text NOT NULL,
      banned_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT banned_ips_pkey PRIMARY KEY (ip)
    );
    CREATE TABLE public.user_inventory (
      id uuid NOT NULL DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL,
      item_type text NOT NULL,
      item_id text NOT NULL,
      purchased_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT user_inventory_pkey PRIMARY KEY (id),
      CONSTRAINT user_inventory_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
      CONSTRAINT user_inventory_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id)
    );
    CREATE TABLE public.posts (
      id uuid NOT NULL DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL,
      content text,
      image_url text,
      privacy_mode text NOT NULL DEFAULT 'public'::text,
      original_post_id uuid,
      settings jsonb NOT NULL DEFAULT '{}'::jsonb,
      upvote_count integer NOT NULL DEFAULT 0,
      coin_rewarded_at_5 boolean NOT NULL DEFAULT false,
      created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
      title text,
      CONSTRAINT posts_pkey PRIMARY KEY (id),
      CONSTRAINT posts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
      CONSTRAINT posts_original_post_id_fkey FOREIGN KEY (original_post_id) REFERENCES public.posts(id)
    );
    CREATE TABLE public.post_access_requests (
      id uuid NOT NULL DEFAULT gen_random_uuid(),
      post_id uuid NOT NULL,
      requester_id uuid NOT NULL,
      status text NOT NULL DEFAULT 'pending'::text,
      created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT post_access_requests_pkey PRIMARY KEY (id),
      CONSTRAINT post_access_requests_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id),
      CONSTRAINT post_access_requests_requester_id_fkey FOREIGN KEY (requester_id) REFERENCES public.users(id)
    );
    CREATE TABLE public.comments (
      id uuid NOT NULL DEFAULT gen_random_uuid(),
      post_id uuid NOT NULL,
      user_id uuid NOT NULL,
      content text NOT NULL,
      parent_comment_id uuid,
      created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
      upvote_count integer NOT NULL DEFAULT 0,
      CONSTRAINT comments_pkey PRIMARY KEY (id),
      CONSTRAINT comments_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id),
      CONSTRAINT comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
      CONSTRAINT comments_parent_comment_id_fkey FOREIGN KEY (parent_comment_id) REFERENCES public.comments(id)
    );
    CREATE TABLE public.post_reports (
      id uuid NOT NULL DEFAULT gen_random_uuid(),
      post_id uuid NOT NULL,
      reporter_id uuid NOT NULL,
      reason text NOT NULL,
      created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT post_reports_pkey PRIMARY KEY (id),
      CONSTRAINT post_reports_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id),
      CONSTRAINT post_reports_reporter_id_fkey FOREIGN KEY (reporter_id) REFERENCES public.users(id)
    );
    CREATE TABLE public.hidden_posts (
      id uuid NOT NULL DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL,
      post_id uuid NOT NULL,
      created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT hidden_posts_pkey PRIMARY KEY (id),
      CONSTRAINT hidden_posts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
      CONSTRAINT hidden_posts_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id)
    );
    CREATE TABLE public.post_votes (
      id uuid NOT NULL DEFAULT gen_random_uuid(),
      post_id uuid NOT NULL,
      user_id uuid NOT NULL,
      vote_type text NOT NULL,
      created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT post_votes_pkey PRIMARY KEY (id),
      CONSTRAINT post_votes_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id),
      CONSTRAINT post_votes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
    );
    CREATE TABLE public.comment_votes (
      comment_id uuid NOT NULL,
      user_id uuid NOT NULL,
      vote_type text CHECK (vote_type = ANY (ARRAY['upvote'::text, 'downvote'::text])),
      CONSTRAINT comment_votes_pkey PRIMARY KEY (comment_id, user_id),
      CONSTRAINT comment_votes_comment_id_fkey FOREIGN KEY (comment_id) REFERENCES public.comments(id),
      CONSTRAINT comment_votes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
    );
    CREATE TABLE public.saved_posts (
      id uuid NOT NULL DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL,
      post_id uuid NOT NULL,
      created_at timestamp without time zone NOT NULL DEFAULT now(),
      CONSTRAINT saved_posts_pkey PRIMARY KEY (id),
      CONSTRAINT saved_posts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
      CONSTRAINT saved_posts_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id)
    );
    CREATE TABLE public.shop_items (
      id uuid NOT NULL DEFAULT gen_random_uuid(),
      name text NOT NULL,
      category text NOT NULL,
      type text NOT NULL,
      price integer NOT NULL,
      badge text,
      color text,
      description text,
      media_url text,
      created_at timestamp without time zone NOT NULL DEFAULT now(),
      CONSTRAINT shop_items_pkey PRIMARY KEY (id)
    );
    CREATE TABLE public.friendships (
      id uuid NOT NULL DEFAULT gen_random_uuid(),
      sender_id uuid NOT NULL,
      receiver_id uuid NOT NULL,
      status text NOT NULL DEFAULT 'pending'::text,
      created_at timestamp without time zone NOT NULL DEFAULT now(),
      CONSTRAINT friendships_pkey PRIMARY KEY (id),
      CONSTRAINT friendships_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id),
      CONSTRAINT friendships_receiver_id_fkey FOREIGN KEY (receiver_id) REFERENCES public.users(id)
    );
    CREATE TABLE public.direct_messages (
      id uuid NOT NULL DEFAULT gen_random_uuid(),
      friendship_id uuid NOT NULL,
      sender_id uuid NOT NULL,
      text text NOT NULL,
      read boolean NOT NULL DEFAULT false,
      created_at timestamp without time zone NOT NULL DEFAULT now(),
      reply_to_text text,
      reaction text,
      voice_url text,
      CONSTRAINT direct_messages_pkey PRIMARY KEY (id),
      CONSTRAINT direct_messages_friendship_id_fkey FOREIGN KEY (friendship_id) REFERENCES public.friendships(id),
      CONSTRAINT direct_messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id)
    );
    CREATE TABLE public.notifications (
      id uuid NOT NULL DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL,
      actor_id uuid NOT NULL,
      type text NOT NULL,
      reference_id uuid,
      is_read boolean NOT NULL DEFAULT false,
      created_at timestamp without time zone NOT NULL DEFAULT now(),
      CONSTRAINT notifications_pkey PRIMARY KEY (id),
      CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
      CONSTRAINT notifications_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES public.users(id)
    );
    `,
  },
];
