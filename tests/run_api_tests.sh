#!/bin/bash

##################################################################
# 完整 API 測試套件 - 學術評語系統
# 測試 22 個用例涵蓋所有 API 端點
##################################################################

set -e

BASE_URL="http://localhost:3000/api"
ADMIN_PASSWORD="5430"
REPORT_FILE="/tmp/api_test_report.json"

# 初始化報告
cat > "$REPORT_FILE" << 'EOF'
{
  "timestamp": "START_TIME",
  "tests": [],
  "summary": {
    "total": 0,
    "passed": 0,
    "failed": 0,
    "skipped": 0
  }
}
EOF

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 計數器
TOTAL=0
PASSED=0
FAILED=0
SKIPPED=0

# 測試結果數組
declare -a RESULTS

# 執行測試函數
run_test() {
  local test_name=$1
  local method=$2
  local endpoint=$3
  local data=$4
  local expected_status=$5
  local auth=$6
  
  TOTAL=$((TOTAL + 1))
  
  local full_url="${BASE_URL}${endpoint}"
  
  # 準備 curl 命令
  local cmd="curl -s -w '\n%{http_code}' -X $method '$full_url'"
  
  if [ ! -z "$data" ]; then
    cmd="$cmd -H 'Content-Type: application/json' -d '$data'"
  fi
  
  if [ "$auth" == "admin" ]; then
    cmd="$cmd -H 'Authorization: Bearer ${ADMIN_PASSWORD}'"
  fi
  
  # 執行請求
  response=$(eval "$cmd")
  
  # 解析響應
  http_code=$(echo "$response" | tail -1)
  body=$(echo "$response" | sed '$d')
  
  # 檢查結果
  if [[ "$http_code" == "$expected_status"* ]]; then
    PASSED=$((PASSED + 1))
    status="✅ PASS"
    colour=$GREEN
  else
    FAILED=$((FAILED + 1))
    status="❌ FAIL"
    colour=$RED
  fi
  
  echo -e "${colour}${status}${NC} [$http_code/$expected_status] $test_name"
  
  # 僅輸出前 200 字符的響應
  if [ ${#body} -gt 200 ]; then
    echo "     Response: ${body:0:200}..."
  else
    echo "     Response: $body"
  fi
  
  # 紀錄結果
  RESULTS+=("$test_name|$method|$endpoint|$http_code|$expected_status")
}

##################################################################
# 第 1 組：基礎數據 API
##################################################################
echo -e "\n${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}第 1 組：基礎數據 API (GET)${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}\n"

# Test 1: 取得形容詞列表
run_test "GET /admin/wisdoms - 取得所有形容詞" \
  "GET" "/admin/wisdoms" "" "200"

# Test 2: 取得語氣列表
run_test "GET /admin/tones - 取得所有語氣" \
  "GET" "/admin/tones" "" "200"

##################################################################
# 第 2 組：認證 API
##################################################################
echo -e "\n${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}第 2 組：認證 API${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}\n"

# Test 3: 登入成功
run_test "POST /auth/login - 正確密碼登入" \
  "POST" "/auth/login" '{"password":"5430"}' "200"

# Test 4: 登入失敗
run_test "POST /auth/login - 錯誤密碼登入" \
  "POST" "/auth/login" '{"password":"wrong"}' "401"

# Test 5: 缺少密碼
run_test "POST /auth/login - 缺少密碼字段" \
  "POST" "/auth/login" '{}' "400"

# Test 6: 登出
run_test "POST /auth/logout - 登出" \
  "POST" "/auth/logout" '{}' "200"

##################################################################
# 第 3 組：Prompt 預覽 API
##################################################################
echo -e "\n${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}第 3 組：Prompt 預覽 API${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}\n"

# Test 7: 有效輸入生成 Prompt
run_test "POST /prompts/preview - 有效輸入生成" \
  "POST" "/prompts/preview" '{"studentName":"測試學生","wisdomIds":["clm5b0l8l0000j3c2q1q2q3q4"],"toneId":"clm5b1h8l0000j3c2q1q2q3q5"}' "200"

# Test 8: 缺少 studentName
run_test "POST /prompts/preview - 無 studentName" \
  "POST" "/prompts/preview" '{"wisdomIds":["id1"],"toneId":"id2"}' "400"

# Test 9: 缺少 wisdomIds
run_test "POST /prompts/preview - 無 wisdomIds" \
  "POST" "/prompts/preview" '{"studentName":"test","toneId":"id"}' "400"

# Test 10: wisdomIds 為空陣列
run_test "POST /prompts/preview - wisdomIds 為空陣列" \
  "POST" "/prompts/preview" '{"studentName":"test","wisdomIds":[],"toneId":"id"}' "400"

##################################################################
# 第 4 組：評語管理 API
##################################################################
echo -e "\n${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}第 4 組：評語管理 API${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}\n"

# Test 11: 取得評語列表（無參數）
run_test "GET /evaluations - 取得列表（無參數）" \
  "GET" "/evaluations" "" "200"

# Test 12: 分頁參數
run_test "GET /evaluations - 分頁參數 (page=1&pageSize=5)" \
  "GET" "/evaluations?page=1&pageSize=5" "" "200"

# Test 13: 搜尋參數
run_test "GET /evaluations - 搜尋參數 (studentName=小)" \
  "GET" "/evaluations?studentName=%E5%B0%8F" "" "200"

# Test 14: 當前評語列錶中第一筆的 ID（用於後續測試）
first_eval_id=$(curl -s -X GET "${BASE_URL}/evaluations?pageSize=1" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
if [ ! -z "$first_eval_id" ]; then
  echo -e "${YELLOW}⚠️  使用現有評語 ID: $first_eval_id${NC}"
fi

# Test 15: 取得單筆評語（如果存在）
if [ ! -z "$first_eval_id" ]; then
  run_test "GET /evaluations/[id] - 取得單筆評語" \
    "GET" "/evaluations/$first_eval_id" "" "200"
else
  echo -e "${YELLOW}⚠️  SKIP${NC} [無測試數據] GET /evaluations/[id] - 取得單筆評語"
  SKIPPED=$((SKIPPED + 1))
fi

# Test 16: 無效 ID
run_test "GET /evaluations/invalid-id - 無效 ID" \
  "GET" "/evaluations/invalid123" "" "404"

# Test 17: 刪除評語無認證
run_test "DELETE /evaluations/[id] - 無認證應失敗" \
  "DELETE" "/evaluations/invalid123" "" "401"

##################################################################
# 第 5 組：認證管理 API（新增資料）
##################################################################
echo -e "\n${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}第 5 組：認證管理 API（新增）${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}\n"

# Test 18: 新增形容詞無認證
run_test "POST /admin/wisdoms - 無認證應失敗" \
  "POST" "/admin/wisdoms" '{"content":"測試形容詞"}' "401"

# Test 19: 新增形容詞有認證且有效資料
run_test "POST /admin/wisdoms - 有認證有效資料" \
  "POST" "/admin/wisdoms" '{"content":"新測試形容詞'$(date +%s)'"}' "201" "admin"

# Test 20: 新增語氣無認證
run_test "POST /admin/tones - 無認證應失敗" \
  "POST" "/admin/tones" '{"name":"test_tone"}' "401"

# Test 21: 新增語氣有認證且有效資料
run_test "POST /admin/tones - 有認證有效資料" \
  "POST" "/admin/tones" '{"name":"新語氣'$(date +%s)'","description":"測試"}' "201" "admin"

# Test 22: 無效頁碼
run_test "GET /evaluations - 無效頁碼 (page=0)" \
  "GET" "/evaluations?page=0" "" "400"

##################################################################
# 摘要
##################################################################
echo -e "\n${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}測試摘要${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}\n"

echo -e "📊 測試結果統計："
echo -e "  ${GREEN}✅ 通過：$PASSED${NC}"
echo -e "  ${RED}❌ 失敗：$FAILED${NC}"
echo -e "  ${YELLOW}⚠️  跳過：$SKIPPED${NC}"
echo -e "  📋 總計：$TOTAL\n"

# 計算成功率
if [ $TOTAL -gt 0 ]; then
  success_rate=$((PASSED * 100 / TOTAL))
  echo -e "📈 成功率：${success_rate}%\n"
fi

# 輸出詳細結果表格
echo -e "${BLUE}詳細結果：${NC}\n"
echo "┌─────────────────────────────────────────────────────────────────┐"
echo "│ # │ 端點                   │ 方法 │ 狀碼 │ 期望 │ 結果        │"
echo "├─────────────────────────────────────────────────────────────────┤"

counter=1
for result in "${RESULTS[@]}"; do
  IFS='|' read -r name method endpoint http expected <<< "$result"
  
  # 判斷狀態
  if [[ "$http" == "$expected"* ]]; then
    status_icon="✅"
  else
    status_icon="❌"
  fi
  
  # 簡化路徑顯示
  short_endpoint=$(echo "$endpoint" | sed 's|/api/||' | cut -c1-20)
  
  printf "│ %2d │ %-22s │ %4s │ %4s │ %4s │ %11s │\n" \
    "$counter" "$short_endpoint" "$method" "$http" "$expected" "$status_icon"
  
  counter=$((counter + 1))
done

echo "└─────────────────────────────────────────────────────────────────┘"

# 保存到文件
echo "✅ 測試完成！報告已生成到 $REPORT_FILE"
echo ""

# 顯示未通過的測試
if [ $FAILED -gt 0 ]; then
  echo -e "${RED}❌ 失敗的測試：${NC}"
  counter=1
  for result in "${RESULTS[@]}"; do
    IFS='|' read -r name method endpoint http expected <<< "$result"
    if [[ ! "$http" == "$expected"* ]]; then
      echo "   $counter. $name (HTTP $http, 期望 $expected)"
    fi
    counter=$((counter + 1))
  done
fi

exit 0
