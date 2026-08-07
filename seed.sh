#!/usr/bin/env bash
# Creates a demo quiz via the REST API. Run after the backend is up.
# Usage: ./seed.sh [BASE_URL]
# Example: ./seed.sh https://quiz-game-backend.onrender.com

BASE=${1:-http://localhost:8080}

echo "Seeding demo quiz at $BASE..."

QUIZ=$(curl -sf -X POST "$BASE/api/quizzes" \
  -H 'Content-Type: application/json' \
  -d '{"title":"Demo: General Knowledge","description":"A quick demo quiz"}')

QUIZ_ID=$(echo "$QUIZ" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$QUIZ_ID" ]; then
  echo "Failed to create quiz. Is the backend running at $BASE?"
  exit 1
fi

echo "Created quiz: $QUIZ_ID"

add_question() {
  local PROMPT="$1"
  local TIME="$2"
  local OPTIONS="$3"
  FORM=$(cat <<EOF
{"type":"TEXT","prompt":"$PROMPT","timeLimitSeconds":$TIME,"options":$OPTIONS}
EOF
)
  curl -sf -X POST "$BASE/api/quizzes/$QUIZ_ID/questions" \
    -F "question=$FORM;type=application/json" > /dev/null
  echo "  Added: $PROMPT"
}

add_question "What is the capital of France?" 20 \
  '[{"text":"London","correct":false},{"text":"Berlin","correct":false},{"text":"Paris","correct":true},{"text":"Madrid","correct":false}]'

add_question "How many sides does a hexagon have?" 15 \
  '[{"text":"5","correct":false},{"text":"6","correct":true},{"text":"7","correct":false},{"text":"8","correct":false}]'

add_question "Which planet is known as the Red Planet?" 20 \
  '[{"text":"Venus","correct":false},{"text":"Jupiter","correct":false},{"text":"Mars","correct":true},{"text":"Saturn","correct":false}]'

add_question "What is the largest ocean on Earth?" 20 \
  '[{"text":"Atlantic","correct":false},{"text":"Indian","correct":false},{"text":"Arctic","correct":false},{"text":"Pacific","correct":true}]'

add_question "In which year did the first moon landing occur?" 30 \
  '[{"text":"1965","correct":false},{"text":"1969","correct":true},{"text":"1972","correct":false},{"text":"1975","correct":false}]'

echo ""
echo "Done! Quiz ID: $QUIZ_ID"
echo "Copy this ID when creating a room via the UI, or visit $BASE to use the app."
