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
