# Workflow Automation Engine

A distributed workflow orchestration platform for designing and executing multi-step automation pipelines through a visual, node-based interface.

Built as a systems exploration project focused on the execution layer behind workflow automation: dependency resolution, durable execution, state propagation, failure handling, and extensible integrations.

---

## Architecture

The system separates **workflow definition** from **workflow execution**.

```text
┌──────────────────────┐
│   Visual Builder     │
│     React Flow       │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Workflow Definition  │
│    Nodes + Edges      │
└──────────┬───────────┘
           │
           ▼
┌────────────────────────────┐
│      Execution Engine      │
│                            │
│  Graph Resolution          │
│        ↓                   │
│  Topological Sort          │
│        ↓                   │
│  Context Propagation       │
│        ↓                   │
│  Node Execution            │
└──────────┬─────────────────┘
           │
           ▼
┌──────────────────────┐
│     Integrations     │
│                      │
│ OpenAI · Gemini      │
│ Anthropic · Slack    │
│ Discord · HTTP       │
└──────────────────────┘
```

A workflow is represented as a directed graph. When execution begins, the engine resolves that graph into a dependency-correct execution order before dispatching individual nodes.

The canvas determines what depends on what. The execution engine determines when each node can run.

---

## Engineering Highlights

### Dependency-Aware Execution

Users can construct a workflow in any visual order — execution does not depend on canvas position or connection-creation order.

Before execution begins, the engine performs a topological sort over the workflow graph to produce a valid dependency order:

```text
A ─────► C
│
└─────► B ─────► D
```

is resolved into an execution order such as:

```text
A → B → C → D
```

This guarantees that a node cannot execute before the nodes it depends on have produced their outputs.

### Shared Execution Context

Each node receives the current workflow context and returns an updated context:

```text
Node A
  │
  ▼
Context
  │
  ▼
Node B
  │
  ▼
Updated Context
  │
  ▼
Node C
```

Downstream nodes can reference upstream outputs using Handlebars templates evaluated against the live execution context immediately before the node executes:

```text
{{generateImage.url}}
```

This allows independently implemented integrations to participate in stateful workflows without being directly coupled to one another.

### Durable Execution

Workflow execution runs through Inngest as a sequence of durable steps:

```text
Create Execution
       ↓
Load Workflow
       ↓
Resolve Dependencies
       ↓
Execute Node
       ↓
Checkpoint
       ↓
Execute Next Node
       ↓
       ...
```

Production executions retry transient failures, while configuration errors can be marked non-retriable so the system does not repeatedly retry failures that require user intervention.

A dedicated failure handler records error information against the execution, making failed workflows inspectable rather than silently disappearing.

### Extensible Integration Architecture

Every integration follows the same four-file contract:

```text
node.tsx
dialog.tsx
actions.ts
executor.ts
```

| Component     | Responsibility                      |
| ------------- | ------------------------------------ |
| `node.tsx`    | Canvas representation               |
| `dialog.tsx`  | Configuration UI                    |
| `actions.ts`  | Server-side configuration mutations |
| `executor.ts` | Runtime execution logic             |

An executor registry maps node types to their implementations. Adding an integration therefore means adding another vertical slice rather than modifying global execution logic.

Six action integrations currently use this architecture.

### Real-Time Execution State

Each trigger and integration publishes execution state through a typed Inngest realtime channel:

```text
Executor
   │
   ├── loading
   ├── success
   └── error
         │
         ▼
 Realtime Channel
         │
         ▼
   Canvas Node
```

The workflow canvas can therefore reflect execution state live without relying on a polling loop.

### Credential Isolation

External API credentials are encrypted at rest. During execution, credentials are decrypted inside the specific execution step that requires them rather than being decrypted earlier and carried through the workflow.

This keeps credential handling close to the code that actually consumes the secret.

---

## Integrations

**Actions**
- OpenAI
- Anthropic
- Gemini
- Slack
- Discord
- HTTP Request

**Triggers**
- Manual execution
- Google Form webhook
- User-configured Stripe webhook

The orchestration layer treats providers as integrations rather than embedding provider-specific behavior into the execution engine. This keeps the core execution model independent of the services being orchestrated.

---

## Handling Failure

The execution engine distinguishes between failures that should be retried and failures that should fail immediately:

```text
Missing Configuration
        ↓
NonRetriableError
        ↓
Fail Immediately
```

versus

```text
Transient External Failure
        ↓
Retry
        ↓
Successful Execution
```

This distinction prevents configuration errors from consuming unnecessary retries while allowing transient external failures to recover automatically.

---

## Authentication & Billing

Authentication is implemented with `better-auth`. Platform subscriptions are managed through Polar, with subscription-gated functionality enforced server-side at the API layer.

For example, creating a new credential is protected by a subscription-aware procedure rather than relying solely on client-side UI restrictions.

---

## Why I Built This

The interesting problem wasn't building another visual automation interface. It was understanding what happens between:

```text
User-Defined Graph
        ↓
Dependency Resolution
        ↓
Execution Plan
        ↓
Durable Execution
        ↓
State Propagation
        ↓
External Side Effects
```

"Connect these nodes and run them" sounds simple until dependencies, retries, failures, shared state, external APIs, and long-running execution enter the picture. At that point, the canvas is no longer the interesting part. The execution system is.

---

## Technical Stack

**Frontend**
Next.js · React · React Flow · TypeScript

**Backend**
Node.js · tRPC · Prisma · Neon PostgreSQL

**Execution**
Inngest Functions · Inngest Realtime

**Infrastructure**
Vercel · Sentry

**Integrations**
OpenAI · Anthropic · Gemini · Slack · Discord · HTTP

**Other**
better-auth · Polar · Handlebars · `cryptr` · `nuqs`

---

Topics include:
- Workflow graph representation
- Topological sorting
- Context propagation
- Durable execution and checkpointing
- Retry semantics
- Executor dispatch
- Integration architecture
- Realtime execution state
- Credential lifecycle
- Authentication and billing boundaries

---

## Status

Personal systems exploration project.

The core orchestration architecture is functional, with six action integrations and three trigger types implemented. The integration contract is designed to support additional nodes without changes to the core execution engine.
