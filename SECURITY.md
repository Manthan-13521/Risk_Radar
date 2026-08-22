# Security Model

ShieldSense is an analysis engine designed to evaluate potentially malicious URLs, messages, and files securely. The following principles govern its security architecture.

## 1. Untrusted Content Boundary
All user-provided inputs (URLs, emails, SMS texts, and file contents) are strictly treated as **UNTRUSTED CONTENT**.
- Inputs are passed to the AI reasoning engine solely as evidence.
- Explicit prompt engineering safeguards are implemented to prevent prompt injection. The AI is instructed never to execute or follow commands found within the submitted payload.
- File contents are truncated (maximum 20,000 characters) to prevent token overflow and denial-of-service via massive payloads.

## 2. Safe File Analysis
ShieldSense inspects file metadata and extracts text from supported document types (`.pdf`, `.docx`, `.txt`, `.csv`) entirely server-side.
- **No execution:** ShieldSense will *never* execute binaries, scripts, or macros.
- Unsupported or dangerous file types (e.g., `.exe`, `.msi`, `.docm`) are analyzed at the metadata level (extension, hash, size) to produce heuristic signatures (e.g., \`EXECUTABLE_FILE\`, \`DOUBLE_EXTENSION\`), but their contents are never dynamically executed or placed in executable paths.

## 3. Simulated Actions
The mitigation actions provided in the UI (Quarantine, Block, Warn, Allow) are entirely **simulated** for demonstration purposes.
- ShieldSense does not alter OS settings, firewall rules, or interact with external third-party accounts (e.g., email providers) to block or delete actual user data.
- The action merely records a simulated state in the database to demonstrate policy decision-making.

## 4. Database & Privacy
- User inputs are hashed (SHA-256) and their contents are aggressively truncated in the database for privacy.
- Raw file binary uploads are processed in memory and immediately discarded. They are not persisted to cloud storage.

## 5. Hackathon Prototype Limitations
This is a prototype built for a hackathon. Current limitations include:
- A rudimentary in-memory IP rate limiter (not distributed).
- No authenticated user sessions; scan history is visible across the deployment (though limited to the last 50 scans).
- External Threat Intelligence (e.g., VirusTotal) is intentionally omitted to maintain absolute application stability.
