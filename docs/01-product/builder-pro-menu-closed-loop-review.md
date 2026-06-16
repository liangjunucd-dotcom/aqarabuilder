# Builder Pro Four-Domain Operating Contract

> Version: v0.2
> Status: product / design / engineering contract
> Scope: Builder Pro primary navigation, domain ownership, object boundaries, project-to-work-order operating loop
> Audience: Product, Design, Engineering, Growth, Operations
> Core principle: **Builder Pro exposes four business domains, not a list of tools.**

---

## 0. Contract Status

This document is the navigation and domain contract for Builder Pro.

Future Builder Pro design and development must follow this rule:

> A new capability may be powerful, but it does not automatically become a primary sidebar menu. It must first belong to one of the four operating domains.

This document supersedes earlier Builder Pro menu lists that exposed `Design`, `Delivery`, `Remote Service`, `Service Plans`, `Marketplace`, `Customers`, `Ledger`, `Showcase` or `Workspace` as first-level menus.

Those capabilities are still required. They are folded into the correct business domain instead of competing for first-level navigation.

Visual and interaction design must also follow [`builder-pro-design-language-contract.md`](./builder-pro-design-language-contract.md). For `Projects` and `Leads`, the Houzz Pro-style workbench is the minimum design baseline; additional Aqara-specific capabilities may only be added when they preserve or improve that baseline.

---

## 1. Product Decision

Builder Pro should follow a compact professional SaaS IA similar in spirit to Houzz Pro:

```text
Projects
Leads
Financials
Company
```

The four domains answer the professional user's business questions:

| Domain | User question | Canonical object |
|---|---|---|
| Projects | What work am I responsible for delivering? | `ProjectPassport` |
| Leads | What opportunities can become work? | `Lead` / `ServiceIntent` |
| Financials | What has been quoted, contracted, paid or settled? | `Quote` / `Contract` / `Invoice` / `Settlement` |
| Company | Who am I, who is my team, and what am I allowed to offer? | `ProfessionalProfile` / `Organization` / `Credential` |

Builder Pro is not a second consumer homepage. It is a workbench for professionals and organizations to win, deliver, service and monetize smart-space projects.

---

## 2. Primary Navigation Contract

### 2.1 Required Primary Menus

The Builder Pro primary sidebar must contain only these business domains:

| Key | Default English label | Chinese label | Icon intent | Notes |
|---|---|---|---|---|
| `projects` | Projects | 项目 | project / folder | Default operating domain after onboarding |
| `leads` | Leads | 线索 | user-plus / inbox | Can be empty or simplified for personal/private users |
| `financials` | Financials | 财务 | receipt / chart | In personal context this may emphasize earnings and credits |
| `company` | Company | 公司 | building / badge | In Personal Workspace this may display as `Profile` |

The primary menu should not include:

```text
Dashboard
Design
Delivery
Remote Service
Service Plans
Marketplace
Customers
Spaces
Studios
Ledger
Showcase
Academy
Settings
Workspace
```

These are either nested surfaces, utilities, tabs, settings, or growth assets.

### 2.2 Root Page

`/pro` may show an operating overview, setup checklist, recent projects, tasks and quick-create shortcuts.

It should not introduce a fifth primary menu called `Home` or `Dashboard`.

Recommended behavior:

```text
/pro
-> if there are active projects: Projects overview
-> if no project exists: getting-started panel + quick create
-> if onboarding just finished: project-start surface
```

### 2.3 Utility Navigation

The following are global utilities, not business domains:

| Utility | Placement |
|---|---|
| Search | left rail utility or top bar |
| Messages | left rail lower utility or top bar |
| Notifications | left rail lower utility or top bar |
| Help | left rail lower utility |
| Settings | inside Company or lower utility |
| Account / profile switch | avatar menu |
| Work Context switcher | top bar, not sidebar primary menu |

The Work Context switcher changes scope. It is not a menu.

```text
Personal · Jun
Liang Design Studio
Aqara Space Shanghai Xuhui
Dubai Certified Hub
```

### 2.4 Object Workbench Contract

Builder Pro pages should follow a Houzz Pro-style object workbench pattern.

The user should not feel they are browsing feature pages. They should feel they are operating business objects.

Required workbench anatomy:

