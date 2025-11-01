# API Testing Guide

This guide covers API testing setup using Postman for the PocketShop project.

## Postman Setup

### 1. Installation
- Download Postman from [postman.com](https://www.postman.com/downloads/)
- Install and create a free account (optional but recommended for syncing)

### 2. Environment Setup

Create a new environment in Postman with the following variables:

| Variable | Initial Value | Current Value | Description |
|----------|---------------|---------------|-------------|
| `base_url` | `https://your-project.supabase.co` | - | Supabase project URL |
| `anon_key` | `your-anon-key` | - | Supabase anonymous key |
| `service_role_key` | `your-service-role-key` | - | Service role key (server-side only) |
| `access_token` | - | - | JWT token (set automatically after login) |
| `user_id` | - | - | Current user ID (set automatically) |
| `business_id` | - | - | Business ID for testing |

### 3. Collection Structure

Organize your API tests into collections:

```
PocketShop API Tests/
├── Authentication/
│   ├── Sign Up (Vendor)
│   ├── Sign Up (Customer)
│   ├── Sign In
│   ├── Sign Out
│   └── Get Current User
├── Businesses/
│   ├── Create Business
│   ├── Get Business by ID
│   ├── Get Business by QR Code
│   ├── Update Business
│   └── List User Businesses
├── Products/
│   ├── Create Product
│   ├── Get Products (by Business)
│   ├── Update Product
│   ├── Delete Product
│   └── Toggle Product Availability
├── Orders/
│   ├── Create Order
│   ├── Get Orders (by Business)
│   ├── Get Order by ID
│   ├── Update Order Status
│   └── Get Orders by Status
└── Storage/
    ├── Upload Image
    ├── Get Public URL
    └── Delete File
```

## API Endpoints

### Base Configuration

All requests should include:
- **Headers**:
  - `apikey`: `{{anon_key}}`
  - `Authorization`: `Bearer {{access_token}}` (for authenticated requests)
  - `Content-Type`: `application/json`

### Authentication Endpoints

#### Sign Up
```
POST {{base_url}}/auth/v1/signup
Body (JSON):
{
  "email": "vendor@example.com",
  "password": "securepassword123",
  "data": {
    "full_name": "John Doe",
    "role": "vendor"
  }
}
```

#### Sign In
```
POST {{base_url}}/auth/v1/token?grant_type=password
Body (JSON):
{
  "email": "vendor@example.com",
  "password": "securepassword123"
}
```

**Test Script** (to save token):
```javascript
if (pm.response.code === 200) {
    const jsonData = pm.response.json();
    pm.environment.set("access_token", jsonData.access_token);
    pm.environment.set("user_id", jsonData.user.id);
}
```

#### Get Current User
```
GET {{base_url}}/auth/v1/user
Headers:
  Authorization: Bearer {{access_token}}
```

### Business Endpoints

#### Create Business
```
POST {{base_url}}/rest/v1/businesses
Body (JSON):
{
  "name": "Test Restaurant",
  "description": "A test restaurant",
  "category": "restaurant",
  "address": "123 Main St",
  "phone": "+1234567890",
  "email": "restaurant@example.com",
  "qr_code": "test-qr-123"
}
```

**Test Script** (to save business_id):
```javascript
if (pm.response.code === 201) {
    const jsonData = pm.response.json();
    pm.environment.set("business_id", jsonData[0].id);
}
```

#### Get Business by QR Code
```
GET {{base_url}}/rest/v1/businesses?qr_code=eq.test-qr-123&is_active=eq.true
```

### Product Endpoints

#### Create Product
```
POST {{base_url}}/rest/v1/products
Body (JSON):
{
  "business_id": "{{business_id}}",
  "name": "Burger",
  "description": "Delicious burger",
  "price": 9.99,
  "category": "food",
  "preparation_time": 15
}
```

#### Get Products
```
GET {{base_url}}/rest/v1/products?business_id=eq.{{business_id}}&is_available=eq.true
```

### Order Endpoints

#### Create Order
```
POST {{base_url}}/rest/v1/orders
Body (JSON):
{
  "business_id": "{{business_id}}",
  "customer_name": "Jane Customer",
  "customer_phone": "+1987654321",
  "customer_email": "customer@example.com",
  "total_amount": 19.98,
  "status": "pending",
  "order_items": [
    {
      "product_id": "product-id-here",
      "quantity": 2,
      "unit_price": 9.99,
      "total_price": 19.98
    }
  ]
}
```

#### Get Orders
```
GET {{base_url}}/rest/v1/orders?business_id=eq.{{business_id}}&select=*,order_items(*,products(*))
```

#### Update Order Status
```
PATCH {{base_url}}/rest/v1/orders?id=eq.{{order_id}}
Body (JSON):
{
  "status": "in_progress"
}
```

## Testing Best Practices

### 1. Pre-request Scripts

Use pre-request scripts to:
- Generate dynamic data
- Set up test data
- Clean up previous test data

Example:
```javascript
// Generate random email for testing
const randomEmail = `test${Math.random().toString(36).substring(7)}@example.com`;
pm.environment.set("test_email", randomEmail);
```

### 2. Test Scripts

Write assertions in test scripts:

```javascript
// Status code check
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

// Response time check
pm.test("Response time is less than 500ms", function () {
    pm.expect(pm.response.responseTime).to.be.below(500);
});

// JSON structure validation
pm.test("Response has correct structure", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('id');
    pm.expect(jsonData).to.have.property('name');
});

// Data validation
pm.test("Business name matches", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.name).to.eql("Test Restaurant");
});
```

### 3. Environment Variables

Use environment variables for:
- Base URLs (dev, staging, production)
- API keys
- Test data that needs to persist across requests
- User tokens and IDs

### 4. Collection Runner

Use Collection Runner to:
- Run all tests in a collection
- Test different scenarios
- Generate test reports
- CI/CD integration

## Sample Test Collection

A complete Postman collection JSON is available at `docs/postman/PocketShop_API.postman_collection.json`.

To import:
1. Open Postman
2. Click "Import"
3. Select the collection JSON file
4. Import the environment variables file if available

## CI/CD Integration

### Newman (Postman CLI)

Install Newman:
```bash
npm install -g newman
```

Run collection:
```bash
newman run PocketShop_API.postman_collection.json \
  -e PocketShop_Environment.postman_environment.json \
  --reporters cli,json,html
```

### GitHub Actions Example

```yaml
name: API Tests

on: [push, pull_request]

jobs:
  api-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run Postman Tests
        run: |
          npm install -g newman
          newman run docs/postman/PocketShop_API.postman_collection.json \
            -e docs/postman/PocketShop_Environment.postman_environment.json
```

## Troubleshooting

### Common Issues

1. **401 Unauthorized**: Check if access_token is set and valid
2. **404 Not Found**: Verify base_url and endpoint path
3. **400 Bad Request**: Check request body format and required fields
4. **RLS Policy Errors**: Ensure user has proper permissions in Supabase

### Debug Tips

1. Enable verbose logging in Postman console
2. Check Supabase logs in dashboard
3. Verify environment variables are set correctly
4. Test endpoints directly in Supabase dashboard first

## Resources

- [Postman Documentation](https://learning.postman.com/)
- [Supabase REST API Docs](https://supabase.com/docs/reference/javascript/introduction)
- [Newman Documentation](https://learning.postman.com/docs/running-collections/using-newman-cli/command-line-integration-with-newman/)

