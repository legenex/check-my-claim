# Check My Claim — MVA Pages Documentation

> Full markdown content and CSS design reference for 8 pages: `/submitted`, `/thanks`, `/PartnerList`, `/PrivacyPolicy`, `/TermsOfService`, `/sb-37-list`, `/AdvertisingDisclosure`, `/Home`.

---

# PAGE 1: /submitted (Submitted.jsx)

## Markdown Content

### Header
- **Logo:** Check My Claim
- **Call to Action:** "Prefer to speak to someone right now?" → **(844) 738 1035**

### Main Card

**Image:** "Important Call Incoming!"

**Headline:**
> Congrats! We will be **CALLING YOU**

**Subtext:**
> Based on your answers, it seems you may have a **HIGH VALUE CLAIM!** One of our trusted advisors will call you in the next few minutes to discuss your claim further

**Banner:**
> Please Make Sure To Answer your Phone!

**Note:**
> **PLEASE NOTE:** We cannot proceed with your case without talking to you on the phone and confirming your case details…

### Here's What To Expect Next:

**Step 1: We Will Call You (Next Few Minutes!)**
> One of our trusted advisors will call your phone to verify your details and connect you with the right attorney. **Please answer the call!**

**Step 2: Attorney Review**
> Your matched attorney will review your case details thoroughly.

**Step 3: Case Initiation (No Cost To You)**
> Your attorney starts your case with zero upfront fees - they only get paid when you win.

**Step 4: Settlement & Compensation**
> Your attorney presents settlement options and fights for maximum compensation.

### Don't Wanna Wait?
> Don't Wanna Wait? Click the button below to call now, and fast track your claim..
> **(844) 738 1035**

### NO WIN, NO FEE Guarantee:
> The attorney's guarantee every client that they will not charge you a cent if they do not secure a positive outcome in your case. If you do win, the bulk of the fees are usually paid by the opposing counsel's client, who was responsible for the accident. They will discuss and agree upon the fee breakdown upfront and in detail, so there will be complete transparency and no disappointment once your case is won… That is a guarantee to you!
> **YOU HAVE NOTHING TO LOSE!**

**Button:** Return to Home

**Footer Note:** ✓ 100% Free • ✓ No Obligation • ✓ Your Information is Secure

## CSS Design

```css
/* Page Background */
.page-bg {
  background: linear-gradient(to bottom right, #0C2D5B, #001634, #1B2737);
  min-height: 100vh;
}

/* Header */
.header {
  background: white;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  padding: 1rem;
}
.header-inner {
  max-width: 64rem;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}
.header-logo { height: 2.5rem; }
.header-phone-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(to right, #4ba8ee, #0486e9);
  color: white;
  font-weight: 700;
  padding: 0.625rem 1.25rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  transition: all 0.3s;
}
.header-phone-btn:hover {
  box-shadow: 0 10px 15px rgba(37, 144, 230, 0.25);
  transform: scale(1.05);
}

/* Main Card */
.main-card {
  background: white;
  border-radius: 1.5rem;
  box-shadow: 0 25px 50px rgba(0,0,0,0.25);
  padding: 2rem;
  max-width: 64rem;
}
@media (min-width: 768px) {
  .main-card { padding: 3rem; }
}

/* Hero Image */
.hero-image { max-width: 28rem; margin: 0 auto; }

/* Headline */
.headline {
  color: #0C2D5B;
  font-size: 2.25rem;
  font-weight: 700;
  text-align: center;
}
.headline .highlight { color: #22c55e; }

/* Subtext */
.subtext {
  color: #595E64;
  font-size: 1.125rem;
  text-align: center;
}
.subtext .highlight { color: #22c55e; font-weight: 800; }

/* Banner */
.banner {
  background: linear-gradient(to right, #4ba8ee, #0486e9);
  color: white;
  font-weight: 700;
  text-align: center;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
}

/* Steps Container */
.steps-container {
  background: linear-gradient(to bottom right, rgba(75,168,238,0.1), rgba(4,134,233,0.1));
  border-radius: 1rem;
  padding: 1.5rem;
}
.step-card {
  background: white;
  border-radius: 0.75rem;
  padding: 1.25rem;
  box-shadow: 0 10px 15px rgba(0,0,0,0.1);
  border: 2px solid #0285E9;
}
.step-number {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 9999px;
  background: linear-gradient(to bottom right, #4ba8ee, #0486e9);
  color: white;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* CTA Button */
.cta-btn {
  background: linear-gradient(to right, #4ba8ee, #0486e9);
  color: white;
  font-weight: 700;
  padding: 1rem 2.5rem;
  border-radius: 9999px;
  font-size: 1.125rem;
  transition: all 0.3s;
}
.cta-btn:hover {
  box-shadow: 0 25px 50px rgba(37, 144, 230, 0.4);
  transform: scale(1.05);
}

/* Guarantee Card */
.guarantee-card {
  background: linear-gradient(to bottom right, #f0fdf4, rgba(220,252,231,0.5));
  border-radius: 1rem;
  padding: 1.5rem;
}
.guarantee-headline {
  color: #0285E9;
  font-size: 1.5rem;
  font-weight: 800;
  text-align: center;
}

/* Footer Note */
.footer-note {
  color: rgba(255,255,255,0.6);
  font-size: 0.875rem;
  text-align: center;
}
```

---

# PAGE 2: /thanks (Thanks.jsx)

## Markdown Content

### Header
- **Logo:** Check My Claim
- **Call to Action:** "Prefer to speak to someone right now?" → **(844) 738 1035**

### Main Card

**Success Icon:** CheckCircle (blue gradient circle)

**Heading:**
> Thank You!

**Subheading:**
> We Have Received Your Details!

**Text:**
> One of our trusted advisors will call you in the next few minutes!

**Banner:**
> Please Make Sure To Answer your Phone!

**Note:**
> **PLEASE NOTE:** We cannot proceed with your case without talking to you on the phone and confirming your case details…

### Don't Wanna Wait?
> Don't Wanna Wait? Click the button below to call now, and fast track your claim..
> **(844) 738 1035**

### NO WIN, NO FEE Guarantee:
> The attorney's guarantee every client that they will not charge you a cent if they do not secure a positive outcome in your case. If you do win, the bulk of the fees are usually paid by the opposing counsel's client, who was responsible for the accident. They will discuss and agree upon the fee breakdown upfront and in detail, so there will be complete transparency and no disappointment once your case is won… That is a guarantee to you!
> **YOU HAVE NOTHING TO LOSE!**

**Button:** Back to Home

**Footer Note:** ✓ 100% Free • ✓ No Obligation • ✓ Your Information is Secure

## CSS Design