| Area | Purpose | UI rule |
|---|---|---|
| Header | object identity, owner, status, primary CTA | compact; no marketing copy |
| Stage strip | where this object is in the operating loop | visible near the top; directly editable when safe |
| Center | current work: tasks, activity, files, brief, work orders | high-density, table/list first |
| Right panel | next best action, create-new shortcuts, facts | stable width; action-oriented |
| Quick create | create estimate, contract, work order, file, design package or service session | icon grid; no long descriptions |

This pattern applies to:

```text
/pro/projects
/pro/projects/:id/overview
/pro/leads
/pro/leads/:id
```

#### Projects Workbench

Project detail must expose:

| Surface | Required content |
|---|---|
| Project header | title, customer, market, status, quote, Studio state |
| Project stage strip | Brief -> Design -> Quote -> Schedule -> Install -> Studio -> Accept -> Service |
| Work Orders | remote design, site survey, installation, commissioning, remote service / maintenance |
| To-Do | next operational tasks and owners |
| Financial summary | quoted, invoiced, paid, pending |
| Quick create | Estimate, Contract, Work Order, Design, Preview, Service |

Project detail must avoid long explanatory paragraphs. The best interface answer is usually:

```text
what is this project
what stage is it in
what is blocked
what should I create or do next
```

#### Leads Workbench

Leads must expose:

| Surface | Required content |
|---|---|
| Lead header | customer, source, stage, match score, SLA |
| Triage cards | SLA first, best fit, brief to quote |
| Lead table / kanban | stage, budget, market, tags, direct actions |
| Lead detail | brief, source, scope, budget, contact, activity |
| Conversion | Respond, Schedule, Estimate, Convert to Project |

Lead detail must not hide conversion inside secondary navigation. `Convert to Project` is a primary action whenever the lead is not lost.

The moment a Lead is accepted as real work:

```text
Lead -> ProjectPassport
Lead -> existing Project WorkOrder
```

Delivery evidence, Studio access and service records must move into Projects.

#### Financials Workbench

Financials is the commercial control room. It should not become a full ERP in the first release.

Financials must expose:

| Surface | Required content |
|---|---|
| Financial header | quoted pipeline, paid, to collect, billing-ready rate |
| Tabs | Overview, Estimates, Contracts, Invoices, Settlements |
| Collection queue | projects with open receivables and next payment trigger |
| Commercial documents | estimates, contracts, invoices and settlement records by project |
| Quick create | Estimate, Contract, Invoice, Payment, Change Order, Settlement |
| Settlement readiness | evidence completeness and payout readiness |

Financials owns commercial facts. It does not own delivery work.

Required object rule:

```text
Lead can create an Estimate.
Project owns the commercial context.
Financials owns the commercial document and payment state.
WorkOrder / Acceptance evidence decides settlement readiness.
```

Early-stage Builder Pro can allow offline payment and manual recording, but the platform must still capture:

```text
amount
project
document type
status
payer / payee context
payment trigger
evidence readiness
settlement state
```

This lets the system later upgrade to escrow, split payments, invoices and warranty reserves without rebuilding the project flow.

---

## 3. Domain Ownership

### 3.1 Projects

**Positioning:** project operating room and delivery truth source.

Projects owns everything after a professional or organization accepts responsibility for actual work.

Primary objects:

```text
ProjectPassport
RequirementBrief
DesignPackage
WorkOrder
InstallerHandoff
CommissioningSession
AcceptanceRecord
ServicePlan instance
ProjectActivity
ProjectFiles
```

Projects contains the smart-home-specific depth that should not be exposed as first-level menus:

| Nested surface | Purpose |
|---|---|
| Overview | status, owner, timeline, next action |
| Client & Brief | customer, address, project type, contact, background, requirements |
| Design | space solution, point map, BOM basis, automation, Life Dashboard setup |
| Work Orders | design task, site survey, installation, commissioning, remote service, maintenance |
| Studio | Studio binding, deployment package, health, commissioning record |
| Acceptance | evidence, customer confirmation, handover checklist |
| Files | contract, drawings, photos, reports, exported packages |
| Activity | messages, audit, AI Agent events, change history |

Required project status model:

```text
draft
-> qualified
-> quoted
-> design-confirmed
-> scheduled
-> in-progress
-> pending-acceptance
-> accepted
-> service-active
-> closed
```

