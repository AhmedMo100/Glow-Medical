# Glow Medical — Auth Scripts

## Setup Steps (in order)

### 1. Install packages
```bash
npm install next-auth bcryptjs
npm install -D @types/bcryptjs tsx
```

### 2. Add to .env
```bash
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Run DB migration
```bash
npx prisma migrate dev --name add-admin-user
# or if schema already has AdminUser:
npx prisma db push
```

### 4. Create your admin user
```bash
npx tsx prisma/scripts/create-admin.ts
```
You'll be prompted to enter:
- Full Name
- Email
- Password (hidden input)
- Confirm Password

### 5. Start the app
```bash
npm run dev
# Go to: http://localhost:3000/auth/login
```

---

## Forgot password?
```bash
npx tsx prisma/scripts/reset-password.ts
```

---

## Add to package.json scripts section:
```json
{
  "scripts": {
    "admin:create": "tsx prisma/scripts/create-admin.ts",
    "admin:reset-password": "tsx prisma/scripts/reset-password.ts"
  }
}
```
Then run with:
```bash
npm run admin:create
npm run admin:reset-password
```
