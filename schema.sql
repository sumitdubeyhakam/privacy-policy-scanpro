-- ReviewGrow Platform — PostgreSQL Schema
-- Run these statements once to initialize the database.

CREATE TABLE IF NOT EXISTS businesses (
  id serial PRIMARY KEY,
  business_name text NOT NULL,
  owner_name text,
  -- Email is stored lowercase (normalized at the application layer before insert)
  email text UNIQUE NOT NULL,
  phone text,
  city text,
  password_hash text NOT NULL,
  google_review_link text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS customers (
  id serial PRIMARY KEY,
  business_id int REFERENCES businesses(id) ON DELETE CASCADE,
  customer_name text NOT NULL,
  phone_number text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reviews (
  id serial PRIMARY KEY,
  business_id int REFERENCES businesses(id) ON DELETE CASCADE,
  customer_id int REFERENCES customers(id) ON DELETE SET NULL,
  service text,
  staff text,
  experience_rating int,
  staff_behavior_rating int,
  ai_review_text text,
  review_type text,
  review_clicked boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS feedback (
  id serial PRIMARY KEY,
  review_id int REFERENCES reviews(id) ON DELETE CASCADE,
  feedback_message text,
  created_at timestamptz DEFAULT now()
);