```css
/* Page Background */
.page-bg {
  background: linear-gradient(to bottom right, #0C2D5B, #001634, #1B2737);
  min-height: 100vh;
}

/* Header (shared with Submitted) */
.header {
  background: white;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  padding: 1rem;
}
.header-phone-btn {
  background: linear-gradient(to right, #4ba8ee, #0486e9);
  color: white;
  border-radius: 9999px;
  font-weight: 700;
  padding: 0.625rem 1.25rem;
}

/* Main Card */
.main-card {
  background: white;
  border-radius: 1.5rem;
  box-shadow: 0 25px 50px rgba(0,0,0,0.25);
  padding: 2rem;
  max-width: 64rem;
}

/* Success Icon */
.success-icon {
  width: 5rem;
  height: 5rem;
  border-radius: 9999px;
  background: linear-gradient(to bottom right, #4ba8ee, #0486e9);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
}

/* Heading */
.heading {
  color: #0C2D5B;
  font-size: 2.25rem;
  font-weight: 800;
  text-align: center;
}

/* Subheading */
.subheading {
  color: #0C2D5B;
  font-size: 1.25rem;
  font-weight: 700;
  text-align: center;
}

/* Body Text */
.body-text {
  color: #595E64;
  font-size: 1.125rem;
  text-align: center;
}

/* Banner */
.banner {
  background: linear-gradient(to right, #4ba8ee, #0486e9);
  color: white;
  font-weight: 700;
  text-align: center;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
}

/* Call CTA Container */
.call-cta {
  background: linear-gradient(to bottom right, rgba(75,168,238,0.1), rgba(4,134,233,0.1));
  border-radius: 1rem;
  padding: 1.5rem;
  text-align: center;
}

/* Call Button */
.call-btn {
  background: linear-gradient(to right, #4ba8ee, #0486e9);
  color: white;
  font-weight: 700;
  font-size: 1.125rem;
  padding: 1rem 2.5rem;
  border-radius: 9999px;
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  transition: all 0.3s;
}
.call-btn:hover {
  box-shadow: 0 25px 50px rgba(37, 144, 230, 0.4);
  transform: scale(1.05);
}

/* Guarantee Card */
.guarantee-card {
  background: linear-gradient(to bottom right, #f0fdf4, rgba(220,252,231,0.5));
  border-radius: 1rem;
  padding: 1.5rem;
}
.guarantee-headline {
  color: #0285E9;
  font-size: 1.5rem;
  font-weight: 800;
  text-align: center;
}

/* Back Button */
.back-btn {
  border: 1px solid #d1d5db;
  color: #0C2D5B;
  font-weight: 600;
  padding: 0.75rem 1.5rem;
  border-radius: 9999px;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s;
}
.back-btn:hover { background: #f9fafb; }

/* Footer Note */
.footer-note {
  color: rgba(255,255,255,0.6);
  font-size: 0.875rem;
  text-align: center;
}
```

---

# PAGE 3: /PartnerList (PartnerList.jsx)

## Markdown Content

### Header
- **Logo:** Check My Claim
- **Call to Action:** "Prefer to speak to someone right now?" → **(844) 738 1035**

### Main Card

**Icon:** Users (blue gradient circle)

**Heading:**
> Our Partners

### Affiliated Partners
- Car Accident Helpline
- Los Defensores
- 4LegalLeads
- 1800TheLaw2
- My Lawsuit Help
- Action Legal
- The Injury Help Network
- Inbounds.com
- Auto Accident Team
- Accident Helpline

### Sponsors
*(Dynamically loaded via Walker Advertising sponsor embed script)*

Sponsors list (static reference):
Adam Birkhold, Al Motlagh, Alan D Daneshrad, Ali A Azarakhsh, Ali Awad, Ali Razavi, Alina Bagasian, Alla Tenina, Ameer Shah, Andrew D Kumar, Andrew Zeytuntsyan, Anthony Choe, Aram Rostomyan, Aren Manukyan, Ari Moss, Arin Khodaverdian, Aron C Movroydis, Artin Sookasian, Ashkan Minaie, Ayesha Rafi, Barry H Hinden, Ben Dominguez II, Benjamin Fogel, Benjamin Khakshour, Bita N Haiem, Bobby B Saadian, Bobby Tamari, Brian Banner, Brian C Mitchell, Cagney McCormick, Cameron Y Brock, Christopher Bragoli, Christopher Culleton, Clifford J Enten, D. Scott Warmuth, Dan Abir, Daniel A Reisman, Daniel Bottari, Daniel J Rafii, Darren Miller, David Benn, David E Jacobson, David F Makkabi, David Krangle, David Kreizer, David L Issapour, David P Bonemeyer, David P Kashani, David Yerushalmi, Derek Lee, Edward Herman, Edward Okwueze, Edward Ramsey, Elliot Zarabi, Eric Mausner, Erik Zograbian, Felicia B Edelman, Fletcher B Brown, Gary Berkovich, Gary K Daglian, Geoffrey P Norton, George Jawlakian, George P Escobedo, George P Hakim, George Salinas, Gerry Hernandez, Gil Alvandi, Goldwater Partner *, Gordon McKernan, Granth J Crhoelman, Gus Anastopoulo, Hagop Chopurian, Harout A Messrelian, Irina Martirosyan, James A Allaire, James Kim, James Onder, James Shaw, James White, Jared S Zafran, Jared Spingarn, Jason B Chalik, Jason Javaheri, Jeffrey Knoll, Jerrold Parker, Jerry Jacobson, Jimmy H Jin, John Brockmeier, John C Ye, John Hong, John Leo, Johnny G Phillips, Jonathan I Rotstein, Jonathan Melmed, Jonathan Yagoubzadeh, Joseph Nazarian, Joseph S Nourmand, Joshua J Zokaeem, Justin Farahi, Justin L Lawrence, Kaveh Elihu, Kenny Habetz, Kevin A Garcia, Kevin Butler, Kevin Danesh, Kevin Jani, Kevin Moore, Khalil Khan, Kian Mottahedeh, Kyle Madison, Law Offices of Larry H Parker, Mahdis Kaeni, Maralle Messrelian, Marc Pacin, Marielys Acosta, Mark Sweet, Martin Arteaga, Matt Koohanim, Matthew Buzzell, Michael Avanesian, Michael Emrani, Michael Fielding, Michael Ghozland, Michael H Kim, Michael Pierce, Michael Saeedian, Michael Steinger, Miguel I Alvarez, Mohammad (Mo) Abuershaid, Nassir N Ebrahimian, Nathaniel Preston, Nilufar Alemozaffar, Omid Razi, Pavel Sterin, Payam Tishbi, Pouya Chami, Ramin Kermani-Nejad, Randal Klezmer, Raphael B Hedwat, Raymond Ghermezian, Ricardo Y Merluza, Rob A Rodriguez, Robert M Pave, Robin Saghian, Robinson S Rowe, Ronald DeSimone, Ronen Kleinman, Rouben Varozian, Ryan Banafshe, Sam Almasri, Samuel Ceballos, Sanam Salimnia Aghnami, Scott Diallo, Scott E Wheeler, Sean Logue, Sean Simpson, Sef Krell, Servando Timbol, Seymone Javaherian, Sharif Alkalbani, Shawn Azizzadeh, Shervin Lalezary, Siamak Vaziri, Stacy Kemp, Stephan Airapetian, Stephen Godwin, Stephen Kwan, Thomas A Cifarelli, Thomas Combs, Thomas G Kemerer, Tigran Martinian, Troy T Otus, Vivian N Szawarc, Yasmin Azimi

