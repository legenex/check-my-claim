import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Users, ArrowLeft, Phone, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import LandingFooter from "@/components/landing/Footer";

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/699c8efa75d8857518d34273/440596289_PrimaryLogo_CheckMyClaim.png";

const affiliatedPartners = [

  "Car Accident Helpline",
  "Los Defensores",
  "4LegalLeads",
  "1800TheLaw2",
  "My Lawsuit Help",
  "Action Legal",
  "The Injury Help Network",
  "Inbounds.com",
  "Auto Accident Team",
  "Accident Helpline"
];

const sponsors = [
  "Adam Birkhold", "Al Motlagh", "Alan D Daneshrad", "Ali A Azarakhsh", "Ali Awad",
  "Ali Razavi", "Alina Bagasian", "Alla Tenina", "Ameer Shah", "Andrew D Kumar",
  "Andrew Zeytuntsyan", "Anthony Choe", "Aram Rostomyan", "Aren Manukyan", "Ari Moss",
  "Arin Khodaverdian", "Aron C Movroydis", "Artin Sookasian", "Ashkan Minaie", "Ayesha Rafi",
  "Barry H Hinden", "Ben Dominguez II", "Benjamin Fogel", "Benjamin Khakshour", "Bita N Haiem",
  "Bobby B Saadian", "Bobby Tamari", "Brian Banner", "Brian C Mitchell", "Cagney McCormick",
  "Cameron Y Brock", "Christopher Bragoli", "Christopher Culleton", "Clifford J Enten", "D. Scott Warmuth",
  "Dan Abir", "Daniel A Reisman", "Daniel Bottari", "Daniel J Rafii", "Darren Miller",
  "David Benn", "David E Jacobson", "David F Makkabi", "David Krangle", "David Kreizer",
  "David L Issapour", "David P Bonemeyer", "David P Kashani", "David Yerushalmi", "Derek Lee",
  "Edward Herman", "Edward Okwueze", "Edward Ramsey", "Elliot Zarabi", "Eric Mausner",
  "Erik Zograbian", "Felicia B Edelman", "Fletcher B Brown", "Gary Berkovich", "Gary K Daglian",
  "Geoffrey P Norton", "George Jawlakian", "George P Escobedo", "George P Hakim", "George Salinas",
  "Gerry Hernandez", "Gil Alvandi", "Goldwater Partner *", "Gordon McKernan", "Granth J Crhoelman",
  "Gus Anastopoulo", "Hagop Chopurian", "Harout A Messrelian", "Irina Martirosyan", "James A Allaire",
  "James Kim", "James Onder", "James Shaw", "James White", "Jared S Zafran",
  "Jared Spingarn", "Jason B Chalik", "Jason Javaheri", "Jeffrey Knoll", "Jerrold Parker",
  "Jerry Jacobson", "Jimmy H Jin", "John Brockmeier", "John C Ye", "John Hong",
  "John Leo", "Johnny G Phillips", "Jonathan I Rotstein", "Jonathan Melmed", "Jonathan Yagoubzadeh",
  "Joseph Nazarian", "Joseph S Nourmand", "Joshua J Zokaeem", "Justin Farahi", "Justin L Lawrence",
  "Kaveh Elihu", "Kenny Habetz", "Kevin A Garcia", "Kevin Butler", "Kevin Danesh",
  "Kevin Jani", "Kevin Moore", "Khalil Khan", "Kian Mottahedeh", "Kyle Madison",
  "Law Offices of Larry H Parker", "Mahdis Kaeni", "Maralle Messrelian", "Marc Pacin", "Marielys Acosta",
  "Mark Sweet", "Martin Arteaga", "Matt Koohanim", "Matthew Buzzell", "Michael Avanesian",
  "Michael Emrani", "Michael Fielding", "Michael Ghozland", "Michael H Kim", "Michael Pierce",
  "Michael Saeedian", "Michael Steinger", "Miguel I Alvarez", "Mohammad (Mo) Abuershaid", "Nassir N Ebrahimian",
  "Nathaniel Preston", "Nilufar Alemozaffar", "Omid Razi", "Pavel Sterin", "Payam Tishbi",
  "Pouya Chami", "Ramin Kermani-Nejad", "Randal Klezmer", "Raphael B Hedwat", "Raymond Ghermezian",
  "Ricardo Y Merluza", "Rob A Rodriguez", "Robert M Pave", "Robin Saghian", "Robinson S Rowe",
  "Ronald DeSimone", "Ronen Kleinman", "Rouben Varozian", "Ryan Banafshe", "Sam Almasri",
  "Samuel Ceballos", "Sanam Salimnia Aghnami", "Scott Diallo", "Scott E Wheeler", "Sean Logue",
  "Sean Simpson", "Sef Krell", "Servando Timbol", "Seymone Javaherian", "Sharif Alkalbani",
  "Shawn Azizzadeh", "Shervin Lalezary", "Siamak Vaziri", "Stacy Kemp", "Stephan Airapetian",
  "Stephen Godwin", "Stephen Kwan", "Thomas A Cifarelli", "Thomas Combs", "Thomas G Kemerer",
  "Tigran Martinian", "Troy T Otus", "Vivian N Szawarc", "Yasmin Azimi"
];