Design confirmation rule:

- Customer confirmation can be completed through electronic signing, quote approval or recorded offline confirmation.
- Life App preview confirmation is optional.
- After confirmation, the selected design version becomes `design-confirmed`.
- Later scope changes must create a change order or a new design version; do not silently mutate the confirmed design.

### 3.2 Leads

**Positioning:** opportunity intake and qualification.

Leads is before Projects. It should answer:

```text
Which incoming opportunities should I pursue, assign, reject or convert?
```

Lead sources:

| Source | Example |
|---|---|
| Builder frontstage | Find Professionals, profile inquiry, showcase inquiry |
| Aqara Life | service request, remote diagnosis request, upgrade request |
| Marketplace | service package inquiry |
| Aqara Space / service organization | store referral, local lead pool |
| Manual | imported customer, offline referral, phone inquiry |
| Platform dispatch | available design job, local installation job, maintenance job |

Lead stages:

```text
new
-> contacted
-> qualified
-> proposal-sent
-> won
-> lost
-> archived
```

Closed-loop requirement:

```text
Lead / ServiceIntent
-> qualify
-> customer context
-> proposal or estimate
-> ProjectPassport
```

Leads may expose platform job opportunities, but accepted work must become either:

1. a new `ProjectPassport`, or
2. a `WorkOrder` inside an existing project.

Leads should not own delivery evidence, Studio access, service sessions or long-term customer history.

### 3.3 Financials

**Positioning:** money, commercial documents and settlement.

Financials owns the commercial layer across leads, projects, service plans and marketplace items.

Primary objects:

```text
Estimate
Proposal
Quote
Contract
ChangeOrder
Invoice
PaymentRecord
CreditTransaction
SettlementRecord
CommissionRecord
FinancialReport
```

Financials contains what earlier documents called `Ledger`.

Required sub-surfaces:

| Surface | Purpose |
|---|---|
| Estimates / Proposals | quote before contract |
| Contracts | electronic signing and confirmation |
| Invoices / Payments | collection status and payment records |
| Credits | AI, model usage, quota grants and add-on usage records |
| Settlements | platform commission, installer payout, team allocation |
| Reports | revenue, receivables, service package performance |

Commercial rule:

```text
Quote / Proposal
-> Contract or approval
-> Project status update
-> Invoice / payment record
-> acceptance-linked receivable
-> settlement or renewal
```

MVP may support offline payment recording. It must still keep structured quote, contract, payment state and acceptance basis so escrow, split settlement and invoicing can be added later.

### 3.4 Company

**Positioning:** identity, trust, capability and organization operations.

Company owns who is allowed to offer what, where, and under whose responsibility.

Primary objects:

```text
ProfessionalProfile
PublicProfile
Organization
Membership
Credential
Badge
ServiceArea
TeamRole
MarketplaceListing
ServicePackageTemplate
PluginPublication
CompanySettings
```

In Personal Workspace, the display label may be `Profile`, but the domain key remains `company`.

Company contains:

| Surface | Purpose |
|---|---|
| Profile | professional profile, public page, contact, languages, portfolio |
| Credentials | personal badges, licenses, installer certification, expiration |
| Organization | team, company, Aqara Space or service organization profile |
| Members | owner, admin, project manager, designer, installer, finance viewer |
| Service Area | countries, cities, service radius, remote/local capability |
| Catalog | service package templates, plugin listings, reusable assets |
| Marketplace Supply | publish or manage plugins and service packages |
| Settings | billing profile, notifications, permissions, integrations |

Company must not become store ERP.

For Aqara Space / service organizations, Builder Pro manages:

- organization profile and certification state
- members and Builder Pro roles
- service regions and capabilities
- lead and project assignment
- quality review and service responsibility

Builder Pro does not manage:

- retail POS
- inventory ERP
- staff attendance
- store rent
- offline store display
- full internal accounting

---

## 4. Hidden Complexity Contract

### 4.1 Work Orders Live Inside Projects

The future platform business model requires dispatch and fulfillment, but `WorkOrder` should not be a first-level menu.

`WorkOrder` is the assignable unit of work inside a project.

Recommended work order types:

| Type | Who may own it | Output |
|---|---|---|
| `remote_design` | designer / remote expert | design package, point map, proposal basis |
| `site_survey` | local installer / service org | site evidence, constraints, updated brief |
| `installation` | certified installer / service org | installed devices and evidence |
| `commissioning` | installer / Studio operator | Studio configuration and commissioning session |
| `remote_service` | remote operator | diagnosis, tuning, report |
| `maintenance` | installer / service org | maintenance report and renewal signal |

Work order status:

```text
draft
-> open
-> matched
-> assigned
-> accepted
-> scheduled
-> in-progress
-> submitted
-> approved
-> rejected
-> cancelled
```

This supports a Meituan-like marketplace operating model without turning the sidebar into an ERP.

### 4.2 AI Agent Is a Capability Layer

AI Agent should not be a primary menu.

AI appears as:

- quick-create assistant
- project side panel
- lead qualification assistant
- estimate / proposal assistant
- design draft assistant
- point-map checker
- installer runbook assistant
- Studio commissioning assistant
- acceptance QA assistant
- remote diagnosis assistant

Every meaningful AI output must attach to a structured object:

```text
Lead
RequirementBrief
ProjectPassport
DesignPackage
WorkOrder
Quote
ServiceSession
AcceptanceRecord
```

Do not design AI as a generic chat destination detached from the project or lead state.

### 4.3 Studio Is Runtime, Not Navigation

Studio-related work lives in Projects:

- deployment package
- Studio binding
- commissioning session
- device health
- runtime verification
- service session history

Studio may also appear in Company settings for organization-level integrations and permissions.

Do not create a first-level `Studios` menu in Builder Pro unless the active context is an enterprise / multi-site operating product. That belongs to Site Manager, not default Builder Pro.

### 4.4 Marketplace Is Not a Primary Pro Menu

Marketplace has three placements:

| Placement | Purpose |
|---|---|
| Builder frontstage `/home/marketplace` | discover and redeem plugins, service packages, templates and professionals with Account Points |
| Projects | attach assets, plugins or service packages to a project / quote |
| Company | manage published listings, service package templates and provider catalog |

Updated contract:
- Marketplace is a Capability Marketplace, not only a plugin store.
- Redeemed products always create Workspace Entitlements.
- Builder frontstage writes to the Personal Workspace, while Builder Pro writes to the current Active Workspace.
- Member users in a Team Workspace request purchase instead of directly spending Workspace Credits.
- Full contract: [`marketplace-assets-architecture.md`](./marketplace-assets-architecture.md).

Marketplace service package lifecycle:

```text
MarketplaceServicePackage
-> Lead or Quote
-> ServicePlan instance
-> ServiceSession / renewal / financial record
```

Plugins create entitlements. Service packages create service plan instances.

### 4.5 Remote Service and Service Plans Are Nested

Remote Service is a professional operation, not a first-level domain.

It appears under:

- Projects -> Work Orders / Studio / Service
- Company -> service capability and SLA settings
- Financials -> service plan billing and renewal

Service Plan is the commercial carrier for continuous service. It may originate from:

- project quote
- marketplace service package
- Aqara Life request
- remote service request
- renewal after acceptance

---

## 5. Context-Specific Labeling

The four-domain contract stays stable, but labels and empty states may adapt by Work Context.

### 5.1 Personal Workspace

Recommended first-level display:

```text
Projects
Leads
Financials
Profile
```

Rules:

- `Profile` maps to the `company` domain.
- Leads can show personal inquiries and available platform jobs.
- Financials can emphasize earnings, credits and personal receipts.
- Organization-heavy content stays hidden until the user creates or joins a team.

### 5.2 Team Workspace

Recommended first-level display:

```text
Projects
Leads
Financials
Company
```

Rules:

- Company shows members, roles, team profile, proof of business and service areas.
- Leads support assignment and lead managers.
- Projects support internal assignment and shared evidence.
- Financials support team-level quote, payment and payout visibility.

### 5.3 Aqara Space / Service Organization Workspace

Recommended first-level display:

```text
Projects
Leads
Financials
Company
```

Company must additionally expose:

- Aqara verification status
- service organization profile
- certified members
- service area
- quality metrics
- headquarters review state

Service organization members enter with personal Aqara accounts. Do not introduce shared store accounts.

### 5.4 Enterprise / Site Operator Context

Enterprise multi-site operations may require a separate Site Manager surface. Do not overload default Builder Pro navigation for enterprise-only operations.