### NO WIN, NO FEE Guarantee:
> The attorney's guarantee every client that they will not charge you a cent if they do not secure a positive outcome in your case. If you do win, the bulk of the fees are usually paid by the opposing counsel's client, who was responsible for the accident. They will discuss and agree upon the fee breakdown upfront and in detail, so there will be complete transparency and no disappointment once your case is won… That is a guarantee to you!
> **YOU HAVE NOTHING TO LOSE!**

**Button:** Back to Home

**Footer Note:** ✓ 100% Free • ✓ No Obligation • ✓ Your Information is Secure

## CSS Design

```css
/* Page Background */
.page-bg {
  background: linear-gradient(to bottom right, #0C2D5B, #001634, #1B2737);
  min-height: 100vh;
}

/* Main Card */
.main-card {
  background: white;
  border-radius: 1.5rem;
  box-shadow: 0 25px 50px rgba(0,0,0,0.25);
  padding: 2rem;
  max-width: 64rem;
}

/* Icon Circle */
.icon-circle {
  width: 5rem;
  height: 5rem;
  border-radius: 9999px;
  background: linear-gradient(to bottom right, #4ba8ee, #0486e9);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
}

/* Heading */
.heading {
  color: #0C2D5B;
  font-size: 2.25rem;
  font-weight: 800;
  text-align: center;
}

/* Section Heading */
.section-heading {
  color: #0C2D5B;
  font-size: 1.5rem;
  font-weight: 800;
}

/* Partners Grid */
.partners-grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 1rem;
}
@media (min-width: 640px) { .partners-grid { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 1024px) { .partners-grid { grid-template-columns: repeat(3, 1fr); } }

.partner-card {
  background: linear-gradient(to bottom right, rgba(75,168,238,0.1), rgba(4,134,233,0.1));
  border-radius: 0.75rem;
  padding: 1rem;
  border-left: 4px solid #0285E9;
  transition: box-shadow 0.3s;
}
.partner-card:hover { box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
.partner-name { color: #0C2D5B; font-weight: 600; }

/* Sponsors Widget */
#participants-container {
  display: flex;
  flex-direction: column;
  gap: 0;
}
#participants-container > * {
  padding: 10px 14px;
  border-left: 3px solid #0285E9;
  margin-bottom: 20px;
  background: #f8fafc;
  border-radius: 0 8px 8px 0;
}
#participants-container a {
  font-weight: 700;
  font-size: 15px;
  color: #0C2D5B !important;
  text-decoration: none;
  display: block;
}
#participants-container a:hover { color: #0285E9 !important; }

/* Guarantee Card */
.guarantee-card {
  background: linear-gradient(to bottom right, #f0fdf4, rgba(220,252,231,0.5));
  border-radius: 1rem;
  padding: 1.5rem;
}
.guarantee-headline {
  color: #0285E9;
  font-size: 1.5rem;
  font-weight: 800;
  text-align: center;
}

/* Back Button */
.back-btn {
  border: 1px solid #d1d5db;
  color: #0C2D5B;
  font-weight: 600;
  padding: 0.75rem 1.5rem;
  border-radius: 9999px;
}
```

---

# PAGE 4: /PrivacyPolicy (PrivacyPolicy.jsx)

## Markdown Content

### Header
**Privacy Policy**

> This privacy policy ("Policy") applies to the personal information collected by Next Consulting LLC ("we" or "us") through the checkmyclaim.co website ("Website"). We are committed to protecting your privacy and handling your personal information in accordance with applicable data protection laws.

### Information We Collect

We may collect the following types of personal information from you:

**Contact Information**
> name, email address, phone number, and mailing address.

**Personal Information**
> information related to your accident or injury, including but not limited to the date and location of the accident, the extent of your injuries, and any medical treatment you received.

**Other Information**
> we may also collect other information you provide to us, such as when you submit a question or request through our online contact form.

### How We Use Your Information

We may use your personal information for the following purposes:
- To respond to your inquiries and requests.
- To provide you with information about our services and other relevant information.
- To improve our Website and services.
- To comply with legal and regulatory requirements.

### How We Share Your Information

We may share your personal information with the following parties:

**Our service providers**
> We may share your personal information with third-party service providers that assist us in providing our services.

**Legal requirements**
> We may disclose your personal information to comply with applicable laws, regulations, legal processes, or government requests.

### Your Rights

You have certain rights with respect to your personal information. You have the right to:
- Access your personal information.
- Correct any errors in your personal information.
- Object to the processing of your personal information.
- Delete your personal information.
- Restrict the processing of your personal information.
- Withdraw your consent to the processing of your personal information.

> If you wish to exercise any of these rights, please contact us using the contact information below.

### Security
> We take reasonable measures to protect your personal information from unauthorized access, use, or disclosure. However, we cannot guarantee the security of your personal information.

### Links to Third-Party Websites
> Our Website may contain links to third-party websites. We are not responsible for the privacy practices or content of these third-party websites.

### Changes to the Policy
> We reserve the right to change this Policy at any time. We will notify you of any material changes to this Policy by posting the updated Policy on our Website.

### California Privacy Rights
> If you are a California resident, you have the right to request information about our data practices related to your personal information, including the categories of personal information we have collected, the categories of sources from which we collected your personal information, the business or commercial purposes for collecting your personal information, the categories of third parties with whom we share your personal information, and the specific pieces of personal information we have collected about you.
>
> You also have the right to request that we delete your personal information, subject to certain exceptions under applicable law.
>
> To exercise these rights, please contact us using the contact information below. We will verify your request by asking for information that matches our records and may require additional information to confirm your identity.

### Contact Us
> If you have any questions about this Policy or our privacy practices, or if you would like to exercise your privacy rights, please contact us at:
> help@checkmyclaim.co

### NO WIN, NO FEE Guarantee:
> The attorney's guarantee every client that they will not charge you a cent if they do not secure a positive outcome in your case. If you do win, the bulk of the fees are usually paid by the opposing counsel's client, who was responsible for the accident. They will discuss and agree upon the fee breakdown upfront and in detail, so there will be complete transparency and no disappointment once your case is won… That is a guarantee to you!
> **YOU HAVE NOTHING TO LOSE!**

**Button:** Back to Home
**Footer:** Your privacy is important to us. We will never share your information without your consent.

## CSS Design

