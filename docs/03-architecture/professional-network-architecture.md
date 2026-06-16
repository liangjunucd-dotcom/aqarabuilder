# Builder Professional Network Architecture

> Version: v0.2
> Status: planning baseline
> Scope: Builder frontstage to Builder Pro onboarding, Professional Profile, Pro work contexts, Aqara Space / service organization entry, service delivery architecture
> Core principle: **one Aqara account, progressive professional identity, multiple service contexts.**

Builder Pro primary navigation must follow the four-domain operating contract in [`../01-product/builder-pro-menu-closed-loop-review.md`](../01-product/builder-pro-menu-closed-loop-review.md).

---

## 0. Why This Document Exists

Aqara Builder should not feel like two disconnected products:

- a consumer frontstage for inspiration, DIY and AI-assisted creation
- a professional backend for certified service delivery

The system must let a user grow naturally from ordinary usage into professional service work without creating a second account or losing their existing work, profile, content and reputation.

This document defines the architecture for that growth path.

---

## 1. Responsibility Pyramid

The product strategy is a three-layer pyramid:

```text
          Do it Professional
      certified people / teams take responsibility

              Do it AI
      AI lowers the skill and delivery cost

            Do it Yourself
      users explore, apply, tweak and learn
```

These are not three isolated user groups. They are three responsibility modes:

| Mode | Who carries responsibility | Typical surface | Typical outcome |
|---|---|---|---|
| Do it Yourself | End user | Builder frontstage, Aqara Life, Marketplace | self-applied design, light automation, personal Life Dashboard |
| Do it AI | User or Pro with AI assistance | Builder Design Platform, Build Agent, AI diagnostics | faster draft, option generation, proposal support, guided troubleshooting |
| Do it Professional | Professional person or organization | Builder Pro, Project Passport, Remote Service Console | design service, delivery service, remote service, service plans |

The strategic loop:

```text
DIY creates interest
-> AI lowers the barrier
-> Professional takes responsibility for complex work
-> delivered customer returns to daily use
-> new needs appear
```

Important rule: **Do it AI is a capability layer, not a separate identity.** It supports both self-service users and professionals.

---

## 2. Product Surfaces and Boundaries

| Surface | Primary audience | Core job | Explicitly not |
|---|---|---|---|
| Builder frontstage | Visitor, User, Pro as public persona | inspiration, DIY, AI-assisted creation, Marketplace, Find Pros, Professional Profile | project delivery control room |
| Pro introduction site | User considering professional upgrade | explain Pro, show paths, activate Professional Profile | professional operating console |
| Builder Pro | individual Pro, team, Aqara Space / service organization members | four business domains: Projects, Leads, Financials, Company; nested design, work order, Studio, remote service and service plan operations | consumer daily experience layer |
| Builder Design Platform | User and Pro creators | space design, Life Dashboard creation, automation, plugins, deployment packages | customer master data, contracts, ledger |
| Aqara Life | customer and household members | daily use, authorization, service status, acceptance, renewal | professional design or remote service console |
| Aqara Studio | local runtime | local spatial OS, devices, automation runtime, logs | business project system |

### 2.1 Naming Rules

- `Aqara Builder` = the whole platform.
- `Builder frontstage` = the user-facing web experience.
- `Builder Pro` = professional workbench.
- `Builder Design Platform` = creation and design surface.
- `Aqara Studio` = local runtime / M300 / spatial OS only.

Do not use product names that make the design tool look like a separate brand from Aqara Builder.

---

## 3. Account, Profile and Professional Upgrade

### 3.1 One Account, Progressive Identity

```text
Aqara Account
-> User Profile
-> optional Professional Profile
-> optional Certifications / Badges
-> optional Organization Memberships
```

The user does not create a new Pro account. They activate a Professional Profile on the same Aqara account.

### 3.2 Frontstage Profile Structure

The frontstage profile should show both ordinary and professional assets.

