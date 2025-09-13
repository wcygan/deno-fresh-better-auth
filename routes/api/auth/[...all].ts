import { auth } from "../../../utils/auth.ts";

// Handles all requests under /api/auth/*
export const handler = auth.handler;