```css
/* Page Background */
.page-bg {
  background: linear-gradient(to bottom right, #0a1f3d, #0d2847, #0a1f3d);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  padding-top: 100px;
}

/* Card Container */
.card-container {
  width: 100%;
  max-width: 56rem;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 25px 50px rgba(0,0,0,0.25);
  display: flex;
  flex-direction: column;
  max-height: 85vh;
  height: 85vh;
}

/* Sticky Header */
.sticky-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 1.5rem 2rem;
  border-radius: 1rem 1rem 0 0;
  display: flex;
  align-items: center;
  gap: 1rem;
}
.header-icon-circle {
  width: 3rem;
  height: 3rem;
  border-radius: 9999px;
  background: rgba(2, 133, 233, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}
.header-icon { color: #0285E9; }
.header-title {
  color: #111E30;
  font-size: 1.875rem;
  font-weight: 800;
}

/* Scrollable Content */
.scrollable-content {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem 2rem;
}

/* Prose */
.prose { max-width: none; }
.prose p { color: #595E64; line-height: 1.625; }
.prose h2 {
  color: #111E30;
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
}
.prose h3 {
  color: #111E30;
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}
.prose ul { list-style: disc; padding-left: 1.5rem; color: #595E64; }

/* Email Link */
.email-link {
  color: #0285E9;
  font-weight: 600;
}
.email-link:hover { text-decoration: underline; }

/* Guarantee Card */
.guarantee-card {
  background: linear-gradient(to bottom right, #f0fdf4, rgba(220,252,231,0.5));
  border-radius: 1rem;
  padding: 1.5rem;
}
.guarantee-headline {
  color: #0285E9;
  font-size: 1.5rem;
  font-weight: 800;
  text-align: center;
}

/* Sticky Bottom */
.sticky-bottom {
  position: sticky;
  bottom: 0;
  background: white;
  border-top: 1px solid #e5e7eb;
  padding: 1rem 2rem;
  border-radius: 0 0 1rem 1rem;
}
.back-btn {
  background: #0285E9;
  color: white;
  font-weight: 600;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}
.back-btn:hover { background: #0486e9; }
```

---

# PAGE 5: /TermsOfService (TermsOfService.jsx)

## Markdown Content

### Header
**Terms of Service**

> These Terms and Conditions ("Terms") govern your use of the Check my Claim website (the "Website"), owned and operated by Next Consulting LLC ("we," "us," or "our"). By accessing or using the Website, you agree to be bound by these Terms. If you do not agree with any of the provisions of these Terms, you must not access or use the Website.

### 1. User Responsibilities

**1.1. Eligibility**
> By using the Website, you represent and warrant that you are at least 18 years old and have the legal capacity to enter into these Terms.

**1.2. Account Registration**
> In order to access certain features or services on the Website, you may be required to create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to provide accurate and complete information when creating an account and to promptly update any information that may change.

**1.3. Compliance with Laws**
> You agree to comply with all applicable laws and regulations when using the Website. You acknowledge that it is your responsibility to determine the legality, appropriateness, and suitability of any actions you take on or through the Website.

### 2. Intellectual Property

**2.1. Ownership**
> The Website and all content, materials, and features available on the Website, including but not limited to text, graphics, logos, images, audio clips, video clips, and software, are the property of Next Consulting LLC or its licensors and are protected by applicable intellectual property laws.

**2.2. Limited License**
> Subject to your compliance with these Terms, we grant you a limited, non-exclusive, non-transferable, and revocable license to access and use the Website for personal, non-commercial purposes. You may not reproduce, modify, distribute, sell, lease, create derivative works, or exploit the Website or any content, materials, or features on the Website without our prior written consent.

### 3. Privacy and Data Sharing

**3.1. Privacy Policy**
> Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use, and disclose information about you.

**3.2. Data Sharing**
> By using the Website, you acknowledge and agree that we may share your end user data, including personal information, with third-party service providers such as Twilio and mobile operators. This data sharing is necessary to verify user identities, detect and protect against fraud, and provide you with the services offered on the Website. We will take reasonable measures to ensure that any third parties with whom we share your data comply with applicable data protection laws and protect your information.

### 4. Disclaimers and Limitations of Liability

**4.1. No Legal Advice**
> The information provided on the Website is for general informational purposes only and should not be construed as legal advice. You should consult with a qualified attorney for advice specific to your situation.

**4.2. No Guarantee of Results**
> We do not guarantee any specific results from using the Website or the services provided on the Website. The outcome of any legal matter or claim depends on various factors beyond our control.

**4.3. Limitation of Liability**
> To the maximum extent permitted by law, we shall not be liable for any direct, indirect, incidental, consequential, special, or exemplary damages arising out of or in connection with your use of the Website or reliance on any information provided on the Website. This limitation applies whether the damages are based on contract, tort, negligence, strict liability, or any other legal theory.

### 5. Termination
> We may, in our sole discretion, suspend or terminate your access to the Website at any time without prior notice or liability, for any reason, including if we believe that you have violated these Terms or engaged in any conduct that may harm our reputation or interfere with the operation of the Website.

### 6. Communications Consent
> By submitting your details on any of our forms, you agree to receive calls and/or text messages from Accident Compensation Experts and/or our affiliated partners on the phone number you provided. You acknowledge and agree that your contact information, including the phone number provided, may be shared with third-party verification services, such as Twilio and mobile operators, to verify your identity and detect/protect against fraud. Please note that you may receive communications even if your telephone number is listed on a 'Do Not Contact' list, and your consent is not a requirement of purchase.

### 7. Severability
> If any provision of these Terms is found to be unlawful, void, or unenforceable, the remaining provisions shall remain in full force and effect.

### 8. Governing Law and Jurisdiction
> These Terms shall be governed by and construed in accordance with the laws of the United States of America. Any legal action or proceeding arising out of or related to these Terms or the use of the Website shall be brought exclusively in the courts of the United States of America, and you consent to the jurisdiction of such courts.

### 9. Changes to the Terms
> We reserve the right to modify or update these Terms at any time, without prior notice. Any changes to the Terms will be effective upon posting on the Website. It is your responsibility to review the Terms periodically for any updates or changes. Your continued use of the Website after the posting of any modifications to the Terms constitutes your acceptance of such changes.

### 10. Contact Us
> If you have any questions or concerns regarding these Terms, please contact us at:
> help@checkmyclaim.co

### NO WIN, NO FEE Guarantee:
> The attorney's guarantee every client that they will not charge you a cent if they do not secure a positive outcome in your case. If you do win, the bulk of the fees are usually paid by the opposing counsel's client, who was responsible for the accident. They will discuss and agree upon the fee breakdown upfront and in detail, so there will be complete transparency and no disappointment once your case is won… That is a guarantee to you!
> **YOU HAVE NOTHING TO LOSE!**

**Button:** Back to Home
**Footer:** Your privacy is important to us. We will never share your information without your consent.

## CSS Design

