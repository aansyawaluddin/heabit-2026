import Image from "next/image";
import { SectionTitle } from "./SectionTitle";

const PHOTOS = [
  { src: "/img/g-start.webp", alt: "Ratusan pelari bersiap di garis start", cls: "col-span-2 md:row-span-2" },
  { src: "/img/g-crowd.webp", alt: "Komunitas lari berkumpul di depan Heavan", cls: "" },
  { src: "/img/g-bw.webp", alt: "Momen start dalam hitam putih", cls: "" },
  { src: "/img/g-street.webp", alt: "Peserta memadati jalan menuju garis start", cls: "" },
  { src: "/img/g-bw2.webp", alt: "Pelari melintas di jalan kota", cls: "" },
];

export function Gallery() {
  return (
    <section id="galeri" className="scroll-mt-20 bg-white pb-20 lg:pb-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionTitle kicker="Galeri" title="Cerita dari Heavan Run sebelumnya" />
        <div className="mt-10 grid auto-rows-[180px] grid-cols-2 gap-3 sm:auto-rows-[220px] md:grid-cols-4">
          {PHOTOS.map((p) => (
            <div key={p.src} className={`group relative overflow-hidden rounded-2xl ${p.cls}`}>
              <Image src={p.src} alt={p.alt} fill sizes="(min-width:768px) 50vw, 50vw" className="object-cover transition duration-500 group-hover:scale-105" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
