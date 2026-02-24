import React from "react";
import { FileText, ArrowLeft, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import LandingFooter from "@/components/landing/Footer";
import PageFooter from "@/components/Footer";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1f3d] via-[#0d2847] to-[#0a1f3d] flex items-center justify-center p-4 overflow-hidden">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl flex flex-col" style={{ maxHeight: '70vh', height: '70vh' }}>
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 md:px-8 py-6 rounded-t-2xl flex items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#0285E9]/10">
            <FileText className="w-6 h-6 text-[#0285E9]" />
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#111E30]">
            Terms of Service
          </h1>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 md:px-8 py-6 pb-4">
          <div className="prose prose-slate max-w-none">
          <p className="text-[#595E64] mb-6 leading-relaxed">
            These Terms and Conditions ("Terms") govern your use of the Check my Claim website (the "Website"), owned and operated by NJA-Online LLC ("we," "us," or "our"). By accessing or using the Website, you agree to be bound by these Terms. If you do not agree with any of the provisions of these Terms, you must not access or use the Website.
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-[#111E30] mb-4">1. User Responsibilities</h2>
            
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-[#111E30] mb-2">1.1. Eligibility</h3>
              <p className="text-[#595E64] leading-relaxed">
                By using the Website, you represent and warrant that you are at least 18 years old and have the legal capacity to enter into these Terms.
              </p>
            </div>

            <div className="mb-4">
              <h3 className="text-lg font-semibold text-[#111E30] mb-2">1.2. Account Registration</h3>
              <p className="text-[#595E64] leading-relaxed">
                In order to access certain features or services on the Website, you may be required to create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to provide accurate and complete information when creating an account and to promptly update any information that may change.
              </p>
            </div>

            <div className="mb-4">
              <h3 className="text-lg font-semibold text-[#111E30] mb-2">1.3. Compliance with Laws</h3>
              <p className="text-[#595E64] leading-relaxed">
                You agree to comply with all applicable laws and regulations when using the Website. You acknowledge that it is your responsibility to determine the legality, appropriateness, and suitability of any actions you take on or through the Website.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-[#111E30] mb-4">2. Intellectual Property</h2>
            
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-[#111E30] mb-2">2.1. Ownership</h3>
              <p className="text-[#595E64] leading-relaxed">
                The Website and all content, materials, and features available on the Website, including but not limited to text, graphics, logos, images, audio clips, video clips, and software, are the property of NJA-Online LLC or its licensors and are protected by applicable intellectual property laws.
              </p>
            </div>

            <div className="mb-4">
              <h3 className="text-lg font-semibold text-[#111E30] mb-2">2.2. Limited License</h3>
              <p className="text-[#595E64] leading-relaxed">
                Subject to your compliance with these Terms, we grant you a limited, non-exclusive, non-transferable, and revocable license to access and use the Website for personal, non-commercial purposes. You may not reproduce, modify, distribute, sell, lease, create derivative works, or exploit the Website or any content, materials, or features on the Website without our prior written consent.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-[#111E30] mb-4">3. Privacy and Data Sharing</h2>
            
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-[#111E30] mb-2">3.1. Privacy Policy</h3>
              <p className="text-[#595E64] leading-relaxed">
                Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use, and disclose information about you.
              </p>
            </div>

            <div className="mb-4">
              <h3 className="text-lg font-semibold text-[#111E30] mb-2">3.2. Data Sharing</h3>
              <p className="text-[#595E64] leading-relaxed">
                By using the Website, you acknowledge and agree that we may share your end user data, including personal information, with third-party service providers such as Twilio and mobile operators. This data sharing is necessary to verify user identities, detect and protect against fraud, and provide you with the services offered on the Website. We will take reasonable measures to ensure that any third parties with whom we share your data comply with applicable data protection laws and protect your information.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-[#111E30] mb-4">4. Disclaimers and Limitations of Liability</h2>
            
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-[#111E30] mb-2">4.1. No Legal Advice</h3>
              <p className="text-[#595E64] leading-relaxed">
                The information provided on the Website is for general informational purposes only and should not be construed as legal advice. You should consult with a qualified attorney for advice specific to your situation.
              </p>
            </div>

            <div className="mb-4">
              <h3 className="text-lg font-semibold text-[#111E30] mb-2">4.2. No Guarantee of Results</h3>
              <p className="text-[#595E64] leading-relaxed">
                We do not guarantee any specific results from using the Website or the services provided on the Website. The outcome of any legal matter or claim depends on various factors beyond our control.
              </p>
            </div>

            <div className="mb-4">
              <h3 className="text-lg font-semibold text-[#111E30] mb-2">4.3. Limitation of Liability</h3>
              <p className="text-[#595E64] leading-relaxed">
                To the maximum extent permitted by law, we shall not be liable for any direct, indirect, incidental, consequential, special, or exemplary damages arising out of or in connection with your use of the Website or reliance on any information provided on the Website. This limitation applies whether the damages are based on contract, tort, negligence, strict liability, or any other legal theory.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-[#111E30] mb-4">5. Termination</h2>
            <p className="text-[#595E64] leading-relaxed">
              We may, in our sole discretion, suspend or terminate your access to the Website at any time without prior notice or liability, for any reason, including if we believe that you have violated these Terms or engaged in any conduct that may harm our reputation or interfere with the operation of the Website.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-[#111E30] mb-4">6. Communications Consent</h2>
            <p className="text-[#595E64] leading-relaxed">
              By submitting your details on any of our forms, you agree to receive calls and/or text messages from Accident Compensation Experts and/or our affiliated partners on the phone number you provided. You acknowledge and agree that your contact information, including the phone number provided, may be shared with third-party verification services, such as Twilio and mobile operators, to verify your identity and detect/protect against fraud. Please note that you may receive communications even if your telephone number is listed on a 'Do Not Contact' list, and your consent is not a requirement of purchase.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-[#111E30] mb-4">7. Severability</h2>
            <p className="text-[#595E64] leading-relaxed">
              If any provision of these Terms is found to be unlawful, void, or unenforceable, the remaining provisions shall remain in full force and effect.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-[#111E30] mb-4">8. Governing Law and Jurisdiction</h2>
            <p className="text-[#595E64] leading-relaxed">
              These Terms shall be governed by and construed in accordance with the laws of the United States of America. Any legal action or proceeding arising out of or related to these Terms or the use of the Website shall be brought exclusively in the courts of the United States of America, and you consent to the jurisdiction of such courts.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-[#111E30] mb-4">9. Changes to the Terms</h2>
            <p className="text-[#595E64] leading-relaxed">
              We reserve the right to modify or update these Terms at any time, without prior notice. Any changes to the Terms will be effective upon posting on the Website. It is your responsibility to review the Terms periodically for any updates or changes. Your continued use of the Website after the posting of any modifications to the Terms constitutes your acceptance of such changes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-[#111E30] mb-4">10. Contact Us</h2>
            <p className="text-[#595E64] leading-relaxed">
              If you have any questions or concerns regarding these Terms, please contact us at Check my Claim.
            </p>
          </section>

          <div className="bg-[#0285E9]/10 border-l-4 border-[#0285E9] p-6 rounded-lg mb-8">
            <p className="text-[#595E64] leading-relaxed mb-4">
              By accessing or using the Website, you acknowledge that you have read, understood, and agreed to these Terms.
            </p>
          </div>

          {/* NO WIN NO FEE Guarantee Card */}
          <div className="bg-gradient-to-br from-[#0285E9] to-[#0486e9] rounded-xl p-6 shadow-lg mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">NO WIN, NO FEE Guarantee</h2>
            </div>
            <p className="text-white/90 leading-relaxed">
              The attorney's guarantee every client that they will not charge you a cent if they do not secure a positive outcome in your case. If you do win, the bulk of the fees are usually paid by the opposing counsel's client, who was responsible for the accident. They will discuss and agree upon the fee breakdown upfront and in detail, so there will be complete transparency and no disappointment once your case is won… That is a guarantee to you! YOU HAVE NOTHING TO LOSE!
            </p>
          </div>
          </div>
        </div>

        {/* Sticky Bottom Section */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 md:px-8 py-4 rounded-b-2xl">
          <Link 
            to={createPageUrl("Home")}
            className="inline-flex items-center gap-2 bg-[#0285E9] hover:bg-[#0486e9] text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-200 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>

          <div className="flex flex-col items-center gap-3">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/699c8efa75d8857518d34273/checkmyclaim-logo.png" 
              alt="Check My Claim Logo" 
              className="h-10"
            />
            <p className="text-[#595E64] text-sm text-center">
              Your privacy is important to us. We will never share your information without your consent.
            </p>
          </div>
        </div>
      </div>
      
      <LandingFooter />
      <PageFooter />
    </div>
  );
}