```css
/* Page Background */
.page-bg {
  background: linear-gradient(to bottom right, #0a1f3d, #0d2847, #0a1f3d);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  padding-top: 100px;
}

/* Card Container */
.card-container {
  width: 100%;
  max-width: 56rem;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 25px 50px rgba(0,0,0,0.25);
  display: flex;
  flex-direction: column;
  max-height: 85vh;
  height: 85vh;
}

/* Sticky Header */
.sticky-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 1.5rem 2rem;
  border-radius: 1rem 1rem 0 0;
  display: flex;
  align-items: center;
  gap: 1rem;
}
.header-icon-circle {
  width: 3rem;
  height: 3rem;
  border-radius: 9999px;
  background: rgba(2, 133, 233, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}
.header-title {
  color: #111E30;
  font-size: 1.875rem;
  font-weight: 800;
}

/* Scrollable Content */
.scrollable-content {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem 2rem;
}

/* Prose */
.prose p { color: #595E64; line-height: 1.625; }
.prose h2 {
  color: #111E30;
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
}
.prose h3 {
  color: #111E30;
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

/* Email Link */
.email-link {
  color: #0285E9;
  font-weight: 600;
}
.email-link:hover { text-decoration: underline; }

/* Guarantee Card */
.guarantee-card {
  background: linear-gradient(to bottom right, #f0fdf4, rgba(220,252,231,0.5));
  border-radius: 1rem;
  padding: 1.5rem;
}
.guarantee-headline {
  color: #0285E9;
  font-size: 1.5rem;
  font-weight: 800;
  text-align: center;
}

/* Sticky Bottom */
.sticky-bottom {
  position: sticky;
  bottom: 0;
  background: white;
  border-top: 1px solid #e5e7eb;
  padding: 1rem 2rem;
  border-radius: 0 0 1rem 1rem;
}
.back-btn {
  background: #0285E9;
  color: white;
  font-weight: 600;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}
.back-btn:hover { background: #0486e9; }
```

---

# PAGE 6: /sb-37-list (sb-37-list.jsx)

## Markdown Content

### Header
- **Logo:** Check My Claim
- **Call to Action:** "Prefer to speak to someone right now?" → **(844) 738 1035**

### Main Card

**Icon:** Users (blue gradient circle)

**Heading:**
> Affiliated Participants

### Participants List

**Kevin Danesh**

**The Law Offices of Larry H. Parker**

### NO WIN, NO FEE Guarantee:
> The attorney's guarantee every client that they will not charge you a cent if they do not secure a positive outcome in your case. If you do win, the bulk of the fees are usually paid by the opposing counsel's client, who was responsible for the accident.
>
> They will discuss and agree upon the fee breakdown upfront and in detail, so there will be complete transparency and no disappointment once your case is won… That is a guarantee to you!
> **YOU HAVE NOTHING TO LOSE!**

**Button:** Back to Home

**Footer Note:** ✓ 100% Free • ✓ No Obligation • ✓ Your Information is Secure

## CSS Design

```css
/* Page Background */
.page-bg {
  background: linear-gradient(to bottom right, #0C2D5B, #001634, #1B2737);
  min-height: 100vh;
}

/* Main Card */
.main-card {
  background: white;
  border-radius: 1.5rem;
  box-shadow: 0 25px 50px rgba(0,0,0,0.25);
  padding: 2rem;
  max-width: 64rem;
}

/* Icon Circle */
.icon-circle {
  width: 5rem;
  height: 5rem;
  border-radius: 9999px;
  background: linear-gradient(to bottom right, #4ba8ee, #0486e9);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
}

/* Heading */
.heading {
  color: #0C2D5B;
  font-size: 2.25rem;
  font-weight: 800;
  text-align: center;
}

/* Participants Container */
.participants-container {
  background: linear-gradient(to bottom right, rgba(75,168,238,0.1), rgba(4,134,233,0.1));
  border-radius: 1rem;
  padding: 2rem;
}

.participant-card {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  border-left: 4px solid #0285E9;
}
.participant-name {
  color: #0C2D5B;
  font-size: 1.25rem;
  font-weight: 700;
}

/* Guarantee Card */
.guarantee-card {
  background: linear-gradient(to bottom right, #f0fdf4, rgba(220,252,231,0.5));
  border-radius: 1rem;
  padding: 1.5rem;
}
.guarantee-headline {
  color: #0285E9;
  font-size: 1.5rem;
  font-weight: 800;
  text-align: center;
}

/* Back Button */
.back-btn {
  border: 1px solid #d1d5db;
  color: #0C2D5B;
  font-weight: 600;
  padding: 0.75rem 1.5rem;
  border-radius: 9999px;
}

/* Footer Note */
.footer-note {
  color: rgba(255,255,255,0.6);
  font-size: 0.875rem;
  text-align: center;
}
```

---

# PAGE 7: /AdvertisingDisclosure (AdvertisingDisclosure.jsx)

## Markdown Content

### Header
**Advertising Disclosure**

> checkmyclaim.co is a non-professional legal services agency that connects service providers with consumers to help them live better lives, and when you call our number, you may be directly connected with one of our partners or a third party to assist you. Independent providers of the services may charge fees and have their own terms of service. checkmyclaim.co is not responsible and does not guarantee any outcomes from these providers. Services may not be available in all states, so please call or check our website for details.

> This Agreement contains a binding arbitration agreement, which provides that you and we agree to resolve certain disputes through binding individual arbitration and give up any right to have those disputes decided by a judge or a jury. You have the right to opt out of our agreement to arbitrate. See the Legal Disputes section of this Agreement.

### State Specific Legal Advertising Disclosures

**Alabama**
> UL makes no representation that the quality of the legal services to be performed by it is greater than the quality of the legal services by other lawyers.

**Alaska**
> The Alaska Bar Association does not endorse or accredit certifying organizations.

**Arizona**
> checkmyclaim.co is a website name and not a law firm. The law firms who advertise through this website do not operate as checkmyclaim.co

**California**
> Please note that checkmyclaim.co is an attorney marketing network and is not affiliated with any government agency. checkmyclaim.co does not receive any funding from any government or not-for-profit foundation.

**Colorado**
> checkmyclaim.co is a website name and not a law firm. The law firms who advertise through this website do not operate as checkmyclaim.co.

**Florida**
> The hiring of an attorney is an important decision, and that decision should not be based solely on advertising material. Before you decide to hire counsel to represent you, make sure you ask us or any attorney to send you free written information about the attorney's qualifications and experience.

**Georgia**
> checkmyclaim.co is a website name and not a law firm. The law firms who advertise through this website do not operate as checkmyclaim.co.

**Hawaii**
> The Supreme Court of Hawaii only grants certification to lawyers in good standing who have successfully completed a specialty program accredited by the American Bar Association.

**Illinois**
> The Illinois Supreme Court does not recognize certifications of specialties in the practice of law. A certificate, award, or recognition is not required to practice law in Illinois.

**Indiana**
> checkmyclaim.co is a website name and not a law firm. The law firms who advertise through this website do not operate as checkmyclaim.co.

**Iowa**
> checkmyclaim.co is a website name and not a law firm. The law firms who advertise through this website do not operate as checkmyclaim.co. The Supreme Court of Iowa requires the following disclosure: The choice of a lawyer and the determination of the need for legal assistance are extremely important decisions and should not be based on advertisements or self-proclaimed expertise. Memberships and offices in legal fraternities and legal societies, technical and professional licenses, and memberships in scientific, technical, and professional associations and societies of law or field of practice do not mean that a lawyer is a "specialist" or "expert" in a particular field of law. Such memberships, licenses, or offices also do not necessarily mean that a lawyer is any more expert or competent than any other lawyer. A description of limitation of practice does not mean that any agency or board has certified the lawyer as a specialist or expert in any indicated field of law, nor does it mean that such a lawyer is necessarily any more expert or competent than any other lawyer. The Supreme Court of Iowa requires the following disclosure: All potential clients should make their own independent evaluation and investigation of any lawyer being considered for particular legal representation.

