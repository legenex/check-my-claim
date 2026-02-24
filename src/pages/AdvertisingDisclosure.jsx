import React from "react";
import { motion } from "framer-motion";
import { FileText, Shield, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/Footer";

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/699c8efa75d8857518d34273/08c3eb029_CheckMyClaimLogoLight.png";

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
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-24 pb-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#4ba8ee] to-[#0486e9] px-8 py-6 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-4"
            >
              <FileText className="w-12 h-12 text-[#0285E9]" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-3xl md:text-4xl font-extrabold text-white"
            >
              Advertising Disclosure
            </motion.h1>
          </div>

          {/* Content */}
          <div className="px-6 md:px-10 py-10">
            {/* General Disclosure */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-[#4ba8ee]/10 to-[#0486e9]/10 rounded-2xl p-6 md:p-8 mb-8"
            >
              <p className="text-[#595E64] leading-relaxed mb-4">
                checkmyclaim.co is a non-professional legal services agency that connects service providers with consumers to help them live better lives, and when you call our number, you may be directly connected with one of our partners or a third party to assist you. Independent providers of the services may charge fees and have their own terms of service. checkmyclaim.co is not responsible and does not guarantee any outcomes from these providers. Services may not be available in all states, so please call or check our website for details.
              </p>
              <p className="text-[#595E64] leading-relaxed">
                This Agreement contains a binding arbitration agreement, which provides that you and we agree to resolve certain disputes through binding individual arbitration and give up any right to have those disputes decided by a judge or a jury. You have the right to opt out of our agreement to arbitrate. See the Legal Disputes section of this Agreement.
              </p>
            </motion.div>

            {/* State Specific Disclosures */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mb-8"
            >
              <h2 className="text-2xl md:text-3xl font-extrabold text-[#0C2D5B] mb-6 text-center">
                STATE SPECIFIC LEGAL ADVERTISING DISCLOSURES
              </h2>
              <div className="space-y-4">
                {stateDisclosures.map((disclosure, index) => (
                  <motion.div
                    key={disclosure.state}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + index * 0.02 }}
                    className="bg-white border border-gray-200 rounded-xl p-4 md:p-6 hover:shadow-md transition-shadow"
                  >
                    <h3 className="text-lg font-bold text-[#0C2D5B] mb-2">{disclosure.state}</h3>
                    <p className="text-[#595E64] text-sm leading-relaxed">{disclosure.text}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* NO WIN, NO FEE Guarantee */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-2xl p-6 md:p-8 mb-8 border-2 border-green-500"
            >
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                  <Shield className="w-9 h-9 text-white" />
                </div>
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-[#0C2D5B] mb-6 text-center">
                NO WIN, NO FEE Guarantee:
              </h2>
              <div className="space-y-4 text-[#595E64] leading-relaxed">
                <p>
                  The attorney's guarantee every client that they will not charge you a cent if they do not secure a positive outcome in your case. If you do win, the bulk of the fees are usually paid by the opposing counsel's client, who was responsible for the accident.
                </p>
                <p>
                  They will discuss and agree upon the fee breakdown upfront and in detail, so there will be complete transparency and no disappointment once your case is won… That is a guarantee to you!
                </p>
                <p className="text-lg font-bold text-[#0285E9] text-center">
                  YOU HAVE NOTHING TO LOSE!
                </p>
              </div>
            </motion.div>

            {/* Back to Home */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="text-center"
            >
              <Button
                variant="outline"
                onClick={() => navigate(createPageUrl("Home"))}
                className="inline-flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Button>
            </motion.div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-8 py-6 text-center border-t border-gray-200">
            <img src={LOGO_URL} alt="Claim Checker" className="h-8 mx-auto mb-3" />
            <p className="text-[#595E64] text-xs">
              Your privacy is important to us. We will never share your information without your consent.
            </p>
          </div>
        </div>
      </motion.div>
      </div>
      <Footer />
    </div>
  );
}