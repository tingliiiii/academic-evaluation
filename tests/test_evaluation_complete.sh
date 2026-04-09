#!/bin/bash

set -e

BASE_URL="http://localhost:3000/api"

echo "🧪 完整評語生成流程測試"
echo "============================================================"

# Step 1: 獲取真實的 Wisdom ID
echo ""
echo "📋 Step 1：獲取形容詞和語氣數據"
wisdoms=$(curl -s "$BASE_URL/admin/wisdoms")
tones=$(curl -s "$BASE_URL/admin/tones")

wisdom_id=$(echo "$wisdoms" | jq -r '.data[0].id')
wisdom_content=$(echo "$wisdoms" | jq -r '.data[0].content')

tone_id=$(echo "$tones" | jq -r '.data[0].id')
tone_name=$(echo "$tones" | jq -r '.data[0].name')

echo "   ✅ Wisdom ID：$wisdom_id ($wisdom_content)"
echo "   ✅ Tone ID：$tone_id ($tone_name)"

# Step 2: 生成 Prompt 預覽
echo ""
echo "📋 Step 2：生成 Prompt 預覽"
prompt_response=$(curl -s -X POST "$BASE_URL/prompts/preview" \
  -H "Content-Type: application/json" \
  -d "{
    \"studentName\": \"測試學生_$(date +%s)\",
    \"wisdomIds\": [\"$wisdom_id\"],
    \"toneId\": \"$tone_id\"
  }")

prompt=$(echo "$prompt_response" | jq -r '.data.prompt')
if [ -z "$prompt" ] || [ "$prompt" == "null" ]; then
  echo "   ❌ Prompt 生成失敗"
  echo "   響應：$prompt_response"
  exit 1
fi

echo "   ✅ Prompt 生成成功（$(echo "$prompt" | wc -c) 字符）"
echo "   首 50 字：${prompt:0:50}..."

# Step 3: 調用 POST /api/evaluations 生成評語
echo ""
echo "📋 Step 3：核心測試 - POST /api/evaluations 生成並保存評語"

student_name="測試學生_$(date +%s)"

echo ""
echo "   請求數據："
echo "   - studentName: $student_name"
echo "   - wisdomIds: [\"$wisdom_id\"]"
echo "   - toneId: $tone_id"
echo "   - prompt: $(echo "$prompt" | head -c 100)..."

echo ""
echo "   正在呼叫 API... (這可能需要 30-60 秒，涉及 Gemini API 調用)"

# 呼叫 API 並記錄時間
start_time=$(date +%s%N)
evaluation_response=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/evaluations" \
  -H "Content-Type: application/json" \
  -d "{
    \"studentName\": \"$student_name\",
    \"wisdomIds\": [\"$wisdom_id\"],
    \"toneId\": \"$tone_id\",
    \"prompt\": $(echo "$prompt" | jq -R -s '.')
  }")
end_time=$(date +%s%N)

http_code=$(echo "$evaluation_response" | tail -1)
body=$(echo "$evaluation_response" | sed '$d')
elapsed_ms=$(( (end_time - start_time) / 1000000 ))

echo "   API 應答時間：${elapsed_ms}ms"
echo "   HTTP 狀態碼：$http_code"

# 解析響應
if [[ "$http_code" == "201" ]]; then
  echo "   ✅ API 返回 201 Created"
  
  evaluation_id=$(echo "$body" | jq -r '.data.id // empty')
  evaluation_content=$(echo "$body" | jq -r '.data.content // empty')
  
  if [ ! -z "$evaluation_id" ]; then
    echo "   ✅ 評語 ID：$evaluation_id"
    echo "   ✅ 評語內容已生成（$(echo "$evaluation_content" | wc -c) 字符）"
    echo "   首 80 字：${evaluation_content:0:80}..."
    
    # Step 4: 驗證是否成功保存到資料庫
    echo ""
    echo "📋 Step 4：驗證評語已保存到資料庫"
    
    # 等待 1 秒確保數據已提交
    sleep 1
    
    # 查詢評語列表
    list_response=$(curl -s "$BASE_URL/evaluations?studentName=$(echo -n "$student_name" | sed 's/_/%5F/g')")
    
    # 檢查是否在列表中找到
    found=$(echo "$list_response" | jq --arg id "$evaluation_id" '.data.items[] | select(.id == $id)' | wc -l)
    
    if [ "$found" -gt 0 ]; then
      echo "   ✅ 評語已成功保存到資料庫"
      echo "   ✅ 可以通過列表查詢找到"
      
      # 驗證單筆查詢
      detail_response=$(curl -s "$BASE_URL/evaluations/$evaluation_id")
      detail_success=$(echo "$detail_response" | jq -r '.success')
      
      if [ "$detail_success" == "true" ]; then
        echo "   ✅ 單筆查詢 GET /evaluations/$evaluation_id 成功"
      fi
    else
      echo "   ⚠️ 評語未在列表中找到(可能是搜尋延遲)"
      echo "   列表查詢結果：$list_response"
    fi
    
  else
    echo "   ❌ 響應中缺少 evaluation ID"
    echo "   完整響應：$body"
  fi
  
elif [[ "$http_code" == "429" ]]; then
  echo "   ⚠️ API 返回 429 Too Many Requests"
  echo "   原因：Gemini API 配額超出"
  echo "   響應："
  echo "$body" | jq '.' 2>/dev/null || echo "$body"
  
elif [[ "$http_code" == "500" ]]; then
  echo "   ❌ API 返回 500 Internal Server Error"
  echo "   完整響應："
  echo "$body" | jq '.' 2>/dev/null || echo "$body"
  
else
  echo "   ❌ API 返回不預期的狀態碼：$http_code"
  echo "   完整響應："
  echo "$body" | jq '.' 2>/dev/null || echo "$body"
fi

echo ""
echo "============================================================"
echo "✅ 測試完成"