```text
User Profile
├─ ordinary identity
│  ├─ my designs
│  ├─ ideabooks
│  ├─ community posts
│  └─ personal studios / spaces, when appropriate
│
└─ Professional Profile, if activated
   ├─ professional headline
   ├─ service capabilities
   ├─ badges / certifications
   ├─ service markets and languages
   ├─ portfolio / showcase
   ├─ public availability
   └─ organization affiliations
```

Professional Profile should be reachable from the user's ordinary Profile, because it becomes the user's public trust asset after activation. It should not appear as a separate Pro item in the ordinary user's frontstage sidebar before activation. The smooth entry is:

```text
Builder frontstage
-> User Profile
-> Convert to Professional
-> Builder Pro onboarding
```

### 3.3 Progressive Onboarding

Pro onboarding should not be a hard wall. It should feel like a guided upgrade from an existing user account, similar to DingTalk-style scenario initialization and Houzz Pro-style project onboarding.

```text
1. Welcome to Builder Pro
   -> ask why the user wants to use Pro

2. Choose entry mode
   -> team collaboration / Aqara Space or service organization / personal use

3. Resolve work context
   -> for team or organization: create organization/team, or join by invite
   -> for personal use: introduce yourself and activate a personal Professional Profile

4. Ask signing-up reason
   -> Client projects / Personal projects

5. Ask project context
   -> What are you working on?
      My own home / Residential buildings / Something else
   -> How will you complete it?
      Hire a professional / Do it myself

6. Ask acquisition source
   -> Aqara Life / Marketplace / Aqara Space / referral / search / other

7. Ask whether setup help is wanted
   -> optional phone or email for one-on-one onboarding

8. Confirm
   -> activate Professional Profile as draft
   -> create Personal Pro Context
   -> optionally create or join Team / Aqara Space / Service Org Context
   -> enter Builder Pro
```

Service path options can still be inferred from the answers and refined later:

| Path | Meaning |
|---|---|
| Individual Designer | remote or local space design, proposal, Life Dashboard creation |
| Individual Installer | site survey, installation, onboarding, point mapping, acceptance evidence |
| Remote Service Pro | authorized remote diagnostics, tuning, service reports |
| Developer | plugins, drivers, integrations, dashboard components |
| Team Member / Team Owner | small service team or studio |
| Aqara Space / Service Organization Member | member of an existing certified local organization |
| Not sure yet | enter Pro in trial / private mode |

Trust layer is requested only when an action needs it:

| Action | Required trust |
|---|---|
| enter Pro privately | basic account |
| publish Professional Profile | profile basics, service region |
| receive leads | service capability, contact, policy agreement |
| install at customer site | installer badge / certification |
| represent an organization | organization membership |
| represent Aqara Space / service organization | verified organization membership |
| receive settlement / revenue | billing and compliance profile |

---

## 4. Organizations and Aqara Space Entry

### 4.1 People Enter First, Organizations Bind Later

Existing Aqara Space stores and service providers enter through people, not shared store accounts.

```text
personal Aqara Account
-> Professional Profile
-> Organization Membership
-> Organization Profile
-> Aqara Space / Authorized Service Partner badge, if certified
```

This prevents shared passwords and preserves personal reputation, badges and work history.

### 4.2 Organization Types

| Organization type | Meaning | Managed in Builder? |
|---|---|---|
| Team | small professional collaboration group | yes |
| Service Company | authorized service organization | yes, only service-network scope |
| Aqara Space | certified local store / service node | yes, only Builder service scope |
| Regional Partner / Operator | regional governance / distribution actor | limited, mostly outside Builder |
| Enterprise Customer | commercial owner of multiple sites | yes, if using Site / service workflows |

Builder does not become store ERP.

Builder manages for Aqara Space / service organizations:

- organization public profile
- certification badge and service region
- members and Builder Pro roles
- service capabilities
- lead and project assignment
- project responsibility
- service quality
- customer authorization and service sessions
- portfolio / showcase attribution

Builder does not manage:

