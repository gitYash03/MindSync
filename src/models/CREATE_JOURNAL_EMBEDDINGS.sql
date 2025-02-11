CREATE TABLE journal_embeddings (
    journal_id INT REFERENCES journal_entries(journal_id) ON DELETE CASCADE,
    embedding VECTOR(768),
    PRIMARY KEY (journal_id)
);