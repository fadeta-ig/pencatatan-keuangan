# Category API Documentation

API endpoints for managing categories in the financial tracking application.

## Authentication

All category endpoints require authentication via Firebase ID token.

**Authorization Header:**
```
Authorization: Bearer <firebase-id-token>
```

## Endpoints

### 1. Create Category

Create a new category for the authenticated user.

**Endpoint:** `POST /api/category`

**Request Body:**
```json
{
  "name": "Food & Dining",
  "type": "EXPENSE",
  "color": "#FF5733",
  "icon": "utensils",
  "description": "Restaurant and grocery expenses",
  "isActive": true
}
```

**Required Fields:**
- `name` (string): Category name
- `type` (string): Either "INCOME" or "EXPENSE"

**Optional Fields:**
- `color` (string): Hex color code
- `icon` (string): Icon identifier
- `description` (string): Category description
- `isActive` (boolean): Whether category is active (default: true)

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "category123",
    "userId": "user123",
    "name": "Food & Dining",
    "type": "EXPENSE",
    "color": "#FF5733",
    "icon": "utensils",
    "description": "Restaurant and grocery expenses",
    "isActive": true
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Missing or invalid authentication token
- `409 Conflict`: Category name already exists for this type

---

### 2. List Categories

Get all categories for the authenticated user with optional filtering.

**Endpoint:** `GET /api/category`

**Query Parameters:**
- `type` (optional): Filter by category type ("INCOME" or "EXPENSE")
- `activeOnly` (optional): Show only active categories (default: true)

**Examples:**
- `/api/category` - Get all active categories
- `/api/category?type=EXPENSE` - Get all active expense categories
- `/api/category?activeOnly=false` - Get all categories including inactive
- `/api/category?type=INCOME&activeOnly=false` - Get all income categories

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "category123",
      "userId": "user123",
      "name": "Food & Dining",
      "type": "EXPENSE",
      "color": "#FF5733",
      "icon": "utensils",
      "description": "Restaurant and grocery expenses",
      "isActive": true
    },
    {
      "id": "category456",
      "userId": "user123",
      "name": "Salary",
      "type": "INCOME",
      "color": "#28A745",
      "icon": "dollar-sign",
      "description": "Monthly salary",
      "isActive": true
    }
  ],
  "count": 2
}
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid authentication token
- `500 Internal Server Error`: Server error

---

### 3. Get Category by ID

Get a specific category by its ID.

**Endpoint:** `GET /api/category/:id`

**URL Parameters:**
- `id` (required): Category ID

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "category123",
    "userId": "user123",
    "name": "Food & Dining",
    "type": "EXPENSE",
    "color": "#FF5733",
    "icon": "utensils",
    "description": "Restaurant and grocery expenses",
    "isActive": true
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: User does not own this category
- `404 Not Found`: Category not found
- `500 Internal Server Error`: Server error

---

### 4. Update Category

Update an existing category.

**Endpoint:** `PATCH /api/category/:id`

**URL Parameters:**
- `id` (required): Category ID

**Request Body:**
```json
{
  "name": "Food & Restaurants",
  "color": "#FF6347",
  "description": "Dining out and groceries",
  "isActive": true
}
```

**Note:** All fields are optional. Only include fields you want to update.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "category123",
    "userId": "user123",
    "name": "Food & Restaurants",
    "type": "EXPENSE",
    "color": "#FF6347",
    "icon": "utensils",
    "description": "Dining out and groceries",
    "isActive": true
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid input data or no fields to update
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: User does not own this category
- `404 Not Found`: Category not found
- `409 Conflict`: Category name already exists for this type
- `500 Internal Server Error`: Server error

---

### 5. Delete Category

Soft delete a category (marks as inactive).

**Endpoint:** `DELETE /api/category/:id`

**URL Parameters:**
- `id` (required): Category ID

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Category deleted successfully"
}
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: User does not own this category
- `404 Not Found`: Category not found
- `500 Internal Server Error`: Server error

---

## Error Response Format

All error responses follow this format:

```json
{
  "error": "Error message describing what went wrong"
}
```

## Usage Examples

### JavaScript/TypeScript (with fetch)

```typescript
// Get Firebase ID token
const user = auth.currentUser;
const token = await user.getIdToken();

// Create category
const response = await fetch('/api/category', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'Groceries',
    type: 'EXPENSE',
    color: '#4CAF50',
  }),
});

const data = await response.json();
console.log(data);

// List categories
const listResponse = await fetch('/api/category?type=EXPENSE', {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});

const categories = await listResponse.json();
console.log(categories.data);

// Update category
const updateResponse = await fetch('/api/category/category123', {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'Food Shopping',
    color: '#66BB6A',
  }),
});

// Delete category
const deleteResponse = await fetch('/api/category/category123', {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});
```

## Notes

- Categories are soft-deleted (marked as inactive) rather than permanently removed
- Category names must be unique per user and type (you can have "Food" for both INCOME and EXPENSE)
- All timestamps are managed automatically by Firestore
- The authenticated user's ID is automatically associated with created categories