- retail POS
- inventory ERP
- staff attendance
- store decoration
- rent and offline operations
- full internal finance
- channel contract details

### 4.3 Owner and Employee Entry

Owner / boss entry:

```text
1. receives official invite or opens Pro organization claim
2. logs in with personal Aqara account
3. activates Professional Profile
4. claims or registers organization
5. Aqara verifies organization identity
6. user becomes Organization Owner / Admin
7. invites employees
```

Employee entry:

```text
1. logs in with personal Aqara account
2. activates Professional Profile
3. accepts organization invitation or applies to join
4. organization admin approves
5. employee receives organization role and work context access
```

### 4.4 Personal Capability vs Organization Role

Keep two layers separate:

| Layer | Belongs to | Examples |
|---|---|---|
| Personal capability | the person | Designer Badge, Installer Badge, Remote Service Badge, portfolio, reviews |
| Organization role | the organization membership | Owner, Admin, Store Manager, Project Manager, Designer, Installer, Remote Operator, Sales, Finance Viewer |

Example public identity:

```text
Wang Lei
Installer Badge
Member of Aqara Space Shanghai Xuhui
```

The person remains a person. The organization becomes the commercial and local trust context when the person acts on its behalf.

---

## 5. Builder Pro Work Contexts

Builder Pro should use a work context switcher, not account switching.

```text
[Personal · Jun] v       Projects  Leads  Financials  Profile

Personal
- Jun Personal                      Pro · Individual

Teams
- Liang Design Studio               Team · Owner

Aqara Space / Service Organizations
- Aqara Space Shanghai Xuhui        Aqara Space · Admin
- Dubai Authorized Service Hub      Service Partner · Member
```

| Context | Commercial owner | Main use |
|---|---|---|
| Personal | individual Pro | personal drafts, remote services, individual projects |
| Team | team organization | shared leads, member assignment, shared assets |
| Aqara Space / Service Organization | certified organization | local trust, project responsibility, lead assignment, delivery and service operations |
| Enterprise | enterprise organization | multi-site service requests and operations |

Context determines:

- visible leads
- visible projects
- project commercial owner
- credits / plan
- members
- ledger scope
- service plans
- portfolio attribution

---

## 6. Project Responsibility Model

Every formal commercial service should have a Project Passport.

```text
Lead
-> Requirement Brief
-> Project Passport
-> Design Package
-> Delivery Package
-> Runtime / Remote Service
-> Acceptance / Ledger / Portfolio
```

Project role assignment:

| Project role | Meaning |
|---|---|
| Commercial Owner | who owns the commercial responsibility: individual Pro, team, Aqara Space, service organization |
| Project Manager | who drives timeline, communication and milestones |
| Designer | who owns the design package |
| Installer | who owns site implementation and evidence |
| Remote Operator | who handles authorized remote service |
| Supplier / Store | optional local supply or trust node |
| Customer | project owner from customer side |

Example:

```text
Commercial Owner = Aqara Space Shanghai Xuhui
Designer = employee A or external individual designer
Installer = employee B or external installer
Remote Operator = service organization support staff
Customer = homeowner
```

This supports individual Pro, teams, stores and mixed collaboration without turning Builder into store ERP.

---

## 7. Design, Delivery and Service Objects

### 7.1 Space Design

Space Design is a design service asset. It is not equal to the commercial project itself.

| In frontstage | In Builder Pro |
|---|---|
| Design Work | Design Package inside Project Passport |
| personal / exploratory | commercial responsibility and versioning |
| can remain draft | can be frozen for delivery |
| can be upgraded | requires change order after confirmation |

Design confirmation is a commercial event, not a specific app action.

Valid confirmation sources:

- electronic contract
- quote approval
- confirmation link
- offline signature recorded by Pro
- Life App preview confirmation, optional

State:

```text
draft
-> proposal_sent
-> design_confirmed
```

`design_confirmed` means:

- selected design version is frozen
- quote scope and main device list are confirmed
- implementation may proceed
- later scope changes require a change order

