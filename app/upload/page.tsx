"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

const CLOUDINARY_CLOUD_NAME = "bpmzkfun";
const CLOUDINARY_UPLOAD_PRESET = "svatebni_fotky_unsigned";

const MAX_FILE_SIZE_MB = 250;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

type CloudinaryResponse = {
  secure_url?: string;
  public_id?: string;
  resource_type?: string;
  error?: {
    message?: string;
  };
};

export default function UploadPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  const [uploadedCount, setUploadedCount] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/count")
      .then((res) => res.json())
      .then((data) => setUploadedCount(data.count))
      .catch(() => setUploadedCount(null));
  }, [isSuccess]);

  const previews = useMemo(() => {
    return files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
  }, [files]);

  useEffect(() => {
    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [previews]);

  const totalSizeMb = useMemo(() => {
    const total = files.reduce((sum, file) => sum + file.size, 0);
    return (total / 1024 / 1024).toFixed(1);
  }, [files]);

  function uploadFileDirectlyToCloudinary(
    file: File,
    onProgress: (percent: number) => void
  ) {
    return new Promise<CloudinaryResponse>((resolve, reject) => {
      const resourceType = file.type.startsWith("video") ? "video" : "image";

      const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`;

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

      const xhr = new XMLHttpRequest();

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress(percent);
        }
      };

      xhr.onload = () => {
        let data: CloudinaryResponse;

        try {
          data = JSON.parse(xhr.responseText);
        } catch {
          reject(new Error("Cloudinary nevrátilo platnou odpověď."));
          return;
        }

        if (xhr.status < 200 || xhr.status >= 300) {
          reject(
            new Error(
              data.error?.message ||
                "Nahrávání se nepovedlo. Zkontrolujte upload preset."
            )
          );
          return;
        }

        resolve(data);
      };

      xhr.onerror = () => {
        reject(new Error("Nepodařilo se připojit ke Cloudinary."));
      };

      xhr.open("POST", url);
      xhr.send(formData);
    });
  }

  async function handleUpload() {
    if (files.length === 0 || isUploading) return;

    setIsUploading(true);
    setStatus("");
    setUploadProgress(0);

    try {
      let uploaded = 0;

      for (let i = 0; i < files.length; i++) {
        await uploadFileDirectlyToCloudinary(files[i], (fileProgress) => {
          const totalProgress = Math.round(
            ((uploaded + fileProgress / 100) / files.length) * 100
          );

          setUploadProgress(totalProgress);
        });

        uploaded++;
        setUploadProgress(Math.round((uploaded / files.length) * 100));
      }

      setFiles([]);
      setStatus("");
      setIsSuccess(true);
    } catch (error) {
      setStatus(
        error instanceof Error
          ? `Chyba: ${error.message}`
          : "Něco se nepovedlo."
      );
    } finally {
      setIsUploading(false);
    }
  }

  function removeFile(indexToRemove: number) {
    setFiles((currentFiles) =>
      currentFiles.filter((_, index) => index !== indexToRemove)
    );
    setStatus("");
  }

  function uploadMore() {
    setIsSuccess(false);
    setStatus("");
    setFiles([]);
    setUploadProgress(0);
  }

  if (isSuccess) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-[#14263a] via-[#1b3149] to-[#eaf6ff] px-6 py-10 text-[#10151c] [font-family:Lovelyn,serif]">
        <section className="mx-auto flex min-h-screen max-w-md flex-col justify-center">
          <div className="animate-[fadeIn_0.7s_ease-out] rounded-[2.5rem] border border-[#d7b46d]/50 bg-white/95 p-8 text-center shadow-[0_25px_80px_rgba(120,190,245,0.35)] backdrop-blur">
            <div className="mx-auto mb-6 h-36 w-36 overflow-hidden rounded-full bg-white shadow-[0_0_45px_rgba(143,196,242,0.55)]">
              <Image
                src="/logo.png"
                alt="Zuzana a František"
                width={180}
                height={180}
                className="h-full w-full object-contain"
              />
            </div>

            <div className="mb-6 text-4xl animate-[softPulse_1.8s_ease-in-out_infinite]">
              🖤💙
            </div>

            <p className="mb-4 text-base font-semibold leading-7">
              Děkujeme, že jste součástí našeho dne.
            </p>

            <p className="mb-4 text-sm leading-7 text-[#52616f]">
              Vaše fotografie byly úspěšně nahrány.
            </p>

            <p className="mb-8 text-sm leading-7 text-[#52616f]">
              Budeme se těšit na všechny vzpomínky, které díky vám znovu
              prožijeme.
            </p>

            <div className="mb-8 text-2xl">🖤💙</div>

            <p className="mb-8 text-3xl text-[#10151c] [font-family:Allura,cursive]">
              Zuzana & František
            </p>

            <button
              onClick={uploadMore}
              className="w-full rounded-full bg-gradient-to-r from-[#9fd3ff] to-[#77b9ef] px-6 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-[#10151c] shadow-[0_14px_40px_rgba(143,196,242,0.45)] transition hover:scale-[1.02]"
            >
              📷 Nahrát další fotografie
            </button>
          </div>
        </section>

        <GlobalStyles />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#14263a] via-[#203a55] to-[#eaf6ff] px-6 py-10 text-white [font-family:Lovelyn,serif]">
      <section className="mx-auto flex min-h-screen max-w-md flex-col justify-center">
        <div className="animate-[fadeIn_0.7s_ease-out] rounded-[2.5rem] border border-[#d7b46d]/45 bg-[#f8fcff]/95 p-8 text-center text-[#10151c] shadow-[0_25px_90px_rgba(130,200,255,0.38)] backdrop-blur">
          <div className="mx-auto mb-6 h-40 w-40 overflow-hidden rounded-full bg-white shadow-[0_0_50px_rgba(143,196,242,0.65)] animate-[floatLogo_5s_ease-in-out_infinite]">
            <Image
              src="/logo.png"
              alt="Zuzana a František"
              width={200}
              height={200}
              className="h-full w-full object-contain"
            />
          </div>

          <div className="mb-3 text-sm uppercase tracking-[0.28em] text-[#d7b46d]">
            Zuzana & František
          </div>

          <h1 className="mb-5 text-6xl leading-[0.95] text-[#10151c] [font-family:Allura,cursive]">
            Pomozte nám uchovat tento den
          </h1>

          <p className="mb-7 text-sm leading-7 text-[#42505f]">
            Nahrajte fotografie nebo videa ze svatby. Díky vám se budeme moct
            k těmto vzpomínkám vracet znovu a znovu.
          </p>

          <div className="mb-7 rounded-[1.7rem] border border-[#8fc4f2]/70 bg-[#eaf6ff] p-5 shadow-inner">
            <p className="text-xs uppercase tracking-[0.22em] text-[#b08b43]">
              Už jste nám poslali
            </p>

            <p className="mt-2 text-4xl font-semibold text-[#5aaeea]">
              {uploadedCount === null ? "…" : uploadedCount}
            </p>

            <p className="text-sm text-[#52616f]">fotografií a videí</p>
          </div>

          <label className="mb-5 block cursor-pointer rounded-[1.7rem] border border-dashed border-[#8fc4f2] bg-[#f2f9ff] p-8 transition hover:bg-[#e3f3ff] hover:shadow-[0_0_35px_rgba(143,196,242,0.35)]">
            <span className="block text-4xl">📷</span>
            <span className="mt-3 block font-semibold text-[#10151c]">
              Vybrat soubory
            </span>
            <span className="mt-1 block text-sm text-[#52616f]">
              fotky i videa
            </span>

            <input
              type="file"
              multiple
              accept="image/*,video/*"
              className="hidden"
              onChange={(event) => {
                const selected = Array.from(event.target.files ?? []);

                const allowedFiles = selected.filter(
                  (file) => file.size <= MAX_FILE_SIZE_BYTES
                );

                const rejectedFiles = selected.filter(
                  (file) => file.size > MAX_FILE_SIZE_BYTES
                );

                setFiles((currentFiles) => [...currentFiles, ...allowedFiles]);
                setUploadProgress(0);

                if (rejectedFiles.length > 0) {
                  setStatus(
                    `Některé soubory jsou moc velké. Maximální velikost jednoho souboru je ${MAX_FILE_SIZE_MB} MB.`
                  );
                } else {
                  setStatus("");
                }

                event.target.value = "";
              }}
            />
          </label>

          {files.length > 0 && (
            <div className="mb-6">
              <p className="mb-3 text-left text-sm font-semibold text-[#10151c]">
                Vybrané soubory ({files.length}) • {totalSizeMb} MB
              </p>

              <div className="grid grid-cols-3 gap-3">
                {previews.map(({ file, url }, index) => (
                  <div
                    key={`${file.name}-${index}`}
                    className="relative overflow-hidden rounded-2xl border border-[#8fc4f2]/50 bg-white shadow-sm"
                  >
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="absolute right-1 top-1 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-[#14263a]/85 text-xs text-white"
                    >
                      ×
                    </button>

                    {file.type.startsWith("image") ? (
                      <img
                        src={url}
                        alt={file.name}
                        className="h-28 w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-28 items-center justify-center bg-[#eaf6ff] text-4xl">
                        🎥
                      </div>
                    )}

                    <div className="truncate p-2 text-center text-[11px] text-[#52616f]">
                      {file.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isUploading && (
            <div className="mb-5 rounded-2xl bg-[#eaf6ff] p-4 text-center">
              <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.18em] text-[#3f94cf]">
                <span>Nahráváme</span>
                <span>{uploadProgress} %</span>
              </div>

              <div className="mx-auto mb-3 h-3 w-full overflow-hidden rounded-full bg-[#cde8fb]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#70b7ee] to-[#9fd3ff] transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>

              <p className="text-sm font-semibold text-[#10151c]">
                Nahráváme vaše vzpomínky…
              </p>
              <p className="mt-1 text-xs text-[#52616f]">
                Prosíme, nezavírejte stránku.
              </p>
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={files.length === 0 || isUploading}
            className="w-full rounded-full bg-gradient-to-r from-[#9fd3ff] to-[#70b7ee] px-6 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-[#10151c] shadow-[0_14px_40px_rgba(143,196,242,0.48)] transition hover:scale-[1.02] hover:from-[#bde3ff] hover:to-[#8fc4f2] disabled:cursor-not-allowed disabled:from-[#d6d6d6] disabled:to-[#c7c7c7] disabled:text-[#777]"
          >
            {isUploading ? "Probíhá nahrávání…" : "Nahrát soubory"}
          </button>

          {status && (
            <p className="mt-5 text-sm font-semibold text-[#3f94cf]">
              {status}
            </p>
          )}
        </div>
      </section>

      <GlobalStyles />
    </main>
  );
}

function GlobalStyles() {
  return (
    <style jsx global>{`
      @import url("https://fonts.googleapis.com/css2?family=Allura&display=swap");

      @font-face {
        font-family: "Lovelyn";
        src: url("/fonts/Lovelyn%20Free%20Personal%20Use.ttf")
          format("truetype");
        font-weight: normal;
        font-style: normal;
        font-display: swap;
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(18px) scale(0.98);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      @keyframes softPulse {
        0%,
        100% {
          transform: scale(1);
          opacity: 0.85;
        }
        50% {
          transform: scale(1.08);
          opacity: 1;
        }
      }

      @keyframes floatLogo {
        0%,
        100% {
          transform: translateY(0);
        }
        50% {
          transform: translateY(-6px);
        }
      }
    `}</style>
  );
}