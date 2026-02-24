import React from "react";
import { FileText, ArrowLeft, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const stateDisclosures = [
  {
    state: "Alabama",
    text: "UL makes no representation that the quality of the legal services to be performed by it is greater than the quality of the legal services by other lawyers."
  },
  {
    state: "Alaska",
    text: "The Alaska Bar Association does not endorse or accredit certifying organizations."
  },
  {
    state: "Arizona",
    text: "checkmyclaim.co is a website name and not a law firm. The law firms who advertise through this website do not operate as checkmyclaim.co"
  },
  {
    state: "California",
    text: "Please note that checkmyclaim.co is an attorney marketing network and is not affiliated with any government agency. checkmyclaim.co does not receive any funding from any government or not-for-profit foundation."
  },
  {
    state: "Colorado",
    text: "checkmyclaim.co is a website name and not a law firm. The law firms who advertise through this website do not operate as checkmyclaim.co."
  },
  {
    state: "Florida",
    text: "The hiring of an attorney is an important decision, and that decision should not be based solely on advertising material. Before you decide to hire counsel to represent you, make sure you ask us or any attorney to send you free written information about the attorney's qualifications and experience."
  },
  {
    state: "Georgia",
    text: "checkmyclaim.co is a website name and not a law firm. The law firms who advertise through this website do not operate as checkmyclaim.co."
  },
  {
    state: "Hawaii",
    text: "The Supreme Court of Hawaii only grants certification to lawyers in good standing who have successfully completed a specialty program accredited by the American Bar Association."
  },
  {
    state: "Illinois",
    text: "The Illinois Supreme Court does not recognize certifications of specialties in the practice of law. A certificate, award, or recognition is not required to practice law in Illinois."
  },
  {
    state: "Indiana",
    text: "checkmyclaim.co is a website name and not a law firm. The law firms who advertise through this website do not operate as checkmyclaim.co."
  },
  {
    state: "Iowa",
    text: "checkmyclaim.co is a website name and not a law firm. The law firms who advertise through this website do not operate as checkmyclaim.co. The Supreme Court of Iowa requires the following disclosure: The choice of a lawyer and the determination of the need for legal assistance are extremely important decisions and should not be based on advertisements or self-proclaimed expertise. Memberships and offices in legal fraternities and legal societies, technical and professional licenses, and memberships in scientific, technical, and professional associations and societies of law or field of practice do not mean that a lawyer is a \"specialist\" or \"expert\" in a particular field of law. Such memberships, licenses, or offices also do not necessarily mean that a lawyer is any more expert or competent than any other lawyer. A description of limitation of practice does not mean that any agency or board has certified the lawyer as a specialist or expert in any indicated field of law, nor does it mean that such a lawyer is necessarily any more expert or competent than any other lawyer. The Supreme Court of Iowa requires the following disclosure: All potential clients should make their own independent evaluation and investigation of any lawyer being considered for particular legal representation."
  },
  {
    state: "Kentucky",
    text: "checkmyclaim.co is a website name and not a law firm. The law firms who advertise through this website do not operate as checkmyclaim.co."
  },
  {
    state: "Maine",
    text: "checkmyclaim.co is a website name and not a law firm. The law firms who advertise through this website do not operate as checkmyclaim.co."
  },
  {
    state: "Massachusetts",
    text: "The Commonwealth of Massachusetts does not certify lawyers in any particular field of law. If an attorney in Massachusetts indicates he/she is \"certified\" in a particular area of law, service, or field by a non-governmental body, the certifying organization is a private organization whose standards for certification are not regulated by the Commonwealth."
  },
  {
    state: "Mississippi",
    text: "checkmyclaim.co is a website name and not a law firm. The law firms who advertise through this website do not operate as checkmyclaim.co. Background information on any Mississippi attorney is available free upon request to that attorney. Mississippi has no procedure for approving, certifying, or designating organizations and authorities."
  },
  {
    state: "Missouri",
    text: "ADVERTISING MATERIAL: COMMERCIAL SOLICITATIONS ARE PERMITTED BY THE MISSOURI RULES OF PROFESSIONAL CONDUCT, BUT ARE NEITHER SUBMITTED NOR APPROVED BY THE MISSOURI BAR OR THE SUPREME COURT OF MISSOURI. Likewise, neither the Supreme Court nor the Missouri Bar reviews or approves certifying organizations or specialist designations in the field of law."
  },
  {
    state: "Nevada",
    text: "checkmyclaim.co is a website name and not a law firm. The law firms who advertise through this website do not operate as checkmyclaim.co. Neither the State Bar of Nevada nor any agency of the State Bar has certified any lawyer identified in this advertisement as a specialist or expert, except as indicated. Anyone considering hiring an attorney should independently investigate the lawyer's qualifications, credentials, and ability."
  },
  {
    state: "New Jersey",
    text: "checkmyclaim.co is a website name and not a law firm. The law firms who advertise through this website do not operate as checkmyclaim.co. The Supreme Court of New Jersey recognizes certifications in some areas of legal practice. If a lawyer claims certification as a specialist or expert in a field of law or practice and does not specifically indicate that such certification has been granted by the Supreme Court of New Jersey or by an organization approved by the American Bar Association, then the user should understand that the claimed certification body has either not been approved or been denied certification by the Supreme Court of New Jersey and the American Bar Association."
  },
  {
    state: "New Mexico",
    text: "Any certification by an organization other than the New Mexico Board of Legal Specialization does not constitute recognition by the New Mexico Board of Legal Specialization unless the lawyer is also recognized by the board as a specialist in that particular area of law."
  },
  {
    state: "New York",
    text: "checkmyclaim.co is a website name and not a law firm. The law firms who advertise through this website do not operate as checkmyclaim.co."
  },
  {
    state: "Rhode Island",
    text: "The Rhode Island Supreme Court licenses all lawyers in the general practice of law. The Court does not license or certify any lawyer as an expert or specialist in any field of practice of law."
  },
  {
    state: "Tennessee",
    text: "Tennessee recognizes Certifications of Specialization in the following areas of practice of law: Civil Trial, Criminal Trial, Business Bankruptcy, Consumer Bankruptcy, Creditor's Rights, Medical Malpractice, Legal Malpractice, Accounting Malpractice, Elder Law, Estate Planning, and Family Law. Listing of related or included practice areas by a lawyer does not constitute or imply a representation of certification of specialization. No attorneys listed on this site imply or represent that they hold a certificate of specialization other than where specifically indicated."
  },
  {
    state: "Texas",
    text: "checkmyclaim.co is a website name and not a law firm. The law firms who advertise through this website do not operate as checkmyclaim.co. Lawyers named on this site are not certified by the Texas Board of Legal Specialization unless otherwise specifically indicated."
  },
  {
    state: "Washington",
    text: "The Supreme Court of Washington does not recognize certification of specialties in the practice of law. Any such certificate, award, or recognition is not required to practice law in the State of Washington."
  },
  {
    state: "Wyoming",
    text: "The State Bar of the State of Wyoming does not certify any lawyer as a specialist or expert. Any person considering a lawyer for representation should independently investigate the lawyer's credentials, qualifications, and ability and should not rely on advertisements or self-proclaimed expertise."
  }
];

export default function AdvertisingDisclosure() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1f3d] via-[#0d2847] to-[#0a1f3d] flex items-center justify-center p-4 overflow-hidden" style={{ paddingTop: '100px' }}>
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl flex flex-col" style={{ maxHeight: '85vh', height: '85vh' }}>
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 md:px-8 py-6 rounded-t-2xl flex items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#0285E9]/10">
            <FileText className="w-6 h-6 text-[#0285E9]" />
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#111E30]">
            Advertising Disclosure
          </h1>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 md:px-8 py-6 pb-4">
          <div className="prose prose-slate max-w-none">
          <p className="text-[#595E64] mb-6 leading-relaxed">
            checkmyclaim.co is a non-professional legal services agency that connects service providers with consumers to help them live better lives, and when you call our number, you may be directly connected with one of our partners or a third party to assist you. Independent providers of the services may charge fees and have their own terms of service. checkmyclaim.co is not responsible and does not guarantee any outcomes from these providers. Services may not be available in all states, so please call or check our website for details.
          </p>
          
          <p className="text-[#595E64] mb-8 leading-relaxed">
            This Agreement contains a binding arbitration agreement, which provides that you and we agree to resolve certain disputes through binding individual arbitration and give up any right to have those disputes decided by a judge or a jury. You have the right to opt out of our agreement to arbitrate. See the Legal Disputes section of this Agreement.
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-[#111E30] mb-6">State Specific Legal Advertising Disclosures</h2>
            <div className="space-y-4">
              {stateDisclosures.map((disclosure) => (
                <div
                  key={disclosure.state}
                  className="border-l-4 border-[#0285E9] bg-gray-50 rounded-lg p-4"
                >
                  <h3 className="text-lg font-bold text-[#111E30] mb-2">{disclosure.state}</h3>
                  <p className="text-[#595E64] text-sm leading-relaxed">{disclosure.text}</p>
                </div>
              ))}
            </div>
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
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/699c8efa75d8857518d34273/01b1e384b_CheckMyClaimLogo.png" 
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