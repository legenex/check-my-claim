# Check My Claim - Complete Website Pages Documentation

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
12. [Design System](#design-system)

---

## Home Page
**Route:** `/`
**File:** `pages/Home.jsx`

### Overview
Main landing page with full-width white background featuring multiple trust-building sections, value proposition, and conversion-focused CTAs.

### Page Structure (Top to Bottom)

#### 1. Navbar Component
- **Location:** Top of page
- **Logo:** Dark mode logo, clickable to home
- **Navigation:** Links to home, about, services, FAQ
- **Design:** White/light background with dark text
- **Sticky:** Yes
- **CTA Button:** Call-to-action phone button

#### 2. Hero Section (`Hero.jsx`)
**Background:** 
- Image overlay: Happy family photo with dark gradient overlay
- Overlay gradient: `from-[#111E30]/95 via-[#111E30]/90 to-[#0C1A2A]/95`
- Subtle SVG pattern overlay (opacity: 0.03)

**Content Layout:**
- **Badge:** Inline flex with icons
  - Text: "100% Free • No Win, No Fee • Fast Results"
  - Color: `text-[#0285E9]` on `bg-white/10` with backdrop blur
  - Icon: Shield from lucide-react

- **Main Heading:** 
  - Text: "Check Your Claim, Get What You Deserve"
  - Font: Text-6xl-7xl, extrabold, white
  - Gradient accent: "Get What You Deserve" in blue gradient `from-[#4ba8ee] to-[#0486e9]`

- **Subheading:**
  - Text: "Unsure if you have a case after an accident? Our AI tool instantly checks if you may qualify for compensation and matches you with the best-suited attorney, at no upfront cost."
  - Color: `text-gray-300`
  - Font size: Text-lg to text-xl

- **Primary CTA Button:**
  - Text: "Start Your Free Claim Check"
  - Link: `https://qualify.checkmyclaim.co/s/mva?utm_source=CMC-Website&utm_campaign=Home-Page&utm_medium=1st-Button`
  - Style: Gradient button `from-[#4ba8ee] to-[#0486e9]`
  - Icon: ArrowRight from lucide-react
  - Hover: scale-105, shadow-2xl
  - Supporting text: "Takes less than 2 minutes" in gray

- **Trust Pills (3 columns):**
  1. Shield icon + "Vetted Attorneys Only"
  2. DollarSign icon + "No Upfront Fees"
  3. Clock icon + "Results in Minutes"
  - Design: `bg-white/5` with backdrop blur, border `border-white/10`, rounded-xl

**Animation:**
- Staggered fade-in from top (delay: 0, 0.15s, 0.3s, etc.)
- Y-offset animations (y: 20-30)

#### 3. Trust Banner Component
- **Function:** Display key statistics/trust metrics
- **Design:** Horizontal bar with centered stats
- **Content:** (Example) "10,000+ Cases Won" | "5+ Years Experience" | "$100M+ Recovered"

#### 4. Reviews Component
- **Layout:** Carousel/grid of customer testimonials
- **Card Design:** White background, rounded corners, shadow
- **Content per card:** Quote, author name, rating (stars)
- **Design:** Alternating layout on desktop

#### 5. Accident Types Component (`AccidentTypes.jsx`)
- **Section Title:** "What Types of Accidents Do We Handle?"
- **Layout:** 3-4 column grid
- **Cards per type:**
  - Icon
  - Title (e.g., "Auto Accidents", "Motorcycle Accidents", "Pedestrian Accidents")
  - Brief description
  - Color-coded: Each card has different accent color

#### 6. Who Benefits Component (`WhoBenefits.jsx`)
- **Section Title:** "Who Benefits From Our Service?"
- **Layout:** Grid of personas/scenarios
- **Examples:** "Accident victims uncertain about claims", "People needing attorney guidance", etc.
- **Design:** Icon + text layout

#### 7. Transformation Component (`Transformation.jsx`)
- **Title:** "Your Transformation Starts Here"
- **Layout:** Before/After or process flow
- **Sections:** 
  - Before state (confused, uncertain)
  - Arrow or process indicator
  - After state (confident, represented)
- **Visual:** Timeline or horizontal flow

#### 8. How It Works Component (`HowItWorks.jsx`)
- **Section Title:** "How It Works - 4 Simple Steps"
- **Layout:** Vertical or horizontal timeline
- **Steps:**
  1. Answer Quick Questions
  2. AI Analyzes Your Claim
  3. Matched With Attorney
  4. Get Your Settlement
- **Design:** Numbered circles with descriptions
- **Icons:** Relevant lucide-react icons per step

#### 9. USP Component (`USP.jsx`)
- **Section Title:** "Why Choose Check My Claim?"
- **Unique Selling Points:**
  - No Win, No Fee guarantee
  - Instant AI evaluation
  - Vetted attorney network
  - 24/7 support
  - Fast turnaround
- **Layout:** 2-3 column grid with icons
- **Design:** Accent color highlights

#### 10. Fighting For You Component (`FightingForYou.jsx`)
- **Section Title:** "We're Fighting For You"
- **Content:** Narrative about commitment to clients
- **Elements:**
  - Professional image
  - Compelling copy
  - Testimonial highlights
- **Color:** Accent green/blue backgrounds

#### 11. No Win, No Fee Component (`NoWinNoFee.jsx`)
- **Background:** Green gradient or accent color
- **Title:** "NO WIN, NO FEE Guarantee"
- **Content:** Detailed explanation of fee structure
- **Guarantee text:** Bold, centered
- **Icon:** CheckCircle in green

#### 12. Recent Wins Component (`RecentWins.jsx`)
- **Section Title:** "Recent Wins & Settlements"
- **Layout:** Grid or carousel of settlement cards
- **Card Content:**
  - Settlement amount (large, bold)
  - Client initials/avatar
  - Case type
  - Location
  - Year/date
- **Design:** Card-based with hover effects

#### 13. About Us Component (`AboutUs.jsx`)
- **Section Title:** "About Check My Claim"
- **Content:** Company mission and story
- **Elements:**
  - Company description
  - Key achievements
  - Team philosophy
  - Trust indicators
- **Layout:** Text + image side-by-side (responsive)

#### 14. FAQ Component (`FAQ.jsx`)
- **Section Title:** "Frequently Asked Questions"
- **Layout:** Accordion-style collapsible questions
- **Questions (8-12 typical):**
  - "How long does the process take?"
  - "Do I have to pay upfront?"
  - "What if I already have an attorney?"
  - "What states do you serve?"
  - "How is my information secure?"
  - "Do I have a case?"
  - "What's the process?"
  - "How much could I recover?"
  - etc.
- **Design:** Expandable/collapsible with smooth animations
- **Styling:** Light gray background when expanded

#### 15. Footer Component (`Footer.jsx`)
- **Background:** Dark navy `#111E30`
- **Content Sections:**
  1. Logo + company description
  2. Quick Links (Home, About, Services, FAQ)
  3. Contact info (phone, email)
  4. Legal links (Privacy, Terms, Disclosure)
  5. Copyright line
- **Icons:** Mail, Phone, ArrowRight
- **Colors:** White text on dark, accent blue for links
- **Bottom:** Copyright year and legal disclaimers

---

## Survey Page
**Route:** `/Survey`
**File:** `pages/SurveyPage.jsx` or `/s/{slug}`

### Overview
Interactive survey/quiz page where users answer accident-related questions to determine claim eligibility and get attorney matches.

### Page Background
- **Gradient:** `from-[#0C2D5B] via-[#001634] to-[#1B2737]` (dark blue gradient)
- **Overlay Pattern:** SVG pattern overlay, minimal opacity
- **Full height:** min-h-screen

### Main Content Structure

#### 1. Call Banner (Top Sticky)
- **Component:** `CallBanner.jsx`
- **Position:** Fixed/sticky at top
- **Background:** Gradient blue `from-[#4ba8ee] to-[#0486e9]`
- **Content:** 
  - Text: "Get Expert Legal Guidance Today"
  - Phone CTA button with icon
  - Phone number: "(844) 738 1035"
- **Design:** Flex row, centered, padding 3-4

#### 2. Hero Card Section
- **Container:** Centered max-width (640px-800px)
- **Background:** White rounded card with shadow
- **Border radius:** rounded-3xl
- **Padding:** p-8 to p-12
- **Box shadow:** shadow-2xl

**Content:**
- **Intro text:** "Answer a few quick questions about your accident..."
- **Main question:** "How Were You Injured?" (large, bold)
- **Answer buttons (4 options):**
  1. Auto/Motorcycle Accident - Car icon
  2. Commercial/Semi Accident - Truck icon
  3. Passenger/Rideshare/Pedestrian Accident - Users icon
  4. At Work/Other/I Wasn't Injured - AlertCircle icon

**Button Styling:**
- Style: Primary blue gradient or outlined
- Size: Full-width or 2-column grid on desktop
- Text: Bold, centered
- Hover: Color shift, slight scale up
- Font size: Text-base to text-lg

#### 3. Survey Process Section (`SurveyProcess.jsx`)
- **Title:** "The Process"
- **Description:** Step-by-step explanation
- **Timeline or steps** with icons and descriptions
- **Background:** Light gray or subtle gradient

#### 4. Fighting For You Section (`SurveyFightingForYou.jsx`)
- **Title:** "We're Fighting For You"
- **Content:** Trust-building narrative
- **Design:** Image + text layout
- **Elements:** Professional copy, credibility markers

#### 5. Recent Wins Section (`SurveyRecentWins.jsx`)
- **Title:** "Recent Wins & Settlements"
- **Layout:** Grid of settlement cards
- **Card Design:**
  - Amount (largest text, bold)
  - Client initials in avatar
  - Case type
  - Location
- **Design:** Cards with subtle shadow

#### 6. Guarantee Section (`SurveyGuarantee.jsx`)
- **Background:** Green gradient or accent
- **Title:** "NO WIN, NO FEE Guarantee"
- **Content:** Full guarantee explanation
- **Icon:** CheckCircle in green
- **Styling:** Centered, emphasis text in bold

#### 7. Testimonials Section (`SurveyTestimonials.jsx`)
- **Title:** "What Our Clients Say"
- **Layout:** Carousel or grid of quotes
- **Card content:**
  - Quote text in italic
  - Author name
  - Star rating
  - Client initials/avatar
- **Design:** White background cards

#### 8. FAQ Section (`SurveyFAQ.jsx`)
- **Title:** "Common Questions"
- **Accordion-style** questions with collapse/expand
- **Questions:** (Examples)
  - "How does the claim check work?"
  - "Is there a cost?"
  - "How long does it take?"
  - "What information do I need?"
  - "What happens after I submit?"

#### 9. Footer Component
- **Style:** Same as home page footer
- **Content:** Legal disclaimers, links, contact info
- **Background:** Dark navy

---

## Submitted Page
**Route:** `/Submitted`
**File:** `pages/Submitted.jsx`

### Overview
Confirmation page shown when user qualifies with a high-value claim. Features success messaging and next-steps timeline.

### Page Background
- **Gradient:** `from-[#0C2D5B] via-[#001634] to-[#1B2737]` (dark blue)
- **Full height:** min-h-screen
- **Padding:** Top and bottom sections

### Page Structure

#### 1. Custom Header
- **Background:** White, shadow-md
- **Layout:** Flex row, space-between
- **Left side:** Logo image (h-10 to h-14)
- **Right side:**
  - Text: "Prefer to speak to someone right now?"
  - Phone CTA button with gradient and hover scale

#### 2. Main Content Container
- **Background:** White rounded card (rounded-3xl)
- **Shadow:** shadow-2xl
- **Padding:** p-8 to p-12
- **Max width:** max-w-5xl
- **Margin:** Centered with auto margins

**Content breakdown:**

#### 3. Success Image
- **Component:** Animated on mount
- **Image URL:** "https://media.base44.com/images/public/699c8efa75d8857518d34273/09cab419e_ImportantCall-DesignCMC.png"
- **Size:** w-full, max-w-md
- **Animation:** scale (0.8 to 1), 0.2s delay

#### 4. Main Message
- **Heading:** "Congrats! We will be CALLING YOU"
- **Text color:** Dark navy `#0C2D5B`
- **Font:** Text-4xl, font-bold
- **Emphasis:** Green color `text-green-500` on "CALLING YOU"
- **Subheading below:** "Based on your answers, it seems you may have a HIGH VALUE CLAIM!"
  - Green emphasis on "HIGH VALUE CLAIM!"

#### 5. Alert Box
- **Background:** Gradient blue `from-[#4ba8ee] to-[#0486e9]`
- **Text:** "Please Make Sure To Answer your Phone!"
- **Color:** White text
- **Font:** Bold, centered
- **Padding:** py-3 px-4
- **Border radius:** rounded-xl

#### 6. Note Section
- **Text:** "PLEASE NOTE: We cannot proceed with your case without talking to you on the phone and confirming your case details…"
- **Style:** Italic, smaller font, gray text
- **Margin:** Bottom margin mb-8

#### 7. Next Steps Section
- **Background:** Gradient blue with 10% opacity `from-[#4ba8ee]/10 to-[#0486e9]/10`
- **Border radius:** rounded-2xl
- **Padding:** p-6
- **Title:** "Here's What To Expect Next:" with Clock icon

**Timeline cards (4 steps):**

**Step 1 - Primary (largest):**
- **Background:** White
- **Border:** 2px border blue `border-[#0285E9]`
- **Padding:** p-5
- **Border radius:** rounded-xl
- **Icon:** Phone with pulsing animation
- **Title:** "📞 Step 1: We Will Call You (Next Few Minutes!)"
- **Description:** "One of our trusted advisors will call your phone to verify your details and connect you with the right attorney. Please answer the call!"
- **Icon styling:** w-12 h-12, gradient circle background, animate-pulse

**Steps 2-4 - Secondary:**
- **Background:** White
- **Layout:** Flex with icon on left
- **Icon:** Numbered circle (2, 3, 4) in gradient
- **Title:** Bold dark text
- **Description:** Smaller text in gray
- **Padding:** p-4 each

**Step titles:**
- Step 2: "Attorney Review" - "Your matched attorney will review your case details thoroughly."
- Step 3: "Case Initiation (No Cost To You)" - "Your attorney starts your case with zero upfront fees - they only get paid when you win."
- Step 4: "Settlement & Compensation" - "Your attorney presents settlement options and fights for maximum compensation."

#### 8. Call Now CTA Section
- **Background:** Gradient blue with 10% opacity
- **Border radius:** rounded-2xl
- **Padding:** p-6
- **Text alignment:** Center
- **Title:** "Don't Wanna Wait? Click the button below to call now, and fast track your claim.."
- **Button:**
  - Gradient blue `from-[#4ba8ee] to-[#0486e9]`
  - Text: Phone icon + "(844) 738 1035"
  - Hover: shadow-2xl with blue glow, scale-105
  - Padding: px-10 py-4
  - Border radius: rounded-full
  - Font: Bold, text-lg

#### 9. Guarantee Section
- **Background:** Green gradient `from-green-50 to-green-100/50`
- **Border radius:** rounded-2xl
- **Padding:** p-6
- **Icon:** CheckCircle in green `text-green-600`
- **Title:** "NO WIN, NO FEE Guarantee:" (extrabold)
- **Content:** Full guarantee explanation (text-sm, gray text)
- **Emphasis:** "YOU HAVE NOTHING TO LOSE!" in large blue bold text (text-2xl)

#### 10. Return CTA Button
- **Text:** "Return to Home"
- **Icon:** ArrowRight
- **Style:** Gradient blue button
- **Hover:** scale-105, shadow glow
- **Link:** To home page

#### 11. Footer Note
- **Text:** "✓ 100% Free • ✓ No Obligation • ✓ Your Information is Secure"
- **Color:** White/60
- **Font size:** Text-sm
- **Alignment:** Center

#### 12. Footer Component (Bottom)
- **Standard footer** with dark background

### Animations
- **Page load:** Fade in from top (y: 20)
- **Image:** Scale 0.8 to 1, spring animation, 0.2s delay
- **Heading:** Fade + Y offset, 0.4s delay
- **Steps:** Staggered animations, each with delay
- **Buttons:** Hover scale (1.05)

---

## Thanks Page
**Route:** `/Thanks`
**File:** `pages/Thanks.jsx`

### Overview
Thank you/confirmation page shown after disqualified lead submits information. Similar structure to Submitted but different messaging.

### Page Background
- **Gradient:** `from-[#0C2D5B] via-[#001634] to-[#1B2737]` (same as Submitted)
- **Full height:** min-h-screen

### Header Section
- **Identical to Submitted page**
- White background, logo left, phone CTA right

### Main Content Card
- **White rounded card** (rounded-3xl, shadow-2xl)
- **Padding:** p-8 to p-12

**Content:**

#### Success Icon
- **Component:** Animated on mount
- **Circle:** Gradient blue `from-[#4ba8ee] to-[#0486e9]`, w-20 h-20
- **Icon:** CheckCircle2 in white, w-12 h-12
- **Animation:** Scale from 0 to 1, spring, 0.2s delay

#### Main Message
- **Heading:** "Thank You!"
- **Font:** Text-3xl to text-4xl, extrabold, dark navy
- **Animation:** Fade + Y offset, 0.3s delay

#### Confirmation Message
- **Text:** "We Have Received Your Details!"
- **Font:** Bold, text-xl, dark navy
- **Animation:** Fade, 0.4s delay

#### Phone Confirmation
- **Text:** "One of our trusted advisors will call you in the next few minutes!"
- **Font:** Gray text, text-lg
- **Animation:** Fade, 0.45s delay

#### Phone Alert Box
- **Background:** Gradient blue `from-[#4ba8ee] to-[#0486e9]`
- **Text:** "Please Make Sure To Answer your Phone!"
- **Font:** Bold, white, centered
- **Padding:** py-3 px-4
- **Border radius:** rounded-xl
- **Animation:** Fade, 0.5s delay

#### Important Note
- **Text:** "PLEASE NOTE: We cannot proceed with your case without talking to you on the phone and confirming your case details…"
- **Font:** Italic, gray, smaller
- **Margin:** mb-8
- **Animation:** Fade, 0.55s delay

#### Call Now CTA Section
- **Background:** Gradient blue 10% opacity
- **Border radius:** rounded-2xl
- **Padding:** p-6
- **Title:** "Don't Wanna Wait? Click the button below to call now, and fast track your claim.."
- **Font:** Bold, dark navy
- **Button:**
  - Gradient blue button
  - Phone icon + "(844) 738 1035"
  - Hover: shadow-2xl, scale-105
  - Animation:** Fade, 0.6s delay

#### Guarantee Section
- **Background:** Green gradient `from-green-50 to-green-100/50`
- **Border radius:** rounded-2xl
- **Icon:** CheckCircle2 in green
- **Title:** "NO WIN, NO FEE Guarantee:"
- **Content:** Full explanation text
- **Emphasis:** "YOU HAVE NOTHING TO LOSE!" in blue
- **Animation:** Fade, 0.7s delay

#### Back to Home Button
- **Style:** Outlined border button with gray border
- **Text color:** Dark navy
- **Icon:** ArrowLeft
- **Hover:** bg-gray-50
- **Link:** To home page
- **Animation:** Fade, 0.9s delay

#### Footer Note
- **Text:** "✓ 100% Free • ✓ No Obligation • ✓ Your Information is Secure"
- **Color:** White/60
- **Font:** Text-sm
- **Alignment:** Center
- **Animation:** Fade, 1.0s delay

### Footer Component
- **Standard dark footer** at bottom

---

## Sorry Page
**Route:** `/Sorry`
**File:** `pages/Sorry.jsx`

### Overview
Disqualification page shown when user doesn't meet claim eligibility criteria.

### Page Structure
- **Header:** White with logo and phone CTA (same as Submitted/Thanks)
- **Background:** Dark blue gradient `from-[#0C2D5B] via-[#001634] to-[#1B2737]`

### Main Content Card
- **White rounded card** (rounded-3xl, shadow-2xl, p-8 to p-12)

**Content:**

#### Error Icon
- **Circle:** Gray or muted color background
- **Icon:** X or AlertCircle in gray
- **Size:** w-20 h-20, centered
- **Animation:** Scale animation on load

#### Main Message
- **Heading:** "Sorry!"
- **Font:** Text-3xl, extrabold, dark navy
- **Subheading:** "Based on your answers, We Are Unable To Help!"
- **Font:** Bold, text-xl, dark navy

#### Explanation
- **Text:** "Unfortunately, based on the information you provided, your situation doesn't appear to meet our current case criteria. However, we encourage you to explore other resources or consult with a local attorney who may be able to assist."
- **Font:** Gray text, leading-relaxed
- **Margin:** Significant bottom margin

#### Additional Text
- **Message about exploring other resources**
- **Font:** Smaller, gray text

#### Return to Home Button
- **Style:** Outlined or filled button
- **Text:** "Return to Home"
- **Color:** Blue or dark navy
- **Hover:** Color shift, shadow
- **Centered:** Text-center

#### Footer Security Note
- **Logo:** Small company logo
- **Text:** "Your information is completely secure and will be treated with the utmost confidentiality."
- **Font:** Very small, gray, centered

#### Footer Text
- **Disclaimer:** About service limitations
- **Font:** Smallest size, gray

### Tone
- Professional and empathetic
- Clear about inability to help
- Suggests alternatives
- Maintains company branding

---

## Privacy Policy Page
**Route:** `/PrivacyPolicy`
**File:** `pages/PrivacyPolicy.jsx`

### Overview
Legal privacy policy document with scrollable content and sticky header/footer.

### Page Layout

#### Header
- **Position:** Sticky top
- **Background:** Dark gradient
- **Icon:** Lock or Shield icon in blue
- **Title:** "Privacy Policy"
- **Font:** Bold, white text
- **Padding:** p-4

#### Scrollable Content Container
- **Background:** Dark navy `#0a1628`
- **Content:** White rounded card
- **Max height:** h-96 or h-screen overflow-y-auto
- **Padding:** p-6 to p-8

**Main Sections:**

1. **Information We Collect**
   - Contact information (name, phone, email)
   - Personal information (accident/injury details)
   - Device information
   - Usage information
   - Other form data

2. **How We Use Your Information**
   - Respond to inquiries
   - Provide service information
   - Improve website and services
   - Comply with legal requirements
   - Marketing and outreach

3. **How We Share Your Information**
   - Service providers (lawyers, verification services)
   - Legal requirements
   - Business transfers
   - Aggregate data

4. **Your Rights**
   - Access to personal information
   - Correction of errors
   - Object to processing
   - Delete personal information (right to be forgotten)
   - Restrict processing
   - Data portability
   - Withdraw consent

5. **Security Measures**
   - SSL encryption
   - Secure servers
   - Data protection practices
   - Security protocols

6. **Third-Party Website Links**
   - Disclaimer about external links
   - Not responsible for third-party content

7. **Policy Changes**
   - Notification of changes
   - Continued use constitutes acceptance

8. **California Privacy Rights (CCPA)**
   - Specific rights for CA residents
   - Details on data categories

9. **Contact Information**
   - Email for privacy questions
   - Company address
   - Phone number

#### Guarantee Card (Within Content)
- **Background:** Green gradient
- **Icon:** CheckCircle
- **Title:** "NO WIN, NO FEE Guarantee"
- **Text:** Short guarantee explanation
- **Styling:** Separate card within scrollable area

#### Footer (Sticky Bottom)
- **Background:** Dark gradient
- **Button:** "Back to Home" or close icon
- **Font:** White text
- **Padding:** p-4
- **Position:** Sticky bottom of card

### Styling Details
- **Text color:** Gray for body, white for headings
- **Links:** Blue `#0285E9`
- **Padding:** Consistent spacing (p-4 to p-6)
- **Font sizes:** Responsive (smaller on mobile)
- **Line height:** Generous for readability

---

## Terms of Service Page
**Route:** `/TermsOfService`
**File:** `pages/TermsOfService.jsx`

### Overview
Legal terms and conditions document with similar layout to Privacy Policy.

### Page Structure
- **Header:** Sticky, same style as Privacy Policy
- **Content:** Scrollable card
- **Footer:** Sticky bottom button

### Main Sections

1. **User Responsibilities**
   - Must be 18+ years old
   - Account information accuracy
   - Compliance with laws
   - No illegal activity

2. **Intellectual Property**
   - Website and content ownership
   - Limited license to use
   - Restrictions on reproduction
   - Trademark information

3. **Privacy and Data Sharing**
   - Reference to privacy policy
   - Data sharing with third parties (Twilio, mobile operators)
   - Fraud protection
   - Verification processes

4. **Disclaimers and Limitations**
   - No legal advice disclaimer
   - No guarantee of results
   - Limitation of liability
   - "AS IS" service provision
   - No warranty of completeness

5. **Termination of Access**
   - Right to terminate account
   - Suspension for violations
   - Data retention after termination

6. **Communications Consent**
   - Opt-in for calls/texts
   - Contact info sharing acknowledgment
   - Do Not Call list exception
   - TCPA compliance

7. **Severability**
   - Invalid provisions don't affect rest of terms

8. **Governing Law and Jurisdiction**
   - Jurisdiction statement
   - Choice of law
   - Binding arbitration

9. **Changes to Terms**
   - Right to modify terms
   - Notification of changes
   - Continued use = acceptance

10. **Contact Information**
    - Email for questions
    - Phone number
    - Mailing address

### Styling
- **Same as Privacy Policy**
- Dark theme with white content card
- Gray body text, white headings
- Blue links
- Green guarantee card within content

---

## Advertising Disclosure Page
**Route:** `/AdvertisingDisclosure`
**File:** `pages/AdvertisingDisclosure.jsx`

### Overview
State-specific legal disclosures for advertising compliance.

### Page Structure
- **Header:** Same sticky style
- **Content:** Scrollable, dark background with white card
- **Footer:** Sticky navigation

### Content Sections

#### General Disclosure
- Binding arbitration agreement information
- No class action rights
- Professional background details

#### State Disclosures
- **Format:** Each state has a bordered card with specific legal language
- **States covered:** All 50 states (Alabama through Wyoming)
- **Organization:** Alphabetical order
- **Card styling:** Border, padding, rounded corners

**Example state disclosures:**
- **Alabama:** UL certification disclaimer
- **Alaska:** Alaska Bar Association notice
- **Arizona:** Specific Arizona bar language
- **California:** California State Bar disclaimer
- **Florida:** Florida bar specific text
- *...continues through all states...*
- **Wyoming:** Final state disclaimer

#### Guarantee Card
- **Style:** Green gradient card
- **Content:** "NO WIN, NO FEE Guarantee" explanation
- **Icon:** CheckCircle
- **Position:** Among the disclosures or at top/bottom

### Styling Details
- **Card styling:** Subtle borders, light padding
- **Text:** Professional legal language, readable font
- **Organization:** Clear state headers
- **Spacing:** Good spacing between state disclosures
- **Links:** Blue accent for any clickable elements

---

## Partner List Page
**Route:** `/PartnerList`
**File:** `pages/PartnerList.jsx`

### Overview
Comprehensive list of affiliated partners and attorney sponsors with transparency focus.

### Page Layout

#### Custom Header
- **Background:** White, shadow-md
- **Logo:** Left side
- **CTA:** Right side phone button
- **Layout:** Flex row, space-between

#### Main Content Container
- **Background:** Dark blue gradient `from-[#0C2D5B] via-[#001634] to-[#1B2737]`
- **Card:** White rounded (rounded-3xl, shadow-2xl)
- **Padding:** p-8 to p-12
- **Centered:** max-w-5xl

#### Page Title
- **Text:** "Our Affiliated Partners & Sponsor Network"
- **Font:** Large, bold, dark navy
- **Subtitle:** Brief explanation of partnership network

### Content Sections

#### 1. Affiliated Partners Section
- **Title:** "Affiliated Partners"
- **Description:** "We work with a carefully selected network of industry partners"
- **Layout:** Grid (2-3 columns on desktop, responsive)
- **Partners list:**
  - Car Accident Helpline
  - Los Defensores
  - 4LegalLeads
  - 1800TheLaw2
  - My Lawsuit Help
  - Lawsuit Direct
  - Capital Legal
  - Attorney.com
  - LegalMatch
  - Avvo
  - *(and more)*

**Card design per partner:**
- **Background:** Light gray or white with subtle shadow
- **Text:** Centered, medium font
- **Padding:** p-4 to p-6
- **Border radius:** rounded-lg
- **Hover:** Slight shadow increase or color shift

#### 2. Attorney Sponsors Widget
- **Title:** "Our Attorney Sponsors"
- **Description:** "100+ vetted attorneys across the United States"
- **Embedded widget:** Third-party sponsor list
- **Layout:** Grid (4-5 columns on desktop)
- **Styling:** Consistent with partner cards
- **Names:** 100+ attorney names listed
- **Custom styling:** Apply CMC colors and styling for consistency

#### 3. Guarantee Card
- **Style:** Green gradient background
- **Icon:** CheckCircle
- **Title:** "NO WIN, NO FEE Guarantee"
- **Content:** Full guarantee explanation
- **Position:** Between partners and attorneys or after

#### 4. Navigation Section
- **Back Button:** "Back to Home"
- **Style:** Outlined or filled button
- **Icon:** ArrowLeft
- **Hover effects:** Color shift, shadow

#### 5. Footer Security Note
- **Logo:** Small company logo
- **Text:** "Check My Claim has partnered with 100+ trusted attorneys nationwide to ensure you get the best possible representation."
- **Font:** Small, centered, gray

### Animations
- **Page load:** Fade in from top
- **Cards:** Staggered entrance animations
- **Hover:** Scale and shadow effects

---

## SB-37 List Page
**Route:** `/sb-37-list`
**File:** `pages/sb-37-list.jsx`

### Overview
California-specific page for SB-37 compliance showing affiliated participants.

### Page Structure

#### Custom Header
- **White background, shadow**
- **Logo left, phone CTA right**
- **Same as PartnerList**

#### Main Content Container
- **Dark gradient background**
- **White rounded card (rounded-3xl)**
- **Padding: p-8 to p-12**

#### Page Content

**Title:**
- **Text:** "Affiliated Participants"
- **Icon:** Users or Building icon
- **Font:** Bold, dark navy, large

**Description:**
- **Text:** "In compliance with California law, we disclose our primary and secondary affiliated participants:"
- **Font:** Gray, smaller

#### Participants List

**Format: Card layout with participant info**

**Participant 1:**
- **Name:** Kevin Danesh
- **Title/Role:** Attorney/Consultant
- **Details:** Background or description
- **Card styling:** White background, padding, subtle shadow

**Participant 2:**
- **Name:** The Law Offices of Larry H. Parker
- **Type:** Law Firm
- **Details:** Description
- **Card styling:** Same as above

#### Guarantee Card
- **Style:** Green gradient
- **Content:** "NO WIN, NO FEE Guarantee"
- **Icon:** CheckCircle
- **Positioned:** Below participants

#### Back to Home
- **Button:** "Return to Home"
- **Style:** Outlined or filled
- **Centered:** Margin top

#### Footer
- **Text:** Legal compliance note
- **Font:** Small, gray, centered

### Compliance Notes
- **California legal requirement:** SB-37 mandates disclosure of affiliated participants
- **Clarity:** Clear identification of each participant
- **Transparency:** Professional presentation of partnerships

---

## Blog Page
**Route:** `/Blog`
**File:** `pages/Blog.jsx`

### Overview
Blog article listing page with search, filters, sidebar utilities, and pagination.

### Page Structure

#### Navigation
- **Header:** Standard navbar with branding

#### Page Background
- **Color:** Dark theme `#0a1628`
- **Full width, min-height screen**

### Main Content Layout

#### Hero Section
- **Background:** Gradient or solid dark blue
- **Title:** "Legal Insights & Claim Tips"
- **Subtitle:** "Expert Articles to Help You Navigate Your Claim"
- **Search bar:** Full-width search input with icon

#### Category Filter Bar (Sticky)
- **Position:** Sticky below hero
- **Background:** Dark with light overlay
- **Layout:** Horizontal scrollable on mobile, fixed on desktop
- **Categories:**
  - All (default selected)
  - Car Accidents
  - Personal Injury
  - Legal Process
  - Settlement Tips
  - Slip & Fall
  - Legal Advice
  - Medical Malpractice
- **Styling:** Pill-shaped buttons, active state highlighted in blue

### Main Content Area

#### Featured Article (If Exists)
- **Position:** Top of article grid
- **Size:** Large featured card (2x height of normal cards)
- **Image:** Full-width image at top of card
- **Badge:** "Featured" tag in blue/accent
- **Content:**
  - Title (large, bold, clamped to 2 lines)
  - Excerpt (2-3 lines)
  - Author name
  - Publication date
  - Read time estimate (e.g., "5 min read")
- **Design:** White card on dark background, shadow
- **Hover:** Scale effect, shadow increase

#### Article Grid
- **Layout:** Responsive grid
  - Mobile: 1 column
  - Tablet: 2 columns
  - Desktop: 3 columns
- **Cards per article:**
  - **Image:** Featured image, aspect ratio maintained
  - **Category badge:** Color-coded by category (small pill)
  - **Title:** Bold, clamped to 2 lines, dark navy
  - **Excerpt:** Gray text, 2 lines max
  - **Meta info:** Author name, publication date, read time
  - **Design:** White background, rounded corners, subtle shadow
  - **Hover:** Shadow increase, slight scale, cursor pointer

**Card styling details:**
- **Border radius:** rounded-lg
- **Padding:** p-4 to p-6
- **Image height:** h-48 to h-56
- **Title font:** Text-lg, bold, dark
- **Meta font:** Text-xs, gray
- **Spacing:** gap-4 between cards

#### Loading State
- **Display:** When data loading
- **Design:** Skeleton cards (6 total)
- **Animation:** Subtle pulse animation
- **Styling:** Light gray placeholder blocks

#### Empty State
- **Display:** When no articles match filters
- **Text:** "No articles found. Try adjusting your search or filters."
- **Icon:** SearchX or similar
- **Design:** Centered, gray text

#### Pagination
- **Position:** Bottom of grid
- **Button:** "Load More Articles" button
- **Function:** Pagination (9 articles per page)
- **Styling:** Outlined or filled button, blue accent
- **Hover:** Color shift, shadow

### Sidebar (Desktop Only)

#### Search Articles Input
- **Placeholder:** "Search articles..."
- **Icon:** Search from lucide-react
- **Styling:** Full width, rounded
- **Functionality:** Real-time search filtering

#### Popular Articles
- **Title:** "Most Read"
- **Layout:** Vertical list
- **Items:** 5-7 most popular articles
- **Design per item:**
  - Ranking number (optional)
  - Article title (linked)
  - View count
- **Font:** Smaller text
- **Hover:** Link color change

#### Category List with Counts
- **Title:** "Browse by Category"
- **Format:** List of category links
- **Count:** Number of articles per category
  - Car Accidents: 12
  - Personal Injury: 8
  - Legal Process: 6
  - Settlement Tips: 5
  - Slip & Fall: 4
  - Legal Advice: 9
  - Medical Malpractice: 3
- **Styling:** Links in blue, count in gray
- **Hover:** Underline or color shift

#### Newsletter Signup
- **Title:** "Stay Updated"
- **Description:** "Get legal tips delivered to your inbox"
- **Email input:** Full width
- **Button:** "Subscribe" button
- **Styling:** Blue button, white text, rounded
- **Validation:** Email format check

#### CTA Card
- **Background:** Blue gradient or accent
- **Icon:** CheckCircle or lightbulb
- **Title:** "Ready to Check Your Claim?"
- **Description:** "Get your free evaluation now"
- **Button:** "Start Now" or similar
- **Link:** To quiz/survey page
- **Design:** Card-like, rounded, shadow

### Responsive Design
- **Mobile:** Single column layout, sidebar below grid
- **Tablet:** 2 column grid, sidebar on right (smaller)
- **Desktop:** 3 column grid, sidebar on right
- **Category filter:** Horizontal scroll on mobile, fixed on desktop

### Data & Functionality
- **Source:** BlogPost entity
- **Filtering:** By status "Published" only
- **Sorting:** By publication date (newest first)
- **Search:** Real-time search through title and excerpt
- **Pagination:** 9 articles per page
- **Category badge colors:** Different for each category
- **Read time calculation:** Auto-calculated based on word count

### Animations
- **Page load:** Fade in cards
- **Skeleton loading:** Pulse animation
- **Hover:** Shadow and scale effects
- **Search:** Fade and filter transitions

---

## Design System

### Color Palette

#### Primary Colors
- **Primary Blue:** `#0285E9` or `#1e90ff`
- **Blue Gradient:** `from-[#4ba8ee] to-[#0486e9]`
- **Light Blue:** `#0C2D5B`

#### Backgrounds
- **Dark Navy:** `#111E30`, `#0F1E35`, `#050B14`
- **Darkest Navy:** `#0A1328`, `#001634`
- **White:** `#FFFFFF`
- **Light Gray:** `#f5f5f5`, `#f9fafb`

#### Text Colors
- **Dark text:** `#0C2D5B`, `#111E30`
- **Gray text:** `#595E64`
- **Light gray:** `#BABBBF`
- **White text:** `#FFFFFF`

#### Accent Colors
- **Success Green:** `#3ab54b`, `#22c55e`
- **Green gradient:** `from-green-50 to-green-100/50`

#### Overlays & Glassmorphism
- **White with opacity:** `bg-white/5`, `bg-white/10`
- **Backdrop blur:** `backdrop-blur-sm`

### Typography

#### Font Families
- **Primary:** Inter (default sans-serif)
- **Display:** Bricolage Grotesque (for large headings)

#### Font Weights
- **Regular:** 400
- **Medium:** 500
- **Semibold:** 600
- **Bold:** 700
- **Extrabold:** 800

#### Font Sizes (Tailwind scale)
- **Headings:** text-2xl to text-7xl (responsive)
- **Body:** text-base to text-lg
- **Small:** text-sm
- **Extra small:** text-xs

### Spacing

#### Padding/Margin scale (Tailwind)
- **Small:** p-2, p-3, p-4 (8px, 12px, 16px)
- **Medium:** p-6, p-8 (24px, 32px)
- **Large:** p-12, p-16 (48px, 64px)
- **Extra large:** p-20, p-24 (80px, 96px)

#### Gap (Between elements)
- **Small:** gap-2, gap-3
- **Medium:** gap-4, gap-6
- **Large:** gap-8, gap-10

### Border Radius

#### Rounded corners
- **Small:** rounded-lg (8px)
- **Medium:** rounded-xl (12px)
- **Large:** rounded-2xl (16px)
- **Extra large:** rounded-3xl (24px)
- **Pill/Full:** rounded-full (9999px)

### Shadow & Depth

#### Box Shadows
- **Small:** shadow-lg
- **Medium:** shadow-xl
- **Large:** shadow-2xl
- **Colored glow:** `shadow-blue-500/20`, `shadow-blue-500/25`, `shadow-blue-500/30`, `shadow-blue-500/40`

### Interactive Elements

#### Buttons
- **Primary button:** Gradient blue, white text, bold
- **Secondary button:** Outlined with border, dark text
- **Hover states:** 
  - Scale: hover:scale-105
  - Shadow: hover:shadow-2xl
  - Color shift: hover:bg-opacity-90
- **Transition:** transition-all duration-300

#### Links
- **Color:** Blue `#0285E9`
- **Hover:** Underline or opacity shift
- **Transition:** Smooth color change

#### Form inputs
- **Background:** White or light gray
- **Border:** 1px solid gray
- **Focus:** Blue border or outline
- **Padding:** py-2 to py-3, px-3 to px-4
- **Border radius:** rounded-lg

### Responsive Breakpoints (Tailwind)
- **Mobile:** Default (0px+)
- **Tablet (sm):** 640px+
- **Tablet (md):** 768px+
- **Desktop (lg):** 1024px+
- **Desktop (xl):** 1280px+
- **Extra large (2xl):** 1536px+

### Animations
- **Fade in:** opacity 0 to 1, 0.3-0.8s
- **Slide in:** y offset or x offset, 0.3-0.8s
- **Scale:** 0.8-1.0 or 1.0-1.05, 0.3-0.8s
- **Pulse:** Continuous animation for live elements
- **Duration:** 200ms, 300ms, 500ms, 700ms, 1000ms
- **Easing:** ease-out, ease-in-out

### Motion & Transitions
- **Standard transition:** transition-all duration-300
- **Hover animations:** group-hover class usage
- **Staggered animations:** delay between elements (0.1s, 0.2s, etc.)
- **Spring animations:** type="spring" for bouncy feel
- **Page transitions:** Fade in on load

### Component Patterns

#### Card Component
- **Background:** White or subtle gray
- **Border radius:** rounded-lg to rounded-3xl
- **Padding:** p-4 to p-12 (responsive)
- **Shadow:** shadow-lg to shadow-2xl
- **Hover:** Subtle scale or shadow increase

#### Section Component
- **Max width:** max-w-7xl for content
- **Padding:** px-4 to px-8 (responsive)
- **Vertical spacing:** py-12 to py-24
- **Margin:** mx-auto for centering

#### Input Component
- **Type:** text, email, tel, etc.
- **Background:** White
- **Border:** 1px gray, focus blue
- **Padding:** py-2 to py-3
- **Border radius:** rounded-lg
- **Width:** Full width in forms

#### CTA Button
- **Background:** Gradient blue
- **Text:** White, bold, centered
- **Padding:** px-6 to px-10, py-3 to py-4
- **Border radius:** rounded-full (pill)
- **Hover:** scale-105, shadow-2xl
- **Icon:** Optional arrow or phone

### Accessibility
- **Contrast:** Sufficient contrast between text and background
- **Focus states:** Visible outline on interactive elements
- **Semantic HTML:** Proper heading hierarchy, button elements
- **Alt text:** All images have descriptive alt text
- **ARIA labels:** Form inputs properly labeled
- **Mobile friendly:** Touch-friendly button sizes (44x44px minimum)

---

## Asset References

### Logo URLs
- **Dark Mode Logo (Primary):** `https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/699c8efa75d8857518d34273/440596289_PrimaryLogo_CheckMyClaim.png`
- **Light Mode Logo:** `https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/699c8efa75d8857518d34273/a32c079ff_DarkMode-PrimaryLogo_CheckMyClaim.png`
- **Alternative Logo:** `https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/699c8efa75d8857518d34273/5fbaf5c73_PrimaryLogo_CheckMyClaim.png`

### Hero Images
- **Family Photo:** `https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/699c27e1ee245bcd8cd77386/c7a33cdfe_1.png`
- **Submitted/Call Image:** `https://media.base44.com/images/public/699c8efa75d8857518d34273/09cab419e_ImportantCall-DesignCMC.png`

### Icon Library
- **Source:** Lucide React (https://lucide.dev/)
- **Common icons:**
  - Navigation: Home, ArrowLeft, ArrowRight, ChevronRight, Menu, X
  - Communication: Phone, Mail, MessageCircle
  - UI: Shield, Lock, AlertCircle, CheckCircle, CheckCircle2, Users, Clock, Calendar, DollarSign
  - Action: Search, Settings, MoreVertical, Edit, Trash2, Copy, Plus
  - Other: Globe, Lightbulb, Sparkles, Zap, TrendingUp, MapPin

### SVG Patterns
- **Subtle pattern overlay:** Custom SVG pattern (tiny dots or crosses)
- **Opacity:** 0.03 for subtlety
- **Usage:** Background pattern on hero sections

---

## Contact & Company Information

### Phone Numbers
- **Main:** (844) 738-1035
- **Alternative:** (844) 840-6905
- **Formatted:** 1-800-CLAIM-CK (alternative)

### Email
- **Support:** help@checkmyclaim.co

### Company Names
- **Legal entity:** NJA-Online LLC
- **Brand name:** Check My Claim

### Office/Mailing Address
- **Location:** [To be filled with actual company address]

---

## Integration & Tracking

### Pixel Tracking
- **Meta/Facebook Pixel:** ID provided, track PageView and Submit events
- **TikTok Pixel:** ID provided, track PageView and Submit events
- **Event ID parameter:** `event_id` from URL query params

### Events Tracked
- **PageView:** On page load
- **Submit:** Form submission
- **DQLead:** Disqualified lead
- **Custom events:** Via tracking scripts

### Phone Number Formatting
- **Class:** `__tc_dni_phone` (for third-party phone number protection)
- **Applied to:** All phone number displays in CTA buttons

---

## Legal Compliance Checklist

- [ ] Privacy Policy page created and linked
- [ ] Terms of Service page created and linked
- [ ] Advertising Disclosure with state-specific language
- [ ] TCPA/Communications consent messaging
- [ ] No Win, No Fee guarantee displayed on all pages
- [ ] Partner transparency (PartnerList, SB-37)
- [ ] California residency disclosures
- [ ] Phone number masking/protection
- [ ] Secure SSL encryption
- [ ] Data protection statements
- [ ] Contact information clearly visible
- [ ] Copyright year and legal disclaimers

---

## Rebuild Instructions

### Core Page Files to Recreate
1. `pages/Home.jsx` - Main landing page with component imports
2. `pages/SurveyPage.jsx` - Survey/quiz flow page
3. `pages/Submitted.jsx` - High-value claim confirmation
4. `pages/Thanks.jsx` - Disqualified lead thank you
5. `pages/Sorry.jsx` - Disqualification message
6. `pages/PrivacyPolicy.jsx` - Privacy policy document
7. `pages/TermsOfService.jsx` - Terms and conditions
8. `pages/AdvertisingDisclosure.jsx` - State disclosures
9. `pages/PartnerList.jsx` - Partner network display
10. `pages/sb-37-list.jsx` - California SB-37 compliance
11. `pages/Blog.jsx` - Blog listing page

### Component Files to Recreate
1. `components/landing/Navbar.jsx` - Top navigation
2. `components/landing/Hero.jsx` - Hero section
3. `components/landing/TrustBanner.jsx` - Stats banner
4. `components/landing/Reviews.jsx` - Testimonials
5. `components/landing/AccidentTypes.jsx` - Accident categories
6. `components/landing/WhoBenefits.jsx` - Persona section
7. `components/landing/Transformation.jsx` - Before/after flow
8. `components/landing/HowItWorks.jsx` - 4-step process
9. `components/landing/USP.jsx` - Unique selling points
10. `components/landing/FightingForYou.jsx` - Trust building
11. `components/landing/NoWinNoFee.jsx` - Guarantee section
12. `components/landing/RecentWins.jsx` - Settlement showcase
13. `components/landing/AboutUs.jsx` - Company information
14. `components/landing/FAQ.jsx` - FAQ accordion
15. `components/landing/Footer.jsx` - Footer component
16. `components/survey/*` - Survey-specific components
17. Additional utility and layout components

### Setup Requirements
- React 18.x
- React Router v6.x
- Tailwind CSS with full config
- Framer Motion for animations
- Lucide React for icons
- TypeScript support (optional but recommended)

---

## Notes for Rebuilding

### Design Philosophy
- Dark theme with white/light cards for content
- Blue gradient accents throughout
- Generous spacing and padding
- Smooth animations and transitions
- Mobile-first responsive design
- Clear hierarchy and visual flow
- Trust-building elements on every page
- Strong CTAs with clear value proposition

### Key Design Patterns
1. **Gradient buttons:** Blue gradients with hover effects
2. **Card-based layout:** White cards on dark or light backgrounds
3. **Staggered animations:** Smooth, sequential element animations
4. **Icon usage:** Lucide React icons for visual consistency
5. **Responsive grid:** Flexible layouts that adapt to screen size
6. **Color coding:** Consistent use of blues, greens, and neutrals
7. **Rounded corners:** Liberal use of rounded borders for modern feel
8. **Shadows:** Subtle shadows for depth and layering

### Implementation Tips
- Use Tailwind utility classes for styling consistency
- Leverage component composition for reusability
- Implement proper responsive breakpoints
- Test animations across devices
- Ensure accessibility compliance
- Optimize images for web
- Use lazy loading for images
- Implement proper error handling
- Create loading states for all async operations
- Add proper focus states for keyboard navigation

---

**Last Updated:** May 2026
**Version:** 2.0 - Complete Design System & Structure