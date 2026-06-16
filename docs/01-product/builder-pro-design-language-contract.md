# Builder Pro Design Language Contract

> Version: v0.1  
> Status: product / design / engineering review contract  
> Scope: Builder Pro visual language, layout patterns, interaction rules and design review checklist  
> Reference spirit: Houzz Pro-style professional SaaS workbench, adapted for Aqara smart-space design, delivery and service

---

## 0. Contract Status

This document is the design-language contract for Builder Pro.

Every Builder Pro design change must be reviewed against this contract before it is considered done.

This contract does not copy Houzz Pro brand assets, logos, proprietary copy or commercial identity. It deliberately mirrors Houzz Pro's workbench layout discipline and operating patterns as the Builder Pro baseline:

```text
compact navigation
object-first workspaces
table-first directories
three-column detail rooms
quiet visual hierarchy
action density without marketing copy
```

The companion information-architecture contract is [`builder-pro-menu-closed-loop-review.md`](./builder-pro-menu-closed-loop-review.md).

---

## 0.1 Houzz Baseline Rule

For Builder Pro `Projects` and `Leads`, Houzz Pro is the minimum quality baseline.

This means:

```text
first match Houzz Pro's layout discipline
then add Aqara-specific smart-space capabilities
```

Designers and engineers may improve the experience, but the result must not be worse than the Houzz-style baseline in:

| Dimension | Minimum bar |
|---|---|
| Shell | black compact primary rail, no heavy top marketing/header layer |
| Project detail | left project sidebar, center work area, right inspector on overview |
| Project table pages | left project sidebar, wide spreadsheet table, no unnecessary right panel |
| Directory pages | search/filter/table first, row click into detail |
| Density | first viewport shows real work content, not intro copy |
| Visual polish | clean lines, quiet color, stable alignment, no decorative noise |

If a proposed design deviates from the Houzz baseline, the reviewer must explicitly answer:

```text
What user job becomes faster or clearer?
What was removed to keep the screen equally simple?
Why is this better than the Houzz-style baseline?
```

Without a clear answer, the design should return to the baseline.

---

## 1. North Star

Builder Pro should feel like a professional operating desk, not a consumer homepage.

The user should always understand:

| Question | UI answer |
|---|---|
| What object am I operating? | Project, Lead, Financial document, Company profile |
| What state is it in? | stage, status, SLA, owner, readiness |
| What can I do next? | primary action, quick create, row action |
| What facts matter? | right inspector or table columns |
| Where is the evidence? | files, activity, contracts, acceptance, settlement |

If a screen mainly explains what Builder Pro is, it is probably not a Builder Pro work screen.

---

## 2. Product Feel

Builder Pro design must be:

| Attribute | Meaning |
|---|---|
| Quiet | neutral backgrounds, thin borders, restrained color |
| Dense | tables, lists and panels carry more value than big cards |
| Operational | every surface exposes status, ownership and next action |
| Object-first | the page is anchored by a Lead, Project, document or organization |
| AI-native | AI appears as context-aware actions, not as decorative banners |
| Global-ready | English-first labels are acceptable; Chinese can coexist where useful |
| Trustworthy | avoid playful marketing visuals inside the workbench |

Avoid:

```text
large hero sections
marketing slogans
card-heavy dashboards
decorative gradients
large empty illustrations
nested cards
long guidance copy
feature-list navigation
internal implementation names
```

---

## 3. Information Density Rules

### 3.1 Default Page Shape

Builder Pro pages should prefer this hierarchy:

```text
global shell
-> object directory or object detail
-> table / timeline / task list / document grid
-> right inspector or quick-create panel
```

Cards are allowed only for:

```text
repeated object summaries
right-side inspectors
compact setup panels
modal sections
```

Cards should not be the default homepage pattern when a table can scan better.

### 3.2 Copy Density

Copy must be short and operational.

Good:

```text
Open
In progress
No open tasks
Convert to Project
New Contract
Project Location
Client Details
```

Avoid:

```text
This feature helps you...
Here are some recommended tools...
Continue doing space plans, Life Dashboard and automation experience...
Your Professional Profile will first be created in draft state...
```

Internal logic belongs in PRD, not on the screen.

---

## 4. Global Shell

Builder Pro global shell must stay simple.

### 4.1 Primary Navigation

The primary sidebar follows the four-domain contract:

```text
Projects
Leads
Financials
Company
```

Do not add first-level menus for:

```text
Design
Delivery
Remote Service
Service Plans
Marketplace
Customers
Studio
Workspace
Learn
Showcase
```

These capabilities must appear inside the correct business object or domain.

### 4.2 Top Bar

The top bar should contain only:

```text
current work context
global search
new/create action
notifications/messages
region or account switch
```

The Work Context label should be text-first. Do not place a large icon in front of the context name.

### 4.3 Layout Alignment

Global rail, top bar, object sidebar and content grid must align on clean vertical rules.

Recommended shell widths:

