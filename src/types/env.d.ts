// ============================================================
//  GLOW MEDICAL — ENVIRONMENT VARIABLE TYPES
//  Add any env vars you use here to get full TypeScript support.
// ============================================================
declare namespace NodeJS {
  interface ProcessEnv {
    // Database
    DATABASE_URL: string

    // NextAuth
    NEXTAUTH_SECRET: string
    NEXTAUTH_URL:    string

    // AI
    GROQ_API_KEY?:     string
    ANTHROPIC_API_KEY?: string

    // App
    NEXT_PUBLIC_SITE_URL?: string
    NODE_ENV: 'development' | 'production' | 'test'
  }
}
