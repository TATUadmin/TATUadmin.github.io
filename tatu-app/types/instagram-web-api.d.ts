declare module 'instagram-web-api' {
  export class Instagram {
    constructor(options: { username: string; password: string })
    login(): Promise<any>
    getDirectInbox(): Promise<{
      threads: Array<{
        thread_id: string
        users: Array<{
          username: string
          full_name: string
        }>
        items: Array<{
          item_id: string
          text: string
          timestamp: number
        }>
      }>
    }>
  }
} 