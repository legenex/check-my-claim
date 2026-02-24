import React from "react";
import { Shield, ArrowLeft, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1f3d] via-[#0d2847] to-[#0a1f3d] flex items-center justify-center p-4 overflow-hidden">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl flex flex-col" style={{ maxHeight: '70vh', height: '70vh' }}>
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 md:px-8 py-6 rounded-t-2xl flex items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#0285E9]/10">
            <FileText className="w-6 h-6 text-[#0285E9]" />
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#111E30]">
            Privacy Policy
          </h1>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 md:px-8 py-6 pb-4">
          <div className="prose prose-slate max-w-none">
          <p className="text-[#595E64] mb-6 leading-relaxed">
            This privacy policy ("Policy") applies to the personal information collected by NJA-Online LLC ("we" or "us") through the checkmyclaim.co website ("Website"). We are committed to protecting your privacy and handling your personal information in accordance with applicable data protection laws.
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-[#111E30] mb-4">Information We Collect</h2>
            <p className="text-[#595E64] leading-relaxed mb-4">
              We may collect the following types of personal information from you:
            </p>
            
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-[#111E30] mb-2">Contact Information</h3>
              <p className="text-[#595E64] leading-relaxed">
                name, email address, phone number, and mailing address.
              </p>
            </div>

            <div className="mb-4">
              <h3 className="text-lg font-semibold text-[#111E30] mb-2">Personal Information</h3>
              <p className="text-[#595E64] leading-relaxed">
                information related to your accident or injury, including but not limited to the date and location of the accident, the extent of your injuries, and any medical treatment you received.
              </p>
            </div>

            <div className="mb-4">
              <h3 className="text-lg font-semibold text-[#111E30] mb-2">Other Information</h3>
              <p className="text-[#595E64] leading-relaxed">
                we may also collect other information you provide to us, such as when you submit a question or request through our online contact form.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-[#111E30] mb-4">How We Use Your Information</h2>
            <p className="text-[#595E64] leading-relaxed mb-4">
              We may use your personal information for the following purposes:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-[#595E64]">
              <li>To respond to your inquiries and requests.</li>
              <li>To provide you with information about our services and other relevant information.</li>
              <li>To improve our Website and services.</li>
              <li>To comply with legal and regulatory requirements.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-[#111E30] mb-4">How We Share Your Information</h2>
            <p className="text-[#595E64] leading-relaxed mb-4">
              We may share your personal information with the following parties:
            </p>
            
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-[#111E30] mb-2">Our service providers</h3>
              <p className="text-[#595E64] leading-relaxed">
                We may share your personal information with third-party service providers that assist us in providing our services.
              </p>
            </div>

            <div className="mb-4">
              <h3 className="text-lg font-semibold text-[#111E30] mb-2">Legal requirements</h3>
              <p className="text-[#595E64] leading-relaxed">
                We may disclose your personal information to comply with applicable laws, regulations, legal processes, or government requests.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-[#111E30] mb-4">Your Rights</h2>
            <p className="text-[#595E64] leading-relaxed mb-4">
              You have certain rights with respect to your personal information. You have the right to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-[#595E64]">
              <li>Access your personal information.</li>
              <li>Correct any errors in your personal information.</li>
              <li>Object to the processing of your personal information.</li>
              <li>Delete your personal information.</li>
              <li>Restrict the processing of your personal information.</li>
              <li>Withdraw your consent to the processing of your personal information.</li>
            </ul>
            <p className="text-[#595E64] leading-relaxed mt-4">
              If you wish to exercise any of these rights, please contact us using the contact information below.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-[#111E30] mb-4">Security</h2>
            <p className="text-[#595E64] leading-relaxed">
              We take reasonable measures to protect your personal information from unauthorized access, use, or disclosure. However, we cannot guarantee the security of your personal information.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-[#111E30] mb-4">Links to Third-Party Websites</h2>
            <p className="text-[#595E64] leading-relaxed">
              Our Website may contain links to third-party websites. We are not responsible for the privacy practices or content of these third-party websites.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-[#111E30] mb-4">Changes to the Policy</h2>
            <p className="text-[#595E64] leading-relaxed">
              We reserve the right to change this Policy at any time. We will notify you of any material changes to this Policy by posting the updated Policy on our Website.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-[#111E30] mb-4">California Privacy Rights</h2>
            <p className="text-[#595E64] leading-relaxed mb-4">
              If you are a California resident, you have the right to request information about our data practices related to your personal information, including the categories of personal information we have collected, the categories of sources from which we collected your personal information, the business or commercial purposes for collecting your personal information, the categories of third parties with whom we share your personal information, and the specific pieces of personal information we have collected about you.
            </p>
            <p className="text-[#595E64] leading-relaxed mb-4">
              You also have the right to request that we delete your personal information, subject to certain exceptions under applicable law.
            </p>
            <p className="text-[#595E64] leading-relaxed">
              To exercise these rights, please contact us using the contact information below. We will verify your request by asking for information that matches our records and may require additional information to confirm your identity.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-[#111E30] mb-4">Contact Us</h2>
            <p className="text-[#595E64] leading-relaxed mb-4">
              If you have any questions about this Policy or our privacy practices, or if you would like to exercise your privacy rights, please contact us at:
            </p>
            <a href="mailto:help@checkmyclaim.co" className="text-[#0285E9] hover:underline font-semibold">
              help@checkmyclaim.co
            </a>
          </section>

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
    </div>
  );
}