**Kentucky**
> checkmyclaim.co is a website name and not a law firm. The law firms who advertise through this website do not operate as checkmyclaim.co.

**Maine**
> checkmyclaim.co is a website name and not a law firm. The law firms who advertise through this website do not operate as checkmyclaim.co.

**Massachusetts**
> The Commonwealth of Massachusetts does not certify lawyers in any particular field of law. If an attorney in Massachusetts indicates he/she is "certified" in a particular area of law, service, or field by a non-governmental body, the certifying organization is a private organization whose standards for certification are not regulated by the Commonwealth.

**Mississippi**
> checkmyclaim.co is a website name and not a law firm. The law firms who advertise through this website do not operate as checkmyclaim.co. Background information on any Mississippi attorney is available free upon request to that attorney. Mississippi has no procedure for approving, certifying, or designating organizations and authorities.

**Missouri**
> ADVERTISING MATERIAL: COMMERCIAL SOLICITATIONS ARE PERMITTED BY THE MISSOURI RULES OF PROFESSIONAL CONDUCT, BUT ARE NEITHER SUBMITTED NOR APPROVED BY THE MISSOURI BAR OR THE SUPREME COURT OF MISSOURI. Likewise, neither the Supreme Court nor the Missouri Bar reviews or approves certifying organizations or specialist designations in the field of law.

**Nevada**
> checkmyclaim.co is a website name and not a law firm. The law firms who advertise through this website do not operate as checkmyclaim.co. Neither the State Bar of Nevada nor any agency of the State Bar has certified any lawyer identified in this advertisement as a specialist or expert, except as indicated. Anyone considering hiring an attorney should independently investigate the lawyer's qualifications, credentials, and ability.

**New Jersey**
> checkmyclaim.co is a website name and not a law firm. The law firms who advertise through this website do not operate as checkmyclaim.co. The Supreme Court of New Jersey recognizes certifications in some areas of legal practice. If a lawyer claims certification as a specialist or expert in a field of law or practice and does not specifically indicate that such certification has been granted by the Supreme Court of New Jersey or by an organization approved by the American Bar Association, then the user should understand that the claimed certification body has either not been approved or been denied certification by the Supreme Court of New Jersey and the American Bar Association.

**New Mexico**
> Any certification by an organization other than the New Mexico Board of Legal Specialization does not constitute recognition by the New Mexico Board of Legal Specialization unless the lawyer is also recognized by the board as a specialist in that particular area of law.

**New York**
> checkmyclaim.co is a website name and not a law firm. The law firms who advertise through this website do not operate as checkmyclaim.co.

**Rhode Island**
> The Rhode Island Supreme Court licenses all lawyers in the general practice of law. The Court does not license or certify any lawyer as an expert or specialist in any field of practice of law.

**Tennessee**
> Tennessee recognizes Certifications of Specialization in the following areas of practice of law: Civil Trial, Criminal Trial, Business Bankruptcy, Consumer Bankruptcy, Creditor's Rights, Medical Malpractice, Legal Malpractice, Accounting Malpractice, Elder Law, Estate Planning, and Family Law. Listing of related or included practice areas by a lawyer does not constitute or imply a representation of certification of specialization. No attorneys listed on this site imply or represent that they hold a certificate of specialization other than where specifically indicated.

**Texas**
> checkmyclaim.co is a website name and not a law firm. The law firms who advertise through this website do not operate as checkmyclaim.co. Lawyers named on this site are not certified by the Texas Board of Legal Specialization unless otherwise specifically indicated.

**Washington**
> The Supreme Court of Washington does not recognize certification of specialties in the practice of law. Any such certificate, award, or recognition is not required to practice law in the State of Washington.

**Wyoming**
> The State Bar of the State of Wyoming does not certify any lawyer as a specialist or expert. Any person considering a lawyer for representation should independently investigate the lawyer's credentials, qualifications, and ability and should not rely on advertisements or self-proclaimed expertise.

### NO WIN, NO FEE Guarantee:
> The attorney's guarantee every client that they will not charge you a cent if they do not secure a positive outcome in your case. If you do win, the bulk of the fees are usually paid by the opposing counsel's client, who was responsible for the accident. They will discuss and agree upon the fee breakdown upfront and in detail, so there will be complete transparency and no disappointment once your case is won… That is a guarantee to you!
> **YOU HAVE NOTHING TO LOSE!**

**Button:** Back to Home
**Footer:** Your privacy is important to us. We will never share your information without your consent.

## CSS Design

```css
/* Page Background */
.page-bg {
  background: linear-gradient(to bottom right, #0a1f3d, #0d2847, #0a1f3d);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  padding-top: 100px;
}

/* Card Container */
.card-container {
  width: 100%;
  max-width: 56rem;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 25px 50px rgba(0,0,0,0.25);
  display: flex;
  flex-direction: column;
  max-height: 85vh;
  height: 85vh;
}

/* Sticky Header */
.sticky-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 1.5rem 2rem;
  border-radius: 1rem 1rem 0 0;
  display: flex;
  align-items: center;
  gap: 1rem;
}
.header-icon-circle {
  width: 3rem;
  height: 3rem;
  border-radius: 9999px;
  background: rgba(2, 133, 233, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}
.header-title {
  color: #111E30;
  font-size: 1.875rem;
  font-weight: 800;
}

/* Scrollable Content */
.scrollable-content {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem 2rem;
}

/* Prose */
.prose p { color: #595E64; line-height: 1.625; }
.prose h2 {
  color: #111E30;
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
}

/* State Disclosure Cards */
.state-disclosure {
  border-left: 4px solid #0285E9;
  background: #f9fafb;
  border-radius: 0.5rem;
  padding: 1rem;
}
.state-name {
  color: #111E30;
  font-size: 1.125rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}
.state-text {
  color: #595E64;
  font-size: 0.875rem;
  line-height: 1.625;
}

/* Guarantee Card */
.guarantee-card {
  background: linear-gradient(to bottom right, #f0fdf4, rgba(220,252,231,0.5));
  border-radius: 1rem;
  padding: 1.5rem;
}
.guarantee-headline {
  color: #0285E9;
  font-size: 1.5rem;
  font-weight: 800;
  text-align: center;
}

/* Sticky Bottom */
.sticky-bottom {
  position: sticky;
  bottom: 0;
  background: white;
  border-top: 1px solid #e5e7eb;
  padding: 1rem 2rem;
  border-radius: 0 0 1rem 1rem;
}
.back-btn {
  background: #0285E9;
  color: white;
  font-weight: 600;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}
.back-btn:hover { background: #0486e9; }
```

