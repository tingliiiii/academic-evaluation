/**
 * OpenAPI/Swagger 規範
 * 
 * 此檔案定義了所有 API 端點的 OpenAPI 3.0 規範
 * 用於生成 API 文檔和自動化測試
 */

export const openApiSpec = {
  openapi: '3.0.0',
  info: {
    title: '期末評語生成系統 API',
    description: '基於 AI 的期末評語自動生成系統',
    version: '1.0.0',
    contact: {
      name: 'API Support',
      email: 'lily90740@gmail.com',
    },
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: '本地開發伺服器',
    },
    {
      url: 'https://api.example.com',
      description: '正式環境伺服器',
    },
  ],
  paths: {
    '/api/auth/login': {
      post: {
        summary: '登入系統',
        description: '使用管理員密碼登入系統',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  password: {
                    type: 'string',
                    description: '管理員密碼',
                    example: 'your-password',
                  },
                },
                required: ['password'],
              },
            },
          },
        },
        responses: {
          200: {
            description: '登入成功',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                  },
                },
              },
            },
          },
          400: {
            description: '驗證失敗 - 密碼為必填項',
          },
          401: {
            description: '認證失敗 - 密碼錯誤',
          },
          500: {
            description: '伺服器內部錯誤',
          },
        },
      },
    },
    '/api/auth/logout': {
      post: {
        summary: '登出系統',
        description: '清除認證令牌',
        tags: ['Authentication'],
        responses: {
          200: {
            description: '登出成功',
          },
        },
      },
    },
    '/api/evaluations': {
      get: {
        summary: '取得評語列表',
        description: '取得分頁的評語列表，支援搜尋',
        tags: ['Evaluations'],
        security: [
          {
            BearerAuth: [],
          },
        ],
        parameters: [
          {
            name: 'page',
            in: 'query',
            schema: { type: 'integer', minimum: 1, default: 1 },
            description: '頁碼',
          },
          {
            name: 'pageSize',
            in: 'query',
            schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
            description: '每頁數量',
          },
          {
            name: 'studentName',
            in: 'query',
            schema: { type: 'string' },
            description: '學生名稱搜尋（可選）',
          },
        ],
        responses: {
          200: {
            description: '成功取得評語列表',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        items: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              id: { type: 'string' },
                              studentName: { type: 'string' },
                              toneName: { type: 'string' },
                              wisdoms: { type: 'array', items: { type: 'string' } },
                              createdAt: { type: 'string', format: 'date-time' },
                            },
                          },
                        },
                        pagination: {
                          type: 'object',
                          properties: {
                            page: { type: 'integer' },
                            pageSize: { type: 'integer' },
                            total: { type: 'integer' },
                            totalPages: { type: 'integer' },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          400: {
            description: '無效的查詢參數',
          },
          401: {
            description: '未授權 - 需要認證',
          },
          500: {
            description: '伺服器內部錯誤',
          },
        },
      },
      post: {
        summary: '生成評語',
        description: '使用提示詞和 Gemini API 生成評語',
        tags: ['Evaluations'],
        security: [
          {
            BearerAuth: [],
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  studentName: {
                    type: 'string',
                    minLength: 2,
                    maxLength: 10,
                    description: '學生姓名',
                  },
                  toneId: {
                    type: 'string',
                    description: '語氣ID',
                  },
                  wisdomIds: {
                    type: 'array',
                    minItems: 1,
                    maxItems: 10,
                    items: { type: 'string' },
                    description: '形容詞ID列表',
                  },
                  prompt: {
                    type: 'string',
                    minLength: 50,
                    description: '生成的提示詞',
                  },
                },
                required: ['studentName', 'toneId', 'wisdomIds', 'prompt'],
              },
            },
          },
        },
        responses: {
          201: {
            description: '評語生成成功',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        studentName: { type: 'string' },
                        content: { type: 'string' },
                        createdAt: { type: 'string', format: 'date-time' },
                      },
                    },
                  },
                },
              },
            },
          },
          400: {
            description: '驗證失敗或業務規則違反',
          },
          401: {
            description: '未授權',
          },
          500: {
            description: 'Gemini API 錯誤或資料庫錯誤',
          },
        },
      },
    },
    '/api/evaluations/{id}': {
      get: {
        summary: '取得評語詳情',
        description: '取得單個評語的詳細信息',
        tags: ['Evaluations'],
        security: [
          {
            BearerAuth: [],
          },
        ],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: '評語ID',
          },
        ],
        responses: {
          200: {
            description: '成功取得評語詳情',
          },
          404: {
            description: '評語不存在',
          },
          401: {
            description: '未授權',
          },
        },
      },
      delete: {
        summary: '刪除評語',
        description: '刪除指定的評語',
        tags: ['Evaluations'],
        security: [
          {
            BearerAuth: [],
          },
        ],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: '評語ID',
          },
        ],
        responses: {
          200: {
            description: '評語刪除成功',
          },
          404: {
            description: '評語不存在',
          },
          401: {
            description: '未授權',
          },
          500: {
            description: '伺服器錯誤',
          },
        },
      },
    },
    '/api/prompts/preview': {
      post: {
        summary: '預覽生成的提示詞',
        description: '不保存，僅顯示將要發送給 Gemini API 的提示詞',
        tags: ['Prompts'],
        security: [
          {
            BearerAuth: [],
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  studentName: {
                    type: 'string',
                    description: '學生姓名',
                  },
                  toneId: {
                    type: 'string',
                    description: '語氣ID',
                  },
                  wisdomIds: {
                    type: 'array',
                    items: { type: 'string' },
                    description: '形容詞ID列表',
                  },
                },
                required: ['studentName', 'toneId', 'wisdomIds'],
              },
            },
          },
        },
        responses: {
          200: {
            description: '成功生成提示詞預覽',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        prompt: { type: 'string' },
                        metadata: {
                          type: 'object',
                          properties: {
                            studentName: { type: 'string' },
                            tone: { type: 'string' },
                            wisdoms: { type: 'array', items: { type: 'string' } },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/admin/tones': {
      get: {
        summary: '取得所有語氣',
        description: '取得可用的語氣列表',
        tags: ['Admin'],
        security: [
          {
            BearerAuth: [],
          },
        ],
        responses: {
          200: {
            description: '成功取得語氣列表',
          },
        },
      },
      post: {
        summary: '新增語氣',
        description: '新增一個新的語氣選項',
        tags: ['Admin'],
        security: [
          {
            BearerAuth: [],
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: {
                    type: 'string',
                    description: '語氣名稱',
                  },
                  description: {
                    type: 'string',
                    description: '語氣描述',
                  },
                },
                required: ['name'],
              },
            },
          },
        },
        responses: {
          201: {
            description: '語氣創建成功',
          },
          400: {
            description: '驗證失敗',
          },
        },
      },
    },
    '/api/admin/wisdoms': {
      get: {
        summary: '取得所有形容詞',
        description: '取得可用的形容詞列表',
        tags: ['Admin'],
        security: [
          {
            BearerAuth: [],
          },
        ],
        responses: {
          200: {
            description: '成功取得形容詞列表',
          },
        },
      },
      post: {
        summary: '新增形容詞',
        description: '新增一個新的形容詞',
        tags: ['Admin'],
        security: [
          {
            BearerAuth: [],
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  content: {
                    type: 'string',
                    minLength: 10,
                    maxLength: 500,
                    description: '形容詞內容',
                  },
                  priority: {
                    type: 'integer',
                    minimum: 0,
                    maximum: 100,
                    description: '優先級（可選）',
                  },
                },
                required: ['content'],
              },
            },
          },
        },
        responses: {
          201: {
            description: '形容詞創建成功',
          },
          400: {
            description: '驗證失敗',
          },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: '使用 Bearer token 進行認證',
      },
    },
  },
  security: [
    {
      BearerAuth: [],
    },
  ],
};

/**
 * 匯出 OpenAPI 規範作為 JSON
 */
export function getOpenApiJson() {
  return JSON.stringify(openApiSpec, null, 2);
}