| Area | Width |
|---|---:|
| Primary icon rail | 64-76 px |
| Object sidebar | 260-300 px |
| Right inspector | 300-340 px |
| Center content | remaining width |

---

## 5. Directory Pages

Directory pages are object indexes, similar to a spreadsheet.

This applies to:

```text
/pro/projects
/pro/leads
/pro/financials?tab=...
/pro/company/members
```

### 5.1 Required Anatomy

```text
compact header
left stage/category rail with counts
right data grid
view tabs
search + filters + sort
table grid
row click -> detail
```

For `Projects` and `Leads`, the Houzz-style two-zone directory is mandatory:

| Zone | Requirement |
|---|---|
| Left rail | object categories, stages and counts; active row highlights clearly |
| Right work area | tabs, actions, filters and table records for the selected left-rail state |
| Count contract | the selected count should match the records shown after filtering |
| Navigation | clicking the module opens the directory; clicking a row opens the object detail |
| Scope | directory pages do not show detail inspector content until a row is selected |

### 5.2 Table Rules

Tables are the default scanning surface.

Required behavior:

| Rule | Requirement |
|---|---|
| Row height | 44-64 px |
| Header | sticky when vertical scrolling is used |
| Columns | object name, state, owner/client, location/source, updated, actions |
| Sort | visible sort affordance on key columns |
| Actions | row-level actions remain compact |
| Click | row opens detail; buttons must stop row navigation |
| Empty state | one line plus one action, no illustrations |

### 5.3 Directory Anti-Patterns

Do not put large recommendation cards above the table unless there is no data yet.

If a metric is important, use small pills or a narrow summary strip.

---

## 6. Detail Pages

Detail pages should follow a three-column object room.

```text
left object sidebar
center work area
right inspector
```

### 6.1 Left Object Sidebar

Purpose:

```text
object identity
object-local navigation
quick create
primary conversion/action
```

Rules:

| Element | Rule |
|---|---|
| Object title | top-left, short, no hero typography |
| Local nav | grouped, vertical, text labels |
| Quick create | icon grid, 2 columns when sidebar is wide enough |
| Primary action | pinned near bottom when important |

### 6.2 Center Work Area

Purpose:

```text
activity timeline
upcoming tasks
files
contracts
estimates
work orders
service sessions
```

Rules:

| Surface | Preferred pattern |
|---|---|
| Overview | stacked operational panels |
| Documents | spreadsheet table |
| Activity | chronological timeline |
| Tasks | checklist with owner/date |
| Design / Studio | launch surface plus current status |

### 6.3 Right Inspector

Purpose:

```text
facts, stage, owner, client, location, collaborators, readiness
```

Rules:

| Rule | Requirement |
|---|---|
| Width | stable 300-340 px |
| Sections | short title + values + optional edit action |
| Stage | visible and directly editable when safe |
| Forms | compact controls, no paragraphs |
| Scroll | inspector can scroll independently |
| Visibility | inspector can collapse when the center work area needs focus |

---

## 7. Canonical Object Screens

### 7.1 Project Detail

Project detail should look like a professional project room.

Required sections:

```text
Estimates
Takeoffs
3D Floor Plans
Upcoming
Files & Photos
Tasks & Punchlist
Budget
Contracts / Estimates / Invoices as table tabs
Project Location
Client Details
Project Chat
Collaborators
```

Project-local navigation may include:

```text
Planning: Contracts, Estimates, Takeoffs, 3D Floor Plans, Mood Boards, Selection Boards
Management: Files & Photos, Schedule, Tasks, Client Dashboard, Daily Logs, Service
Finance: Invoices, Purchase Orders, Change Orders, Retainers & Credits
```

Smart-space-specific capabilities must fit inside the project:

```text
Design package
Site survey
Installation work order
Commissioning / Studio
Acceptance evidence
Remote service
Service plan
```

Project overview ordering should prioritize creation and planning work before schedule:

```text
commercial / design creation modules
-> Upcoming
-> files, tasks, budget and collaboration panels
```

Do not make `Upcoming` the first center panel when the project still needs estimates, takeoffs, floor plans or design artifacts.

Project directory follows the same two-zone SaaS pattern as Leads:

| Area | Requirement |
|---|---|
| Left rail | project status groups and counts, including active, completed and inactive projects |
| Right work area | view tabs, actions, filters and a spreadsheet-like project table |
| Row click | opens the project detail room |
| No preview drawer | do not show a project inspector on the directory page unless a row has entered detail mode |

#### Takeoffs

`Takeoff` means measurement and quantity extraction from plan drawings.

In Builder Pro it is the bridge between drawings and commercial / delivery outputs:

```text
plan drawing
-> measured area / length / count
-> device points, cable runs, zones and labor quantities
-> estimate, procurement list, work order and installer checklist
```

Takeoff is not the same as `3D Floor Plans`:

| Surface | Primary job |
|---|---|
| 3D Floor Plans | visualize rooms, layout and design intent |
| Takeoffs | measure drawings and extract quantities for pricing / delivery |

The Takeoff workspace should use a dedicated drawing-measurement layout:

```text
page thumbnails
measurement toolbar
drawing canvas
measurements results panel
Review & Estimate action
```

### 7.2 Lead Detail

Lead detail should feel like a sales operating room.

Required sections:

```text
Lead identity
stage
activity timeline
client details
notes
tasks
files
proposal / estimate
tags
team
manager
lead details
```

`Convert to Project` must be visible whenever the lead is not lost.

Lead detail follows this canonical layout:

| Area | Requirement |
|---|---|
| Left sidebar | lead title, local tabs, quick create, Convert to Project |
| Center | task notice, new-lead message, reply composer, activity timeline |
| Right inspector | Client Details first, then Tags, Lead Stage, Team, Manager, Lead Details |
| Inspector toggle | right inspector supports show / hide without leaving the detail page |

### 7.3 Financials

Financials should feel like a commercial control room, not an accounting ERP.

Required surfaces:

```text
Overview
Estimates
Contracts
Invoices
Settlements
```

Commercial document screens should be table-first.

### 7.4 Company

Company owns:

```text
Professional Profile
Organization
Members
Credentials
Business proof
Service catalog
Public profile settings
```

Company pages may use forms and settings lists, but must stay compact.

---

## 8. Components

### 8.1 Buttons

Use a compact button hierarchy:

| Type | Usage |
|---|---|
| Primary dark / brand | create, send, convert, submit |
| Secondary outline | edit, filter, open |
| Ghost icon | utility actions |
| Destructive | archive, remove, cancel |

Buttons should be 32-40 px tall on desktop.

### 8.2 Icons

Use lucide icons where possible.

Rules:

```text
12-16 px inside dense workbench UI
18-20 px only for larger action tiles
icons support labels; they do not replace critical labels in tables
```

### 8.3 Color

Use neutral structure first.

Recommended color behavior:

```text
white / near-white surfaces
slate text
thin gray borders
one brand accent for active navigation
semantic colors only for status
```

Avoid dominant purple gradients, decorative color fields and one-note palettes.

### 8.4 Radius And Borders

Recommended:

```text
cards / panels: 8 px
buttons: 6-8 px
input fields: 6-8 px
tables: 0-8 px container radius
```

Nested cards should be avoided.

### 8.5 Modals

Modals must fit common laptop screens.

Rules:

| Modal type | Max width | Max height |
|---|---:|---:|
| Create / edit form | 560-720 px | 80vh |
| Review / approval | 720-900 px | 82vh |
| Full workflow | use page or drawer, not oversized modal | - |

Long forms should scroll inside the modal body, with the action footer fixed.

---

## 9. AI-Native Behavior

AI should be present but quiet.

Good AI patterns:

```text
inline row suggestion
next best action
draft response
generate estimate
summarize lead
check readiness
flag missing evidence
agent command palette
```

Avoid:

```text
large AI marketing banners
decorative sparkle-heavy cards
AI explanations that push work content below the fold
```

AI should shorten work, not occupy the workbench.

---

## 10. Responsive Rules

Builder Pro must be usable on:

```text
1440 x 900
1366 x 768
1280 x 720
mobile read-only / light-action mode
```

Desktop rules:

```text
first viewport must show table rows or work panels
headers must not consume more than 120 px unless there is a form workflow
detail pages may use fixed-height app layouts with independent scrolling columns
```

Mobile rules:

```text
directory tables collapse into list rows
detail three-column layout collapses into tabs or stacked sections
right inspector becomes a details tab or drawer
```

---

## 11. Review Checklist

Every Builder Pro design change must answer these questions before merge:

| Check | Pass condition |
|---|---|
| Houzz baseline | Project / Lead screens are at least as clean and operational as the Houzz-style reference |
| Four-domain fit | The feature belongs to Projects, Leads, Financials or Company |
| Object anchor | The screen is anchored by a business object or object directory |
| Table-first | Directory pages start with a scan-friendly grid/list |
| Three-column detail | Detail pages use object sidebar, center work area and right inspector where appropriate |
| Copy discipline | No long explanatory product copy in the workbench |
| Action clarity | Primary action and next best action are visible |
| Status clarity | State, owner, date or SLA are visible near the object |
| AI restraint | AI appears as useful inline assistance, not a large promo surface |
| Visual calm | Neutral surfaces, thin lines, restrained color |
| No menu sprawl | New capability is nested under the correct domain |
| Screen fit | 1366 x 768 and 1440 x 900 remain usable without awkward overflow |
| Naming hygiene | No internal implementation names or deprecated product names appear in user-facing UI |

If a change fails one check, the PR or design review must record the reason and the intended follow-up.

---

## 12. Implementation Notes

For prototype implementation:

```text
prefer lucide icons
prefer table/list layouts over card grids
prefer route-level object pages over detached feature pages
prefer compact buttons and controls
verify desktop screenshots after significant UI changes
run typecheck before handoff
```

For design reviews:

```text
review this contract first
then review the four-domain operating contract
then inspect screenshots at 1440x900 and 1366x768
then approve or request changes
```
