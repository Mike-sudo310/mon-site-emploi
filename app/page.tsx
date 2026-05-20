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
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const [jobs, setJobs] = useState<Job[]>([]);
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
  };
  const selectedCountry = countryNames[country];

  const isFrancophone =
     selectedCountry === "Francophone";

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

    France: [
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

    Canada: [
      "canada",
      "montreal",
      "quebec",
      "québec",
      "toronto",
      "vancouver",
      "ottawa",
    ],

    Germany: [
      "germany",
      "deutschland",
      "berlin",
      "munich",
      "hamburg",
      "frankfurt",
      "de",
    ],

    Switzerland: [
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

    Belgium: [
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

    Luxembourg: [
      "luxembourg",
      "lu",
    ],

    Monaco: [
      "monaco",
      "mc",
    ],

    Francophone: [
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
      `${title || ""} ${description || ""}`.toLowerCase();

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

    // ===== AUTRES PAYS =====

    const text = normalizeText(location);

    const keywords =
      countryKeywords[selectedCountry] || [];
    
    return keywords.some((keyword: string) =>
      text.includes(normalizeText(keyword))
    );
  };
  
    async function fetchJobs() {
      setLoading(true);
      try {

        // ===== ADZUNA =====
        
        const adzunaRes = await fetch(
          `https://api.adzuna.com/v1/api/jobs/${isFrancophone ? "fr" : country}/search/1?app_id=25d89677&app_key=a843aa88f5a5063987513015419abb72&what=drone`
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
            isFrancophone
              ? "drone OR UAV OR telepilot OR photogrammetry french jobs"
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
              location: isFrancophone
                ? "France"
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

          
        // ===== FUSION (IMPORTANT) =====
        const allJobs = [
          ...adzunaJobs,
          ...jsearchJobs,
          ...arbeitnowJobs,
          ...joobleJobs,
        ];

        const strictCountries = [
          "France",
          "Canada",
          "Belgium",
          "Switzerland",
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

        if (isFrancophone) {

          const filteredFrancophoneJobs =
            uniqueJobs.filter((job) => {

              const location =
                normalizeText(
                  job.location?.display_name || ""
                );

              const isDuplicateCountry =
                strictCountries.some((countryName) => {

                  const keywords =
                    countryKeywords[countryName] || [];
                  
                  return keywords.some((keyword: string) =>
                    location.includes(
                      normalizeText(keyword)
                    )
                  );
                });
              return !isDuplicateCountry;
              });
            setJobs(filteredFrancophoneJobs);
          } else {
            setJobs(uniqueJobs);
          }

      setLoading(false);
       
      } catch (error) {
        console.log("Erreur API", error);
        setLoading(false);
      }
    }

  
    
    
  const filteredJobs = jobs.filter((job: Job) =>
    job.title?.toLowerCase().includes(search.toLowerCase()) ||
    job.company?.display_name?.toLowerCase().includes(search.toLowerCase()) ||
    job.location?.display_name?.toLowerCase().includes(search.toLowerCase())
  );

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
            width={45}
            height={45}
            style={{ borderRadius: "10px" }}
          />

          <h1 style={{ margin: 2, fontSize: "35px", fontWeight: "bold" }}>
            🚀 Drone & Tech Jobs
          </h1>
        </div>
        
        {/* BADGE */}
        <div
          style={{
            background: "#2563eb",
            padding: "6px 12px",
            borderRadius: "20px",
            fontSize: "12px",
          }}
        >
          LIVE JOBS 🚀
        </div>
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

      <main style={{ maxWidth: "900px", margin: "0 auto", padding: "30px" }}>

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
              {loading ? "Recherche en cours..." : "🔍 Rechercher"}
            </button>

            <input
              type="text"
              placeholder="Rechercher un emploi..."
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
              {filteredJobs.length} offres trouvées
            </p>

            <div style={{ display: "grid", gap: "15px" }}>
              {filteredJobs.map((job: Job) => (
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
                  <h3>{job.title}</h3>
                  <p>🏢 {job.company?.display_name}</p>
                  <p>📍 {job.location?.display_name}</p>

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
              {selectedJob.description}
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
    </div>
  );
}