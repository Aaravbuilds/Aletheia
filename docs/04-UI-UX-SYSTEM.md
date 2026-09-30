docs/04-UI-UX-SYSTEM.md

# Aletheia — UI/UX Design System

## 1. Purpose

This document defines the visual language, interaction principles, layout rules, components, states, and overall experience of Aletheia.

The objective is to create an interface that feels:

- Distinctive
- Human
- Trustworthy
- Editorial
- Government-service appropriate without looking like a government portal
- Premium without looking like a generic SaaS dashboard
- Warm rather than sterile
- Modern without excessive AI aesthetics

The UI must NOT look like a generic AI-generated SaaS template.

---

# 2. Core Visual Direction

Aletheia should combine:

```text
Indian institutional warmth
        +
Editorial / magazine-like layouts
        +
Modern digital product UX
        +
Subtle tribal-inspired visual language
        +
Clean information hierarchy

The interface should feel designed rather than assembled from generic UI components.

3. Visual Personality

The desired personality is:

Warm
Grounded
Calm
Human
Precise
Trustworthy
Modern
Purposeful

Avoid making the product feel:

Corporate
Cold
Clinical
Overly governmental
Overly futuristic
Cyberpunk
Generic AI SaaS
4. Primary Color Direction

The primary visual direction should use a warm palette.

Primary

Deep Maroon

Suggested starting value:

#651F2A

This is the primary brand/action colour.

Use it for:

Primary buttons
Important navigation states
Headings where appropriate
Active states
Key visual accents

Do not flood the interface with maroon.

Background

Warm Off-White / Ivory

Suggested starting value:

#F7F3EA

The primary application background should feel warmer than pure white.

Avoid using pure white as the entire page background.

Secondary Surface

Warm Beige

Suggested starting value:

#EDE4D4

Use for:

Secondary cards
Section backgrounds
Supporting panels
Document areas
Dark Text

Suggested starting value:

#241F1B

Use for primary text.

Avoid pure black wherever possible.

Muted Text

Suggested starting value:

#746C64

Use for:

Supporting text
Metadata
Secondary descriptions
5. Status Colors

Status colours should be restrained.

Success

Use a muted green.

Purpose:

Verified
Complete
Submitted successfully
Warning

Use a warm amber.

Purpose:

Needs attention
Pending
Action required
Error

Use a muted red.

Purpose:

Validation error
Failed upload
Invalid state
Informational

Use a muted blue.

Purpose:

Informational messages
Processing
Neutral system status

Status colours should never dominate the entire interface.

6. Typography

Typography should create a strong editorial hierarchy.

Use one primary modern sans-serif family.

Recommended:

Inter

or another clean sans-serif already available in the project.

If the chosen design reference uses a distinctive serif/display font, a secondary display font may be introduced carefully.

Do not use multiple decorative fonts.

7. Typography Hierarchy
Display Heading

Used for major page introductions.

Example:

Your scholarship journey,
simplified.

Large, confident, but not oversized.

Page Heading

Used for major dashboard/page titles.

Example:

Good morning, Rahul.
Section Heading

Used for grouped information.

Example:

Scholarships for you
Card Heading

Used for scholarship/document/application titles.

Body

Readable and comfortable.

Metadata

Smaller, muted text.

Examples:

Updated 2 days ago
Application ID
Uploaded from DigiLocker
8. Layout Philosophy

The interface should use generous whitespace.

Do not fill every available space.

A screen should have:

Clear focal point
      ↓
Primary information
      ↓
Supporting information
      ↓
Action

rather than:

Cards everywhere
Charts everywhere
Buttons everywhere
9. Desktop Layout

Primary desktop layout:

┌─────────────────────────────────────────────┐
│                 Top Header                  │
├────────────┬────────────────────────────────┤
│            │                                │
│  Sidebar   │         Main Content           │
│            │                                │
│            │                                │
│            │                                │
└────────────┴────────────────────────────────┘

The sidebar should be visually quiet.

The content area should receive most visual emphasis.

10. Student Sidebar

Suggested navigation:

Aletheia

Dashboard
Scholarships
Applications
Documents
Profile

──────────────

Notifications

──────────────

Help

The active page should use a subtle maroon background/accent rather than an aggressive filled block.

11. Administrator Sidebar

Suggested navigation:

Aletheia

Overview
Applications
Review Queue
Documents
Activity

──────────────

Analytics

Optional items should only be shown if implemented.

12. Dashboard Design

The student dashboard should NOT be a typical analytics dashboard.

Its main purpose is action orientation.

Recommended structure:

Greeting
        ↓
Primary Action / Important Alert
        ↓
Scholarship Matches
        ↓
Document Readiness
        ↓
Application Status
        ↓
Recent Activity
13. Dashboard Hero

The dashboard may begin with a large editorial-style greeting.

Example:

Good morning, Rahul.

A few steps closer to
your next opportunity.

Supporting text:

You have 3 potential scholarship matches
and 2 documents left to complete your profile.

Primary action:

Explore Matches

This should feel personal without becoming childish.

14. Scholarship Cards

Scholarship cards should communicate information quickly.

Recommended structure:

┌──────────────────────────────────┐
│ Scholarship Type                 │
│                                  │
│ Scholarship Name                 │
│                                  │
│ Short description                │
│                                  │
│ ✓ ST eligible                    │
│ ✓ Income condition               │
│                                  │
│ Documents     5 / 7 ready        │
│                                  │
│ View Scholarship →               │
└──────────────────────────────────┘

Do not overload cards with every eligibility rule.

15. Match Indicator

Instead of large AI-looking percentages, use understandable language.

Preferred:

Potential Match
Action Required
Likely Match
Not Currently Matching

Avoid:

AI SCORE: 94.7%

unless there is a genuine reason to show a score.

16. Scholarship Detail Page

Recommended hierarchy:

Back

Scholarship Name
Short description

Why this may match you

Eligibility
────────────────────

Required documents
────────────────────

Document readiness
────────────────────

Application information

[Start Application]

The student's personalized information should be visually separated from official/general scheme information.

17. Document Wallet Design

The document wallet should feel like a physical organized collection rather than a file manager.

Possible visual direction:

DOCUMENT WALLET

7 documents
2 need attention

Identity
┌───────────────┐
│ ST Certificate│
│ ✓ Verified    │
└───────────────┘

Education
┌───────────────┐
│ Marksheet     │
│ ✓ Available   │
└───────────────┘

Document cards should contain:

Document icon/type
Document name
Status
Source
Date
Relevant action
18. Document Sources

Show source clearly.

Examples:

Uploaded
DigiLocker
Imported

Do not make DigiLocker appear integrated if the prototype is only simulating the connector.

Use:

Demo connection

or an equivalent clear indication where appropriate.

19. Document Readiness Visualization

Use a simple visual indicator.

Example:

DOCUMENT READINESS

6 / 8 READY

██████████████░░░░

or a circular indicator if it fits the visual language.

The exact number must remain visible.

20. Application Wizard

The application wizard should have a strong progress indicator.

Example:

01 Personal
──────
02 Education
──────
03 Household
──────
04 Documents
──────
05 Review
──────
06 Submit

The current step should be obvious.

Completed steps should be visually distinct.

21. Application Review

The review page should feel like a final verification screen.

Use sections:

Personal
Education
Household
Documents
Eligibility
Declaration

Each section should have:

[Edit]

where applicable.

22. Application Tracking

The tracking timeline should be one of the visually strongest components.

Example:

✓ Application Submitted

      │

✓ Document Verification

      │

● Institute Verification
  Current stage

      │

○ Ministry Review

      │

○ Final Decision

The current stage should be visually dominant.

23. Administrator Dashboard

The administrator dashboard can be more operational than the student dashboard.

Recommended hierarchy:

Overview
        ↓
Applications requiring attention
        ↓
Application statistics
        ↓
Recent activity

Do not turn it into a wall of charts.

24. Admin Application Queue

The application queue should prioritize scanning speed.

Desktop:

Application ID | Student | Scheme | Status | Review | Action

Mobile/tablet:

Use stacked cards.

25. Admin Review Page

This is one of the most important screens.

Recommended structure:

Application Header
        ↓
Student Overview
        ↓
Eligibility Summary
        ↓
Documents
        ↓
AI Pre-Scrutiny
        ↓
Activity Timeline
        ↓
Review Actions

The reviewer should not need to jump between many pages.

26. AI Findings UI

AI findings must be visually distinct but not intimidating.

Example:

AI-ASSISTED REVIEW

✓ Required documents detected
✓ Income information found
⚠ Potential name variation

Manual verification recommended.

Avoid:

AI DECISION
REJECT

AI is assistive.

27. Deficiency UI

Deficiency requests should be visually clear.

Example:

ACTION REQUIRED

Income Certificate

The submitted certificate does not contain
the required financial year.

Please upload an updated certificate.

[Upload Replacement]

The student should immediately understand:

What is wrong?
What is needed?
What should they do?
28. Buttons

Use three primary levels.

Primary

Filled maroon.

Used for the most important action.

Example:

Start Application
Submit Application
Upload Document
Secondary

Outlined or subtle surface.

Used for supporting actions.

Example:

View Details
Edit
Review
Tertiary

Text button.

Used for low-priority actions.

Example:

View all →
29. Button Rules

Avoid multiple competing primary buttons.

A screen should generally have:

1 primary action

and several secondary actions if necessary.

30. Cards

Cards should be used intentionally.

Use cards for:

Scholarships
Documents
Applications
Important alerts

Do not put every text block inside a card.

31. Border Radius

Use moderate rounding.

Avoid extremely rounded "pill everything" design.

Buttons may have moderate rounding.

Cards should have subtle rounding.

32. Shadows

Use very subtle shadows.

Prefer:

Border
Surface contrast
Whitespace

over large floating shadows.

33. Icons

Use one consistent icon system.

Recommended:

Lucide

Icons should support meaning rather than act as decoration.

Do not use emoji as primary UI icons.

34. Decorative Visual Language

Aletheia may use subtle motifs inspired by:

Textile patterns
Geometric Indian craft patterns
Hand-drawn lines
Earth/land forms
Archival paper textures

These must remain subtle.

Do not directly copy cultural artwork.

Do not turn the interface into a stereotypical "tribal" theme.

35. Imagery

Photography may be used selectively.

If using imagery:

Prefer authentic documentary-style imagery.
Avoid generic corporate stock photography.
Avoid AI-generated people as decorative filler.
Avoid placing people in every section.

The product should not depend on photography to look good.

36. Motion

Animations should be subtle.

Use motion for:

Page transitions
Progress changes
Upload processing
Status changes
Modal appearance
Success confirmation

Avoid:

Excessive parallax
Floating animations everywhere
Long page transitions
Decorative animation on every card
37. Loading States

Use skeletons or compact loading indicators.

Example:

Loading scholarships...

For AI processing:

Analyzing document...

Identifying document type
Extracting information
Checking consistency

The AI processing experience may be visually interesting but must remain quick.

38. Empty States

Every important empty state should explain the next action.

Bad:

No documents.

Good:

Your document wallet is empty.

Add your important documents once
and reuse them across applications.

[Add Document]
39. Error States

Errors should be calm and actionable.

Bad:

ERROR 500

Better:

We couldn't upload this document.

Please check the file format and try again.

[Try Again]
40. Forms

Forms should:

Group related fields.
Use clear labels.
Avoid placeholder-only labels.
Show validation close to the affected field.
Preserve entered information.
Avoid unnecessary fields.
41. Form Validation

Use immediate validation where useful.

Example:

Family income
₹4,20,000

✓ Valid amount

For errors:

Please enter your annual family income.

Avoid vague:

Invalid input.
42. Accessibility

The UI should aim for accessible interaction.

Requirements:

Good text contrast
Keyboard-friendly controls
Visible focus states
Clear labels
Descriptive button text
Status should not rely on colour alone
Form errors should be readable
43. Responsive Behavior

Desktop is the primary demonstration layout.

On smaller screens:

Sidebar becomes mobile navigation.
Tables become cards or horizontal scroll where necessary.
Multi-column layouts stack.
Document cards become single-column.
Application wizard remains easy to navigate.
44. Visual Hierarchy Rule

Every screen should have:

ONE dominant element
ONE primary action
CLEAR supporting information

Do not make everything visually loud.

45. Anti-Generic Rules

The implementation MUST NOT look like:

Generic Vercel dashboard
Generic Tailwind template
Generic AI startup landing page
Excessive glassmorphism
Purple-blue AI gradient
Huge glowing buttons
Random floating blobs
Excessive rounded cards
Dashboard with 15 statistics
AI robot illustrations
46. Design Reference Rule

When visual references are provided by the project owner, use them as inspiration for:

Layout
Composition
Spacing
Typography hierarchy
Component treatment
Visual rhythm

Do not copy another website exactly.

Combine references into a coherent Aletheia design language.

47. Design Consistency

All screens must share:

Same spacing system
Same typography
Same button hierarchy
Same card treatment
Same icon style
Same status language
Same colour system
Same interaction patterns

Do not design each screen independently.

48. Final Visual Principle

Aletheia should look like a carefully designed digital public-service product.

It should communicate:

"This is a serious system built for real people."

It should NOT communicate:

"This is an AI-generated hackathon dashboard."

That distinction is a primary design requirement.