---

# PAGE 8: /Home (Home.jsx)

## Markdown Content

### Navbar
- **Logo:** Check My Claim
- **Links:** Home | Services | About Us | FAQ | Contact Us
- **CTA Button:** Start Your Free Claim Check

### Hero Section
**Badge:** 🛡️ 100% Free • No Win, No Fee • Fast Results

**Headline:**
> Check Your Claim, **Get What You Deserve**

**Subheading:**
> Unsure if you have a case after an accident? Our AI tool instantly checks if you may qualify for compensation and matches you with the best-suited attorney, at no upfront cost.

**CTA:** Start Your Free Claim Check
**Note:** Takes less than 2 minutes

**Trust Pills:**
- 🛡️ Vetted Attorneys Only
- 💰 No Upfront Fees
- ⏱️ Results in Minutes

### Trust Banner
100% FREE • NO WIN, NO FEE • FAST RESULTS • VETTED ATTORNEYS

### Reviews
*(Customer reviews section)*

### Accident Types
*(Types of accidents covered)*

### Who Benefits
*(Who can benefit from the service)*

### Transformation
*(Before/after transformation stories)*

### How It Works — Our Simple 3-Step Process
> Getting help after an accident shouldn't be hard. Here's how Check My Claim works:

**Step 1: Complete Our Free Eligibility Check**
> Answer a few quick questions about your accident. This service is 100% free with no obligations.

**Step 2: Get Your Results Instantly**
> Our AI-powered tool analyzes your information to determine if you might qualify for compensation.

**Step 3: We Connect You to a Vetted Attorney**
> If eligible, we'll match you with a trusted attorney from our network who works on a no win, no fee basis. From there, the attorney takes over your case.

**CTA:** Start Your Free Survey Now

### USP (Unique Selling Points)
*(Key differentiators)*

### Fighting For You
*(Advocacy messaging)*

### No Win, No Fee — Our Attorneys Don't Get Paid Unless You Do
**Badge:** 🛡️ OUR GUARANTEE

**Headline:**
> Our Attorneys Don't Get Paid Unless You Do

**Subheadline:**
> THE NO WIN, NO FEE GUARANTEE

**Body:**
> Check My Claim connects you with vetted attorneys in our network who work on a "no win, no fee" basis. This means the attorneys we match you with will not charge you a cent if they do not secure a positive outcome in your case. Our role is simple: we provide a free eligibility check and connect you with the right legal professional.

**Bullets:**
- Free claim eligibility check, always 100% free
- Connected to attorneys who work on contingency
- Attorneys only get paid if you win your case
- No upfront costs or surprise bills from matched attorneys

**Highlight:**
> YOU HAVE NOTHING TO LOSE!

**CTA:** Start Your Free Claim Check

### Recent Wins
*(Recent settlement wins showcase)*

### About Us
*(Company about section)*

### FAQ
*(Frequently asked questions)*

### Footer
**Brand:**
> Empowering accident victims with free, AI-powered claim checks and connections to top-rated attorneys. No win, no fee.

**Quick Links:** Home | About Us | Services | FAQ

**Contact:**
- ✉️ support@checkmyclaim.com
- 📞 (844) 738 1035

**Legal:**
> © Check My Claim. All rights reserved.
> Check My Claim is not a law firm and does not provide legal advice. Results from the AI tool are for informational purposes only and do not guarantee compensation.

**Links:** Privacy Policy | Terms & Conditions | Advertising Disclosure

## CSS Design