### 7.2 Life Dashboard

Life Dashboard is only the customer daily experience layer.

It covers:

- household member / Persona views
- Aqara Life home layout
- common scenes
- visibility and permissions
- daily control and experience

It is not:

- the Pro remote service console
- the service plan system
- the professional diagnostic surface
- the commercial service contract

Builder Pro can create or tune a Life Dashboard for a customer, but the dashboard itself remains customer experience UI.

### 7.3 Remote Service Console

Remote Service Console is the professional interface for authorized service work.

It covers:

- customer authorization windows
- Studio health
- device status
- automation logs
- alerts
- diagnostics
- remote tuning
- service sessions
- service reports
- audit trail

Remote Service Console is used by Builder Pro, not by household members.

### 7.4 Service Plans

Service Plan is the ongoing commercial service object.

Examples:

- security monitoring support
- elder-care reminder tuning
- energy optimization
- rental / hospitality remote management
- quarterly inspection
- automation tuning subscription

Service Plan defines:

- scope
- duration
- price
- SLA
- renewal
- authorization policy
- responsible Pro / organization
- included service sessions
- customer-visible service status

Service Plans may use Remote Service Console for operations and may produce updates to Life Dashboard, but they are independent objects.

#### 7.4.1 What a Service Plan Is

`ServicePlan` turns post-delivery support from an informal promise into a managed business object.

```text
ServicePlan
-> ServiceScope
-> Covered Spaces / Studios / Devices / Personas
-> Authorization Policy
-> SLA
-> Included Service Sessions
-> Renewal / Cancellation
-> Ledger / Revenue Attribution
-> Customer-visible Service Status
```

It can be created:

- as part of a new Project quote
- after delivery as a renewal / upgrade
- from a remote service request
- from an Aqara Life customer request
- from an Aqara Space / service organization package
- from a Marketplace service package

#### 7.4.2 Service Plan Types

| Type | Core value | Typical scope |
|---|---|---|
| Care Plan | proactive care and reminders | elder-care reminders, child routines, emergency notification tuning |
| Security Plan | security readiness and incident support | alarm logic, camera / sensor health, away-mode tuning |
| Energy Plan | energy optimization | HVAC, lighting, occupancy, schedules, monthly report |
| Rental / Hospitality Plan | remote operation for non-owner spaces | guest mode, lock / scene templates, issue response |
| Maintenance Plan | periodic health check | quarterly inspection, firmware review, automation cleanup |
| Optimization Plan | continuous improvement | scene refinement, Life Dashboard tuning, new needs intake |
| Developer / Integration Plan | technical integration support | driver updates, plugin maintenance, third-party system compatibility |

#### 7.4.3 Marketplace Service Packages

Marketplace should contain both plugins and service packages.

| Marketplace item | What buyer gets | Pricing | Fulfillment |
|---|---|---|---|
| Plugin | digital capability package, component, driver or automation asset | free or paid in Credits | install / apply / deploy after entitlement check |
| Service Package | service scope, provider promise, SLA and authorized work path | free, paid in Credits, bundled, or quoted | converted into ServicePlan after purchase / acceptance |

Most plugins can be free because they grow ecosystem usage. Developers may price advanced plugins in Credits.

Service packages can follow the same Credits principle, but they need additional constraints:

- service region
- service language
- provider type: individual Pro / Team / Aqara Space / service organization
- remote vs local delivery
- included sessions or hours
- SLA
- authorization policy
- renewal / cancellation rules
- whether price is fixed or requires quote

Service Package lifecycle:

```text
MarketplaceServicePackage
-> customer selects / Pro attaches to quote
-> entitlement or quote is created
-> ServicePlan is instantiated
-> OperatorGrant / ServiceSession fulfill the service
-> report / renewal / ledger attribution
```

Pricing patterns:

| Pattern | Best for | Example |
|---|---|---|
| Free | ecosystem growth, entry diagnostics, partner promo | free first health scan |
| Fixed Credits | standardized remote service | 200 Credits monthly automation check |
| Subscription Credits | recurring support | 500 Credits / month security support |
| Quote required | local labor, complex project, region-dependent work | villa quarterly maintenance |
| Bundled | included in device sale, project quote or Aqara Space promotion | 3-month post-delivery optimization |

Important distinction:

- `MarketplaceServicePackage` is the sellable listing.
- `ServicePlan` is the customer-specific contract / subscription instance.
- `ServiceSession` is one actual service action under that plan.

#### 7.4.4 Lifecycle

```text
draft
-> proposed
-> active
-> paused
-> renewal_due
-> renewed / cancelled / expired
```

| State | Meaning |
|---|---|
| draft | Pro is composing scope and price |
| proposed | customer can review and accept |
| active | service is valid and can create authorized service sessions |
| paused | service temporarily stopped, usually because payment, authorization or dispute is pending |
| renewal_due | service is close to expiration |
| renewed | new term starts with versioned scope |
| cancelled | ended by customer or provider |
| expired | term ended without renewal |

Scope changes should create a new ServicePlan version, not silently rewrite history.

#### 7.4.5 Authorization Policy

A Service Plan does not mean the Pro has permanent unrestricted access.

It defines default authorization rules:

| Policy | Meaning | Example |
|---|---|---|
| customer_approved_each_time | customer approves every service window | high-privacy homes |
| scheduled_window | pre-agreed recurring windows | quarterly inspection |
| alert_triggered_window | access can be requested or opened when an alert occurs | security or care plans |
| read_only_monitoring | Pro can see health summaries but cannot change config | entry maintenance tier |
| managed_operation | broader permission for commercial spaces | rental / hospitality plans |

Every actual access still creates an `OperatorGrant` and `ServiceSession` with scope, actor, timestamp and audit trail.

#### 7.4.6 Data Model Sketch

```ts
interface ServicePlan {
  id: string;
  customerId: string;
  projectId?: string;
  commercialOwner: {
    type: 'individual_pro' | 'team' | 'aqara_space' | 'service_org';
    id: string;
  };
  responsibleOperators: Array<{
    accountId: string;
    role: 'remote_operator' | 'designer' | 'installer' | 'project_manager';
  }>;
  type: 'care' | 'security' | 'energy' | 'rental' | 'maintenance' | 'optimization' | 'integration';
  status: 'draft' | 'proposed' | 'active' | 'paused' | 'renewal_due' | 'renewed' | 'cancelled' | 'expired';
  coveredAssets: {
    spaceIds: string[];
    studioIds: string[];
    deviceIds?: string[];
    personaIds?: string[];
  };
  scope: {
    includedSessions: number;
    responseSlaHours?: number;
    reportCadence?: 'monthly' | 'quarterly' | 'on_demand';
    coveredTasks: string[];
    excludedTasks: string[];
  };
  authorizationPolicy: {
    mode: 'customer_approved_each_time' | 'scheduled_window' | 'alert_triggered_window' | 'read_only_monitoring' | 'managed_operation';
    defaultScopes: string[];
    maxWindowHours?: number;
  };
  billing: {
    priceModel: 'one_time' | 'monthly' | 'quarterly' | 'annual';
    amount: number;
    currency: string;
    renewalAt?: string;
  };
  version: number;
  createdAt: string;
  updatedAt: string;
}
```

#### 7.4.7 Relationship to Other Objects

| Object | Relationship |
|---|---|
| Project Passport | Service Plan can be quoted with the original project or added after delivery |
| Marketplace | Service Package listing can instantiate a ServicePlan after purchase, quote acceptance or entitlement grant |
| Studio / Space | Service Plan declares which customer assets are covered |
| Remote Service Console | operational surface used to fulfill service sessions |
| OperatorGrant | concrete authorization window generated under the plan |
| ServiceSession | actual work record under the plan |
| Life Dashboard | may be updated by service work, but remains customer daily experience UI |
| Aqara Life | shows service status, authorization request, renewal, cancellation and reports |
| Ledger | records price, renewal, payment, revenue attribution and settlement evidence |

