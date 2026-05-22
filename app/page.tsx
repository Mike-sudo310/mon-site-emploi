"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
type Job = {
  id?: string | number;
  title: string;
  description?: string
  redirect_url?: string;
  company?: {
    display_name: string;
  };
  location?: {
    display_name: string;
  };
};

export default function Home() {
  const [search, setSearch] = useState("");
  const [language, setLanguage] = useState("fr");
  const [showLanguages, setShowLanguages] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const [isLogged, setIsLogged] = useState(false);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [jobs, setJobs] = useState<Job[]>([]);

  const [currentPage, setCurrentPage] = useState(1);

  const jobsPerPage = 10;

  const [loading, setLoading] = useState(false);
  const [country, setCountry] = useState("gb");
  const countryNames: any = {
    gb: "United Kingdom",
    us: "United States",
    fr: "France",
    ca: "Canada",
    de: "Germany",
    ch: "Switzerland",
    be: "Belgium",
    lu: "Luxembourg",
    mc: "Monaco",
    franco: "Francophone",
    other: "Other",
  };
  const selectedCountry = countryNames[country];

  
  // ===== COUNTRY KEYWORDS =====

  const countryKeywords: any = {
    "United Kingdom": [
      "united kingdom",
      "uk",
      "england",
      "scotland",
      "wales",
      "london",
      "manchester",
      "birmingham",
      "glasgow",
      "edinburgh",
    ],

    "United States": [
      "usa",
      "united states",
      "america",
      "new york",
      "california",
      "texas",
      "florida",
      "washington",
    ],

    "France": [
      "france",
      "paris",
      "lyon",
      "marseille",
      "toulouse",
      "bordeaux",
      "lille",
      "nice",
      "rennes",
      "nantes",
      "ile-de-france",
      "auvergne-rhone-alpes",
      "provence",
      "occitanie",
      "fr",
    ],

    "Canada": [
      "canada",
      "montreal",
      "quebec",
      "québec",
      "toronto",
      "vancouver",
      "ottawa",
    ],

    "Germany": [
      "germany",
      "deutschland",
      "berlin",
      "munich",
      "hamburg",
      "frankfurt",
      "de",
    ],

    "Switzerland": [
      "switzerland",
      "suisse",
      "schweiz",
      "svizzera",
      "geneva",
      "genève",
      "zurich",
      "lausanne",
      "bern",
      "basel",
      "ch",
    ],

    "Belgium": [
      "belgium",
      "belgique",
      "belgie",
      "brussels",
      "bruxelles",
      "wallonie",
      "flanders",
      "gent",
      "liege",
      "antwerp",
      "be",
    ],

    "Luxembourg": [
      "luxembourg",
      "lu",
    ],

    "Monaco": [
      "monaco",
      "mc",
    ],

    "Francophone": [
      "france",
      "french",
      "français",
      "francais",

      "belgique",
      "belgium",
      "wallonie",
      "bruxelles",

      "suisse",
      "switzerland",
      "geneve",
      "genève",
      "lausanne",

      "canada",
      "quebec",
      "québec",
      "montreal",

      "luxembourg",
      "monaco",

      "côte d'ivoire",
      "cote d'ivoire",
      "senegal",
      "sénégal",
      "cameroun",
      "madagascar",
      "benin",
      "bénin",
      "togo",
      "congo",
      "rdc",
      "maroc",
      "tunisie",
      "algérie",
      "algerie",
      "francophone",
      "french speaking",
      "quebec city",
      "dakar",
      "abidjan",
      "yaounde",
      "kinshasa",
      "casablanca",
      "rabat",
      "tunis",
      "lomé",
      "antananarivo",

      "fr",
      "qc",
      "cd",
      "ci",
      "ma",
      "tn",
      "sn",
      "cm",

      "europe francophone",
      "french remote",
      "remote france",
      "remote canada",

      "paris, fr",
      "montreal, qc",
      "brussels",
      "geneva",
    ],
  };
  
  const normalizeText = (text: string) =>
    (text || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, ""); // enlève accents


  // ===== DRONE FILTER =====

  const droneKeywords = [
    "drone",
    "uav",
    "uas",
    "rpas",
    "telepilot",
    "télépilote",
    "photogrammetry",
    "photogrammétrie",
    "lidar",
    "remote sensing",
    "cartography",
    "geomatics",
    "géomatique",
    "mapping",
    "inspection drone",
  ];

  const excludedKeywords = [
    "marketing",
    "sales",
    "seo",
    "finance",
    "accountant",
    "lawyer",
    "nurse",
    "teacher",
  ];

  const isDroneJob = (
    title: string,
    description: string
  ) => {

    const text =
      normalizeText(`${title || ""} ${description || ""}`);

    const hasDroneKeyword =
      droneKeywords.some((keyword) =>
        text.includes(keyword)
      );

    const hasExcludedKeyword =
      excludedKeywords.some((keyword) =>
        text.includes(keyword)
      );

    return (
      hasDroneKeyword &&
      !hasExcludedKeyword
    );
  };

  // ===== COUNTRY FILTER =====

  const isCorrectCountry = (
    location: string,
    title?: string,
    description?: string
  ) => {

    // ===== MODE FRANCOPHONE =====

    if (selectedCountry === "Francophone") {

      const fullText = normalizeText(`
        ${location || ""}
        ${title || ""}
        ${description || ""}
      `);

      const keywords =
        countryKeywords["Francophone"] || [];

    
      return keywords.some((keyword: string) =>
        fullText.includes(normalizeText(keyword))
      );
    };

    // ===== MODE OTHER =====

    if (selectedCountry === "Other") {

      const fullText = normalizeText(`
        ${location || ""}
        ${title || ""}
        ${description || ""}
      `);

      // Seulement les grands pays connus
      const excludedCountries = [
        ...countryKeywords["United Kingdom"],
        ...countryKeywords["United States"],
        ...countryKeywords["France"],
        ...countryKeywords["Canada"],
        ...countryKeywords["Germany"],
        ...countryKeywords["Switzerland"],
        ...countryKeywords["Belgium"],
        ...countryKeywords["Luxembourg"],
        ...countryKeywords["Monaco"],
      ]

      // IMPORTANT :
      // retire les mots trop courts
      const cleanKeywords = excludedCountries.filter(
        (keyword: string) => keyword.length > 3
      );

      const isKnownCountry = cleanKeywords.some(
        (keyword: string) =>
          fullText.includes(normalizeText(keyword))
      );

      
      return !isKnownCountry;
    }

    // ===== AUTRES PAYS =====

    const text = normalizeText(location);

    const keywords =
      countryKeywords[selectedCountry] || [];
    
    return keywords.some((keyword: string) =>
      text.includes(normalizeText(keyword))
    );
  };

    function handleLogin() {

      // IDENTIFIANTS SIMPLES
      const adminUser = "Equipe Pilote";
      const adminPass = "9933";

      if (
        username === adminUser &&
        password === adminPass
      ) {
        setIsLogged(true);
      } else {
        alert("Identifiants incorrects");
      }
    }
  
    async function fetchJobs() {
      setLoading(true);
      try {

        // ===== ADZUNA =====

        const adzunaCountries: Record<string, string> = {
          Francophone: "fr",
          France: "fr",
          Canada: "ca",
          Belgique: "be",
          Suisse: "ch",
          USA: "us",
          RoyaumeUni: "gb",
          Australie: "au",
          Allemagne: "de",
          Espagne: "es",
          Autre: "us, fr, ca, be,ch, gb, au, de, es ",
        };

        const adzunaCountry =
          adzunaCountries[selectedCountry] || "us";
        
        const adzunaRes = await fetch(
          `https://api.adzuna.com/v1/api/jobs/${adzunaCountry}/search/1?app_id=25d89677&app_key=a843aa88f5a5063987513015419abb72&what=drone`
        );

        const adzunaData = await adzunaRes.json();

        const adzunaJobs = (adzunaData.results || [])

          .filter((job: any) =>
            isDroneJob(
              job.title,
              job.description
            )

            &&

            isCorrectCountry(
              job.location?.display_name || "",
              job.title,
              job.description
            )
          )

          .map((job: any) => ({
            id: job.id,
            title: job.title,
            description: job.description,
            redirect_url: job.redirect_url,

            company: {
              display_name: job.company?.display_name,
            },

            location: {
              display_name: job.location?.display_name,
            },
          }));
        
        // ===== JSEARCH =====
        const jsearchRes = await fetch(
          `https://jsearch.p.rapidapi.com/search?query=${
            selectedCountry === "Francophone"
              ? "(drone OR UAV OR UAS OR RPAS OR telepilot OR photogrammetry) AND (France OR Quebec OR Belgium OR Switzerland OR Senegal OR Morocco OR Madagascar)"
              : selectedCountry === "Other"
              ? "drone OR UAV OR UAS OR RPAS jobs"
              : `drone OR UAV OR UAS OR RPAS jobs in ${selectedCountry}`
          }&num_pages=1`,
          {
            method: "GET",
            headers: {
              "X-RapidAPI-Key": process.env.NEXT_PUBLIC_RAPIDAPI_KEY || "",

              "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
            },
          }
        );
                        
        const jsearchData = await jsearchRes.json();
                 
        const jsearchJobs = (jsearchData.data || [])

          .filter((job: any) =>
            isDroneJob(
              job.job_title,
              job.job_description
            )

            &&

            isCorrectCountry(
              `
              ${job.job_city || ""}
              ${job.job_country || ""}
              `,
              job.job_title,
              job.job_description
            )
          )

          .map((job: any) => ({
            id: job.job_id,
            title: job.job_title,
            description: job.job_description,
            redirect_url: job.job_apply_link,
            company: {
              display_name: job.employer_name,
            },
            location: {
              display_name: job.job_city || "Non précisé",
            },
          }));

        // ===== ARBEITNOW =====

        const arbeitnowRes = await fetch(
          "https://www.arbeitnow.com/api/job-board-api"
        );

        const arbeitnowData = await arbeitnowRes.json();

        const arbeitnowJobs = (arbeitnowData.data || [])
          .filter((job: any) => {
            const text =
              `${job.title || ""} ${job.description || ""}`.toLowerCase();

            const location =
              `${job.location}`.toLowerCase();

            return (
              isDroneJob(
                job.title,
                job.description
              )


              &&

              isCorrectCountry(
                location,
                job.title,
                job.description
              )
            );
          })

          .map((job: any) => ({
            id: job.slug,
            title: job.title,
            description: job.description,
            redirect_url: job.url,
            company: {
              display_name: job.company_name,
            },
            location: {
              display_name:
                job.location || "Remote",
            },
          }));

        // ===== JOOBLE =====

        const joobleRes = await fetch(
          `https://jooble.org/api/${process.env.NEXT_PUBLIC_JOOBLE_KEY}`,
          {
            method: "POST",

            headers: {
              "Content-Type": "application/json",
            },

            body: JSON.stringify({
              keywords: `
              drone OR UAV OR UAS OR RPAS OR
              photogrammetry OR lidar OR
              geomatics OR cartography OR
              remote sensing
              `,
              location:
                selectedCountry === "Francophone"
                  ? "France"
                  : selectedCountry === "Other"
                  ? ""
                  : selectedCountry,
                
            }),
          }
        );

        const joobleData = await joobleRes.json();

        const joobleJobs = (joobleData.jobs || [])

          .filter((job: any) =>
            isDroneJob(
              job.title,
              job.snippet
            )

            &&

            isCorrectCountry(
              job.location || "",
              job.title,
              job.snippet
            )
          )

          .map(
            (job: any) => ({
              id: job.id || job.link,
              title: job.title,
              description: job.snippet,
              redirect_url: job.link,
              company: {
                display_name:
                  job.company || "Unknown",
              },
              location: {
                display_name:
                  job.location || "Non précisé",
              },
            })
          );

        // ===== REMOTIVE =====

        const remotiveRes = await fetch(
          "https://remotive.com/api/remote-jobs"
        );

        const remotiveData = await remotiveRes.json();

        const remotiveJobs = (remotiveData.jobs || [])
          .filter((job: any) =>
            isDroneJob(
              job.title,
              job.description
            )

            &&

            isCorrectCountry(
              job.candidate_required_location || "",
              job.title,
              job.description
            )
          )

          .map((job: any) => ({
            id: job.id,
            title: job.title,
            description: job.description,
            redirect_url: job.url,

            company: {
              display_name: job.company_name,
            },

            location: {
              display_name:
                job.candidate_required_location || "Remote",
            },
          }));

        // ===== GREENHOUSE =====
        
        const greenhouseBoards = [
          "andurilindustries",
          "canonical",
          "cloudflare",
          "stripe",
        ];

        const greenhouseJobs = (
          await Promise.all(
            greenhouseBoards.map(async (board) => {
              const res = await fetch(
                `https://boards-api.greenhouse.io/v1/boards/${board}/jobs`
              );

              if (!res.ok) return [];

              const data = await res.json();

              return Array.isArray(data.jobs)
                ? data.jobs
                : [];
            })
          )
        )
        .flat()

        .filter((job: any) =>
          isDroneJob(
            job.title,
            ""
          ) &&

          isCorrectCountry(
            job.location?.name || ""
          )
        )

        .map((job: any) => ({
          id: job.id,
          title: job.title,
          description: "",
          redirect_url: job.absolute_url,
          company: {
            display_name:
              job.metadata?.find(
                (m: any) =>
                  m.name === "Company"
              )?.value || "Greenhouse",
          },

          location: {
            display_name:
              job.location?.name || "Unknown",
          },
        }));


        
        // ===== LEVER =====

        const leverCompanies = [
          "shieldai",
        ];

        const leverJobs = (
          await Promise.all(
            leverCompanies.map(async (company) => {

              const res = await fetch(
                `https://api.lever.co/v0/postings/${company}?mode=json`
              );

              if (!res.ok) return [];

              const data = await res.json();

              return Array.isArray(data)
                ? data
                : [];
            })
          )
        )

        .flat()

        .filter((job: any) =>
          isDroneJob(
            job.text,
            job.descriptionPlain || ""
          ) &&

          isCorrectCountry(
            job.categories?.location || ""
          )
        )

        .map((job: any) => ({
          id: job.id,

          title: job.text,

          description:
            job.descriptionPlain || "",

          redirect_url: job.hostedUrl,

          company: {
            display_name: "Lever",
          },

          location: {
            display_name:
              job.categories?.location || "Unknown",
          },
        }));

          
        // ===== FUSION (IMPORTANT) =====
        const allJobs = [
          ...(adzunaJobs || []),
          ...(jsearchJobs || []),
          ...(arbeitnowJobs || []),
          ...(joobleJobs || []),
          ...(greenhouseJobs || []),
          ...(leverJobs || [])
        ];

        
        const uniqueJobs = allJobs.filter(
          (job, index, self) =>
            index ===
            self.findIndex(
              (j) =>
                j.title === job.title &&
                j.company?.display_name ===
                  job.company?.display_name
            )
        );

        console.log({
          adzunaJobs,
          jsearchJobs,
          arbeitnowJobs,
          joobleJobs,
          greenhouseJobs,
          leverJobs,
        });

        setJobs(
          Array.isArray(uniqueJobs)
            ? uniqueJobs
            : []
        );

      setLoading(false);
       
      } catch (error) {
        console.log("Erreur API", error);
        setLoading(false);
      }
    }

  
    
    
  const filteredJobs = jobs.filter((job: Job) =>
    (job.title || "")
      .toLowerCase()
      .includes(search.toLowerCase()) ||

    (job.company?.display_name || "")
      .toLowerCase()
      .includes(search.toLowerCase()) ||

    (job.location?.display_name || "")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // ===== PAGINATION =====

  const indexOfLastJob =
    currentPage * jobsPerPage;

  const indexOfFirstJob =
    indexOfLastJob - jobsPerPage;

  const currentJobs =
    filteredJobs.slice(
      indexOfFirstJob,
      indexOfLastJob
    );

  const totalPages =
    Math.ceil(
      filteredJobs.length / jobsPerPage
    )

  const translations: any = {
    fr: {
      search: "🔍 Rechercher",
      searching: "Recherche en cours...",
      jobsFound: "offres trouvées",
      searchPlaceholder: "Rechercher un emploi...",
    },
    en: {
      search: "🔍 Search",
      searching: "Searching...",
      jobsFound: "jobs found",
      searchPlaceholder: "Search for a job...",
    },
    de: {
      search: "🔍 Suchen",
      searching: "Suche läuft...",
      jobsFound: "Jobs gefunden",
      searchPlaceholder: "Job suchen...",
    },
  };

  const t = translations[language];

  const languageButtonStyle = {
    background: "transparent",
    border: "none",
    color: "white",
    padding: "8px",
    borderRadius: "8px",
    cursor: "pointer",
    textAlign: "left" as const,
    fontSize: "15px",
  };

  const translateText = (
    text: string
  ) => {

    if (language === "fr") {
      return text;
    }

    // EXEMPLES SIMPLES
    const translations: any = {

      "Remote": {
        en: "Remote",
        de: "Fernarbeit",
      },

      "Non précisé": {
        en: "Not specified",
        de: "Nicht angegeben",
      },

      "Postuler maintenant": {
        en: "Apply now",
        de: "Jetzt bewerben",
      },
    };

    return (
      translations[text]?.[language] ||
      text
    );
  };

  if (!isLogged) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(135deg,#111827,#1e3a8a)",
          fontFamily: "Arial",
        }}
      >
        <div
          style={{
            background: "#dee9f9f9",
            padding: "40px",
            borderRadius: "20px",
            width: "350px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
            textAlign: "center",
            border: "3px solid #2563eb",
          }}
        >
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
            <div
              style={{
                width: "140px",
                height: "140px",
                borderRadius: "25px",
                overflow: "hidden",
                boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
                border: "3px solid #2563eb",
              }}
            >
              <Image
                src="/drone.jpg"
                alt="Drone"
                width={140}
                height={140}
                style={{
                  objectFit: "cover",
                  width: "100%",
                  height: "100%",
                }}
              />
            </div>
          </div>

          <h1
            style={{
              fontFamily: '"French Script MT", cursive',
              fontSize: "42px",
              fontWeight: "900",
              letterSpacing: "2px",
              background: "linear-gradient(90deg, #2563eb, #7c3aed)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textAlign: "center",
              marginBottom: "10px",
              textTransform: "uppercase",
              textShadow: "0 0 20px rgba(124,58,237,0.4)",
            }}
          >
            Drone
          </h1>

         

          {/* FORMULAIRE (ENTRÉE ACTIVÉE) */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
          >

            <input
              type="text"
              placeholder="Nom d'utilisateur"
              value={username}
              onChange={(e) =>
                setUsername(e.target.value)
              }
              style={{
                width: "100%",
                padding: "12px",
                marginBottom: "15px",
                borderRadius: "10px",
                border: "1px solid #ccc",
                fontSize: "16px",
              }}
            />

            <input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              style={{
                width: "100%",
                padding: "12px",
                marginBottom: "20px",
                borderRadius: "10px",
                border: "1px solid #ccc",
                fontSize: "16px",
              }}
            />

            <button
              type="submit"
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "10px",
                border: "none",
                background:
                  "linear-gradient(90deg,#2563eb,#7c3aed)",
                color: "white",
                fontWeight: "bold",
                fontSize: "16px",
                cursor: "pointer",
              }}
            >
              Se connecter
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "Arial", background: "#f4f6f8", minHeight: "100vh" }}>
      
      {/* HEADER */}
      <header 
        style={{ 
          background: "linear-gradient(90deg, #111827, #1f2937)",
          color: "white",
          padding: "15px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
          overflow: "hidden",
        }}
      >
        
        {/* LOGO + DRONE */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>

          <Image
            src="/drone.jpg"
            alt="Drone"
            width={50}
            height={50}
            loading="eager"
            style={{ borderRadius: "10px" }}
          />

          <h1 style={{ margin: 2, fontSize: "35px", fontWeight: "bold" }}>
            Drone & Tech Jobs
          </h1>
        </div>
        
        {/* BADGE */}
        <span
            style={{
              fontFamily: '"French Script MT", cursive',
              fontSize: "28px",
              fontWeight: "900",
              letterSpacing: "2px",
              color: "white",
              textShadow: "0 0 15px rgba(255,255,255,0.4)",
            }}
          >
            {username}
          </span>
      </header>
        
        <div
          style={{
            textAlign: "center",
            padding: "30px 20px 10px",
          }}
        >
          <h2 style={{ fontSize: "32px", marginBottom: "10px" }}>
            Trouvez des emplois drone dans le monde
          </h2>

          <p style={{ color: "#6b7280", fontSize: "16px" }}>
            Offres en temps réel depuis plusieurs plateformes internationales
          </p>
        </div>

      <main
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          padding: "30px",
          paddingBottom: "120px",
        }}
      >

        {/* SEARCH */}
        {!selectedJob && (
          <>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              style={{
                padding: "10px",
                marginBottom: "20px",
                borderRadius: "8px",
                border: "1px solid #ccc",
                width: "100%",
              }}
            >
              <option value="gb">🇬🇧 Royaume-Uni</option>
              <option value="us">🇺🇸 États-Unis</option>
              <option value="fr">🇫🇷 France</option>
              <option value="ca">🇨🇦 Canada</option>
              <option value="de">🇩🇪 Allemagne</option>
              <option value="ch">🇨🇭 Suisse</option>
              <option value="be">🇧🇪 Belgique</option>
              <option value="lu">🇱🇺 Luxembourg</option>
              <option value="mc">🇲🇨 Monaco</option>
              <option value="franco">🌍 Francophone</option>
              <option value="other">🌎 Autres</option>
            </select>

            <button
              onClick={fetchJobs}
              disabled={loading}
              style={{
                padding: "12px",
                marginBottom: "20px",
                marginTop: "10px",
                width: "100%",
                borderRadius: "10px",
                border: "none",
                background: loading
                  ? "#f95e75"
                  : "linear-gradient(90deg,#2563eb,#7c3aed)",
                color: "white",
                fontWeight: "bold",
                cursor: "pointer",
                fontSize: "16px",
              }}
            >
              {loading ? t.searching : t.search}
            </button>

            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                marginBottom: "20px",
                borderRadius: "8px",
                border: "1px solid #d1d5db",
                fontSize: "16px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                outline: "none",
              }}
            />
            </>
          )}

        {/* LISTE */}
        {!selectedJob && (
          <> 
            <p style={{ marginBottom: "20px", fontWeight: "bold" }}>
              {filteredJobs.length} {t.jobsFound}
            </p>

            <div style={{ display: "grid", gap: "15px" }}>
              {currentJobs.map((job: Job) => (
                <div
                  key={job.id || job.redirect_url}
                  style={{
                    background: "#f9fafb",
                    padding: "22px",
                    borderRadius: "18px",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                    border: "1px solid #77b7eb",
                    transition: "0.25s ease",
                    cursor: "pointer",
                  }}

                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                  }}

                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = "translateY(0px)";
                  }}
                >
                  <h3>{translateText(job.title)}</h3>
                  <p>🏢 {job.company?.display_name}</p>
                  <p>📍 {translateText(job.location?.display_name || "")}</p>

                  <button
                    onClick={() => setSelectedJob(job)}
                    style={{
                      marginTop: "10px",
                      padding: "8px 12px",
                      background: "linear-gradient(90deg,#2563eb,#7c3aed)",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontWeight: "bold",
                    }}
                  >
                    Voir l'offre
                  </button>
                </div>
              ))}
            </div>

            {/* PAGINATION */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "10px",
                marginTop: "30px",
                flexWrap: "wrap",
              }}
            >
              {Array.from(
                { length: totalPages },
                (_, index) => (
                  <button
                    key={index}
                    onClick={() =>
                      setCurrentPage(index + 1)
                    }
                    style={{
                      padding: "10px 15px",
                      borderRadius: "8px",
                      border: "none",
                      cursor: "pointer",
                      background:
                        currentPage === index + 1
                          ? "linear-gradient(90deg,#2563eb,#7c3aed)"
                          : "#d1d5db",
                      color:
                        currentPage === index + 1
                          ? "white"
                          : "black",
                      fontWeight: "bold",
                    }}
                  >
                    {index + 1}
                  </button>
                )
              )}
            </div>
          </>
        )}

        {/* DÉTAIL */}
        {selectedJob && (
          <div
            style={{
              background: "white",
              padding: "25px",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            }}
          >
            <h2>{selectedJob?.title}</h2>
            <p>🏢 {selectedJob.company?.display_name || "Entreprise inconnue"}</p>
            <p>📍 {selectedJob.location?.display_name || "Lieu non précisé"}</p>
            <p style={{ marginTop: "15px" }}>
              {translateText(selectedJob.description || "")}
            </p>
            <a
              href={selectedJob.redirect_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-block",
                marginTop: "15px",
                padding: "12px 18px",
                background: "#e57ae5",
                color: "blue",
                borderRadius: "8px",
                textDecoration: "none",
                fontWeight: "bold",
                transition: "0.2s",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = "#eb90ee";
                e.currentTarget.style.transform = "scale(1.03)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = "#f093e5";
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              📩 Postuler maintenant
            </a>

            <button
              onClick={() => setSelectedJob(null)}
              style={{
                marginTop: "20px",
                padding: "8px 12px",
                background: "#111827",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              ← Retour
            </button>
          </div>
        )}

      </main>

      {/* FOOTER BAR */}
      
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          width: "100%",
          background: "linear-gradient(90deg,#111827,#1f2937)",
          borderTop: "2px solid #374151",
          padding: "12px 20px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "20px",
          zIndex: 1000,
          boxShadow: "0 -4px 15px rgba(0,0,0,0.25)",
          flexWrap: "wrap",
        }}
      >

        <button
          onClick={() => setSelectedJob(null)}
          style={{
            background: "transparent",
            border: "none",
            color: "white",
            fontWeight: "bold",
            cursor: "pointer",
            fontSize: "15px",
          }}
        >
          🏠 Accueil
        </button>

        <div style={{ position: "relative" }}>
          <button
            onClick={() =>
              setShowLanguages(!showLanguages)
            }
            style={{
              background: "transparent",
              border: "none",
              color: "white",
              fontWeight: "bold",
              cursor: "pointer",
              fontSize: "18px",
              transition: "0.2s",
            }}
          >
            🌍 Traduction
          </button>

          {showLanguages && (
            <div
              style={{
                position: "absolute",
                bottom: "45px",
                left: "0",
                background: "#1f2937",
                border: "1px solid #374151",
                borderRadius: "12px",
                padding: "10px",
                minWidth: "140px",
                boxShadow:
                  "0 10px 25px rgba(0,0,0,0.35)",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                animation: "fadeIn 0.2s ease",
              }}
            >
              <button
                onClick={() => {
                  setLanguage("fr");
                  setShowLanguages(false);
                }}
                style={languageButtonStyle}
              >
                🇫🇷 Français
              </button>

              <button
                onClick={() => {
                  setLanguage("en");
                  setShowLanguages(false);
                }}
                style={languageButtonStyle}
              >
                🇺🇸 English
              </button>

              <button
                onClick={() => {
                  setLanguage("de");
                  setShowLanguages(false);
                }}
                style={languageButtonStyle}
              >
                🇩🇪 Deutsch
              </button>

            </div>
          )}
        </div>

        <button
          style={{
            background: "transparent",
            border: "none",
            color: "white",
            fontWeight: "bold",
            cursor: "pointer",
            fontSize: "15px",
          }}
        >
          ⚙️ Paramètres
        </button>

        <button
          style={{
            background: "transparent",
            border: "none",
            color: "white",
            fontWeight: "bold",
            cursor: "pointer",
            fontSize: "15px",
          }}
        >
          ⭐ Favoris
        </button>

        <button
          style={{
            background: "transparent",
            border: "none",
            color: "white",
            fontWeight: "bold",
            cursor: "pointer",
            fontSize: "15px",
          }}
        >
          🌙 Mode nuit
        </button>

      </div>

    </div>
  );
}