import express from "express";

import { createJournalEntry, getJournalEntries } from "./journalController";

const router = express.Router();;

router.post("/", createJournalEntry);

router.get("/:userId", getJournalEntries);

export default router;
