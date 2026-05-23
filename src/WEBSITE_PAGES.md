# Check My Claim - Website Pages Documentation

## Table of Contents
1. [Home Page](#home-page)
2. [Survey Page](#survey-page)
3. [Submitted Page](#submitted-page)
4. [Thanks Page](#thanks-page)
5. [Sorry Page](#sorry-page)
6. [Privacy Policy Page](#privacy-policy-page)
7. [Terms of Service Page](#terms-of-service-page)
8. [Advertising Disclosure Page](#advertising-disclosure-page)
9. [Partner List Page](#partner-list-page)
10. [SB-37 List Page](#sb-37-list-page)
11. [Blog Page](#blog-page)

---

## Home Page
**Route:** `/`
**File:** `pages/Home.jsx`

### Description
Landing page for Check My Claim featuring the main value proposition and multiple content sections.

### Sections
- Navbar navigation
- Hero section with main CTA
- Trust banner with key stats
- Customer reviews
- Accident types explanation
- Who benefits information
- Customer transformation stories
- How it works explanation
- Unique selling points (USP)
- Fighting for you section
- No win, no fee guarantee
- Recent wins/settlements
- About us section
- FAQ section
- Footer

### Key Features
- Full-width white background
- Component-based architecture
- Multiple visual sections with different designs
- Trust-building elements throughout
- Call-to-action buttons

---

## Survey Page
**Route:** `/Survey`
**File:** `pages/Survey.jsx`

### Description
The main survey/quiz page where users answer questions about their accident to get a claim estimate.

### Design
- Dark blue gradient background with subtle pattern overlay
- White rounded card containing the quiz
- Sticky call banner at the top

### Content Sections
1. **Call Banner** - Phone number CTA
2. **Quiz Section** - Main white card with:
   - Introductory text
   - "How Were You Injured?" question
   - 4 answer buttons for accident types:
     - Auto/Motorcycle Accident
     - Commercial/Semi Accident
     - Passenger/Rideshare/Pedestrian Accident
     - At Work/Other/I Wasn't Injured

3. **Survey Process** - Explains the steps
4. **Fighting For You** - Trust building content
5. **Recent Wins** - Settlement examples
6. **Guarantee Section** - No win, no fee guarantee
7. **Testimonials** - Customer quotes
8. **FAQ** - Common questions
9. **Footer** - Legal disclaimers and links

### Color Scheme
- Primary Blue: #0285E9
- Dark Background: #0C2D5B
- Text: White/Light gray

---

## Submitted Page
**Route:** `/Submitted`
**File:** `pages/Submitted.jsx`

### Description
Confirmation page shown after user submits quiz answers (disqualified case - high value claim).

### Design
- Dark gradient background
- White rounded card with animations
- Custom header with logo and phone CTA

### Main Content
- Animated success icon (blue circle with checkmark)
- "Congrats! We will be CALLING YOU" heading with green accent
- "HIGH VALUE CLAIM" indicator
- "Please Make Sure To Answer your Phone!" alert
- Next steps timeline (4 steps)
- "Don't Wanna Wait" CTA with phone button
- No Win, No Fee guarantee
- Return to home button

### Key Animations
- Smooth fade-in animations on page load
- Staggered animations for timeline items
- Scale animations on icons

---

## Thanks Page
**Route:** `/Thanks`
**File:** `pages/Thanks.jsx`

### Description
Confirmation/thank you page shown after user successfully submits their information.

### Design
- Dark gradient background (same as Submitted)
- White rounded card
- Same header as Submitted page

### Content
- Animated success icon (blue circle with checkmark)
- "Thank You!" heading
- "We Have Received Your Details!" message
- Phone confirmation message
- "Please Make Sure To Answer your Phone!" alert
- "Don't Wanna Wait" CTA section
- No Win, No Fee guarantee
- Back to home button
- Footer note about security

### Tone
- Professional yet reassuring
- Clear next steps
- Multiple CTAs for immediate contact

---

## Sorry Page
**Route:** `/Sorry`
**File:** `pages/Sorry.jsx`

### Description
Page shown when user is disqualified based on their quiz answers.

### Design
- Dark gradient background
- White rounded card
- Same header structure

### Content
- Animated error icon (gray circle with X)
- "Sorry!" heading
- "Based on your answers, We Are Unable To Help!" message
- Explanation text
- Return to home button
- Privacy message with logo
- Footer note

### Tone
- Empathetic but clear
- Suggests exploring other resources
- Maintains professionalism

---

## Privacy Policy Page
**Route:** `/PrivacyPolicy`
**File:** `pages/PrivacyPolicy.jsx`

### Description
Legal privacy policy document for Check My Claim.

### Design
- Dark background
- White rounded card container with scroll
- Sticky header with icon and title
- Scrollable content area
- Sticky footer with back button

### Main Sections
1. Information We Collect
   - Contact information
   - Personal information (accident/injury details)
   - Other information from forms

2. How We Use Your Information
   - Respond to inquiries
   - Provide information about services
   - Improve website and services
   - Comply with legal requirements

3. How We Share Your Information
   - Service providers
   - Legal requirements compliance

4. Your Rights
   - Access to personal information
   - Correction of errors
   - Object to processing
   - Delete personal information
   - Restrict processing
   - Withdraw consent

5. Security Measures
6. Third-Party Website Links
7. Policy Changes
8. California Privacy Rights (CCPA)
9. Contact Information

### Features
- No Win, No Fee guarantee card
- Responsive design
- Smooth scrolling
- Back to home navigation

---

## Terms of Service Page
**Route:** `/TermsOfService`
**File:** `pages/TermsOfService.jsx`

### Description
Legal terms and conditions for Check My Claim website usage.

### Design
- Same layout as Privacy Policy
- Dark background with white card
- Sticky header and footer

### Main Sections
1. User Responsibilities
   - Eligibility (18+ years old)
   - Account registration requirements
   - Compliance with laws

2. Intellectual Property
   - Website ownership
   - Limited license grant
   - Usage restrictions

3. Privacy and Data Sharing
   - Privacy policy reference
   - Data sharing with third parties (Twilio, mobile operators)
   - Fraud protection measures

4. Disclaimers and Limitations
   - No legal advice disclaimer
   - No guarantee of results
   - Limitation of liability

5. Termination of Access
6. Communications Consent
   - Opt-in agreement for calls/texts
   - Contact info sharing for verification
   - Do Not Contact list exception

7. Severability
8. Governing Law and Jurisdiction
9. Changes to Terms
10. Contact Information

### Features
- No Win, No Fee guarantee card
- Legal text formatting
- Easy navigation

---

## Advertising Disclosure Page
**Route:** `/AdvertisingDisclosure`
**File:** `pages/AdvertisingDisclosure.jsx`

### Description
State-specific advertising disclosures required by legal regulations.

### Design
- Same layout as privacy and terms pages
- Dark theme with white card
- Sticky navigation

### Content
- General advertising notice
- Binding arbitration agreement info
- State-specific legal disclosures for:
  - Alabama through Wyoming (all states)
  - Each state has specific legal language required

### States Covered
- Alabama: UL certification disclaimer
- Alaska: Alaska Bar Association notice
- Arizona through Wyoming: Various state bar disclosures

### Features
- Bordered cards for each state disclosure
- No Win, No Fee guarantee card
- Comprehensive state coverage
- Professional legal formatting

---

## Partner List Page
**Route:** `/PartnerList`
**File:** `pages/PartnerList.jsx`

### Description
Comprehensive list of affiliated partners and attorney sponsors.

### Design
- Dark gradient background
- White rounded card
- Custom header with logo and phone
- Animated content

### Sections
1. **Affiliated Partners**
   - Grid of partner organizations
   - 10+ partner names including:
     - Car Accident Helpline
     - Los Defensores
     - 4LegalLeads
     - 1800TheLaw2
     - My Lawsuit Help
     - And more...

2. **Sponsors Widget**
   - Embedded third-party sponsor list
   - 100+ attorney names
   - Styled grid layout
   - Custom styling for consistency

3. **No Win, No Fee Guarantee**
   - Standard guarantee card

4. **Navigation**
   - Back to home button
   - Footer security note

### Features
- Animated entries
- Responsive grid layout
- External partner widget integration
- Professional presentation
- Complete transparency of partners

---

## SB-37 List Page
**Route:** `/sb-37-list`
**File:** `pages/sb-37-list.jsx`

### Description
SB-37 compliance page showing primary and secondary affiliated participants for California legal requirements.

### Design
- Dark gradient background
- White rounded card
- Standard header and navigation

### Content
- Icon and heading "Affiliated Participants"
- Two main participants listed:
  1. Kevin Danesh
  2. The Law Offices of Larry H. Parker
- No Win, No Fee guarantee
- Back to home navigation
- Footer note

### Tone
- Compliance-focused
- Clear participant identification
- Professional presentation

---

## Blog Page
**Route:** `/Blog`
**File:** `pages/Blog.jsx`

### Description
Blog listing page featuring legal articles and claim tips.

### Design
- Dark theme (#0a1628)
- Multiple card-based layout
- Sticky category filter bar
- Sidebar with utilities

### Main Features

#### Hero Section
- "Legal Insights & Claim Tips" headline
- Description of article focus
- Search bar for article search

#### Category Filter (Sticky)
- Filter by categories:
  - All
  - Car Accidents
  - Personal Injury
  - Legal Process
  - Settlement Tips
  - Slip & Fall
  - Legal Advice
  - Medical Malpractice

#### Featured Article
- Large featured post (if exists)
- Image, title, excerpt
- Author info, date, read time
- "Featured" badge

#### Article Grid
- 3-column responsive grid
- Article cards with:
  - Featured image
  - Category badge
  - Title (clamped to 2 lines)
  - Excerpt
  - Author name
  - Publication date
  - Read time estimate
  - Hover effects

#### Loading State
- Skeleton cards (6) while loading
- Smooth fade-in animations

#### Sidebar
- Search articles input
- Popular articles list (ranked)
- Category list with counts:
  - Car Accidents: 12
  - Personal Injury: 8
  - Legal Process: 6
  - Settlement Tips: 5
  - Slip & Fall: 4
  - Legal Advice: 9
  - Medical Malpractice: 3
- Newsletter signup
  - Email input
  - Subscribe button
- CTA card to claim checker

#### Pagination
- "Load More Articles" button
- Dynamic pagination (9 per page)

### Data Source
- Fetches from BlogPost entity
- Filters by status: "Published"
- Sorted by publication date (newest first)
- Supports search filtering

### Features
- Lazy loading for images
- AI-generated badge for AI content
- Empty state handling
- Responsive sidebar
- Real-time search
- Category filtering
- Popular articles ranking

---

## Common Elements Across Pages

### Navigation
- Navbar component with logo
- Link to home page
- Professional styling

### Footer
- LandingFooter component
- Legal disclaimers
- Copyright info
- Privacy/Terms links
- Contact information

### Color Scheme (Consistent)
- Primary Blue: #0285E9 / #1e90ff
- Dark backgrounds: #0a1628, #0C2D5B
- Text: White, #595E64 (gray)
- Accent Green: Various shades

### Typography
- Bold headings for section titles
- Regular body text for descriptions
- Smaller text for disclaimers
- Consistent font scaling

### CTAs
- Phone number buttons throughout
- "Check My Claim" buttons
- Primary color (#0285E9)
- Hover effects with scale/shadow
- Gradient backgrounds

### Animations
- Smooth fade-ins on page load
- Hover effects on interactive elements
- Staggered animations for lists
- Scale and transform transitions

### Responsive Design
- Mobile-first approach
- Breakpoints for tablet/desktop
- Flexible grid layouts
- Touch-friendly buttons

---

## Asset References

### Logos
- Main Logo (Dark): `https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/699c8efa75d8857518d34273/440596289_PrimaryLogo_CheckMyClaim.png`
- Secondary Logo: `https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/699c8efa75d8857518d34273/5fbaf5c73_PrimaryLogo_CheckMyClaim.png`

### Images
- Submitted Page Graphic: Important Call Incoming image

### Icons
- Lucide React icons throughout
- Phone, ArrowLeft, Shield, Users, FileText, Clock, Calendar, etc.

---

## Contact Information
- Email: help@checkmyclaim.co
- Phone: (844) 738-1035 / (844) 840-6905
- Company: NJA-Online LLC / Check My Claim

---

## Legal Compliance
- Privacy Policy page required
- Terms of Service page required
- Advertising Disclosure for all states
- Partner transparency (PartnerList, SB-37)
- No Win, No Fee guarantee displayed on all pages
- TCPA/Communications consent messaging
- California residency disclosures