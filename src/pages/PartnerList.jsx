import React from "react";
import { motion } from "framer-motion";
import { Users, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";
import LandingFooter from "@/components/landing/Footer";
import PageFooter from "@/components/Footer";

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/699c8efa75d8857518d34273/01b1e384b_CheckMyClaimLogo.png";

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
  "Adam Birkhold",
  "Al Motlagh",
  "Alan D Daneshrad",
  "Ali A Azarakhsh",
  "Ali Awad",
  "Ali Razavi",
  "Alina Bagasian",
  "Alla Tenina",
  "Ameer Shah",
  "Andrew D Kumar",
  "Andrew Zeytuntsyan",
  "Anthony Choe",
  "Aram Rostomyan",
  "Aren Manukyan",
  "Ari Moss",
  "Arin Khodaverdian",
  "Aron C Movroydis",
  "Artin Sookasian",
  "Ashkan Minaie",
  "Ayesha Rafi",
  "Barry H Hinden",
  "Ben Dominguez II",
  "Benjamin Fogel",
  "Benjamin Khakshour",
  "Bita N Haiem",
  "Bobby B Saadian",
  "Bobby Tamari",
  "Brian Banner",
  "Brian C Mitchell",
  "Cagney McCormick",
  "Cameron Y Brock",
  "Christopher Bragoli",
  "Christopher Culleton",
  "Clifford J Enten",
  "D. Scott Warmuth",
  "Dan Abir",
  "Daniel A Reisman",
  "Daniel Bottari",
  "Daniel J Rafii",
  "Darren Miller",
  "David Benn",
  "David E Jacobson",
  "David F Makkabi",
  "David Krangle",
  "David Kreizer",
  "David L Issapour",
  "David P Bonemeyer",
  "David P Kashani",
  "David Yerushalmi",
  "Derek Lee",
  "Edward Herman",
  "Edward Okwueze",
  "Edward Ramsey",
  "Elliot Zarabi",
  "Eric Mausner",
  "Erik Zograbian",
  "Felicia B Edelman",
  "Fletcher B Brown",
  "Gary Berkovich",
  "Gary K Daglian",
  "Geoffrey P Norton",
  "George Jawlakian",
  "George P Escobedo",
  "George P Hakim",
  "George Salinas",
  "Gerry Hernandez",
  "Gil Alvandi",
  "Goldwater Partner *",
  "Gordon McKernan",
  "Granth J Crhoelman",
  "Gus Anastopoulo",
  "Hagop Chopurian",
  "Harout A Messrelian",
  "Irina Martirosyan",
  "James A Allaire",
  "James Kim",
  "James Onder",
  "James Shaw",
  "James White",
  "Jared S Zafran",
  "Jared Spingarn",
  "Jason B Chalik",
  "Jason Javaheri",
  "Jeffrey Knoll",
  "Jerrold Parker",
  "Jerry Jacobson",
  "Jimmy H Jin",
  "John Brockmeier",
  "John C Ye",
  "John Hong",
  "John Leo",
  "Johnny G Phillips",
  "Jonathan I Rotstein",
  "Jonathan Melmed",
  "Jonathan Yagoubzadeh",
  "Joseph Nazarian",
  "Joseph S Nourmand",
  "Joshua J Zokaeem",
  "Justin Farahi",
  "Justin L Lawrence",
  "Kaveh Elihu",
  "Kenny Habetz",
  "Kevin A Garcia",
  "Kevin Butler",
  "Kevin Danesh",
  "Kevin Jani",
  "Kevin Moore",
  "Khalil Khan",
  "Kian Mottahedeh",
  "Kyle Madison",
  "Law Offices of Larry H Parker",
  "Mahdis Kaeni",
  "Maralle Messrelian",
  "Marc Pacin",
  "Marielys Acosta",
  "Mark Sweet",
  "Martin Arteaga",
  "Matt Koohanim",
  "Matthew Buzzell",
  "Michael Avanesian",
  "Michael Emrani",
  "Michael Fielding",
  "Michael Ghozland",
  "Michael H Kim",
  "Michael Pierce",
  "Michael Saeedian",
  "Michael Steinger",
  "Miguel I Alvarez",
  "Mohammad (Mo) Abuershaid",
  "Nassir N Ebrahimian",
  "Nathaniel Preston",
  "Nilufar Alemozaffar",
  "Omid Razi",
  "Pavel Sterin",
  "Payam Tishbi",
  "Pouya Chami",
  "Ramin Kermani-Nejad",
  "Randal Klezmer",
  "Raphael B Hedwat",
  "Raymond Ghermezian",
  "Ricardo Y Merluza",
  "Rob A Rodriguez",
  "Robert M Pave",
  "Robin Saghian",
  "Robinson S Rowe",
  "Ronald DeSimone",
  "Ronen Kleinman",
  "Rouben Varozian",
  "Ryan Banafshe",
  "Sam Almasri",
  "Samuel Ceballos",
  "Sanam Salimnia Aghnami",
  "Scott Diallo",
  "Scott E Wheeler",
  "Sean Logue",
  "Sean Simpson",
  "Sef Krell",
  "Servando Timbol",
  "Seymone Javaherian",
  "Sharif Alkalbani",
  "Shawn Azizzadeh",
  "Shervin Lalezary",
  "Siamak Vaziri",
  "Stacy Kemp",
  "Stephan Airapetian",
  "Stephen Godwin",
  "Stephen Kwan",
  "Thomas A Cifarelli",
  "Thomas Combs",
  "Thomas G Kemerer",
  "Tigran Martinian",
  "Troy T Otus",
  "Vivian N Szawarc",
  "Yasmin Azimi"
];

export default function PartnerList() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0C2D5B] via-[#001634] to-[#1B2737]">
      <div className="pb-12 px-4" style={{ paddingTop: '120px' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
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
              <Users className="w-12 h-12 text-[#0285E9]" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-3xl md:text-4xl font-extrabold text-white"
            >
              Our Partners
            </motion.h1>
          </div>

          {/* Content */}
          <div className="px-6 md:px-10 py-10">
            {/* Affiliated Partners */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-10"
            >
              <h2 className="text-2xl md:text-3xl font-extrabold text-[#0C2D5B] mb-6">
                Affiliated Partners
              </h2>
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

            {/* Sponsors */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mb-8"
            >
              <h2 className="text-2xl md:text-3xl font-extrabold text-[#0C2D5B] mb-6">
                Sponsors
              </h2>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {sponsors.map((sponsor, index) => (
                  <motion.div
                    key={sponsor}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 + index * 0.01 }}
                    className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow"
                  >
                    <p className="text-[#595E64] text-sm">{sponsor}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Back to Home */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
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
      <LandingFooter />
      <PageFooter />
    </div>
  );
}