#### 7.4.8 Customer Experience

In Aqara Life, the customer should see Service Plans as simple service cards:

```text
Security Care
Active until 2026-12-31
Provider: Aqara Space Shanghai Xuhui
Coverage: Home Studio + 18 sensors
Next report: July
[Authorize service] [View report] [Renew] [Cancel]
```

Customer-facing actions:

- view plan scope
- approve or deny service windows
- see access history
- view service reports
- renew, upgrade or cancel
- request one-off help

The customer should not see the full Remote Service Console.

---

## 8. Builder Pro Module Architecture

Recommended Builder Pro modules:

| Module | Primary object | Role |
|---|---|---|
| Home | Work Context / Task / Metric | daily operating summary |
| Leads | Lead / Attribution | demand intake and response |
| Projects | Project Passport | commercial project control room |
| Design | Design Package | space design, Life Dashboard creation, automation and package generation |
| Delivery | Delivery Package | scheduling, installer handoff, deployment, site evidence, acceptance prep |
| Remote Service | OperatorGrant / ServiceSession | authorized remote diagnostics and tuning |
| Service Plans | ServicePlan | ongoing service scope, SLA, renewal and responsibility |
| Studios / Spaces | Customer Space / StudioInstance | runtime assets, access status and health |
| Ledger | Quote / PaymentRecord / Settlement | quote, collection, service item and revenue evidence |
| Portfolio | Showcase / Attribution | publish sanitized case studies and reusable assets |
| Profile / Organization | Professional Profile / Organization Profile / Member | trust, service capability and membership management |

Design principle:

```text
Builder frontstage: discover, try, publish, find
Builder Pro: operate, deliver, service, account for responsibility
Design Platform: create and package
Aqara Studio: run locally
Aqara Life: customer daily use and authorization
```

---

## 9. Smooth Onboarding Paths

### 9.1 From Design Work to Pro

```text
User creates Space Design
-> saves Design Work
-> sees "Use this as a professional project"
-> activates Professional Profile
-> chooses Personal / Team / Organization context
-> Project Passport is created from Design Work
```

### 9.2 From Content to Pro

```text
User publishes showcase / project recap
-> sees "Add to Professional Portfolio"
-> activates Professional Profile
-> marks services offered
-> can become visible in Find Pros after trust checks
```

### 9.3 From Existing Aqara Space / Service Provider

```text
official invite
-> owner logs in
-> claims organization
-> Aqara verifies
-> organization context appears in Builder Pro
-> owner invites staff
-> staff activate Professional Profile
-> organization receives leads and projects
```

### 9.4 From Customer Need to Professional Help

```text
Customer uses Builder frontstage / Aqara Life
-> submits request
-> platform classifies Remote Expert vs Local Delivery
-> lead is routed to individual Pro / team / Aqara Space
-> accepted lead becomes Project Passport when commercial responsibility begins
```

---

## 10. Non-negotiable Principles

1. Do not create separate Pro accounts. Upgrade the same Aqara account with a Professional Profile.
2. Do not force full certification before letting users try Pro. Ask for trust only at trust-sensitive actions.
3. Do not make Life Dashboard the remote service interface. It is customer daily experience only.
4. Do not make Aqara Space a store ERP inside Builder. Builder only manages service-network scope.
5. Do not treat Aqara Space / service organization employees as shared store accounts. Every worker has a personal account and membership.
6. Do not confuse organization role with personal capability. Badges follow the person; commercial responsibility can belong to an organization.
7. Do not convert every draft into a Project Passport. Only commercial responsibility, quote, authorization, delivery or acceptance should create one.
8. Do not bind design confirmation to Life App. It is a commercial confirmation event and can come from multiple channels.
9. Do not call the design tool a separate product brand. Keep it inside Aqara Builder as Builder Design Platform.
10. Do not let Remote Service bypass customer authorization windows, scopes and audit.
