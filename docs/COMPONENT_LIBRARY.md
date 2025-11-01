# Component Library Specifications
## PocketShop - Reusable UI Components

**Version:** 1.0  
**Last Updated:** January 2025  
**Status:** Phase 2 - UI/UX Design

---

## Table of Contents

1. [Button](#button)
2. [Card](#card)
3. [Input](#input)
4. [Modal](#modal)
5. [Badge](#badge)
6. [Table](#table)
7. [Order Card](#order-card)
8. [Product Card](#product-card)
9. [Stats Card](#stats-card)
10. [Kanban Board](#kanban-board)
11. [Chart Components](#chart-components)

---

## Button

### Props
```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}
```

### Variants
- **Primary**: Blue background, white text, primary action
- **Secondary**: Transparent, blue border, secondary action
- **Outline**: Transparent, border, text-colored
- **Ghost**: No border, hover background
- **Danger**: Red variant for destructive actions

### Sizes
- **sm**: `padding: 0.5rem 1rem; font-size: 0.875rem;`
- **md**: `padding: 0.75rem 1.5rem; font-size: 1rem;` (default)
- **lg**: `padding: 1rem 2rem; font-size: 1.125rem;`

### Usage Example
```tsx
<Button variant="primary" size="md" onClick={handleClick}>
  Save Changes
</Button>

<Button variant="secondary" icon={<Icon />} iconPosition="left">
  Cancel
</Button>
```

---

## Card

### Props
```typescript
interface CardProps {
  title?: string;
  subtitle?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}
```

### Variants
- **Default**: White background, shadow, border
- **Hover**: Adds lift animation on hover
- **Padding**: sm (16px), md (24px), lg (32px)

### Usage Example
```tsx
<Card title="Recent Orders" subtitle="Last 7 days">
  <OrderList orders={orders} />
</Card>

<Card hover padding="lg">
  <StatsGrid />
</Card>
```

---

## Input

### Props
```typescript
interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel';
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}
```

### States
- **Default**: Border gray-300
- **Focus**: Border primary-500, shadow
- **Error**: Border error-500, error message
- **Disabled**: Gray background, no interaction

### Usage Example
```tsx
<Input
  label="Email Address"
  type="email"
  placeholder="email@example.com"
  value={email}
  onChange={setEmail}
  error={errors.email}
  required
/>

<Input
  label="Phone"
  type="tel"
  icon={<PhoneIcon />}
  iconPosition="left"
  value={phone}
  onChange={setPhone}
/>
```

---

## Modal

### Props
```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
  closeOnEsc?: boolean;
  children: React.ReactNode;
  footer?: React.ReactNode;
}
```

### Sizes
- **sm**: `max-width: 400px`
- **md**: `max-width: 500px` (default)
- **lg**: `max-width: 700px`
- **xl**: `max-width: 900px`
- **full**: `max-width: 95vw`

### Usage Example
```tsx
<Modal
  isOpen={isOpen}
  onClose={handleClose}
  title="Add Product"
  size="md"
>
  <ProductForm onSubmit={handleSubmit} />
  <Modal.Footer>
    <Button onClick={handleClose}>Cancel</Button>
    <Button variant="primary" onClick={handleSubmit}>Save</Button>
  </Modal.Footer>
</Modal>
```

---

## Badge

### Props
```typescript
interface BadgeProps {
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  size?: 'sm' | 'md';
  children: React.ReactNode;
  icon?: React.ReactNode;
}
```

### Variants
- **Success**: Green background (status: ready, completed)
- **Warning**: Orange background (status: pending)
- **Error**: Red background (status: cancelled, error)
- **Info**: Blue background (status: in progress)
- **Neutral**: Gray background (default)

### Usage Example
```tsx
<Badge variant="success">Ready</Badge>
<Badge variant="warning" icon={<ClockIcon />}>Pending</Badge>
<Badge variant="error">Cancelled</Badge>
```

---

## Table

### Props
```typescript
interface TableProps {
  columns: Column[];
  data: any[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: any) => void;
  pagination?: PaginationProps;
}

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: any) => React.ReactNode;
}
```

### Features
- Sortable columns
- Row hover states
- Loading skeleton
- Empty state message
- Optional pagination

### Usage Example
```tsx
<Table
  columns={[
    { key: 'id', label: 'Order ID', sortable: true },
    { key: 'customer', label: 'Customer' },
    { key: 'total', label: 'Total', render: (val) => `$${val}` },
    { key: 'status', label: 'Status', render: (val) => <Badge>{val}</Badge> }
  ]}
  data={orders}
  loading={isLoading}
  onRowClick={handleRowClick}
/>
```

---

## Order Card

### Props
```typescript
interface OrderCardProps {
  order: {
    id: string;
    customerName: string;
    total: number;
    items: OrderItem[];
    status: 'pending' | 'in_progress' | 'ready' | 'completed';
    createdAt: string;
    notes?: string;
  };
  onStatusChange?: (orderId: string, status: string) => void;
  onClick?: () => void;
  showActions?: boolean;
}
```

### Features
- Status badge with color coding
- Expandable details
- Action buttons (contextual)
- Item count display
- Timestamp

### Usage Example
```tsx
<OrderCard
  order={order}
  onStatusChange={handleStatusChange}
  onClick={handleOrderClick}
  showActions
/>
```

---

## Product Card

### Props
```typescript
interface ProductCardProps {
  product: {
    id: string;
    name: string;
    description?: string;
    price: number;
    image?: string;
    category: string;
    isAvailable: boolean;
    preparationTime?: number;
  };
  onEdit?: () => void;
  onToggleAvailability?: () => void;
  onDelete?: () => void;
  view?: 'grid' | 'list';
}
```

### Features
- Product image placeholder
- Price display
- Availability indicator
- Quick actions (edit, delete)
- Grid/List view support

### Usage Example
```tsx
<ProductCard
  product={product}
  onEdit={handleEdit}
  onToggleAvailability={handleToggle}
  view="grid"
/>
```

---

## Stats Card

### Props
```typescript
interface StatsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
  };
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'primary' | 'success' | 'warning' | 'error';
}
```

### Features
- Large value display
- Trend indicator (arrow + percentage)
- Icon support
- Color variants

### Usage Example
```tsx
<StatsCard
  title="Today's Sales"
  value="$1,234"
  change={{ value: 12, type: 'increase' }}
  icon={<DollarIcon />}
  trend="up"
  color="success"
/>
```

---

## Kanban Board

### Props
```typescript
interface KanbanBoardProps {
  columns: KanbanColumn[];
  onOrderMove?: (orderId: string, fromStatus: string, toStatus: string) => void;
  onOrderClick?: (order: Order) => void;
  loading?: boolean;
}

interface KanbanColumn {
  id: string;
  title: string;
  status: string;
  orders: Order[];
  color?: string;
}
```

### Features
- Drag and drop support
- Column customization
- Order count badges
- Empty state per column

### Usage Example
```tsx
<KanbanBoard
  columns={[
    { id: 'new', title: 'New Orders', status: 'pending', orders: newOrders },
    { id: 'progress', title: 'In Progress', status: 'in_progress', orders: inProgressOrders },
    { id: 'ready', title: 'Ready', status: 'ready', orders: readyOrders }
  ]}
  onOrderMove={handleOrderMove}
  onOrderClick={handleOrderClick}
/>
```

---

## Chart Components

### Line Chart (Revenue Trends)
```typescript
interface LineChartProps {
  data: { date: string; value: number }[];
  color?: string;
  height?: number;
  showGrid?: boolean;
  showTooltip?: boolean;
}
```

### Bar Chart (Sales by Product)
```typescript
interface BarChartProps {
  data: { label: string; value: number }[];
  color?: string;
  horizontal?: boolean;
  height?: number;
}
```

### Pie Chart (Order Status Distribution)
```typescript
interface PieChartProps {
  data: { label: string; value: number; color: string }[];
  showLegend?: boolean;
  size?: number;
}
```

---

## Component Composition

### Layout Components

#### Page Layout
```tsx
<PageLayout>
  <PageHeader title="Dashboard" actions={<Button>Add</Button>} />
  <PageContent>
    <StatsGrid />
    <Card>Content</Card>
  </PageContent>
</PageLayout>
```

#### Grid System
```tsx
<Grid columns={3} gap={6}>
  <Grid.Item><StatsCard /></Grid.Item>
  <Grid.Item><StatsCard /></Grid.Item>
  <Grid.Item><StatsCard /></Grid.Item>
</Grid>
```

---

## Accessibility Requirements

All components must include:
- **ARIA labels** for screen readers
- **Keyboard navigation** support
- **Focus indicators** (visible outline)
- **Color contrast** meeting WCAG AA standards
- **Semantic HTML** structure

---

## Testing Requirements

Each component should have:
- **Unit tests** (Jest + React Testing Library)
- **Visual regression tests** (optional)
- **Accessibility tests** (axe-core)
- **Storybook stories** for documentation

---

## Usage Guidelines

1. **Import components** from `@/components`
2. **Use TypeScript** for type safety
3. **Follow naming conventions** (PascalCase)
4. **Document props** with JSDoc comments
5. **Handle loading/error states**
6. **Provide default values** where appropriate

---

**Next Steps:**
1. Implement components in React
2. Create Storybook documentation
3. Write unit tests
4. Build component playground