```css
/* Page Background */
.page-bg {
  background: white;
  min-height: 100vh;
  overflow-x: hidden;
}

/* Navbar */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
  background: white;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}
.navbar-inner {
  max-width: 80rem;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 5rem;
}
@media (min-width: 768px) { .navbar-inner { height: 6rem; padding: 0 2rem; } }
.navbar-logo { height: 2.5rem; }
@media (min-width: 768px) { .navbar-logo { height: 3.5rem; } }
.nav-link {
  font-size: 0.875rem;
  font-weight: 500;
  color: #111E30;
  transition: color 0.3s;
}
.nav-link:hover { color: #0285E9; }
.nav-cta {
  background: linear-gradient(to right, #4ba8ee, #0486e9);
  color: white;
  font-size: 0.875rem;
  font-weight: 600;
  padding: 0.625rem 1.25rem;
  border-radius: 9999px;
  transition: all 0.3s;
}
.nav-cta:hover {
  box-shadow: 0 10px 15px rgba(37, 144, 230, 0.25);
  transform: scale(1.05);
}

/* Hero */
.hero {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  overflow: hidden;
}
.hero-bg-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom right, rgba(17,30,48,0.95), rgba(17,30,48,0.90), rgba(12,26,42,0.95));
}
.hero-content {
  position: relative;
  max-width: 80rem;
  margin: 0 auto;
  padding: 6rem 1rem 4rem;
  text-align: center;
}
.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255,255,255,0.1);
  backdrop-filter: blur(4px);
  color: #0285E9;
  font-size: 0.875rem;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  border: 1px solid rgba(2,133,233,0.2);
  margin-bottom: 2rem;
}
.hero-headline {
  color: white;
  font-size: 2.25rem;
  font-weight: 800;
  line-height: 1.08;
  letter-spacing: -0.025em;
  margin-bottom: 1.5rem;
}
@media (min-width: 768px) { .hero-headline { font-size: 4.5rem; } }
.hero-headline .gradient {
  background: linear-gradient(to right, #4ba8ee, #0486e9);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.hero-sub {
  color: #d1d5db;
  font-size: 1.125rem;
  line-height: 1.625;
  margin-bottom: 2.5rem;
  max-width: 42rem;
  margin-left: auto;
  margin-right: auto;
}
@media (min-width: 768px) { .hero-sub { font-size: 1.25rem; } }
.hero-cta {
  background: linear-gradient(to right, #4ba8ee, #0486e9);
  color: white;
  font-weight: 700;
  font-size: 1.125rem;
  padding: 1rem 2rem;
  border-radius: 9999px;
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  transition: all 0.3s;
}
.hero-cta:hover {
  box-shadow: 0 25px 50px rgba(37, 144, 230, 0.3);
  transform: scale(1.05);
}

/* Trust Pills */
.trust-pills {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  max-width: 42rem;
  margin: 1rem auto 0;
}
@media (min-width: 640px) { .trust-pills { grid-template-columns: repeat(3, 1fr); } }
.trust-pill {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.625rem;
  background: rgba(255,255,255,0.05);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 0.75rem;
  padding: 0.75rem 1rem;
}
.trust-pill-icon { color: #0285E9; }
.trust-pill-label { color: rgba(255,255,255,0.8); font-size: 0.875rem; font-weight: 500; }

/* Trust Banner */
.trust-banner {
  background: linear-gradient(to right, #4ba8ee, #0486e9);
  padding: 1.25rem 1rem;
}
.trust-banner-inner {
  max-width: 80rem;
  margin: 0 auto;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 0.5rem 2rem;
}
.trust-banner-item {
  color: white;
  font-weight: 800;
  font-size: 0.875rem;
  letter-spacing: 0.15em;
}
@media (min-width: 768px) { .trust-banner-item { font-size: 1rem; } }
.trust-banner-dot {
  width: 0.375rem;
  height: 0.375rem;
  border-radius: 9999px;
  background: rgba(255,255,255,0.6);
}

/* How It Works */
.how-it-works {
  padding: 5rem 1rem;
  background: white;
}
@media (min-width: 768px) { .how-it-works { padding: 7rem 1rem; } }
.how-it-works-title {
  color: #111E30;
  font-size: 2rem;
  font-weight: 800;
  text-align: center;
  margin-bottom: 1rem;
}
@media (min-width: 768px) { .how-it-works-title { font-size: 3rem; } }
.how-it-works-sub {
  color: #595E64;
  font-size: 1.125rem;
  text-align: center;
  max-width: 42rem;
  margin: 0 auto;
}
.steps-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  max-width: 64rem;
  margin: 0 auto;
}
@media (min-width: 768px) { .steps-grid { grid-template-columns: repeat(3, 1fr); } }
.step-icon-box {
  width: 4rem;
  height: 4rem;
  margin: 0 auto 1.5rem;
  border-radius: 1rem;
  background: linear-gradient(to bottom right, #4ba8ee, #0486e9);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 15px rgba(37, 144, 230, 0.2);
}
.step-label {
  color: #0285E9;
  font-weight: 700;
  font-size: 0.875rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}
.step-title {
  color: #111E30;
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0.5rem 0 0.75rem;
}
.step-desc { color: #595E64; line-height: 1.625; }

/* No Win No Fee */
.no-win-no-fee {
  padding: 5rem 1rem;
  background: white;
  position: relative;
  overflow: hidden;
}
@media (min-width: 768px) { .no-win-no-fee { padding: 7rem 1rem; } }
.nwnf-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 4rem;
  align-items: center;
  max-width: 80rem;
  margin: 0 auto;
}
@media (min-width: 1024px) { .nwnf-grid { grid-template-columns: repeat(2, 1fr); } }
.nwnf-image-wrap {
  position: relative;
  border-radius: 1.5rem;
  overflow: hidden;
  box-shadow: 0 25px 50px rgba(0,0,0,0.25);
}
.nwnf-image { width: 100%; height: 100%; object-fit: cover; }
.nwnf-image-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(17,30,48,0.6), transparent);
}
.nwnf-badge {
  position: absolute;
  bottom: -1.5rem;
  right: -1.5rem;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 25px 50px rgba(0,0,0,0.25);
  padding: 1rem 1.5rem;
  border: 4px solid #111E30;
}
.nwnf-badge-title { color: #111E30; font-weight: 800; font-size: 1.25rem; }
.nwnf-badge-sub { color: #111E30; font-size: 0.75rem; }
.nwnf-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(2,133,233,0.2);
  color: #0285E9;
  font-weight: 700;
  font-size: 0.875rem;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  margin-bottom: 1.5rem;
}
.nwnf-headline {
  color: #111E30;
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 1.5rem;
  line-height: 1.2;
}
@media (min-width: 768px) { .nwnf-headline { font-size: 3rem; } }
.nwnf-subhead {
  color: #111E30;
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
}
.nwnf-body { color: #595E64; line-height: 1.625; margin-bottom: 2rem; }
.nwnf-bullet {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}
.nwnf-bullet-icon {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 9999px;
  background: linear-gradient(to bottom right, #4ba8ee, #0486e9);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.nwnf-bullet-text { color: #111E30; font-weight: 500; }
.nwnf-highlight-box {
  background: rgba(2,133,233,0.1);
  border: 1px solid rgba(2,133,233,0.3);
  border-radius: 1rem;
  padding: 1.5rem;
  margin-bottom: 2rem;
}
.nwnf-highlight {
  color: #0285E9;
  font-size: 1.5rem;
  font-weight: 800;
  text-align: center;
}

/* Footer */
.footer {
  background: #111E30;
  position: relative;
  overflow: hidden;
}
.footer-inner {
  max-width: 80rem;
  margin: 0 auto;
  padding: 3rem 1rem;
}
@media (min-width: 768px) { .footer-inner { padding: 4rem 2rem; } }
.footer-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2.5rem;
}
@media (min-width: 768px) { .footer-grid { grid-template-columns: repeat(3, 1fr); } }
.footer-brand-text {
  color: #9ca3af;
  font-size: 0.875rem;
  line-height: 1.625;
}
.footer-heading {
  color: white;
  font-weight: 600;
  margin-bottom: 1rem;
}
.footer-link {
  color: #9ca3af;
  font-size: 0.875rem;
  transition: color 0.3s;
}
.footer-link:hover { color: #0285E9; }
.footer-contact {
  color: #9ca3af;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.footer-contact-icon { color: #0285E9; }
.footer-divider {
  border-top: 1px solid rgba(255,255,255,0.1);
  margin-top: 2.5rem;
  padding-top: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}
@media (min-width: 768px) { .footer-divider { flex-direction: row; } }
.footer-copyright { color: #6b7280; font-size: 0.875rem; }
.footer-disclaimer {
  color: #6b7280;
  font-size: 0.75rem;
  max-width: 32rem;
  text-align: center;
}
@media (min-width: 768px) { .footer-disclaimer { text-align: right; } }
.footer-legal-link {
  color: #0285E9;
  font-size: 0.875rem;
  font-weight: 500;
  white-space: nowrap;
}
.footer-legal-link:hover { text-decoration: underline; }
```

---

## Shared Design Tokens

### Color Palette
| Token | Hex | Usage |
|-------|-----|-------|
| Navy Dark | `#0C2D5B` | Headlines, dark backgrounds |
| Navy Deep | `#001634` | Gradient mid-point |
| Navy Slate | `#1B2737` | Gradient end-point |
| Navy Body | `#111E30` | Body text on light, footer bg |
| Blue Primary | `#0285E9` | Links, accents, icons |
| Blue Light | `#4ba8ee` | Gradient start |
| Blue Mid | `#0486e9` | Gradient end |
| Gray Body | `#595E64` | Body text |
| Green | `#22c55e` | Success highlights |
| Green Light | `#f0fdf4` | Guarantee card bg |
| White | `#ffffff` | Card backgrounds |

### Typography
- **Headings:** Extrabold (800), tight tracking
- **Body:** Regular, relaxed leading (1.625)
- **Buttons:** Bold (700)
- **Eyebrows/Labels:** Uppercase, wide tracking (0.15em)

### Shared Components
- **Gradient Buttons:** `linear-gradient(to right, #4ba8ee, #0486e9)`, pill-shaped, scale on hover
- **Icon Circles:** 5rem diameter, gradient fill, centered icon
- **Guarantee Cards:** Green gradient bg, rounded, centered headline
- **Cards:** White bg, `rounded-3xl` (1.5rem), heavy shadow