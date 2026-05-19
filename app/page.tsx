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
  };
  const selectedCountry = countryNames[country];

  useEffect(() => {
    async function fetchJobs() {
      try {

        // ===== ADZUNA =====
        
        const adzunaRes = await fetch(
          `https://api.adzuna.com/v1/api/jobs/${country}/search/1?app_id=25d89677&app_key=a843aa88f5a5063987513015419abb72&what=drone`
        );

        const adzunaData = await adzunaRes.json();

        const adzunaJobs = (adzunaData.results || []).map((job: any) => ({
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
          `https://jsearch.p.rapidapi.com/search?query=drone jobs in ${selectedCountry}&num_pages=1`,
          {
            method: "GET",
            headers: {
              "X-RapidAPI-Key": process.env.NEXT_PUBLIC_RAPIDAPI_KEY || "",

              "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
            },
          }
        );
                        
        const jsearchData = await jsearchRes.json();
                 
        const jsearchJobs = (jsearchData.data || []).map((job: any) => ({
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
        
          
        // ===== FUSION (IMPORTANT) =====
        setJobs([...adzunaJobs, ...jsearchJobs]);
    
      } catch (error) {
        console.log("Erreur API", error);
      }
    }

    fetchJobs();
  }, [country]);
    
    
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
            </select>
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