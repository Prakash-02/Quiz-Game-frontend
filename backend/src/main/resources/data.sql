-- Seed quiz for demo
-- This runs on startup (spring.sql.init.mode=always)
-- Only inserts if the demo quiz doesn't already exist

DO $$
DECLARE
  quiz_id TEXT;
  q1_id TEXT;
  q2_id TEXT;
  q3_id TEXT;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM quizzes WHERE title = 'Demo: General Knowledge') THEN
    INSERT INTO quizzes (id, title, description, host_id, created_at)
    VALUES (gen_random_uuid()::text, 'Demo: General Knowledge', 'A quick demo quiz to test the app', 'demo', now())
    RETURNING id INTO quiz_id;

    INSERT INTO questions (id, quiz_id, type, prompt, time_limit_seconds, order_index)
    VALUES (gen_random_uuid()::text, quiz_id, 'TEXT', 'What is the capital of France?', 20, 0)
    RETURNING id INTO q1_id;

    INSERT INTO question_options (id, question_id, text, correct, order_index) VALUES
      (gen_random_uuid()::text, q1_id, 'London', false, 0),
      (gen_random_uuid()::text, q1_id, 'Berlin', false, 1),
      (gen_random_uuid()::text, q1_id, 'Paris', true, 2),
      (gen_random_uuid()::text, q1_id, 'Madrid', false, 3);

    INSERT INTO questions (id, quiz_id, type, prompt, time_limit_seconds, order_index)
    VALUES (gen_random_uuid()::text, quiz_id, 'TEXT', 'How many sides does a hexagon have?', 15, 1)
    RETURNING id INTO q2_id;

    INSERT INTO question_options (id, question_id, text, correct, order_index) VALUES
      (gen_random_uuid()::text, q2_id, '5', false, 0),
      (gen_random_uuid()::text, q2_id, '6', true, 1),
      (gen_random_uuid()::text, q2_id, '7', false, 2),
      (gen_random_uuid()::text, q2_id, '8', false, 3);

    INSERT INTO questions (id, quiz_id, type, prompt, time_limit_seconds, order_index)
    VALUES (gen_random_uuid()::text, quiz_id, 'TEXT', 'Which planet is known as the Red Planet?', 20, 2)
    RETURNING id INTO q3_id;

    INSERT INTO question_options (id, question_id, text, correct, order_index) VALUES
      (gen_random_uuid()::text, q3_id, 'Venus', false, 0),
      (gen_random_uuid()::text, q3_id, 'Jupiter', false, 1),
      (gen_random_uuid()::text, q3_id, 'Mars', true, 2),
      (gen_random_uuid()::text, q3_id, 'Saturn', false, 3);
  END IF;
END $$;
