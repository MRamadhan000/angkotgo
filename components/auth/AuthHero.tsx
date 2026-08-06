import { FaBus, FaClock } from "react-icons/fa";

export default function AuthHero() {
  return (
    <section className="relative hidden h-full overflow-hidden lg:flex">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500" />

      {/* Decoration */}
      <div className="absolute -right-32 -top-32 h-80 w-80 rounded-full bg-white/10" />
      <div className="absolute -bottom-24 -left-24 h-60 w-60 rounded-full bg-black/10" />

      <div className="relative z-10 flex h-full w-full flex-col justify-between p-12 xl:p-16 text-white">
        {/* Content */}
        <div className="my-auto max-w-xl">
          <h2 className="text-4xl font-extrabold leading-tight tracking-tight xl:text-5xl">
            Pantau Angkot
            <br />
            Secara
            <span className="text-cyan-200"> Real-Time</span>
          </h2>

          <p className="mt-6 text-base leading-relaxed text-blue-100 opacity-95 xl:text-lg">
            Membantu mahasiswa dan masyarakat mengetahui posisi angkot,
            estimasi kedatangan, serta kapasitas kursi secara langsung.
          </p>

          <div className="mt-10 space-y-4">
            <FeatureCard
              icon={<FaBus />}
              title="Tracking Armada"
              description="Lihat posisi angkot yang sedang beroperasi secara langsung di peta."
            />

            <FeatureCard
              icon={<FaClock />}
              title="Jadwal Dinamis"
              description="Informasi estimasi waktu tiba jauh lebih akurat berdasarkan kondisi lapangan."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between border-t border-white/10 pt-4 text-xs text-blue-200/60">
          <p>© 2026 AngkotGo App</p>
          <p>v2.4.0</p>
        </div>
      </div>
    </section>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({
  icon,
  title,
  description,
}: FeatureCardProps) {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-md">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-lg">
        {icon}
      </div>

      <div>
        <h3 className="text-base font-bold xl:text-lg">
          {title}
        </h3>

        <p className="mt-1 text-xs text-blue-100 opacity-90 xl:text-sm">
          {description}
        </p>
      </div>
    </div>
  );
}