---

## 6. Route Contract

Canonical Builder Pro routes:

```text
/pro
/pro/projects
/pro/projects/:projectId
/pro/leads
/pro/leads/:leadId
/pro/financials
/pro/company
```

Recommended nested routes:

```text
/pro/projects/:projectId/brief
/pro/projects/:projectId/design
/pro/projects/:projectId/work-orders
/pro/projects/:projectId/studio
/pro/projects/:projectId/acceptance
/pro/projects/:projectId/files
/pro/projects/:projectId/activity

/pro/financials/estimates
/pro/financials/contracts
/pro/financials/invoices
/pro/financials/credits
/pro/financials/settlements

/pro/company/profile
/pro/company/organization
/pro/company/members
/pro/company/credentials
/pro/company/service-area
/pro/company/catalog
/pro/company/settings
```

Legacy or previous prototype routes should redirect or be embedded:

| Previous route / menu | New placement |
|---|---|
| `/pro/delivery` | `/pro/projects/:projectId/work-orders` or Projects overview filter |
| `/pro/remote` | Project service tab or Work Order type `remote_service` |
| `/pro/service-plans` | Projects service tab, Financials renewals, Company catalog |
| `/pro/marketplace` | redirect to Builder frontstage `/home/marketplace` |
| `/pro/customers` | Leads detail and Project client tab; later may become Company CRM sub-surface if needed |
| `/pro/workshop` | Projects design tab or Builder Design Platform deep link |
| `/pro/ledger` | `/pro/financials` |
| `/pro/profile` | `/pro/company/profile` |
| `/pro/workspaces` | Work Context switcher and Company organization settings |

---

## 7. Quick Create Contract

The root page and top bar may expose a Quick Create menu. This is how many powerful functions stay discoverable without becoming sidebar menus.

Recommended Quick Create items:

| Item | Creates |
|---|---|
| Lead | `Lead` |
| Project | `ProjectPassport` |
| Proposal / Estimate | `Quote` or `Proposal` |
| Contract | `Contract` |
| Invoice | `Invoice` |
| Work Order | `WorkOrder` inside a project |
| Service Plan | `ServicePlan` instance |
| Service Package | `ServicePackageTemplate` under Company catalog |
| Plugin Listing | `MarketplaceListing` under Company catalog |

Quick Create must ask for the minimum required context. If an item requires a project, the user must select or create one.

---

## 8. UI Simplicity Rules

1. The primary sidebar must stay compact and task-oriented.
2. Do not add long explanatory copy inside SaaS work surfaces.
3. Use short labels, status chips, icons and tables over marketing cards.
4. Cards are for repeated objects and panels, not page sections.
5. New capabilities should first be placed as project tabs, quick actions, sub-surfaces or settings.
6. Empty states should provide one clear action, not a product manifesto.
7. Work Context switcher must show current scope clearly, but it should not explain the whole organization model every time.
8. Builder frontstage remains content / inspiration / discovery oriented; Builder Pro remains operating-work oriented.

---

## 9. MVP Closure Checklist

Builder Pro v1 satisfies this contract only if these transitions are possible:

- Lead can be qualified, rejected or converted to Project.
- Project can store project type, name, address, contact, phone and background.
- Project can attach or create a design package.
- Customer confirmation can move design to `design-confirmed`.
- Project can create Work Orders.
- Work Order can be assigned to a person or organization context.
- Installation / commissioning Work Order can collect evidence.
- Studio commissioning can produce a runtime record.
- Acceptance can be recorded with customer-visible evidence.
- Service Package can instantiate a Service Plan.
- Service Plan can produce Service Sessions and renewal records.
- Quote, contract, invoice, credits and settlement records are visible in Financials.
- Company can explain identity, membership, credentials, service area and marketplace supply.
- AI Agent outputs attach to structured objects instead of floating as chat-only suggestions.

---

## 10. Decision Summary

Builder Pro should feel simple even when the platform becomes powerful.

The long-term commercial model is:

```text
global remote design
-> local certified delivery
-> Studio commissioning
-> customer acceptance
-> continuous service
-> reputation and revenue flywheel
```

The IA expression is:

```text
Leads find work.
Projects deliver work.
Financials monetize work.
Company proves who can do the work.
```

Everything else is a capability inside one of these domains.