export default function PartnerList() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://pmdb.walkeradvertising.com/sponsors/embed.js";
    script.setAttribute("data-container", "participants-container");
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0C2D5B] via-[#001634] to-[#1B2737]">
      {/* Custom Header */}
      <header className="bg-white shadow-md px-4 py-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <img src={LOGO_URL} alt="Check My Claim" className="h-10 md:h-14 w-auto" />
          <div className="flex flex-col items-center gap-1.5">
            <span className="text-[#111E30] text-sm font-medium">Prefer to speak to someone right now?</span>
            <a
              href="tel:+18447381035"
              className="flex items-center gap-2 bg-gradient-to-r from-[#4ba8ee] to-[#0486e9] text-white font-bold px-5 py-2.5 rounded-full hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105 text-sm"
            >
              <Phone className="w-4 h-4" />
              <span className="__tc_dni_phone">(844) 738 1035</span>
            </a>
          </div>
        </div>
      </header>

      <div className="flex flex-col items-center px-4 pb-12 pt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-5xl w-full"
        >
          {/* Main Card */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
            {/* Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="flex justify-center mb-6"
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#4ba8ee] to-[#0486e9] flex items-center justify-center">
                <Users className="w-12 h-12 text-white" />
              </div>
            </motion.div>

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl md:text-4xl font-extrabold text-[#0C2D5B] text-center mb-8"
            >
              Our Partners
            </motion.h1>

            {/* Affiliated Partners */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-8"
            >
              <h2 className="text-2xl font-extrabold text-[#0C2D5B] mb-4">Affiliated Partners</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {affiliatedPartners.map((partner, index) => (
                  <motion.div
                    key={partner}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + index * 0.05 }}
                    className="bg-gradient-to-br from-[#4ba8ee]/10 to-[#0486e9]/10 rounded-xl p-4 border-l-4 border-[#0285E9] hover:shadow-md transition-shadow"
                  >
                    <p className="text-[#0C2D5B] font-semibold">{partner}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Sponsors Widget */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mb-8"
            >
              <h2 className="text-2xl font-extrabold text-[#0C2D5B] mb-4">Sponsors</h2>
              <style>{`
                #participants-container > * {
                  margin-bottom: 12px;
                }
                #participants-container p,
                #participants-container div,
                #participants-container li,
                #participants-container span {
                  line-height: 1.6;
                }
              `}</style>
              <div id="participants-container"></div>
            </motion.div>

            {/* NO WIN, NO FEE */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-2xl p-6 mb-8"
            >
              <h3 className="text-lg font-extrabold text-[#0C2D5B] mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
                NO WIN, NO FEE Guarantee:
              </h3>
              <p className="text-[#595E64] text-sm leading-relaxed mb-4">
                The attorney's guarantee every client that they will not charge you a cent if they do not secure a positive outcome in your case. If you do win, the bulk of the fees are usually paid by the opposing counsel's client, who was responsible for the accident. They will discuss and agree upon the fee breakdown upfront and in detail, so there will be complete transparency and no disappointment once your case is won… That is a guarantee to you!
              </p>
              <p className="text-2xl font-extrabold text-[#0285E9] text-center">
                YOU HAVE NOTHING TO LOSE!
              </p>
            </motion.div>

            {/* Back to Home */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.0 }}
              className="text-center"
            >
              <Link
                to={createPageUrl("Home")}
                className="group inline-flex items-center gap-2 border border-gray-300 text-[#0C2D5B] font-semibold px-6 py-3 rounded-full hover:bg-gray-50 transition-all duration-300"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Link>
            </motion.div>
          </div>

          {/* Footer Note */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            className="text-white/60 text-sm text-center mt-6"
          >
            ✓ 100% Free • ✓ No Obligation • ✓ Your Information is Secure
          </motion.p>
        </motion.div>
      </div>

      <LandingFooter />
    </div>
  );
}