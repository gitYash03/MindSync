CREATE TABLE journal_entries (
    journal_id SERIAL PRIMARY KEY,
    user_id UUID,
    entry_text TEXT NOT NULL,
    emotion_label TEXT[],
    created_at TIMESTAMP DEFAULT NOW()
);